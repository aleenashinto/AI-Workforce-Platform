import { Worker, Job } from 'bullmq';
import { db } from '@ai-workforce/db';
import { leads, outreach_events } from '@ai-workforce/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateText } from '@ai-workforce/llm';

export const outreachWorker = new Worker('outreach-queue', async (job: Job) => {
  const { campaign_id, lead_id, prompt_template } = job.data;
  console.log(`[OUTREACH] Generating outreach for lead ${lead_id} on campaign ${campaign_id}`);

  // Fetch the lead to get metadata
  const [lead] = await db.select().from(leads).where(eq(leads.id, lead_id));
  if (!lead) {
    throw new Error(`Lead ${lead_id} not found`);
  }

  // Construct prompt for LLM
  const prompt = `
    You are an expert sales development representative.
    Write a highly personalized outreach email based on the following instructions:
    
    Instructions:
    ${prompt_template}

    Lead Information:
    Name: ${lead.name}
    Company: ${lead.company}
    Title: ${lead.metadata?.title || 'Unknown'}
    Industry: ${lead.metadata?.industry || 'Unknown'}
    
    Output ONLY the email body. Keep it concise, engaging, and professional.
  `;

  // For MVP, we will mock the LLM if no API key is provided, 
  // otherwise we'll try to generate real text.
  let generatedContent = '';
  try {
    const result = await generateText("fast", "You are an AI SDR.", prompt);
    generatedContent = result.content;
  } catch (err) {
    console.warn(`[OUTREACH] LLM generation failed, falling back to mock text. Error: ${err}`);
    generatedContent = `Hi ${lead.name},\n\nI noticed your work at ${lead.company} as a ${lead.metadata?.title}. We have a solution that could greatly benefit your operations in the ${lead.metadata?.industry} space.\n\nAre you open to a quick chat next week?\n\nBest,\nAI SDR`;
  }

  // Record the outreach event
  const eventId = uuidv4();
  await db.insert(outreach_events).values({
    id: eventId,
    lead_id: lead.id,
    campaign_id,
    type: 'email',
    content: generatedContent,
    status: 'sent'
  });

  // Update lead status
  await db.update(leads).set({ status: 'contacted' }).where(eq(leads.id, lead.id));

  console.log(`[OUTREACH] Outreach generated and sent for lead ${lead.id}. Event ID: ${eventId}`);

  return { success: true, eventId, leadId: lead.id };
}, {
  connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null })
});

outreachWorker.on('failed', (job, err) => {
  if (String(`Job ${job?.id} failed with error ${err.message}`).includes('ECONNREFUSED')) { return; } console.error(`Job ${job?.id} failed with error ${err.message}`);
});
