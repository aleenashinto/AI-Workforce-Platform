import { FastifyInstance } from "fastify";
import { db, withTenant } from "@ai-workforce/db";
import { conversations, messages } from "@ai-workforce/db/schema";
import { eq, and } from "drizzle-orm";
import {
  streamText,
  checkInputGuardrails,
} from "@ai-workforce/llm";
import { hybridSearchWithRRF } from "@ai-workforce/core/src/rag";
import { checkBillingQuota } from "../middleware/billing";
import { v4 as uuidv4 } from "uuid";

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/v1/chat",
    { preHandler: [checkBillingQuota] },
    async (request, reply) => {
      const { org_id, visitor_id, query, conversation_id } = request.body as any;

      if (!query || !conversation_id || !org_id) {
        return reply
          .status(400)
          .send({ error: "query, org_id, and conversation_id are required" });
      }

      // Input Guardrails
      const inputCheck = await checkInputGuardrails(query);
      if (!inputCheck.safe) {
        return reply.status(400).send({ error: inputCheck.reason });
      }

      // We explicitly wrap the chat route in withTenant since it's a public endpoint
      // and doesn't pass through the standard JWT middleware that sets app.current_org_id
      return withTenant(db, org_id, async () => {
        // Check if conversation is paused
        const [conversation] = await db
          .select({ ai_paused: conversations.ai_paused })
          .from(conversations)
          .where(and(eq(conversations.id, conversation_id), eq(conversations.org_id, org_id)))
          .limit(1);

        if (conversation && conversation.ai_paused) {
          return reply.status(403).send({
            error: "Conversation is currently paused for human takeover",
          });
        }

        // Save user message
        await db.insert(messages).values({
          id: uuidv4(),
          conversation_id: conversation_id,
          role: "user",
          content: query,
        });

        // Execute Advanced Retrieval Pipeline (Vector + FTS + RRF + Rerank)
        const finalResults = await hybridSearchWithRRF(org_id, query, 6);

        const context =
          finalResults.length > 0
            ? finalResults.map((r, i) => `[${i + 1}] ${r.content}`).join("\n\n")
            : "[1] Dummy context for testing since DB might be empty.";

        const systemPrompt = `You are a helpful support agent. Answer ONLY from the provided context. Cite everything using [1], [2] etc. If you cannot answer, say "I cannot answer this based on the context."
      Context:
      ${context}
      `;

        const isUnanswerable = finalResults.length === 0;
        
        let confidence = 0;
        if (isUnanswerable) {
          confidence = 0.3; // Low confidence threshold
        } else {
          // Spec: Base confidence is derived from the top K retrieved relevance scores
          // Averaged out, with penalties for large divergence
          const topScores = finalResults.map(r => r.relevance_score || 0.5);
          const avgScore = topScores.reduce((a, b) => a + b, 0) / topScores.length;
          const maxScore = Math.max(...topScores);
          
          // Weighted metric giving higher importance to the absolute best match
          confidence = (maxScore * 0.7) + (avgScore * 0.3);

          // Cap confidence between 0 and 1
          confidence = Math.min(Math.max(confidence, 0), 1.0);
        }

        let fullAnswer = "";

        // Escalation Routing
        if (confidence < 0.7) {
          await db
            .update(conversations)
            .set({ ai_paused: true })
            .where(and(eq(conversations.id, conversation_id), eq(conversations.org_id, org_id)));

          try {
            const { ZendeskSupportProvider } = require("@ai-workforce/core/src/providers/support-provider");
            const support = new ZendeskSupportProvider();

            const ticketId = await support.createTicket({
              subject: "AI Escalation: Low Confidence",
              description: `Conversation ID: ${conversation_id}\n\nThe AI was unable to answer the user's query confidently.\n\nQuery: ${query}`,
              priority: "high",
            });

            fullAnswer =
              "I'm not completely sure about that. I have paused this conversation and escalated it to our human support team (Ticket: " +
              ticketId +
              "). They will be with you shortly.";
          } catch (err) {
            fullAnswer =
              "I'm not completely sure about that. I have paused this conversation and escalated it to our human support team.";
          }

          return reply.send({ message: fullAnswer, confidence, escalated: true });
        }

        // Send SSE response
        reply.raw.setHeader("Content-Type", "text/event-stream");
        reply.raw.setHeader("Cache-Control", "no-cache");
        reply.raw.setHeader("Connection", "keep-alive");

        if (confidence >= 0.7) {
          if (
            process.env.ANTHROPIC_API_KEY &&
            process.env.ANTHROPIC_API_KEY !== "dummy"
          ) {
            try {
              const stream = await streamText("fast", systemPrompt, query);
              for await (const chunk of stream) {
                if (
                  chunk.type === "content_block_delta" &&
                  chunk.delta.type === "text_delta"
                ) {
                  reply.raw.write(
                    `data: ${JSON.stringify({ token: chunk.delta.text })}\n\n`,
                  );
                }
              }
            } catch (err) {
              console.error("LLM streaming failed", err);
              reply.raw.write(
                `data: ${JSON.stringify({ error: "Generation failed" })}\n\n`,
              );
            }
          } else {
            // Mock stream if no API key
            const mockTokens = "I can see from the context that the policy states X.".split(" ");
            for (const token of mockTokens) {
              reply.raw.write(`data: ${JSON.stringify({ token: token + " " })}\n\n`);
              await new Promise((r) => setTimeout(r, 50));
            }
          }
        }

        reply.raw.end();
      });
    }
  );

  fastify.post(
    "/v1/chat/test",
    { preHandler: [checkBillingQuota] },
    async (request, reply) => {
      const { org_id, query } = request.body as any;

      if (!query || !org_id) {
        return reply
          .status(400)
          .send({ error: "Query and org_id are required" });
      }

      // Input Guardrails
      const inputCheck = await checkInputGuardrails(query);
      if (!inputCheck.safe) {
        return reply.status(400).send({ error: inputCheck.reason });
      }

      return withTenant(db, org_id, async () => {
        const finalResults = await hybridSearchWithRRF(org_id, query, 6);
        return reply.send({ success: true, results: finalResults });
      });
    }
  );
}
