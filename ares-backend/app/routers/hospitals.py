"""Hospital network router."""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from geopy.distance import geodesic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.hospital import Hospital, HospitalCapacity
from app.schemas.hospital import (
    HospitalCapacityUpdate,
    HospitalCreate,
    HospitalResponse,
)

router = APIRouter(prefix="/hospitals", tags=["Hospitals & Critical Care"])


@router.post("/", response_model=HospitalResponse)
async def create_hospital(req: HospitalCreate, db: AsyncSession = Depends(get_db)):
    hosp_uuid = uuid.uuid4()
    hosp = Hospital(
        id=hosp_uuid,
        name=req.name,
        lat=req.lat,
        lng=req.lng,
        address=req.address,
        phone=req.phone,
        specialties=req.specialties,
        is_active=True,
    )
    db.add(hosp)

    # Initial default capacity
    cap = HospitalCapacity(
        id=uuid.uuid4(),
        hospital_id=hosp_uuid,
        total_beds=500,
        available_beds=60,
        icu_beds=50,
        icu_available=12,
        ventilators=30,
        ventilators_available=8,
        oxygen_cylinders=150,
    )
    db.add(cap)

    await db.commit()
    await db.refresh(hosp)
    await db.refresh(cap)

    return HospitalResponse(
        id=str(hosp.id),
        name=hosp.name,
        lat=hosp.lat,
        lng=hosp.lng,
        address=hosp.address,
        phone=hosp.phone,
        specialties=hosp.specialties or [],
        is_active=hosp.is_active,
        total_beds=cap.total_beds,
        available_beds=cap.available_beds,
        icu_beds=cap.icu_beds,
        icu_available=cap.icu_available,
        ventilators=cap.ventilators,
        ventilators_available=cap.ventilators_available,
        oxygen_cylinders=cap.oxygen_cylinders,
    )


@router.get("/", response_model=List[HospitalResponse])
async def list_hospitals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital))
    hospitals = result.scalars().all()

    resp = []
    for h in hospitals:
        cap_res = await db.execute(
            select(HospitalCapacity).where(HospitalCapacity.hospital_id == h.id)
        )
        cap = cap_res.scalar_one_or_none()
        resp.append(
            HospitalResponse(
                id=str(h.id),
                name=h.name,
                lat=h.lat,
                lng=h.lng,
                address=h.address,
                phone=h.phone,
                specialties=h.specialties or [],
                is_active=h.is_active,
                total_beds=cap.total_beds if cap else 500,
                available_beds=cap.available_beds if cap else 50,
                icu_beds=cap.icu_beds if cap else 50,
                icu_available=cap.icu_available if cap else 10,
                ventilators=cap.ventilators if cap else 30,
                ventilators_available=cap.ventilators_available if cap else 5,
                oxygen_cylinders=cap.oxygen_cylinders if cap else 100,
            )
        )
    return resp


@router.get("/nearby")
async def find_nearby_hospitals(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(15.0),
    db: AsyncSession = Depends(get_db),
):
    hospitals = await list_hospitals(db)
    nearby = []
    for h in hospitals:
        dist = geodesic((lat, lng), (h.lat, h.lng)).km
        if dist <= radius_km:
            h_dict = h.model_dump()
            h_dict["distance_km"] = round(dist, 2)
            h_dict["travel_minutes"] = max(3, round((dist / 35.0) * 60 + 2))
            nearby.append(h_dict)
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby


@router.patch("/{hospital_id}/capacity")
async def update_capacity(
    hospital_id: str, req: HospitalCapacityUpdate, db: AsyncSession = Depends(get_db)
):
    h_uuid = as_uuid(hospital_id)
    result = await db.execute(
        select(HospitalCapacity).where(HospitalCapacity.hospital_id == h_uuid)
    )
    cap = result.scalar_one_or_none()
    if not cap:
        cap = HospitalCapacity(id=uuid.uuid4(), hospital_id=h_uuid)
        db.add(cap)

    for field, val in req.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(cap, field, val)

    await db.commit()
    await db.refresh(cap)
    return {"status": "success", "message": "Hospital capacity updated"}
