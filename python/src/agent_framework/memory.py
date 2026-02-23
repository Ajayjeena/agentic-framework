"""MemoryStore interface and types."""

from abc import ABC, abstractmethod
from typing import Any


class MemoryEntry:
    """A single memory entry."""

    def __init__(
        self,
        id: str,
        content: str,
        metadata: dict[str, Any] | None = None,
        tenant_id: str | None = None,
        created_at: float | None = None,
        ttl: int | None = None,
    ):
        self.id = id
        self.content = content
        self.metadata = metadata or {}
        self.tenant_id = tenant_id
        self.created_at = created_at
        self.ttl = ttl


class MemorySearchResult(MemoryEntry):
    """Memory entry with optional search score."""

    def __init__(self, score: float | None = None, **kwargs: Any):
        super().__init__(**kwargs)
        self.score = score


class MemoryReadOptions:
    """Options for reading memory."""

    def __init__(
        self,
        limit: int | None = None,
        tenant_id: str | None = None,
        since: float | None = None,
    ):
        self.limit = limit
        self.tenant_id = tenant_id
        self.since = since


class MemorySearchOptions(MemoryReadOptions):
    """Options for searching memory."""

    def __init__(
        self,
        query: str | None = None,
        top_k: int | None = None,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.query = query
        self.top_k = top_k


class MemoryWriteOptions:
    """Options for writing memory."""

    def __init__(self, tenant_id: str | None = None, ttl: int | None = None):
        self.tenant_id = tenant_id
        self.ttl = ttl


class MemoryStore(ABC):
    """Core MemoryStore interface."""

    @abstractmethod
    async def read(
        self,
        thread_id: str,
        options: MemoryReadOptions | None = None,
    ) -> list[MemoryEntry]:
        ...

    @abstractmethod
    async def write(
        self,
        thread_id: str,
        content: str,
        metadata: dict[str, Any] | None = None,
        options: MemoryWriteOptions | None = None,
    ) -> MemoryEntry:
        ...

    @abstractmethod
    async def search(
        self,
        thread_id: str,
        options: MemorySearchOptions,
    ) -> list[MemorySearchResult]:
        ...

    @abstractmethod
    async def prune(
        self,
        thread_id: str,
        before: float | None = None,
        keep_last: int | None = None,
    ) -> None:
        ...

    @abstractmethod
    async def delete(self, thread_id: str, entry_id: str) -> None:
        ...
