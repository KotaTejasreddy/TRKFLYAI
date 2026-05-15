"""
Stdlib-only auth: PBKDF2-SHA256 passwords + HS256 JWT-style tokens.
No new dependencies.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Optional

from app.config import settings
from app.exceptions import AppException


# ───────────────────── Password hashing ─────────────────────

PBKDF2_ROUNDS = 200_000
SALT_BYTES = 16


def hash_password(plain: str) -> str:
    """Return 'salt$hash' encoded for storage."""
    salt = secrets.token_bytes(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return f"{base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(plain: str, stored: str) -> bool:
    try:
        salt_b64, digest_b64 = stored.split("$", 1)
        salt = base64.urlsafe_b64decode(salt_b64)
        expected = base64.urlsafe_b64decode(digest_b64)
        actual = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, PBKDF2_ROUNDS)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


# ───────────────────── JWT-style tokens ─────────────────────

def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _b64d(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


_CACHED_DEV_SECRET: Optional[str] = None


def _secret() -> bytes:
    global _CACHED_DEV_SECRET
    s = settings.JWT_SECRET or os.environ.get("JWT_SECRET", "")
    if not s or len(s) < 16:
        # Auto-generate a STABLE per-process secret if none provided.
        # Tokens invalidate on restart — fine for dev. Set JWT_SECRET in .env for stability.
        if _CACHED_DEV_SECRET is None:
            _CACHED_DEV_SECRET = "dev-secret-do-not-use-in-prod-" + secrets.token_hex(16)
        s = _CACHED_DEV_SECRET
    return s.encode("utf-8")


def issue_token(user_id: str, email: str, ttl_sec: int = 60 * 60 * 24 * 7) -> str:
    """Issue a signed token. ttl default = 7 days."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + ttl_sec,
    }
    h = _b64(json.dumps(header, separators=(",", ":")).encode())
    p = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(_secret(), f"{h}.{p}".encode(), hashlib.sha256).digest()
    return f"{h}.{p}.{_b64(sig)}"


def decode_token(token: str) -> Optional[dict]:
    """Verify signature + expiry; return payload dict or None."""
    try:
        h, p, s = token.split(".")
        expected = _b64(hmac.new(_secret(), f"{h}.{p}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(s, expected):
            return None
        payload = json.loads(_b64d(p))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


# ───────────────────── Auth dependencies ─────────────────────

from fastapi import Depends, Header
from typing import Annotated


async def get_current_user_optional(
    authorization: Annotated[str | None, Header()] = None,
) -> Optional[dict]:
    """Returns the user payload if a valid Bearer token is present, else None.
    Use for endpoints that work for both guests and signed-in users."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    return decode_token(token)


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    """Strict: raise 401 if no valid token."""
    user = await get_current_user_optional(authorization)
    if not user:
        raise AppException(status_code=401, detail="Authentication required")
    return user
