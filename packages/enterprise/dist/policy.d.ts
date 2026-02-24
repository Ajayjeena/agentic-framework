/**
 * Policy engine: allow/deny per tool, model, memory, delegation.
 * Scalable: pluggable backend; durable: policies persisted; secure: tenant isolation.
 */
import { z } from "zod";
export declare const PolicyActionSchema: z.ZodEnum<["tool:execute", "model:chat", "memory:read", "memory:write", "memory:search", "delegation:allow"]>;
export type PolicyAction = z.infer<typeof PolicyActionSchema>;
export interface PolicyRequest {
    tenantId?: string;
    userId?: string;
    role?: string;
    action: PolicyAction;
    resource?: string;
}
export interface PolicyResult {
    allowed: boolean;
    reason?: string;
}
export interface PolicyEngine {
    evaluate(request: PolicyRequest): Promise<PolicyResult>;
}
//# sourceMappingURL=policy.d.ts.map