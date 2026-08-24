import { FastifyInstance } from "fastify";
import postgres from "postgres";
import { OpenAI } from "openai";
import {
  streamText,
  checkInputGuardrails,
  checkOutputGuardrails,
} from "@ai-workforce/llm";
import { checkBillingQuota } from "../middleware/billing";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function chatRoutes(fastify: FastifyInstance) {
  const sql = postgres(
    process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5435/ai_workforce",
  );

  fastify.post(
    "/v1/chat",
    { preHandler: [checkBillingQuota] },
    async (request, reply) => {
      const { org_id, visitor_id, query, conversation_id } =
        request.body as any;

      if (!query || !conversation_id) {
        return reply
          .status(400)
          .send({ error: "Query and conversation_id are required" });
      }

      // Input Guardrails
      const inputCheck = await checkInputGuardrails(query);
      if (!inputCheck.safe) {
        return reply.status(400).send({ error: inputCheck.reason });
      }

      // Check if conversation is paused
      const [conversation] =
        await sql`SELECT ai_paused FROM conversations WHERE id = ${conversation_id} AND org_id = ${org_id}`;
      if (conversation && conversation.ai_paused) {
        return reply
          .status(403)
          .send({
            error: "Conversation is currently paused for human takeover",
          });
      }

      // Save user message
      await sql`INSERT INTO messages (id, conversation_id, role, content) VALUES (gen_random_uuid(), ${conversation_id}, 'user', ${query})`;

      // Generate dummy embedding since we don't have a real key necessarily
      let queryEmbedding = new Array(3072).fill(0.01);

      if (
        process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY !== "dummy"
      ) {
        try {
          const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            dimensions: 1536,
          });
          queryEmbedding = response.data[0].embedding;
        } catch (err) {
          console.error("OpenAI Embedding failed, using dummy", err);
        }
      }

      // Hybrid Search (Vector + Full-Text)
      // In a real implementation, we'd use Reciprocal Rank Fusion on the two sets of results.
      // Here we provide the SQL structure for it.
      const searchResults = await sql`
      WITH vector_search AS (
        SELECT id, document_id, content,
               1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
               ROW_NUMBER() OVER (ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as rank
        FROM knowledge_chunks
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT 30
      ),
      keyword_search AS (
        SELECT id, document_id, content,
               ts_rank_cd(fts, plainto_tsquery('english', ${query})) as rank_score,
               ROW_NUMBER() OVER (ORDER BY ts_rank_cd(fts, plainto_tsquery('english', ${query})) DESC) as rank
        FROM knowledge_chunks
        WHERE fts @@ plainto_tsquery('english', ${query})
        LIMIT 30
      ),
      fused_results AS (
        SELECT
          COALESCE(v.id, k.id) as id,
          COALESCE(v.content, k.content) as content,
          COALESCE(1.0 / (60 + v.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) as rrf_score
        FROM vector_search v
        FULL OUTER JOIN keyword_search k ON v.id = k.id
        ORDER BY rrf_score DESC
        LIMIT 6
      )
      SELECT * FROM fused_results;
    `;

      // Dummy logic for testing when DB is empty
      const context =
        searchResults.length > 0
          ? searchResults.map((r, i) => `[${i + 1}] ${r.content}`).join("\n\n")
          : "[1] Dummy context for testing since DB might be empty.";

      const systemPrompt = `You are a helpful support agent. Answer ONLY from the provided context. Cite everything using [1], [2] etc. If you cannot answer, say "I cannot answer this based on the context."
    Context:
    ${context}
    `;

      // Confidence scoring mock
      const isUnanswerable = searchResults.length === 0;
      const confidence = isUnanswerable ? 0.3 : 0.85;

      let fullAnswer = "";
      let answer: string | undefined;

      // Escalation Routing
      if (confidence < 0.7) {
        await sql`UPDATE conversations SET ai_paused = true WHERE id = ${conversation_id} AND org_id = ${org_id}`;

        const {
          ZendeskSupportProvider,
        } = require("@ai-workforce/core/src/providers/support-provider");
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
        answer = fullAnswer;
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
              `data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`,
            );
          }
        } else {
          // Simulate streaming
          answer = isUnanswerable
            ? "I cannot answer this based on the context."
            : `Based on the documentation [1], here is the answer to your question regarding "${query}".`;

          const chunks = answer.split(" ");

          for (let i = 0; i < chunks.length; i++) {
            reply.raw.write(
              `data: ${JSON.stringify({ token: chunks[i] + " " })}\n\n`,
            );
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
      }

      const metadata = {
        citations: searchResults.map((r: any) => ({ chunk_id: r.id })),
      };

      // Save assistant message to database (simplified, grabbing full generated text from mock or stream)
      if (typeof answer !== "undefined") fullAnswer = answer;

      // Output Guardrails
      const outputCheck = await checkOutputGuardrails(
        fullAnswer,
        searchResults.map((r: any) => r.content),
      );
      if (!outputCheck.safe) {
        fullAnswer = "I'm sorry, I cannot provide that information.";
      }

      // For streams, you'd accumulate the chunks, but here we just use the unanswerable logic or dummy string
      await sql`INSERT INTO messages (id, conversation_id, role, content, metadata) VALUES (gen_random_uuid(), ${conversation_id}, 'assistant', ${fullAnswer}, ${metadata as any})`;

      reply.raw.write(
        `data: ${JSON.stringify({
          done: true,
          confidence,
          metadata,
        })}\n\n`,
      );

      reply.raw.end();
    },
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

      // Generate dummy embedding since we don't have a real key necessarily
      let queryEmbedding = new Array(3072).fill(0.01);

      if (
        process.env.OPENAI_API_KEY &&
        process.env.OPENAI_API_KEY !== "dummy"
      ) {
        try {
          const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            dimensions: 1536,
          });
          queryEmbedding = response.data[0].embedding;
        } catch (err) {
          console.error("OpenAI Embedding failed, using dummy", err);
        }
      }

      const searchResults = await sql`
      WITH vector_search AS (
        SELECT id, document_id, content,
               1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
               ROW_NUMBER() OVER (ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as rank
        FROM knowledge_chunks
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT 30
      ),
      keyword_search AS (
        SELECT id, document_id, content,
               ts_rank_cd(fts, plainto_tsquery('english', ${query})) as rank_score,
               ROW_NUMBER() OVER (ORDER BY ts_rank_cd(fts, plainto_tsquery('english', ${query})) DESC) as rank
        FROM knowledge_chunks
        WHERE fts @@ plainto_tsquery('english', ${query})
        LIMIT 30
      ),
      fused_results AS (
        SELECT
          COALESCE(v.id, k.id) as id,
          COALESCE(v.content, k.content) as content,
          COALESCE(1.0 / (60 + v.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) as rrf_score
        FROM vector_search v
        FULL OUTER JOIN keyword_search k ON v.id = k.id
        ORDER BY rrf_score DESC
        LIMIT 6
      )
      SELECT * FROM fused_results;
    `;

      const context =
        searchResults.length > 0
          ? searchResults.map((r, i) => `[${i + 1}] ${r.content}`).join("\n\n")
          : "[1] Dummy context for testing since DB might be empty.";

      const systemPrompt = `You are a helpful support agent. Answer ONLY from the provided context. Cite everything using [1], [2] etc. If you cannot answer, say "I cannot answer this based on the context."\nContext:\n${context}`;

      const isUnanswerable = searchResults.length === 0;
      const confidence = isUnanswerable ? 0.3 : 0.85;

      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");

      if (confidence < 0.7) {
        const fullAnswer =
          "I'm not completely sure about that. In a real conversation, I would escalate this to our human support team.";
        const chunks = fullAnswer.split(" ");
        for (let i = 0; i < chunks.length; i++) {
          reply.raw.write(
            `data: ${JSON.stringify({ token: chunks[i] + " " })}\n\n`,
          );
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } else {
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
              `data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`,
            );
          }
        } else {
          const answer = isUnanswerable
            ? "I cannot answer this based on the context."
            : `Based on the documentation [1], here is the answer to your question regarding "${query}".`;

          const chunks = answer.split(" ");
          for (let i = 0; i < chunks.length; i++) {
            reply.raw.write(
              `data: ${JSON.stringify({ token: chunks[i] + " " })}\n\n`,
            );
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
      }

      const metadata = {
        citations: searchResults.map((r: any) => ({ chunk_id: r.id })),
      };

      reply.raw.write(
        `data: ${JSON.stringify({
          done: true,
          confidence,
          metadata,
        })}\n\n`,
      );

      reply.raw.end();
    },
  );
}
