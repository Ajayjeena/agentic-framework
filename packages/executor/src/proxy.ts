/**
 * UserProxy-style agent: executes code or tools on behalf of the user.
 * Sandboxed; OFF by default - must be explicitly enabled.
 */
import type { ToolResult } from "@agent-framework/core";
import { executePython } from "./sandbox.js";

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
export class UserProxy {
  constructor(private options: UserProxyOptions = {}) {}

  /**
   * Execute Python code. Only works when codeExecutionEnabled is true.
   */
  async executeCode(code: string): Promise<{ success: boolean; output: string; error?: string }> {
    if (!this.options.codeExecutionEnabled) {
      return {
        success: false,
        output: "",
        error: "Code execution is disabled for security",
      };
    }
    const result = await executePython(code, {
      timeoutMs: this.options.executorTimeoutMs ?? 5000,
    });
    return {
      success: result.success,
      output: result.stdout,
      error: result.error ?? (result.stderr || undefined),
    };
  }

  /**
   * Execute a tool by name.
   */
  async executeTool(name: string, input: unknown): Promise<ToolResult> {
    if (!this.options.toolExecutor) {
      return { success: false, error: `Tool executor not configured` };
    }
    return this.options.toolExecutor(name, input);
  }

  /**
   * Check if code execution is enabled.
   */
  isCodeExecutionEnabled(): boolean {
    return this.options.codeExecutionEnabled === true;
  }
}
