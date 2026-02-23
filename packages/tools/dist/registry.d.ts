import type { z } from "zod";
import type { ToolDefinition, ToolResult } from "@agent-framework/core";
export interface RegisteredTool<TInput = unknown, TOutput = unknown> extends ToolDefinition {
    /** Zod schema for input validation */
    inputSchema?: z.ZodType<TInput>;
    /** Async implementation */
    execute: (input: TInput) => Promise<TOutput>;
}
export interface ToolRegistry {
    register<TInput, TOutput>(tool: RegisteredTool<TInput, TOutput>): void;
    get(name: string): RegisteredTool | undefined;
    list(): RegisteredTool[];
    execute(name: string, input: unknown): Promise<ToolResult>;
}
//# sourceMappingURL=registry.d.ts.map