import { FastifyRequest, FastifyReply } from 'fastify';
import postgres from 'postgres';

export const checkBillingQuota = async (request: FastifyRequest, reply: FastifyReply) => {
  const { org_id } = (request.body as any) || (request.query as any);

  if (!org_id) {
    // If no org_id in request, we can't check quota, let it pass or fail elsewhere
    return;
  }

  const sql = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5435/ai_workforce');
  
  try {
    // Fetch org subscription details
    const [subscription] = await sql`SELECT stripe_subscription_id, plan_id, status FROM organizations WHERE id = ${org_id}`;
    
    if (subscription && subscription.status === 'past_due' || subscription?.status === 'canceled') {
      reply.status(402).send({ error: 'Payment Required: Your subscription is past due or canceled. Please update your billing.' });
      return reply; // Fastify hook pattern to stop processing
    }

    // Example simple quota logic based on a theoretical monthly limit
    // Assuming 'pro' = 10,000 requests, 'starter' = 1000 requests
    let quota = 100; // Free tier
    if (subscription?.plan_id === 'starter') quota = 1000;
    if (subscription?.plan_id === 'pro') quota = 10000;

    // Check usage for the current month
    const [usage] = await sql`
      SELECT COUNT(*) as count 
      FROM usage_events 
      WHERE org_id = ${org_id} AND created_at >= date_trunc('month', current_date)
    `;

    if (usage && parseInt(usage.count) >= quota) {
      reply.status(429).send({ error: 'Quota Exceeded: You have reached your monthly API usage limit.' });
      return reply;
    }

    // Log the usage event (async so it doesn't block the request entirely)
    // Normally we might do this after the request finishes, but we can fire and forget here
    sql`INSERT INTO usage_events (id, org_id, event_type, created_at) VALUES (gen_random_uuid(), ${org_id}, 'api_call', NOW())`.catch(err => console.error("Failed to log usage", err));
    
  } catch (err) {
    console.error("Billing check failed:", err);
    // Fail open if DB issue on billing
  } finally {
    await sql.end();
  }
};
