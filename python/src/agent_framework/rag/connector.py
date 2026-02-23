"""Data connector interface."""

from abc import ABC, abstractmethod
from agent_framework.rag.types import Document


class DataConnector(ABC):
    """Load documents from a source."""

    @abstractmethod
    async def load(self) -> list[Document]:
        ...
