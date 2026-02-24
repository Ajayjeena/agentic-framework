import { randomUUID } from "crypto";
/**
 * Postgres-backed MemoryStore (production); supports tenant isolation.
 */
export class PostgresMemoryStore {
    options;
    pool = null;
    initPromise = null;
    tableName;
    constructor(options = {}) {
        this.options = options;
        this.tableName = options.tableName ?? "agent_framework_memory";
    }
    async getPool() {
        if (this.pool)
            return this.pool;
        if (this.initPromise) {
            await this.initPromise;
            return this.pool;
        }
        this.initPromise = (async () => {
            const mod = await import("pg");
            const Pool = mod.Pool;
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
        return this.pool;
    }
    async read(threadId, options) {
        const pool = await this.getPool();
        let q = `SELECT id, content, metadata, tenant_id, created_at, ttl FROM ${this.tableName} WHERE thread_id = $1`;
        const params = [threadId];
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
        return res.rows.map((r) => ({
            id: r.id,
            content: r.content,
            metadata: r.metadata ?? undefined,
            tenantId: r.tenant_id ?? undefined,
            createdAt: r.created_at,
            ttl: r.ttl ?? undefined,
        }));
    }
    async write(threadId, entry, options) {
        const pool = await this.getPool();
        const now = Date.now() / 1000;
        const id = randomUUID();
        const tenantId = options?.tenantId ?? entry.tenantId;
        await pool.query(`INSERT INTO ${this.tableName} (id, thread_id, content, metadata, tenant_id, created_at, ttl) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            id,
            threadId,
            entry.content,
            JSON.stringify(entry.metadata ?? {}),
            tenantId ?? null,
            now,
            options?.ttl ?? entry.ttl ?? null,
        ]);
        return {
            id,
            content: entry.content,
            metadata: entry.metadata,
            tenantId: tenantId ?? undefined,
            createdAt: now,
            ttl: options?.ttl ?? entry.ttl,
        };
    }
    async search(threadId, options) {
        const list = await this.read(threadId, options);
        let results = list.map((e) => ({ ...e, score: 1 }));
        if (options.topK !== undefined) {
            results = results.slice(-options.topK);
        }
        return results;
    }
    async prune(threadId, options) {
        const pool = await this.getPool();
        if (options?.before !== undefined) {
            await pool.query(`DELETE FROM ${this.tableName} WHERE thread_id = $1 AND created_at < $2`, [threadId, options.before]);
        }
        if (options?.keepLast !== undefined) {
            await pool.query(`WITH to_del AS (
          SELECT id FROM ${this.tableName} WHERE thread_id = $1
          ORDER BY created_at DESC OFFSET $2
        ) DELETE FROM ${this.tableName} WHERE id IN (SELECT id FROM to_del)`, [threadId, options.keepLast]);
        }
    }
    async delete(threadId, entryId) {
        const pool = await this.getPool();
        await pool.query(`DELETE FROM ${this.tableName} WHERE thread_id = $1 AND id = $2`, [
            threadId,
            entryId,
        ]);
    }
}
//# sourceMappingURL=store-postgres.js.map