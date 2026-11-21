"""Shelter schemas."""

from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel


class ShelterCreate(BaseModel):
    name: str
    lat: float
    lng: float
    address: str
    capacity: int
    amenities: List[str] = ["Water", "First Aid", "Sanitation", "Power Backup"]
    contact_phone: str


class ShelterResponse(BaseModel):
    id: Any
    name: str
    lat: float
    lng: float
    address: str
    capacity: int
    current_occupancy: int
    amenities: List[str]
    contact_phone: str
    status: str

    class Config:
        from_attributes = True
