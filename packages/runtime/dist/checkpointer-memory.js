/**
 * In-memory checkpointer for durable execution (development / single-node).
 */
export class InMemoryCheckpointer {
    store = new Map();
    async put(snapshot) {
        const key = snapshot.threadId;
        const list = this.store.get(key) ?? [];
        list.push(snapshot);
        this.store.set(key, list);
    }
    async get(threadId) {
        const list = this.store.get(threadId);
        if (!list?.length)
            return null;
        return list[list.length - 1] ?? null;
    }
    async list(threadId) {
        return this.store.get(threadId) ?? [];
    }
    async delete(threadId, nodeId) {
        if (nodeId === undefined) {
            this.store.delete(threadId);
            return;
        }
        const list = this.store.get(threadId) ?? [];
        const next = list.filter((s) => s.nodeId !== nodeId);
        if (next.length)
            this.store.set(threadId, next);
        else
            this.store.delete(threadId);
    }
}
//# sourceMappingURL=checkpointer-memory.js.map