import type { AgentGraph, GraphNodeId } from "./graph.js";
import type { Checkpointer, ThreadStateSnapshot } from "@agent-framework/core";

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
export class AgentRuntime {
  constructor(
    private graph: AgentGraph<Record<string, unknown>>,
    private checkpointer: Checkpointer
  ) {}

  /**
   * Run the graph from entry (or from last checkpoint if threadId has state).
   */
  async run(options: RunOptions): Promise<RunResult> {
    const { threadId, initialState = {}, maxSteps = 100 } = options;
    let state = { ...initialState };
    let currentNodeId: GraphNodeId = this.graph.entry;
    let steps = 0;

    const last = await this.checkpointer.get(threadId);
    if (last) {
      currentNodeId = last.nodeId;
      state = { ...(last.state as Record<string, unknown>) };
    }

    const endNodes = this.graph.endNodes ?? new Set();
    const nodes = this.graph.nodes;

    while (steps < maxSteps) {
      const node = nodes.get(currentNodeId);
      if (!node) break;

      const result = await node.execute(state);
      state = result.state;

      await this.checkpointer.put({
        threadId,
        nodeId: currentNodeId,
        state,
        timestamp: Date.now() / 1000,
        version: steps,
      } as ThreadStateSnapshot);

      steps++;

      if (result.next !== undefined) {
        currentNodeId = result.next;
      } else {
        break;
      }

      if (endNodes.has(currentNodeId)) {
        return {
          state,
          currentNodeId,
          steps,
          ended: true,
        };
      }
    }

    return {
      state,
      currentNodeId,
      steps,
      ended: endNodes.has(currentNodeId),
    };
  }

  /**
   * Resume from checkpoint (convenience; run() already does this).
   */
  async resume(threadId: string, maxSteps = 100): Promise<RunResult> {
    return this.run({ threadId, maxSteps });
  }
}
