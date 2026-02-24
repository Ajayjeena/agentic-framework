/**
 * BullMQ-based job queue (requires bullmq + Redis).
 */
import type { JobQueue, JobPayload, JobResult } from "./types.js";
export interface BullMQQueueOptions {
    queueName?: string;
    connection?: {
        host?: string;
        port?: number;
    } | string;
}
/**
 * BullMQ job queue for durable, distributed task execution.
 */
export declare class BullMQJobQueue implements JobQueue {
    private options;
    private queue;
    private worker;
    private initPromise;
    constructor(options?: BullMQQueueOptions);
    private getQueue;
    enqueue(payload: JobPayload, opts?: {
        delayMs?: number;
        jobId?: string;
    }): Promise<string>;
    process(handler: (payload: JobPayload) => Promise<JobResult>): () => void;
}
//# sourceMappingURL=bullmq-queue.d.ts.map