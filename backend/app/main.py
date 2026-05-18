from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_db, disconnect_db
from app.exceptions import AppException, app_exception_handler, generic_exception_handler
from app.logging_config import setup_logging
from app.middleware.rate_limit import rate_limit_middleware
from app.routes import (
    products_router, contact_router, careers_router,
    learn_router, roadmap_router,
    auth_router, compiler_router, recommend_router,
    ds_router, bi_router,
)

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="TRKFLY AI API",
    version="1.0.0",
    description="Backend API for the TRKFLY AI company portfolio platform",
    lifespan=lifespan,
)

# CORS — driven by env var CORS_ORIGINS (comma-separated or JSON list).
# In production, set CORS_ORIGINS to your Vercel + custom-domain URLs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting (per-IP token bucket)
app.middleware("http")(rate_limit_middleware)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Routers
app.include_router(products_router)
app.include_router(contact_router)
app.include_router(careers_router)
app.include_router(learn_router)
app.include_router(roadmap_router)
app.include_router(auth_router)
app.include_router(compiler_router)
app.include_router(recommend_router)
app.include_router(ds_router)
app.include_router(bi_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "TRKFLY AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "TRKFLY-ai-api"}
