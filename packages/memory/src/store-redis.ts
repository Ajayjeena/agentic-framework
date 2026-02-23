import type {
  MemoryStore,
  MemoryEntry,
  MemorySearchResult,
  MemoryReadOptions,
  MemorySearchOptions,
  MemoryWriteOptions,
} from "@agent-framework/core";
import { randomUUID } from "crypto";

export interface RedisMemoryStoreOptions {
  url?: string;
  prefix?: string;
}

/**
 * Redis-backed MemoryStore (multi-node / production).
 */
export class RedisMemoryStore implements MemoryStore {
  private prefix: string;
  private client: import("ioredis").Redis | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private options: RedisMemoryStoreOptions = {}) {
    this.prefix = options.prefix ?? "agent_framework:memory:";
  }

  private async getClient(): Promise<import("ioredis").Redis> {
    if (this.client) return this.client;
    if (this.initPromise) {
      await this.initPromise;
      return this.client!;
    }
    this.initPromise = (async () => {
      const mod = await import("ioredis");
      const Redis = (mod as unknown as { default?: new (url?: string) => import("ioredis").Redis }).default ?? (mod as unknown as new (url?: string) => import("ioredis").Redis);
      this.client = this.options.url ? new Redis(this.options.url) : new Redis();
    })();
    await this.initPromise;
    return this.client!;
  }

  private key(threadId: string): string {
    return `${this.prefix}${threadId}`;
  }

  private serialize(entry: MemoryEntry): string {
    return JSON.stringify({
      id: entry.id,
      content: entry.content,
      metadata: entry.metadata,
      tenantId: entry.tenantId,
      createdAt: entry.createdAt,
      ttl: entry.ttl,
    });
  }

  private deserialize(raw: string): MemoryEntry {
    const o = JSON.parse(raw) as MemoryEntry;
    return {
      id: o.id,
      content: o.content,
      metadata: o.metadata,
      tenantId: o.tenantId,
      createdAt: o.createdAt,
      ttl: o.ttl,
    };
  }

  async read(
    threadId: string,
    options?: MemoryReadOptions
  ): Promise<MemoryEntry[]> {
    const redis = await this.getClient();
    const key = this.key(threadId);
    const rawList = await redis.lrange(key, 0, -1);
    let list = rawList.map((r) => this.deserialize(r));
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
    const redis = await this.getClient();
    await redis.rpush(this.key(threadId), this.serialize(full));
    return full;
  }

  async search(
    threadId: string,
    options: MemorySearchOptions
  ): Promise<MemorySearchResult[]> {
    const list = await this.read(threadId, options);
    let results: MemorySearchResult[] = list.map((e) => ({ ...e, score: 1 }));
    if (options.topK !== undefined) {
      results = results.slice(-options.topK);
    }
    return results;
  }

  async prune(
    threadId: string,
    options?: { before?: number; keepLast?: number }
  ): Promise<void> {
    const redis = await this.getClient();
    const key = this.key(threadId);
    const rawList = await redis.lrange(key, 0, -1);
    let list = rawList.map((r) => this.deserialize(r));
    if (options?.before !== undefined) {
      list = list.filter((e) => (e.createdAt ?? 0) >= options.before!);
    }
    if (options?.keepLast !== undefined) {
      list = list.slice(-options.keepLast);
    }
    await redis.del(key);
    for (const e of list) {
      await redis.rpush(key, this.serialize(e));
    }
  }

  async delete(threadId: string, entryId: string): Promise<void> {
    const redis = await this.getClient();
    const key = this.key(threadId);
    const rawList = await redis.lrange(key, 0, -1);
    const filtered = rawList.filter((r) => this.deserialize(r).id !== entryId);
    await redis.del(key);
    for (const r of filtered) {
      await redis.rpush(key, r);
    }
  }
}
