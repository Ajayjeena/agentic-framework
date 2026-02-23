import { z } from "zod";
/**
 * Human-in-the-loop modes (AutoGen-style):
 * - ALWAYS: Intercept before every step; user can approve/skip/terminate
 * - TERMINATE: Intercept only at end conditions (e.g. before final output)
 * - NEVER: Fully autonomous; no interception
 */
export const HumanInTheLoopModeSchema = z.enum(["ALWAYS", "TERMINATE", "NEVER"]);
/**
 * User decision at an intercept point.
 */
export const InterceptDecisionSchema = z.enum(["approve", "skip", "terminate", "modify"]);
//# sourceMappingURL=hitl.js.map