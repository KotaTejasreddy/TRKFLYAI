import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.exceptions import DatabaseException
from app.models.application import ApplicationCreate

logger = logging.getLogger(__name__)


class CareerService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["applications"]

    async def create_application(self, data: ApplicationCreate) -> dict:
        logger.info("Creating application from %s <%s> for role: %s", data.name, data.email, data.role)
        try:
            document = {
                **data.model_dump(),
                "created_at": datetime.now(timezone.utc),
                "status": "pending",
            }
            result = await self.collection.insert_one(document)
            logger.info("Application created with id=%s", str(result.inserted_id))
            return {"id": str(result.inserted_id)}
        except Exception as e:
            logger.error("Failed to create application: %s", str(e))
            raise DatabaseException(detail="Failed to save application")
