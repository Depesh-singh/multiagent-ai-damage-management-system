"""Common schemas and response wrappers."""

from __future__ import annotations

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class StatusResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict[str, Any]] = None


class GeoPoint(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
