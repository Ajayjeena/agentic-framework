"""Policy engine: allow/deny per tool, model, memory."""

from abc import ABC, abstractmethod
from typing import Literal

PolicyAction = Literal[
    "tool:execute", "model:chat",
    "memory:read", "memory:write", "memory:search",
    "delegation:allow",
]


class PolicyRequest:
    def __init__(
        self,
        action: str,
        tenant_id: str | None = None,
        user_id: str | None = None,
        role: str | None = None,
        resource: str | None = None,
    ):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.role = role
        self.action = action
        self.resource = resource


class PolicyResult:
    def __init__(self, allowed: bool, reason: str | None = None):
        self.allowed = allowed
        self.reason = reason


class PolicyEngine(ABC):
    @abstractmethod
    async def evaluate(self, request: PolicyRequest) -> PolicyResult:
        ...
