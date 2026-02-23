/**
 * RAG types: documents, chunks, vectors, search results.
 */
export interface Document {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
    source?: string;
}
export interface DocumentChunk extends Document {
    chunkIndex: number;
    startChar?: number;
    endChar?: number;
}
export interface VectorDocument extends DocumentChunk {
    embedding: number[];
}
export interface SearchResult {
    document: DocumentChunk;
    score: number;
}
export interface RerankResult extends SearchResult {
    rerankScore?: number;
}
//# sourceMappingURL=types.d.ts.map