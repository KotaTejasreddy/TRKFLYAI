import logging
from datetime import datetime
from fastapi import APIRouter, Depends
from app.database import get_collection
from app.exceptions import AppException
from app.models.user import (
    SignupRequest, LoginRequest, AuthResponse, UserOut,
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

    doc = {
        "email": request.email.lower(),
        "handle": request.handle or request.email.split("@")[0],
        "password_hash": hash_password(request.password),
        "xp": 0,
        "streak_days": 0,
        "last_active_date": None,
        "completed": {},
        "created_at": datetime.utcnow().isoformat(),
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
