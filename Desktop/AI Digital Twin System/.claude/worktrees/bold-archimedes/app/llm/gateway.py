"""Provider-agnostic LLM gateway with failover support."""

from __future__ import annotations

import abc
from dataclasses import dataclass, field
from typing import AsyncIterator

import structlog

from app.config import LLMProvider, get_settings

logger = structlog.get_logger()


@dataclass
class LLMMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass
class LLMResponse:
    content: str
    model: str
    provider: str
    usage: dict = field(default_factory=dict)


class BaseLLMAdapter(abc.ABC):
    """Interface that every LLM provider adapter must implement."""

    provider_name: str

    @abc.abstractmethod
    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> LLMResponse: ...

    @abc.abstractmethod
    async def generate_stream(
        self,
        messages: list[LLMMessage],
        *,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncIterator[str]: ...


class LLMGateway:
    """Routes requests to the appropriate provider with automatic failover."""

    def __init__(self) -> None:
        self._adapters: dict[str, BaseLLMAdapter] = {}
        self._failover_order: list[str] = []

    def register(self, adapter: BaseLLMAdapter, *, primary: bool = False) -> None:
        self._adapters[adapter.provider_name] = adapter
        if primary:
            self._failover_order.insert(0, adapter.provider_name)
        else:
            self._failover_order.append(adapter.provider_name)

    async def generate(
        self,
        messages: list[LLMMessage],
        *,
        provider: str | None = None,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> LLMResponse:
        order = [provider] if provider and provider in self._adapters else self._failover_order

        last_error: Exception | None = None
        for name in order:
            adapter = self._adapters[name]
            try:
                return await adapter.generate(
                    messages, model=model, temperature=temperature, max_tokens=max_tokens
                )
            except Exception as exc:
                last_error = exc
                logger.warning("llm_provider_failed", provider=name, error=str(exc))

        raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")

    async def generate_stream(
        self,
        messages: list[LLMMessage],
        *,
        provider: str | None = None,
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncIterator[str]:
        order = [provider] if provider and provider in self._adapters else self._failover_order

        last_error: Exception | None = None
        for name in order:
            adapter = self._adapters[name]
            try:
                async for chunk in adapter.generate_stream(
                    messages, model=model, temperature=temperature, max_tokens=max_tokens
                ):
                    yield chunk
                return
            except Exception as exc:
                last_error = exc
                logger.warning("llm_stream_provider_failed", provider=name, error=str(exc))

        raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")


def build_gateway() -> LLMGateway:
    """Factory that registers available adapters based on config."""
    from app.llm.claude_adapter import ClaudeAdapter
    from app.llm.openai_adapter import OpenAIAdapter

    settings = get_settings()
    gateway = LLMGateway()

    if settings.anthropic_api_key:
        gateway.register(
            ClaudeAdapter(api_key=settings.anthropic_api_key),
            primary=(settings.default_llm_provider == LLMProvider.CLAUDE),
        )
    if settings.openai_api_key:
        gateway.register(
            OpenAIAdapter(api_key=settings.openai_api_key),
            primary=(settings.default_llm_provider == LLMProvider.OPENAI),
        )

    return gateway
