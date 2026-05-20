"""Task Execution Agent - handles structured tasks."""

from __future__ import annotations

from app.agents.base import AgentContext, AgentResult, BaseAgent
from app.llm.gateway import LLMMessage


class TaskExecutionAgent(BaseAgent):
    name = "task_execution"

    async def execute(self, context: AgentContext) -> AgentResult:
        system = (f"You are a task execution assistant for {context.twin_name}. "
                  "Help the user accomplish their task. Be precise and actionable.")
        response = await self.llm.generate(
            [LLMMessage(role="system", content=system), LLMMessage(role="user", content=context.user_message)],
            temperature=0.4, max_tokens=1024,
        )
        return AgentResult(agent_name=self.name, content=response.content, metadata={"model": response.model})
