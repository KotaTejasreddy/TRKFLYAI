"""Episodic memory - stores specific event recollections with temporal context."""

from __future__ import annotations

import uuid
from datetime import datetime

from app.memory.long_term import LongTermMemory, VectorSearchResult


class EpisodicMemory:
    def __init__(self, long_term: LongTermMemory | None = None) -> None:
        self._lt = long_term or LongTermMemory()

    async def record_episode(self, twin_id: uuid.UUID, memory_id: str, content: str, *,
                             timestamp: datetime | None = None, participants: list[str] | None = None,
                             emotion: str | None = None) -> None:
        metadata = {
            "type": "episodic",
            "timestamp": (timestamp or datetime.utcnow()).isoformat(),
            "participants": ",".join(participants or []),
        }
        if emotion:
            metadata["emotion"] = emotion
        await self._lt.store(twin_id, memory_id, content, metadata)

    async def recall_episodes(self, twin_id: uuid.UUID, query: str, top_k: int = 5) -> list[VectorSearchResult]:
        return await self._lt.recall(twin_id, query, top_k=top_k)
