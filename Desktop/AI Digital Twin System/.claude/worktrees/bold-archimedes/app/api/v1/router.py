"""Top-level v1 API router."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.memory import router as memory_router
from app.api.v1.twins import router as twins_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(twins_router)
api_router.include_router(chat_router)
api_router.include_router(memory_router)
api_router.include_router(admin_router)
