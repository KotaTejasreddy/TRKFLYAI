from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2000)


class ContactResponse(BaseModel):
    success: bool = True
    message: str = "Your message has been received. We'll get back to you within 24 hours."
