import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import { conversations, messages, end_users } from "@ai-workforce/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default async function webhookRoutes(fastify: FastifyInstance) {
  // POST /v1/webhooks/whatsapp
  fastify.post("/v1/webhooks/whatsapp", async (req, reply) => {
    // In production, verify Meta signature here
    const { org_id, from, text } = req.body as any;

    if (!org_id || !from || !text) {
      return reply.status(400).send({ error: "Missing parameters" });
    }

    // 1. Find or create end_user
    let user = await db.query.end_users.findFirst({
      where: and(eq(end_users.org_id, org_id), eq(end_users.external_id, from)),
    });

    if (!user) {
      const [newUser] = await db
        .insert(end_users)
        .values({
          id: uuidv4(),
          org_id,
          external_id: from,
        })
        .returning();
      user = newUser;
    }

    // 2. Find active conversation or create new
    let conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.org_id, org_id),
        eq(conversations.visitor_id, user.id),
        eq(conversations.status, "active"),
        eq(conversations.channel, "whatsapp"),
      ),
    });

    if (!conversation) {
      const [newConv] = await db
        .insert(conversations)
        .values({
          id: uuidv4(),
          org_id,
          visitor_id: user.id,
          channel: "whatsapp",
        })
        .returning();
      conversation = newConv;
    }

    // 3. Save incoming message
    await db.insert(messages).values({
      id: uuidv4(),
      conversation_id: conversation.id,
      role: "user",
      content: text,
    });

    // 4. Trigger AI if not paused (mocking triggering the chat worker)
    if (!conversation.ai_paused) {
      // In production, we'd add this to a BullMQ queue to process asynchronously
      // e.g. await chatQueue.add('generate-reply', { conversation_id: conversation.id, query: text })
    }

    return reply
      .status(200)
      .send({ success: true, conversation_id: conversation.id });
  });

  // POST /v1/webhooks/email
  fastify.post("/v1/webhooks/email", async (req, reply) => {
    // Postmark/Resend inbound webhook structure
    const { org_id, From, TextBody, MessageID } = req.body as any;

    if (!org_id || !From || !TextBody) {
      return reply.status(400).send({ error: "Missing parameters" });
    }

    // 1. Find or create end_user
    let user = await db.query.end_users.findFirst({
      where: and(eq(end_users.org_id, org_id), eq(end_users.email, From)),
    });

    if (!user) {
      const [newUser] = await db
        .insert(end_users)
        .values({
          id: uuidv4(),
          org_id,
          email: From,
        })
        .returning();
      user = newUser;
    }

    // 2. Find active conversation or create new
    let conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.org_id, org_id),
        eq(conversations.visitor_id, user.id),
        eq(conversations.status, "active"),
        eq(conversations.channel, "email"),
      ),
    });

    if (!conversation) {
      const [newConv] = await db
        .insert(conversations)
        .values({
          id: uuidv4(),
          org_id,
          visitor_id: user.id,
          channel: "email",
        })
        .returning();
      conversation = newConv;
    }

    // 3. Save incoming message
    await db.insert(messages).values({
      id: uuidv4(),
      conversation_id: conversation.id,
      role: "user",
      content: TextBody,
      metadata: { MessageID },
    });

    // 4. Trigger AI if not paused
    if (!conversation.ai_paused) {
      // Queue AI response
    }

    return reply
      .status(200)
      .send({ success: true, conversation_id: conversation.id });
  });
}
