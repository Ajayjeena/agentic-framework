import { z } from "zod";
/**
 * Tool input/output schema placeholder; concrete schemas in @agent-framework/tools.
 */
export declare const ToolDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;
export interface ToolResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
//# sourceMappingURL=tool.d.ts.map