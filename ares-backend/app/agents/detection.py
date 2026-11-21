"""ARES Disaster Detection Agent.

Detects and classifies incidents from reports, sensors, and distress inputs.
Estimates initial disaster severity, evaluates confidence, and checks for duplicates.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import AgentResult, BaseAgent
from app.models.incident import DisasterType, Incident


class DisasterDetectionAgent(BaseAgent):
    agent_name = "Disaster Detection Agent"
    agent_type = "DETECTION"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        raw_type = str(input_data.get("disaster_type", "EARTHQUAKE")).upper()
        matched_type = DisasterType.EARTHQUAKE.value
        for dt in DisasterType:
            if dt.value in raw_type or raw_type in dt.value:
                matched_type = dt.value
                break

        lat = float(input_data.get("lat", 22.5726))
        lng = float(input_data.get("lng", 88.3639))
        casualties = int(input_data.get("casualty_estimate", 10))
        description = input_data.get("description", "Seismic tremors reported with structural damage")
        source = input_data.get("source", "CITIZEN_SOS")

        # Estimate severity (1 to 5)
        severity = 2
        if casualties >= 50 or "collapse" in description.lower() or "severe" in description.lower():
            severity = 5
        elif casualties >= 25 or "major" in description.lower() or "trapped" in description.lower():
            severity = 4
        elif casualties >= 10:
            severity = 3
        elif casualties <= 3:
            severity = 1

        # Check for duplicates nearby
        is_duplicate = False
        duplicate_of = None

        async with await self._get_db_session() as db:
            result = await db.execute(select(Incident))
            existing_incidents = result.scalars().all()
            for inc in existing_incidents:
                if str(inc.id) == str(incident_id):
                    continue
                # Simple distance check ~500m
                dist_approx_km = math.sqrt((inc.location_lat - lat)**2 + (inc.location_lng - lng)**2) * 111
                if dist_approx_km < 0.5:
                    is_duplicate = True
                    duplicate_of = str(inc.id)
                    break

            confidence = 0.95 if source in ["OFFICIAL_ALERT", "ERSS_112"] else (0.80 if source == "CITIZEN_SOS" else 0.65)

            output = {
                "disaster_type": matched_type,
                "severity": severity,
                "epicenter": {"lat": lat, "lng": lng},
                "casualty_estimate": casualties,
                "is_duplicate": is_duplicate,
                "duplicate_incident_id": duplicate_of,
                "source": source,
                "classification_confidence": confidence,
            }

            rec = (
                f"Identified {matched_type} event of Severity {severity}/5 at coordinates "
                f"({lat:.4f}, {lng:.4f}) with estimated {casualties} casualties. "
                + ("Potential duplicate of incident " + str(duplicate_of) if is_duplicate else "New distinct incident registered.")
            )

            res = AgentResult(
                status="success",
                output_data=output,
                recommendation=rec,
                confidence=confidence,
                source=f"ARES-Sensor/NLP-{source}",
            )

            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()
            return res
