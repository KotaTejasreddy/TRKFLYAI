from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    handle: Optional[str] = Field(default=None, max_length=40)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="JWT id_token returned by Google Identity Services")


class AuthResponse(BaseModel):
    success: bool = True
    token: str
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    handle: Optional[str] = None
    xp: int = 0
    streak_days: int = 0
    last_active_date: Optional[str] = None
    created_at: Optional[str] = None


class ProgressSyncRequest(BaseModel):
    """Push local progress + XP up to the backend (replaces server state)."""
    xp: int = 0
    streak_days: int = 0
    last_active_date: Optional[str] = None
    completed: dict = Field(default_factory=dict)  # { roadmap_slug: [topic_id, ...] }


class ProgressSyncResponse(BaseModel):
    success: bool = True
    user: UserOut


AuthResponse.model_rebuild()
