"""Chat endpoints - REST and WebSocket conversation interface."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.middleware.auth import get_current_user_id
from app.dependencies import get_memory_manager, get_supervisor
from app.models.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service, twin_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, user_id: uuid.UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    twin = await twin_service.get_twin(db, request.twin_id)
    if not twin or twin.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Twin not found")
    conversation_id = request.conversation_id or uuid.uuid4()
    memory_mgr = get_memory_manager()
    history = await memory_mgr.get_conversation_context(conversation_id)
    supervisor = get_supervisor()
    return await chat_service.process_message(supervisor=supervisor, twin=twin, user_message=request.message,
                                              conversation_id=conversation_id, conversation_history=history)


@router.websocket("/ws/{twin_id}")
async def chat_websocket(websocket: WebSocket, twin_id: uuid.UUID):
    await websocket.accept()
    conversation_id = uuid.uuid4()
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            if not message:
                await websocket.send_json({"error": "Empty message"})
                continue
            await websocket.send_json({"type": "status", "content": "processing", "conversation_id": str(conversation_id)})
            await websocket.send_json({"type": "message", "content": "WebSocket streaming - connect supervisor pipeline here.",
                                       "conversation_id": str(conversation_id)})
    except WebSocketDisconnect:
        pass
