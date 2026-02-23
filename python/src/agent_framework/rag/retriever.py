"""Retriever: unified RAG retrieval with optional rerank."""

from typing import Awaitable, Callable
from agent_framework.rag.types import RerankResult, SearchResult
from agent_framework.rag.vector_store import VectorStore
from agent_framework.rag.reranker import Reranker


class Retriever:
    """Retrieve documents by embedding query; optionally rerank."""

    def __init__(
        self,
        vector_store: VectorStore,
        embed_fn: Callable[[str], Awaitable[list[float]]],
        top_k: int = 10,
        reranker: Reranker | None = None,
    ):
        self._vector_store = vector_store
        self._embed_fn = embed_fn
        self._top_k = top_k
        self._reranker = reranker

    async def retrieve(
        self,
        query: str,
        top_k: int | None = None,
        filter_: dict | None = None,
    ) -> list[SearchResult] | list[RerankResult]:
        k = top_k or self._top_k
        embedding = await self._embed_fn(query)
        results = await self._vector_store.search(embedding, k * 2, filter_)

        if self._reranker:
            return await self._reranker.rerank(query, results, k)
        return results[:k]
