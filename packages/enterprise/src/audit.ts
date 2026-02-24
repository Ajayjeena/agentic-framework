/**
 * Audit logging: structured events for LLM calls, tool invocations, memory access.
 * Scalable: async, pluggable sinks; durable: persistence; secure: no secrets in logs.
 */
export type AuditEventType =
  | "llm:chat"
  | "llm:stream"
  | "tool:execute"
  | "memory:read"
  | "memory:write"
  | "memory:search"
  | "delegation"
  | "hitl:intercept"
  | "policy:deny";

export interface AuditEvent {
  type: AuditEventType;
  tenantId?: string;
  userId?: string;
  threadId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  /** Redacted; never log raw secrets */
  resource?: string;
}

export interface AuditLogger {
  log(event: AuditEvent): void | Promise<void>;
}
