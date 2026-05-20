"""Unified memory manager - single interface over all memory subsystems."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from app.memory.episodic import EpisodicMemory
from app.memory.long_term import LongTermMemory
from app.memory.working import WorkingMemory
from app.schemas.memory import MemoryType


@dataclass
class RecalledMemory:
    content: str
    memory_type: str
    relevance: float
    metadata: dict


class MemoryManager:
    def __init__(self, working: WorkingMemory | None = None, long_term: LongTermMemory | None = None,
                 episodic: EpisodicMemory | None = None) -> None:
        self.working = working or WorkingMemory()
        self.long_term = long_term or LongTermMemory()
        self.episodic = episodic or EpisodicMemory(self.long_term)

    async def store_memory(self, twin_id: uuid.UUID, memory_id: str, content: str,
                           memory_type: MemoryType = MemoryType.LONG_TERM, metadata: dict | None = None) -> None:
        meta = {"memory_type": memory_type.value, **(metadata or {})}
        if memory_type == MemoryType.EPISODIC:
            await self.episodic.record_episode(twin_id, memory_id, content)
        else:
            await self.long_term.store(twin_id, memory_id, content, meta)

    async def recall(self, twin_id: uuid.UUID, query: str, *, top_k: int = 5,
                     min_relevance: float = 0.0) -> list[RecalledMemory]:
        results = await self.long_term.recall(twin_id, query, top_k=top_k, min_relevance=min_relevance)
        return [
            RecalledMemory(content=r.content, memory_type=r.metadata.get("memory_type", "long_term"),
                           relevance=r.score, metadata=r.metadata)
            for r in results
        ]

    async def get_conversation_context(self, conversation_id: uuid.UUID) -> list[dict]:
        return await self.working.get_context(conversation_id)

    async def save_turn(self, conversation_id: uuid.UUID, role: str, content: str) -> None:
        await self.working.append_message(conversation_id, role, content)
