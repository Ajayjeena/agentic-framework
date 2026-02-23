"""In-memory MemoryStore."""

import uuid
import time
from agent_framework.memory import (
    MemoryStore,
    MemoryEntry,
    MemorySearchResult,
    MemoryReadOptions,
    MemorySearchOptions,
    MemoryWriteOptions,
)


class InMemoryMemoryStore(MemoryStore):
    """In-memory store for development / single-node."""

    def __init__(self) -> None:
        self._store: dict[str, list[MemoryEntry]] = {}

    async def read(
        self,
        thread_id: str,
        options: MemoryReadOptions | None = None,
    ) -> list[MemoryEntry]:
        opts = options or MemoryReadOptions()
        list_entries = self._store.get(thread_id, []).copy()
        if opts.tenant_id:
            list_entries = [e for e in list_entries if e.tenant_id == opts.tenant_id]
        if opts.since is not None:
            list_entries = [e for e in list_entries if (e.created_at or 0) >= opts.since]
        if opts.limit is not None:
            list_entries = list_entries[-opts.limit :]
        return list_entries

    async def write(
        self,
        thread_id: str,
        content: str,
        metadata: dict | None = None,
        options: MemoryWriteOptions | None = None,
    ) -> MemoryEntry:
        opts = options or MemoryWriteOptions()
        now = time.time()
        entry = MemoryEntry(
            id=str(uuid.uuid4()),
            content=content,
            metadata=metadata,
            tenant_id=opts.tenant_id,
            created_at=now,
            ttl=opts.ttl,
        )
        if thread_id not in self._store:
            self._store[thread_id] = []
        self._store[thread_id].append(entry)
        return entry

    async def search(
        self,
        thread_id: str,
        options: MemorySearchOptions,
    ) -> list[MemorySearchResult]:
        list_entries = await self.read(thread_id, options)
        results = []
        for e in list_entries:
            r = MemorySearchResult(
                id=e.id,
                content=e.content,
                metadata=e.metadata,
                tenant_id=e.tenant_id,
                created_at=e.created_at,
                ttl=e.ttl,
                score=1.0,
            )
            results.append(r)
        if options.top_k is not None:
            results = results[-options.top_k :]
        return results

    async def prune(
        self,
        thread_id: str,
        before: float | None = None,
        keep_last: int | None = None,
    ) -> None:
        list_entries = self._store.get(thread_id, []).copy()
        if before is not None:
            list_entries = [e for e in list_entries if (e.created_at or 0) >= before]
        if keep_last is not None:
            list_entries = list_entries[-keep_last:]
        if list_entries:
            self._store[thread_id] = list_entries
        else:
            self._store.pop(thread_id, None)

    async def delete(self, thread_id: str, entry_id: str) -> None:
        list_entries = self._store.get(thread_id, [])
        filtered = [e for e in list_entries if e.id != entry_id]
        if filtered:
            self._store[thread_id] = filtered
        else:
            self._store.pop(thread_id, None)
