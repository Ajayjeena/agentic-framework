/**
 * Cost & quota control: per-tenant limits, token budgets, rate limits.
 */
export interface QuotaCheck {
    tenantId?: string;
    userId?: string;
    /** e.g. "tokens", "requests", "tool_calls" */
    metric: string;
    amount: number;
}
export interface QuotaResult {
    allowed: boolean;
    remaining?: number;
    limit?: number;
    retryAfterMs?: number;
}
export interface QuotaStore {
    check(request: QuotaCheck): Promise<QuotaResult>;
    consume(request: QuotaCheck): Promise<QuotaResult>;
}
//# sourceMappingURL=quota.d.ts.map