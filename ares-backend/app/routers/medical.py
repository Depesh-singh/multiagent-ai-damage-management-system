"""Medical inventory, clinical requirements, and logistics router."""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.medical_supply import CLINICAL_PROTOCOL_RULES
from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.medical import MedicalInventory, SupplyRequest, SupplyStatus
from app.schemas.medical import (
    SupplyRequestCreate,
    SupplyRequestResponse,
)

router = APIRouter(prefix="/medical", tags=["Medical Supplies & Logistics"])


@router.get("/requirements/{disaster_type}")
async def get_clinical_requirements(
    disaster_type: str, patient_count: int = Query(15, ge=1)
):
    dtype = disaster_type.upper()
    rule = CLINICAL_PROTOCOL_RULES.get(dtype, CLINICAL_PROTOCOL_RULES["EARTHQUAKE"])

    scaled_meds = [
        {
            "name": m["name"],
            "unit": m["unit"],
            "quantity": m["per_patient"] * patient_count,
            "priority": m["priority"],
        }
        for m in rule["medicines"]
    ]

    scaled_equipment = [
        {
            "name": eq["name"],
            "quantity": max(1, int(eq["quantity"] * max(1.0, patient_count / 15.0))),
            "priority": eq["priority"],
        }
        for eq in rule["equipment"]
    ]

    return {
        "disaster_type": dtype,
        "patient_count": patient_count,
        "description": rule["description"],
        "medicines": scaled_meds,
        "equipment": scaled_equipment,
    }


@router.get("/inventory")
async def list_inventory(
    hospital_id: Optional[str] = None, db: AsyncSession = Depends(get_db)
):
    query = select(MedicalInventory)
    if hospital_id:
        query = query.where(MedicalInventory.hospital_id == hospital_id)
    result = await db.execute(query)
    items = result.scalars().all()
    if not items:
        # Return standard stock benchmarks
        return [
            {"item_name": "Blood Units (O-Neg)", "category": "BLOOD", "available": 140, "reserved": 40, "unit": "units", "status": "ADEQUATE"},
            {"item_name": "Saline Normal 0.9% IV", "category": "FLUIDS", "available": 850, "reserved": 120, "unit": "bags", "status": "ADEQUATE"},
            {"item_name": "Morphine Sulfate 10mg", "category": "ANALGESIC", "available": 320, "reserved": 60, "unit": "vials", "status": "ADEQUATE"},
            {"item_name": "Mannitol 20% Infusion", "category": "CRUSH_RESCUE", "available": 180, "reserved": 45, "unit": "bottles", "status": "MONITORED"},
            {"item_name": "Tetanus Toxoid", "category": "VACCINE", "available": 450, "reserved": 30, "unit": "doses", "status": "ADEQUATE"},
            {"item_name": "C-Arm Portable X-Ray", "category": "EQUIPMENT", "available": 8, "reserved": 2, "unit": "units", "status": "ADEQUATE"},
        ]
    return items


@router.get("/supply-requests", response_model=List[SupplyRequestResponse])
@router.get("/requests", response_model=List[SupplyRequestResponse])
async def list_supply_requests(
    incident_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(SupplyRequest)
    if incident_id:
        query = query.where(SupplyRequest.incident_id == as_uuid(incident_id))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/supply-requests", response_model=SupplyRequestResponse)
@router.post("/requests", response_model=SupplyRequestResponse)
async def create_supply_request(req: SupplyRequestCreate, db: AsyncSession = Depends(get_db)):
    sub = SupplyRequest(
        id=uuid.uuid4(),
        incident_id=as_uuid(req.incident_id),
        hospital_id=as_uuid(req.hospital_id),
        item_name=req.item_name,
        quantity_required=req.quantity_required,
        quantity_approved=req.quantity_required,
        quantity_dispatched=0,
        quantity_delivered=0,
        status=SupplyStatus.APPROVED,
        requested_by="ARES-Hospital-Admin",
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub
