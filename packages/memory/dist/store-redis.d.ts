import type { MemoryStore, MemoryEntry, MemorySearchResult, MemoryReadOptions, MemorySearchOptions, MemoryWriteOptions } from "@agent-framework/core";
export interface RedisMemoryStoreOptions {
    url?: string;
    prefix?: string;
}
/**
 * Redis-backed MemoryStore (multi-node / production).
 */
export declare class RedisMemoryStore implements MemoryStore {
    private options;
    private prefix;
    private client;
    private initPromise;
    constructor(options?: RedisMemoryStoreOptions);
    private getClient;
    private key;
    private serialize;
    private deserialize;
    read(threadId: string, options?: MemoryReadOptions): Promise<MemoryEntry[]>;
    write(threadId: string, entry: Omit<MemoryEntry, "id" | "createdAt">, options?: MemoryWriteOptions): Promise<MemoryEntry>;
    search(threadId: string, options: MemorySearchOptions): Promise<MemorySearchResult[]>;
    prune(threadId: string, options?: {
        before?: number;
        keepLast?: number;
    }): Promise<void>;
    delete(threadId: string, entryId: string): Promise<void>;
}
//# sourceMappingURL=store-redis.d.ts.map