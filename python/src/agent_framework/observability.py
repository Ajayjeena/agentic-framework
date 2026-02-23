"""OpenTelemetry tracing helpers."""

from typing import Any
from contextlib import asynccontextmanager

try:
    from opentelemetry import trace
    from opentelemetry.trace import Span, Tracer, Status, StatusCode
    _OTEL_AVAILABLE = True
except ImportError:
    _OTEL_AVAILABLE = False

TRACER_NAME = "agent-framework"


def get_tracer() -> "Tracer":
    if not _OTEL_AVAILABLE:
        raise ImportError("opentelemetry-api required: pip install opentelemetry-api")
    return trace.get_tracer(TRACER_NAME, "0.1.0")


def start_span(name: str, attributes: dict[str, Any] | None = None) -> "Span":
    tracer = get_tracer()
    return tracer.start_span(name, attributes=attributes or {})


@asynccontextmanager
async def with_span(name: str, attributes: dict[str, Any] | None = None):
    span = start_span(name, attributes)
    try:
        yield span
        span.set_status(Status(StatusCode.OK))
    except Exception as e:
        span.set_status(Status(StatusCode.ERROR, str(e)))
        span.record_exception(e)
        raise
    finally:
        span.end()
