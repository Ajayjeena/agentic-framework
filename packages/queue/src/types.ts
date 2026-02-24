/**
 * Job queue interface: durable, async task execution.
 */
export interface JobPayload {
  type: string;
  data: Record<string, unknown>;
  tenantId?: string;
  retries?: number;
}

export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface JobQueue {
  enqueue(payload: JobPayload, options?: { delayMs?: number; jobId?: string }): Promise<string>;
  process(handler: (payload: JobPayload) => Promise<JobResult>): () => void;
}
