"""Embedding generation for the memory system."""

from __future__ import annotations

import abc

import openai

from app.config import get_settings


class BaseEmbedder(abc.ABC):
    @abc.abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]: ...

    async def embed_one(self, text: str) -> list[float]:
        results = await self.embed([text])
        return results[0]


class OpenAIEmbedder(BaseEmbedder):
    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        settings = get_settings()
        self._client = openai.AsyncOpenAI(api_key=api_key or settings.openai_api_key)
        self._model = model or settings.embedding_model

    async def embed(self, texts: list[str]) -> list[list[float]]:
        response = await self._client.embeddings.create(input=texts, model=self._model)
        return [item.embedding for item in response.data]


def get_embedder() -> BaseEmbedder:
    return OpenAIEmbedder()
