import { type Span, type Tracer } from "@opentelemetry/api";
import type { SpanAttributes } from "@opentelemetry/api";
export declare const TRACER_NAME = "agent-framework";
/**
 * Get the framework tracer. Uses global OTLP tracer when registered.
 */
export declare function getTracer(): Tracer;
/**
 * Start a span for agent/LLM/tool/memory operations.
 */
export declare function startSpan(name: string, attributes?: SpanAttributes): Span;
/**
 * Run a function inside a span and end the span on completion.
 */
export declare function withSpan<T>(name: string, fn: (span: Span) => Promise<T>, attributes?: SpanAttributes): Promise<T>;
//# sourceMappingURL=tracing.d.ts.map