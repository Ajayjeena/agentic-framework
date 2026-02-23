import type { Checkpointer, ThreadStateSnapshot } from "@agent-framework/core";
export interface RedisCheckpointerOptions {
    /** Redis URL or connection options */
    url?: string;
    /** Key prefix for thread state keys */
    prefix?: string;
}
/**
 * Redis-backed checkpointer for durable execution (multi-node / production).
 * Requires optional dependency: redis
 */
export declare class RedisCheckpointer implements Checkpointer {
    private options;
    private prefix;
    private client;
    private initPromise;
    constructor(options?: RedisCheckpointerOptions);
    private getClient;
    private key;
    put(snapshot: ThreadStateSnapshot): Promise<void>;
    get(threadId: string): Promise<ThreadStateSnapshot | null>;
    list(threadId: string): Promise<ThreadStateSnapshot[]>;
    delete(threadId: string, nodeId?: string): Promise<void>;
}
//# sourceMappingURL=checkpointer-redis.d.ts.map