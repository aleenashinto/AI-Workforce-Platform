import { FastifyInstance } from "fastify";
import { db } from "@ai-workforce/db";
import {
  mailboxes,
  mailbox_activities,
  sequences,
} from "@ai-workforce/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { requireAction } from "../middleware/authz";

export default async function mailboxesRoutes(fastify: FastifyInstance) {
  // GET all mailboxes
  fastify.get("/", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";

    try {
      const allMailboxes = await db
        .select()
        .from(mailboxes)
        .where(eq(mailboxes.org_id, org_id));

      // Calculate aggregate stats for each mailbox
      const mailboxesWithStats = await Promise.all(
        allMailboxes.map(async (mb) => {
          const assignedSequences = await db
            .select({ count: sql<number>`count(*)` })
            .from(sequences)
            .where(eq(sequences.mailbox_id, mb.id));

          const sentToday = await db
            .select({ count: sql<number>`count(*)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "sent"),
                sql`created_at >= date_trunc('day', now())`,
              ),
            );

          const totalSent = await db
            .select({ count: sql<number>`count(*)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "sent"),
              ),
            );

          const totalReplied = await db
            .select({ count: sql<number>`count(*)` })
            .from(mailbox_activities)
            .where(
              and(
                eq(mailbox_activities.mailbox_id, mb.id),
                eq(mailbox_activities.event_type, "replied"),
              ),
            );

          const tSent = Number(totalSent[0]?.count || 0);
          const tReplied = Number(totalReplied[0]?.count || 0);
          const replyRate = tSent > 0 ? (tReplied / tSent) * 100 : 0;

          return {
            ...mb,
            stats: {
              sequences: Number(assignedSequences[0]?.count || 0),
              used_today: Number(sentToday[0]?.count || 0),
              reply_rate: replyRate.toFixed(1),
            },
          };
        }),
      );

      return { success: true, data: mailboxesWithStats };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch mailboxes" });
    }
  });

  // GET mailbox by ID
  fastify.get("/:id", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;

    try {
      const [mailbox] = await db
        .select()
        .from(mailboxes)
        .where(and(eq(mailboxes.id, id), eq(mailboxes.org_id, org_id)))
        .limit(1);
      if (!mailbox) return reply.code(404).send({ error: "Mailbox not found" });

      const assignedSequencesList = await db
        .select()
        .from(sequences)
        .where(eq(sequences.mailbox_id, id));

      // Basic mock health/stats check
      const sentToday = await db
        .select({ count: sql<number>`count(*)` })
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.mailbox_id, id),
            eq(mailbox_activities.event_type, "sent"),
            sql`created_at >= date_trunc('day', now())`,
          ),
        );

      return {
        success: true,
        data: {
          ...mailbox,
          assigned_sequences: assignedSequencesList,
          stats: {
            used_today: Number(sentToday[0]?.count || 0),
            remaining_today:
              Number(mailbox.daily_cap || 0) - Number(sentToday[0]?.count || 0),
          },
        },
      };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to fetch mailbox" });
    }
  });

  // POST connect mailbox
  fastify.post("/connect", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { provider, email, display_name } = request.body as any;

    try {
      const encryptedCreds = Buffer.from(
        "mocked_oauth_token_" + Date.now(),
      ).toString("base64");

      const [newMailbox] = await db
        .insert(mailboxes)
        .values({
          id: uuidv4(),
          org_id,
          provider,
          email,
          display_name: display_name || email,
          credentials: encryptedCreds,
          status: "connected",
          daily_cap: "150",
          warmup_stage: "0",
          health_score: "100",
          metrics: { bounces: 0, complaints: 0, opens: 0 },
          timezone: "UTC",
          working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          working_hours: { start: "09:00", end: "17:00" },
          tracking_settings: { opens: true, clicks: true },
        })
        .returning();

      return { success: true, data: newMailbox };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to connect mailbox" });
    }
  });

  // PATCH mailbox settings/status
  fastify.patch("/:id", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;
    const updates = request.body as any;

    try {
      const [updatedMailbox] = await db
        .update(mailboxes)
        .set({ ...updates, updated_at: new Date() })
        .where(and(eq(mailboxes.id, id), eq(mailboxes.org_id, org_id)))
        .returning();

      return { success: true, data: updatedMailbox };
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: "Failed to update mailbox" });
    }
  });

  // POST send test email
  fastify.post("/:id/test", async (request, reply) => {
      const org_id =
        (request.user as any)?.org_id ||
        (request.headers["x-org-id"] as string) ||
        "00000000-0000-0000-0000-000000000001";
      const { id } = request.params as any;
      const { to, subject, message } = request.body as any;

      try {
        const [mailbox] = await db
          .select()
          .from(mailboxes)
          .where(and(eq(mailboxes.id, id), eq(mailboxes.org_id, org_id)))
          .limit(1);
        if (!mailbox)
          return reply.code(404).send({ error: "Mailbox not found" });
        if (mailbox.status !== "connected" && mailbox.status !== "healthy") {
          return reply.code(400).send({ error: "Mailbox is not connected" });
        }

        // Simulate sending by recording to activities
        const eventId = uuidv4();
        await db.insert(mailbox_activities).values({
          id: eventId,
          org_id,
          mailbox_id: id,
          event_type: "sent",
          metadata: {
            to,
            subject,
            test: true,
            message_preview: message?.substring(0, 50),
          },
        });

        return { success: true, message: "Test email sent successfully" };
      } catch (error: any) {
        request.log.error(error);
        return reply.code(500).send({ error: "Failed to send test email" });
      }
  });

  // GET mailbox activity timeline
  fastify.get("/:id/activity", async (request, reply) => {
    const org_id =
      (request.user as any)?.org_id ||
      (request.headers["x-org-id"] as string) ||
      "00000000-0000-0000-0000-000000000001";
    const { id } = request.params as any;

    try {
      const activities = await db
        .select()
        .from(mailbox_activities)
        .where(
          and(
            eq(mailbox_activities.mailbox_id, id),
            eq(mailbox_activities.org_id, org_id),
          ),
        )
        .orderBy(desc(mailbox_activities.created_at))
        .limit(50);

      return { success: true, data: activities };
    } catch (error: any) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: "Failed to fetch mailbox activity" });
    }
  });
}
