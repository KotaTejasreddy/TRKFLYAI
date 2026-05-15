import logging
from fastapi import APIRouter
from app.models.roadmap import RoadmapResponse
from app.services.roadmap_service import get_roadmap, get_available_languages

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/roadmap", tags=["Roadmap"])


@router.get("/", summary="List available roadmaps")
async def list_roadmaps():
    """Return all available language roadmaps."""
    languages = get_available_languages()
    return {"success": True, "languages": languages}


@router.get("/{language}", response_model=RoadmapResponse, summary="Get roadmap for a language")
async def roadmap(language: str):
    """Return the full structured roadmap for a programming language."""
    data = get_roadmap(language)
    return RoadmapResponse(**data)
