"""Working memory - Redis-backed short-lived conversation context."""

from __future__ import annotations

import json
import uuid

import redis.asyncio as redis

from app.config import get_settings


class WorkingMemory:
    TTL_SECONDS = 3600

    def __init__(self, redis_client: redis.Redis | None = None) -> None:
        self._redis = redis_client

    async def _get_redis(self) -> redis.Redis:
        if self._redis is None:
            settings = get_settings()
            self._redis = redis.from_url(settings.redis_url, decode_responses=True)
        return self._redis

    def _key(self, conversation_id: uuid.UUID) -> str:
        return f"working_memory:{conversation_id}"

    async def get_context(self, conversation_id: uuid.UUID) -> list[dict]:
        r = await self._get_redis()
        raw = await r.get(self._key(conversation_id))
        if raw is None:
            return []
        return json.loads(raw)

    async def append_message(self, conversation_id: uuid.UUID, role: str, content: str) -> None:
        r = await self._get_redis()
        key = self._key(conversation_id)
        context = await self.get_context(conversation_id)
        context.append({"role": role, "content": content})
        await r.set(key, json.dumps(context), ex=self.TTL_SECONDS)

    async def clear(self, conversation_id: uuid.UUID) -> None:
        r = await self._get_redis()
        await r.delete(self._key(conversation_id))
