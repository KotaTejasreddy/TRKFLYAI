"""Memory consolidation - background job that compresses and promotes memories."""

from __future__ import annotations

import uuid

import structlog

from app.llm.gateway import LLMGateway, LLMMessage
from app.memory.manager import MemoryManager

logger = structlog.get_logger()


async def consolidate_memories(twin_id: uuid.UUID, memory_manager: MemoryManager, llm: LLMGateway,
                               *, batch_size: int = 20) -> int:
    memories = await memory_manager.recall(twin_id, query="*", top_k=batch_size)
    if len(memories) < batch_size:
        return 0
    memory_texts = "\n".join(f"- {m.content}" for m in memories)
    response = await llm.generate([
        LLMMessage(role="system", content="You are a memory consolidation system. Summarize the following memories "
                   "into a concise set of key facts and themes. Preserve important details. Output a bulleted list."),
        LLMMessage(role="user", content=memory_texts),
    ], temperature=0.3, max_tokens=1024)
    consolidated_id = str(uuid.uuid4())
    await memory_manager.store_memory(twin_id, consolidated_id, response.content,
                                      metadata={"consolidated": True, "source_count": len(memories)})
    logger.info("memories_consolidated", twin_id=str(twin_id), source_count=len(memories))
    return len(memories)
