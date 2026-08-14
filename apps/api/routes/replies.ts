import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { replies, leads } from '@ai-workforce/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export default async function repliesRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request, reply) => {
    const { org_id } = request.user as any;

    try {
      const allReplies = await db.select({
        id: replies.id,
        classification: replies.classification,
        content: replies.content,
        status: replies.status,
        created_at: replies.created_at,
        lead_name: leads.name,
        company: leads.company,
      })
      .from(replies)
      .leftJoin(leads, eq(replies.lead_id, leads.id))
      .where(eq(replies.org_id, org_id))
      .orderBy(desc(replies.created_at));

      return { success: true, data: allReplies };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch replies' });
    }
  });

  fastify.patch('/:id/status', async (request, reply) => {
    const { org_id } = request.user as any;
    const { id } = request.params as any;
    const { status } = request.body as any;

    try {
      const [updatedReply] = await db.update(replies)
        .set({ status })
        .where(and(eq(replies.id, id), eq(replies.org_id, org_id)))
        .returning();

      return { success: true, data: updatedReply };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to update reply status' });
    }
  });
}
