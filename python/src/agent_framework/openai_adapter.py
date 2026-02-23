"""OpenAI LLM adapter."""

from agent_framework.llm import (
    LLMProvider,
    LLMMessage,
    LLMChatOptions,
    LLMChatResult,
    LLMStreamChunk,
    TokenUsage,
)


class OpenAIAdapter(LLMProvider):
    """OpenAI adapter implementing LLMProvider."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str = "gpt-4o-mini",
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._client = None

    def _get_client(self):
        if self._client is None:
            try:
                from openai import AsyncOpenAI
            except ImportError:
                raise ImportError("openai package required: pip install openai") from None
            import os
            self._client = AsyncOpenAI(api_key=self._api_key or os.environ.get("OPENAI_API_KEY"))
        return self._client

    async def chat(
        self,
        messages: list[LLMMessage],
        options: LLMChatOptions | None = None,
    ) -> LLMChatResult:
        client = self._get_client()
        opts = options or LLMChatOptions()
        msgs = [{"role": m.role, "content": m.content} for m in messages]
        resp = await client.chat.completions.create(
            model=self._model,
            messages=msgs,
            temperature=opts.temperature,
            max_tokens=opts.max_tokens,
            stop=opts.stop,
        )
        choice = resp.choices[0] if resp.choices else None
        msg = choice.message if choice else None
        if not msg:
            raise ValueError("OpenAI returned no message")
        usage = None
        if resp.usage:
            usage = TokenUsage(
                prompt_tokens=resp.usage.prompt_tokens,
                completion_tokens=resp.usage.completion_tokens,
                total_tokens=resp.usage.total_tokens,
            )
        return LLMChatResult(
            message=LLMMessage(role=msg.role, content=msg.content or ""),
            usage=usage,
            finish_reason=choice.finish_reason if choice else None,
        )

    async def stream(
        self,
        messages: list[LLMMessage],
        options: LLMChatOptions | None = None,
    ):
        client = self._get_client()
        msgs = [{"role": m.role, "content": m.content} for m in messages]
        stream = await client.chat.completions.create(
            model=self._model,
            messages=msgs,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else ""
            if delta:
                yield LLMStreamChunk(delta=delta)
