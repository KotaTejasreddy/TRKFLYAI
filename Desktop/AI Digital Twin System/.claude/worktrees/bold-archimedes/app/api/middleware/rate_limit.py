"""Simple in-memory rate limiter."""

from __future__ import annotations

import time

from fastapi import HTTPException, Request, status

from app.config import get_settings


async def rate_limit_middleware(request: Request) -> None:
    settings = get_settings()
    client_ip = request.client.host if request.client else "unknown"
    state = request.app.state
    if not hasattr(state, "_rate_limits"):
        state._rate_limits = {}
    now = time.time()
    key = f"rate:{client_ip}"
    bucket = state._rate_limits.get(key, [])
    bucket = [t for t in bucket if now - t < 60.0]
    if len(bucket) >= settings.rate_limit_per_minute:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded.")
    bucket.append(now)
    state._rate_limits[key] = bucket
