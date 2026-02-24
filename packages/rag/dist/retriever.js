/**
 * Retrieve documents by embedding query; optionally rerank results.
 */
export class Retriever {
    vectorStore;
    embedFn;
    options;
    constructor(vectorStore, embedFn, options = {}) {
        this.vectorStore = vectorStore;
        this.embedFn = embedFn;
        this.options = options;
    }
    async retrieve(query, topK, filter) {
        const k = topK ?? this.options.topK ?? 10;
        const embedding = await this.embedFn(query);
        const searchFilter = filter ? { ...filter, _query: query } : { _query: query };
        const results = await this.vectorStore.search(embedding, k * 2, searchFilter);
        if (this.options.reranker) {
            return this.options.reranker.rerank(query, results, k);
        }
        return results.slice(0, k);
    }
}
//# sourceMappingURL=retriever.js.map