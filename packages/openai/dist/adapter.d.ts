import type { LLMProvider, LLMMessage, LLMChatOptions, LLMChatResult, LLMStreamChunk } from "@agent-framework/core";
export interface OpenAIAdapterOptions {
    apiKey?: string;
    model?: string;
    /** Default model if not specified per request */
    defaultModel?: string;
}
/**
 * OpenAI LLM adapter implementing the unified LLMProvider interface.
 */
export declare class OpenAIAdapter implements LLMProvider {
    private client;
    private defaultModel;
    constructor(options?: OpenAIAdapterOptions);
    chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<LLMChatResult>;
    stream(messages: LLMMessage[], options?: LLMChatOptions): AsyncIterable<LLMStreamChunk>;
}
//# sourceMappingURL=adapter.d.ts.map