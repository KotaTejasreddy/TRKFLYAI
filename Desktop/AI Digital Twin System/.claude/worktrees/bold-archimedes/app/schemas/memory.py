"""Pydantic schemas for the memory system."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MemoryType(str, Enum):
    WORKING = "working"
    SHORT_TERM = "short_term"
    LONG_TERM = "long_term"
    EPISODIC = "episodic"
    SEMANTIC = "semantic"


class MemoryCreate(BaseModel):
    twin_id: uuid.UUID
    content: str = Field(..., min_length=1)
    memory_type: MemoryType = MemoryType.LONG_TERM
    importance: float = Field(0.5, ge=0.0, le=1.0)
    metadata: dict = Field(default_factory=dict)


class MemoryRecord(BaseModel):
    id: uuid.UUID
    twin_id: uuid.UUID
    content: str
    memory_type: MemoryType
    importance: float
    embedding_id: str | None = None
    metadata: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class MemoryQuery(BaseModel):
    twin_id: uuid.UUID
    query: str = Field(..., min_length=1)
    memory_types: list[MemoryType] | None = None
    top_k: int = Field(5, ge=1, le=50)
    min_relevance: float = Field(0.0, ge=0.0, le=1.0)


class MemorySearchResult(BaseModel):
    memory: MemoryRecord
    relevance_score: float
