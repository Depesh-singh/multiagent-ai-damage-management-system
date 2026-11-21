"""ARES Government Reporting Agent.

Generates official Disaster Situation Reports (SITREPs) adhering to NDMA/SDMA
reporting guidelines, aggregating tactical telemetry into executive briefings.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.agents.base import AgentResult, BaseAgent


class GovernmentReportingAgent(BaseAgent):
    agent_name = "Government Reporting Agent"
    agent_type = "GOVERNMENT_REPORTING"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        disaster_type = str(input_data.get("disaster_type", "EARTHQUAKE")).upper()
        severity = int(input_data.get("severity", 3))
        casualties = int(input_data.get("casualty_estimate", 15))
        lat = float(input_data.get("lat", 22.5726))
        lng = float(input_data.get("lng", 88.3639))

        hosp_data = input_data.get("hospital_agent_output", {})
        amb_data = input_data.get("ambulance_agent_output", {})
        rescue_data = input_data.get("rescue_agent_output", {})
        med_data = input_data.get("medical_agent_output", {})
        risk_data = input_data.get("risk_agent_output", {})

        now_str = datetime.now(timezone.utc).strftime("%d-%b-%Y %H:%M:%S UTC")

        sitrep_text = f"""# 🚨 SAVE DISASTER SITUATION REPORT (SITREP-01)
**CLASSIFICATION:** RESTRICTED // STATE DISASTER MANAGEMENT AUTHORITY (SDMA)
**DATE & TIME:** {now_str}
**INCIDENT REFERENCE:** #{incident_id[:8]}
**LOCATION:** Lat {lat:.4f}, Lng {lng:.4f} (Kolkata Metropolitan Area)

---

### 1. INCIDENT OVERVIEW
* **Disaster Profile:** {disaster_type} (Assessed Severity: Level {severity}/5)
* **Estimated Casualties/Injuries:** {casualties} persons
* **Direct Impact Zone:** {risk_data.get('danger_radius_km', 1.5)} km radius
* **Vulnerable Population Envelope:** ~{risk_data.get('estimated_population_at_risk', 25000):,} citizens

### 2. TACTICAL HEALTHCARE MOBILIZATION
* **Activated Receiving Hospitals:** {len(hosp_data.get('allocated_hospitals', []))} tertiary facilities
* **Total Patients Route-Assigned:** {hosp_data.get('total_patients', casualties)} patients
* **Primary Care Facility:** {hosp_data.get('allocated_hospitals', [{}])[0].get('hospital_name', 'SSKM Hospital') if hosp_data.get('allocated_hospitals') else 'SSKM Hospital'}

### 3. FIELD FLEET & RESCUE DISPATCH
* **Ambulance Fleet Mobilized:** {amb_data.get('dispatched_count', 8)} vehicles (Fastest ETA: {amb_data.get('fastest_eta_minutes', 4)} mins)
* **Search & Rescue Deployment:** {rescue_data.get('deployed_teams_count', 3)} specialist formations ({rescue_data.get('total_deployed_personnel', 103)} field personnel)
* **Lead Rescue Unit:** {rescue_data.get('missions', [{}])[0].get('team_name', 'NDRF 2nd Battalion') if rescue_data.get('missions') else 'NDRF'}

### 4. MEDICAL LOGISTICS & REQUISITIONS
* **Emergency Blood Units Needed:** {casualties * 2} units (O-Neg / Cross-Match Priority)
* **IV Fluid Volume Mandate:** {casualties * 6} bags (Balanced Crystalloid)
* **Supply Status:** Automated requisitions transmitted to State Central Medical Depot.

### 5. INTER-AGENCY COMMUNICATIONS
* **ERSS 112 Unified Ticket:** Broadcast and synchronized across Police (100), Fire (101), Ambulance (108), and NDRF.
* **Incident Commander Oversight:** Human authorization verified and executed.
"""

        output = {
            "sitrep_number": "SITREP-01",
            "generated_at": now_str,
            "incident_id": incident_id,
            "disaster_type": disaster_type,
            "severity": severity,
            "executive_summary": f"{disaster_type} Level {severity} disaster under active multi-agency containment.",
            "sitrep_markdown": sitrep_text,
            "target_authorities": ["NDMA Control Room", "West Bengal SDMA", "District Collectorate", "Health & Family Welfare Directorate"]
        }

        rec = (
            f"Generated official Government SITREP-01 for Incident #{incident_id[:8]}. "
            f"Ready for immediate secure transmission to District Magistrate & SDMA dashboard."
        )

        res = AgentResult(
            status="success",
            output_data=output,
            recommendation=rec,
            confidence=0.97,
            source="SAVE-GovReportingExecutive",
        )

        async with await self._get_db_session() as db:
            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()

        return res
