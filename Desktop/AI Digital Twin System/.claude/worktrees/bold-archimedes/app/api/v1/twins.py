"""Twin CRUD endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.middleware.auth import get_current_user_id
from app.models.database import get_db
from app.schemas.twin import TwinCreate, TwinResponse, TwinUpdate
from app.services import twin_service

router = APIRouter(prefix="/twins", tags=["twins"])


@router.post("/", response_model=TwinResponse, status_code=status.HTTP_201_CREATED)
async def create_twin(data: TwinCreate, user_id: uuid.UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await twin_service.create_twin(db, user_id, data)


@router.get("/", response_model=list[TwinResponse])
async def list_twins(user_id: uuid.UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await twin_service.list_twins(db, user_id)


@router.get("/{twin_id}", response_model=TwinResponse)
async def get_twin(twin_id: uuid.UUID, user_id: uuid.UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    twin = await twin_service.get_twin(db, twin_id)
    if not twin or twin.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Twin not found")
    return twin


@router.patch("/{twin_id}", response_model=TwinResponse)
async def update_twin(twin_id: uuid.UUID, data: TwinUpdate, user_id: uuid.UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    twin = await twin_service.get_twin(db, twin_id)
    if not twin or twin.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Twin not found")
    return await twin_service.update_twin(db, twin, data)


@router.delete("/{twin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_twin(twin_id: uuid.UUID, user_id: uuid.UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    twin = await twin_service.get_twin(db, twin_id)
    if not twin or twin.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Twin not found")
    await twin_service.delete_twin(db, twin)
