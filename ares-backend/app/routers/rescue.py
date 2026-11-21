"""Rescue teams and tactical missions router."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.rescue import Mission, MissionStatus, RescueTeam, RescueTeamStatus, RescueTeamType
from app.schemas.rescue import (
    MissionCreate,
    MissionResponse,
    RescueTeamCreate,
    RescueTeamResponse,
)

router = APIRouter(prefix="/rescue", tags=["Rescue Teams & Tactical Operations"])


@router.post("/teams", response_model=RescueTeamResponse)
async def create_team(req: RescueTeamCreate, db: AsyncSession = Depends(get_db)):
    team = RescueTeam(
        id=uuid.uuid4(),
        name=req.name,
        type=RescueTeamType(req.type),
        members_count=req.members_count,
        skills=req.skills,
        lat=req.lat,
        lng=req.lng,
        status=RescueTeamStatus.AVAILABLE,
        contact_phone=req.contact_phone,
    )
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return team


@router.get("/teams", response_model=List[RescueTeamResponse])
async def list_teams(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RescueTeam))
    return result.scalars().all()


@router.post("/missions", response_model=MissionResponse)
async def create_mission(req: MissionCreate, db: AsyncSession = Depends(get_db)):
    mission = Mission(
        id=uuid.uuid4(),
        rescue_team_id=as_uuid(req.rescue_team_id),
        incident_id=as_uuid(req.incident_id),
        task_description=req.task_description,
        status=MissionStatus.ASSIGNED,
    )
    db.add(mission)
    await db.commit()
    await db.refresh(mission)
    return mission


@router.get("/missions", response_model=List[MissionResponse])
async def list_missions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mission))
    return result.scalars().all()
