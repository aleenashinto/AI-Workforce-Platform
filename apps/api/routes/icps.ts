import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import { icps, icp_versions } from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";
import { generateStructured } from "@ai-workforce/llm";
import { z } from "zod";

const ICPSchema = z.object({
  industries: z.array(z.string()).optional(),
  companySize: z.array(z.string()).optional(),
  geography: z.array(z.string()).optional(),
  revenue: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  funding: z.array(z.string()).optional(),
  growth: z.string().optional(),
  buyingSignals: z.array(z.string()).optional(),
});

const PersonaSchema = z.object({
  titles: z.array(z.string()).optional(),
  seniority: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
});

export default async function icpRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    // Mock user/org extraction
    const orgId = "00000000-0000-0000-0000-000000000001";
    const list = await db.query.icps.findMany({
      where: eq(icps.org_id, orgId),
      orderBy: (icps, { desc }) => [desc(icps.updated_at)],
    });
    return reply.send({ data: list });
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const icp = await db.query.icps.findFirst({
      where: eq(icps.id, id),
    });

    if (!icp) return reply.status(404).send({ error: "ICP not found" });

    const versions = await db.query.icp_versions.findMany({
      where: eq(icp_versions.icp_id, id),
      orderBy: (icp_versions, { desc }) => [desc(icp_versions.version_num)],
    });

    return reply.send({ data: { ...icp, versions } });
  });

  fastify.post("/", async (request, reply) => {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const body = request.body as any;

    const [inserted] = await db
      .insert(icps)
      .values({
        org_id: orgId,
        name: body.name,
        description: body.description,
        status: body.status || "draft",
        criteria: body.criteria || {},
        disqualifiers: body.disqualifiers || [],
        persona: body.persona || {},
        match_rate: body.match_rate || "0",
        performance_metrics: {
          companies_discovered: 0,
          matched_companies: 0,
          qualified_leads: 0,
          opportunities: 0,
          won_deals: 0,
        },
      })
      .returning();

    // Create initial version
    await db.insert(icp_versions).values({
      org_id: orgId,
      icp_id: inserted.id,
      version_num: "1",
      criteria: body.criteria || {},
      change_summary: "Initial ICP",
    });

    return reply.status(201).send({ data: inserted });
  });

  fastify.patch("/:id", async (request, reply) => {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const [updated] = await db
      .update(icps)
      .set({
        name: body.name,
        description: body.description,
        status: body.status,
        criteria: body.criteria,
        disqualifiers: body.disqualifiers,
        persona: body.persona,
        updated_at: new Date(),
      })
      .where(eq(icps.id, id))
      .returning();

    if (body.saveVersion && body.criteria) {
      // Get latest version
      const versions = await db.query.icp_versions.findMany({
        where: eq(icp_versions.icp_id, id),
        orderBy: (icp_versions, { desc }) => [desc(icp_versions.version_num)],
        limit: 1,
      });
      const nextVersionNum =
        versions.length > 0
          ? (parseInt(versions[0].version_num) + 1).toString()
          : "1";

      await db.insert(icp_versions).values({
        org_id: orgId,
        icp_id: id,
        version_num: nextVersionNum,
        criteria: body.criteria,
        change_summary: body.changeSummary || "Updated ICP",
      });
    }

    return reply.send({ data: updated });
  });

  fastify.post("/generate", async (request, reply) => {
    // AI-assisted path
    const body = request.body as { prompt: string };

    const systemPrompt = `You are a B2B sales expert. Propose an Ideal Customer Profile (ICP) based on the provided natural language description from the user. Extract industry, location, company size, revenue, technologies, and buying signals.`;
    const userPrompt = `User description: ${body.prompt}`;

    const criteria = await generateStructured(
      "deep",
      systemPrompt,
      userPrompt,
      ICPSchema,
    );

    const personaSysPrompt = `Propose the buyer persona (titles, seniority, departments) for B2B sales to the ICP defined below:\n\n${JSON.stringify(criteria)}`;
    const persona = await generateStructured(
      "deep",
      personaSysPrompt,
      "Generate persona",
      PersonaSchema,
    );

    return reply.send({
      data: {
        criteria,
        persona,
        disqualifiers: [],
      },
    });
  });
}
