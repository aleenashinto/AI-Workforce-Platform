import { Worker, Job } from 'bullmq';
import { db } from '@ai-workforce/db';
import { drafts, mailboxes, outreach_events } from '@ai-workforce/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { randomInt } from 'crypto';

export const emailSenderWorker = new Worker('email-send-queue', async (job: Job) => {
  const { draftId, orgId } = job.data;

  // Simulate picking a mailbox
  const mailbox = await db.query.mailboxes.findFirst({
    where: and(eq(mailboxes.org_id, orgId), eq(mailboxes.status, 'active'))
  });

  if (!mailbox) {
    throw new Error('No active mailboxes available');
  }

  const draft = await db.query.drafts.findFirst({
    where: and(eq(drafts.id, draftId), eq(drafts.status, 'approved'))
  });

  if (!draft) {
    return; // Already sent or not approved
  }

  // Simulate business hours and delays
  const currentHour = new Date().getHours();
  if (currentHour < 9 || currentHour >= 18) {
    // Re-queue for next day (simplified)
    throw new Error('Outside business hours');
  }

  // Random delay between 90s to 300s
  const delayMs = randomInt(90, 300) * 1000;
  await new Promise(resolve => setTimeout(resolve, delayMs));

  // Simulate send
  await db.update(drafts)
    .set({ status: 'sent', updated_at: new Date() })
    .where(eq(drafts.id, draftId));
  
  await db.insert(outreach_events).values({
    lead_id: draft.lead_id,
    campaign_id: draft.campaign_id || sql`uuid_generate_v4()`, // Fake campaign for now if null
    type: 'email',
    content: draft.body || '',
    status: 'sent'
  });

  // Update health score if we randomly simulate a bounce
  if (Math.random() < 0.05) { // 5% chance to bounce for testing
    const currentMetrics = (mailbox.metrics as any) || { bounces: 0, complaints: 0, opens: 0 };
    currentMetrics.bounces += 1;
    
    let newStatus = mailbox.status;
    // Check if bounce rate > 3% (simplified check assuming 100 sends)
    if (currentMetrics.bounces > 3) {
      newStatus = 'paused';
    }

    await db.update(mailboxes)
      .set({ metrics: currentMetrics, status: newStatus, updated_at: new Date() })
      .where(eq(mailboxes.id, mailbox.id));
  }

  return { success: true };
}, {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379', retryStrategy: () => null, maxRetriesPerRequest: null },
  concurrency: 1, // Enforce 1 concurrent send per queue (simplification)
});
