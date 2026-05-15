from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.models.contact import ContactCreate, ContactResponse
from app.services.contact_service import ContactService

router = APIRouter(prefix="/api/v1/contact", tags=["Contact"])


def _get_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> ContactService:
    return ContactService(db)


@router.post("", response_model=ContactResponse, status_code=201)
async def submit_contact(data: ContactCreate, service: ContactService = Depends(_get_service)):
    await service.create_contact(data)
    return ContactResponse()
