import OpenAI from "openai";
/**
 * OpenAI LLM adapter implementing the unified LLMProvider interface.
 */
export class OpenAIAdapter {
    client;
    defaultModel;
    constructor(options = {}) {
        this.client = new OpenAI({ apiKey: options.apiKey ?? process.env.OPENAI_API_KEY });
        this.defaultModel = options.model ?? options.defaultModel ?? "gpt-4o-mini";
    }
    async chat(messages, options) {
        const response = await this.client.chat.completions.create({
            model: this.defaultModel,
            messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
                ...(m.name && { name: m.name }),
            })),
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
            stop: options?.stop,
        });
        const choice = response.choices[0];
        const msg = choice?.message;
        if (!msg) {
            throw new Error("OpenAI returned no message");
        }
        return {
            message: {
                role: msg.role,
                content: msg.content ?? "",
                name: "name" in msg ? msg.name : undefined,
            },
            usage: response.usage
                ? {
                    promptTokens: response.usage.prompt_tokens,
                    completionTokens: response.usage.completion_tokens,
                    totalTokens: response.usage.total_tokens,
                }
                : undefined,
            finishReason: choice?.finish_reason ?? undefined,
        };
    }
    async *stream(messages, options) {
        const stream = await this.client.chat.completions.create({
            model: this.defaultModel,
            messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
                ...(m.name && { name: m.name }),
            })),
            temperature: options?.temperature,
            max_tokens: options?.maxTokens,
            stream: true,
        });
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
                yield { delta };
            }
        }
    }
}
//# sourceMappingURL=adapter.js.map