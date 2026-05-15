import logging
from fastapi import APIRouter
from app.models.compiler import RunRequest, RunResponse, DebugRequest, DebugResponse
from app.services.compiler_service import execute, available_languages
from app.services.learn_service import debug_code

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/compiler", tags=["Compiler"])


@router.post("/run", response_model=RunResponse)
async def run(request: RunRequest):
    """Execute user code in a subprocess with a hard time/output limit."""
    result = await execute(
        language=request.language,
        code=request.code,
        stdin=request.stdin,
        timeout=request.timeout,
    )
    logger.info(
        "Compiler run: lang=%s ok=%s rc=%s ms=%s timed_out=%s",
        request.language, result.ok, result.exit_code, result.runtime_ms, result.timed_out,
    )
    return RunResponse(
        ok=result.ok,
        stdout=result.stdout,
        stderr=result.stderr,
        exit_code=result.exit_code,
        runtime_ms=result.runtime_ms,
        timed_out=result.timed_out,
        compile_error=result.compile_error,
    )


@router.get("/languages")
async def list_languages():
    """List supported languages and whether each compiler is installed locally."""
    return {"success": True, "languages": available_languages()}


@router.post("/debug", response_model=DebugResponse)
async def debug(request: DebugRequest):
    """AI-powered error explanation. Takes code + error → returns root cause + fix."""
    data = await debug_code(
        code=request.code,
        error=request.error,
        language=request.language,
        response_language=request.response_language,
    )
    return DebugResponse(
        explanation=str(data.get("explanation") or ""),
        likely_cause=str(data.get("likely_cause") or ""),
        suggested_fix=str(data.get("suggested_fix") or ""),
        fixed_code=str(data.get("fixed_code") or ""),
    )
