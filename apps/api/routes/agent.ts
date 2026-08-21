import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { conversations, messages, organizations, end_users } from '@ai-workforce/db/schema';
import { eq, desc, and, ilike, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export default async function agentRoutes(fastify: FastifyInstance) {

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
      .leftJoin(end_users, eq(conversations.visitor_id, end_users.id))
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
      .leftJoin(end_users, eq(conversations.visitor_id, end_users.id))
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
      .set({ updated_at: new Date() })
      .where(eq(conversations.id, id));

    return { success: true, message: newMessage };
  });

  // POST /agent/conversations/:id/copilot — AI-generated reply suggestion
  fastify.post('/conversations/:id/copilot', async (req, reply) => {
    const { id } = req.params as { id: string };

    // Fetch recent messages for context
    const recentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, id))
      .orderBy(desc(messages.created_at))
      .limit(5);

    // In production this would call OpenAI/Anthropic with the conversation history
    const lastUserMessage = recentMessages.find(m => m.role === 'user')?.content || '';
    
    return {
      success: true,
      suggestion: `Thank you for reaching out. Based on your question about "${lastUserMessage.slice(0, 60)}${lastUserMessage.length > 60 ? '...' : ''}", our team will be happy to assist you. Could you provide more details so we can better address your concern?`
    };
  });
}
