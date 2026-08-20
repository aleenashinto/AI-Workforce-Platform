import { Worker, Job } from "bullmq";
import { db } from "@ai-workforce/db";
import {
  replies,
  leads,
} from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";
import { generateStructured } from "@ai-workforce/llm";
import { z } from "zod";

const replyClassificationSchema = z.object({
  category: z.enum([
    "interested",
    "not_now",
    "not_interested",
    "wrong_person",
    "unsubscribe",
    "out_of_office",
    "auto_reply",
    "bounce",
  ]),
  summary: z.string(),
  referredTo: z.string().optional(),
});

export const replyMonitorWorker = new Worker(
  "reply-monitor-queue",
  async (job: Job) => {
    const {
      leadId,
      rawContent,
      orgId,
    } = job.data;

    if (!leadId || !rawContent || !orgId) {
      throw new Error(
        "reply-monitor job requires leadId, rawContent, and orgId"
      );
    }

    console.log(
      `Classifying reply for lead ${leadId}...`
    );

    const classification = await generateStructured(
      "fast",
      "You are an AI assistant.",
      `Classify the following email reply.\n\nEmail reply:\n"${rawContent}"\n\nReturn the appropriate category, a short summary, and the referred person if the sender indicates that another person should be contacted.`,
      replyClassificationSchema
    );

    const {
      category,
      summary,
      referredTo,
    } = classification;

    await db.insert(replies).values({
      org_id: orgId,
      lead_id: leadId,
      classification: category,
      content: rawContent,
      status: "new",
    });

    console.log(
      `Reply classified as "${category}" for lead ${leadId}.`
    );

    if (
      ["interested", "unsubscribe", "bounce"].includes(
        category
      )
    ) {
      await db
        .update(leads)
        .set({
          status:
            category === "interested"
              ? "contacted"
              : "suppressed",
        })
        .where(eq(leads.id, leadId));

      console.log(
        `Lead ${leadId} status updated because of reply classification.`
      );
    }

    return {
      leadId,
      category,
      summary,
      referredTo,
    };
  },
  {
    connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null }),
    concurrency: 5,
  }
);

replyMonitorWorker.on("completed", (job) => {
  console.log(
    `Reply monitor job ${job.id} completed.`
  );
});

replyMonitorWorker.on("failed", (job, error) => {
  console.error(
    `Reply monitor job ${job?.id ?? "unknown"} failed:`,
    error
  );
});

replyMonitorWorker.on("error", (error) => {
  if (String(error).includes('ECONNREFUSED')) return;
  console.error(
    "Reply monitor worker error:",
    error
  );
});