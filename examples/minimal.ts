/**
 * Minimal example: Agent runtime with graph + in-memory checkpointer.
 * Run from repo root: node packages/core/dist/examples/minimal.js (after building)
 * Or: npx tsx examples/minimal.ts
 */
import { AgentRuntime, InMemoryCheckpointer } from "@agent-framework/runtime";
import type { AgentGraph, GraphNode } from "@agent-framework/runtime";

const entryId = "start";
const endId = "end";

const graph: AgentGraph = {
  entry: entryId,
  endNodes: new Set([endId]),
  nodes: new Map([
    [
      entryId,
      {
        id: entryId,
        execute: async (state) => {
          return {
            state: { ...state, step: "done", message: "Hello from agent" },
            next: endId,
          };
        },
      },
    ],
    [
      endId,
      {
        id: endId,
        execute: async (state) => ({ state, next: undefined }),
      },
    ],
  ]),
  edges: [{ from: entryId, to: endId }],
};

async function main() {
  const checkpointer = new InMemoryCheckpointer();
  const runtime = new AgentRuntime(graph, checkpointer);
  const result = await runtime.run({
    threadId: "thread-1",
    initialState: { input: "test" },
    maxSteps: 10,
  });
  console.log("Run result:", result);
}

main().catch(console.error);
