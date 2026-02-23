"""In-memory vector store."""

import math
from agent_framework.rag.types import SearchResult, VectorDocument


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    denom = norm_a * norm_b
    return dot / denom if denom else 0.0


class InMemoryVectorStore:
    """In-memory vector store with cosine similarity."""

    def __init__(self) -> None:
        self._docs: list[VectorDocument] = []

    async def add(self, documents: list[VectorDocument]) -> None:
        self._docs.extend(documents)

    async def search(
        self,
        embedding: list[float],
        top_k: int,
        filter_: dict | None = None,
    ) -> list[SearchResult]:
        scored = [(doc, _cosine_similarity(doc.embedding, embedding)) for doc in self._docs]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [SearchResult(doc, score) for doc, score in scored[:top_k]]
