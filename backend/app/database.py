import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global _client, _database
    logger.info("Connecting to MongoDB at %s", settings.MONGO_URI)
    # tlsCAFile fixes SSL handshake failures on cloud platforms (Render, Heroku, etc.)
    # where the default CA bundle doesn't match what Atlas presents.
    _client = AsyncIOMotorClient(
        settings.MONGO_URI,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=20_000,
    )
    _database = _client[settings.DB_NAME]
    # Verify connectivity
    await _client.admin.command("ping")
    logger.info("Connected to MongoDB database: %s", settings.DB_NAME)


async def disconnect_db() -> None:
    global _client, _database
    if _client is not None:
        _client.close()
        _client = None
        _database = None
        logger.info("Disconnected from MongoDB")


def get_database() -> AsyncIOMotorDatabase:
    if _database is None:
        raise RuntimeError("Database is not connected. Call connect_db() first.")
    return _database


def get_collection(name: str):
    """Convenience accessor for a Mongo collection."""
    return get_database()[name]
