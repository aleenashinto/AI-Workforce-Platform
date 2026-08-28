import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import {
  drafts,
  draft_versions,
  leads,
  campaigns,
} from "@ai-workforce/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { Queue } from "bullmq";
import { requireAction } from "../middleware/authz";
import { generateStructured } from "@ai-workforce/llm";
import { z } from "zod";

const draftingQueue = new Queue("drafting-queue", {
  connection: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    lazyConnect: true,
    retryStrategy: () => null,
    maxRetriesPerRequest: null as any,
  },
});

export default async function draftsRoutes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { status, type, source_type } = request.query as any;

    try {
      let conditions = [eq(drafts.org_id, org_id)];
      if (status) conditions.push(eq(drafts.status, status));
      if (type) conditions.push(eq(drafts.type, type));
      if (source_type) conditions.push(eq(drafts.source_type, source_type));

      const allDrafts = await db
        .select()
        .from(drafts)
        .where(and(...conditions))
        .orderBy(desc(drafts.created_at));

      return { success: true, data: allDrafts };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch drafts" });
    }
  });

  fastify.get("/:id", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;

    if (!id || id === "undefined" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return reply.code(400).send({ error: "Invalid draft ID format" });
    }

    try {
      const draft = await db.query.drafts.findFirst({
        where: and(eq(drafts.id, id), eq(drafts.org_id, org_id)),
      });
      if (!draft) return reply.code(404).send({ error: "Draft not found" });
      return { success: true, data: draft };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch draft" });
    }
  });

  fastify.post(
    "/",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const user_id = (request.user as any)?.id;
      const body = request.body as any;

      try {
        const [newDraft] = await db
          .insert(drafts)
          .values({
            org_id,
            owner_id: user_id,
            ...body,
          })
          .returning();

        // create initial version
        await db.insert(draft_versions).values({
          org_id,
          draft_id: newDraft.id,
          version_number: 1,
          body: newDraft.body,
          subject: newDraft.subject,
          created_by: user_id,
          change_type: "manual_save",
        });

        return { success: true, data: newDraft };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to create draft" });
      }
    },
  );

  fastify.patch(
    "/:id",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const user_id = (request.user as any)?.id;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const draft = await db.query.drafts.findFirst({
          where: and(eq(drafts.id, id), eq(drafts.org_id, org_id)),
        });
        if (!draft) return reply.code(404).send({ error: "Draft not found" });

        let newVersion = draft.version_number || 1;
        if (updates.body && updates.body !== draft.body) {
          newVersion += 1;
          await db.insert(draft_versions).values({
            org_id,
            draft_id: draft.id,
            version_number: newVersion,
            body: updates.body,
            subject: updates.subject || draft.subject,
            created_by: user_id,
            change_type: updates.change_type || "manual_save",
          });
        }

        const [updatedDraft] = await db
          .update(drafts)
          .set({
            ...updates,
            version_number: newVersion,
            updated_at: new Date(),
          })
          .where(and(eq(drafts.id, id), eq(drafts.org_id, org_id)))
          .returning();

        return { success: true, data: updatedDraft };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to update draft" });
      }
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { id } = request.params as any;

      try {
        await db.delete(draft_versions).where(eq(draft_versions.draft_id, id));
        await db
          .delete(drafts)
          .where(and(eq(drafts.id, id), eq(drafts.org_id, org_id)));
        return { success: true };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to delete draft" });
      }
    },
  );

  fastify.get("/:id/versions", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;

    if (!id || id === "undefined" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return reply.code(400).send({ error: "Invalid draft ID format" });
    }

    try {
      const versions = await db
        .select()
        .from(draft_versions)
        .where(
          and(
            eq(draft_versions.draft_id, id),
            eq(draft_versions.org_id, org_id),
          ),
        )
        .orderBy(desc(draft_versions.version_number));
      return { success: true, data: versions };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch draft versions" });
    }
  });

  fastify.post(
    "/bulk-approve",
    { preHandler: requireAction("APPROVE_DRAFT") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { ids } = request.body as any;

      try {
        if (!ids || ids.length === 0) return { success: true, count: 0 };

        const result = await db
          .update(drafts)
          .set({ status: "approved", updated_at: new Date() })
          .where(and(inArray(drafts.id, ids), eq(drafts.org_id, org_id)))
          .returning();

        return {
          success: true,
          message: `Approved ${result.length} drafts`,
          count: result.length,
        };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to bulk approve drafts" });
      }
    },
  );

  fastify.post(
    "/ai/improve",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const { content, instruction } = request.body as any;
      try {
        const schema = z.object({
          rewritten_content: z.string(),
        });
        const result = await generateStructured(
          "fast",
          "You are an AI assistant that improves email drafts based on instructions.",
          `Rewrite the following content based on this instruction: "${instruction}".\n\nContent:\n${content}`,
          schema,
        );
        return { success: true, data: result.rewritten_content };
      } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ error: "AI failed to rewrite" });
      }
    },
  );

  fastify.post(
    "/generate",
    { preHandler: requireAction("MANAGE_CAMPAIGNS") },
    async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { lead_id, campaign_id } = request.body as any;

      try {
        await draftingQueue.add("generate-draft", {
          leadId: lead_id,
          campaignId: campaign_id,
          orgId: org_id,
        });
        return { success: true, message: "Drafting job enqueued" };
      } catch (error: any) {
        request.log.error(error);
        return reply
          .code(500)
          .send({ error: "Failed to enqueue draft generation" });
      }
    },
  );
}
