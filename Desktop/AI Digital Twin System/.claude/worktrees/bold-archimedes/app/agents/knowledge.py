"""Knowledge Agent - retrieves domain-specific knowledge for the twin."""

from __future__ import annotations

from app.agents.base import AgentContext, AgentResult, BaseAgent
from app.llm.gateway import LLMMessage


class KnowledgeAgent(BaseAgent):
    name = "knowledge"

    async def execute(self, context: AgentContext) -> AgentResult:
        system = (f"You are a knowledge retrieval system for {context.twin_name}. "
                  f"Based on the twin background ({context.twin_description}), "
                  f"answer the following question factually. If you don't know, say so. Do NOT make up facts.")
        if context.memories:
            system += "\n\nRelevant knowledge from memory:\n" + "\n".join(f"- {m}" for m in context.memories)
        response = await self.llm.generate(
            [LLMMessage(role="system", content=system), LLMMessage(role="user", content=context.user_message)],
            temperature=0.3, max_tokens=1024,
        )
        return AgentResult(agent_name=self.name, content=response.content, metadata={"model": response.model})
