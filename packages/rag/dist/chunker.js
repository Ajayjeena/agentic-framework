/**
 * Split documents into overlapping chunks.
 */
export function chunkDocuments(documents, options = {}) {
    const { chunkSize = 512, chunkOverlap = 50 } = options;
    const chunks = [];
    for (const doc of documents) {
        const text = doc.content;
        let start = 0;
        let idx = 0;
        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            const content = text.slice(start, end);
            chunks.push({
                ...doc,
                id: `${doc.id}#${idx}`,
                content,
                chunkIndex: idx,
                startChar: start,
                endChar: end,
            });
            start = end - chunkOverlap;
            if (start >= text.length)
                break;
            idx++;
        }
    }
    return chunks;
}
//# sourceMappingURL=chunker.js.map