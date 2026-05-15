import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.exceptions import NotFoundException, DatabaseException

logger = logging.getLogger(__name__)


class ProductService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["products"]

    async def get_all_products(self) -> list[dict]:
        logger.info("Fetching all products")
        try:
            cursor = self.collection.find().sort("created_at", -1)
            products = await cursor.to_list(length=100)
            for product in products:
                product["_id"] = str(product["_id"])
            logger.info("Retrieved %d products", len(products))
            return products
        except Exception as e:
            logger.error("Failed to fetch products: %s", str(e))
            raise DatabaseException(detail="Failed to retrieve products")

    async def get_product_by_slug(self, slug: str) -> dict:
        logger.info("Fetching product with slug: %s", slug)
        try:
            product = await self.collection.find_one({"slug": slug})
        except Exception as e:
            logger.error("Database error fetching product slug=%s: %s", slug, str(e))
            raise DatabaseException(detail="Failed to retrieve product")

        if product is None:
            logger.warning("Product not found: slug=%s", slug)
            raise NotFoundException(detail=f"Product with slug '{slug}' not found")

        product["_id"] = str(product["_id"])
        logger.info("Found product: %s", product["title"])
        return product
