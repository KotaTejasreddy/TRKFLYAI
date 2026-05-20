"""Chat orchestration service."""

from __future__ import annotations

import uuid

from app.agents.base import AgentContext
from app.agents.supervisor import SupervisorAgent
from app.models.twin import Twin
from app.schemas.chat import ChatMessage, ChatResponse, MessageRole


async def process_message(supervisor: SupervisorAgent, twin: Twin, user_message: str,
                          conversation_id: uuid.UUID, conversation_history: list[dict] | None = None) -> ChatResponse:
    context = AgentContext(
        twin_id=str(twin.id), twin_name=twin.name, twin_description=twin.description,
        personality=twin.personality or {}, style=twin.style or {}, system_prompt=twin.system_prompt or "",
        conversation_history=conversation_history or [], user_message=user_message,
        extra={"conversation_id": str(conversation_id)},
    )
    result = await supervisor.process(context)
    return ChatResponse(
        conversation_id=conversation_id, twin_id=twin.id,
        message=ChatMessage(role=MessageRole.ASSISTANT, content=result.content),
        memories_used=result.metadata.get("memories_used", 0),
        agent_trace=result.metadata.get("agents_used", []),
    )
