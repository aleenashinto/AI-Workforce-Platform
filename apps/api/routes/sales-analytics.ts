import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import {
  leads,
  mailbox_activities,
  meetings,
  opportunities,
  sequences,
  sequence_enrollments,
  mailboxes,
} from "@ai-workforce/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

// Helper: returns a Date that is `days` ago from now
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// Helper: extract org_id from the request
function getOrgId(request: any): string {
  return (
    request.user?.org_id ||
    (request.headers["x-org-id"] as string) ||
    "00000000-0000-0000-0000-000000000001"
  );
}

// Helper: authenticate (soft — fall back to dev mock user)
async function softAuth(request: any, reply: any): Promise<boolean> {
  try {
    await request.jwtVerify();
  } catch (_) {
    if (!(request as any).user) {
      reply.status(401).send({ error: "Unauthorized" });
      return false;
    }
  }
  return true;
}

export default async function salesAnalyticsRoutes(fastify: FastifyInstance) {
  // ─── GET / — Overview KPIs ───────────────────────────────────────────────
  fastify.get("/", async (request, reply) => {
    if (!(await softAuth(request, reply))) return;
    const org_id = getOrgId(request);
    const { days = "30" } = request.query as { days?: string };
    const since = daysAgo(Number(days));

    try {
      // Total leads in window
      const [totalLeadsRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(leads)
        .where(and(eq(leads.org_id, org_id), gte(leads.created_at, since)));
      const totalLeads = totalLeadsRes?.count ?? 0;

      // Qualified leads
      const [qualifiedRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(leads)
        .where(
          and(
            eq(leads.org_id, org_id),
            eq(leads.status, "qualified"),
            gte(leads.created_at, since),
          ),
        );
      const qualified = qualifiedRes?.count ?? 0;

      // Contacted leads (leads that had a 'sent' activity)
      const [contactedRes] = await db
        .select({
          count: sql<number>`cast(count(distinct ${mailbox_activities.lead_id}) as integer)`,
        })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "sent"),
            gte(mailbox_activities.created_at, since),
          ),
        );
      const contacted = contactedRes?.count ?? 0;

      // Replied leads
      const [repliedRes] = await db
        .select({
          count: sql<number>`cast(count(distinct ${mailbox_activities.lead_id}) as integer)`,
        })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "replied"),
            gte(mailbox_activities.created_at, since),
          ),
        );
      const replied = repliedRes?.count ?? 0;

      // Total emails sent
      const [emailsSentRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "sent"),
            gte(mailbox_activities.created_at, since),
          ),
        );
      const emailsSent = emailsSentRes?.count ?? 0;

      // Meetings booked
      const [meetingsRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(meetings)
        .where(
          and(
            eq(meetings.org_id, org_id),
            gte(meetings.created_at, since),
          ),
        );
      const meetingsBooked = meetingsRes?.count ?? 0;

      // Pipeline value (sum of non-lost opportunities)
      const [pipelineRes] = await db
        .select({
          total: sql<number>`cast(coalesce(sum(cast(${opportunities.value} as numeric)), 0) as numeric)`,
        })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.org_id, org_id),
            gte(opportunities.created_at, since),
          ),
        );
      const pipelineValue = Number(pipelineRes?.total ?? 0);

      // Win rate: won / (won + lost) opportunities
      const [wonRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.org_id, org_id),
            eq(opportunities.stage, "Won"),
            gte(opportunities.created_at, since),
          ),
        );
      const [lostRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.org_id, org_id),
            eq(opportunities.stage, "Lost"),
            gte(opportunities.created_at, since),
          ),
        );
      const won = wonRes?.count ?? 0;
      const lost = lostRes?.count ?? 0;
      const winRate =
        won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

      const replyRate =
        emailsSent > 0 ? Math.round((replied / emailsSent) * 1000) / 10 : 0;

      return reply.send({
        success: true,
        data: {
          totalLeads,
          qualified,
          contacted,
          replied,
          emailsSent,
          meetingsBooked,
          pipelineValue,
          winRate,
          replyRate,
          days: Number(days),
        },
      });
    } catch (err) {
      request.log.error(err);
      return reply
        .status(500)
        .send({ error: "Failed to compute analytics overview" });
    }
  });

  // ─── GET /funnel — Count per funnel stage ────────────────────────────────
  fastify.get("/funnel", async (request, reply) => {
    if (!(await softAuth(request, reply))) return;
    const org_id = getOrgId(request);
    const { days = "30" } = request.query as { days?: string };
    const since = daysAgo(Number(days));

    try {
      const [totalLeadsRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(leads)
        .where(and(eq(leads.org_id, org_id), gte(leads.created_at, since)));

      const [qualifiedRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(leads)
        .where(
          and(
            eq(leads.org_id, org_id),
            eq(leads.status, "qualified"),
            gte(leads.created_at, since),
          ),
        );

      const [contactedRes] = await db
        .select({
          count: sql<number>`cast(count(distinct ${mailbox_activities.lead_id}) as integer)`,
        })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "sent"),
            gte(mailbox_activities.created_at, since),
          ),
        );

      const [repliedRes] = await db
        .select({
          count: sql<number>`cast(count(distinct ${mailbox_activities.lead_id}) as integer)`,
        })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "replied"),
            gte(mailbox_activities.created_at, since),
          ),
        );

      const [meetingsRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(meetings)
        .where(
          and(eq(meetings.org_id, org_id), gte(meetings.created_at, since)),
        );

      const [opportunitiesRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.org_id, org_id),
            gte(opportunities.created_at, since),
          ),
        );

      const [wonRes] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.org_id, org_id),
            eq(opportunities.stage, "Won"),
            gte(opportunities.created_at, since),
          ),
        );

      const total = totalLeadsRes?.count ?? 0;
      const qualified = qualifiedRes?.count ?? 0;
      const contacted = contactedRes?.count ?? 0;
      const replied = repliedRes?.count ?? 0;
      const meetingsCount = meetingsRes?.count ?? 0;
      const opps = opportunitiesRes?.count ?? 0;
      const wonCount = wonRes?.count ?? 0;

      const pct = (n: number) =>
        total > 0 ? Math.round((n / total) * 100) : 0;

      const funnel = [
        { stage: "All Leads", count: total, pct: 100 },
        { stage: "Qualified", count: qualified, pct: pct(qualified) },
        { stage: "Contacted", count: contacted, pct: pct(contacted) },
        { stage: "Replied", count: replied, pct: pct(replied) },
        { stage: "Meetings", count: meetingsCount, pct: pct(meetingsCount) },
        { stage: "Opportunities", count: opps, pct: pct(opps) },
        { stage: "Won", count: wonCount, pct: pct(wonCount) },
      ];

      return reply.send({ success: true, data: funnel });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to compute funnel" });
    }
  });

  // ─── GET /outreach — Daily email sent/replied (30d default) ─────────────
  fastify.get("/outreach", async (request, reply) => {
    if (!(await softAuth(request, reply))) return;
    const org_id = getOrgId(request);
    const { days = "30" } = request.query as { days?: string };
    const since = daysAgo(Number(days));

    try {
      const sentRows = await db
        .select({
          date: sql<string>`to_char(${mailbox_activities.created_at}, 'YYYY-MM-DD')`,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "sent"),
            gte(mailbox_activities.created_at, since),
          ),
        )
        .groupBy(
          sql`to_char(${mailbox_activities.created_at}, 'YYYY-MM-DD')`,
        )
        .orderBy(
          sql`to_char(${mailbox_activities.created_at}, 'YYYY-MM-DD')`,
        );

      const repliedRows = await db
        .select({
          date: sql<string>`to_char(${mailbox_activities.created_at}, 'YYYY-MM-DD')`,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.org_id, org_id),
            eq(mailbox_activities.event_type, "replied"),
            gte(mailbox_activities.created_at, since),
          ),
        )
        .groupBy(
          sql`to_char(${mailbox_activities.created_at}, 'YYYY-MM-DD')`,
        )
        .orderBy(
          sql`to_char(${mailbox_activities.created_at}, 'YYYY-MM-DD')`,
        );

      // Merge into a date-keyed map
      const dateMap: Record<string, { sent: number; replied: number }> = {};
      for (const r of sentRows) {
        if (!dateMap[r.date]) dateMap[r.date] = { sent: 0, replied: 0 };
        dateMap[r.date].sent = r.count;
      }
      for (const r of repliedRows) {
        if (!dateMap[r.date]) dateMap[r.date] = { sent: 0, replied: 0 };
        dateMap[r.date].replied = r.count;
      }

      const data = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({ date, ...vals }));

      return reply.send({ success: true, data });
    } catch (err) {
      request.log.error(err);
      return reply
        .status(500)
        .send({ error: "Failed to compute outreach trend" });
    }
  });

  // ─── GET /sequences — Per-sequence stats ─────────────────────────────────
  fastify.get("/sequences", async (request, reply) => {
    if (!(await softAuth(request, reply))) return;
    const org_id = getOrgId(request);
    const { days = "30" } = request.query as { days?: string };
    const since = daysAgo(Number(days));

    try {
      const seqs = await db
        .select({ id: sequences.id, name: sequences.name, status: sequences.status })
        .from(sequences)
        .where(eq(sequences.org_id, org_id));

      const results = await Promise.all(
        seqs.map(async (seq) => {
          const [enrolledRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(sequence_enrollments)
            .where(
              and(
                eq(sequence_enrollments.org_id, org_id),
                eq(sequence_enrollments.sequence_id, seq.id),
              ),
            );

          const [sentRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.org_id, org_id),
                eq(mailbox_activities.sequence_id, seq.id),
                eq(mailbox_activities.event_type, "sent"),
                gte(mailbox_activities.created_at, since),
              ),
            );

          const [repliedRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.org_id, org_id),
                eq(mailbox_activities.sequence_id, seq.id),
                eq(mailbox_activities.event_type, "replied"),
                gte(mailbox_activities.created_at, since),
              ),
            );

          const enrolled = enrolledRes?.count ?? 0;
          const sent = sentRes?.count ?? 0;
          const replied = repliedRes?.count ?? 0;
          const replyRate =
            sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0;

          return {
            id: seq.id,
            name: seq.name,
            status: seq.status,
            enrolled,
            sent,
            replied,
            replyRate,
            meetings: 0, // placeholder — could join meetings by lead_id
          };
        }),
      );

      return reply.send({ success: true, data: results });
    } catch (err) {
      request.log.error(err);
      return reply
        .status(500)
        .send({ error: "Failed to compute sequence stats" });
    }
  });

  // ─── GET /mailboxes — Per-mailbox stats ──────────────────────────────────
  fastify.get("/mailboxes", async (request, reply) => {
    if (!(await softAuth(request, reply))) return;
    const org_id = getOrgId(request);
    const { days = "30" } = request.query as { days?: string };
    const since = daysAgo(Number(days));

    try {
      const mbs = await db
        .select({
          id: mailboxes.id,
          email: mailboxes.email,
          display_name: mailboxes.display_name,
          status: mailboxes.status,
          health_score: mailboxes.health_score,
        })
        .from(mailboxes)
        .where(eq(mailboxes.org_id, org_id));

      const results = await Promise.all(
        mbs.map(async (mb) => {
          const [sentRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.org_id, org_id),
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "sent"),
                gte(mailbox_activities.created_at, since),
              ),
            );

          const [deliveredRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.org_id, org_id),
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "delivered"),
                gte(mailbox_activities.created_at, since),
              ),
            );

          const [repliedRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.org_id, org_id),
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "replied"),
                gte(mailbox_activities.created_at, since),
              ),
            );

          const [bouncedRes] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.org_id, org_id),
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "bounced"),
                gte(mailbox_activities.created_at, since),
              ),
            );

          const sent = sentRes?.count ?? 0;
          const delivered = deliveredRes?.count ?? 0;
          const replied = repliedRes?.count ?? 0;
          const bounced = bouncedRes?.count ?? 0;
          const replyRate =
            sent > 0 ? Math.round((replied / sent) * 1000) / 10 : 0;

          return {
            id: mb.id,
            email: mb.email,
            displayName: mb.display_name,
            status: mb.status,
            healthScore: Number(mb.health_score ?? 0),
            sent,
            delivered,
            replied,
            bounced,
            replyRate,
          };
        }),
      );

      return reply.send({ success: true, data: results });
    } catch (err) {
      request.log.error(err);
      return reply
        .status(500)
        .send({ error: "Failed to compute mailbox stats" });
    }
  });
}
