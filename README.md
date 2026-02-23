# Enterprise Agent Framework

Enterprise-grade agentic framework with TypeScript and Python from day one, multi-agent support, durable execution, and first-class memory.

## Packages

| Package | Description |
|---------|-------------|
| `@agent-framework/core` | Core types, interfaces, Agent/Crew/Task/Tool primitives |
| `@agent-framework/runtime` | Graph-based agent runtime, thread state, checkpointer |
| `@agent-framework/memory` | MemoryStore interface, in-memory and Redis adapters |
| `@agent-framework/crew` | Message bus, Crew orchestration, task delegation |
| `@agent-framework/openai` | OpenAI LLM adapter |
| `@agent-framework/tools` | Tool registry with validation |
| `@agent-framework/observability` | OpenTelemetry tracing |

## Python

See `python/` for the Python SDK with feature parity.

## Quick start

```bash
npm install
npm run build
```

## Design

- **Dual runtimes**: TypeScript and Python with shared API design
- **Multi-agent from day one**: Message bus, Crew, delegation
- **Durable execution**: Checkpointing, thread-based state, pause/resume
- **Enterprise**: RBAC, audit, cost control (Phase 3)
