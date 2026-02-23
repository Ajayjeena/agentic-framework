/**
 * Passthrough reranker: returns results as-is (no reranking).
 * Use when no reranker is available or for testing.
 */
import type { SearchResult, RerankResult } from "../types.js";
import type { Reranker } from "../reranker.js";
export declare class PassthroughReranker implements Reranker {
    rerank(_query: string, results: SearchResult[], topK?: number): Promise<RerankResult[]>;
}
//# sourceMappingURL=passthrough.d.ts.map