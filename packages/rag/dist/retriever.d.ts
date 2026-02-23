/**
 * Retriever: unified RAG retrieval with optional rerank.
 */
import type { SearchResult, RerankResult } from "./types.js";
import type { VectorStore } from "./vector-store.js";
import type { Reranker } from "./reranker.js";
export interface RetrieverOptions {
    topK?: number;
    reranker?: Reranker;
}
/**
 * Retrieve documents by embedding query; optionally rerank results.
 */
export declare class Retriever {
    private vectorStore;
    private embedFn;
    private options;
    constructor(vectorStore: VectorStore, embedFn: (text: string) => Promise<number[]>, options?: RetrieverOptions);
    retrieve(query: string, topK?: number, filter?: Record<string, unknown>): Promise<SearchResult[] | RerankResult[]>;
}
//# sourceMappingURL=retriever.d.ts.map