/**
 * Retriever: unified RAG retrieval with optional rerank.
 */
import type { DocumentChunk, SearchResult, RerankResult } from "./types.js";
import type { VectorStore } from "./vector-store.js";
import type { Reranker } from "./reranker.js";

export interface RetrieverOptions {
  topK?: number;
  reranker?: Reranker;
}

/**
 * Retrieve documents by embedding query; optionally rerank results.
 */
export class Retriever {
  constructor(
    private vectorStore: VectorStore,
    private embedFn: (text: string) => Promise<number[]>,
    private options: RetrieverOptions = {}
  ) {}

  async retrieve(query: string, topK?: number, filter?: Record<string, unknown>): Promise<SearchResult[] | RerankResult[]> {
    const k = topK ?? this.options.topK ?? 10;
    const embedding = await this.embedFn(query);
    const results = await this.vectorStore.search(embedding, k * 2, filter);

    if (this.options.reranker) {
      return this.options.reranker.rerank(query, results, k);
    }
    return results.slice(0, k);
  }
}
