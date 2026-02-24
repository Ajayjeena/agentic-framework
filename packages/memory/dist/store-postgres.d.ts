import type { MemoryStore, MemoryEntry, MemorySearchResult, MemoryReadOptions, MemorySearchOptions, MemoryWriteOptions } from "@agent-framework/core";
export interface PostgresMemoryStoreOptions {
    connectionString?: string;
    tableName?: string;
}
/**
 * Postgres-backed MemoryStore (production); supports tenant isolation.
 */
export declare class PostgresMemoryStore implements MemoryStore {
    private options;
    private pool;
    private initPromise;
    private tableName;
    constructor(options?: PostgresMemoryStoreOptions);
    private getPool;
    read(threadId: string, options?: MemoryReadOptions): Promise<MemoryEntry[]>;
    write(threadId: string, entry: Omit<MemoryEntry, "id" | "createdAt">, options?: MemoryWriteOptions): Promise<MemoryEntry>;
    search(threadId: string, options: MemorySearchOptions): Promise<MemorySearchResult[]>;
    prune(threadId: string, options?: {
        before?: number;
        keepLast?: number;
    }): Promise<void>;
    delete(threadId: string, entryId: string): Promise<void>;
}
//# sourceMappingURL=store-postgres.d.ts.map