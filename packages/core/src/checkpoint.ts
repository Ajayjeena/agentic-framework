import type { ThreadStateSnapshot } from "./thread.js";

/**
 * Checkpointer interface: persist and restore workflow state for durable execution.
 * Implementations: in-memory, Redis, Postgres.
 */
export interface Checkpointer {
  put(snapshot: ThreadStateSnapshot): Promise<void>;
  get(threadId: string): Promise<ThreadStateSnapshot | null>;
  list(threadId: string): Promise<ThreadStateSnapshot[]>;
  delete(threadId: string, nodeId?: string): Promise<void>;
}
