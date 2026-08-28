import { Job, Queue } from "bullmq";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { knowledge_documents, knowledge_sources } from "db";
import { eq } from "drizzle-orm";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
  },
});

const queryClient = postgres(
  process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/ai_workforce",
);
const db = drizzle(queryClient);

export async function processIngestJob(job: Job, embedQueue: Queue) {
  const { source_id, fileKey, org_id } = job.data;

  console.log(`Starting ingest for source ${source_id}, file ${fileKey}`);

  // 1. Fetch file from S3
  let fileBuffer: Buffer | null = null;
  try {
    const s3Object = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET || 'ai-workforce-uploads', Key: fileKey }));
    const byteArray = await s3Object.Body?.transformToByteArray();
    if (byteArray) fileBuffer = Buffer.from(byteArray);
  } catch (err: any) {
    console.warn(`[Ingest] Could not fetch file from S3: ${err.message}. Falling back to demo mock.`);
  }

  // 2. Parse file
  let parsedText = "";
  if (fileBuffer) {
    try {
      if (fileKey.toLowerCase().endsWith(".pdf")) {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(fileBuffer);
        parsedText = pdfData.text;
      } else {
        // Assume text/markdown/csv
        parsedText = fileBuffer.toString("utf-8");
      }
    } catch (parseErr: any) {
      console.error(`[Ingest] Parsing failed for ${fileKey}:`, parseErr.message);
      parsedText = `Failed to parse ${fileKey}: ${parseErr.message}`;
    }
  } else {
    parsedText = `Simulated parsed text for ${fileKey}. \n\n# Chapter 1\nThis is the content.`;
  }

  // Ensure text is clean
  parsedText = parsedText.replace(/\u0000/g, "").trim();
  if (!parsedText) parsedText = "Empty document";

  // 3. Compute hash
  const contentHash = crypto
    .createHash("sha256")
    .update(parsedText)
    .digest("hex");

  // 4. Upsert document
  const existingDocs = await db
    .select()
    .from(knowledge_documents)
    .where(eq(knowledge_documents.source_id, source_id));
  let documentId;

  if (existingDocs.length > 0 && existingDocs[0].content_hash === contentHash) {
    console.log(`Document ${source_id} unchanged. Skipping embed.`);
    await db
      .update(knowledge_sources)
      .set({ status: "ready", updated_at: new Date() })
      .where(eq(knowledge_sources.id, source_id));
    return { status: "skipped" };
  } else if (existingDocs.length > 0) {
    documentId = existingDocs[0].id;
    await db
      .update(knowledge_documents)
      .set({ content_hash: contentHash, sync_status: "processing" })
      .where(eq(knowledge_documents.id, documentId));
  } else {
    const [newDoc] = await db
      .insert(knowledge_documents)
      .values({
        source_id,
        org_id,
        title: fileKey.split("-").pop() || fileKey,
        content_hash: contentHash,
        sync_status: "processing",
      })
      .returning();
    documentId = newDoc.id;
  }

  await db
    .update(knowledge_sources)
    .set({ status: "processing", updated_at: new Date() })
    .where(eq(knowledge_sources.id, source_id));

  // 5. Queue embed job
  await embedQueue.add("embed-document", {
    document_id: documentId,
    source_id,
    parsedText,
  });

  return { status: "success", documentId };
}
