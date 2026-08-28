import { z } from "zod";
import { generateStructured } from "../index";

// --- Module A Metrics ---

export interface ModuleAEvalResult {
  questionId: string;
  recallScore: number;       // 1 if expected source in top 6, else 0
  faithfulnessScore: number; // 1 if answer is fully supported by context, else 0
  escalationPrecision: number; // 1 if escalated correctly, 0 otherwise
  reasoning: string;
}

export async function evaluateModuleA(
  question: string,
  expectedAnswer: string,
  actualAnswer: string,
  retrievedChunkIds: string[],
  expectedSourceIds: string[]
): Promise<ModuleAEvalResult> {
  // 1. Calculate Recall@6
  let recallScore = 0;
  for (const expected of expectedSourceIds) {
    if (retrievedChunkIds.slice(0, 6).includes(expected)) {
      recallScore = 1;
      break;
    }
  }

  // 2. LLM as a Judge for Faithfulness
  const schema = z.object({
    is_faithful: z.boolean().describe("True if the actual answer aligns perfectly with the expected answer and does not hallucinate facts."),
    reasoning: z.string().describe("Explanation for the score.")
  });

  const prompt = `
Expected Answer: ${expectedAnswer}
Actual Answer: ${actualAnswer}

Evaluate if the Actual Answer is faithful to the Expected Answer.
`;

  let faithfulnessScore = 0;
  let reasoning = "";

  try {
    const evalRes = await generateStructured(
      "fast",
      "You are an expert grading system. Evaluate the faithfulness of the answer.",
      prompt,
      schema
    );
    faithfulnessScore = evalRes.is_faithful ? 1 : 0;
    reasoning = evalRes.reasoning;
  } catch (err: any) {
    reasoning = "Eval failed: " + err.message;
  }

  return {
    questionId: "",
    recallScore,
    faithfulnessScore,
    escalationPrecision: 1, // Mocked for now
    reasoning
  };
}

// --- Module B Metrics ---

export interface ModuleBEvalResult {
  leadId: string;
  signalPrecision: number;     // 1 if all signals are true and correctly sourced
  hallucinationRate: number;   // 1 if there's any hallucination, else 0
  ruleComplianceRate: number;  // fraction of draft rules passed
  reasoning: string;
}

export async function evaluateModuleB(
  expectedSignals: any[],
  actualSignals: any[],
  actualDraft: string,
  expectedDraftPoints: string[]
): Promise<ModuleBEvalResult> {
  const schema = z.object({
    has_hallucinations: z.boolean().describe("True if the draft contains fabricated information not present in the expected signals."),
    includes_expected_points: z.boolean().describe("True if the draft includes the expected personalization points."),
    reasoning: z.string()
  });

  const prompt = `
Expected Signals: ${JSON.stringify(expectedSignals)}
Actual Signals: ${JSON.stringify(actualSignals)}
Expected Draft Points: ${JSON.stringify(expectedDraftPoints)}
Actual Draft: ${actualDraft}

Evaluate if the Actual Draft uses the signals properly without hallucinations, and if it includes the expected personalization points.
`;

  let hallucinationRate = 1;
  let ruleComplianceRate = 0;
  let reasoning = "";

  try {
    const evalRes = await generateStructured(
      "fast",
      "You are an expert grading system evaluating B2B sales outreach drafts.",
      prompt,
      schema
    );
    hallucinationRate = evalRes.has_hallucinations ? 1 : 0;
    ruleComplianceRate = evalRes.includes_expected_points ? 1 : 0;
    reasoning = evalRes.reasoning;
  } catch (err: any) {
    reasoning = "Eval failed: " + err.message;
  }

  return {
    leadId: "",
    signalPrecision: 1, // Simplified for harness structure
    hallucinationRate,
    ruleComplianceRate,
    reasoning
  };
}
