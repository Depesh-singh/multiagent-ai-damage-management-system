"""Ambulance fleet schemas."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class AmbulanceCreate(BaseModel):
    vehicle_number: str
    lat: float
    lng: float
    ambulance_type: str = "BLS"  # BLS, ALS, MORTUARY
    driver_name: str
    driver_phone: str
    capacity: int = 2


class AmbulanceUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: Optional[str] = None
    assigned_incident_id: Optional[str] = None


class AmbulanceResponse(BaseModel):
    id: Any
    vehicle_number: str
    lat: float
    lng: float
    status: str
    ambulance_type: str
    driver_name: str
    driver_phone: str
    capacity: int
    assigned_incident_id: Optional[Any] = None

    class Config:
        from_attributes = True
