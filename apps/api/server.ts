import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyWebsocket from "@fastify/websocket";
import postgres from "postgres";
import IORedis from "ioredis";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = String(args[0]);
  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("[ioredis]") ||
    msg.includes("Connection is closed")
  )
    return;
  originalConsoleError(...args);
};
process.on("unhandledRejection", (reason: any) => {
  const errStr = String(reason);
  if (
    reason?.code === "ECONNREFUSED" ||
    errStr.includes("ECONNREFUSED") ||
    errStr.includes("Connection is closed")
  )
    return;
  if (reason?.errors?.some?.((e: any) => e.code === "ECONNREFUSED")) return;
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err: any) => {
  const errStr = String(err);
  if (
    err?.code === "ECONNREFUSED" ||
    errStr.includes("ECONNREFUSED") ||
    errStr.includes("Connection is closed")
  )
    return;
  if (err?.errors?.some?.((e: any) => e.code === "ECONNREFUSED")) return;
  console.error("Uncaught Exception:", err);
});

const fastify = Fastify({ logger: true, bodyLimit: 10485760 });

fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "supersecretcookie", // for signed cookies
  hook: "onRequest",
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "supersecret",
  cookie: {
    cookieName: "auth_token",
    signed: false, // our jwt tokens aren't signed cookies, they are just jwts
  },
});

fastify.register(fastifyWebsocket);
const allowedOrigins = (
  origin: string | undefined,
  cb: (err: Error | null, allow: boolean) => void,
) => {
  if (!origin) return cb(null, true);

  if (
    process.env.FRONTEND_URL &&
    origin === process.env.FRONTEND_URL.replace(/\/+$/, "")
  ) {
    return cb(null, true);
  }

  if (
    process.env.WEB_URL &&
    origin === process.env.WEB_URL.replace(/\/+$/, "")
  ) {
    return cb(null, true);
  }

  if (origin.endsWith(".vercel.app")) {
    return cb(null, true);
  }

  // Allow local development if not in strict production mode
  if (process.env.NODE_ENV !== "production") {
    const localOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ];
    if (localOrigins.includes(origin)) return cb(null, true);
  }

  cb(new Error(`Not allowed by CORS: ${origin}`), false);
};

fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "Cookie",
    "x-org-id",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

fastify.register(fastifyRateLimit, {
  max: 100, // default limit
  timeWindow: "1 minute",
  // You can set route-specific limits in the route definitions
});

import salesRoutes from "./routes/sales";
import salesAnalyticsRoutes from "./routes/sales-analytics";
import authRoutes from "./routes/auth";
import agentRoutes from "./routes/agent";
import searchRoutes from "./routes/search";
import { knowledgeRoutes } from "./routes/knowledge";
import sequencesRoutes from "./routes/sequences";
import draftsRoutes from "./routes/drafts";
import mailboxesRoutes from "./routes/mailboxes";
import repliesRoutes from "./routes/replies";
import securityRoutes from "./routes/security";
import { chatRoutes } from "./routes/chat";
import { analyticsRoutes } from "./routes/analytics";
import crmRoutes from "./routes/crm";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import webhookRoutes from "./routes/webhooks";
import onboardingRoutes from "./routes/onboarding";
import icpRoutes from "./routes/icps";
import leadDiscoveryRoutes from "./routes/lead-discovery";
import researchRoutes from "./routes/research";

fastify.register(salesRoutes);
fastify.register(salesAnalyticsRoutes, { prefix: "/sales/analytics" });
fastify.register(agentRoutes, { prefix: "/agent" });
fastify.register(knowledgeRoutes, { prefix: "/knowledge" });
fastify.register(sequencesRoutes, { prefix: "/sequences" });
fastify.register(draftsRoutes, { prefix: "/drafts" });
fastify.register(draftsRoutes, { prefix: "/sales/drafts" });
fastify.register(mailboxesRoutes, { prefix: "/mailboxes" });
fastify.register(repliesRoutes, { prefix: "/replies" });
fastify.register(securityRoutes, { prefix: "/security" });
fastify.register(chatRoutes);
fastify.register(analyticsRoutes);
fastify.register(crmRoutes, { prefix: "/crm" });
fastify.register(salesRoutes, { prefix: "/v1/crm/sales" });
fastify.register(authRoutes);
fastify.register(searchRoutes);
fastify.register(webhookRoutes);
fastify.register(onboardingRoutes, { prefix: "/onboarding" });
fastify.register(icpRoutes, { prefix: "/v1/icps" });
fastify.register(icpRoutes, { prefix: "/icps" });
fastify.register(leadDiscoveryRoutes, { prefix: "/v1/lead-discovery" });
fastify.register(leadDiscoveryRoutes, { prefix: "/lead-discovery" });
fastify.register(researchRoutes, { prefix: "/v1/research" });
fastify.register(researchRoutes, { prefix: "/research" });

// DEV ONLY: inject mock user if no auth token provided
if (process.env.NODE_ENV !== "production") {
  fastify.addHook("onRequest", async (request) => {
    if (!request.headers.authorization) {
      (request as any).user = {
        org_id: "00000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000002",
        roles: ["owner", "admin", "support_lead", "sales_lead"],
      };
    }
  });
}

// Apply rate limiting middleware to all routes except health checks
fastify.addHook("onRequest", async (request, reply) => {
  if (!request.url.startsWith("/health") && !request.url.startsWith("/ready")) {
    await rateLimitMiddleware(request, reply);
  }
});

// SSE Endpoint
fastify.get("/v1/streams/:channel", { websocket: true }, (connection, req) => {
  connection.socket.send(
    JSON.stringify({
      message: "Connected to channel " + (req.params as any).channel,
    }),
  );

  const interval = setInterval(() => {
    connection.socket.send(JSON.stringify({ ping: Date.now() }));
  }, 30000);

  connection.socket.on("close", () => {
    clearInterval(interval);
  });
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

// Analytics endpoints
fastify.get("/analytics/support", async () => {
  return {
    success: true,
    volumeData: [
      { name: "Mon", total: 120, ai: 95 },
      { name: "Tue", total: 150, ai: 120 },
      { name: "Wed", total: 180, ai: 150 },
      { name: "Thu", total: 140, ai: 110 },
      { name: "Fri", total: 160, ai: 135 },
      { name: "Sat", total: 90, ai: 85 },
      { name: "Sun", total: 70, ai: 65 },
    ],
    csatData: [
      { name: "1 Star", count: 5 },
      { name: "2 Stars", count: 12 },
      { name: "3 Stars", count: 25 },
      { name: "4 Stars", count: 85 },
      { name: "5 Stars", count: 210 },
    ],
    stats: {
      totalConversations: 910,
      aiResolutionRate: 84.5,
      avgResponseTime: 12,
      csatScore: 4.4,
    },
  };
});




fastify.get("/ready", async (req, reply) => {
  const dbClient = postgres(
    process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5435/ai_workforce",
    { max: 1, connect_timeout: 2 },
  );
  const redisClient = new IORedis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379",
    {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy: () => null,
    },
  );

  const health = {
    status: "ok",
    dependencies: {
      database: "unknown",
      redis: "unknown",
    },
  };

  try {
    await dbClient`SELECT 1`;
    health.dependencies.database = "ok";
  } catch (error) {
    health.dependencies.database = "error";
    health.status = "error";
  } finally {
    await dbClient.end();
  }

  try {
    await redisClient.connect();
    await redisClient.ping();
    health.dependencies.redis = "ok";
  } catch (error) {
    health.dependencies.redis = "error";
    health.status = "error";
  } finally {
    redisClient.disconnect();
  }

  if (health.status === "error") {
    reply.status(503).send(health);
  } else {
    reply.status(200).send(health);
  }
});

fastify.get("/", async () => {
  return { message: "AI Workforce API is running" };
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

// Only start the server if explicitly requested via START_SERVER=true
if (process.env.START_SERVER === "true") {
  start();
}

export default fastify;
