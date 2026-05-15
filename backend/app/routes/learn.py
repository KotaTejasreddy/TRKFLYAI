import logging
from fastapi import APIRouter
from app.models.learn import (
    LearnRequest,
    LearnResponse,
    StructuredLearnResponse,
    DoubtRequest,
    DoubtResponse,
    SimplifyRequest,
    SimplifyResponse,
    GuideRequest,
    GuideResponse,
    CheatSheetRequest,
    CheatSheetResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
    InterviewGradeRequest,
    InterviewGradeResponse,
    InterviewGradeItem,
    TOPICS,
    MODES,
)
from app.services.learn_service import (
    generate_lesson,
    solve_doubt,
    simplify_content,
    suggest_next,
    generate_cheatsheet,
    generate_interview_questions,
    grade_interview_answers,
)
from app.exceptions import ValidationException

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/learn", tags=["Learn"])


@router.post("/", response_model=StructuredLearnResponse)
async def learn(request: LearnRequest):
    """Generate an AI-powered lesson based on topic, language, and mode."""
    if request.topic not in TOPICS:
        raise ValidationException(
            detail=f"Invalid topic. Choose from: {', '.join(TOPICS)}"
        )

    if request.mode not in MODES:
        raise ValidationException(
            detail=f"Invalid mode. Choose from: {', '.join(MODES)}"
        )

    data = await generate_lesson(
        topic=request.topic,
        language=request.language,
        mode=request.mode,
        subtopic=request.subtopic,
    )

    def _as_str(v):
        if isinstance(v, list):
            return "\n\n".join(str(x) for x in v)
        if v is None:
            return ""
        return str(v)

    def _as_list(v):
        if isinstance(v, list):
            return [str(x) for x in v]
        if v in (None, ""):
            return []
        return [str(v)]

    # Coerce quiz items into our schema, dropping malformed entries.
    raw_quiz = data.get("quiz", [])
    quiz_items = []
    if isinstance(raw_quiz, list):
        for q in raw_quiz:
            if not isinstance(q, dict): continue
            opts = q.get("options")
            if not isinstance(opts, list) or len(opts) < 2: continue
            try:
                correct = int(q.get("correct_index", 0))
            except (TypeError, ValueError):
                correct = 0
            correct = max(0, min(correct, len(opts) - 1))
            quiz_items.append({
                "question": str(q.get("question") or ""),
                "options": [str(o) for o in opts],
                "correct_index": correct,
                "explanation": str(q.get("explanation") or ""),
            })

    return StructuredLearnResponse(
        topic=request.topic,
        language=request.language,
        mode=request.mode,
        subtopic=request.subtopic,
        definition=_as_str(data.get("definition")),
        analogy=_as_str(data.get("analogy")),
        code_example=_as_str(data.get("code_example")),
        explanation=_as_str(data.get("explanation")),
        next_topics=_as_list(data.get("next_topics")),
        motivation=_as_str(data.get("motivation")),
        quiz=quiz_items,
    )


@router.post("/doubt", response_model=DoubtResponse)
async def doubt(request: DoubtRequest):
    """Solve a student's doubt or question."""
    data = await solve_doubt(
        question=request.question,
        context_topic=request.context_topic,
        language=request.language,
    )

    return DoubtResponse(
        answer=data.get("answer", ""),
        follow_up_suggestions=data.get("follow_up_suggestions", []),
    )


@router.post("/simplify", response_model=SimplifyResponse)
async def simplify(request: SimplifyRequest):
    """Simplify content to make it easier to understand."""
    data = await simplify_content(
        content=request.content,
        topic=request.topic,
        language=request.language,
    )

    return SimplifyResponse(
        simplified=data.get("simplified", ""),
        analogy=data.get("analogy", ""),
    )


@router.post("/guide", response_model=GuideResponse)
async def guide(request: GuideRequest):
    """Suggest the next topic for the student to learn."""
    data = await suggest_next(
        current_topic=request.current_topic,
        completed_topics=request.completed_topics,
        language=request.language,
    )

    return GuideResponse(
        next_topic=data.get("next_topic", ""),
        reason=data.get("reason", ""),
        motivation=data.get("motivation", ""),
        progress_message=data.get("progress_message", ""),
    )


@router.post("/cheatsheet", response_model=CheatSheetResponse)
async def cheatsheet(request: CheatSheetRequest):
    """Generate a 5-7 bullet cheat-sheet for the topic, plus a one-liner summary."""
    data = await generate_cheatsheet(
        topic=request.topic,
        subtopic=request.subtopic,
        language=request.language,
    )
    bullets_raw = data.get("bullets", [])
    if isinstance(bullets_raw, str):
        bullets_raw = [bullets_raw]
    return CheatSheetResponse(
        bullets=[str(b) for b in (bullets_raw or [])][:7],
        one_liner=str(data.get("one_liner") or ""),
    )


@router.post("/interview/questions", response_model=InterviewQuestionsResponse)
async def interview_questions(request: InterviewQuestionsRequest):
    """Generate 5 mock interview questions about the topic."""
    data = await generate_interview_questions(
        topic=request.topic,
        subtopic=request.subtopic,
        language=request.language,
        difficulty=request.difficulty,
    )
    qs = data.get("questions") or []
    if isinstance(qs, str): qs = [qs]
    return InterviewQuestionsResponse(questions=[str(q) for q in qs][:5])


@router.post("/interview/grade", response_model=InterviewGradeResponse)
async def interview_grade(request: InterviewGradeRequest):
    """Grade a full set of interview answers with per-question feedback."""
    data = await grade_interview_answers(
        topic=request.topic,
        subtopic=request.subtopic,
        language=request.language,
        answers=[a.model_dump() for a in request.answers],
    )

    per_q_raw = data.get("per_question") or []
    items: list[InterviewGradeItem] = []
    for it in per_q_raw[:len(request.answers)]:
        if not isinstance(it, dict): continue
        try: score = max(0, min(10, int(it.get("score", 0))))
        except (TypeError, ValueError): score = 0
        items.append(InterviewGradeItem(
            score=score,
            strengths=str(it.get("strengths") or ""),
            improvements=str(it.get("improvements") or ""),
            ideal_answer=str(it.get("ideal_answer") or ""),
        ))

    try: overall = max(0, min(10, int(data.get("overall_score", 0))))
    except (TypeError, ValueError): overall = 0

    return InterviewGradeResponse(
        overall_score=overall,
        overall_feedback=str(data.get("overall_feedback") or ""),
        per_question=items,
    )


@router.get("/topics")
async def get_topics():
    """Return the list of available topics."""
    return {"success": True, "topics": TOPICS}


@router.get("/modes")
async def get_modes():
    """Return the list of available modes."""
    return {"success": True, "modes": MODES}
