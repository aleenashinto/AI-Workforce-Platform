import { FastifyInstance } from 'fastify';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { knowledge_sources } from '@ai-workforce/db/schema';
import { Queue } from 'bullmq';

// Use an options object that prevents crashing when Redis isn't available
const queueOpts = {
  connection: { 
    host: process.env.REDIS_HOST || '127.0.0.1', 
    port: 6379,
    maxRetriesPerRequest: null as any,
    retryStrategy: () => null,
    lazyConnect: true
  }
};
const ingestionQueue = new Queue('ingestion', queueOpts);

export async function knowledgeRoutes(fastify: FastifyInstance) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
    },
    endpoint: process.env.AWS_ENDPOINT_URL // for localstack/r2
  });

  const queryClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');
  const db = drizzle(queryClient);

  fastify.post('/v1/sources', async (request, reply) => {
    // Generate pre-signed URL and create source
    const { type, name, config, org_id } = request.body as any;

    if (type === 'file') {
      const { filename, contentType } = config;
      const fileKey = `${org_id}/${randomUUID()}-${filename}`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || 'ai-workforce-uploads',
        Key: fileKey,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      
      const [source] = await db.insert(knowledge_sources).values({
        org_id,
        type,
        name,
        status: 'pending',
        config: { fileKey, filename, contentType }
      }).returning();

      return { source, uploadUrl: presignedUrl };
    } else {
      const [source] = await db.insert(knowledge_sources).values({
        org_id,
        type,
        name,
        status: 'pending',
        config
      }).returning();
      
      // TODO: queue ingest job here
      if (type !== 'file') {
        await ingestionQueue.add('process-source', { sourceId: source.id });
      }

      return { source };
    }
  });

  fastify.post('/v1/sources/confirm-upload', async (request, reply) => {
    const { source_id } = request.body as any;

    if (!source_id) {
      return reply.status(400).send({ error: 'source_id is required' });
    }

    await ingestionQueue.add('process-source', { sourceId: source_id });

    return { success: true };
  });

  fastify.get('/v1/sources', async (request, reply) => {
    const { org_id } = request.query as any;
    
    // In a real app, org_id would come from JWT middleware
    if (!org_id) {
      return reply.status(400).send({ error: 'org_id is required' });
    }

    // A real implementation would use drizzle where condition, 
    // but we can query raw for simplicity if needed.
    const sqlClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');
    const sources = await sqlClient`SELECT * FROM knowledge_sources WHERE org_id = ${org_id} ORDER BY created_at DESC`;
    await sqlClient.end();

    return { sources };
  });

  fastify.get('/v1/knowledge-gaps', async (request, reply) => {
    const { org_id } = request.query as any;
    if (!org_id) return reply.status(400).send({ error: 'org_id is required' });

    const sqlClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');
    const gaps = await sqlClient`SELECT * FROM knowledge_gaps WHERE org_id = ${org_id} ORDER BY occurrence_count DESC`;
    await sqlClient.end();

    return { gaps };
  });

  fastify.patch('/v1/knowledge-gaps/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { status } = request.body as any;

    const sqlClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');
    const [gap] = await sqlClient`UPDATE knowledge_gaps SET status = ${status} WHERE id = ${id} RETURNING *`;
    await sqlClient.end();

    return { success: true, gap };
  });
}
