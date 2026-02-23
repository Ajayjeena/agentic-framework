"""RAG types."""


class Document:
    """A document for indexing."""

    def __init__(
        self,
        id: str,
        content: str,
        metadata: dict | None = None,
        source: str | None = None,
    ):
        self.id = id
        self.content = content
        self.metadata = metadata or {}
        self.source = source


class DocumentChunk(Document):
    """Document chunk with position info."""

    def __init__(
        self,
        id: str,
        content: str,
        chunk_index: int = 0,
        start_char: int | None = None,
        end_char: int | None = None,
        metadata: dict | None = None,
        source: str | None = None,
    ):
        super().__init__(id, content, metadata, source)
        self.chunk_index = chunk_index
        self.start_char = start_char
        self.end_char = end_char


class VectorDocument:
    """Document chunk with embedding."""

    def __init__(
        self,
        id: str,
        content: str,
        embedding: list[float],
        chunk_index: int = 0,
        start_char: int | None = None,
        end_char: int | None = None,
        metadata: dict | None = None,
        source: str | None = None,
    ):
        self.id = id
        self.content = content
        self.embedding = embedding
        self.chunk_index = chunk_index
        self.start_char = start_char
        self.end_char = end_char
        self.metadata = metadata or {}
        self.source = source


class SearchResult:
    """Search result with score."""

    def __init__(self, document: DocumentChunk, score: float):
        self.document = document
        self.score = score


class RerankResult(SearchResult):
    """Reranked result with optional rerank score."""

    def __init__(self, document: DocumentChunk, score: float, rerank_score: float | None = None):
        super().__init__(document, score)
        self.rerank_score = rerank_score
