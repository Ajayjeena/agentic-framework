/**
 * Text chunker: split documents into chunks for embedding.
 */
import type { Document, DocumentChunk } from "./types.js";
export interface ChunkerOptions {
    chunkSize?: number;
    chunkOverlap?: number;
}
/**
 * Split documents into overlapping chunks.
 */
export declare function chunkDocuments(documents: Document[], options?: ChunkerOptions): DocumentChunk[];
//# sourceMappingURL=chunker.d.ts.map