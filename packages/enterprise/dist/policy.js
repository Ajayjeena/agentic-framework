/**
 * Policy engine: allow/deny per tool, model, memory, delegation.
 * Scalable: pluggable backend; durable: policies persisted; secure: tenant isolation.
 */
import { z } from "zod";
export const PolicyActionSchema = z.enum([
    "tool:execute",
    "model:chat",
    "memory:read",
    "memory:write",
    "memory:search",
    "delegation:allow",
]);
//# sourceMappingURL=policy.js.map