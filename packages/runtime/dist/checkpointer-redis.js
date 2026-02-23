/**
 * Redis-backed checkpointer for durable execution (multi-node / production).
 * Requires optional dependency: redis
 */
export class RedisCheckpointer {
    options;
    prefix;
    client = null;
    initPromise = null;
    constructor(options = {}) {
        this.options = options;
        this.prefix = options.prefix ?? "agent_framework:checkpoint:";
    }
    async getClient() {
        if (this.client)
            return this.client;
        if (this.initPromise) {
            await this.initPromise;
            return this.client;
        }
        this.initPromise = (async () => {
            const mod = await import("ioredis");
            const Redis = mod.default ?? mod;
            this.client = this.options.url ? new Redis(this.options.url) : new Redis();
        })();
        await this.initPromise;
        return this.client;
    }
    key(threadId) {
        return `${this.prefix}${threadId}`;
    }
    async put(snapshot) {
        const redis = await this.getClient();
        const key = this.key(snapshot.threadId);
        const payload = JSON.stringify({
            threadId: snapshot.threadId,
            nodeId: snapshot.nodeId,
            state: snapshot.state,
            timestamp: snapshot.timestamp,
            version: snapshot.version,
        });
        await redis.rpush(key, payload);
    }
    async get(threadId) {
        const redis = await this.getClient();
        const key = this.key(threadId);
        const list = await redis.lrange(key, -1, -1);
        if (!list.length)
            return null;
        const raw = list[0];
        const data = JSON.parse(raw);
        return {
            threadId: data.threadId,
            nodeId: data.nodeId,
            state: data.state,
            timestamp: data.timestamp,
            version: data.version,
        };
    }
    async list(threadId) {
        const redis = await this.getClient();
        const key = this.key(threadId);
        const list = await redis.lrange(key, 0, -1);
        return list.map((raw) => {
            const data = JSON.parse(raw);
            return {
                threadId: data.threadId,
                nodeId: data.nodeId,
                state: data.state,
                timestamp: data.timestamp,
                version: data.version,
            };
        });
    }
    async delete(threadId, nodeId) {
        const redis = await this.getClient();
        const key = this.key(threadId);
        if (nodeId === undefined) {
            await redis.del(key);
            return;
        }
        const list = await redis.lrange(key, 0, -1);
        const filtered = list.filter((raw) => {
            const data = JSON.parse(raw);
            return data.nodeId !== nodeId;
        });
        await redis.del(key);
        for (const raw of filtered) {
            await redis.rpush(key, raw);
        }
    }
}
//# sourceMappingURL=checkpointer-redis.js.map