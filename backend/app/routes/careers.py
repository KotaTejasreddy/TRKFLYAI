from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.models.application import ApplicationCreate, ApplicationResponse
from app.services.career_service import CareerService

router = APIRouter(prefix="/api/v1/careers", tags=["Careers"])


def _get_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> CareerService:
    return CareerService(db)


@router.post("/apply", response_model=ApplicationResponse, status_code=201)
async def submit_application(data: ApplicationCreate, service: CareerService = Depends(_get_service)):
    await service.create_application(data)
    return ApplicationResponse()
