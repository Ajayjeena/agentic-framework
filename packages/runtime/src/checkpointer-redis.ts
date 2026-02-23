import type { Checkpointer, ThreadStateSnapshot } from "@agent-framework/core";

export interface RedisCheckpointerOptions {
  /** Redis URL or connection options */
  url?: string;
  /** Key prefix for thread state keys */
  prefix?: string;
}

/**
 * Redis-backed checkpointer for durable execution (multi-node / production).
 * Requires optional dependency: redis
 */
export class RedisCheckpointer implements Checkpointer {
  private prefix: string;
  private client: import("ioredis").Redis | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private options: RedisCheckpointerOptions = {}) {
    this.prefix = options.prefix ?? "agent_framework:checkpoint:";
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

  async put(snapshot: ThreadStateSnapshot): Promise<void> {
    const redis = await this.getClient();
    const key = this.key(snapshot.threadId);
    const payload = JSON.stringify({
      threadId: snapshot.threadId,
      nodeId: snapshot.nodeId,
      state: snapshot.state,
      timestamp: snapshot.timestamp,
      version: snapshot.version,
    });
    await redis.rpush(key, payload);
  }

  async get(threadId: string): Promise<ThreadStateSnapshot | null> {
    const redis = await this.getClient();
    const key = this.key(threadId);
    const list = await redis.lrange(key, -1, -1);
    if (!list.length) return null;
    const raw = list[0];
    const data = JSON.parse(raw) as ThreadStateSnapshot;
    return {
      threadId: data.threadId,
      nodeId: data.nodeId,
      state: data.state,
      timestamp: data.timestamp,
      version: data.version,
    };
  }

  async list(threadId: string): Promise<ThreadStateSnapshot[]> {
    const redis = await this.getClient();
    const key = this.key(threadId);
    const list = await redis.lrange(key, 0, -1);
    return list.map((raw) => {
      const data = JSON.parse(raw) as ThreadStateSnapshot;
      return {
        threadId: data.threadId,
        nodeId: data.nodeId,
        state: data.state,
        timestamp: data.timestamp,
        version: data.version,
      };
    });
  }

  async delete(threadId: string, nodeId?: string): Promise<void> {
    const redis = await this.getClient();
    const key = this.key(threadId);
    if (nodeId === undefined) {
      await redis.del(key);
      return;
    }
    const list = await redis.lrange(key, 0, -1);
    const filtered = list.filter((raw) => {
      const data = JSON.parse(raw) as ThreadStateSnapshot;
      return data.nodeId !== nodeId;
    });
    await redis.del(key);
    for (const raw of filtered) {
      await redis.rpush(key, raw);
    }
  }
}
