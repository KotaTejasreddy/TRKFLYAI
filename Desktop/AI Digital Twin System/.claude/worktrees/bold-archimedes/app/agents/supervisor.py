"""Supervisor Agent - orchestrates all specialist agents."""

from __future__ import annotations

import uuid

import structlog

from app.agents.base import AgentContext, AgentResult, BaseAgent
from app.agents.conversation import ConversationAgent
from app.agents.knowledge import KnowledgeAgent
from app.agents.memory_recall import MemoryRecallAgent
from app.agents.personality import PersonalityAgent
from app.agents.task_execution import TaskExecutionAgent
from app.llm.gateway import LLMGateway, LLMMessage
from app.llm.prompts.supervisor import INTENT_CLASSIFICATION
from app.memory.manager import MemoryManager

logger = structlog.get_logger()

INTENT_TO_AGENTS = {
    "CONVERSATION": ["memory_recall", "conversation"],
    "MEMORY_RECALL": ["memory_recall", "conversation"],
    "KNOWLEDGE": ["memory_recall", "knowledge"],
    "TASK": ["memory_recall", "task_execution"],
}


class SupervisorAgent:
    def __init__(self, llm: LLMGateway, memory_manager: MemoryManager) -> None:
        self.llm = llm
        self.memory = memory_manager
        self._agents: dict[str, BaseAgent] = {
            "conversation": ConversationAgent(llm),
            "memory_recall": MemoryRecallAgent(llm, memory_manager),
            "personality": PersonalityAgent(llm),
            "knowledge": KnowledgeAgent(llm),
            "task_execution": TaskExecutionAgent(llm),
        }

    async def classify_intent(self, context: AgentContext) -> str:
        prompt = INTENT_CLASSIFICATION.format(
            twin_name=context.twin_name, twin_description=context.twin_description, user_message=context.user_message,
        )
        response = await self.llm.generate([LLMMessage(role="user", content=prompt)], temperature=0.1, max_tokens=20)
        intent = response.content.strip().upper()
        if intent not in INTENT_TO_AGENTS:
            intent = "CONVERSATION"
        logger.info("intent_classified", intent=intent, twin=context.twin_name)
        return intent

    async def process(self, context: AgentContext) -> AgentResult:
        intent = await self.classify_intent(context)
        agent_names = INTENT_TO_AGENTS[intent]

        memory_result = await self._agents["memory_recall"].execute(context)
        context.memories = [line.split("] ", 1)[-1] for line in memory_result.content.split("\n") if line.strip()]

        primary_agent_name = [n for n in agent_names if n != "memory_recall"][0]
        result = await self._agents[primary_agent_name].execute(context)

        personality_agent = self._agents["personality"]
        validated = await personality_agent.validate_response(context, result.content)

        conv_id = context.extra.get("conversation_id")
        if conv_id:
            await self.memory.save_turn(uuid.UUID(conv_id), "user", context.user_message)
            await self.memory.save_turn(uuid.UUID(conv_id), "assistant", validated.content)

        logger.info("supervisor_complete", intent=intent,
                     agents_used=[memory_result.agent_name, result.agent_name, validated.agent_name],
                     personality_action=validated.metadata.get("action"))

        return AgentResult(
            agent_name="supervisor", content=validated.content,
            metadata={"intent": intent, "agents_used": [memory_result.agent_name, result.agent_name],
                       "personality_action": validated.metadata.get("action"),
                       "memories_used": memory_result.metadata.get("memory_count", 0)},
        )
