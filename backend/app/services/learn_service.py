import json
import logging
import google.generativeai as genai
from app.config import settings
from app.exceptions import AppException

logger = logging.getLogger(__name__)


def _build_structured_system_prompt(mode: str) -> str:
    """Build the system instruction for structured JSON responses."""
    base = (
        "You are a world-class teacher on the TRKFLY AI learning platform. "
        "You MUST respond with ONLY valid JSON (no markdown, no code fences). "
        "The JSON must have these exact keys:\n"
        '{"definition": "...", "analogy": "...", "code_example": "...", '
        '"explanation": "...", "next_topics": ["topic1", "topic2", "topic3"], '
        '"motivation": "...", '
        '"quiz": [{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "explanation": "..."}]}\n\n'
        "CRITICAL LANGUAGE RULES:\n"
        "- The values of 'definition', 'analogy', 'explanation', 'motivation', and the quiz fields ('question', 'options', 'explanation') MUST be written entirely in the requested response language.\n"
        "- For 'code_example': keep ALL CODE (keywords, identifiers, function names, "
        "variable names, string literals, syntax) in the original programming language exactly as a developer would write it (English/source code).\n"
        "- Inside the code, ONLY the COMMENTS (lines starting with #, //, or inside /* */) must be translated to the requested response language.\n"
        "- 'next_topics' must stay in English so navigation slugs match.\n\n"
        "QUIZ RULES:\n"
        "- 'quiz' must contain EXACTLY 3 multiple-choice questions about this topic.\n"
        "- Each question has exactly 4 options.\n"
        "- 'correct_index' is the 0-based index of the correct option (0, 1, 2, or 3).\n"
        "- 'explanation' is a short why-this-is-the-right-answer note.\n"
        "- Mix difficulty: 1 easy recall, 1 conceptual, 1 applied.\n\n"
    )

    if mode == "story":
        return base + (
            "STYLE: Explain like a master storyteller. Use everyday analogies "
            "(kitchen, school, playground). Write as if explaining to a curious child. "
            "The definition should use very simple words. The analogy should be a mini-story. "
            "The code_example should have comments explaining each line simply. "
            "The explanation should connect the story to the concept step by step. "
            "The motivation should be encouraging and fun."
        )
    elif mode == "easy":
        return base + (
            "STYLE: Explain so a 10-year-old understands. Use the simplest words possible. "
            "The definition must be ONE simple sentence. The analogy must use something "
            "every child knows (toys, games, school, food). The code_example should be "
            "minimal with friendly comments. The explanation should be 3-4 bullet points max. "
            "The motivation should make the learner feel smart and excited."
        )
    elif mode == "interview":
        return base + (
            "STYLE: Senior tech interviewer perspective. The definition should be interview-ready. "
            "The analogy should help candidates remember the concept. The code_example should be "
            "a common interview question with solution. The explanation should cover what "
            "interviewers look for. The motivation should boost interview confidence."
        )
    else:  # technical
        return base + (
            "STYLE: Senior engineer writing documentation. The definition should be precise. "
            "The analogy should relate to system design. The code_example should show best practices. "
            "The explanation should cover how it works under the hood with trade-offs. "
            "The motivation should connect to real-world engineering impact."
        )


def _build_user_prompt(topic: str, language: str, mode: str, subtopic: str | None) -> str:
    """Build the user prompt for the AI model."""
    subject = f"{topic} — {subtopic}" if subtopic else topic

    if mode == "story":
        return (
            f"Explain '{subject}' in {language} language using a story and "
            f"real-life analogies. Make it so simple that even a child can "
            f"understand. Respond entirely in {language}. Return ONLY valid JSON."
        )
    elif mode == "easy":
        return (
            f"Explain '{subject}' in {language} language in the simplest way possible. "
            f"Use words a 10-year-old would understand. "
            f"Respond entirely in {language}. Return ONLY valid JSON."
        )
    elif mode == "interview":
        return (
            f"Create an interview preparation guide for '{subject}' in "
            f"{language} language. Include questions, answers, and tips. "
            f"Respond entirely in {language}. Return ONLY valid JSON."
        )
    else:
        return (
            f"Give a technical deep-dive explanation of '{subject}' in "
            f"{language} language with code examples where relevant. "
            f"Respond entirely in {language}. Return ONLY valid JSON."
        )


def _configure_genai():
    """Configure the Gemini API client."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise AppException(
            status_code=503,
            detail="AI service is not configured. Set GEMINI_API_KEY in environment.",
        )
    genai.configure(api_key=api_key)


def _parse_json_response(text: str) -> dict:
    """Parse a JSON response from Gemini, stripping markdown fences if present."""
    text = text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    return json.loads(text)


async def generate_lesson(
    topic: str,
    language: str,
    mode: str,
    subtopic: str | None = None,
) -> dict:
    """Generate an AI-powered lesson using Google Gemini, returning structured data."""
    _configure_genai()

    system_prompt = _build_structured_system_prompt(mode)
    user_prompt = _build_user_prompt(topic, language, mode, subtopic)

    logger.info(
        "Generating lesson: topic=%s, language=%s, mode=%s, subtopic=%s",
        topic, language, mode, subtopic,
    )

    try:
        model_name = settings.GEMINI_MODEL
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt,
        )
        response = await model.generate_content_async(user_prompt)
        text = response.text

        try:
            data = _parse_json_response(text)
        except json.JSONDecodeError:
            # Fallback: return the raw text in a structured format
            logger.warning("Failed to parse Gemini JSON response, using fallback")
            data = {
                "definition": text[:200],
                "analogy": "",
                "code_example": "",
                "explanation": text,
                "next_topics": [],
                "motivation": "Keep learning! You're doing great!",
            }

        logger.info("Lesson generated successfully")
        return data

    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise AppException(
            status_code=502,
            detail=f"AI generation failed: {str(exc)}",
        ) from exc


async def solve_doubt(question: str, context_topic: str, language: str) -> dict:
    """Solve a student's doubt using Gemini."""
    _configure_genai()

    system = (
        "You are a friendly AI doubt solver on TRKFLY AI. "
        "Answer the student's question simply and clearly. "
        "Respond with ONLY valid JSON (no markdown, no code fences): "
        '{"answer": "...", "follow_up_suggestions": ["q1", "q2", "q3"]}'
    )
    user = f"Topic: {context_topic}\nQuestion: {question}\nRespond in {language}."

    logger.info("Solving doubt: topic=%s, question=%s", context_topic, question[:80])

    try:
        model_name = settings.GEMINI_MODEL
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system,
        )
        response = await model.generate_content_async(user)

        try:
            data = _parse_json_response(response.text)
        except json.JSONDecodeError:
            logger.warning("Failed to parse doubt JSON response, using fallback")
            data = {
                "answer": response.text.strip(),
                "follow_up_suggestions": [],
            }

        return data

    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini API error (doubt): %s", exc)
        raise AppException(
            status_code=502,
            detail=f"AI doubt solving failed: {str(exc)}",
        ) from exc


async def simplify_content(content: str, topic: str, language: str) -> dict:
    """Simplify content to make it easier to understand."""
    _configure_genai()

    system = (
        "You are the Simplifier Agent on TRKFLY AI. "
        "Take the given explanation and make it EVEN SIMPLER. "
        "Use words a 5-year-old would understand. "
        "Respond with ONLY valid JSON (no markdown, no code fences): "
        '{"simplified": "...", "analogy": "..."}'
    )
    user = f"Topic: {topic}\nContent to simplify:\n{content}\nRespond in {language}."

    logger.info("Simplifying content for topic=%s", topic)

    try:
        model_name = settings.GEMINI_MODEL
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system,
        )
        response = await model.generate_content_async(user)

        try:
            data = _parse_json_response(response.text)
        except json.JSONDecodeError:
            logger.warning("Failed to parse simplify JSON response, using fallback")
            data = {
                "simplified": response.text.strip(),
                "analogy": "",
            }

        return data

    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini API error (simplify): %s", exc)
        raise AppException(
            status_code=502,
            detail=f"AI simplification failed: {str(exc)}",
        ) from exc


async def suggest_next(current_topic: str, completed_topics: list, language: str) -> dict:
    """Suggest the next topic for the student to learn."""
    _configure_genai()

    system = (
        "You are the Guide Agent on TRKFLY AI. "
        "Based on what the student just learned, suggest the best next topic. "
        "Respond with ONLY valid JSON (no markdown, no code fences): "
        '{"next_topic": "...", "reason": "...", "motivation": "...", "progress_message": "..."}'
    )
    completed_str = ", ".join(completed_topics) if completed_topics else "None yet"
    user = (
        f"Current topic: {current_topic}\n"
        f"Completed topics: {completed_str}\n"
        f"Respond in {language}."
    )

    logger.info("Suggesting next topic after=%s", current_topic)

    try:
        model_name = settings.GEMINI_MODEL
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system,
        )
        response = await model.generate_content_async(user)

        try:
            data = _parse_json_response(response.text)
        except json.JSONDecodeError:
            logger.warning("Failed to parse guide JSON response, using fallback")
            data = {
                "next_topic": "",
                "reason": response.text.strip(),
                "motivation": "Keep going!",
                "progress_message": "You're making progress!",
            }

        return data

    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini API error (guide): %s", exc)
        raise AppException(
            status_code=502,
            detail=f"AI guide suggestion failed: {str(exc)}",
        ) from exc


async def debug_code(code: str, error: str, language: str, response_language: str) -> dict:
    """Debugging Agent — explains errors and suggests fixes."""
    _configure_genai()

    system = (
        "You are a Senior Engineer Debugging Agent on TRKFLY AI. "
        "Given some code and the error/traceback it produced, explain the bug, "
        "the root cause, and how to fix it. "
        "Respond with ONLY valid JSON (no markdown fences):\n"
        '{"explanation": "...", "likely_cause": "...", "suggested_fix": "...", "fixed_code": "..."}\n'
        "Rules:\n"
        "- 'explanation' is 1-2 sentences plain language.\n"
        "- 'likely_cause' is the root cause in 1 sentence.\n"
        "- 'suggested_fix' is a concrete action: what to change.\n"
        "- 'fixed_code' is the FULL corrected code, runnable.\n"
        f"- Write 'explanation', 'likely_cause', 'suggested_fix' in {response_language}.\n"
        "- Code itself stays in source/English; only comments inside fixed_code translate."
    )
    user = f"Language: {language}\n\nCODE:\n```\n{code}\n```\n\nERROR:\n{error}\n\nReturn ONLY valid JSON."

    logger.info("Debugging code: language=%s, error_preview=%s", language, error[:80])
    try:
        model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL, system_instruction=system)
        response = await model.generate_content_async(user)
        try:
            return _parse_json_response(response.text)
        except json.JSONDecodeError:
            return {
                "explanation": response.text.strip()[:300],
                "likely_cause": "", "suggested_fix": "", "fixed_code": "",
            }
    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini debug error: %s", exc)
        raise AppException(status_code=502, detail=f"AI debug failed: {exc}") from exc


async def generate_interview_questions(
    topic: str, subtopic: str | None, language: str, difficulty: str
) -> dict:
    """Generate 5 interview questions for the given topic."""
    _configure_genai()

    subject = f"{topic} — {subtopic}" if subtopic else topic
    system = (
        "You are a Senior Tech Interviewer on TRKFLY AI. "
        "Generate EXACTLY 5 interview questions about the given topic. "
        "Mix question types: 1 conceptual recall, 2 problem-solving, 1 system-design or trade-off, "
        "1 'edge case / when does this fail'. "
        "Respond with ONLY valid JSON (no markdown fences): "
        '{"questions": ["...", "...", "...", "...", "..."]}\n'
        "Each question must be one sentence, 12-25 words. "
        f"Difficulty target: {difficulty}. "
        "Write the questions in the requested response language. "
        "Code identifiers / function names inside questions stay in source/English."
    )
    user = f"Topic: {subject}\nResponse language: {language}.\nReturn ONLY valid JSON."

    logger.info("Generating interview Qs: topic=%s, subtopic=%s", topic, subtopic)
    try:
        model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL, system_instruction=system)
        response = await model.generate_content_async(user)
        try:
            return _parse_json_response(response.text)
        except json.JSONDecodeError:
            return {"questions": [response.text.strip()[:200]]}
    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini interview-Q error: %s", exc)
        raise AppException(status_code=502, detail=f"Interview question generation failed: {exc}") from exc


async def grade_interview_answers(
    topic: str, subtopic: str | None, language: str, answers: list[dict]
) -> dict:
    """Grade a batch of interview answers in one call."""
    _configure_genai()

    subject = f"{topic} — {subtopic}" if subtopic else topic
    qa_block = "\n\n".join(
        f"Q{i+1}: {a.get('question','')}\nA{i+1}: {a.get('answer','') or '(no answer given)'}"
        for i, a in enumerate(answers)
    )
    system = (
        "You are a Senior Tech Interviewer grading a candidate's answers. Be strict but fair.\n"
        "Respond with ONLY valid JSON (no markdown fences):\n"
        '{"overall_score": 0-10, "overall_feedback": "...", '
        '"per_question": [{"score": 0-10, "strengths": "...", "improvements": "...", "ideal_answer": "..."}]}\n'
        "Rules:\n"
        "- per_question must have ONE entry per Q in the SAME order.\n"
        "- 'score' is integer 0-10. 0 = no answer / completely wrong, 10 = textbook perfect.\n"
        "- 'strengths' notes what was correct (1 sentence).\n"
        "- 'improvements' is concrete (1-2 sentences).\n"
        "- 'ideal_answer' is what a senior would say (2-3 sentences).\n"
        "- 'overall_feedback' is 2-3 sentences summarising performance.\n"
        f"- Write all text in {language}. Code identifiers stay in source/English."
    )
    user = f"Topic: {subject}\n\n{qa_block}\n\nReturn ONLY valid JSON."

    logger.info("Grading %d interview answers for topic=%s", len(answers), topic)
    try:
        model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL, system_instruction=system)
        response = await model.generate_content_async(user)
        try:
            return _parse_json_response(response.text)
        except json.JSONDecodeError:
            return {"overall_score": 5, "overall_feedback": response.text.strip()[:500], "per_question": []}
    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini interview-grade error: %s", exc)
        raise AppException(status_code=502, detail=f"Interview grading failed: {exc}") from exc


async def generate_cheatsheet(topic: str, subtopic: str | None, language: str) -> dict:
    """Generate a quick 5-7 bullet revision sheet for a topic."""
    _configure_genai()

    subject = f"{topic} — {subtopic}" if subtopic else topic
    system = (
        "You are the Cheat-Sheet Generator on TRKFLY AI. "
        "Produce a CONCISE revision sheet someone could glance at minutes before a technical interview. "
        "Respond with ONLY valid JSON (no markdown fences): "
        '{"one_liner": "...", "bullets": ["...", "..."]}\n'
        "Rules:\n"
        "- 'bullets' must contain 5 to 7 short bullets, each one full sentence.\n"
        "- Mix definition, key formula/complexity, common pitfall, real-world use, and a memorable mnemonic.\n"
        "- 'one_liner' is a single tweet-sized summary of the concept.\n"
        "- Write all values in the requested response language. "
        "  Code identifiers / formula symbols inside bullets stay in source/English."
    )
    user = f"Topic: {subject}\nResponse language: {language}.\nReturn ONLY valid JSON."

    logger.info("Generating cheatsheet: topic=%s, subtopic=%s, lang=%s", topic, subtopic, language)

    try:
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=system,
        )
        response = await model.generate_content_async(user)
        try:
            data = _parse_json_response(response.text)
        except json.JSONDecodeError:
            logger.warning("Failed to parse cheatsheet JSON, using fallback")
            data = {"one_liner": "", "bullets": [response.text.strip()[:200]]}
        return data
    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini API error (cheatsheet): %s", exc)
        raise AppException(
            status_code=502,
            detail=f"AI cheatsheet generation failed: {str(exc)}",
        ) from exc
