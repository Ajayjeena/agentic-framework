import { randomUUID } from "crypto";
/**
 * In-memory MemoryStore (development / single-node).
 */
export class InMemoryMemoryStore {
    store = new Map();
    async read(threadId, options) {
        let list = this.store.get(threadId) ?? [];
        if (options?.tenantId) {
            list = list.filter((e) => e.tenantId === options.tenantId);
        }
        if (options?.since !== undefined) {
            list = list.filter((e) => (e.createdAt ?? 0) >= options.since);
        }
        if (options?.limit !== undefined) {
            list = list.slice(-options.limit);
        }
        return list;
    }
    async write(threadId, entry, options) {
        const now = Date.now() / 1000;
        const full = {
            id: randomUUID(),
            content: entry.content,
            metadata: entry.metadata,
            tenantId: options?.tenantId ?? entry.tenantId,
            createdAt: now,
            ttl: options?.ttl ?? entry.ttl,
        };
        let list = this.store.get(threadId) ?? [];
        list.push(full);
        this.store.set(threadId, list);
        return full;
    }
    async search(threadId, options) {
        const list = await this.read(threadId, options);
        let results = list.map((e) => ({
            ...e,
            score: 1,
        }));
        if (options.topK !== undefined) {
            results = results.slice(-options.topK);
        }
        return results;
    }
    async prune(threadId, options) {
        let list = this.store.get(threadId) ?? [];
        if (options?.before !== undefined) {
            list = list.filter((e) => (e.createdAt ?? 0) >= options.before);
        }
        if (options?.keepLast !== undefined) {
            list = list.slice(-options.keepLast);
        }
        if (list.length)
            this.store.set(threadId, list);
        else
            this.store.delete(threadId);
    }
    async delete(threadId, entryId) {
        const list = (this.store.get(threadId) ?? []).filter((e) => e.id !== entryId);
        if (list.length)
            this.store.set(threadId, list);
        else
            this.store.delete(threadId);
    }
}
//# sourceMappingURL=store-memory.js.map