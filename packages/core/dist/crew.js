import { z } from "zod";
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
//# sourceMappingURL=crew.js.map