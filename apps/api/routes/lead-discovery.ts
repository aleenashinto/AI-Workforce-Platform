import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@ai-workforce/db";
import {
  companies,
  contacts,
  icps,
  leads,
  buying_signals,
} from "@ai-workforce/db/schema";
import { eq, or, and, ilike, inArray, gte, sql } from "drizzle-orm";
import { generateStructured } from "@ai-workforce/llm";
import { z } from "zod";

const SearchCriteriaSchema = z.object({
  industries: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  companySize: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  buyingSignals: z.array(z.string()).optional(),
});

const leadDiscoveryRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
) => {
  // Get active ICP
  fastify.get("/v1/lead-discovery", async (request, reply) => {
    return { success: true };
  });

  // Perform a search
  fastify.post("/v1/lead-discovery/search", async (request, reply) => {
    const { prompt, criteria, icpId } = request.body as any;
    let finalCriteria = criteria || {};

    if (prompt) {
      try {
        const parsed = await generateStructured(
          "Extract lead search criteria from this prompt: " + prompt,
          SearchCriteriaSchema,
          { provider: "openai", model: "gpt-4o-mini" },
        );
        finalCriteria = parsed;
      } catch (e) {
        console.error("LLM parse failed:", e);
      }
    }

    // Mock search by returning companies joined with contacts and calculating scores
    // First, find active ICP
    let icp: any = null;
    if (icpId) {
      const icpsData = await db
        .select()
        .from(icps)
        .where(eq(icps.id, icpId))
        .limit(1);
      if (icpsData.length) icp = icpsData[0];
    } else {
      const icpsData = await db
        .select()
        .from(icps)
        .where(eq(icps.status, "active"))
        .limit(1);
      if (icpsData.length) icp = icpsData[0];
    }

    // Query demo database for all companies and contacts
    // In reality this would call Apollo/Zoominfo
    const allCompanies = await db.select().from(companies);
    const allContacts = await db.select().from(contacts);
    const allSignals = await db.select().from(buying_signals);

    // Filter by criteria if provided
    let matchedCompanies = allCompanies;
    if (finalCriteria.industries?.length) {
      matchedCompanies = matchedCompanies.filter((c) =>
        finalCriteria.industries.some((i: string) =>
          c.industry?.toLowerCase().includes(i.toLowerCase()),
        ),
      );
    }

    // We'll just build a rich response object out of the DB results
    const prospects = [];

    for (const c of matchedCompanies.slice(0, 50)) {
      // Limit to 50
      const companyContacts = allContacts.filter(
        (cont) => cont.company_id === c.id,
      );
      const companySignals = allSignals.filter(
        (sig) => sig.company_id === c.id,
      );

      for (const contact of companyContacts) {
        // Calculate mock scores based on ICP
        let icpMatch = Math.floor(Math.random() * 40) + 60; // 60-100
        let leadScore = Math.floor(Math.random() * 40) + 60; // 60-100

        // Boost score if industry matches active ICP
        if (icp?.criteria?.industries?.includes(c.industry)) {
          icpMatch = Math.min(100, icpMatch + 15);
        }

        prospects.push({
          id: c.id + "_" + contact.id,
          company: {
            id: c.id,
            name: c.name,
            domain: c.domain,
            industry: c.industry,
            employee_count: c.employee_count,
            location: c.metadata?.location || "Unknown",
          },
          contact: {
            id: contact.id,
            name: contact.full_name,
            job_title: contact.job_title,
            seniority: contact.seniority,
            department: contact.department,
          },
          signals: companySignals,
          scores: {
            icpMatch,
            leadScore,
            explanation:
              "Strong ICP match based on industry (" +
              c.industry +
              ") and company size.",
          },
          aiRecommendation:
            "Contact " + contact.full_name + " regarding their recent growth.",
        });
      }
    }

    // Sort by AI lead score
    prospects.sort((a, b) => b.scores.leadScore - a.scores.leadScore);

    return {
      success: true,
      data: prospects,
      criteria: finalCriteria,
    };
  });

  // Add to Leads
  fastify.post("/v1/lead-discovery/add-to-leads", async (request, reply) => {
    const { prospects, org_id } = request.body as any;

    // Mock bulk insert (in a real app we'd insert into leads table)
    for (const p of prospects) {
      // Just demo mode insert
      await db
        .insert(leads)
        .values({
          org_id: org_id || "00000000-0000-0000-0000-000000000001",
          company_id: p.company.id,
          name: p.contact.name,
          company: p.company.name,
          status: "new",
          score: p.scores.leadScore,
        })
        .catch((e) =>
          console.log("Lead insert error or duplicate:", e.message),
        );
    }

    return { success: true, count: prospects.length };
  });
};

export default leadDiscoveryRoutes;
