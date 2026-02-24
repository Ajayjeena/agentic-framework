"""Cost & quota control."""

from abc import ABC, abstractmethod


class QuotaCheck:
    def __init__(self, metric: str, amount: float, tenant_id: str | None = None, user_id: str | None = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.metric = metric
        self.amount = amount


class QuotaResult:
    def __init__(self, allowed: bool, remaining: float | None = None, limit: float | None = None, retry_after_ms: int | None = None):
        self.allowed = allowed
        self.remaining = remaining
        self.limit = limit
        self.retry_after_ms = retry_after_ms


class QuotaStore(ABC):
    @abstractmethod
    async def check(self, request: QuotaCheck) -> QuotaResult:
        ...

    @abstractmethod
    async def consume(self, request: QuotaCheck) -> QuotaResult:
        ...
