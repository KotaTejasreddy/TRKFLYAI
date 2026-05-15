"""
Recommendation Engine — given a user's progress, suggest the next 3 topics.
Pure rule-based for now (no LLM): cheap, fast, deterministic.
"""
import logging
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/recommend", tags=["Recommend"])


class RecommendRequest(BaseModel):
    roadmap: str                                              # current roadmap slug
    completed: list[str] = Field(default_factory=list)        # topic_ids done
    sections: list[dict] = Field(default_factory=list)        # mirror of roadmap.sections
    weak_topics: list[str] = Field(default_factory=list)      # optional: topics user struggled on


class Suggestion(BaseModel):
    topic_id: str
    topic_title: str
    section_id: str
    section_title: str
    reason: str
    priority: str  # "next" | "review" | "stretch"


class RecommendResponse(BaseModel):
    success: bool = True
    suggestions: list[Suggestion] = []


@router.post("/", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    """
    Strategy:
      1. If any 'weak_topics' present → recommend those for review (priority=review).
      2. Otherwise pick the next undone topic in order from each section.
      3. If all sections complete in current section, advance to first topic of next.
    Returns up to 3 suggestions, ordered by priority.
    """
    completed_set = set(request.completed)
    suggestions: list[Suggestion] = []

    # 1) Review weak topics first
    for sec in request.sections:
        if not isinstance(sec, dict): continue
        sec_id = sec.get("id", "")
        sec_title = sec.get("title", "")
        for t in sec.get("topics", []) or []:
            if not isinstance(t, dict): continue
            tid = t.get("id", "")
            if tid in request.weak_topics and len(suggestions) < 3:
                suggestions.append(Suggestion(
                    topic_id=tid,
                    topic_title=t.get("title", ""),
                    section_id=sec_id,
                    section_title=sec_title,
                    reason="Marked as weak — let's reinforce this concept.",
                    priority="review",
                ))

    # 2) Next undone in each section
    if len(suggestions) < 3:
        for sec in request.sections:
            if len(suggestions) >= 3: break
            if not isinstance(sec, dict): continue
            sec_id = sec.get("id", "")
            sec_title = sec.get("title", "")
            for t in sec.get("topics", []) or []:
                if not isinstance(t, dict): continue
                tid = t.get("id", "")
                if tid not in completed_set and not any(s.topic_id == tid for s in suggestions):
                    is_first_of_section = all(
                        ot.get("id") in completed_set for ot in sec.get("topics", [])[:sec.get("topics", []).index(t)]
                    ) if sec.get("topics") else False
                    suggestions.append(Suggestion(
                        topic_id=tid,
                        topic_title=t.get("title", ""),
                        section_id=sec_id,
                        section_title=sec_title,
                        reason="Next in your roadmap." if is_first_of_section
                               else f"Continue the {sec_title} section.",
                        priority="next",
                    ))
                    break  # one per section

    return RecommendResponse(suggestions=suggestions[:3])
