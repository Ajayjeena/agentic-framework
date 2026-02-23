import { z } from "zod";
/**
 * Human-in-the-loop modes (AutoGen-style):
 * - ALWAYS: Intercept before every step; user can approve/skip/terminate
 * - TERMINATE: Intercept only at end conditions (e.g. before final output)
 * - NEVER: Fully autonomous; no interception
 */
export declare const HumanInTheLoopModeSchema: z.ZodEnum<["ALWAYS", "TERMINATE", "NEVER"]>;
export type HumanInTheLoopMode = z.infer<typeof HumanInTheLoopModeSchema>;
/**
 * User decision at an intercept point.
 */
export declare const InterceptDecisionSchema: z.ZodEnum<["approve", "skip", "terminate", "modify"]>;
export type InterceptDecision = z.infer<typeof InterceptDecisionSchema>;
/**
 * Context passed to the intercept handler for user approval.
 */
export interface InterceptContext {
    threadId: string;
    nodeId: string;
    step: number;
    state: Record<string, unknown>;
    proposedAction?: string;
    proposedOutput?: unknown;
    timestamp: number;
}
/**
 * User response from an intercept (approve/skip/terminate/modify).
 */
export interface InterceptResponse {
    decision: InterceptDecision;
    /** Optional modified state when decision is "modify" */
    modifiedState?: Record<string, unknown>;
    /** Optional reason for audit */
    reason?: string;
}
//# sourceMappingURL=hitl.d.ts.map