"""Agent runtime: executes graph with checkpointing."""

from typing import Any
from agent_framework.checkpoint import Checkpointer
from agent_framework.thread import ThreadStateSnapshot
from agent_framework.runtime.graph import AgentGraph, GraphNodeId


class RunOptions:
    """Options for a single run."""

    def __init__(
        self,
        thread_id: str,
        initial_state: dict[str, Any] | None = None,
        max_steps: int = 100,
    ):
        self.thread_id = thread_id
        self.initial_state = initial_state or {}
        self.max_steps = max_steps


class RunResult:
    """Result of a run."""

    def __init__(
        self,
        state: dict[str, Any],
        current_node_id: GraphNodeId,
        steps: int,
        ended: bool,
    ):
        self.state = state
        self.current_node_id = current_node_id
        self.steps = steps
        self.ended = ended


class AgentRuntime:
    """Runs a graph-based state machine with checkpointing."""

    def __init__(self, graph: AgentGraph, checkpointer: Checkpointer) -> None:
        self._graph = graph
        self._checkpointer = checkpointer

    async def run(self, options: RunOptions) -> RunResult:
        thread_id = options.thread_id
        state = dict(options.initial_state)
        current_node_id: GraphNodeId = self._graph.entry
        steps = 0

        last = await self._checkpointer.get(thread_id)
        if last:
            current_node_id = last.node_id
            state = dict(last.state)

        end_nodes = self._graph.end_nodes
        nodes = self._graph.nodes

        while steps < options.max_steps:
            node = nodes.get(current_node_id)
            if not node:
                break

            new_state, next_id = await node.execute(state)
            state = new_state

            await self._checkpointer.put(
                ThreadStateSnapshot(
                    thread_id=thread_id,
                    node_id=current_node_id,
                    state=state,
                    timestamp=__import__("time").time(),
                    version=steps,
                )
            )
            steps += 1

            if next_id is not None:
                current_node_id = next_id
            else:
                break

            if current_node_id in end_nodes:
                return RunResult(state, current_node_id, steps, True)

        return RunResult(state, current_node_id, steps, current_node_id in end_nodes)

    async def resume(self, thread_id: str, max_steps: int = 100) -> RunResult:
        return await self.run(RunOptions(thread_id=thread_id, max_steps=max_steps))
