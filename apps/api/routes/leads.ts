import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { leads } from '@ai-workforce/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { calculateLeadScore } from '@ai-workforce/core';

export default async function leadsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const orgId = '00000000-0000-0000-0000-000000000000';
    const list = await db.query.leads.findMany({
      where: eq(leads.org_id, orgId),
      orderBy: (leads, { desc }) => [desc(leads.score)],
    });
    return reply.send({ data: list });
  });

  fastify.get('/:id', async (request, reply) => {
    const orgId = '00000000-0000-0000-0000-000000000000';
    const { id } = request.params as { id: string };
    
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, id),
    });

    if (!lead || lead.org_id !== orgId) {
      return reply.status(404).send({ error: 'Not found' });
    }

    return reply.send({ data: lead });
  });

  fastify.post('/:id/score', async (request, reply) => {
    const orgId = '00000000-0000-0000-0000-000000000000';
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    // In reality this would fetch the lead and its signals to compute these
    // We'll mock the inputs based on the request for MVP
    const scoreResult = calculateLeadScore({
      fit_firmographic: body.fit_firmographic || 80,
      fit_persona: body.fit_persona || 90,
      signal_strength: body.signal_strength || 70,
      tech_fit: body.tech_fit || 60,
      contactability: body.contactability || 100,
      isCompetitor: body.isCompetitor,
      isBlockedGeo: body.isBlockedGeo
    });

    await db.update(leads).set({
      score: scoreResult.score.toString(),
      score_reasons: scoreResult.reasons
    }).where(eq(leads.id, id));

    return reply.send({ data: scoreResult });
  });

  fastify.post('/bulk-action', async (request, reply) => {
    const orgId = '00000000-0000-0000-0000-000000000000';
    const body = request.body as { action: 'approve' | 'reject' | 'suppress', leadIds: string[] };

    const statusMap = {
      'approve': 'contacted',
      'reject': 'bounced',
      'suppress': 'suppressed'
    };

    const targetStatus = statusMap[body.action];
    
    if (body.leadIds.length > 0) {
      await db.update(leads)
        .set({ status: targetStatus })
        .where(inArray(leads.id, body.leadIds));
    }

    return reply.send({ success: true, count: body.leadIds.length });
  });
}
