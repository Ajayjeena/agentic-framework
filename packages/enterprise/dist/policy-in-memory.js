/**
 * Simple in-memory policy engine for development; production should use external policy store.
 */
export class InMemoryPolicyEngine {
    rules = [];
    defaultAllow = false;
    constructor(options) {
        if (options?.rules)
            this.rules = options.rules;
        if (options?.defaultAllow !== undefined)
            this.defaultAllow = options.defaultAllow;
    }
    addRule(rule) {
        this.rules.push(rule);
    }
    async evaluate(request) {
        const role = request.role ?? "default";
        for (const rule of this.rules) {
            const roleMatch = rule.role === "*" || rule.role === role;
            const actionMatch = rule.action === "*" || rule.action === request.action;
            const resourceMatch = rule.resource === undefined ||
                rule.resource === "*" ||
                (request.resource && rule.resource === request.resource);
            if (roleMatch && actionMatch && resourceMatch) {
                return { allowed: rule.allowed, reason: rule.allowed ? undefined : "Policy denied" };
            }
        }
        return { allowed: this.defaultAllow, reason: this.defaultAllow ? undefined : "No matching policy" };
    }
}
//# sourceMappingURL=policy-in-memory.js.map