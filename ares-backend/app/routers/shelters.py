"""Evacuation and shelter network router."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from geopy.distance import geodesic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.shelter import Shelter, ShelterStatus
from app.schemas.shelter import ShelterCreate, ShelterResponse

router = APIRouter(prefix="/shelters", tags=["Evacuation & Shelters"])


DEFAULT_SHELTERS = [
    {
        "name": "Netaji Indoor Stadium Evacuation Center",
        "lat": 22.5675,
        "lng": 88.3444,
        "address": "Eden Gardens, Strand Road, Kolkata",
        "capacity": 2500,
        "current_occupancy": 320,
        "amenities": ["Drinking Water", "Mobile Medical Clinic", "Sanitation", "Emergency Power", "Cots"],
        "contact_phone": "+91-33-2248-0411",
        "status": "OPEN",
    },
    {
        "name": "Rabindra Sarovar Relief Complex",
        "lat": 22.5120,
        "lng": 88.3580,
        "address": "Southern Avenue, Kolkata",
        "capacity": 1500,
        "current_occupancy": 150,
        "amenities": ["Water Purification", "First Aid", "Food Packets", "Blankets"],
        "contact_phone": "+91-33-2464-1200",
        "status": "OPEN",
    },
    {
        "name": "Salt Lake Stadium (Yuva Bharati) Community Hub",
        "lat": 22.5697,
        "lng": 88.4060,
        "address": "Sector III, Bidhannagar, Kolkata",
        "capacity": 5000,
        "current_occupancy": 650,
        "amenities": ["Multi-tier Shelter", "Surgical First Aid Post", "Helipad Access", "Kitchens"],
        "contact_phone": "+91-33-2335-0810",
        "status": "OPEN",
    }
]


@router.post("/", response_model=ShelterResponse)
async def create_shelter(req: ShelterCreate, db: AsyncSession = Depends(get_db)):
    shelter = Shelter(
        id=uuid.uuid4(),
        name=req.name,
        lat=req.lat,
        lng=req.lng,
        address=req.address,
        capacity=req.capacity,
        current_occupancy=0,
        amenities=req.amenities,
        contact_phone=req.contact_phone,
        status=ShelterStatus.OPEN,
    )
    db.add(shelter)
    await db.commit()
    await db.refresh(shelter)
    return shelter


@router.get("/", response_model=List[ShelterResponse])
async def list_shelters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Shelter))
    shelters = result.scalars().all()
    if not shelters:
        # Return standard shelters
        return [
            ShelterResponse(
                id=f"SH-{i+1}",
                name=s["name"],
                lat=s["lat"],
                lng=s["lng"],
                address=s["address"],
                capacity=s["capacity"],
                current_occupancy=s["current_occupancy"],
                amenities=s["amenities"],
                contact_phone=s["contact_phone"],
                status=s["status"],
            )
            for i, s in enumerate(DEFAULT_SHELTERS)
        ]
    return shelters


@router.get("/nearby")
async def find_nearby_shelters(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(20.0),
    db: AsyncSession = Depends(get_db),
):
    shelters = await list_shelters(db)
    nearby = []
    for s in shelters:
        dist = geodesic((lat, lng), (s.lat, s.lng)).km
        if dist <= radius_km:
            status_str = s.status.value if hasattr(s.status, 'value') else str(s.status)
            nearby.append({
                "id": str(s.id),
                "name": s.name,
                "lat": s.lat,
                "lng": s.lng,
                "address": s.address,
                "capacity": s.capacity,
                "current_occupancy": s.current_occupancy,
                "amenities": s.amenities or [],
                "contact_phone": s.contact_phone,
                "status": status_str,
                "distance_km": round(dist, 2),
            })
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby
