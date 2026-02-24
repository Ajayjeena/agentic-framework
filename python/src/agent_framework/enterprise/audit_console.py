"""Console audit logger."""

import json
from agent_framework.enterprise.audit import AuditLogger, AuditEvent


class ConsoleAuditLogger(AuditLogger):
    async def log(self, event: AuditEvent) -> None:
        payload = {
            "type": event.type,
            "timestamp": event.timestamp,
            "tenant_id": event.tenant_id,
            "user_id": event.user_id,
            "thread_id": event.thread_id,
            "metadata": event.metadata,
            "resource": event.resource,
        }
        print(f"[AUDIT] {json.dumps(payload)}")
