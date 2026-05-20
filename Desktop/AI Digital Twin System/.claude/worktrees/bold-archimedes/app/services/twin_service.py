"""Business logic for twin CRUD operations."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.twin import Twin
from app.schemas.twin import TwinCreate, TwinUpdate


async def create_twin(db: AsyncSession, owner_id: uuid.UUID, data: TwinCreate) -> Twin:
    twin = Twin(owner_id=owner_id, name=data.name, description=data.description,
                system_prompt=data.system_prompt, personality=data.personality.model_dump(),
                style=data.style.model_dump(), metadata_=data.metadata)
    db.add(twin)
    await db.commit()
    await db.refresh(twin)
    return twin


async def get_twin(db: AsyncSession, twin_id: uuid.UUID) -> Twin | None:
    return await db.get(Twin, twin_id)


async def list_twins(db: AsyncSession, owner_id: uuid.UUID) -> list[Twin]:
    result = await db.execute(select(Twin).where(Twin.owner_id == owner_id))
    return list(result.scalars().all())


async def update_twin(db: AsyncSession, twin: Twin, data: TwinUpdate) -> Twin:
    update_data = data.model_dump(exclude_unset=True)
    if "personality" in update_data and update_data["personality"] is not None:
        update_data["personality"] = data.personality.model_dump()
    if "style" in update_data and update_data["style"] is not None:
        update_data["style"] = data.style.model_dump()
    if "metadata" in update_data:
        update_data["metadata_"] = update_data.pop("metadata")
    for fld, value in update_data.items():
        setattr(twin, fld, value)
    await db.commit()
    await db.refresh(twin)
    return twin


async def delete_twin(db: AsyncSession, twin: Twin) -> None:
    await db.delete(twin)
    await db.commit()
