"""ARES Rescue Team Coordination Agent.

Manages deployment of specialized units (NDRF, SDRF, Fire Brigade, Police, Civil Defense)
matching disaster-specific technical competencies and extrication requirements.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from geopy.distance import geodesic
from sqlalchemy import select

from app.agents.base import AgentResult, BaseAgent
from app.models.rescue import RescueTeam, RescueTeamStatus, RescueTeamType


DEFAULT_RESCUE_TEAMS = [
    {
        "name": "NDRF 2nd Battalion (USAR Specialist)",
        "type": "NDRF",
        "members_count": 45,
        "lat": 22.5600,
        "lng": 88.3500,
        "skills": ["Collapsed Structure Search & Rescue (CSSR)", "Heavy Extrication", "Canine Detection", "Medical First Response"],
        "phone": "+91-33-2555-1122",
        "status": "AVAILABLE"
    },
    {
        "name": "WB SDRF Emergency Task Force",
        "type": "SDRF",
        "members_count": 30,
        "lat": 22.5850,
        "lng": 88.3750,
        "skills": ["Trench Rescue", "Shoring & Stabilization", "High-Angle Rope Rescue"],
        "phone": "+91-33-2214-5566",
        "status": "AVAILABLE"
    },
    {
        "name": "Kolkata Fire Services - Central Headquarters",
        "type": "FIRE",
        "members_count": 28,
        "lat": 22.5595,
        "lng": 88.3528,
        "skills": ["Fire Suppression", "Thermal Imaging", "Hydraulic Cutters", "Smoke Evacuation"],
        "phone": "+91-33-2252-2222",
        "status": "AVAILABLE"
    },
    {
        "name": "Kolkata Police Disaster Management Group (DMG)",
        "type": "POLICE",
        "members_count": 35,
        "lat": 22.5710,
        "lng": 88.3530,
        "skills": ["Perimeter Cordon", "Crowd Control", "Evacuation Escort", "Traffic Management"],
        "phone": "+91-33-2214-3000",
        "status": "AVAILABLE"
    },
    {
        "name": "Civil Defense Volunteer Corps (Zone South)",
        "type": "VOLUNTEER",
        "members_count": 50,
        "lat": 22.5350,
        "lng": 88.3500,
        "skills": ["Stretcher Bearers", "Shelter Management", "Relief Food/Water Logistics"],
        "phone": "+91-33-2287-9911",
        "status": "AVAILABLE"
    }
]


class RescueCoordinationAgent(BaseAgent):
    agent_name = "Rescue Coordination Agent"
    agent_type = "RESCUE_COORDINATION"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        inc_lat = float(input_data.get("lat", 22.5726))
        inc_lng = float(input_data.get("lng", 88.3639))
        disaster_type = str(input_data.get("disaster_type", "EARTHQUAKE")).upper()
        severity = int(input_data.get("severity", 3))

        teams = []
        async with await self._get_db_session() as db:
            result = await db.execute(
                select(RescueTeam).where(RescueTeam.status == RescueTeamStatus.AVAILABLE)
            )
            db_teams = result.scalars().all()

            if db_teams:
                for t in db_teams:
                    teams.append({
                        "id": str(t.id),
                        "name": t.name,
                        "type": t.type.value if hasattr(t.type, 'value') else str(t.type),
                        "members_count": t.members_count,
                        "lat": t.lat,
                        "lng": t.lng,
                        "skills": t.skills or [],
                        "phone": t.contact_phone,
                    })
            else:
                teams = list(DEFAULT_RESCUE_TEAMS)

        # Calculate distances & ETAs
        for t in teams:
            coords = (t["lat"], t["lng"])
            dist = round(geodesic((inc_lat, inc_lng), coords).km, 2)
            eta = max(5, round((dist / 30.0) * 60 + 5))
            t["distance_km"] = dist
            t["eta_minutes"] = eta

        # Sort and allocate missions based on disaster profile
        missions = []
        for t in teams:
            task = ""
            priority = "MEDIUM"
            assign = False

            if disaster_type == "EARTHQUAKE":
                if t["type"] in ["NDRF", "SDRF"]:
                    assign = True
                    priority = "CRITICAL"
                    task = "Structural breach, acoustic listening detection, and trapped victim extrication"
                elif t["type"] == "FIRE":
                    assign = True
                    priority = "HIGH"
                    task = "Hydraulic shoring of precarious beams and localized debris clearance"
                elif t["type"] == "POLICE":
                    assign = True
                    priority = "HIGH"
                    task = "Enforce 500m exclusion perimeter and clear arterial lanes for incoming ambulances"
            elif disaster_type == "FIRE":
                if t["type"] == "FIRE":
                    assign = True
                    priority = "CRITICAL"
                    task = "Direct interior fire suppression, thermal scan, and trapped occupant retrieval"
                elif t["type"] == "POLICE":
                    assign = True
                    priority = "HIGH"
                    task = "Traffic diversions around incident and crowd management"
            else:
                assign = True
                task = f"Emergency field support and evacuation operations for {disaster_type}"

            if assign:
                missions.append({
                    "team_name": t["name"],
                    "team_type": t["type"],
                    "personnel_count": t["members_count"],
                    "contact_phone": t.get("phone", "+91-112"),
                    "task_description": task,
                    "priority": priority,
                    "distance_km": t["distance_km"],
                    "eta_minutes": t["eta_minutes"],
                    "status": "MISSION_ASSIGNED"
                })

        # Cap deployed teams based on severity
        max_teams = min(len(missions), max(2, severity + 1))
        missions = missions[:max_teams]

        total_responders = sum(m["personnel_count"] for m in missions)

        output = {
            "disaster_type": disaster_type,
            "severity": severity,
            "deployed_teams_count": len(missions),
            "total_deployed_personnel": total_responders,
            "missions": missions
        }

        rec = (
            f"Mobilized {len(missions)} specialized rescue formations ({total_responders} active personnel). "
            f"Lead Unit: {missions[0]['team_name']} (ETA {missions[0]['eta_minutes']}m) assigned to: {missions[0]['task_description']}."
        )

        res = AgentResult(
            status="success",
            output_data=output,
            recommendation=rec,
            confidence=0.96,
            source="ARES-UnifiedRescueDirector",
        )

        async with await self._get_db_session() as db:
            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()

        return res
