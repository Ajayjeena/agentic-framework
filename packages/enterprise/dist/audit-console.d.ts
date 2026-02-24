import type { AuditLogger, AuditEvent } from "./audit.js";
/**
 * Console audit logger (development); production should use structured logger or external sink.
 */
export declare class ConsoleAuditLogger implements AuditLogger {
    log(event: AuditEvent): Promise<void>;
}
//# sourceMappingURL=audit-console.d.ts.map