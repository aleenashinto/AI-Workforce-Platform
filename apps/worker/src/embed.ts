import { Job } from 'bullmq';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { knowledge_chunks, knowledge_documents, knowledge_sources } from 'db';
import { eq } from 'drizzle-orm';
import { OpenAI } from 'openai';

const queryClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');
const db = drizzle(queryClient);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy'
});

function chunkText(text: string): string[] {
  // Very naive chunking for demonstration
  return [text.substring(0, 1000)];
}

export async function processEmbedJob(job: Job) {
  const { document_id, source_id, parsedText } = job.data;
  console.log(`Starting embed for document ${document_id}`);

  // 1. Chunking
  const chunks = chunkText(parsedText);

  // 2. Generate embeddings & save
  // Delete old chunks if updating
  await db.delete(knowledge_chunks).where(eq(knowledge_chunks.document_id, document_id));

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    
    // Skip real OpenAI call if key is dummy
    let embedding = new Array(3072).fill(0.01);
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy') {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: chunkText,
        dimensions: 3072
      });
      embedding = response.data[0].embedding;
    }

    await db.insert(knowledge_chunks).values({
      document_id,
      content: chunkText,
      embedding: embedding as any,
      metadata: { chunkIndex: i }
    });
  }

  // 3. Update status
  await db.update(knowledge_documents).set({ sync_status: 'ready', updated_at: new Date() }).where(eq(knowledge_documents.id, document_id));
  await db.update(knowledge_sources).set({ status: 'ready', updated_at: new Date() }).where(eq(knowledge_sources.id, source_id));

  return { status: 'success', chunksProcessed: chunks.length };
}
