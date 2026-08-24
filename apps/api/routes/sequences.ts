import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import {
  sequences,
  sequence_steps,
  sequence_enrollments,
  leads,
  drafts,
} from "@ai-workforce/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Queue } from "bullmq";
import { requireAction } from "../middleware/authz";
import { generateStructured } from "@ai-workforce/llm";
import { z } from "zod";

const sequenceQueue = new Queue("sequence-queue", {
  connection: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    lazyConnect: true,
    retryStrategy: () => null,
    maxRetriesPerRequest: null as any,
  },
});

export default async function sequencesRoutes(fastify: FastifyInstance) {
  // GET all sequences
  fastify.get("/", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    try {
      const allSequences = await db
        .select()
        .from(sequences)
        .where(eq(sequences.org_id, org_id))
        .orderBy(desc(sequences.created_at));

      // Calculate stats for each
      const sequencesWithStats = await Promise.all(
        allSequences.map(async (seq) => {
          const enrollments = await db
            .select({ count: sql<number>`count(*)` })
            .from(sequence_enrollments)
            .where(eq(sequence_enrollments.sequence_id, seq.id));
          const active = await db
            .select({ count: sql<number>`count(*)` })
            .from(sequence_enrollments)
            .where(
              and(
                eq(sequence_enrollments.sequence_id, seq.id),
                eq(sequence_enrollments.status, "active"),
              ),
            );
          const completed = await db
            .select({ count: sql<number>`count(*)` })
            .from(sequence_enrollments)
            .where(
              and(
                eq(sequence_enrollments.sequence_id, seq.id),
                eq(sequence_enrollments.status, "completed"),
              ),
            );
          const replied = await db
            .select({ count: sql<number>`count(*)` })
            .from(sequence_enrollments)
            .where(
              and(
                eq(sequence_enrollments.sequence_id, seq.id),
                eq(sequence_enrollments.status, "replied"),
              ),
            );

          const enrolledCount = Number(enrollments[0]?.count || 0);
          const repliedCount = Number(replied[0]?.count || 0);
          const replyRate =
            enrolledCount > 0 ? (repliedCount / enrolledCount) * 100 : 0;

          return {
            ...seq,
            stats: {
              enrolled: enrolledCount,
              active: Number(active[0]?.count || 0),
              completed: Number(completed[0]?.count || 0),
              replied: repliedCount,
              reply_rate: replyRate.toFixed(1),
            },
          };
        }),
      );

      return { success: true, data: sequencesWithStats };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch sequences" });
    }
  });

  // GET single sequence by ID
  fastify.get("/:id", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;

    try {
      const [sequence] = await db
        .select()
        .from(sequences)
        .where(and(eq(sequences.id, id), eq(sequences.org_id, org_id)))
        .limit(1);
      if (!sequence)
        return reply.code(404).send({ error: "Sequence not found" });

      const steps = await db
        .select()
        .from(sequence_steps)
        .where(eq(sequence_steps.sequence_id, id))
        .orderBy(sequence_steps.day_offset);

      const enrollmentsResult = await db
        .select({
          enrollment: sequence_enrollments,
          lead: leads,
        })
        .from(sequence_enrollments)
        .innerJoin(leads, eq(sequence_enrollments.lead_id, leads.id))
        .where(eq(sequence_enrollments.sequence_id, id))
        .orderBy(desc(sequence_enrollments.created_at))
        .limit(50);

      const enrollments = enrollmentsResult.map((e) => ({
        ...e.enrollment,
        lead_name:
          `${e.lead.first_name || ""} ${e.lead.last_name || ""}`.trim(),
        lead_company: e.lead.company || "",
        lead_email: e.lead.email,
      }));

      const enrolledCount = enrollments.length; // Approximate for demo
      const activeCount = enrollments.filter(
        (e) => e.status === "active",
      ).length;
      const completedCount = enrollments.filter(
        (e) => e.status === "completed",
      ).length;
      const repliedCount = enrollments.filter(
        (e) => e.status === "replied",
      ).length;

      return {
        success: true,
        data: {
          ...sequence,
          steps,
          enrollments,
          stats: {
            enrolled: enrolledCount,
            active: activeCount,
            completed: completedCount,
            replied: repliedCount,
            reply_rate:
              enrolledCount > 0
                ? ((repliedCount / enrolledCount) * 100).toFixed(1)
                : 0,
            meeting_rate: "0.0",
          },
        },
      };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch sequence" });
    }
  });

  // POST create sequence
  fastify.post(
    "/",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { name, description, goal, tags, settings, steps } =
        request.body as any;

      try {
        const sequenceId = uuidv4();
        const [newSequence] = await db
          .insert(sequences)
          .values({
            id: sequenceId,
            org_id,
            name: name || "Untitled Sequence",
            description: description || null,
            goal: goal || null,
            tags: tags || [],
            settings: settings || {},
            status: "draft",
          })
          .returning();

        if (steps && steps.length > 0) {
          const stepsToInsert = steps.map((s: any) => ({
            id: uuidv4(),
            sequence_id: sequenceId,
            day_offset: s.day_offset || 0,
            name: s.name || "Step",
            type: s.type || "email",
            channel: s.channel || "email",
            template: s.template || "",
            stop_conditions: s.stop_conditions || {},
          }));
          await db.insert(sequence_steps).values(stepsToInsert);
        }

        return { success: true, data: newSequence };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to create sequence" });
      }
    },
  );

  // PATCH update sequence status
  fastify.patch(
    "/:id/status",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const [updatedSequence] = await db
          .update(sequences)
          .set({ status })
          .where(and(eq(sequences.id, id), eq(sequences.org_id, org_id)))
          .returning();

        return { success: true, data: updatedSequence };
      } catch (error: any) {
        request.log.error(error);
        return reply
          .code(500)
          .send({ error: "Failed to update sequence status" });
      }
    },
  );

  // POST enroll leads
  fastify.post(
    "/:id/enroll",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { id } = request.params as any;
      const { lead_ids } = request.body as any;

      if (!lead_ids || !Array.isArray(lead_ids)) {
        return reply.code(400).send({ error: "lead_ids must be an array" });
      }

      try {
        const [sequence] = await db
          .select()
          .from(sequences)
          .where(and(eq(sequences.id, id), eq(sequences.org_id, org_id)))
          .limit(1);
        if (!sequence)
          return reply.code(404).send({ error: "Sequence not found" });

        let enrolled = 0;
        let skipped = 0;

        for (const leadId of lead_ids) {
          // Check if lead exists and is valid
          const [lead] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, leadId))
            .limit(1);
          if (
            !lead ||
            lead.status === "suppressed" ||
            lead.status === "bounced"
          ) {
            skipped++;
            continue;
          }

          // Check if already enrolled
          const [existing] = await db
            .select()
            .from(sequence_enrollments)
            .where(
              and(
                eq(sequence_enrollments.sequence_id, id),
                eq(sequence_enrollments.lead_id, leadId),
              ),
            )
            .limit(1);

          if (existing) {
            skipped++;
            continue;
          }

          // Enroll
          const enrollmentId = uuidv4();
          await db.insert(sequence_enrollments).values({
            id: enrollmentId,
            org_id,
            sequence_id: id,
            lead_id: leadId,
            status: "active",
            current_step: 0,
            next_action_at: new Date(), // execute first step immediately
          });

          // Enqueue action
          await sequenceQueue.add("execute-step", {
            enrollmentId,
            sequenceId: id,
            orgId: org_id,
          });
          enrolled++;
        }

        return {
          success: true,
          message: `Enrolled ${enrolled} leads. Skipped ${skipped} leads.`,
        };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to enroll leads" });
      }
    },
  );

  // POST generate AI sequence
  fastify.post(
    "/ai/generate",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const { prompt } = request.body as any;

      try {
        const result = await generateStructured(
          `You are an expert sales automation architect. Generate a sales sequence based on the user's prompt: ${prompt}`,
          z.object({
            name: z.string(),
            description: z.string(),
            goal: z.string(),
            steps: z.array(
              z.object({
                name: z.string(),
                type: z.enum([
                  "email",
                  "ai_email",
                  "wait",
                  "call_task",
                  "manual_task",
                ]),
                day_offset: z.number(),
                template: z
                  .string()
                  .describe(
                    "For emails, provide a subject line followed by a newline and the body text. For tasks, provide the instructions.",
                  ),
              }),
            ),
          }),
        );
        return { success: true, data: result };
      } catch (e: any) {
        request.log.error(e);
        return reply.code(500).send({ error: "Failed to generate sequence" });
      }
    },
  );
}
