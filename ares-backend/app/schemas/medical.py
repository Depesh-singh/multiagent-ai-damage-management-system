"""Medical inventory and logistics schemas."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class MedicalInventoryItem(BaseModel):
    id: Optional[str] = None
    hospital_id: Optional[str] = None
    item_name: str
    category: str
    quantity_available: int
    quantity_reserved: int = 0
    quantity_dispatched: int = 0
    quantity_delivered: int = 0
    unit: str
    priority: str = "HIGH"


class SupplyRequestCreate(BaseModel):
    incident_id: str
    hospital_id: str
    item_name: str
    quantity_required: int


class SupplyRequestResponse(BaseModel):
    id: Any
    incident_id: Any
    hospital_id: Any
    item_name: str
    quantity_required: int
    quantity_approved: int
    quantity_dispatched: int
    quantity_delivered: int
    status: str

    class Config:
        from_attributes = True
