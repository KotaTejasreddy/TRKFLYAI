from app.routes.products import router as products_router
from app.routes.contact import router as contact_router
from app.routes.careers import router as careers_router
from app.routes.learn import router as learn_router
from app.routes.roadmap import router as roadmap_router
from app.routes.auth import router as auth_router
from app.routes.compiler import router as compiler_router
from app.routes.recommend import router as recommend_router
from app.routes.ds import router as ds_router
from app.routes.bi import router as bi_router
from app.routes.payments import router as payments_router

__all__ = [
    "products_router", "contact_router", "careers_router",
    "learn_router", "roadmap_router",
    "auth_router", "compiler_router", "recommend_router",
    "ds_router", "bi_router", "payments_router",
]
