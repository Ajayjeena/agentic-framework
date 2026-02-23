import type {
  MemoryStore,
  MemoryEntry,
  MemorySearchResult,
  MemoryReadOptions,
  MemorySearchOptions,
  MemoryWriteOptions,
} from "@agent-framework/core";
import { randomUUID } from "crypto";

/**
 * In-memory MemoryStore (development / single-node).
 */
export class InMemoryMemoryStore implements MemoryStore {
  private store = new Map<string, MemoryEntry[]>();

  async read(
    threadId: string,
    options?: MemoryReadOptions
  ): Promise<MemoryEntry[]> {
    let list = this.store.get(threadId) ?? [];
    if (options?.tenantId) {
      list = list.filter((e) => e.tenantId === options.tenantId);
    }
    if (options?.since !== undefined) {
      list = list.filter((e) => (e.createdAt ?? 0) >= options.since!);
    }
    if (options?.limit !== undefined) {
      list = list.slice(-options.limit);
    }
    return list;
  }

  async write(
    threadId: string,
    entry: Omit<MemoryEntry, "id" | "createdAt">,
    options?: MemoryWriteOptions
  ): Promise<MemoryEntry> {
    const now = Date.now() / 1000;
    const full: MemoryEntry = {
      id: randomUUID(),
      content: entry.content,
      metadata: entry.metadata,
      tenantId: options?.tenantId ?? entry.tenantId,
      createdAt: now,
      ttl: options?.ttl ?? entry.ttl,
    };
    let list = this.store.get(threadId) ?? [];
    list.push(full);
    this.store.set(threadId, list);
    return full;
  }

  async search(
    threadId: string,
    options: MemorySearchOptions
  ): Promise<MemorySearchResult[]> {
    const list = await this.read(threadId, options);
    let results: MemorySearchResult[] = list.map((e) => ({
      ...e,
      score: 1,
    }));
    if (options.topK !== undefined) {
      results = results.slice(-options.topK);
    }
    return results;
  }

  async prune(
    threadId: string,
    options?: { before?: number; keepLast?: number }
  ): Promise<void> {
    let list = this.store.get(threadId) ?? [];
    if (options?.before !== undefined) {
      list = list.filter((e) => (e.createdAt ?? 0) >= options.before!);
    }
    if (options?.keepLast !== undefined) {
      list = list.slice(-options.keepLast);
    }
    if (list.length) this.store.set(threadId, list);
    else this.store.delete(threadId);
  }

  async delete(threadId: string, entryId: string): Promise<void> {
    const list = (this.store.get(threadId) ?? []).filter((e) => e.id !== entryId);
    if (list.length) this.store.set(threadId, list);
    else this.store.delete(threadId);
  }
}
