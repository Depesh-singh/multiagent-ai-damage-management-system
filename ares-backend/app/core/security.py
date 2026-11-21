"""JWT authentication, password hashing, and role-based access."""

from __future__ import annotations

import enum
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.utils import as_uuid

# ── Roles ──────────────────────────────────────────────────────
class Role(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    INCIDENT_COMMANDER = "INCIDENT_COMMANDER"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    DISPATCHER = "DISPATCHER"
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN"
    RESCUE_LEADER = "RESCUE_LEADER"
    GOVERNMENT_OFFICIAL = "GOVERNMENT_OFFICIAL"
    FIELD_RESPONDER = "FIELD_RESPONDER"
    PUBLIC_USER = "PUBLIC_USER"


# ── Password hashing ──────────────────────────────────────────
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


# ── JWT helpers ────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> dict:
    """Decode and validate a JWT; returns the payload dict."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("sub") is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
            )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """FastAPI dependency — returns the authenticated User ORM object."""
    from app.models.user import User  # local import to avoid circular deps

    payload = verify_token(token)
    user_id: str | None = payload.get("sub")
    result = await db.execute(select(User).where(User.id == as_uuid(user_id)))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def require_roles(*roles: Role):
    """Return a dependency that restricts access to the given roles."""

    async def _check(
        current_user=Depends(get_current_user),
    ):
        if current_user.role not in {r.value for r in roles}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return _check
