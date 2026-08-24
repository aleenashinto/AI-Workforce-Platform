import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import { integrations } from "@ai-workforce/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default async function crmRoutes(fastify: FastifyInstance) {
  // GET /crm/settings — fetch org CRM/Helpdesk config
  fastify.get("/settings", async (request, reply) => {
    const { org_id } = (request as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };
    const { category } = (request.query as any) || { category: "crm" };

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
  });

  // POST /crm/settings — upsert credentials + config
  fastify.post("/settings", async (request, reply) => {
    const { org_id } = (request as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };
    const { category, provider, credentials, config } = request.body as any;

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
          config,
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
          config,
          sync_status: "active",
        })
        .returning();
      return { success: true, data: inserted };
    }
  });

  // POST /crm/sync — trigger a sync run, update last_sync_at
  fastify.post("/sync", async (request, reply) => {
    const { org_id } = (request as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };
    const { provider } = request.body as any;

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
  });
}
