/**
 * In-memory quota store; production should use Redis or DB for distributed consistency.
 */
export class InMemoryQuotaStore {
    limits = new Map();
    usage = new Map();
    constructor(configs = []) {
        for (const c of configs) {
            this.setLimit(c.tenantId ?? "default", c.metric, c.limit);
        }
    }
    setLimit(tenantId, metric, limit) {
        this.limits.set(`${tenantId}:${metric}`, limit);
    }
    key(check) {
        return `${check.tenantId ?? "default"}:${check.metric}`;
    }
    async check(request) {
        const k = this.key(request);
        const limit = this.limits.get(k);
        if (limit === undefined)
            return { allowed: true };
        const used = this.usage.get(k) ?? 0;
        const remaining = Math.max(0, limit - used);
        return {
            allowed: used + request.amount <= limit,
            remaining,
            limit,
        };
    }
    async consume(request) {
        const k = this.key(request);
        const limit = this.limits.get(k);
        if (limit === undefined)
            return { allowed: true };
        const used = (this.usage.get(k) ?? 0) + request.amount;
        this.usage.set(k, used);
        const remaining = Math.max(0, limit - used);
        return {
            allowed: used <= limit,
            remaining,
            limit,
        };
    }
}
//# sourceMappingURL=quota-in-memory.js.map