import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import { integrations } from "@ai-workforce/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function getOrgId(request: any): string {
  return (
    request.user?.org_id ||
    (request.headers["x-org-id"] as string) ||
    "00000000-0000-0000-0000-000000000001"
  );
}

export default async function crmRoutes(fastify: FastifyInstance) {
  // GET /crm/settings — fetch org CRM/Helpdesk config
  fastify.get("/settings", async (request, reply) => {
    const org_id = getOrgId(request);
    const { category = "crm" } = (request.query as any) || {};

    try {
      const settings = await db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.org_id, org_id),
            eq(integrations.category, category),
          ),
        );

      return { success: true, data: settings };
    } catch (err) {
      request.log.error(err);
      // Return empty array instead of 500 — page can handle no integrations gracefully
      return { success: true, data: [] };
    }
  });

  // POST /crm/settings — upsert credentials + config
  fastify.post("/settings", async (request, reply) => {
    const org_id = getOrgId(request);
    const {
      category = "crm",
      provider,
      credentials,
      config,
      field_mappings,
    } = request.body as any;

    if (!provider) {
      return reply.code(400).send({ error: "provider is required" });
    }

    try {
      const [existing] = await db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.org_id, org_id),
            eq(integrations.provider, provider),
          ),
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(integrations)
          .set({
            credentials,
            config: config ?? field_mappings ?? existing.config,
            sync_status: "active",
            updated_at: new Date(),
          })
          .where(eq(integrations.id, existing.id))
          .returning();
        return { success: true, data: updated };
      } else {
        const [inserted] = await db
          .insert(integrations)
          .values({
            id: uuidv4(),
            org_id,
            category,
            provider,
            credentials,
            config: config ?? field_mappings ?? {},
            sync_status: "active",
          })
          .returning();
        return { success: true, data: inserted };
      }
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: "Failed to save CRM settings" });
    }
  });

  // POST /crm/sync — trigger a sync run, update last_sync_at
  fastify.post("/sync", async (request, reply) => {
    const org_id = getOrgId(request);
    const { provider } = request.body as any;

    if (!provider) {
      return reply.code(400).send({ error: "provider is required" });
    }

    try {
      const [updated] = await db
        .update(integrations)
        .set({
          last_sync_at: new Date(),
          sync_status: "active",
          updated_at: new Date(),
        })
        .where(
          and(
            eq(integrations.org_id, org_id),
            eq(integrations.provider, provider),
          ),
        )
        .returning();

      return { success: true, synced_count: 0, data: updated };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: "Failed to sync" });
    }
  });
}
