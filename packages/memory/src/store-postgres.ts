import type {
  MemoryStore,
  MemoryEntry,
  MemorySearchResult,
  MemoryReadOptions,
  MemorySearchOptions,
  MemoryWriteOptions,
} from "@agent-framework/core";
import { randomUUID } from "crypto";

export interface PostgresMemoryStoreOptions {
  connectionString?: string;
  tableName?: string;
}

/**
 * Postgres-backed MemoryStore (production); supports tenant isolation.
 */
export class PostgresMemoryStore implements MemoryStore {
  private pool: import("pg").Pool | null = null;
  private initPromise: Promise<void> | null = null;
  private tableName: string;

  constructor(private options: PostgresMemoryStoreOptions = {}) {
    this.tableName = options.tableName ?? "agent_framework_memory";
  }

  private async getPool(): Promise<import("pg").Pool> {
    if (this.pool) return this.pool;
    if (this.initPromise) {
      await this.initPromise;
      return this.pool!;
    }
    this.initPromise = (async () => {
      const mod = await import("pg");
      const Pool = (mod as { Pool: new (opts?: object) => import("pg").Pool }).Pool;
      this.pool = new Pool({
        connectionString: this.options.connectionString ?? process.env.DATABASE_URL,
      });
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id TEXT PRIMARY KEY,
          thread_id TEXT NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB,
          tenant_id TEXT,
          created_at DOUBLE PRECISION NOT NULL,
          ttl INT,
          UNIQUE(thread_id, id)
        );
        CREATE INDEX IF NOT EXISTS agent_fw_mem_thread_idx ON ${this.tableName} (thread_id);
        CREATE INDEX IF NOT EXISTS agent_fw_mem_tenant_idx ON ${this.tableName} (tenant_id);
      `);
    })();
    await this.initPromise;
    return this.pool!;
  }

  async read(threadId: string, options?: MemoryReadOptions): Promise<MemoryEntry[]> {
    const pool = await this.getPool();
    let q = `SELECT id, content, metadata, tenant_id, created_at, ttl FROM ${this.tableName} WHERE thread_id = $1`;
    const params: unknown[] = [threadId];
    if (options?.tenantId) {
      params.push(options.tenantId);
      q += ` AND tenant_id = $${params.length}`;
    }
    if (options?.since !== undefined) {
      params.push(options.since);
      q += ` AND created_at >= $${params.length}`;
    }
    q += ` ORDER BY created_at ASC`;
    if (options?.limit !== undefined) {
      params.push(options.limit);
      q += ` LIMIT $${params.length}`;
    }
    const res = await pool.query(q, params);
    return res.rows.map((r: { id: string; content: string; metadata?: Record<string, unknown>; tenant_id?: string; created_at: number; ttl?: number }) => ({
      id: r.id,
      content: r.content,
      metadata: r.metadata ?? undefined,
      tenantId: r.tenant_id ?? undefined,
      createdAt: r.created_at,
      ttl: r.ttl ?? undefined,
    }));
  }

  async write(
    threadId: string,
    entry: Omit<MemoryEntry, "id" | "createdAt">,
    options?: MemoryWriteOptions
  ): Promise<MemoryEntry> {
    const pool = await this.getPool();
    const now = Date.now() / 1000;
    const id = randomUUID();
    const tenantId = options?.tenantId ?? entry.tenantId;
    await pool.query(
      `INSERT INTO ${this.tableName} (id, thread_id, content, metadata, tenant_id, created_at, ttl) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        threadId,
        entry.content,
        JSON.stringify(entry.metadata ?? {}),
        tenantId ?? null,
        now,
        options?.ttl ?? entry.ttl ?? null,
      ]
    );
    return {
      id,
      content: entry.content,
      metadata: entry.metadata,
      tenantId: tenantId ?? undefined,
      createdAt: now,
      ttl: options?.ttl ?? entry.ttl,
    };
  }

  async search(threadId: string, options: MemorySearchOptions): Promise<MemorySearchResult[]> {
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
    const pool = await this.getPool();
    if (options?.before !== undefined) {
      await pool.query(
        `DELETE FROM ${this.tableName} WHERE thread_id = $1 AND created_at < $2`,
        [threadId, options.before]
      );
    }
    if (options?.keepLast !== undefined) {
      await pool.query(
        `WITH to_del AS (
          SELECT id FROM ${this.tableName} WHERE thread_id = $1
          ORDER BY created_at DESC OFFSET $2
        ) DELETE FROM ${this.tableName} WHERE id IN (SELECT id FROM to_del)`,
        [threadId, options.keepLast]
      );
    }
  }

  async delete(threadId: string, entryId: string): Promise<void> {
    const pool = await this.getPool();
    await pool.query(`DELETE FROM ${this.tableName} WHERE thread_id = $1 AND id = $2`, [
      threadId,
      entryId,
    ]);
  }
}
