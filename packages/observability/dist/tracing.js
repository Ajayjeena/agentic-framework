import { trace, context } from "@opentelemetry/api";
export const TRACER_NAME = "agent-framework";
/**
 * Get the framework tracer. Uses global OTLP tracer when registered.
 */
export function getTracer() {
    return trace.getTracer(TRACER_NAME, "0.1.0");
}
/**
 * Start a span for agent/LLM/tool/memory operations.
 */
export function startSpan(name, attributes) {
    return getTracer().startSpan(name, { attributes });
}
/**
 * Run a function inside a span and end the span on completion.
 */
export async function withSpan(name, fn, attributes) {
    const span = startSpan(name, attributes);
    return context.with(trace.setSpan(context.active(), span), async () => {
        try {
            const result = await fn(span);
            span.setStatus({ code: 1 });
            return result;
        }
        catch (err) {
            span.setStatus({ code: 2, message: err instanceof Error ? err.message : String(err) });
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
        finally {
            span.end();
        }
    });
}
//# sourceMappingURL=tracing.js.map