from pydantic import BaseModel


class RoadmapTopic(BaseModel):
    id: str
    title: str
    description: str


class RoadmapSection(BaseModel):
    id: str
    title: str
    description: str
    icon: str  # emoji
    topics: list[RoadmapTopic]


class RoadmapResponse(BaseModel):
    success: bool = True
    language: str
    title: str
    description: str
    sections: list[RoadmapSection]
    total_topics: int
