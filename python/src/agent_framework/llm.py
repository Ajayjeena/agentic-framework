"""Unified LLM provider interface."""

from abc import ABC, abstractmethod
from typing import Literal
from pydantic import BaseModel


class LLMMessage(BaseModel):
    """Single chat message."""

    role: Literal["system", "user", "assistant"]
    content: str
    name: str | None = None


class LLMChatOptions(BaseModel):
    """Options for chat completion."""

    temperature: float | None = None
    max_tokens: int | None = None
    stop: list[str] | None = None


class TokenUsage(BaseModel):
    """Token usage info."""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class LLMChatResult(BaseModel):
    """Result of a chat completion."""

    message: LLMMessage
    usage: TokenUsage | None = None
    finish_reason: str | None = None


class LLMStreamChunk(BaseModel):
    """Streaming chunk."""

    delta: str
    usage: TokenUsage | None = None


class LLMProvider(ABC):
    """Unified LLM interface."""

    @abstractmethod
    async def chat(
        self,
        messages: list[LLMMessage],
        options: LLMChatOptions | None = None,
    ) -> LLMChatResult:
        ...

    async def stream(
        self,
        messages: list[LLMMessage],
        options: LLMChatOptions | None = None,
    ):
        """Stream chat completion. Returns async generator of LLMStreamChunk."""
        ...

    async def embed(self, text: str | list[str]) -> list[list[float]]:
        """Optional embedding support."""
        raise NotImplementedError("embed not supported by this provider")

    async def tokenize(self, text: str) -> list[int]:
        """Optional tokenization."""
        raise NotImplementedError("tokenize not supported by this provider")
