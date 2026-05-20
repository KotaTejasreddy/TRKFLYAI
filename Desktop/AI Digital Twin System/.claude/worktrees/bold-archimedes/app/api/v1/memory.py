"""Memory query and injection endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends

from app.api.middleware.auth import get_current_user_id
from app.dependencies import get_memory_manager
from app.schemas.memory import MemoryCreate, MemoryQuery
from app.services import memory_service

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("/ingest", status_code=201)
async def ingest_memory(data: MemoryCreate, user_id: uuid.UUID = Depends(get_current_user_id)):
    memory_mgr = get_memory_manager()
    memory_id = await memory_service.ingest_memory(memory_mgr, data)
    return {"memory_id": memory_id, "status": "stored"}


@router.post("/query")
async def query_memories(data: MemoryQuery, user_id: uuid.UUID = Depends(get_current_user_id)):
    memory_mgr = get_memory_manager()
    results = await memory_service.query_memories(memory_mgr, data.twin_id, data.query, top_k=data.top_k)
    return {"query": data.query, "results": [{"content": r.content, "relevance": r.relevance, "type": r.memory_type} for r in results]}
