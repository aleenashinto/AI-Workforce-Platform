import { Worker, Job } from 'bullmq';
import { db } from '@ai-workforce/db';
import { replies, leads, sequences, mailboxes, suppression_list } from '@ai-workforce/db/schema';
import { eq } from 'drizzle-orm';
import { generateText } from '@ai-workforce/llm';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const classifyReplyWorker = new Worker(
  'classify-reply-queue',
  async (job: Job) => {
    const { replyText, leadId, orgId, threadId, mailboxId } = job.data;
    console.log(`[ClassifyReply] Classifying incoming reply for lead ${leadId}`);

    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
      with: { company: true }
    });

    if (!lead) throw new Error('Lead not found');

    const systemPrompt = `You are a B2B sales assistant classifying an incoming email reply.
Classify into exactly ONE of the following categories:
- interested
- not_now
- not_interested
- wrong_person
- unsubscribe
- out_of_office
- auto_reply
- bounce

Respond ONLY with the category keyword.`;

    const classificationResponse = await generateText('fast', systemPrompt, `Email body:\n${replyText}`);
    const classification = classificationResponse.content.trim().toLowerCase();

    const validClasses = ['interested', 'not_now', 'not_interested', 'wrong_person', 'unsubscribe', 'out_of_office', 'auto_reply', 'bounce'];
    const finalClass = validClasses.includes(classification) ? classification : 'auto_reply';

    console.log(`[ClassifyReply] Classified as: ${finalClass}`);

    // Insert the reply
    const [insertedReply] = await db.insert(replies).values({
      org_id: orgId,
      lead_id: leadId,
      classification: finalClass,
      thread_id: threadId,
      content: replyText,
      status: 'processed'
    }).returning();

    // Fire downstream actions
    if (finalClass === 'bounce') {
      const mailbox = await db.query.mailboxes.findFirst({ where: eq(mailboxes.id, mailboxId) });
      if (mailbox) {
        const metrics = (mailbox.metrics as any) || { bounces: 0, sent_total: 100 };
        metrics.bounces += 1;
        
        // Check auto-pause threshold (>3% bounce)
        const bounceRate = metrics.bounces / (metrics.sent_total || 1);
        if (bounceRate > 0.03) {
          await db.update(mailboxes).set({ status: 'paused', metrics }).where(eq(mailboxes.id, mailboxId));
          console.warn(`[ClassifyReply] Mailbox ${mailboxId} auto-paused due to high bounce rate (${(bounceRate*100).toFixed(1)}%).`);
        } else {
          await db.update(mailboxes).set({ metrics }).where(eq(mailboxes.id, mailboxId));
        }
      }
    }

    if (finalClass === 'not_interested' || finalClass === 'unsubscribe') {
      const domain = lead.email ? lead.email.split('@')[1] : lead.company?.domain;
      if (domain) {
        await db.insert(suppression_list).values({
          org_id: orgId,
          entity_type: 'domain',
          entity_value: domain.toLowerCase(),
          reason: finalClass
        });
        console.log(`[ClassifyReply] Suppressed domain ${domain} due to ${finalClass}`);
      }
    }

    // Stop sequences for this lead (conceptually: update leads.status or active sequence trackers)
    // Any reply stops the sequence natively
    await db.update(leads).set({ status: 'replied' }).where(eq(leads.id, leadId));

    return { success: true, classification: finalClass };
  },
  { connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null }) }
);
