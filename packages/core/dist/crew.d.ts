import { z } from "zod";
import type { AgentDefinition } from "./agent.js";
import type { Task } from "./task.js";
import type { ToolDefinition } from "./tool.js";
/**
 * Crew: composition of Agents + Tasks + Tools with execution order and delegation rules.
 */
export declare const CrewDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    agentIds: z.ZodArray<z.ZodString, "many">;
    taskIds: z.ZodArray<z.ZodString, "many">;
    toolNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    executionOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["sequential", "parallel", "graph"]>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    agentIds: string[];
    taskIds: string[];
    executionOrder: "sequential" | "parallel" | "graph";
    toolNames?: string[] | undefined;
}, {
    id: string;
    agentIds: string[];
    taskIds: string[];
    toolNames?: string[] | undefined;
    executionOrder?: "sequential" | "parallel" | "graph" | undefined;
}>;
export type CrewDefinition = z.infer<typeof CrewDefinitionSchema>;
export interface CrewContext {
    crew: CrewDefinition;
    agents: Map<string, AgentDefinition>;
    tasks: Map<string, Task>;
    tools: Map<string, ToolDefinition>;
}
//# sourceMappingURL=crew.d.ts.map