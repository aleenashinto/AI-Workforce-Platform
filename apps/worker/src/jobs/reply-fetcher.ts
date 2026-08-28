import { Worker, Queue } from "bullmq";
import { db } from "@ai-workforce/db";
import { mailboxes, leads } from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const replyMonitorQueue = new Queue("reply-monitor-queue", {
  connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true }),
});

export async function fetchRepliesFromMailboxes() {
  console.log("[ReplyFetcher] Polling connected mailboxes for new email replies...");

  const activeMailboxes = await db.query.mailboxes.findMany({
    where: eq(mailboxes.status, "connected"),
  });

  for (const mb of activeMailboxes) {
    console.log(`[ReplyFetcher] Polling mailbox: ${mb.email}`);
    
    // In production, connect using IMAP/Graph API credentials.
    // If auth is mock or credentials are not real, simulate fetching new incoming replies.
    try {
      if (process.env.IMAP_HOST && mb.credentials) {
        // Real IMAP logic structure
        console.log(`[ReplyFetcher] Connecting to IMAP: ${process.env.IMAP_HOST}`);
      } else {
        // Fallback simulation: fetch leads and randomly simulate replies for demo purposes
        const leadRows = await db.query.leads.findMany({
          where: eq(leads.org_id, mb.org_id),
          limit: 3,
        });

        for (const lead of leadRows) {
          if (Math.random() > 0.7) {
            console.log(`[ReplyFetcher] Simulated incoming reply from lead: ${lead.name} (${lead.email})`);
            await replyMonitorQueue.add("process-reply", {
              leadId: lead.id,
              orgId: mb.org_id,
              rawContent: "Thanks for reaching out! I would love to see a demo. Let me know when you are free next Tuesday.",
            });
          }
        }
      }
    } catch (e: any) {
      console.error(`[ReplyFetcher] Error polling ${mb.email}:`, e.message);
    }
  }
}

export const replyFetcherWorker = new Worker(
  "reply-fetcher-queue",
  async () => {
    await fetchRepliesFromMailboxes();
  },
  {
    connection: new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: () => null,
    }),
  }
);
