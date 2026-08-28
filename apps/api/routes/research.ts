import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import { research_projects } from "@ai-workforce/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateStructured } from "@ai-workforce/llm";
import { z } from "zod";

export default async function researchRoutes(fastify: FastifyInstance) {
  const mockOrgId = "00000000-0000-0000-0000-000000000001"; // Mock tenant

  fastify.get("/", async (request, reply) => {
    const records = await db
      .select()
      .from(research_projects)
      .where(eq(research_projects.org_id, mockOrgId))
      .orderBy(desc(research_projects.created_at));
    return { success: true, data: records };
  });

  fastify.get("/summary", async (request, reply) => {
    const records = await db
      .select()
      .from(research_projects)
      .where(eq(research_projects.org_id, mockOrgId));
    return {
      success: true,
      data: {
        total: records.length,
        active: records.filter(
          (r) =>
            r.status === "planning" ||
            r.status === "searching" ||
            r.status === "analyzing",
        ).length,
        completed: records.filter((r) => r.status === "completed").length,
      },
    };
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const records = await db
      .select()
      .from(research_projects)
      .where(eq(research_projects.id, id));
    if (!records.length) return reply.status(404).send({ error: "Not found" });
    return { success: true, data: records[0] };
  });

  fastify.post("/", async (request, reply) => {
    const body = request.body as any;
    const inserted = await db
      .insert(research_projects)
      .values({
        org_id: mockOrgId,
        title: body.title,
        question: body.question,
        objective: body.objective,
        type: body.type,
        depth: body.depth,
        status: "planning",
        payload: {},
      })
      .returning();
    return { success: true, data: inserted[0] };
  });

  fastify.post("/:id/execute", async (request, reply) => {
    const { id } = request.params as { id: string };

    // Set to searching
    await db
      .update(research_projects)
      .set({ status: "searching" })
      .where(eq(research_projects.id, id));

    const records = await db
      .select()
      .from(research_projects)
      .where(eq(research_projects.id, id));
    if (!records.length) return reply.status(404).send({ error: "Not found" });
    const project = records[0];

    // Mock an AI pipeline using llm
    const schema = z.object({
      plan: z.object({ queries: z.array(z.string()) }),
      sources: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          url: z.string(),
          domain: z.string(),
          type: z.string(),
          relevanceScore: z.number(),
          publishedAt: z.string(),
        }),
      ),
      findings: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string(),
          confidence: z.string(),
          sourceIds: z.array(z.string()),
        }),
      ),
      evidence: z.array(
        z.object({
          id: z.string(),
          claim: z.string(),
          evidence: z.string(),
          sourceId: z.string(),
          confidence: z.string(),
        }),
      ),
      conflicts: z.array(
        z.object({
          claim: z.string(),
          sourceA: z.string(),
          sourceB: z.string(),
          difference: z.string(),
          explanation: z.string(),
        }),
      ),
      recommendations: z.array(
        z.object({
          title: z.string(),
          reason: z.string(),
          impact: z.string(),
          priority: z.string(),
        }),
      ),
      report: z.object({
        executiveSummary: z.string(),
        methodology: z.string(),
        limitations: z.string(),
      }),
    });

    try {
      const generated = await generateStructured(
        "deep",
        "You are an AI research assistant. Generate a highly realistic, extremely detailed research payload based on the user's question.",
        "Question: " + project.question,
        schema,
      );

      // Append DEMO DATA to sources to satisfy requirements
      generated.sources = generated.sources.map((s) => ({
        ...s,
        title: "[DEMO DATA] " + s.title,
      }));

      // Update project
      await db
        .update(research_projects)
        .set({
          status: "completed",
          payload: generated,
        })
        .where(eq(research_projects.id, id));

      return { success: true };
    } catch (e) {
      await db
        .update(research_projects)
        .set({ status: "failed" })
        .where(eq(research_projects.id, id));
      return reply
        .status(500)
        .send({ error: "Research failed", details: (e as any).message });
    }
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.delete(research_projects).where(eq(research_projects.id, id));
    return { success: true };
  });
}
