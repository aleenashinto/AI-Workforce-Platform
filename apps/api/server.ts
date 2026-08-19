import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyWebsocket from '@fastify/websocket';
import postgres from 'postgres';
import IORedis from 'ioredis';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = String(args[0]);
  if (msg.includes('ECONNREFUSED') || msg.includes('[ioredis] Unhandled error event')) return;
  originalConsoleError(...args);
};
process.on('unhandledRejection', (reason: any) => {
  if (reason?.code === 'ECONNREFUSED' || String(reason).includes('ECONNREFUSED')) return;
  if (reason?.errors?.some?.((e: any) => e.code === 'ECONNREFUSED')) return;
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err: any) => {
  if (err?.code === 'ECONNREFUSED' || String(err).includes('ECONNREFUSED')) return;
  if (err?.errors?.some?.((e: any) => e.code === 'ECONNREFUSED')) return;
  console.error('Uncaught Exception:', err);
});

const fastify = Fastify({ logger: true });

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "supersecretcookie", // for signed cookies
  hook: 'onRequest', 
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
  cookie: {
    cookieName: 'auth_token',
    signed: false // our jwt tokens aren't signed cookies, they are just jwts
  }
});

fastify.register(fastifyWebsocket);
const allowedOriginsList = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ai-workforce-job-web-git-main-inspite1.vercel.app',
  'https://ai-workforce-job-cslmzobfm-inspite1.vercel.app'
];

const allowedOrigins = (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
  if (!origin) return cb(null, true);
  if (allowedOriginsList.includes(origin)) return cb(null, true);
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return cb(null, true);
  // Optional: keep allowing all vercel previews if needed, but explicit list is safer for production credentials
  if (origin.endsWith('.vercel.app')) return cb(null, true);
  cb(new Error("Not allowed by CORS"), false);
};

fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

import salesRoutes from './routes/sales';
import authRoutes from './routes/auth';
import agentRoutes from './routes/agent';
import { knowledgeRoutes } from './routes/knowledge';
import sequencesRoutes from './routes/sequences';
import draftsRoutes from './routes/drafts';
import mailboxesRoutes from './routes/mailboxes';
import repliesRoutes from './routes/replies';
import securityRoutes from './routes/security';
import { chatRoutes } from './routes/chat';
import { analyticsRoutes } from './routes/analytics';
import crmRoutes from './routes/crm';
import { rateLimitMiddleware } from './middleware/rate-limit';
import webhookRoutes from './routes/webhooks';
import onboardingRoutes from './routes/onboarding';


fastify.register(salesRoutes);
fastify.register(agentRoutes, { prefix: '/agent' });
fastify.register(knowledgeRoutes, { prefix: '/knowledge' });
fastify.register(sequencesRoutes, { prefix: '/sequences' });
fastify.register(draftsRoutes, { prefix: '/drafts' });
fastify.register(mailboxesRoutes, { prefix: '/mailboxes' });
fastify.register(repliesRoutes, { prefix: '/replies' });
fastify.register(securityRoutes, { prefix: '/security' });
fastify.register(chatRoutes);
fastify.register(analyticsRoutes);
fastify.register(crmRoutes, { prefix: '/crm' });
fastify.register(salesRoutes, { prefix: '/v1/crm/sales' });
fastify.register(authRoutes);
fastify.register(webhookRoutes);
fastify.register(onboardingRoutes, { prefix: '/onboarding' });

// DEV ONLY: inject mock user if no auth token provided
if (process.env.NODE_ENV !== 'production') {
  fastify.addHook('onRequest', async (request) => {
    if (!request.headers.authorization) {
      (request as any).user = {
        org_id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000002',
        roles: ['owner', 'admin', 'support_lead', 'sales_lead']
      };
    }
  });
}


// Apply rate limiting middleware to all routes except health checks
fastify.addHook('onRequest', async (request, reply) => {
  if (!request.url.startsWith('/health') && !request.url.startsWith('/ready')) {
    await rateLimitMiddleware(request, reply);
  }
});

// SSE Endpoint
fastify.get('/v1/streams/:channel', { websocket: true }, (connection, req) => {
  connection.socket.send(JSON.stringify({ message: 'Connected to channel ' + (req.params as any).channel }));
  
  const interval = setInterval(() => {
    connection.socket.send(JSON.stringify({ ping: Date.now() }));
  }, 30000);

  connection.socket.on('close', () => {
    clearInterval(interval);
  });
});

fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Analytics endpoints
fastify.get('/analytics/support', async () => {
  return {
    success: true,
    volumeData: [
      { name: 'Mon', total: 120, ai: 95 },
      { name: 'Tue', total: 150, ai: 120 },
      { name: 'Wed', total: 180, ai: 150 },
      { name: 'Thu', total: 140, ai: 110 },
      { name: 'Fri', total: 160, ai: 135 },
      { name: 'Sat', total: 90, ai: 85 },
      { name: 'Sun', total: 70, ai: 65 },
    ],
    csatData: [
      { name: '1 Star', count: 5 },
      { name: '2 Stars', count: 12 },
      { name: '3 Stars', count: 25 },
      { name: '4 Stars', count: 85 },
      { name: '5 Stars', count: 210 },
    ],
    stats: {
      totalConversations: 910,
      aiResolutionRate: 84.5,
      avgResponseTime: 12,
      csatScore: 4.4
    }
  };
});

fastify.get('/analytics/sales', async () => {
  return {
    success: true,
    pipeline: [
      { stage: 'New', count: 1240 },
      { stage: 'Researched', count: 850 },
      { stage: 'Drafted', count: 620 },
      { stage: 'Approved', count: 580 },
      { stage: 'Sent', count: 500 },
      { stage: 'Replied', count: 42 }
    ],
    scoreDistribution: [
      { range: '0-20', count: 50 },
      { range: '21-40', count: 120 },
      { range: '41-60', count: 350 },
      { range: '61-80', count: 580 },
      { range: '81-100', count: 140 }
    ],
    costs: [
      { name: 'Data Provider', value: 0.15 },
      { name: 'Verification', value: 0.05 },
      { name: 'AI Research', value: 0.08 }
    ],
    precision: { sourced: 96.5, unsourced: 3.5 }
  };
});

fastify.get('/ready', async (req, reply) => {
  const dbClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5435/ai_workforce', { max: 1, connect_timeout: 2 });
  const redisClient = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { maxRetriesPerRequest: 1, connectTimeout: 2000, lazyConnect: true, retryStrategy: () => null });

  const health = {
    status: 'ok',
    dependencies: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    await dbClient`SELECT 1`;
    health.dependencies.database = 'ok';
  } catch (error) {
    health.dependencies.database = 'error';
    health.status = 'error';
  } finally {
    await dbClient.end();
  }

  try {
    await redisClient.connect();
    await redisClient.ping();
    health.dependencies.redis = 'ok';
  } catch (error) {
    health.dependencies.redis = 'error';
    health.status = 'error';
  } finally {
    redisClient.disconnect();
  }

  if (health.status === 'error') {
    reply.status(503).send(health);
  } else {
    reply.status(200).send(health);
  }
});

fastify.get('/', async () => {
  return { message: 'AI Workforce API is running' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Only start the server if run directly (e.g., node server.js)
// If imported as a module (e.g., by Vercel serverless function), just export the app
if (require.main === module && !process.env.VERCEL) {
  start();
}

export default fastify;
