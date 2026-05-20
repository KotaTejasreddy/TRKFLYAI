"""Admin and health check endpoints."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-digital-twin"}


@router.get("/info")
async def info():
    return {
        "service": "AI Digital Twin Platform",
        "version": "0.1.0",
        "components": ["supervisor_agent", "conversation_agent", "memory_recall_agent",
                        "personality_agent", "knowledge_agent", "task_execution_agent"],
    }
