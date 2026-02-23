import OpenAI from "openai";
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
export class OpenAIAdapter implements LLMProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(options: OpenAIAdapterOptions = {}) {
    this.client = new OpenAI({ apiKey: options.apiKey ?? process.env.OPENAI_API_KEY });
    this.defaultModel = options.model ?? options.defaultModel ?? "gpt-4o-mini";
  }

  async chat(messages: LLMMessage[], options?: LLMChatOptions): Promise<LLMChatResult> {
    const response = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
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
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content ?? "",
        name: "name" in msg ? (msg as { name?: string }).name : undefined,
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

  async *stream(
    messages: LLMMessage[],
    options?: LLMChatOptions
  ): AsyncIterable<LLMStreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
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
