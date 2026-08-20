import { FastifyRequest, FastifyReply } from 'fastify';
import IORedis from 'ioredis';
const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy: () => null
});
const RATE_LIMIT_WINDOW_SECS = 60;
const MAX_REQUESTS_PER_WINDOW = 100;

export async function rateLimitMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const ip = request.ip;
  const user = request.user as any;
  const identifier = user?.org_id ? `ratelimit:org:${user.org_id}` : `ratelimit:ip:${ip}`;

  try {
    const currentRequests = await redis.incr(identifier);
    
    if (currentRequests === 1) {
      await redis.expire(identifier, RATE_LIMIT_WINDOW_SECS);
    }

    if (currentRequests > MAX_REQUESTS_PER_WINDOW) {
      reply.status(429).send({ error: 'Too Many Requests', message: 'Rate limit exceeded.' });
      return reply; // Fastify hook stops execution if a reply is sent
    }
  } catch (err) {
    // Fail open if Redis is down
    console.error("Rate limit redis error:", err);
  }
}
