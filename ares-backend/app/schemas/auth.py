"""Authentication schemas."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "PUBLIC_USER"


class UserResponse(BaseModel):
    id: Any
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
