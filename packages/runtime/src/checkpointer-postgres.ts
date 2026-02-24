/**
 * Postgres-backed checkpointer for durable execution (production).
 */
import type { Checkpointer, ThreadStateSnapshot } from "@agent-framework/core";

export interface PostgresCheckpointerOptions {
  connectionString?: string;
  tableName?: string;
}

/**
 * Postgres checkpointer; requires pg package.
 */
export class PostgresCheckpointer implements Checkpointer {
  private pool: import("pg").Pool | null = null;
  private initPromise: Promise<void> | null = null;
  private tableName: string;

  constructor(private options: PostgresCheckpointerOptions = {}) {
    this.tableName = options.tableName ?? "agent_framework_checkpoints";
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
          thread_id TEXT NOT NULL,
          node_id TEXT NOT NULL,
          state JSONB NOT NULL,
          timestamp DOUBLE PRECISION NOT NULL,
          version INT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS agent_fw_cp_thread_idx 
        ON ${this.tableName} (thread_id, created_at DESC);
      `);
    })();
    await this.initPromise;
    return this.pool!;
  }

  async put(snapshot: ThreadStateSnapshot): Promise<void> {
    const pool = await this.getPool();
    await pool.query(
      `INSERT INTO ${this.tableName} (thread_id, node_id, state, timestamp, version) VALUES ($1, $2, $3, $4, $5)`,
      [
        snapshot.threadId,
        snapshot.nodeId,
        JSON.stringify(snapshot.state),
        snapshot.timestamp,
        snapshot.version ?? 0,
      ]
    );
  }

  async get(threadId: string): Promise<ThreadStateSnapshot | null> {
    const pool = await this.getPool();
    const res = await pool.query(
      `SELECT node_id, state, timestamp, version FROM ${this.tableName} 
       WHERE thread_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [threadId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      threadId,
      nodeId: row.node_id,
      state: row.state as Record<string, unknown>,
      timestamp: parseFloat(row.timestamp),
      version: row.version,
    };
  }

  async list(threadId: string): Promise<ThreadStateSnapshot[]> {
    const pool = await this.getPool();
    const res = await pool.query(
      `SELECT node_id, state, timestamp, version FROM ${this.tableName} 
       WHERE thread_id = $1 ORDER BY created_at ASC`,
      [threadId]
    );
    return res.rows.map((row: { node_id: string; state: object; timestamp: string; version: number }) => ({
      threadId,
      nodeId: row.node_id,
      state: row.state as Record<string, unknown>,
      timestamp: parseFloat(row.timestamp),
      version: row.version,
    }));
  }

  async delete(threadId: string, nodeId?: string): Promise<void> {
    const pool = await this.getPool();
    if (nodeId === undefined) {
      await pool.query(`DELETE FROM ${this.tableName} WHERE thread_id = $1`, [threadId]);
    } else {
      await pool.query(
        `DELETE FROM ${this.tableName} WHERE thread_id = $1 AND node_id = $2`,
        [threadId, nodeId]
      );
    }
  }
}
