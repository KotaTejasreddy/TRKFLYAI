from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.models.product import ProductListResponse, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


def _get_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> ProductService:
    return ProductService(db)


@router.get("", response_model=ProductListResponse)
async def list_products(service: ProductService = Depends(_get_service)):
    products = await service.get_all_products()
    return ProductListResponse(data=products, count=len(products))


@router.get("/{slug}", response_model=dict)
async def get_product(slug: str, service: ProductService = Depends(_get_service)):
    product = await service.get_product_by_slug(slug)
    return {"success": True, "data": product}
