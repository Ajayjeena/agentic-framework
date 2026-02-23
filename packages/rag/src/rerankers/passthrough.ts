/**
 * Passthrough reranker: returns results as-is (no reranking).
 * Use when no reranker is available or for testing.
 */
import type { SearchResult, RerankResult } from "../types.js";
import type { Reranker } from "../reranker.js";

export class PassthroughReranker implements Reranker {
  async rerank(_query: string, results: SearchResult[], topK?: number): Promise<RerankResult[]> {
    const sliced = topK ? results.slice(0, topK) : results;
    return sliced.map((r) => ({ ...r, rerankScore: r.score }));
  }
}
