import type { AgentGraph, GraphNodeId } from "./graph.js";
import type { Checkpointer } from "@agent-framework/core";
import type { HumanInTheLoopOptions } from "./hitl-handler.js";
export interface RunOptions {
    threadId: string;
    initialState?: Record<string, unknown>;
    maxSteps?: number;
    /** Override HITL for this run; undefined = use runtime default */
    hitl?: HumanInTheLoopOptions | null;
}
export interface RunResult {
    state: Record<string, unknown>;
    currentNodeId: GraphNodeId;
    steps: number;
    ended: boolean;
    /** True if terminated by HITL */
    terminatedByHuman?: boolean;
}
/**
 * Agent runtime: executes a graph-based state machine with checkpointing and optional HITL.
 */
export declare class AgentRuntime {
    private graph;
    private checkpointer;
    private hitlOptions?;
    constructor(graph: AgentGraph<Record<string, unknown>>, checkpointer: Checkpointer, hitlOptions?: HumanInTheLoopOptions | undefined);
    private runIntercept;
    /**
     * Run the graph from entry (or from last checkpoint if threadId has state).
     */
    run(options: RunOptions): Promise<RunResult>;
    resume(threadId: string, maxSteps?: number): Promise<RunResult>;
}
//# sourceMappingURL=runtime.d.ts.map