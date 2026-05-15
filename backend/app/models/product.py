from datetime import datetime
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    title: str
    slug: str
    tagline: str
    description: str
    problem: str
    solution: str
    tech_stack: list[str]
    features: list[str]
    github_link: str | None = None
    demo_link: str | None = None
    case_study: str
    category: str
    status: str = "Live"
    metrics: dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProductResponse(ProductBase):
    id: str = Field(alias="_id")

    model_config = {"populate_by_name": True}


class ProductListResponse(BaseModel):
    success: bool = True
    data: list[ProductResponse]
    count: int
