/**
 * UserProxy-style agent: executes code or tools on behalf of the user.
 * Sandboxed; OFF by default - must be explicitly enabled.
 */
import type { ToolResult } from "@agent-framework/core";
export type ToolExecutor = (name: string, input: unknown) => Promise<ToolResult>;
export interface UserProxyOptions {
    /** Enable code execution; default false (enterprise default) */
    codeExecutionEnabled?: boolean;
    /** Executor options when code execution is enabled */
    executorTimeoutMs?: number;
    /** Execute a tool by name; if not provided, executeTool will fail */
    toolExecutor?: ToolExecutor;
}
/**
 * UserProxy: can execute code (sandboxed) and tools on behalf of the user.
 * Returns results for agent feedback.
 */
export declare class UserProxy {
    private options;
    constructor(options?: UserProxyOptions);
    /**
     * Execute Python code. Only works when codeExecutionEnabled is true.
     */
    executeCode(code: string): Promise<{
        success: boolean;
        output: string;
        error?: string;
    }>;
    /**
     * Execute a tool by name.
     */
    executeTool(name: string, input: unknown): Promise<ToolResult>;
    /**
     * Check if code execution is enabled.
     */
    isCodeExecutionEnabled(): boolean;
}
//# sourceMappingURL=proxy.d.ts.map