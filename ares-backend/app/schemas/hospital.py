"""Hospital schemas."""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class HospitalCreate(BaseModel):
    name: str
    lat: float
    lng: float
    address: str
    phone: str
    specialties: List[str] = ["General", "Trauma"]


class HospitalCapacityUpdate(BaseModel):
    total_beds: Optional[int] = None
    available_beds: Optional[int] = None
    icu_beds: Optional[int] = None
    icu_available: Optional[int] = None
    ventilators: Optional[int] = None
    ventilators_available: Optional[int] = None
    oxygen_cylinders: Optional[int] = None


class HospitalResponse(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    address: str
    phone: str
    specialties: List[str]
    is_active: bool
    total_beds: Optional[int] = 500
    available_beds: Optional[int] = 50
    icu_beds: Optional[int] = 50
    icu_available: Optional[int] = 10
    ventilators: Optional[int] = 30
    ventilators_available: Optional[int] = 5
    oxygen_cylinders: Optional[int] = 100

    class Config:
        from_attributes = True
