import { z } from "zod";
/**
 * A unit of work assigned to an agent or crew.
 */
export const TaskSchema = z.object({
    id: z.string(),
    description: z.string(),
    agentId: z.string().optional(),
    input: z.record(z.unknown()).optional(),
    output: z.unknown().optional(),
});
//# sourceMappingURL=task.js.map