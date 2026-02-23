import type { RegisteredTool, ToolRegistry } from "./registry.js";
import type { ToolResult } from "@agent-framework/core";
/**
 * In-memory tool registry with validation and async execution.
 */
export declare class InMemoryToolRegistry implements ToolRegistry {
    private tools;
    register<TInput, TOutput>(tool: RegisteredTool<TInput, TOutput>): void;
    get(name: string): RegisteredTool | undefined;
    list(): RegisteredTool[];
    execute(name: string, input: unknown): Promise<ToolResult>;
}
//# sourceMappingURL=registry-in-memory.d.ts.map