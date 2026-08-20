
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import IORedis from "ioredis";
import crypto from "crypto";
import { checkInputGuardrails, checkOutputGuardrails } from './guardrails';

export type TaskClass = "fast" | "balanced" | "deep";

const models: Record<TaskClass, string> = {
  fast: "claude-3-haiku-20240307",
  balanced: "claude-3-5-sonnet-20240620",
  deep: "claude-3-opus-20240229",
};

const redis = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  }
);

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }
  return new Anthropic({ apiKey });
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return new OpenAI({ apiKey });
}

export const generateText = async (
  taskClass: TaskClass,
  systemPrompt: string,
  userPrompt: string
) => {
  const guard = await checkInputGuardrails(userPrompt);
  if (!guard.safe) {
    throw new Error(`Guardrail violation: ${guard.reason}`);
  }
  const safeUserPrompt = guard.sanitized || userPrompt;

  const model = models[taskClass];
  const cacheKey = `llm_cache:${crypto.createHash("sha256").update(model + systemPrompt + safeUserPrompt).digest("hex")}`;
  const cachedResult = await redis.get(cacheKey);

  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: safeUserPrompt }],
  });

  const content = response.content[0]?.type === "text" ? response.content[0].text : "";
  
  const outGuard = await checkOutputGuardrails(content, []);
  if (!outGuard.safe) {
    throw new Error(`Output guardrail violation: ${outGuard.reason}`);
  }

  const result = {
    content,
    usage: response.usage,
    model: response.model,
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 86400);
  return result;
};

export const generateStructured = async <T extends z.ZodTypeAny>(
  taskClass: TaskClass,
  systemPrompt: string,
  userPrompt: string,
  schema: T
): Promise<z.infer<T>> => {
  const guard = await checkInputGuardrails(userPrompt);
  if (!guard.safe) {
    throw new Error(`Guardrail violation: ${guard.reason}`);
  }
  const safeUserPrompt = guard.sanitized || userPrompt;

  const openai = getOpenAIClient() as any;
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: safeUserPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "output_schema",
        strict: true,
        schema: zodToJsonSchema(schema as any),
      },
    },
  });

  const parsed = response.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("OpenAI returned no structured output.");
  }
  return parsed as z.infer<T>;
};

export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
    encoding_format: "float",
  });
  return response.data.map((d) => d.embedding);
};

export const streamText = async (
  taskClass: TaskClass,
  systemPrompt: string,
  userPrompt: string
) => {
  const guard = await checkInputGuardrails(userPrompt);
  if (!guard.safe) {
    throw new Error(`Guardrail violation: ${guard.reason}`);
  }
  const safeUserPrompt = guard.sanitized || userPrompt;

  const anthropic = getAnthropicClient();
  const model = models[taskClass];

  return await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: safeUserPrompt }],
    stream: true,
  });
};

export const rerankDocuments = async (query: string, documents: string[]) => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    return documents.map((doc, i) => ({ document: doc, index: i, relevance_score: 1 - (i * 0.01) }));
  }

  try {
    const res = await fetch("https://api.cohere.ai/v1/rerank", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "rerank-english-v3.0",
        query,
        documents,
        top_n: documents.length
      })
    });

    if (!res.ok) {
      console.error("Cohere reranking failed:", await res.text());
      return documents.map((doc, i) => ({ document: doc, index: i, relevance_score: 1 - (i * 0.01) }));
    }

    const data = (await res.json()) as any;
    return data.results as Array<{ document: { text: string }; index: number; relevance_score: number }>;
  } catch (err) {
    console.error("Error calling Cohere:", err);
    return documents.map((doc, i) => ({ document: doc, index: i, relevance_score: 1 - (i * 0.01) }));
  }
};

export * from './guardrails';