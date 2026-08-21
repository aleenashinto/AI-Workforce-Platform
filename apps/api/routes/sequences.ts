import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { sequences, sequence_steps, leads, drafts } from '@ai-workforce/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { Queue } from 'bullmq';
import { requireAction } from '../middleware/authz';

const draftingQueue = new Queue('drafting-queue', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379', lazyConnect: true, retryStrategy: () => null, maxRetriesPerRequest: null as any } });

export default async function sequencesRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    try {
      const allSequences = await db.select().from(sequences).where(eq(sequences.org_id, org_id)).orderBy(desc(sequences.created_at));
      return { success: true, data: allSequences };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch sequences' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = request.params as any;

    try {
      const [sequence] = await db.select().from(sequences).where(and(eq(sequences.id, id), eq(sequences.org_id, org_id))).limit(1);
      if (!sequence) return reply.code(404).send({ error: 'Sequence not found' });
      
      const steps = await db.select().from(sequence_steps).where(eq(sequence_steps.sequence_id, id)).orderBy(sequence_steps.day_offset);
      
      return { success: true, data: { ...sequence, steps } };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch sequence' });
    }
  });

  fastify.post('/', { preHandler: requireAction('MANAGE_CAMPAIGNS') }, async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { name, steps } = request.body as any;

    try {
      const sequenceId = uuidv4();
      const [newSequence] = await db.insert(sequences).values({
        id: sequenceId,
        org_id,
        name,
        status: 'draft'
      }).returning();

      if (steps && steps.length > 0) {
        const stepsToInsert = steps.map((s: any) => ({
          id: uuidv4(),
          sequence_id: sequenceId,
          day_offset: s.day_offset,
          channel: s.channel || 'email',
          template: s.template,
          stop_conditions: s.stop_conditions
        }));
        await db.insert(sequence_steps).values(stepsToInsert);
      }

      return { success: true, data: newSequence };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to create sequence' });
    }
  });

  fastify.post('/:id/enroll', { preHandler: requireAction('MANAGE_CAMPAIGNS') }, async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = request.params as any;
    const { lead_ids } = request.body as any;

    try {
      // 1. Validate sequence exists
      const [sequence] = await db.select().from(sequences).where(and(eq(sequences.id, id), eq(sequences.org_id, org_id))).limit(1);
      if (!sequence) return reply.code(404).send({ error: 'Sequence not found' });

      // 2. Filter out suppressed/bounced leads
      const validLeads = [];
      for (const leadId of lead_ids) {
        const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
        if (lead && lead.status !== 'suppressed' && lead.status !== 'bounced') {
          validLeads.push(leadId);
        }
      }

      // 3. Enqueue drafting jobs for valid leads
      for (const leadId of validLeads) {
        await draftingQueue.add('generate-draft', { leadId, campaignId: id, orgId: org_id });
      }

      return { 
        success: true, 
        message: `Enrolled ${validLeads.length} leads. Skipped ${lead_ids.length - validLeads.length} suppressed/invalid leads.` 
      };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to enroll leads in sequence' });
    }
  });

  fastify.patch('/:id/status', { preHandler: requireAction('MANAGE_CAMPAIGNS') }, async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = request.params as any;
    const { status } = request.body as any;

    try {
      const [updatedSequence] = await db.update(sequences)
        .set({ status })
        .where(and(eq(sequences.id, id), eq(sequences.org_id, org_id)))
        .returning();

      return { success: true, data: updatedSequence };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to update sequence status' });
    }
  });

  fastify.get('/:id/stats', async (request, reply) => {
    const { id } = request.params as any;
    // mock stats
    return { success: true, data: { sent: 0, opened: 0, replied: 0, bounced: 0, enrolled: 0 } };
  });
}
