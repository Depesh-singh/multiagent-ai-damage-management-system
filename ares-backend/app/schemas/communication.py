"""Agency communications schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class AgencyMessageCreate(BaseModel):
    incident_id: Optional[str] = None
    recipient_agency: str
    recipient_name: str
    recipient_phone: str
    message_type: str = "ALERT"
    subject: str
    body: str
    priority: str = "HIGH"


class AgencyMessageResponse(BaseModel):
    id: Any
    incident_id: Optional[Any] = None
    sender_role: str
    sender_name: str
    recipient_agency: str
    recipient_name: str
    recipient_phone: str
    message_type: str
    subject: str
    body: str
    status: str
    priority: str
    sent_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True
