import { z } from "zod";
import type { AgentDefinition } from "./agent.js";
import type { Task } from "./task.js";
import type { ToolDefinition } from "./tool.js";

/**
 * Crew: composition of Agents + Tasks + Tools with execution order and delegation rules.
 */
export const CrewDefinitionSchema = z.object({
  id: z.string(),
  agentIds: z.array(z.string()),
  taskIds: z.array(z.string()),
  toolNames: z.array(z.string()).optional(),
  executionOrder: z.enum(["sequential", "parallel", "graph"]).optional().default("sequential"),
});
export type CrewDefinition = z.infer<typeof CrewDefinitionSchema>;

export interface CrewContext {
  crew: CrewDefinition;
  agents: Map<string, AgentDefinition>;
  tasks: Map<string, Task>;
  tools: Map<string, ToolDefinition>;
}
