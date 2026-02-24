"""Audit logging."""

from abc import ABC, abstractmethod
from typing import Literal, Any

AuditEventType = Literal[
    "llm:chat", "llm:stream", "tool:execute",
    "memory:read", "memory:write", "memory:search",
    "delegation", "hitl:intercept", "policy:deny",
]


class AuditEvent:
    def __init__(
        self,
        type: str,
        timestamp: float,
        tenant_id: str | None = None,
        user_id: str | None = None,
        thread_id: str | None = None,
        metadata: dict[str, Any] | None = None,
        resource: str | None = None,
    ):
        self.type = type
        self.timestamp = timestamp
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.thread_id = thread_id
        self.metadata = metadata or {}
        self.resource = resource


class AuditLogger(ABC):
    @abstractmethod
    async def log(self, event: AuditEvent) -> None:
        ...
