import "dotenv/config";

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";

import { researchWorker } from "./src/jobs/research";
import { draftingWorker } from "./src/jobs/drafting";
import { outreachWorker } from "./src/jobs/outreach";
import { sequenceSchedulerWorker } from "./src/jobs/sequence-scheduler";
import { emailSenderWorker } from "./src/jobs/email-sender";
import { replyMonitorWorker } from "./src/jobs/reply-monitor";
import dataRetentionProcessor from "./src/jobs/data-retention";
import { ingestionWorker } from "./src/jobs/ingestion";

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = String(args[0]);
  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("[ioredis] Unhandled error event")
  )
    return;
  originalConsoleError(...args);
};
process.on("unhandledRejection", (reason: any) => {
  if (
    reason?.code === "ECONNREFUSED" ||
    String(reason).includes("ECONNREFUSED")
  )
    return;
  if (reason?.errors?.some?.((e: any) => e.code === "ECONNREFUSED")) return;
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err: any) => {
  if (err?.code === "ECONNREFUSED" || String(err).includes("ECONNREFUSED"))
    return;
  if (err?.errors?.some?.((e: any) => e.code === "ECONNREFUSED")) return;
  console.error("Uncaught Exception:", err);
});

async function start() {
  console.log("Starting AI Workforce worker...");

  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy: () => null,
  });

  try {
    await connection.connect();
    console.log("Worker successfully connected to Redis.");
  } catch (err) {
    console.warn(
      "Could not connect to Redis. Workers will not be started to prevent error spam.",
      err,
    );
    return;
  }

  connection.on("ready", () => {
    console.log("Redis connection is ready.");
  });

  connection.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  connection.on("close", () => {
    console.log("Redis connection closed.");
  });

  const dataRetentionWorker = new Worker(
    "data-retention",
    dataRetentionProcessor,
    {
      connection,
    },
  );

  const dataRetentionQueue = new Queue("data-retention", {
    connection,
  });

  await dataRetentionQueue.add(
    "daily-retention-run",
    {},
    {
      repeat: {
        pattern: "0 0 * * *",
      },
    },
  );

  const workers = [
    researchWorker,
    draftingWorker,
    outreachWorker,
    sequenceSchedulerWorker,
    emailSenderWorker,
    replyMonitorWorker,
    dataRetentionWorker,
    ingestionWorker,
  ];

  const webhooksWorker = new Worker(
    "webhooks",
    async (job) => {
      console.log(`Processing webhooks job ${job.id}`);

      return {
        status: "done",
        step: "webhooks",
      };
    },
    {
      connection,
      concurrency: 20,
    },
  );

  const allWorkers = [...workers, webhooksWorker];

  const workerMap: Record<string, any> = {
    researchWorker,
    draftingWorker,
    outreachWorker,
    sequenceSchedulerWorker,
    emailSenderWorker,
    replyMonitorWorker,
    dataRetentionWorker,
    webhooksWorker,
    ingestionWorker,
  };

  const undefinedWorkers = Object.entries(workerMap)
    .filter(([_, w]) => !w)
    .map(([name]) => name);

  if (undefinedWorkers.length > 0) {
    console.error("Worker export validation failed:");
    for (const [name, worker] of Object.entries(workerMap)) {
      console.error(`- ${name}: ${worker ? "OK" : "UNDEFINED"}`);
    }
  }

  for (const [name, worker] of Object.entries(workerMap)) {
    if (!worker) continue;

    worker.on("completed", (job: any) => {
      console.log(`Job completed: ${worker.name} - ${job.id}`);
    });

    worker.on("failed", (job: any, err: any) => {
      console.error(
        `Job failed: ${worker.name} - ${job?.id ?? "unknown"}`,
        err,
      );
    });

    worker.on("error", (err: any) => {
      console.error(`Worker error: ${worker.name}`, err);
    });
  }

  console.log("Workers are running and listening to queues.");

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down workers...`);

    await Promise.all(allWorkers.map((worker) => worker.close()));

    await dataRetentionQueue.close();
    await connection.quit();

    console.log("Workers shut down successfully.");

    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

start().catch((error) => {
  console.error("Failed to start worker:", error);

  process.exit(1);
});
