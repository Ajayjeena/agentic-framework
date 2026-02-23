/**
 * Reranker: optional post-retrieval reranking.
 */
import type { SearchResult, RerankResult } from "./types.js";

export interface Reranker {
  rerank(query: string, results: SearchResult[], topK?: number): Promise<RerankResult[]>;
}
