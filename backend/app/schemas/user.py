from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
