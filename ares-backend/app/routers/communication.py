"""Emergency communications and interoperability router."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.communication import BENCHMARK_AGENCIES
from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.communication import (
    AgencyMessage,
    MessagePriority,
    MessageStatus,
    MessageType,
)
from app.schemas.communication import (
    AgencyMessageCreate,
    AgencyMessageResponse,
)

router = APIRouter(prefix="/communication", tags=["Communications & ERSS 112 Bridge"])


@router.get("/contacts")
async def get_emergency_contacts():
    """Returns official Indian emergency response contact directory."""
    return BENCHMARK_AGENCIES


@router.get("/messages", response_model=List[AgencyMessageResponse])
async def list_agency_messages(
    incident_id: Optional[str] = None, db: AsyncSession = Depends(get_db)
):
    query = select(AgencyMessage).order_by(desc(AgencyMessage.sent_at))
    if incident_id:
        query = query.where(AgencyMessage.incident_id == as_uuid(incident_id))
    result = await db.execute(query)
    messages = result.scalars().all()

    if not messages:
        # Provide sample simulated telemetry
        now = datetime.now(timezone.utc)
        return [
            AgencyMessageResponse(
                id="MSG-108",
                incident_id=incident_id,
                sender_role="ARES_CENTRAL",
                sender_name="Disaster Ops Director",
                recipient_agency="AMBULANCE_108",
                recipient_name="State Medical Dispatch",
                recipient_phone="108",
                message_type="ALERT",
                subject="Mass Casualty Dispatch Order",
                body="Authorize immediate mobilization of 8 BLS/ALS units to Kolkata Incident Site.",
                status="ACKNOWLEDGED",
                priority="CRITICAL",
                sent_at=now,
                acknowledged_at=now,
            ),
            AgencyMessageResponse(
                id="MSG-112",
                incident_id=incident_id,
                sender_role="ARES_CENTRAL",
                sender_name="Disaster Ops Director",
                recipient_agency="ERSS_112",
                recipient_name="National Emergency Support Center",
                recipient_phone="112",
                message_type="ALERT",
                subject="ERSS-112 Inter-Agency Synchronize",
                body="Incident status escalated to Level 4. Unified dispatch command activated.",
                status="ACKNOWLEDGED",
                priority="HIGH",
                sent_at=now,
                acknowledged_at=now,
            )
        ]
    return messages


@router.post("/messages", response_model=AgencyMessageResponse)
async def send_message(req: AgencyMessageCreate, db: AsyncSession = Depends(get_db)):
    msg = AgencyMessage(
        id=uuid.uuid4(),
        incident_id=as_uuid(req.incident_id),
        sender_role="INCIDENT_COMMANDER",
        sender_name="Authorized Incident Officer",
        recipient_agency=req.recipient_agency,
        recipient_name=req.recipient_name,
        recipient_phone=req.recipient_phone,
        message_type=MessageType(req.message_type),
        subject=req.subject,
        body=req.body,
        priority=MessagePriority(req.priority),
        status=MessageStatus.SENT,
        sent_at=datetime.now(timezone.utc),
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


@router.patch("/messages/{message_id}/ack")
async def acknowledge_message(message_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AgencyMessage).where(AgencyMessage.id == as_uuid(message_id)))
    msg = result.scalar_one_or_none()
    if not msg:
        return {"status": "mock_ack", "message": f"Simulated message {message_id} acknowledged"}
    msg.status = MessageStatus.ACKNOWLEDGED
    msg.acknowledged_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "success", "message_id": message_id, "status_text": "ACKNOWLEDGED"}


@router.post("/broadcast")
async def broadcast_alert(
    subject: str = Query("NATIONAL DISASTER ALERT"),
    body: str = Query("Red level crisis reported. Evacuate to designated relief shelters."),
    priority: str = Query("CRITICAL"),
    incident_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    dispatched = []
    for agency in BENCHMARK_AGENCIES[:4]:
        code = agency.get("agency") or agency.get("name") or "EMERGENCY_AGENCY"
        phone = agency.get("phone", "112")
        msg = AgencyMessage(
            id=uuid.uuid4(),
            incident_id=as_uuid(incident_id),
            sender_role="ARES_BROADCAST_BOT",
            sender_name="Automated Incident Commander",
            recipient_agency=code,
            recipient_name=agency["name"],
            recipient_phone=phone,
            message_type=MessageType.ALERT,
            subject=subject,
            body=body,
            priority=MessagePriority(priority),
            status=MessageStatus.SENT,
            sent_at=datetime.now(timezone.utc),
        )
        db.add(msg)
        dispatched.append(code)
    await db.commit()
    return {"status": "success", "broadcast_sent_to": dispatched, "total": len(dispatched)}
