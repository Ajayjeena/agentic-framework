import { z } from "zod";
/**
 * A unit of work assigned to an agent or crew.
 */
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    agentId: z.ZodOptional<z.ZodString>;
    input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    output: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    agentId?: string | undefined;
    input?: Record<string, unknown> | undefined;
    output?: unknown;
}, {
    id: string;
    description: string;
    agentId?: string | undefined;
    input?: Record<string, unknown> | undefined;
    output?: unknown;
}>;
export type Task = z.infer<typeof TaskSchema>;
//# sourceMappingURL=task.d.ts.map