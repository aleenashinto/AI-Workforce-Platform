import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { drafts, leads, campaigns } from '@ai-workforce/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { requireAction } from '../middleware/authz';

const draftingQueue = new Queue('drafting-queue', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379', retryStrategy: () => null, maxRetriesPerRequest: null } });

export default async function draftsRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request, reply) => {
    const { org_id } = request.user as any;
    const { status } = request.query as any;

    try {
      let conditions = [eq(drafts.org_id, org_id)];
      if (status) conditions.push(eq(drafts.status, status));

      const allDrafts = await db.select({
        id: drafts.id,
        lead_name: leads.name,
        company: leads.company,
        subject: drafts.subject,
        status: drafts.status,
        validation_results: drafts.validation_results,
        created_at: drafts.created_at,
      })
      .from(drafts)
      .leftJoin(leads, eq(drafts.lead_id, leads.id))
      .where(and(...conditions))
      .orderBy(desc(drafts.created_at));

      return { success: true, data: allDrafts };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch drafts' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    const { org_id } = request.user as any;
    const { id } = request.params as any;

    try {
      const draft = await db.query.drafts.findFirst({
        where: and(eq(drafts.id, id), eq(drafts.org_id, org_id))
      });
      if (!draft) return reply.code(404).send({ error: 'Draft not found' });
      return { success: true, data: draft };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch draft' });
    }
  });

  fastify.patch('/:id', { preHandler: requireAction('MANAGE_CAMPAIGNS') }, async (request, reply) => {
    const { org_id } = request.user as any;
    const { id } = request.params as any;
    const updates = request.body as any;

    try {
      const [updatedDraft] = await db.update(drafts)
        .set({ ...updates, updated_at: new Date() })
        .where(and(eq(drafts.id, id), eq(drafts.org_id, org_id)))
        .returning();

      if (!updatedDraft) return reply.code(404).send({ error: 'Draft not found' });
      return { success: true, data: updatedDraft };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to update draft' });
    }
  });

  fastify.post('/bulk-approve', { preHandler: requireAction('APPROVE_DRAFT') }, async (request, reply) => {
    const { org_id } = request.user as any;
    const { ids } = request.body as any;

    try {
      if (!ids || ids.length === 0) return { success: true, count: 0 };
      
      const result = await db.update(drafts)
        .set({ status: 'approved', updated_at: new Date() })
        .where(and(inArray(drafts.id, ids), eq(drafts.org_id, org_id)))
        .returning();

      return { success: true, message: `Approved ${result.length} drafts`, count: result.length };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to bulk approve drafts' });
    }
  });

  fastify.post('/generate', { preHandler: requireAction('MANAGE_CAMPAIGNS') }, async (request, reply) => {
    const { org_id } = request.user as any;
    const { lead_id, campaign_id } = request.body as any;

    try {
      await draftingQueue.add('generate-draft', { leadId: lead_id, campaignId: campaign_id, orgId: org_id });
      return { success: true, message: 'Drafting job enqueued' };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to enqueue draft generation' });
    }
  });
}
