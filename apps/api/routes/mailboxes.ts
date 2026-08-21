import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { mailboxes } from '@ai-workforce/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export default async function mailboxesRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';

    try {
      const allMailboxes = await db.select().from(mailboxes).where(eq(mailboxes.org_id, org_id));
      return { success: true, data: allMailboxes };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch mailboxes' });
    }
  });

  fastify.post('/', async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { provider, email, credentials } = request.body as any;

    try {
      // Simulate encrypting credentials using local env secret (mock KMS)
      const encryptedCreds = Buffer.from(credentials).toString('base64');

      const [newMailbox] = await db.insert(mailboxes).values({
        id: uuidv4(),
        org_id,
        provider,
        email,
        credentials: encryptedCreds,
        status: 'warmup',
        daily_cap: '5',
        warmup_stage: '0',
        health_score: '100',
        metrics: { bounces: 0, complaints: 0, opens: 0 }
      }).returning();

      return { success: true, data: newMailbox };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to create mailbox' });
    }
  });

  fastify.patch('/:id/pause', async (request, reply) => {
    const org_id = (request.user as any)?.org_id || (request.headers['x-org-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { id } = request.params as any;
    const { paused } = request.body as any;

    try {
      const [updatedMailbox] = await db.update(mailboxes)
        .set({ status: paused ? 'paused' : 'active', updated_at: new Date() })
        .where(and(eq(mailboxes.id, id), eq(mailboxes.org_id, org_id)))
        .returning();

      return { success: true, data: updatedMailbox };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to update mailbox status' });
    }
  });
}
