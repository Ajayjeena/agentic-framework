"""Vector store interface."""

from abc import ABC, abstractmethod
from agent_framework.rag.types import SearchResult, VectorDocument


class VectorStore(ABC):
    """Index and search by embedding."""

    @abstractmethod
    async def add(self, documents: list[VectorDocument]) -> None:
        ...

    @abstractmethod
    async def search(
        self,
        embedding: list[float],
        top_k: int,
        filter_: dict | None = None,
    ) -> list[SearchResult]:
        ...
