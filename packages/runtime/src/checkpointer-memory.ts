import type { Checkpointer, ThreadStateSnapshot } from "@agent-framework/core";

/**
 * In-memory checkpointer for durable execution (development / single-node).
 */
export class InMemoryCheckpointer implements Checkpointer {
  private store = new Map<string, ThreadStateSnapshot[]>();

  async put(snapshot: ThreadStateSnapshot): Promise<void> {
    const key = snapshot.threadId;
    const list = this.store.get(key) ?? [];
    list.push(snapshot);
    this.store.set(key, list);
  }

  async get(threadId: string): Promise<ThreadStateSnapshot | null> {
    const list = this.store.get(threadId);
    if (!list?.length) return null;
    return list[list.length - 1] ?? null;
  }

  async list(threadId: string): Promise<ThreadStateSnapshot[]> {
    return this.store.get(threadId) ?? [];
  }

  async delete(threadId: string, nodeId?: string): Promise<void> {
    if (nodeId === undefined) {
      this.store.delete(threadId);
      return;
    }
    const list = this.store.get(threadId) ?? [];
    const next = list.filter((s) => s.nodeId !== nodeId);
    if (next.length) this.store.set(threadId, next);
    else this.store.delete(threadId);
  }
}
