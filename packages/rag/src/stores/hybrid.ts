/**
 * Hybrid search: combines vector similarity with keyword (BM25-style) scoring.
 */
import type { VectorDocument, SearchResult } from "../types.js";
import type { VectorStore } from "../vector-store.js";

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/\W+/g, " ").trim().split(/\s+/).filter(Boolean);
}

function bm25Score(queryTokens: string[], docContent: string, k1 = 1.5, b = 0.75): number {
  const docTokens = tokenize(docContent);
  const docLen = docTokens.length;
  if (docLen === 0) return 0;
  const avgDocLen = docLen;
  let score = 0;
  for (const t of queryTokens) {
    const tf = docTokens.filter((x) => x === t).length;
    if (tf === 0) continue;
    const idf = Math.log(1 + (1 + docLen) / (tf + 0.5));
    score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLen)));
  }
  return score;
}

export interface HybridVectorStoreOptions {
  /** Weight for vector score (0-1); keyword weight = 1 - vectorWeight */
  vectorWeight?: number;
}

/**
 * Wraps a VectorStore and adds keyword scoring; merges with configurable weights.
 */
export class HybridVectorStore implements VectorStore {
  constructor(
    private vectorStore: VectorStore,
    private options: HybridVectorStoreOptions = {}
  ) {}

  async add(documents: VectorDocument[]): Promise<void> {
    await this.vectorStore.add(documents);
  }

  async search(
    embedding: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<SearchResult[]> {
    const vectorResults = await this.vectorStore.search(embedding, topK * 2, filter);
    const vWeight = this.options.vectorWeight ?? 0.7;
    const kWeight = 1 - vWeight;

    const vMax = vectorResults.length > 0 ? Math.max(...vectorResults.map((r) => r.score)) : 1;
    const queryText = (filter && "_query" in filter && typeof filter._query === "string")
      ? filter._query
      : "";
    const queryTokens = queryText ? tokenize(queryText) : [];

    const combined = vectorResults.map((r) => {
      const vNorm = vMax > 0 ? r.score / vMax : 0;
      const kNorm =
        queryTokens.length > 0
          ? Math.min(1, bm25Score(queryTokens, r.document.content) / 10)
          : 0;
      const combinedScore = vWeight * vNorm + kWeight * kNorm;
      return { ...r, score: combinedScore };
    });

    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, topK);
  }

  async delete(ids: string[]): Promise<void> {
    if (this.vectorStore.delete) await this.vectorStore.delete(ids);
  }
}
