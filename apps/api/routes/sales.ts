import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import {
  leads,
  campaigns,
  outreach_events,
  icps,
} from "@ai-workforce/db/schema";
import { eq, desc, and, ilike, gte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Queue } from "bullmq";
import { ApolloProvider, ZeroBounceService } from "./providers";
import { requireAction } from "../middleware/authz";

let researchQueue: Queue | null = null;
try {
  // Use lazyConnect so it doesn't crash if Redis is unavailable on startup
  researchQueue = new Queue("research-queue", {
    connection: {
      url: process.env.REDIS_URL || "redis://localhost:6379",
      lazyConnect: true,
      retryStrategy: () => null,
      maxRetriesPerRequest: null,
    },
  });
} catch (e) {
  console.warn("Failed to connect to Redis, Queue disabled");
}

export default async function salesRoutes(fastify: FastifyInstance) {
  // -- ICP Endpoints --

  fastify.get("/icps", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    try {
      const allIcps = await db
        .select()
        .from(icps)
        .where(eq(icps.org_id, org_id))
        .orderBy(desc(icps.created_at));
      return { success: true, data: allIcps };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch ICPs" });
    }
  });

  fastify.post(
    "/icps",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { name, criteria } = request.body as any;
      try {
        const [newIcp] = await db
          .insert(icps)
          .values({
            id: uuidv4(),
            org_id,
            name,
            criteria,
          })
          .returning();
        return { success: true, data: newIcp };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to create ICP" });
      }
    },
  );

  fastify.post(
    "/icps/generate",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const { website, customer_domains } = request.body as any;
      // Mock AI ICP generation
      return {
        success: true,
        data: {
          industries: ["SaaS", "Fintech"],
          companySize: [50, 500],
          geography: ["North America", "Europe"],
          persona: {
            titles: ["CTO", "VP Engineering", "Head of Data"],
            seniority: "Director+",
          },
          signals: { hiring: true, funding: true, leadership_changes: false },
        },
      };
    },
  );

  // -- Leads Endpoints --

  fastify.get("/leads", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { icp_id, status, min_score } = request.query as any;

    try {
      let conditions = [eq(leads.org_id, org_id)];
      if (icp_id) conditions.push(eq(leads.icp_id, icp_id));
      if (status) conditions.push(eq(leads.status, status));
      // In a real app we'd cast and compare min_score, skipping for mock brevity

      const allLeads = await db
        .select()
        .from(leads)
        .where(and(...conditions))
        .orderBy(desc(leads.created_at));
      return { success: true, data: allLeads };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch leads" });
    }
  });

  fastify.get("/leads/:id", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;

    try {
      const lead = await db
        .select()
        .from(leads)
        .where(and(eq(leads.id, id), eq(leads.org_id, org_id)))
        .limit(1);
      if (!lead.length)
        return reply.code(404).send({ error: "Lead not found" });
      return { success: true, data: lead[0] };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch lead" });
    }
  });

  fastify.post(
    "/leads/discover",
    { preHandler: requireAction("MANAGE_LEADS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { icp_id, count = 5 } = request.body as any;

      try {
        const provider = new ApolloProvider();
        const verifier = new ZeroBounceService();

        const companies = await provider.findCompanies({});
        const mockLeads = [];

        for (const comp of companies) {
          const contacts = await provider.findContacts(comp.domain, {});
          for (const contact of contacts) {
            const verified = await verifier.verifyEmails([contact.email]);

            mockLeads.push({
              id: uuidv4(),
              org_id,
              icp_id,
              name: contact.name,
              email: contact.email,
              email_status: verified[0].status,
              company: comp.name,
              linkedin_url: contact.linkedin_url,
              status: "new",
              score: String(Math.floor(Math.random() * 40) + 60), // 60-100
              score_breakdown: { fit: 30, intent: 40, activity: 10 },
              signals: [
                {
                  id: "1",
                  text: "Recent funding round ($10M)",
                  url: "https://news.ycombinator.com",
                  date: new Date().toISOString(),
                  confidence: 0.95,
                },
                {
                  id: "2",
                  text: "Hiring for Engineering",
                  url: "https://boards.greenhouse.io",
                  date: new Date().toISOString(),
                  confidence: 0.88,
                },
              ],
              metadata: { title: contact.title, industry: comp.industry },
            });
          }
        }

        await db.insert(leads).values(mockLeads);
        return {
          success: true,
          message: `Discovered and verified ${mockLeads.length} leads`,
          data: mockLeads,
        };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to discover leads" });
      }
    },
  );

  fastify.post(
    "/leads/:id/research",
    { preHandler: requireAction("MANAGE_LEADS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { id } = request.params as any;

      try {
        const [lead] = await db
          .select()
          .from(leads)
          .where(and(eq(leads.id, id), eq(leads.org_id, org_id)))
          .limit(1);

        if (!lead) return reply.code(404).send({ error: "Lead not found" });

        if (researchQueue) {
          await researchQueue.add("research-lead", {
            leadId: id,
            orgId: org_id,
          });
        } else {
          console.warn("Queue not initialized");
        }

        return { success: true, message: "Research job enqueued" };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to trigger research" });
      }
    },
  );

  // -- Campaigns --

  fastify.get("/campaigns", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    try {
      const allCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.org_id, org_id))
        .orderBy(desc(campaigns.created_at));
      return { success: true, data: allCampaigns };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch campaigns" });
    }
  });

  fastify.post(
    "/campaigns",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { name, prompt_template } = request.body as any;
      try {
        const [newCampaign] = await db
          .insert(campaigns)
          .values({
            id: uuidv4(),
            org_id,
            name,
            prompt_template,
            status: "active",
          })
          .returning();
        return { success: true, data: newCampaign };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to create campaign" });
      }
    },
  );

  // -- Analytics --

  fastify.get("/analytics", async (request, reply) => {
    // Mock analytics data for the dashboard
    return {
      success: true,
      data: {
        pipeline: [
          { stage: "New", count: 1240 },
          { stage: "Researched", count: 850 },
          { stage: "Drafted", count: 620 },
          { stage: "Approved", count: 580 },
          { stage: "Sent", count: 500 },
          { stage: "Replied", count: 42 },
        ],
        scoreDistribution: [
          { range: "0-20", count: 50 },
          { range: "21-40", count: 120 },
          { range: "41-60", count: 350 },
          { range: "61-80", count: 580 },
          { range: "81-100", count: 140 },
        ],
        costs: [
          { name: "Data Provider", value: 0.15 },
          { name: "Verification", value: 0.05 },
          { name: "AI Research", value: 0.08 },
        ],
        precision: { sourced: 96.5, unsourced: 3.5 },
      },
    };
  });
}
