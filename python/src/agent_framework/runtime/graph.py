"""Graph node and edges for agent workflow."""

from typing import Any, Callable, Awaitable
from abc import ABC, abstractmethod

GraphNodeId = str


class GraphNode(ABC):
    """Executable step in the agent workflow."""

    def __init__(self, id: str):  # noqa: A002
        self.id = id

    @abstractmethod
    async def execute(self, state: dict[str, Any]) -> tuple[dict[str, Any], GraphNodeId | None]:
        """Execute the node. Returns (new_state, next_node_id or None to stop)."""
        ...


class GraphEdge:
    """Edge between nodes, optionally conditional."""

    def __init__(
        self,
        from_id: str,
        to_id: str,
        condition: Callable[[dict[str, Any]], bool] | None = None,
    ):
        self.from_id = from_id
        self.to_id = to_id
        self.condition = condition


class AgentGraph:
    """Graph of nodes and edges with entry and optional end nodes."""

    def __init__(
        self,
        nodes: dict[GraphNodeId, GraphNode],
        edges: list[GraphEdge],
        entry: GraphNodeId,
        end_nodes: set[GraphNodeId] | None = None,
    ):
        self.nodes = nodes
        self.edges = edges
        self.entry = entry
        self.end_nodes = end_nodes or set()
