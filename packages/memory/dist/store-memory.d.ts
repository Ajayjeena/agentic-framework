import type { MemoryStore, MemoryEntry, MemorySearchResult, MemoryReadOptions, MemorySearchOptions, MemoryWriteOptions } from "@agent-framework/core";
/**
 * In-memory MemoryStore (development / single-node).
 */
export declare class InMemoryMemoryStore implements MemoryStore {
    private store;
    read(threadId: string, options?: MemoryReadOptions): Promise<MemoryEntry[]>;
    write(threadId: string, entry: Omit<MemoryEntry, "id" | "createdAt">, options?: MemoryWriteOptions): Promise<MemoryEntry>;
    search(threadId: string, options: MemorySearchOptions): Promise<MemorySearchResult[]>;
    prune(threadId: string, options?: {
        before?: number;
        keepLast?: number;
    }): Promise<void>;
    delete(threadId: string, entryId: string): Promise<void>;
}
//# sourceMappingURL=store-memory.d.ts.map