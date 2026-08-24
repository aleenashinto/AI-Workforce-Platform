import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import { leads, campaigns } from "@ai-workforce/db/schema";
import { ilike, or, eq } from "drizzle-orm";

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get("/search", async (req: any, reply) => {
    try {
      await req.jwtVerify(); // Requires auth
    } catch (err) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { q } = req.query as { q: string };
    if (!q || q.trim().length === 0) {
      return { results: [] };
    }

    const orgId = req.user.org_id;
    if (!orgId) {
      return reply.status(403).send({ error: "No organization context" });
    }

    const queryStr = `%${q.trim()}%`;
    const results = [];

    // Search Leads
    const foundLeads = await db
      .select()
      .from(leads)
      .where(
        or(
          ilike(leads.name, queryStr),
          ilike(leads.email, queryStr),
          ilike(leads.company, queryStr),
        ),
      )
      .limit(5);

    for (const lead of foundLeads) {
      if (lead.org_id === orgId) {
        results.push({
          type: "lead",
          id: lead.id,
          title: lead.name,
          subtitle: lead.email || lead.company || "Lead",
          url: `/sales-assistant/leads`, // Simplified routing for now
        });
      }
    }

    // Search Campaigns
    const foundCampaigns = await db
      .select()
      .from(campaigns)
      .where(ilike(campaigns.name, queryStr))
      .limit(5);

    for (const campaign of foundCampaigns) {
      if (campaign.org_id === orgId) {
        results.push({
          type: "campaign",
          id: campaign.id,
          title: campaign.name,
          subtitle: `Status: ${campaign.status}`,
          url: `/sales-assistant/campaigns`,
        });
      }
    }

    return { results };
  });
}
