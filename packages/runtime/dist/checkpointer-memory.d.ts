import type { Checkpointer, ThreadStateSnapshot } from "@agent-framework/core";
/**
 * In-memory checkpointer for durable execution (development / single-node).
 */
export declare class InMemoryCheckpointer implements Checkpointer {
    private store;
    put(snapshot: ThreadStateSnapshot): Promise<void>;
    get(threadId: string): Promise<ThreadStateSnapshot | null>;
    list(threadId: string): Promise<ThreadStateSnapshot[]>;
    delete(threadId: string, nodeId?: string): Promise<void>;
}
//# sourceMappingURL=checkpointer-memory.d.ts.map