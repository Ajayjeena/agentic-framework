/**
 * Vector store interface: index and search by embedding.
 */
import type { DocumentChunk, VectorDocument, SearchResult } from "./types.js";

export interface VectorStore {
  /** Add documents with embeddings */
  add(documents: VectorDocument[]): Promise<void>;
  /** Search by embedding; returns top K results */
  search(embedding: number[], topK: number, filter?: Record<string, unknown>): Promise<SearchResult[]>;
  /** Delete by document IDs */
  delete?(ids: string[]): Promise<void>;
}
