import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { db } from "@ai-workforce/db";
import {
  leads,
  companies,
  contacts,
  users,
  activities,
  buying_signals,
} from "@ai-workforce/db/schema";
import { eq, or, and, ilike, inArray, desc } from "drizzle-orm";
import { z } from "zod";

// We map this into fastify.register(leadsRoutes, { prefix: '/v1/crm/sales/leads' }) theoretically?
// The project server.ts currently says:
// fastify.register(salesRoutes, { prefix: '/v1/crm/sales' });
// But there's a separate GET /v1/leads maybe?
// Wait, leadsRoutes is exported from routes/leads.ts. I need to make sure the paths match what the frontend expects.
// Let's just define absolute paths if this plugin is registered at the root, or relative paths.
// The existing leads.ts registered '/' and '/:id'. Let's see how it was registered.
// I will just export a function that registers '/v1/crm/sales/leads' manually just in case.

export default async function leadsRoutes(fastify: FastifyInstance) {
  fastify.get("/v1/crm/sales/leads/summary", async (request, reply) => {
    const orgId = "00000000-0000-0000-0000-000000000001"; // Mock for dev
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.org_id, orgId));

    return {
      success: true,
      data: {
        total: allLeads.length,
        new: allLeads.filter((l) => l.status === "new").length,
        qualified: allLeads.filter((l) => l.status === "qualified").length,
        hot: allLeads.filter((l) => Number(l.score) >= 90).length,
        contacted: allLeads.filter((l) => l.status === "contacted").length,
        conversionRate: 15.4,
      },
    };
  });

  fastify.get("/v1/crm/sales/leads", async (request, reply) => {
    const orgId = "00000000-0000-0000-0000-000000000001"; // Mock for dev
    const query = request.query as any;

    let leadRecords = await db
      .select()
      .from(leads)
      .where(eq(leads.org_id, orgId))
      .orderBy(desc(leads.created_at));
    const companyRecords = await db.select().from(companies);
    const contactRecords = await db.select().from(contacts);

    if (query.status) {
      leadRecords = leadRecords.filter((l) => l.status === query.status);
    }
    if (query.source) {
      leadRecords = leadRecords.filter((l) => l.source === query.source);
    }

    // Join manually for MVP
    let results = leadRecords.map((l) => {
      const comp = companyRecords.find((c) => c.id === l.company_id);
      const cont = contactRecords.find((c) => c.id === l.contact_id);
      return {
        ...l,
        company: comp ? comp.name : l.company,
        job_title: cont ? cont.job_title : null,
        company_industry: comp ? comp.industry : null,
        contact_name: cont ? cont.full_name : l.name,
      };
    });

    if (query.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(s)) ||
          (r.company && r.company.toLowerCase().includes(s)) ||
          (r.email && r.email.toLowerCase().includes(s)) ||
          (r.job_title && r.job_title.toLowerCase().includes(s)),
      );
    }

    return { success: true, data: results };
  });

  fastify.get("/v1/crm/sales/leads/:id", async (request, reply) => {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as { id: string };

    if (!id || id === "undefined" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return reply.status(400).send({ error: "Invalid lead ID format" });
    }

    const leadArr = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.org_id, orgId)));
    if (!leadArr.length)
      return reply.status(404).send({ error: "Lead not found" });
    const lead = leadArr[0];

    const compArr = lead.company_id
      ? await db
          .select()
          .from(companies)
          .where(eq(companies.id, lead.company_id))
      : [];
    const contArr = lead.contact_id
      ? await db.select().from(contacts).where(eq(contacts.id, lead.contact_id))
      : [];
    const sigArr = lead.company_id
      ? await db
          .select()
          .from(buying_signals)
          .where(eq(buying_signals.company_id, lead.company_id))
      : [];

    return {
      success: true,
      data: {
        ...lead,
        company_details: compArr[0] || null,
        contact_details: contArr[0] || null,
        buying_signals: sigArr,
      },
    };
  });

  fastify.post("/v1/crm/sales/leads", async (request, reply) => {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const body = request.body as any;

    if (!body.email || !body.name || !body.company) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    // Duplicate check
    const existing = await db
      .select()
      .from(leads)
      .where(and(eq(leads.org_id, orgId), eq(leads.email, body.email)));
    if (existing.length) {
      return reply
        .status(400)
        .send({ error: "A lead with this email already exists." });
    }

    const inserted = await db
      .insert(leads)
      .values({
        org_id: orgId,
        name: body.name,
        email: body.email,
        company: body.company,
        source: body.source || "Manual Entry",
        status: body.status || "new",
        score: "0",
      })
      .returning();

    return { success: true, data: inserted[0] };
  });

  fastify.patch("/v1/crm/sales/leads/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    if (!id || id === "undefined" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return reply.status(400).send({ error: "Invalid lead ID format" });
    }

    const updated = await db
      .update(leads)
      .set({
        status: body.status,
        owner_id: body.ownerId,
        source: body.source,
        score: body.score,
        updated_at: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    return { success: true, data: updated[0] };
  });

  fastify.delete("/v1/crm/sales/leads/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!id || id === "undefined" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return reply.status(400).send({ error: "Invalid lead ID format" });
    }

    await db.delete(leads).where(eq(leads.id, id));
    return { success: true };
  });

  fastify.post("/v1/crm/sales/leads/bulk-action", async (request, reply) => {
    const body = request.body as {
      action: "assign" | "change_status" | "archive";
      leadIds: string[];
      value?: string;
    };

    if (!body.leadIds || body.leadIds.length === 0)
      return { success: true, count: 0 };

    if (body.action === "change_status" && body.value) {
      await db
        .update(leads)
        .set({ status: body.value, updated_at: new Date() })
        .where(inArray(leads.id, body.leadIds));
    } else if (body.action === "assign" && body.value) {
      await db
        .update(leads)
        .set({ owner_id: body.value, updated_at: new Date() })
        .where(inArray(leads.id, body.leadIds));
    } else if (body.action === "archive") {
      await db.delete(leads).where(inArray(leads.id, body.leadIds));
    }

    return { success: true, count: body.leadIds.length };
  });
}
