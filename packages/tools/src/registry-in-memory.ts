import { z } from "zod";
import type { RegisteredTool, ToolRegistry } from "./registry.js";
import type { ToolResult } from "@agent-framework/core";

/**
 * In-memory tool registry with validation and async execution.
 */
export class InMemoryToolRegistry implements ToolRegistry {
  private tools = new Map<string, RegisteredTool>();

  register<TInput, TOutput>(tool: RegisteredTool<TInput, TOutput>): void {
    this.tools.set(tool.name, tool as RegisteredTool);
  }

  get(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  list(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  async execute(name: string, input: unknown): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Tool not found: ${name}` };
    }
    try {
      if (tool.inputSchema) {
        const parsed = tool.inputSchema.parse(input);
        const result = await tool.execute(parsed as never);
        return { success: true, data: result };
      }
      const result = await tool.execute(input as never);
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}
