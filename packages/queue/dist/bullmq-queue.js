/**
 * BullMQ job queue for durable, distributed task execution.
 */
export class BullMQJobQueue {
    options;
    queue = null;
    worker = null;
    initPromise = null;
    constructor(options = {}) {
        this.options = options;
    }
    async getQueue() {
        if (this.queue)
            return this.queue;
        if (this.initPromise) {
            await this.initPromise;
            return this.queue;
        }
        this.initPromise = (async () => {
            const { Queue } = await import("bullmq");
            const conn = this.options.connection ?? process.env.REDIS_URL ?? "redis://localhost:6379";
            this.queue = new Queue(this.options.queueName ?? "agent-framework", {
                connection: typeof conn === "string" ? { url: conn } : conn,
            });
        })();
        await this.initPromise;
        return this.queue;
    }
    async enqueue(payload, opts) {
        const queue = await this.getQueue();
        const job = await queue.add(payload.type, payload, {
            delay: opts?.delayMs,
            jobId: opts?.jobId,
            attempts: payload.retries ?? 3,
            backoff: { type: "exponential", delay: 1000 },
        });
        return job.id ?? "";
    }
    process(handler) {
        if (this.worker) {
            return () => this.worker?.close();
        }
        (async () => {
            const { Worker } = await import("bullmq");
            const conn = this.options.connection ?? process.env.REDIS_URL ?? "redis://localhost:6379";
            this.worker = new Worker(this.options.queueName ?? "agent-framework", async (job) => {
                const result = await handler(job.data);
                if (!result.success)
                    throw new Error(result.error);
                return result.data;
            }, {
                connection: typeof conn === "string" ? { url: conn } : conn,
            });
        })();
        return () => this.worker?.close();
    }
}
//# sourceMappingURL=bullmq-queue.js.map