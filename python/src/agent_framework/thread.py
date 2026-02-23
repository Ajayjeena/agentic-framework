"""Thread and state snapshot types."""

from typing import Any


ThreadId = str


class ThreadStateSnapshot:
    """Snapshot of graph state at a node for checkpointing."""

    def __init__(
        self,
        thread_id: str,
        node_id: str,
        state: dict[str, Any],
        timestamp: float,
        version: int | None = None,
    ):
        self.thread_id = thread_id
        self.node_id = node_id
        self.state = state
        self.timestamp = timestamp
        self.version = version
