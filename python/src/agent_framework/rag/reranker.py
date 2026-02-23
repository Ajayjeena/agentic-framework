"""Reranker interface."""

from abc import ABC, abstractmethod
from agent_framework.rag.types import RerankResult, SearchResult


class Reranker(ABC):
    """Optional post-retrieval reranking."""

    @abstractmethod
    async def rerank(self, query: str, results: list[SearchResult], top_k: int | None = None) -> list[RerankResult]:
        ...
