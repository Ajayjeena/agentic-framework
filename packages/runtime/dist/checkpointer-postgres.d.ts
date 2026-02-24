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
export declare class PostgresCheckpointer implements Checkpointer {
    private options;
    private pool;
    private initPromise;
    private tableName;
    constructor(options?: PostgresCheckpointerOptions);
    private getPool;
    put(snapshot: ThreadStateSnapshot): Promise<void>;
    get(threadId: string): Promise<ThreadStateSnapshot | null>;
    list(threadId: string): Promise<ThreadStateSnapshot[]>;
    delete(threadId: string, nodeId?: string): Promise<void>;
}
//# sourceMappingURL=checkpointer-postgres.d.ts.map