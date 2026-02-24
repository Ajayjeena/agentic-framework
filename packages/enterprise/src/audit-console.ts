import type { AuditLogger, AuditEvent } from "./audit.js";

/**
 * Console audit logger (development); production should use structured logger or external sink.
 */
export class ConsoleAuditLogger implements AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    const payload = JSON.stringify({
      ...event,
      timestamp: new Date(event.timestamp * 1000).toISOString(),
    });
    console.log(`[AUDIT] ${payload}`);
  }
}
