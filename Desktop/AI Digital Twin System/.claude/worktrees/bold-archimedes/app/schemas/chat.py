"""Pydantic schemas for chat / conversation."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    twin_id: uuid.UUID
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: uuid.UUID | None = None
    stream: bool = False


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    twin_id: uuid.UUID
    message: ChatMessage
    memories_used: int = 0
    agent_trace: list[str] = Field(default_factory=list, description="Which agents contributed")


class ConversationHistory(BaseModel):
    conversation_id: uuid.UUID
    twin_id: uuid.UUID
    messages: list[ChatMessage]
    created_at: datetime
