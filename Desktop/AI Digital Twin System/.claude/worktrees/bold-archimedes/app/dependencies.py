"""FastAPI dependency injection - singletons for core services."""

from __future__ import annotations

from functools import lru_cache

from app.agents.supervisor import SupervisorAgent
from app.llm.gateway import LLMGateway, build_gateway
from app.memory.manager import MemoryManager


@lru_cache
def get_llm_gateway() -> LLMGateway:
    return build_gateway()


@lru_cache
def get_memory_manager() -> MemoryManager:
    return MemoryManager()


@lru_cache
def get_supervisor() -> SupervisorAgent:
    return SupervisorAgent(
        llm=get_llm_gateway(),
        memory_manager=get_memory_manager(),
    )
