/**
 * BullMQ-based job queue (requires bullmq + Redis).
 */
import type { JobQueue, JobPayload, JobResult } from "./types.js";

export interface BullMQQueueOptions {
  queueName?: string;
  connection?: { host?: string; port?: number } | string;
}

/**
 * BullMQ job queue for durable, distributed task execution.
 */
export class BullMQJobQueue implements JobQueue {
  private queue: import("bullmq").Queue | null = null;
  private worker: import("bullmq").Worker | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private options: BullMQQueueOptions = {}) {}

  private async getQueue(): Promise<import("bullmq").Queue> {
    if (this.queue) return this.queue;
    if (this.initPromise) {
      await this.initPromise;
      return this.queue!;
    }
    this.initPromise = (async () => {
      const { Queue } = await import("bullmq");
      const conn = this.options.connection ?? process.env.REDIS_URL ?? "redis://localhost:6379";
      this.queue = new Queue(this.options.queueName ?? "agent-framework", {
        connection: typeof conn === "string" ? { url: conn } : conn,
      });
    })();
    await this.initPromise;
    return this.queue!;
  }

  async enqueue(
    payload: JobPayload,
    opts?: { delayMs?: number; jobId?: string }
  ): Promise<string> {
    const queue = await this.getQueue();
    const job = await queue.add(payload.type, payload, {
      delay: opts?.delayMs,
      jobId: opts?.jobId,
      attempts: payload.retries ?? 3,
      backoff: { type: "exponential", delay: 1000 },
    });
    return job.id ?? "";
  }

  process(handler: (payload: JobPayload) => Promise<JobResult>): () => void {
    if (this.worker) {
      return () => this.worker?.close();
    }
    (async () => {
      const { Worker } = await import("bullmq");
      const conn = this.options.connection ?? process.env.REDIS_URL ?? "redis://localhost:6379";
      this.worker = new Worker(
        this.options.queueName ?? "agent-framework",
        async (job) => {
          const result = await handler(job.data as JobPayload);
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        {
          connection: typeof conn === "string" ? { url: conn } : conn,
        }
      );
    })();
    return () => this.worker?.close();
  }
}
