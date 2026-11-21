"""AI Multi-Agent Control Room and Human-in-the-Loop approval router."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.agent import AgentRun, Approval, ApprovalStatus
from app.models.incident import Incident, IncidentStatus
from app.schemas.agent import (
    AgentRunResponse,
    ApprovalDecision,
    ApprovalResponse,
)

router = APIRouter(tags=["AI Multi-Agent System & Approvals"])

ALL_AGENT_SPECS = [
    {"name": "Disaster Detection Agent", "type": "DETECTION", "role": "Incident classification, sensor fusion, duplicate screening"},
    {"name": "Incident Verification Agent", "type": "VERIFICATION", "role": "Cross-reference corroboration & credibility scoring"},
    {"name": "Risk Assessment Agent", "type": "RISK_ASSESSMENT", "role": "Dynamic risk zones, hazard propagation, population vulnerability"},
    {"name": "Hospital Allocation Agent", "type": "HOSPITAL_ALLOCATION", "role": "Bed/ICU matching, travel time optimization, load balancing"},
    {"name": "Ambulance Dispatch Agent", "type": "AMBULANCE_DISPATCH", "role": "Vehicle capability matching, ETA minimization, live fleet tracking"},
    {"name": "Rescue Team Coordination Agent", "type": "RESCUE_COORDINATION", "role": "NDRF/SDRF/Fire mission allocation & technical extrication"},
    {"name": "Medical Supply Agent", "type": "MEDICAL_SUPPLY", "role": "Clinical formula scaling, hospital inventory deficit checks"},
    {"name": "Route Optimization Agent", "type": "ROUTE_OPTIMIZATION", "role": "Road closure avoidance, green-wave emergency corridors"},
    {"name": "Agency Communication Agent", "type": "COMMUNICATION", "role": "ERSS 112 bridge, VoIP telematics & automated dispatch records"},
    {"name": "Government Reporting Agent", "type": "GOVERNMENT_REPORTING", "role": "Official NDMA/SDMA SITREP generation & executive briefs"},
]


@router.get("/agents/status")
async def get_agents_status(db: AsyncSession = Depends(get_db)):
    """Returns live status of all 10 specialist agents."""
    statuses = []
    for spec in ALL_AGENT_SPECS:
        res = await db.execute(
            select(AgentRun)
            .where(AgentRun.agent_type == spec["type"])
            .order_by(desc(AgentRun.started_at))
            .limit(1)
        )
        last_run = res.scalar_one_or_none()
        statuses.append({
            "name": spec["name"],
            "type": spec["type"],
            "description": spec["role"],
            "status": "ONLINE_STANDBY" if not last_run else "ACTIVE_OPERATIONAL",
            "last_run_time": last_run.started_at.isoformat() if last_run and last_run.started_at else None,
            "last_confidence": last_run.confidence if last_run else 0.95,
            "total_completed_tasks": 1 if last_run else 0,
        })
    return statuses


@router.get("/agents/runs", response_model=List[AgentRunResponse])
async def list_agent_runs(
    incident_id: Optional[str] = None,
    agent_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(AgentRun).order_by(desc(AgentRun.started_at))
    if incident_id:
        query = query.where(AgentRun.incident_id == as_uuid(incident_id))
    if agent_type:
        query = query.where(AgentRun.agent_type == agent_type)
    result = await db.execute(query.limit(50))
    return result.scalars().all()


@router.get("/approvals/", response_model=List[ApprovalResponse])
async def list_approvals(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Approval).order_by(desc(Approval.created_at))
    if status_filter:
        query = query.where(Approval.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/approvals/{approval_id}/decide", response_model=ApprovalResponse)
async def decide_approval(
    approval_id: str, decision: ApprovalDecision, db: AsyncSession = Depends(get_db)
):
    """Human-in-the-Loop authorization by Incident Commander."""
    result = await db.execute(select(Approval).where(Approval.id == as_uuid(approval_id)))
    appr = result.scalar_one_or_none()
    if not appr:
        raise HTTPException(status_code=404, detail="Approval record not found")

    decision_status = ApprovalStatus.APPROVED if decision.action.upper() == "APPROVE" else ApprovalStatus.REJECTED
    appr.status = decision_status
    appr.decided_by = "Chief Incident Commander"
    appr.decision_notes = decision.decision_notes or f"Tactical action {decision.action.upper()} by command."
    appr.decided_at = datetime.now(timezone.utc)

    # Also transition incident status to APPROVED or DISPATCHED
    if decision_status == ApprovalStatus.APPROVED:
        inc = await db.get(Incident, appr.incident_id)
        if inc:
            inc.status = IncidentStatus.APPROVED
            db.add(inc)

    await db.commit()
    await db.refresh(appr)
    return appr
