"""Redis MemoryStore (optional dependency: redis)."""

import json
import uuid
import time
from typing import Any

from agent_framework.memory import (
    MemoryStore,
    MemoryEntry,
    MemorySearchResult,
    MemoryReadOptions,
    MemorySearchOptions,
    MemoryWriteOptions,
)


class RedisMemoryStore(MemoryStore):
    """Redis-backed store for multi-node / production."""

    def __init__(self, url: str | None = None, prefix: str = "agent_framework:memory:") -> None:
        self._url = url
        self._prefix = prefix
        self._client: Any = None

    async def _get_client(self):  # noqa: ANN201
        if self._client is not None:
            return self._client
        try:
            import redis.asyncio as redis
        except ImportError:
            raise ImportError("redis package required for RedisMemoryStore: pip install redis") from None
        self._client = redis.from_url(self._url or "redis://localhost") if self._url else redis.Redis()
        return self._client

    def _key(self, thread_id: str) -> str:
        return f"{self._prefix}{thread_id}"

    def _serialize(self, entry: MemoryEntry) -> str:
        return json.dumps({
            "id": entry.id,
            "content": entry.content,
            "metadata": entry.metadata,
            "tenant_id": getattr(entry, "tenant_id", None),
            "created_at": entry.created_at,
            "ttl": entry.ttl,
        })

    def _deserialize(self, raw: str) -> MemoryEntry:
        o = json.loads(raw)
        return MemoryEntry(
            id=o["id"],
            content=o["content"],
            metadata=o.get("metadata"),
            tenant_id=o.get("tenant_id"),
            created_at=o.get("created_at"),
            ttl=o.get("ttl"),
        )

    async def read(
        self,
        thread_id: str,
        options: MemoryReadOptions | None = None,
    ) -> list[MemoryEntry]:
        opts = options or MemoryReadOptions()
        client = await self._get_client()
        key = self._key(thread_id)
        raw_list = await client.lrange(key, 0, -1)
        list_entries = [self._deserialize(r.decode() if isinstance(r, bytes) else r) for r in raw_list]
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
        client = await self._get_client()
        await client.rpush(self._key(thread_id), self._serialize(entry))
        return entry

    async def search(
        self,
        thread_id: str,
        options: MemorySearchOptions,
    ) -> list[MemorySearchResult]:
        list_entries = await self.read(thread_id, options)
        results = []
        for e in list_entries:
            results.append(
                MemorySearchResult(
                    id=e.id,
                    content=e.content,
                    metadata=e.metadata,
                    tenant_id=e.tenant_id,
                    created_at=e.created_at,
                    ttl=e.ttl,
                    score=1.0,
                )
            )
        if options.top_k is not None:
            results = results[-options.top_k :]
        return results

    async def prune(
        self,
        thread_id: str,
        before: float | None = None,
        keep_last: int | None = None,
    ) -> None:
        list_entries = await self.read(thread_id, MemoryReadOptions())
        if before is not None:
            list_entries = [e for e in list_entries if (e.created_at or 0) >= before]
        if keep_last is not None:
            list_entries = list_entries[-keep_last:]
        client = await self._get_client()
        key = self._key(thread_id)
        await client.delete(key)
        for e in list_entries:
            await client.rpush(key, self._serialize(e))

    async def delete(self, thread_id: str, entry_id: str) -> None:
        list_entries = await self.read(thread_id, MemoryReadOptions())
        filtered = [e for e in list_entries if e.id != entry_id]
        client = await self._get_client()
        key = self._key(thread_id)
        await client.delete(key)
        for e in filtered:
            await client.rpush(key, self._serialize(e))
