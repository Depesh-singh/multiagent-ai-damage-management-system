"""Incident and disaster schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class DisasterCreate(BaseModel):
    name: str
    type: str  # EARTHQUAKE, FLOOD, FIRE, ACCIDENT, CYCLONE, LANDSLIDE
    epicenter_lat: float
    epicenter_lng: float
    radius_km: float = 5.0
    severity: int = Field(default=3, ge=1, le=5)
    description: Optional[str] = None


class DisasterResponse(BaseModel):
    id: Any
    name: Optional[str] = None
    type: str
    epicenter_lat: float
    epicenter_lng: float
    radius_km: Optional[float] = 5.0
    severity: int
    description: Optional[str]
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class IncidentCreate(BaseModel):
    disaster_id: Optional[str] = None
    location_lat: float
    location_lng: float
    address: str
    disaster_type: Optional[str] = "EARTHQUAKE"
    casualty_estimate: int = 1
    description: Optional[str] = "Citizen SOS distress signal"
    source: str = "CITIZEN_SOS"
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    media_urls: Optional[List[str]] = []


class IncidentStatusUpdate(BaseModel):
    status: str
    decision_notes: Optional[str] = None


class IncidentReportCreate(BaseModel):
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    description: str
    media_urls: Optional[List[str]] = []
    source_confidence: Optional[float] = 0.8


class IncidentResponse(BaseModel):
    id: Any
    disaster_id: Optional[Any] = None
    location_lat: float
    location_lng: float
    address: str
    casualty_estimate: int
    status: str
    source: str
    evidence_urls: Optional[List[str]] = []
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
