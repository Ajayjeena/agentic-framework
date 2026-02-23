import { z } from "zod";
/**
 * Role / Goal / Backstory (CrewAI-style) agent metadata.
 */
export declare const AgentProfileSchema: z.ZodObject<{
    role: z.ZodString;
    goal: z.ZodString;
    backstory: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: string;
    goal: string;
    backstory?: string | undefined;
}, {
    role: string;
    goal: string;
    backstory?: string | undefined;
}>;
export type AgentProfile = z.infer<typeof AgentProfileSchema>;
/**
 * Base agent definition: identity + optional profile for prompts and delegation.
 */
export declare const AgentDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    profile: z.ZodOptional<z.ZodObject<{
        role: z.ZodString;
        goal: z.ZodString;
        backstory: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        role: string;
        goal: string;
        backstory?: string | undefined;
    }, {
        role: string;
        goal: string;
        backstory?: string | undefined;
    }>>;
    allowDelegation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    allowDelegation: boolean;
    profile?: {
        role: string;
        goal: string;
        backstory?: string | undefined;
    } | undefined;
}, {
    id: string;
    profile?: {
        role: string;
        goal: string;
        backstory?: string | undefined;
    } | undefined;
    allowDelegation?: boolean | undefined;
}>;
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
//# sourceMappingURL=agent.d.ts.map