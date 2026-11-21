"""Ambulance fleet and dispatch router."""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from geopy.distance import geodesic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.ambulance import Ambulance, AmbulanceStatus, AmbulanceType
from app.schemas.ambulance import (
    AmbulanceCreate,
    AmbulanceResponse,
    AmbulanceUpdate,
)

router = APIRouter(prefix="/ambulances", tags=["Ambulances & Fleet"])


@router.post("/", response_model=AmbulanceResponse)
async def create_ambulance(req: AmbulanceCreate, db: AsyncSession = Depends(get_db)):
    amb = Ambulance(
        id=uuid.uuid4(),
        vehicle_number=req.vehicle_number,
        lat=req.lat,
        lng=req.lng,
        ambulance_type=AmbulanceType(req.ambulance_type),
        driver_name=req.driver_name,
        driver_phone=req.driver_phone,
        capacity=req.capacity,
        status=AmbulanceStatus.AVAILABLE,
    )
    db.add(amb)
    await db.commit()
    await db.refresh(amb)
    return amb


@router.get("/", response_model=List[AmbulanceResponse])
async def list_ambulances(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Ambulance)
    if status_filter:
        query = query.where(Ambulance.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{ambulance_id}", response_model=AmbulanceResponse)
async def update_ambulance(
    ambulance_id: str, req: AmbulanceUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ambulance).where(Ambulance.id == as_uuid(ambulance_id)))
    amb = result.scalar_one_or_none()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    if req.lat is not None:
        amb.lat = req.lat
    if req.lng is not None:
        amb.lng = req.lng
    if req.status is not None:
        amb.status = AmbulanceStatus(req.status)
    if req.assigned_incident_id is not None:
        amb.assigned_incident_id = as_uuid(req.assigned_incident_id)

    await db.commit()
    await db.refresh(amb)
    return amb


@router.post("/{ambulance_id}/dispatch")
async def dispatch_ambulance(
    ambulance_id: str, incident_id: str = Query(...), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ambulance).where(Ambulance.id == as_uuid(ambulance_id)))
    amb = result.scalar_one_or_none()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    amb.status = AmbulanceStatus.DISPATCHED
    amb.assigned_incident_id = as_uuid(incident_id)
    await db.commit()
    return {"status": "success", "message": f"Ambulance {amb.vehicle_number} dispatched to Incident #{incident_id[:8]}"}
