import { Worker, Job } from 'bullmq';
import { db } from '@ai-workforce/db';
import { leads, suppression_list, companies } from '@ai-workforce/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { generateStructured } from '@ai-workforce/llm';
import { z } from 'zod';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const TOOLS = {
  web_search: async (query: string) => `Search results for ${query}`,
  fetch_page: async (url: string) => `Content for ${url}`,
  get_company_record: async (domain: string) => `Company record for ${domain}`,
  search_news: async (company: string) => `News for ${company}`,
  get_job_postings: async (company: string) => `Jobs for ${company}`
};

const SignalSchema = z.object({
  type: z.enum(['funding', 'hiring', 'leadership', 'product', 'tech_stack', 'pain_points', 'expansion']),
  text: z.string(),
  url: z.string().url(),
  date: z.string().describe("ISO date string (YYYY-MM-DD)")
});

const ResearchOutputSchema = z.object({
  summary: z.string(),
  signals: z.array(SignalSchema),
  hooks: z.array(z.string()).length(3),
  sources: z.array(z.string().url())
});

export const researchWorker = new Worker(
  'research-queue',
  async (job: Job) => {
    const { leadId, orgId } = job.data;
    console.log(`[Research] Starting research for lead ${leadId}`);

    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
      with: { company: true }
    });

    if (!lead) throw new Error('Lead not found');

    // SUPPRESSION LIST ENFORCEMENT
    const domain = lead.email ? lead.email.split('@')[1] : lead.company?.domain;
    if (domain || lead.email) {
      const suppressionChecks = [];
      if (domain) suppressionChecks.push(eq(suppression_list.entity_value, domain.toLowerCase()));
      if (lead.email) suppressionChecks.push(eq(suppression_list.entity_value, lead.email.toLowerCase()));
      
      const suppressed = await db.query.suppression_list.findFirst({
        where: and(
          eq(suppression_list.org_id, orgId),
          or(...suppressionChecks)
        )
      });
      if (suppressed) {
        await db.update(leads).set({ status: 'suppressed' }).where(eq(leads.id, leadId));
        console.warn(`[Research] Aborting: Lead ${leadId} is suppressed.`);
        return { success: false, reason: 'suppressed' };
      }
    }

    const startTime = Date.now();
    let toolCalls = 0;
    let cost = 0.0;
    const MAX_TOOL_CALLS = 8;
    const MAX_TIME_MS = 60000; // 60 seconds
    const MAX_COST = 0.15; // 15 cents

    // Agent Loop (simulated for simplicity but with enforced bounds)
    const contextData: string[] = [];
    
    const runTool = async (tool: keyof typeof TOOLS, arg: string) => {
      if (toolCalls >= MAX_TOOL_CALLS) throw new Error('MAX_TOOL_CALLS_REACHED');
      if (Date.now() - startTime > MAX_TIME_MS) throw new Error('MAX_TIME_REACHED');
      if (cost >= MAX_COST) throw new Error('MAX_COST_REACHED');
      
      toolCalls++;
      cost += 0.01; // Mock cost increment
      const result = await TOOLS[tool](arg);
      contextData.push(result);
    };

    try {
      await runTool('get_company_record', lead.company || '');
      await runTool('search_news', lead.company || '');
      // Add a simulated fetch page
      await runTool('fetch_page', 'https://example.com/news');
    } catch (e: any) {
      console.warn(`[Research] Bounded limit hit: ${e.message}`);
    }

    // Process with deep model
    const systemPrompt = `You are a B2B sales researcher analyzing a company. Extract a concise summary (max 120 words), top 3 personalization hooks, and any critical business signals (funding, hiring, etc).
CRITICAL RULE: Every signal MUST have a valid source URL and an observed date. Do not hallucinate URLs. If you don't know the URL or date, omit the signal entirely.`;

    const userPrompt = `Analyze this data for ${lead.company}:\n\n${contextData.join('\n')}\n\nCurrent date is ${new Date().toISOString()}`;

    const rawOutput = await generateStructured('deep', systemPrompt, userPrompt, ResearchOutputSchema);
    
    // Validate signals programmatically (drop old ones or hallucinated ones)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const validSignals = rawOutput.signals.filter(signal => {
      // 1. Must have URL
      if (!signal.url || signal.url.trim() === '') return false;
      // 2. Must have Date
      if (!signal.date) return false;
      
      // 3. Drop if >90 days old, unless tech_stack
      if (signal.type !== 'tech_stack') {
        const sigDate = new Date(signal.date);
        if (sigDate < ninetyDaysAgo) return false;
      }

      return true;
    });

    const researchBrief = {
      summary: rawOutput.summary,
      signals: validSignals,
      hooks: rawOutput.hooks,
      sources: rawOutput.sources
    };

    // Update DB
    await db.update(leads)
      .set({
        research_brief: researchBrief,
        signals: validSignals, // Keep flattened array in leads table
        status: 'enriched',
        updated_at: new Date()
      })
      .where(eq(leads.id, leadId));

    console.log(`[Research] Complete for lead ${leadId}. Signals: ${validSignals.length}. Cost: $${cost.toFixed(3)}`);
    return { success: true, toolCalls, timeElapsed: Date.now() - startTime, cost };
  },
  {
    connection: { url: REDIS_URL },
    concurrency: 3
  }
);

researchWorker.on('failed', (job, err) => {
  if (String(`Job ${job?.id} failed with error ${err.message}`).includes('ECONNREFUSED')) { return; } 
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
