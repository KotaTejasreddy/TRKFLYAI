from pydantic import BaseModel, Field
from typing import Optional


class RunRequest(BaseModel):
    language: str = Field(..., description="python | javascript | java | cpp | go")
    code: str = Field(..., max_length=20_000)
    stdin: Optional[str] = Field(default=None, max_length=10_000)
    timeout: int = Field(default=5, ge=1, le=10)


class RunResponse(BaseModel):
    success: bool = True
    ok: bool
    stdout: str
    stderr: str
    exit_code: int
    runtime_ms: int
    timed_out: bool = False
    compile_error: Optional[str] = None


class DebugRequest(BaseModel):
    code: str = Field(..., max_length=20_000)
    error: str = Field(..., max_length=5_000)
    language: str = Field(default="python")
    response_language: str = Field(default="English")


class DebugResponse(BaseModel):
    success: bool = True
    explanation: str
    likely_cause: str
    suggested_fix: str
    fixed_code: str = ""
