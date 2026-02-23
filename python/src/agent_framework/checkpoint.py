"""Checkpointer interface for durable execution."""

from abc import ABC, abstractmethod
from agent_framework.thread import ThreadStateSnapshot


class Checkpointer(ABC):
    """Persist and restore workflow state."""

    @abstractmethod
    async def put(self, snapshot: ThreadStateSnapshot) -> None:
        ...

    @abstractmethod
    async def get(self, thread_id: str) -> ThreadStateSnapshot | None:
        ...

    @abstractmethod
    async def list_snapshots(self, thread_id: str) -> list[ThreadStateSnapshot]:
        ...

    @abstractmethod
    async def delete(self, thread_id: str, node_id: str | None = None) -> None:
        ...
