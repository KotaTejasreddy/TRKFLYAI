"""Memory operations service."""

from __future__ import annotations

import uuid

from app.memory.manager import MemoryManager, RecalledMemory
from app.schemas.memory import MemoryCreate


async def ingest_memory(memory_manager: MemoryManager, data: MemoryCreate) -> str:
    memory_id = str(uuid.uuid4())
    await memory_manager.store_memory(twin_id=data.twin_id, memory_id=memory_id, content=data.content,
                                      memory_type=data.memory_type,
                                      metadata={"importance": data.importance, **data.metadata})
    return memory_id


async def query_memories(memory_manager: MemoryManager, twin_id: uuid.UUID, query: str,
                         top_k: int = 5) -> list[RecalledMemory]:
    return await memory_manager.recall(twin_id, query, top_k=top_k)
