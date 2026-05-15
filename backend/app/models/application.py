from pydantic import BaseModel, EmailStr, Field


class ApplicationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    role: str
    resume_link: str
    cover_note: str | None = None


class ApplicationResponse(BaseModel):
    success: bool = True
    message: str = "Application submitted successfully. Our team will review it shortly."
