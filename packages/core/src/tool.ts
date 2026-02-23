import { z } from "zod";

/**
 * Tool input/output schema placeholder; concrete schemas in @agent-framework/tools.
 */
export const ToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
