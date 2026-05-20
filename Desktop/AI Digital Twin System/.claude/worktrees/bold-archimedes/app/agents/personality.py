"""Personality Agent - validates and rewrites responses for consistency."""

from __future__ import annotations

from app.agents.base import AgentContext, AgentResult, BaseAgent
from app.llm.gateway import LLMMessage
from app.llm.prompts.personality import PERSONALITY_VALIDATION


class PersonalityAgent(BaseAgent):
    name = "personality"

    async def validate_response(self, context: AgentContext, response_text: str) -> AgentResult:
        style = context.style
        prompt = PERSONALITY_VALIDATION.format(
            twin_name=context.twin_name, tone=style.get("tone", "friendly"),
            formality=style.get("formality", 0.5), humor=style.get("humor", 0.3),
            avoided_topics=", ".join(style.get("avoided_topics", [])) or "none",
            preferred_phrases=", ".join(style.get("preferred_phrases", [])) or "none",
            response=response_text,
        )
        result = await self.llm.generate([LLMMessage(role="user", content=prompt)], temperature=0.2, max_tokens=2048)
        content = result.content.strip()
        if content.startswith("PASS"):
            return AgentResult(agent_name=self.name, content=response_text, confidence=1.0, metadata={"action": "pass"})
        elif content.startswith("REWRITE"):
            rewritten = content[len("REWRITE"):].strip()
            return AgentResult(agent_name=self.name, content=rewritten, confidence=0.8, metadata={"action": "rewrite"})
        return AgentResult(agent_name=self.name, content=response_text, confidence=0.9, metadata={"action": "fallback"})

    async def execute(self, context: AgentContext) -> AgentResult:
        return AgentResult(agent_name=self.name, content=f"Personality loaded for {context.twin_name}",
                           metadata={"personality": context.personality, "style": context.style})
