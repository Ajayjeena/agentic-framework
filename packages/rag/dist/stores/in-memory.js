function cosineSimilarity(a, b) {
    if (a.length !== b.length)
        return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}
/**
 * In-memory vector store (development / small datasets).
 */
export class InMemoryVectorStore {
    documents = [];
    async add(documents) {
        this.documents.push(...documents);
    }
    async search(embedding, topK, _filter) {
        const scored = this.documents.map((doc) => ({
            document: doc,
            score: cosineSimilarity(doc.embedding, embedding),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK).map(({ document, score }) => ({
            document: {
                id: document.id,
                content: document.content,
                metadata: document.metadata,
                source: document.source,
                chunkIndex: document.chunkIndex,
                startChar: document.startChar,
                endChar: document.endChar,
            },
            score,
        }));
    }
    async delete(ids) {
        const set = new Set(ids);
        this.documents = this.documents.filter((d) => !set.has(d.id));
    }
}
//# sourceMappingURL=in-memory.js.map