"""Incidents and disaster management router."""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import CentralOrchestrator
from app.services.n8n import n8n_service
from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.agent import AuditLog
from app.models.incident import (
    Disaster,
    DisasterType,
    Incident,
    IncidentReport,
    IncidentStatus,
)
from app.schemas.incident import (
    DisasterCreate,
    DisasterResponse,
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate,
)

router = APIRouter(prefix="/incidents", tags=["Incidents & Disasters"])
orchestrator = CentralOrchestrator()


# ── Disasters ──────────────────────────────────────────────────
@router.post("/disasters", response_model=DisasterResponse)
async def create_disaster(req: DisasterCreate, db: AsyncSession = Depends(get_db)):
    disaster = Disaster(
        id=uuid.uuid4(),
        type=DisasterType(req.type).value,
        epicenter_lat=req.epicenter_lat,
        epicenter_lng=req.epicenter_lng,
        radius_km=req.radius_km,
        severity=req.severity,
        description=req.description or req.name,
        status="ACTIVE",
    )
    db.add(disaster)
    await db.commit()
    await db.refresh(disaster)
    return disaster


@router.get("/disasters", response_model=List[DisasterResponse])
async def list_disasters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Disaster).order_by(desc(Disaster.created_at)))
    return result.scalars().all()


# ── Incidents (SOS Portal) ─────────────────────────────────────
@router.post("/", response_model=IncidentResponse)
async def report_incident(req: IncidentCreate, db: AsyncSession = Depends(get_db)):
    """Public SOS emergency submission endpoint."""
    inc_uuid = uuid.uuid4()
    incident = Incident(
        id=inc_uuid,
        disaster_id=as_uuid(req.disaster_id),
        location_lat=req.location_lat,
        location_lng=req.location_lng,
        address=req.address,
        casualty_estimate=req.casualty_estimate,
        status=IncidentStatus.REPORTED,
        source=req.source,
        evidence_urls=req.media_urls or [],
    )
    db.add(incident)

    # Add initial report
    report = IncidentReport(
        id=uuid.uuid4(),
        incident_id=inc_uuid,
        reporter_name=req.reporter_name or "Anonymous Citizen",
        reporter_phone=req.reporter_phone,
        description=req.description or "SOS Emergency Alert",
        media_urls=req.media_urls or [],
        source_confidence=0.85 if req.source == "CITIZEN_SOS" else 0.95,
    )
    db.add(report)

    # Log audit
    audit = AuditLog(
        id=uuid.uuid4(),
        action="INCIDENT_REPORTED",
        resource_type="INCIDENT",
        resource_id=str(inc_uuid),
        new_value={"address": req.address, "casualties": req.casualty_estimate, "source": req.source},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(incident)

    # Real-time multi-agent dispatch via n8n
    asyncio.create_task(
        n8n_service.dispatch_emergency(
            incident_id=str(inc_uuid),
            disaster_type="EARTHQUAKE" if "quake" in (req.address or "").lower() else "FLOOD",
            latitude=req.location_lat,
            longitude=req.location_lng,
            location_name=req.address or f"Incident at {req.location_lat}, {req.location_lng}",
            casualty_estimate=req.casualty_estimate or 5,
            description=req.description or "SOS Emergency Alert",
            reporter_source=req.source or "CITIZEN_SOS",
            simulated=False,
        )
    )

    return incident


@router.get("/", response_model=List[IncidentResponse])
async def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Incident).order_by(desc(Incident.created_at))
    if status_filter:
        query = query.where(Incident.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/clear-all")
async def clear_all_incidents(db: AsyncSession = Depends(get_db)):
    """Deletes all incidents, incident reports, and audit logs to return to a clean slate."""
    from sqlalchemy import delete
    await db.execute(delete(IncidentReport))
    await db.execute(delete(AuditLog))
    await db.execute(delete(Incident))
    await db.commit()
    return {"status": "success", "message": "All incidents cleared successfully", "remaining": 0}


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == as_uuid(incident_id)))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.delete("/{incident_id}")
async def delete_single_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes a single incident and its associated reports."""
    from sqlalchemy import delete
    u_id = as_uuid(incident_id)
    await db.execute(delete(IncidentReport).where(IncidentReport.incident_id == u_id))
    await db.execute(delete(AuditLog).where(AuditLog.resource_id == str(incident_id)))
    await db.execute(delete(Incident).where(Incident.id == u_id))
    await db.commit()
    return {"status": "success", "message": f"Incident {incident_id} deleted"}


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str, req: IncidentStatusUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Incident).where(Incident.id == as_uuid(incident_id)))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = incident.status.value if hasattr(incident.status, 'value') else str(incident.status)
    try:
        incident.status = IncidentStatus(req.status.upper())
    except (ValueError, KeyError):
        incident.status = IncidentStatus.ACTIVE
    db.add(incident)

    audit = AuditLog(
        id=uuid.uuid4(),
        action="STATUS_UPDATED",
        resource_type="INCIDENT",
        resource_id=incident_id,
        old_value={"status": old_status},
        new_value={"status": req.status, "notes": req.decision_notes},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(incident)

    # Trigger n8n reassessment on status change
    asyncio.create_task(
        n8n_service.trigger_event(
            "INCIDENT_STATUS_CHANGED",
            str(incident.id),
            {"status": req.status, "notes": req.decision_notes},
        )
    )

    return incident


@router.post("/{incident_id}/trigger-response")
async def trigger_agent_response(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Triggers the 10-Agent AI Response Orchestration for an incident."""
    result = await db.execute(select(Incident).where(Incident.id == as_uuid(incident_id)))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Real-time dispatch through n8n Multi-Agent Workflow
    n8n_task = asyncio.create_task(
        n8n_service.dispatch_emergency(
            incident_id=str(incident.id),
            disaster_type="EARTHQUAKE" if "quake" in (incident.address or "").lower() else "FLOOD",
            latitude=incident.location_lat,
            longitude=incident.location_lng,
            location_name=incident.address or f"Incident at {incident.location_lat}, {incident.location_lng}",
            casualty_estimate=incident.casualty_estimate or 10,
            description=incident.description or "Live emergency requiring multi-agent response.",
            reporter_source=incident.source or "ERSS_112",
            simulated=False,
        )
    )

    plan = await orchestrator.run_disaster_response(
        str(incident.id),
        trigger_payload={
            "lat": incident.location_lat,
            "lng": incident.location_lng,
            "casualty_estimate": incident.casualty_estimate,
            "source": incident.source,
            "address": incident.address,
        }
    )

    try:
        n8n_res = await asyncio.wait_for(n8n_task, timeout=6.0)
        plan["n8n_orchestration"] = n8n_res
    except Exception as exc:
        plan["n8n_orchestration"] = {"status": "background_processing", "detail": str(exc)}

    return plan


@router.get("/{incident_id}/timeline")
async def get_incident_timeline(incident_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.resource_id == str(incident_id))
        .order_by(desc(AuditLog.created_at))
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "action": log.action,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "details": log.new_value,
        }
        for log in logs
    ]
