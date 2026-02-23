import { z } from "zod";
/**
 * Role / Goal / Backstory (CrewAI-style) agent metadata.
 */
export const AgentProfileSchema = z.object({
    role: z.string().describe("Domain expertise / function of the agent"),
    goal: z.string().describe("Outcome-focused objectives"),
    backstory: z.string().optional().describe("Context and personality"),
});
/**
 * Base agent definition: identity + optional profile for prompts and delegation.
 */
export const AgentDefinitionSchema = z.object({
    id: z.string(),
    profile: AgentProfileSchema.optional(),
    allowDelegation: z.boolean().optional().default(false),
});
//# sourceMappingURL=agent.js.map