import { FastifyInstance } from "fastify";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { db } from "@ai-workforce/db";
import {
  knowledge_sources,
  knowledge_gaps,
  organizations,
  memberships,
} from "@ai-workforce/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Queue } from "bullmq";

// Use an options object that prevents crashing when Redis isn't available
const queueOpts = {
  connection: {
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    maxRetriesPerRequest: null as any,
    retryStrategy: () => null,
    lazyConnect: true,
  },
};
const ingestionQueue = new Queue("ingestion", queueOpts);
ingestionQueue.on("error", () => {});

export async function knowledgeRoutes(fastify: FastifyInstance) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
    },
    endpoint: process.env.AWS_ENDPOINT_URL, // for localstack/r2
  });

  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      if (!(request as any).user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
    }
  });

  async function getOrgId(request: any): Promise<string> {
    let org_id = request.user?.org_id || request.headers["x-org-id"];
    if (org_id) {
      const [found] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.id, org_id))
        .limit(1);
      if (found) return found.id;
    }
    const userId = request.user?.user_id;
    if (userId) {
      const [membership] = await db
        .select({ org_id: memberships.org_id })
        .from(memberships)
        .where(eq(memberships.user_id, userId))
        .limit(1);
      if (membership) return membership.org_id;
    }
    const [firstOrg] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .limit(1);
    return firstOrg?.id || "00000000-0000-0000-0000-000000000001";
  }

  fastify.post("/sources", async (request, reply) => {
    try {
      const org_id = await getOrgId(request);
      const { type, name, config } = (request.body as any) || {};

      if (type === "file") {
        const { filename, contentType } = config || {};
        const fileKey = `${org_id}/${randomUUID()}-${filename || "file"}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET || "ai-workforce-uploads",
          Key: fileKey,
          ContentType: contentType || "application/octet-stream",
        });

        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        const [source] = await db
          .insert(knowledge_sources)
          .values({
            org_id,
            type,
            name: name || filename || "Uploaded File",
            status: "pending",
            config: { file_key: fileKey, filename, contentType },
          })
          .returning();

        return { success: true, source, uploadUrl: presignedUrl };
      } else {
        const [source] = await db
          .insert(knowledge_sources)
          .values({
            org_id,
            type: type || "website",
            name: name || (config?.url ? config.url : "Knowledge Source"),
            status: "ready",
            config: config || {},
          })
          .returning();

        if (type !== "file") {
          try {
            await ingestionQueue.add("process-source", { sourceId: source.id });
          } catch (err: any) {
            console.warn(
              "Failed to enqueue ingestion job (Redis likely unavailable):",
              err?.message,
            );
          }
        }

        return { success: true, source };
      }
    } catch (err: any) {
      request.log.error(err, "Failed to create knowledge source");
      return reply.status(500).send({
        error: "Failed to create knowledge source",
        message: err?.message || String(err),
      });
    }
  });

  fastify.post("/sources/proxy-upload", async (request, reply) => {
    const { uploadUrl, contentType, base64Data } = request.body as any;
    if (!uploadUrl || !base64Data) {
      return reply.status(400).send({ error: "uploadUrl and base64Data are required" });
    }

    try {
      const buffer = Buffer.from(base64Data, "base64");
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Content-Length": String(buffer.byteLength),
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error(`S3 returned status ${res.status}: ${res.statusText}`);
      }

      return { success: true };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: "Failed to proxy upload to S3", details: e.message });
    }
  });

  fastify.post("/sources/confirm-upload", async (request, reply) => {
    const { source_id } = request.body as any;
    if (!source_id) return reply.status(400).send({ error: "source_id is required" });

    try {
      await ingestionQueue.add("process-source", { sourceId: source_id });
    } catch (err: any) {
      console.warn("Failed to enqueue ingestion job:", err?.message);
    }
    return { success: true };
  });

  fastify.get("/sources", async (request, reply) => {
    const org_id = await getOrgId(request);
    const sources = await db
      .select()
      .from(knowledge_sources)
      .where(eq(knowledge_sources.org_id, org_id))
      .orderBy(desc(knowledge_sources.created_at));
    return { sources };
  });

  fastify.get("/knowledge-gaps", async (request, reply) => {
    const org_id = await getOrgId(request);
    const gaps = await db
      .select()
      .from(knowledge_gaps)
      .where(eq(knowledge_gaps.org_id, org_id))
      .orderBy(desc(knowledge_gaps.occurrence_count));
    return { gaps };
  });

  fastify.patch("/knowledge-gaps/:id", async (request, reply) => {
    const org_id = await getOrgId(request);
    const { id } = request.params as any;
    const { status } = request.body as any;

    const [gap] = await db
      .update(knowledge_gaps)
      .set({ status })
      .where(and(eq(knowledge_gaps.id, id), eq(knowledge_gaps.org_id, org_id)))
      .returning();

    return { success: true, gap };
  });
}
