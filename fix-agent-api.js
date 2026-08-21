const fs = require('fs');
const p = 'apps/api/routes/agent.ts';
let code = fs.readFileSync(p, 'utf8');

if (!code.includes('end_users')) {
  code = code.replace(
    "conversations, messages, organizations } from '@ai-workforce/db/schema';",
    "conversations, messages, organizations, end_users } from '@ai-workforce/db/schema';"
  );
}

if (!code.includes('ilike')) {
  code = code.replace(
    "eq, desc, and } from 'drizzle-orm';",
    "eq, desc, and, ilike, or } from 'drizzle-orm';"
  );
}

const getConvs = `fastify.get('/conversations', async (req, reply) => {
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
  });`;

const getConvById = `fastify.get('/conversations/:id', async (req, reply) => {
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
  });`;

code = code.replace(
  /fastify\.get\('\/conversations', async[\s\S]*?return \{ unassigned, assigned \};\s*\}\);/,
  getConvs
);

code = code.replace(
  /fastify\.get\('\/conversations\/:id', async[\s\S]*?return \{ \.\.\.conversation, messages: convMessages \};\s*\}\);/,
  getConvById
);

fs.writeFileSync(p, code);
