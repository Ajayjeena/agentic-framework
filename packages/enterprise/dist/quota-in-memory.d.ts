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
export declare class InMemoryQuotaStore implements QuotaStore {
    private limits;
    private usage;
    constructor(configs?: InMemoryQuotaConfig[]);
    setLimit(tenantId: string, metric: string, limit: number): void;
    private key;
    check(request: QuotaCheck): Promise<QuotaResult>;
    consume(request: QuotaCheck): Promise<QuotaResult>;
}
//# sourceMappingURL=quota-in-memory.d.ts.map