/**
 * In-memory policy engine: allow/deny by role and action.
 */
import type { PolicyEngine, PolicyRequest, PolicyResult } from "./policy.js";
export interface InMemoryPolicyRule {
    role: string;
    action: string;
    resource?: string;
    allowed: boolean;
}
/**
 * Simple in-memory policy engine for development; production should use external policy store.
 */
export declare class InMemoryPolicyEngine implements PolicyEngine {
    private rules;
    private defaultAllow;
    constructor(options?: {
        rules?: InMemoryPolicyRule[];
        defaultAllow?: boolean;
    });
    addRule(rule: InMemoryPolicyRule): void;
    evaluate(request: PolicyRequest): Promise<PolicyResult>;
}
//# sourceMappingURL=policy-in-memory.d.ts.map