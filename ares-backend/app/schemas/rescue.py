"""Rescue team and mission schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel


class RescueTeamCreate(BaseModel):
    name: str
    type: str  # NDRF, SDRF, FIRE, POLICE, VOLUNTEER
    members_count: int = 25
    skills: List[str]
    lat: float
    lng: float
    contact_phone: str


class MissionCreate(BaseModel):
    rescue_team_id: str
    incident_id: str
    task_description: str
    priority: str = "HIGH"


class RescueTeamResponse(BaseModel):
    id: Any
    name: str
    type: str
    members_count: int
    skills: List[str]
    lat: float
    lng: float
    status: str
    contact_phone: str

    class Config:
        from_attributes = True


class MissionResponse(BaseModel):
    id: Any
    rescue_team_id: Any
    incident_id: Any
    task_description: str
    status: str
    assigned_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
