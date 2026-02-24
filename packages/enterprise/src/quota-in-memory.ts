import type { QuotaStore, QuotaCheck, QuotaResult } from "./quota.js";

export interface InMemoryQuotaConfig {
  tenantId?: string;
  metric: string;
  limit: number;
  windowMs?: number;
}

/**
 * In-memory quota store; production should use Redis or DB for distributed consistency.
 */
export class InMemoryQuotaStore implements QuotaStore {
  private limits = new Map<string, number>();
  private usage = new Map<string, number>();

  constructor(configs: InMemoryQuotaConfig[] = []) {
    for (const c of configs) {
      this.setLimit(c.tenantId ?? "default", c.metric, c.limit);
    }
  }

  setLimit(tenantId: string, metric: string, limit: number): void {
    this.limits.set(`${tenantId}:${metric}`, limit);
  }

  private key(check: QuotaCheck): string {
    return `${check.tenantId ?? "default"}:${check.metric}`;
  }

  async check(request: QuotaCheck): Promise<QuotaResult> {
    const k = this.key(request);
    const limit = this.limits.get(k);
    if (limit === undefined) return { allowed: true };
    const used = this.usage.get(k) ?? 0;
    const remaining = Math.max(0, limit - used);
    return {
      allowed: used + request.amount <= limit,
      remaining,
      limit,
    };
  }

  async consume(request: QuotaCheck): Promise<QuotaResult> {
    const k = this.key(request);
    const limit = this.limits.get(k);
    if (limit === undefined) return { allowed: true };
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
