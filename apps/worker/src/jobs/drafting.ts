import { Worker, Job } from "bullmq";
import { db } from "@ai-workforce/db";
import {
  leads,
  drafts,
  campaigns,
  suppression_list,
  companies,
  organizations,
} from "@ai-workforce/db/schema";
import { eq, and, or } from "drizzle-orm";
import { generateText } from "@ai-workforce/llm";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const SUPERLATIVES = [
  "best",
  "fastest",
  "cheapest",
  "greatest",
  "most",
  "revolutionary",
  "groundbreaking",
  "game-changing",
  "game changing",
];
const BANNED_OPENERS = [
  "hope this email finds you well",
  "finds you well",
  "hope you are doing well",
];

function calculateFleschKincaid(text: string): number {
  // Very simplified approximation of reading grade level
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const syllables = text.split(/[aeiouy]+/).length; // Rough estimate
  const score = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.max(0, score);
}

function runValidations(subject: string, body: string, researchBrief: any) {
  const results: { rule: string; passed: boolean; message: string }[] = [];
  const words = body.trim().split(/\s+/).length;
  const lowerBody = body.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  results.push({
    rule: "Word count < 120",
    passed: words < 120,
    message: `Word count is ${words}`,
  });

  results.push({
    rule: "Subject < 60 chars",
    passed: subject.length < 60,
    message: `Subject length is ${subject.length}`,
  });

  results.push({
    rule: "No clickbait",
    passed:
      !lowerSubject.includes("urgent") &&
      !lowerSubject.includes("quick question") &&
      !lowerSubject.includes("important"),
    message: "Subject check",
  });

  results.push({
    rule: "No generic openers",
    passed: !BANNED_OPENERS.some((o) => lowerBody.includes(o)),
    message: "Opening check",
  });

  const ctas = (body.match(/\?/g) || []).length;
  results.push({
    rule: "Exactly one CTA",
    passed: ctas === 1,
    message: `Found ${ctas} question marks`,
  });

  results.push({
    rule: "No superlatives",
    passed: !SUPERLATIVES.some((s) => lowerBody.includes(s)),
    message: "Superlative check",
  });

  const gradeLevel = calculateFleschKincaid(body);
  results.push({
    rule: "Reading level <= 8",
    passed: gradeLevel <= 8,
    message: `Estimated grade level is ${gradeLevel.toFixed(1)}`,
  });

  results.push({
    rule: "Unsubscribe included",
    passed: lowerBody.includes("unsubscribe") || lowerBody.includes("opt out"),
    message: "Opt-out check",
  });

  return results;
}

export const draftingWorker = new Worker(
  "drafting-queue",
  async (job: Job) => {
    const { leadId, campaignId, orgId, icpData } = job.data;
    console.log(`[Drafting] Starting for lead ${leadId}`);

    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
      with: { company: true },
    });

    if (!lead || !lead.research_brief) {
      throw new Error("Lead missing or not researched");
    }

    // SUPPRESSION LIST ENFORCEMENT
    const domain = lead.email ? lead.email.split("@")[1] : lead.company?.domain;
    if (domain || lead.email) {
      const suppressionChecks = [];
      if (domain)
        suppressionChecks.push(
          eq(suppression_list.entity_value, domain.toLowerCase()),
        );
      if (lead.email)
        suppressionChecks.push(
          eq(suppression_list.entity_value, lead.email.toLowerCase()),
        );

      const suppressed = await db.query.suppression_list.findFirst({
        where: and(
          eq(suppression_list.org_id, orgId),
          or(...suppressionChecks),
        ),
      });
      if (suppressed) {
        await db
          .update(leads)
          .set({ status: "suppressed" })
          .where(eq(leads.id, leadId));
        console.warn(`[Drafting] Aborting: Lead ${leadId} is suppressed.`);
        return { success: false, reason: "suppressed" };
      }
    }

    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    const systemPrompt = `You are an elite B2B sales copywriter. Generate an outreach email. Output format MUST be:
SUBJECT: <subject here>
BODY:
<body here>
[unsubscribe]

IMPORTANT RULES:
- Subject must be < 60 characters and no clickbait.
- Body must be < 120 words.
- Tone should be professional but conversational. Reading level <= Grade 8.
- Never use superlatives like "revolutionary" or "game-changing".
- Never use generic openers like "I hope this finds you well".
- EXACTLY one Call to Action (one question mark in the body).
- Always include an unsubscribe link at the bottom.
`;

    async function generateVariant(hook: string, previousFailures?: string) {
      let prompt = `Write an outreach email for ${lead.name} at ${lead.company}.
Research Hook: ${hook}
ICP Value Prop: ${icpData?.valueProp || "Our platform streamlines operations."}
Proof Points: ${icpData?.proofPoints || "We save 20% on infra costs."}`;

      if (previousFailures) {
        prompt += `\n\nCRITICAL: Your previous draft failed validation for the following reasons:\n${previousFailures}\n\nFIX THESE ERRORS in this attempt.`;
      }

      const res = await generateText("balanced", systemPrompt, prompt);
      const match = res.content.match(/SUBJECT:\s*(.*?)\nBODY:\n([\s\S]*)/i);

      if (!match) {
        // Fallback parsing if model ignores exact formatting
        return {
          subject: `Connecting with ${lead.company}`,
          body: res.content + "\n[unsubscribe]",
        };
      }
      return { subject: match[1].trim(), body: match[2].trim() };
    }

    const variantsData = [];
    let finalStatus = "draft";

    // We want 2 variants
    const hooks = (lead.research_brief as any).hooks || [
      "Noticed your recent growth.",
    ];
    const selectedHooks = [hooks[0], hooks[1] || hooks[0]];

    for (const hook of selectedHooks) {
      let attempt = 0;
      let passedAll = false;
      let variant = null;
      let valResults = [];

      while (attempt < 2 && !passedAll) {
        attempt++;
        const failReasonsStr = valResults
          .filter((v) => !v.passed)
          .map((v) => `- ${v.rule}: ${v.message}`)
          .join("\n");
        variant = await generateVariant(
          hook,
          attempt > 1 ? failReasonsStr : undefined,
        );

        valResults = runValidations(
          variant.subject,
          variant.body,
          lead.research_brief,
        );
        passedAll = valResults.every((v) => v.passed);
      }

      variantsData.push({
        subject: variant?.subject || "",
        body: variant?.body || "",
        validation_results: valResults,
        hook_used: hook,
        passed_all: passedAll,
      });
    }

    // Get organization to check approval gate
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });
    const approvalGateActive = org?.approval_gate_active ?? true;

    // If both variants failed validation even after regen, flag it for manual review
    if (variantsData.every((v) => !v.passed_all)) {
      finalStatus = "failed_validation";
    } else if (!approvalGateActive) {
      // If gate is OFF and validation passed, auto-approve
      finalStatus = "approved";
    }

    // Select the best variant (first one that passed, or just variant 1)
    const bestVariantData =
      variantsData.find((v) => v.passed_all) || variantsData[0];

    await db.insert(drafts).values({
      org_id: orgId,
      lead_id: leadId,
      campaign_id: campaignId,
      status: finalStatus,
      subject: bestVariantData.subject,
      body: bestVariantData.body,
      variants: variantsData,
      validation_results: bestVariantData.validation_results,
      personalized_hooks: [bestVariantData.hook_used],
    });

    console.log(
      `[Drafting] Complete for lead ${leadId}. Status: ${finalStatus}`,
    );
    return { success: true, finalStatus };
  },
  {
    connection: new (require("ioredis").default || require("ioredis"))(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: () => null,
      },
    ),
    concurrency: 5,
  },
);

draftingWorker.on("failed", (job, err) => {
  if (
    String(`Job ${job?.id} failed with error ${err.message}`).includes(
      "ECONNREFUSED",
    )
  ) {
    return;
  }
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
