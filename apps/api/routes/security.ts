import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getDb, withTenant } from '@ai-workforce/db';
import { api_keys, audit_logs, organizations } from '@ai-workforce/db';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { requireAction } from '../middleware/authz';

const securityRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const db = getDb(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');

  // Middleware to authenticate via JWT
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.get('/keys', { preHandler: requireAction('MANAGE_API_KEYS') }, async (request, reply) => {
    const { org_id } = request.user as any;
    const keys = await withTenant(db, org_id, async (tx: any) => {
      return tx.select({
        id: api_keys.id,
        name: api_keys.name,
        scopes: api_keys.scopes,
        last_used_at: api_keys.last_used_at,
        created_at: sql`${api_keys}.id`, // Mocking created_at as we didn't add it to schema
      }).from(api_keys).where(and(eq(api_keys.org_id, org_id), sql`revoked_at IS NULL`));
    });
    return keys;
  });

  fastify.post('/keys', { preHandler: requireAction('MANAGE_API_KEYS') }, async (request, reply) => {
    const { org_id, user_id } = request.user as any;
    const { name, scopes } = request.body as any;

    const rawKey = `ak_${crypto.randomBytes(24).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await withTenant(db, org_id, async (tx: any) => {
      await tx.insert(api_keys).values({
        org_id,
        name,
        scopes,
        hashed_key: hashedKey,
      });

      await tx.insert(audit_logs).values({
        org_id,
        user_id,
        action: 'api_key_created',
        entity: 'api_key',
        metadata: { name, scopes }
      });
    });

    return { key: rawKey };
  });

  fastify.delete('/keys/:id', { preHandler: requireAction('MANAGE_API_KEYS') }, async (request, reply) => {
    const { org_id, user_id } = request.user as any;
    const { id } = request.params as any;

    await withTenant(db, org_id, async (tx: any) => {
      await tx.update(api_keys)
        .set({ revoked_at: new Date() })
        .where(and(eq(api_keys.id, id), eq(api_keys.org_id, org_id)));

      await tx.insert(audit_logs).values({
        org_id,
        user_id,
        action: 'api_key_revoked',
        entity: 'api_key',
        entity_id: id
      });
    });

    return { success: true };
  });

  fastify.post('/export', { preHandler: requireAction('MANAGE_SETTINGS') }, async (request, reply) => {
    const { org_id, user_id } = request.user as any;

    await withTenant(db, org_id, async (tx: any) => {
      await tx.insert(audit_logs).values({
        org_id,
        user_id,
        action: 'data_export_requested',
        entity: 'organization'
      });
    });

    return { success: true, message: 'Data export initiated. You will receive an email when it is ready.' };
  });

  fastify.patch('/retention', { preHandler: requireAction('MANAGE_SETTINGS') }, async (request, reply) => {
    const { org_id, user_id } = request.user as any;
    const { retention_days } = request.body as any;

    await withTenant(db, org_id, async (tx: any) => {
      await tx.update(organizations)
        .set({ retention_days: retention_days.toString() })
        .where(eq(organizations.id, org_id));

      await tx.insert(audit_logs).values({
        org_id,
        user_id,
        action: 'retention_policy_updated',
        entity: 'organization',
        metadata: { retention_days }
      });
    });

    return { success: true };
  });

  fastify.patch('/approval-gate', { preHandler: requireAction('TOGGLE_APPROVAL_GATE') }, async (request, reply) => {
    const { org_id, user_id } = request.user as any;
    const { active } = request.body as any;

    await withTenant(db, org_id, async (tx: any) => {
      await tx.update(organizations)
        .set({ approval_gate_active: !!active })
        .where(eq(organizations.id, org_id));

      await tx.insert(audit_logs).values({
        org_id,
        user_id,
        action: 'approval_gate_toggled',
        entity: 'organization',
        metadata: { approval_gate_active: !!active }
      });
    });

    return { success: true };
  });
};

export default securityRoutes;
