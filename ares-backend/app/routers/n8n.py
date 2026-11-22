"""Router for n8n Multi-Agent Orchestration & Real-Time Data Feeds."""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import as_uuid
from app.models.incident import Incident
from app.services.live_feed import live_feed_service
from app.services.n8n import n8n_service

router = APIRouter(prefix="/n8n", tags=["n8n Multi-Agent & Real-Time Feeds"])


@router.get("/status")
async def get_n8n_status():
    """Returns the live connection status of the n8n Docker container on port 5678."""
    return await n8n_service.get_status()


@router.post("/dispatch/{incident_id}")
async def dispatch_incident_to_n8n(
    incident_id: str, db: AsyncSession = Depends(get_db)
):
    """Dispatches a real incident directly to the n8n Multi-Agent Orchestrator."""
    result = await db.execute(
        select(Incident).where(Incident.id == as_uuid(incident_id))
    )
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    res = await n8n_service.dispatch_emergency(
        incident_id=str(incident.id),
        disaster_type="EARTHQUAKE"
        if "quake" in (incident.address or "").lower()
        else "FLOOD",
        latitude=incident.location_lat,
        longitude=incident.location_lng,
        location_name=incident.address
        or f"Incident at {incident.location_lat}, {incident.location_lng}",
        casualty_estimate=incident.casualty_estimate or 10,
        description=incident.description
        or "Live emergency requiring multi-agent response.",
        reporter_source=incident.source or "ERSS_112",
        simulated=False,
    )
    return res


@router.post("/feed/sync")
async def sync_realtime_disaster_feed(
    auto_dispatch: bool = Query(True), db: AsyncSession = Depends(get_db)
):
    """Fetches real-time earthquakes from USGS and streams them through n8n with zero mock data."""
    return await live_feed_service.sync_live_disasters_to_db(
        db, auto_dispatch_n8n=auto_dispatch
    )


@router.get("/earthquakes")
async def get_realtime_earthquakes(
    min_mag: float = Query(2.5), limit: int = Query(15)
):
    """Get latest actual live earthquake occurrences globally from USGS."""
    return await live_feed_service.fetch_live_earthquakes(
        min_magnitude=min_mag, limit=limit
    )


@router.get("/weather")
async def get_realtime_weather(
    lat: float = Query(...), lng: float = Query(...)
):
    """Get live meteorological telemetry from Open-Meteo for any coordinates."""
    return await live_feed_service.fetch_live_weather(latitude=lat, longitude=lng)


@router.post("/route")
async def get_realtime_route(payload: Dict[str, float]):
    """Get live turn-by-turn road driving route from OSRM."""
    return await live_feed_service.fetch_live_road_route(
        origin_lat=payload.get("origin_lat", 22.5620),
        origin_lng=payload.get("origin_lng", 88.3639),
        dest_lat=payload.get("dest_lat", 22.5726),
        dest_lng=payload.get("dest_lng", 88.3639),
    )


@router.post("/event")
async def trigger_n8n_event_reassessment(payload: Dict[str, Any]):
    """Trigger n8n's Agent 12 Dynamic Event Reassessment."""
    event_type = payload.get("event_type", "INCIDENT_UPDATE")
    incident_id = payload.get("incident_id", "")
    details = payload.get("details", {})
    return await n8n_service.trigger_event(
        event_type=event_type, incident_id=incident_id, details=details
    )
