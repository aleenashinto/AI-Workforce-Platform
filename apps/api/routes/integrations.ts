import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getDb, withTenant } from 'db/client';
import { integrations, audit_logs } from 'db/schema';

const integrationsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const db = getDb(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');

  // OAuth Callback Route
  fastify.get('/oauth/callback/:provider', async (request, reply) => {
    // In a real implementation, this would validate the state parameter, exchange the code for tokens, etc.
    const { provider } = request.params as { provider: string };
    const { code, state, org_id } = request.query as any;

    if (!code || !org_id) {
      return reply.status(400).send({ error: 'Missing code or org_id' });
    }

    // Mock token exchange
    const mockTokens = {
      access_token: `mock_access_token_${provider}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${provider}_${Date.now()}`,
      expires_in: 3600
    };

    await withTenant(db, org_id, async (tx) => {
      await tx.insert(integrations).values({
        org_id,
        category: 'knowledge', // or 'crm' etc based on provider
        provider,
        credentials: JSON.stringify(mockTokens),
        sync_status: 'active'
      });

      await tx.insert(audit_logs).values({
        org_id,
        user_id: null, // Assuming systemic or we'd get it from state/session
        action: 'oauth_connected',
        entity: 'integration',
        metadata: { provider }
      });
    });

    return reply.send({ success: true, message: `${provider} connected successfully` });
  });
};

export default integrationsRoutes;
