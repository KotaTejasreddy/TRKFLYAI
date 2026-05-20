"""OpenAI adapter."""

from __future__ import annotations
from typing import AsyncIterator
import openai
from app.llm.gateway import BaseLLMAdapter, LLMMessage, LLMResponse


class OpenAIAdapter(BaseLLMAdapter):
    provider_name = "openai"

    def __init__(self, api_key: str, default_model: str = "gpt-4o") -> None:
        self._client = openai.AsyncOpenAI(api_key=api_key)
        self._default_model = default_model

    def _to_openai_messages(self, messages: list[LLMMessage]) -> list[dict]:
        return [{"role": m.role, "content": m.content} for m in messages]

    async def generate(self, messages: list[LLMMessage], *, model: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> LLMResponse:
        response = await self._client.chat.completions.create(model=model or self._default_model, messages=self._to_openai_messages(messages), temperature=temperature, max_tokens=max_tokens)
        choice = response.choices[0]
        return LLMResponse(content=choice.message.content or "", model=response.model, provider=self.provider_name, usage={"prompt_tokens": response.usage.prompt_tokens if response.usage else 0, "completion_tokens": response.usage.completion_tokens if response.usage else 0})

    async def generate_stream(self, messages: list[LLMMessage], *, model: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> AsyncIterator[str]:
        stream = await self._client.chat.completions.create(model=model or self._default_model, messages=self._to_openai_messages(messages), temperature=temperature, max_tokens=max_tokens, stream=True)
        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                yield delta.content
