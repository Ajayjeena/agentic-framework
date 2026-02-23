import { z } from "zod";
/**
 * Thread identifier for per-workflow state and checkpointing.
 */
export declare const ThreadIdSchema: z.ZodString;
export type ThreadId = z.infer<typeof ThreadIdSchema>;
/**
 * Snapshot of graph state at a node (for checkpointing).
 */
export interface ThreadStateSnapshot {
    threadId: string;
    nodeId: string;
    state: Record<string, unknown>;
    timestamp: number;
    version?: number;
}
//# sourceMappingURL=thread.d.ts.map