# Enterprise Agent Framework

Enterprise-grade agentic framework with TypeScript and Python from day one, multi-agent support, durable execution, and first-class memory.

## Packages

| Package | Description |
|---------|-------------|
| `@agent-framework/core` | Core types, interfaces, Agent/Crew/Task/Tool primitives, HITL types |
| `@agent-framework/runtime` | Graph-based agent runtime, thread state, checkpointer (in-memory, Redis, Postgres), HITL |
| `@agent-framework/memory` | MemoryStore interface, in-memory, Redis, Postgres adapters |
| `@agent-framework/crew` | Message bus, Crew orchestration, task delegation, HITL support |
| `@agent-framework/openai` | OpenAI LLM adapter |
| `@agent-framework/tools` | Tool registry with validation |
| `@agent-framework/executor` | Sandboxed code executor (UserProxy), OFF by default |
| `@agent-framework/rag` | Data connectors, vector store, hybrid search, retriever, optional rerank |
| `@agent-framework/enterprise` | RBAC/policy engine, audit logging, cost/quota, secrets |
| `@agent-framework/queue` | Job queue (BullMQ), optional Temporal adapter |
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
- **Durable execution**: Checkpointing (in-memory, Redis, Postgres), thread-based state, pause/resume
- **Human-in-the-loop**: ALWAYS / TERMINATE / NEVER modes; webhook for async approval
- **Sandboxed executor**: UserProxy for code execution; OFF by default (enterprise)
- **RAG**: Data connectors (file), vector store (in-memory), hybrid search, retriever, optional rerank
- **Enterprise**: RBAC/policy engine, audit logging, cost & quota, secrets (Phase 3)
- **Scale**: Postgres adapters, job queue (BullMQ), optional Temporal
