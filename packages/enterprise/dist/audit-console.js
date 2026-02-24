/**
 * Console audit logger (development); production should use structured logger or external sink.
 */
export class ConsoleAuditLogger {
    async log(event) {
        const payload = JSON.stringify({
            ...event,
            timestamp: new Date(event.timestamp * 1000).toISOString(),
        });
        console.log(`[AUDIT] ${payload}`);
    }
}
//# sourceMappingURL=audit-console.js.map