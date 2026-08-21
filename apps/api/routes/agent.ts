import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { conversations, messages, organizations, end_users, users, knowledge_chunks } from '@ai-workforce/db/schema';
import { eq, desc, and, ilike, or, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbeddings, generateText } from '@ai-workforce/llm';

export default async function agentRoutes(fastify: FastifyInstance) {

  fastify.get('/agents', async (req, reply) => {
    // Return all system users that can be assigned conversations
    const allUsers = await db.select().from(users).limit(50);
    return { success: true, agents: allUsers };
  });

  fastify.get('/widget-config', async (req, reply) => {
    const org_id = (req as any).user?.org_id || req.headers["x-org-id"];
    const [org] = await db.select().from(organizations).where(eq(organizations.id, org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Org not found' });
    const settings: any = org.settings || {};
    return { success: true, config: settings.widgetConfig || {} };
  });

  fastify.post('/widget-config', async (req, reply) => {
    const org_id = (req as any).user?.org_id || req.headers["x-org-id"];
    const body = req.body as any;
    
    const [org] = await db.select().from(organizations).where(eq(organizations.id, org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Org not found' });

    const settings: any = org.settings || {};
    settings.widgetConfig = { ...settings.widgetConfig, ...body };

    await db.update(organizations).set({ settings }).where(eq(organizations.id, org_id));
    return { success: true, config: settings.widgetConfig };
  });

  // GET /agent/conversations — list all org conversations, partitioned by assignment
  fastify.get('/conversations', async (req, reply) => {
    const org_id = (req as any).user?.org_id || (req.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { search } = req.query as { search?: string };

    let orgConversations = await db
      .select({
        conversation: conversations,
        end_user: end_users
      })
      .from(conversations)
      .leftJoin(end_users, eq(conversations.visitor_id, sql<string>`${end_users.id}::text`))
      .where(eq(conversations.org_id, org_id))
      .orderBy(desc(conversations.updated_at));

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      orgConversations = orgConversations.filter(row => {
        return (row.end_user?.name?.toLowerCase().includes(q)) ||
               (row.end_user?.email?.toLowerCase().includes(q)) ||
               (row.end_user?.external_id?.toLowerCase().includes(q)) ||
               (row.conversation.id.toLowerCase().includes(q));
      });
    }

    const unassigned = orgConversations.filter(r => !r.conversation.assigned_to).map(r => ({ ...r.conversation, end_user: r.end_user }));
    const assigned = orgConversations.filter(r => !!r.conversation.assigned_to).map(r => ({ ...r.conversation, end_user: r.end_user }));
    const all = orgConversations.map(r => ({ ...r.conversation, end_user: r.end_user }));

    return { all, unassigned, assigned };
  });

  // GET /agent/conversations/:id — fetch conversation + messages
  fastify.get('/conversations/:id', async (req, reply) => {
    const org_id = (req as any).user?.org_id || (req.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = req.params as { id: string };

    const [row] = await db
      .select({
        conversation: conversations,
        end_user: end_users
      })
      .from(conversations)
      .leftJoin(end_users, eq(conversations.visitor_id, sql<string>`${end_users.id}::text`))
      .where(and(eq(conversations.id, id), eq(conversations.org_id, org_id)))
      .limit(1);

    if (!row) {
      return reply.status(404).send({ error: 'Conversation not found' });
    }

    const convMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, id))
      .orderBy(messages.created_at);

    return { ...row.conversation, end_user: row.end_user, messages: convMessages };
  });

  // PATCH /agent/conversations/:id — update status, ai_paused, assigned_to
  fastify.patch('/conversations/:id', async (req, reply) => {
    const org_id = (req as any).user?.org_id || (req.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = req.params as { id: string };
    const { status, ai_paused, assigned_to } = req.body as any;

    const updateData: any = { updated_at: new Date() };
    if (status !== undefined) updateData.status = status;
    if (ai_paused !== undefined) updateData.ai_paused = ai_paused;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

    const [updated] = await db.update(conversations)
      .set(updateData)
      .where(and(eq(conversations.id, id), eq(conversations.org_id, org_id)))
      .returning();

    return { success: true, conversation: updated };
  });

  // POST /agent/conversations/:id/assign — assign to human agent, pause AI
  fastify.post('/conversations/:id/assign', async (req, reply) => {
    const org_id = (req as any).user?.org_id || (req.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = req.params as { id: string };
    const { agent_id } = req.body as { agent_id: string };

    const [updated] = await db.update(conversations)
      .set({ assigned_to: agent_id, ai_paused: true, updated_at: new Date() })
      .where(and(eq(conversations.id, id), eq(conversations.org_id, org_id)))
      .returning();

    return { success: true, conversation: updated };
  });

  // POST /agent/conversations/:id/reply — agent sends a message
  fastify.post('/conversations/:id/reply', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { content } = req.body as { content: string };

    const [newMessage] = await db.insert(messages)
      .values({
        id: uuidv4(),
        conversation_id: id,
        role: 'agent',
        content,
      })
      .returning();

    await db.update(conversations)
  });


  // POST /agent/conversations/:id/copilot — AI-generated reply suggestion (RAG)
  fastify.post('/conversations/:id/copilot', async (req, reply) => {
    const { id } = req.params as { id: string };

    // Fetch recent messages for context
    const recentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, id))
      .orderBy(desc(messages.created_at))
      .limit(10);

    const history = recentMessages.reverse();
    if (history.length === 0) {
      return { success: true, suggestion: "Hello! How can I help you today?" };
    }

    const lastUserMessage = [...history].reverse().find(m => m.role === 'user')?.content || '';
    
    let contextStr = "";
    try {
      if (lastUserMessage.trim()) {
        const queryVector = await generateEmbeddings([lastUserMessage]);
        const vectorStr = JSON.stringify(queryVector[0]);

        const topKnowledge = await db
          .select({
            content: knowledge_chunks.content,
            distance: sql`(${knowledge_chunks.embedding} <=> ${vectorStr}::vector)`.mapWith(Number)
          })
          .from(knowledge_chunks)
          .orderBy(sql`(${knowledge_chunks.embedding} <=> ${vectorStr}::vector)`)
          .limit(3);

        if (topKnowledge.length > 0) {
          contextStr = topKnowledge.map(k => `- ${k.content}`).join("\n\n");
        }
      }
    } catch (err) {
      console.warn("Knowledge retrieval failed (possibly no API key or empty vector DB), falling back to baseline.", err);
    }

    const systemPrompt = `You are a helpful customer support AI agent.
Your goal is to provide accurate, polite, and helpful responses to the customer.

${contextStr ? `Here is some relevant knowledge from our database:\n${contextStr}\n\nUse this knowledge to answer the user's questions accurately if it applies.` : `You do not have any specific company knowledge at this moment. Do your best to be helpful or ask for clarification.`}

Respond directly as the agent. Do not include quotes or prefixes like "Agent:" in your response. Keep it concise.`;

    const formattedHistory = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const userPrompt = `Conversation History:\n${formattedHistory}\n\nPlease generate the next AGENT response.`;

    try {
      const response = await generateText('fast', systemPrompt, userPrompt);
      return {
        success: true,
        suggestion: response.content
      };
    } catch (error: any) {
      console.error("LLM Generation failed:", error);
      return {
        success: true,
        suggestion: `I encountered an error connecting to the AI service: ${error.message}`
      };
    }
  });
}
