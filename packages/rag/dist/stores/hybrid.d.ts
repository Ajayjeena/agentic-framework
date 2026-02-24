/**
 * Hybrid search: combines vector similarity with keyword (BM25-style) scoring.
 */
import type { VectorDocument, SearchResult } from "../types.js";
import type { VectorStore } from "../vector-store.js";
export interface HybridVectorStoreOptions {
    /** Weight for vector score (0-1); keyword weight = 1 - vectorWeight */
    vectorWeight?: number;
}
/**
 * Wraps a VectorStore and adds keyword scoring; merges with configurable weights.
 */
export declare class HybridVectorStore implements VectorStore {
    private vectorStore;
    private options;
    constructor(vectorStore: VectorStore, options?: HybridVectorStoreOptions);
    add(documents: VectorDocument[]): Promise<void>;
    search(embedding: number[], topK: number, filter?: Record<string, unknown>): Promise<SearchResult[]>;
    delete(ids: string[]): Promise<void>;
}
//# sourceMappingURL=hybrid.d.ts.map