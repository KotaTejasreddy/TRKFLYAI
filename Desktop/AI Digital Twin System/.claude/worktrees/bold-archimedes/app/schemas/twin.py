"""Pydantic schemas for Digital Twin profiles."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PersonalityTraits(BaseModel):
    """Big Five personality traits + custom extensions."""

    openness: float = Field(0.5, ge=0.0, le=1.0)
    conscientiousness: float = Field(0.5, ge=0.0, le=1.0)
    extraversion: float = Field(0.5, ge=0.0, le=1.0)
    agreeableness: float = Field(0.5, ge=0.0, le=1.0)
    neuroticism: float = Field(0.5, ge=0.0, le=1.0)
    custom_traits: dict[str, float] = Field(default_factory=dict)


class StyleConfig(BaseModel):
    """Controls how the twin communicates."""

    tone: str = "friendly"
    formality: float = Field(0.5, ge=0.0, le=1.0, description="0=casual, 1=formal")
    verbosity: float = Field(0.5, ge=0.0, le=1.0, description="0=terse, 1=verbose")
    humor: float = Field(0.3, ge=0.0, le=1.0)
    vocabulary_level: str = "standard"
    preferred_phrases: list[str] = Field(default_factory=list)
    avoided_topics: list[str] = Field(default_factory=list)


class TwinCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field("", max_length=500)
    system_prompt: str = Field("", max_length=5000, description="Base system prompt for the twin")
    personality: PersonalityTraits = Field(default_factory=PersonalityTraits)
    style: StyleConfig = Field(default_factory=StyleConfig)
    seed_memories: list[str] = Field(default_factory=list, description="Initial memories to seed")
    metadata: dict = Field(default_factory=dict)


class TwinUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    system_prompt: str | None = None
    personality: PersonalityTraits | None = None
    style: StyleConfig | None = None
    metadata: dict | None = None


class TwinResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    system_prompt: str
    personality: PersonalityTraits
    style: StyleConfig
    metadata: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
