import { z } from "zod";
/**
 * Thread identifier for per-workflow state and checkpointing.
 */
export const ThreadIdSchema = z.string().min(1);
//# sourceMappingURL=thread.js.map