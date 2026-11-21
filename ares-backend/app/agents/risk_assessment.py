"""ARES Risk Assessment Agent.

Computes dynamic risk zones, impact radii, population vulnerability,
and secondary environmental hazard profiles based on disaster type and magnitude.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.agents.base import AgentResult, BaseAgent


class RiskAssessmentAgent(BaseAgent):
    agent_name = "Risk Assessment Agent"
    agent_type = "RISK_ASSESSMENT"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        disaster_type = str(input_data.get("disaster_type", "EARTHQUAKE")).upper()
        severity = int(input_data.get("severity", 3))
        lat = float(input_data.get("lat", 22.5726))
        lng = float(input_data.get("lng", 88.3639))

        # Base radius by disaster type and severity
        base_radii = {
            "EARTHQUAKE": 1.5,
            "FIRE": 0.5,
            "FLOOD": 2.0,
            "ACCIDENT": 0.2,
            "CYCLONE": 5.0,
            "LANDSLIDE": 1.0,
        }
        multiplier = max(1.0, severity * 0.8)
        danger_radius_km = round(base_radii.get(disaster_type, 1.0) * multiplier, 2)
        evacuation_radius_km = round(danger_radius_km * 1.8, 2)
        safer_zone_radius_km = round(danger_radius_km * 3.5, 2)

        # Urban population density estimate (~25,000 people per sq km in dense Indian metros)
        impact_area_sqkm = round(3.14159 * (danger_radius_km ** 2), 2)
        estimated_pop_at_risk = int(impact_area_sqkm * 12500)

        # Hazard profiles
        hazards = []
        if disaster_type == "EARTHQUAKE":
            hazards = [
                "Secondary structural collapse in unreinforced masonry buildings",
                "High probability of aftershocks within 12-24 hours",
                "Underground gas line fracture risks and electrical shorts",
                "Road blockages due to fallen debris along narrow arterial lanes"
            ]
        elif disaster_type == "FIRE":
            hazards = [
                "Toxic smoke propagation with prevailing wind direction",
                "Thermal radiation endangering adjacent structures",
                "Explosion risks from localized LPG cylinders"
            ]
        elif disaster_type == "FLOOD":
            hazards = [
                "Water logging disrupting low-lying transit corridors",
                "Submerged open electrical cables and manholes",
                "Water-borne pathogen spread within 48-72 hours"
            ]
        else:
            hazards = [
                "Traffic gridlock obstructing incoming emergency response units",
                "Localized fuel spill contamination"
            ]

        zones = [
            {
                "type": "DANGER_ZONE",
                "label": "Red Zone (Direct Impact)",
                "center": {"lat": lat, "lng": lng},
                "radius_meters": int(danger_radius_km * 1000),
                "color": "#EF4444",
                "fill_opacity": 0.35,
                "access_rule": "First responders & specialized search teams only"
            },
            {
                "type": "EVACUATION_ZONE",
                "label": "Amber Zone (Evacuation Corridor)",
                "center": {"lat": lat, "lng": lng},
                "radius_meters": int(evacuation_radius_km * 1000),
                "color": "#F59E0B",
                "fill_opacity": 0.20,
                "access_rule": "Evacuation transit & emergency support logistics"
            },
            {
                "type": "SAFER_ZONE",
                "label": "Green Zone (Safe Staging & Triage Perimeter)",
                "center": {"lat": lat, "lng": lng},
                "radius_meters": int(safer_zone_radius_km * 1000),
                "color": "#22C55E",
                "fill_opacity": 0.10,
                "access_rule": "Temporary shelters, mobile clinics, command operations"
            }
        ]

        output = {
            "disaster_type": disaster_type,
            "severity": severity,
            "danger_radius_km": danger_radius_km,
            "evacuation_radius_km": evacuation_radius_km,
            "safer_zone_radius_km": safer_zone_radius_km,
            "impact_area_sqkm": impact_area_sqkm,
            "estimated_population_at_risk": estimated_pop_at_risk,
            "zones": zones,
            "secondary_hazards": hazards,
            "risk_level": "CRITICAL" if severity >= 4 else ("HIGH" if severity == 3 else "MODERATE")
        }

        rec = (
            f"Established 3-tier concentric GIS risk perimeter: {danger_radius_km}km Red Zone, "
            f"{evacuation_radius_km}km Evacuation Zone. Estimated {estimated_pop_at_risk:,} persons "
            f"in immediate vulnerability envelope."
        )

        res = AgentResult(
            status="success",
            output_data=output,
            recommendation=rec,
            confidence=0.91,
            source="ARES-GIS-RiskModel",
        )

        async with await self._get_db_session() as db:
            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()

        return res
