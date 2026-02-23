import type { AgentGraph, GraphNodeId } from "./graph.js";
import type { Checkpointer } from "@agent-framework/core";
export interface RunOptions {
    threadId: string;
    initialState?: Record<string, unknown>;
    maxSteps?: number;
}
export interface RunResult {
    state: Record<string, unknown>;
    currentNodeId: GraphNodeId;
    steps: number;
    ended: boolean;
}
/**
 * Agent runtime: executes a graph-based state machine with checkpointing.
 */
export declare class AgentRuntime {
    private graph;
    private checkpointer;
    constructor(graph: AgentGraph<Record<string, unknown>>, checkpointer: Checkpointer);
    /**
     * Run the graph from entry (or from last checkpoint if threadId has state).
     */
    run(options: RunOptions): Promise<RunResult>;
    /**
     * Resume from checkpoint (convenience; run() already does this).
     */
    resume(threadId: string, maxSteps?: number): Promise<RunResult>;
}
//# sourceMappingURL=runtime.d.ts.map