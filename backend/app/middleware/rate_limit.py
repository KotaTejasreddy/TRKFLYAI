"""
In-memory token-bucket rate limiter.
- Two buckets per IP: general API and AI endpoints.
- AI endpoints (anything containing 'gemini'-ish work) are capped tighter
  to protect the model quota.
"""
import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from app.config import settings


class TokenBucket:
    __slots__ = ("capacity", "tokens", "fill_rate_per_sec", "last")

    def __init__(self, capacity: int, fill_rate_per_sec: float):
        self.capacity = capacity
        self.tokens = float(capacity)
        self.fill_rate_per_sec = fill_rate_per_sec
        self.last = time.monotonic()

    def take(self) -> bool:
        now = time.monotonic()
        elapsed = now - self.last
        self.last = now
        self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate_per_sec)
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


_general: dict[str, TokenBucket] = defaultdict(
    lambda: TokenBucket(settings.RATE_LIMIT_PER_MIN, settings.RATE_LIMIT_PER_MIN / 60.0)
)
_ai: dict[str, TokenBucket] = defaultdict(
    lambda: TokenBucket(settings.RATE_LIMIT_AI_PER_MIN, settings.RATE_LIMIT_AI_PER_MIN / 60.0)
)


# Endpoints that hit Gemini → tighter cap
AI_PATH_HINTS = ("/learn/", "/cheatsheet", "/interview/", "/compiler/debug", "/doubt", "/simplify", "/guide")


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def rate_limit_middleware(request: Request, call_next):
    # Skip preflight + health
    if request.method == "OPTIONS" or request.url.path in ("/", "/health", "/docs", "/openapi.json"):
        return await call_next(request)

    ip = _client_ip(request)
    bucket = _ai[ip] if any(h in request.url.path for h in AI_PATH_HINTS) else _general[ip]

    if not bucket.take():
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "error": "Rate limit exceeded. Slow down a moment and try again.",
                "status_code": 429,
            },
        )
    return await call_next(request)
