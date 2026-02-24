"""In-memory quota store."""

from agent_framework.enterprise.quota import QuotaStore, QuotaCheck, QuotaResult


class InMemoryQuotaConfig:
    def __init__(self, metric: str, limit: float, tenant_id: str | None = None):
        self.tenant_id = tenant_id or "default"
        self.metric = metric
        self.limit = limit


class InMemoryQuotaStore(QuotaStore):
    def __init__(self, configs: list[InMemoryQuotaConfig] | None = None):
        self._limits: dict[str, float] = {}
        self._usage: dict[str, float] = {}
        for c in configs or []:
            self.set_limit(c.tenant_id, c.metric, c.limit)

    def set_limit(self, tenant_id: str, metric: str, limit: float) -> None:
        self._limits[f"{tenant_id}:{metric}"] = limit

    def _key(self, check: QuotaCheck) -> str:
        return f"{check.tenant_id or 'default'}:{check.metric}"

    async def check(self, request: QuotaCheck) -> QuotaResult:
        k = self._key(request)
        limit = self._limits.get(k)
        if limit is None:
            return QuotaResult(allowed=True)
        used = self._usage.get(k, 0)
        remaining = max(0, limit - used)
        return QuotaResult(
            allowed=used + request.amount <= limit,
            remaining=remaining,
            limit=limit,
        )

    async def consume(self, request: QuotaCheck) -> QuotaResult:
        k = self._key(request)
        limit = self._limits.get(k)
        if limit is None:
            return QuotaResult(allowed=True)
        self._usage[k] = self._usage.get(k, 0) + request.amount
        used = self._usage[k]
        remaining = max(0, limit - used)
        return QuotaResult(allowed=used <= limit, remaining=remaining, limit=limit)
