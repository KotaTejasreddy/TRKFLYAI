import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.exceptions import DatabaseException
from app.models.contact import ContactCreate

logger = logging.getLogger(__name__)


class ContactService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["contacts"]

    async def create_contact(self, data: ContactCreate) -> dict:
        logger.info("Creating contact submission from %s <%s>", data.name, data.email)
        try:
            document = {
                **data.model_dump(),
                "created_at": datetime.now(timezone.utc),
                "read": False,
            }
            result = await self.collection.insert_one(document)
            logger.info("Contact submission created with id=%s", str(result.inserted_id))
            return {"id": str(result.inserted_id)}
        except Exception as e:
            logger.error("Failed to create contact submission: %s", str(e))
            raise DatabaseException(detail="Failed to save contact message")
