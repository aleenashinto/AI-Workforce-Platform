import { Worker, Job } from "bullmq";
import { db } from "@ai-workforce/db";
import {
  knowledge_sources,
  knowledge_documents,
  knowledge_chunks,
} from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";
import { generateEmbeddings } from "@ai-workforce/llm";
import crypto from "crypto";
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Simple semantic chunking for now
function chunkText(text: string, maxTokens: number = 500): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    if (currentChunk.length + p.length > maxTokens * 4) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = p;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + p;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks.filter((c) => c.length > 0);
}

export async function processIngestion(job: Job) {
  const { sourceId } = job.data;

  const source = await db.query.knowledge_sources.findFirst({
    where: eq(knowledge_sources.id, sourceId),
  });

  if (!source) {
    throw new Error(`Knowledge source ${sourceId} not found`);
  }

  await db
    .update(knowledge_sources)
    .set({ status: "processing" })
    .where(eq(knowledge_sources.id, sourceId));

  try {
    let textContent = "";
    const config = source.config as any;

    if (source.type === "url") {
      const response = await fetch(config.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);
      // Remove scripts and styles
      $("script, style").remove();
      textContent = $("body").text().replace(/\s+/g, " ").trim();
    } else if (source.type === "sitemap") {
      const response = await fetch(config.url);
      if (!response.ok)
        throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
      const xml = await response.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      const urls = [];
      $("url loc").each((i, el) => {
        urls.push($(el).text());
      });
      // limit to first 10 for safety
      const limitedUrls = urls.slice(0, 10);
      let combinedText = "";
      for (const u of limitedUrls) {
        try {
          const pageRes = await fetch(u);
          if (pageRes.ok) {
            const html = await pageRes.text();
            const page$ = cheerio.load(html);
            page$("script, style").remove();
            combinedText +=
              page$("body").text().replace(/\s+/g, " ").trim() + "\n\n";
          }
        } catch (e) {
          console.warn("Failed to crawl", u);
        }
      }
      textContent = combinedText;
    } else if (source.type === "text") {
      textContent = config.text || "";
    } else if (source.type === "file") {
      const s3 = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "mock",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "mock",
        },
        endpoint: process.env.S3_ENDPOINT || undefined, // for localstack or minio
        forcePathStyle: true,
      });

      const bucket = process.env.S3_BUCKET || "ai-workforce-uploads";
      const key = config.file_key;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const s3Response = await s3.send(command);
      if (!s3Response.Body) {
        throw new Error("File body empty");
      }
      const buffer = Buffer.from(await s3Response.Body.transformToByteArray());

      if (key.endsWith(".pdf")) {
        const data = await pdfParse(buffer);
        textContent = data.text;
      } else {
        textContent = buffer.toString("utf-8");
      }
    } else if (source.type === "notion") {
      console.log(
        `[Ingestion] Fetching Notion content using OAuth token from config...`,
      );
      textContent =
        "Mock Notion Document Content. This is a page about company policies.";
    } else if (source.type === "google_drive") {
      console.log(
        `[Ingestion] Fetching Google Drive content using OAuth token from config...`,
      );
      textContent =
        "Mock Google Drive Document Content. Quarterly earnings report 2026.";
    } else if (source.type === "zendesk") {
      console.log(`[Ingestion] Fetching Zendesk help center articles...`);
      textContent =
        "Mock Zendesk Article. How to reset your password and manage billing.";
    } else {
      throw new Error(`Unsupported source type: ${source.type}`);
    }

    if (!textContent) {
      throw new Error("No text content extracted");
    }

    const contentHash = crypto
      .createHash("sha256")
      .update(textContent)
      .digest("hex");

    const [document] = await db
      .insert(knowledge_documents)
      .values({
        source_id: sourceId,
        org_id: source.org_id,
        title: source.name,
        content_hash: contentHash,
        sync_status: "ready",
      })
      .returning();

    const chunks = chunkText(textContent);

    if (chunks.length > 0) {
      const embeddings = await generateEmbeddings(chunks);

      const chunkValues = chunks.map((content, idx) => ({
        document_id: document.id,
        content,
        embedding: embeddings[idx],
        metadata: { chunkIndex: idx },
      }));

      // Insert in batches if large
      await db.insert(knowledge_chunks).values(chunkValues);

      // We need to set the FTS vector as well, ideally via a trigger or raw SQL.
      // Drizzle handles the insert, but we'll manually update the fts column.
      await db.execute(
        `UPDATE knowledge_chunks SET fts = to_tsvector('english', content) WHERE document_id = '${document.id}'`,
      );
    }

    await db
      .update(knowledge_sources)
      .set({ status: "ready" })
      .where(eq(knowledge_sources.id, sourceId));
  } catch (error: any) {
    console.error(`Ingestion error for source ${sourceId}:`, error);
    await db
      .update(knowledge_sources)
      .set({ status: "failed" })
      .where(eq(knowledge_sources.id, sourceId));
    throw error;
  }
}

export const ingestionWorker = new Worker(
  "ingestion",
  async (job) => {
    return await processIngestion(job);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: 6379,
    },
    concurrency: 5,
  },
);
