"""Conversation Agent - generates natural dialogue as the twin."""

from __future__ import annotations

from app.agents.base import AgentContext, AgentResult, BaseAgent
from app.llm.gateway import LLMMessage
from app.llm.prompts.conversation import CONVERSATION_SYSTEM


class ConversationAgent(BaseAgent):
    name = "conversation"

    async def execute(self, context: AgentContext) -> AgentResult:
        personality = context.personality
        style = context.style

        avoided = style.get("avoided_topics", [])
        rules = "NEVER discuss these topics: " + ", ".join(avoided) if avoided else ""

        system_prompt = CONVERSATION_SYSTEM.format(
            twin_name=context.twin_name, twin_description=context.twin_description,
            openness=personality.get("openness", 0.5), conscientiousness=personality.get("conscientiousness", 0.5),
            extraversion=personality.get("extraversion", 0.5), agreeableness=personality.get("agreeableness", 0.5),
            neuroticism=personality.get("neuroticism", 0.5), tone=style.get("tone", "friendly"),
            formality=style.get("formality", 0.5), verbosity=style.get("verbosity", 0.5),
            humor=style.get("humor", 0.3), behavior_rules=rules,
            memories="\n".join(f"- {m}" for m in context.memories) or "No relevant memories.",
        )

        if context.system_prompt:
            system_prompt = context.system_prompt + "\n\n" + system_prompt

        messages = [LLMMessage(role="system", content=system_prompt)]
        for msg in context.conversation_history[-20:]:
            messages.append(LLMMessage(role=msg["role"], content=msg["content"]))
        messages.append(LLMMessage(role="user", content=context.user_message))

        response = await self.llm.generate(messages, temperature=0.8)
        return AgentResult(agent_name=self.name, content=response.content,
                           metadata={"model": response.model, "usage": response.usage})
