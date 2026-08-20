import { Worker, Job } from "bullmq";
import { db } from "@ai-workforce/db";
import {
  drafts,
  outreach_events,
  leads,
} from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";

export const sequenceSchedulerWorker = new Worker(
  "sequence-scheduler",
  async (job: Job) => {
    console.log(
      `Running sequence scheduler for job ${job.id}...`
    );

    // Find approved drafts that are ready to send.
    const readyDrafts = await db.query.drafts.findMany({
      where: eq(drafts.status, "approved"),
    });

    console.log(
      `Found ${readyDrafts.length} approved drafts.`
    );

    for (const draft of readyDrafts) {
      const lead = await db.query.leads.findFirst({
        where: eq(leads.id, draft.lead_id),
      });

      if (!lead) {
        console.log(
          `Lead not found for draft ${draft.id}. Skipping.`
        );
        continue;
      }

      // Check suppression/bounce status before sending.
      if (
        lead.status === "suppressed" ||
        lead.status === "bounced"
      ) {
        console.log(
          `Skipping lead ${lead.id} - status is ${lead.status}`
        );
        continue;
      }

      console.log(
        `Sending email to ${lead.email}: ${draft.subject}`
      );

      // Mock email sending.
      // Real email provider integration can be added later.

      // Create outreach event.
      await db.insert(outreach_events).values({
        lead_id: draft.lead_id,
        campaign_id: draft.campaign_id,
        type: "email",
        content: draft.body || "",
        status: "sent",
      });

      // Update draft status.
      await db
        .update(drafts)
        .set({
          status: "sent",
        })
        .where(eq(drafts.id, draft.id));

      console.log(
        `Draft ${draft.id} marked as sent.`
      );
    }

    return {
      processed: readyDrafts.length,
    };
  },
  {
    connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null }),
  }
);

sequenceSchedulerWorker.on("completed", (job) => {
  console.log(
    `Sequence scheduler job ${job.id} completed.`
  );
});

sequenceSchedulerWorker.on("failed", (job, error) => {
  console.error(
    `Sequence scheduler job ${job?.id ?? "unknown"} failed:`,
    error
  );
});

sequenceSchedulerWorker.on("error", (error) => {
  if (String(error).includes('ECONNREFUSED')) return;
  console.error(
    "Sequence scheduler worker error:",
    error
  );
});