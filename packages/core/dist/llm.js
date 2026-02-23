import { z } from "zod";
/**
 * Unified LLM message for chat.
 */
export const LLMMessageSchema = z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string(),
    name: z.string().optional(),
});
//# sourceMappingURL=llm.js.map