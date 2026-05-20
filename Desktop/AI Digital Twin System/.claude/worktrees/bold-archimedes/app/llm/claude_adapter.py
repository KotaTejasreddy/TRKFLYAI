"""Anthropic Claude adapter."""

from __future__ import annotations

from typing import AsyncIterator

import anthropic

from app.llm.gateway import BaseLLMAdapter, LLMMessage, LLMResponse


class ClaudeAdapter(BaseLLMAdapter):
    provider_name = "claude"

    def __init__(self, api_key: str, default_model: str = "claude-sonnet-4-20250514") -> None:
        self._client = anthropic.AsyncAnthropic(api_key=api_key)
        self._default_model = default_model

    def _split_system(self, messages: list[LLMMessage]) -> tuple[str, list[dict]]:
        system = ""
        chat_messages = []
        for msg in messages:
            if msg.role == "system":
                system += msg.content + chr(10)
            else:
                chat_messages.append({"role": msg.role, "content": msg.content})
        return system.strip(), chat_messages

    async def generate(self, messages: list[LLMMessage], *, model: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> LLMResponse:
        system, chat_messages = self._split_system(messages)
        response = await self._client.messages.create(
            model=model or self._default_model,
            system=system or anthropic.NOT_GIVEN,
            messages=chat_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return LLMResponse(
            content=response.content[0].text,
            model=response.model,
            provider=self.provider_name,
            usage={"prompt_tokens": response.usage.input_tokens, "completion_tokens": response.usage.output_tokens},
        )

    async def generate_stream(self, messages: list[LLMMessage], *, model: str | None = None, temperature: float = 0.7, max_tokens: int = 2048) -> AsyncIterator[str]:
        system, chat_messages = self._split_system(messages)
        async with self._client.messages.stream(
            model=model or self._default_model,
            system=system or anthropic.NOT_GIVEN,
            messages=chat_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        ) as stream:
            async for text in stream.text_stream:
                yield text
