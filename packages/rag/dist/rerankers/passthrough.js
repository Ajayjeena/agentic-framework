export class PassthroughReranker {
    async rerank(_query, results, topK) {
        const sliced = topK ? results.slice(0, topK) : results;
        return sliced.map((r) => ({ ...r, rerankScore: r.score }));
    }
}
//# sourceMappingURL=passthrough.js.map