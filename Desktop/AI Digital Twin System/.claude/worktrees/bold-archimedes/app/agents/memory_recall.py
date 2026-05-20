"""Memory Recall Agent - searches vector DB for relevant memories."""

from __future__ import annotations

import uuid

from app.agents.base import AgentContext, AgentResult, BaseAgent
from app.llm.gateway import LLMGateway
from app.memory.manager import MemoryManager


class MemoryRecallAgent(BaseAgent):
    name = "memory_recall"

    def __init__(self, llm: LLMGateway, memory_manager: MemoryManager) -> None:
        super().__init__(llm)
        self.memory = memory_manager

    async def execute(self, context: AgentContext) -> AgentResult:
        twin_uuid = uuid.UUID(context.twin_id)
        recalled = await self.memory.recall(twin_uuid, context.user_message, top_k=10, min_relevance=0.3)
        memories = [f"[{m.memory_type}, relevance={m.relevance:.2f}] {m.content}" for m in recalled]
        return AgentResult(
            agent_name=self.name,
            content="\n".join(memories) if memories else "No relevant memories found.",
            confidence=max((m.relevance for m in recalled), default=0.0),
            metadata={"memory_count": len(recalled)},
        )
