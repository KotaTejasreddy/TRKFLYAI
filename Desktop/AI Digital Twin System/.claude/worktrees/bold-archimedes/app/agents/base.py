"""Abstract base agent that all specialist agents inherit from."""

from __future__ import annotations

import abc
from dataclasses import dataclass, field

from app.llm.gateway import LLMGateway


@dataclass
class AgentContext:
    twin_id: str
    twin_name: str
    twin_description: str
    personality: dict
    style: dict
    system_prompt: str
    conversation_history: list[dict] = field(default_factory=list)
    memories: list[str] = field(default_factory=list)
    user_message: str = ""
    extra: dict = field(default_factory=dict)


@dataclass
class AgentResult:
    agent_name: str
    content: str
    confidence: float = 1.0
    metadata: dict = field(default_factory=dict)


class BaseAgent(abc.ABC):
    name: str

    def __init__(self, llm: LLMGateway) -> None:
        self.llm = llm

    @abc.abstractmethod
    async def execute(self, context: AgentContext) -> AgentResult: ...
