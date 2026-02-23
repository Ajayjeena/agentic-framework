/**
 * MemoryStore interface: first-class memory with pluggable backends.
 * Implementations: in-memory, Redis, Postgres+pgvector, S3.
 */
export interface MemoryEntry {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
    tenantId?: string;
    createdAt?: number;
    ttl?: number;
}
export interface MemorySearchResult extends MemoryEntry {
    score?: number;
}
export interface MemoryReadOptions {
    limit?: number;
    tenantId?: string;
    since?: number;
}
export interface MemorySearchOptions extends MemoryReadOptions {
    query?: string;
    topK?: number;
}
export interface MemoryWriteOptions {
    tenantId?: string;
    ttl?: number;
}
/**
 * Core MemoryStore interface for Phase 1.
 */
export interface MemoryStore {
    read(threadId: string, options?: MemoryReadOptions): Promise<MemoryEntry[]>;
    write(threadId: string, entry: Omit<MemoryEntry, "id" | "createdAt">, options?: MemoryWriteOptions): Promise<MemoryEntry>;
    search(threadId: string, options: MemorySearchOptions): Promise<MemorySearchResult[]>;
    prune(threadId: string, options?: {
        before?: number;
        keepLast?: number;
    }): Promise<void>;
    delete(threadId: string, entryId: string): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map