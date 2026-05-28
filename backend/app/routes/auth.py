import logging
from datetime import datetime
import httpx
from fastapi import APIRouter, Depends
from app.config import settings
from app.database import get_collection
from app.exceptions import AppException
from app.models.user import (
    SignupRequest, LoginRequest, GoogleAuthRequest, AuthResponse, UserOut,
    ProgressSyncRequest, ProgressSyncResponse,
)
from app.services.auth_service import (
    hash_password, verify_password, issue_token, get_current_user,
)
from bson import ObjectId

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


def _user_to_out(u: dict) -> UserOut:
    return UserOut(
        id=str(u["_id"]),
        email=u["email"],
        handle=u.get("handle"),
        xp=u.get("xp", 0),
        streak_days=u.get("streak_days", 0),
        last_active_date=u.get("last_active_date"),
        created_at=u.get("created_at"),
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    users = get_collection("users")
    existing = await users.find_one({"email": request.email.lower()})
    if existing:
        raise AppException(status_code=409, detail="Account already exists for this email")

    now_iso = datetime.utcnow().isoformat()
    doc = {
        "email": request.email.lower(),
        "handle": request.handle or request.email.split("@")[0],
        "password_hash": hash_password(request.password),
        "xp": 0,
        "streak_days": 0,
        "last_active_date": None,
        "completed": {},
        "created_at": now_iso,
        # Auto-start 3-day free trial
        "plan": "trial",
        "trial_started_at": now_iso,
        "subscription_started_at": None,
        "subscription_expires_at": None,
        "payment_history": [],
    }
    result = await users.insert_one(doc)
    doc["_id"] = result.inserted_id
    token = issue_token(str(doc["_id"]), doc["email"])
    logger.info("New signup: %s", doc["email"])
    return AuthResponse(token=token, user=_user_to_out(doc))


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    users = get_collection("users")
    u = await users.find_one({"email": request.email.lower()})
    if not u or not verify_password(request.password, u.get("password_hash", "")):
        raise AppException(status_code=401, detail="Invalid email or password")
    token = issue_token(str(u["_id"]), u["email"])
    logger.info("Login: %s", u["email"])
    return AuthResponse(token=token, user=_user_to_out(u))


@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """
    Sign in or sign up with Google.
    Receives the id_token from Google Identity Services on the frontend,
    verifies it against Google's tokeninfo endpoint, then creates/logs in the user.
    """
    if not request.id_token:
        raise AppException(status_code=400, detail="Missing Google id_token")

    # Verify the token with Google
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": request.id_token},
            )
        if r.status_code != 200:
            raise AppException(status_code=401, detail="Invalid Google token")
        claims = r.json()
    except AppException:
        raise
    except Exception as exc:
        logger.error("Google token verification failed: %s", exc)
        raise AppException(status_code=502, detail="Could not verify Google token") from exc

    # Validate audience matches our configured client ID (when set)
    expected_aud = settings.GOOGLE_CLIENT_ID
    if expected_aud and claims.get("aud") != expected_aud:
        raise AppException(status_code=401, detail="Google token audience mismatch")

    email = (claims.get("email") or "").lower()
    email_verified = claims.get("email_verified") in (True, "true")
    if not email or not email_verified:
        raise AppException(status_code=401, detail="Google account email is not verified")

    handle = claims.get("name") or email.split("@")[0]
    picture = claims.get("picture")

    # Look up existing user or create a new one
    users = get_collection("users")
    u = await users.find_one({"email": email})
    if not u:
        now_iso = datetime.utcnow().isoformat()
        doc = {
            "email": email,
            "handle": handle,
            "password_hash": "",                  # Google-only account, no password
            "auth_provider": "google",
            "google_picture": picture,
            "xp": 0,
            "streak_days": 0,
            "last_active_date": None,
            "completed": {},
            "created_at": now_iso,
            "plan": "trial",
            "trial_started_at": now_iso,
            "subscription_started_at": None,
            "subscription_expires_at": None,
            "payment_history": [],
        }
        result = await users.insert_one(doc)
        doc["_id"] = result.inserted_id
        u = doc
        logger.info("Created Google-auth account: %s", email)
    else:
        # Refresh handle/picture on every login
        await users.update_one(
            {"_id": u["_id"]},
            {"$set": {"handle": u.get("handle") or handle, "google_picture": picture, "auth_provider": u.get("auth_provider") or "google"}},
        )
        logger.info("Google login: %s", email)

    token = issue_token(str(u["_id"]), u["email"])
    return AuthResponse(token=token, user=_user_to_out(u))


@router.get("/me", response_model=UserOut)
async def me(current: dict = Depends(get_current_user)):
    users = get_collection("users")
    u = await users.find_one({"_id": ObjectId(current["sub"])})
    if not u:
        raise AppException(status_code=404, detail="User not found")
    return _user_to_out(u)


@router.post("/progress/sync", response_model=ProgressSyncResponse)
async def sync_progress(request: ProgressSyncRequest, current: dict = Depends(get_current_user)):
    """Push local XP / streak / completed topics up to the server."""
    users = get_collection("users")
    update = {
        "xp": int(request.xp),
        "streak_days": int(request.streak_days),
        "last_active_date": request.last_active_date,
        "completed": request.completed or {},
    }
    await users.update_one({"_id": ObjectId(current["sub"])}, {"$set": update})
    u = await users.find_one({"_id": ObjectId(current["sub"])})
    return ProgressSyncResponse(user=_user_to_out(u))


@router.get("/leaderboard")
async def leaderboard(limit: int = 20):
    """Top users by XP (no auth required — public)."""
    users = get_collection("users")
    cursor = users.find(
        {"xp": {"$gt": 0}},
        {"email": 1, "handle": 1, "xp": 1, "streak_days": 1}
    ).sort("xp", -1).limit(min(limit, 100))
    rows = []
    async for u in cursor:
        rows.append({
            "handle": u.get("handle") or u["email"].split("@")[0],
            "xp": u.get("xp", 0),
            "streak_days": u.get("streak_days", 0),
        })
    return {"success": True, "leaderboard": rows}
