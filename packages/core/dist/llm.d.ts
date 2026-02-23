import { z } from "zod";
/**
 * Unified LLM message for chat.
 */
export declare const LLMMessageSchema: z.ZodObject<{
    role: z.ZodEnum<["system", "user", "assistant"]>;
    content: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: "system" | "user" | "assistant";
    content: string;
    name?: string | undefined;
}, {
    role: "system" | "user" | "assistant";
    content: string;
    name?: string | undefined;
}>;
export type LLMMessage = z.infer<typeof LLMMessageSchema>;
export interface LLMChatOptions {
    temperature?: number;
    maxTokens?: number;
    stop?: string[];
}
export interface LLMChatResult {
    message: LLMMessage;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: string;
}
export interface LLMStreamChunk {
    delta: string;
    usage?: LLMChatResult["usage"];
}
/**
 * Unified LLM interface: chat, stream, embed, tokenize.
 * Adapters: OpenAI, Anthropic, Gemini, etc.
 */
export interface LLMProvider {
    chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<LLMChatResult>;
    stream(messages: LLMMessage[], options?: LLMChatOptions): AsyncIterable<LLMStreamChunk>;
    embed?(text: string | string[]): Promise<number[][]>;
    tokenize?(text: string): Promise<number[]>;
}
//# sourceMappingURL=llm.d.ts.map