/**
 * In-memory vector store: simple cosine similarity search.
 * For production, use pgvector, Chroma, etc.
 */
import type { VectorDocument, SearchResult } from "../types.js";
import type { VectorStore } from "../vector-store.js";
/**
 * In-memory vector store (development / small datasets).
 */
export declare class InMemoryVectorStore implements VectorStore {
    private documents;
    add(documents: VectorDocument[]): Promise<void>;
    search(embedding: number[], topK: number, _filter?: Record<string, unknown>): Promise<SearchResult[]>;
    delete(ids: string[]): Promise<void>;
}
//# sourceMappingURL=in-memory.d.ts.map