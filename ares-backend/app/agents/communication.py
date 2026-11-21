"""ARES Agency Communication Agent.

Coordinates interoperability logs with India's emergency response ecosystem
(ERSS 112, 108 GVK EMRI, Fire 101, Police 100, NDRF, and DEOC).
Provides structured dispatch telematics and automated broadcast records.
"""

from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Any

from app.agents.base import AgentResult, BaseAgent


BENCHMARK_AGENCIES = [
    {
        "agency": "ERSS_112",
        "name": "National Emergency Response Support System (ERSS 112)",
        "phone": "112",
        "type": "NATIONAL_DISPATCH",
        "jurisdiction": "Central & Inter-Agency Coordination"
    },
    {
        "agency": "AMBULANCE_108",
        "name": "State Emergency Medical Ambulance Service (GVK EMRI)",
        "phone": "108",
        "type": "MEDICAL_FLEET",
        "jurisdiction": "All-India Toll-Free Health Dispatch"
    },
    {
        "agency": "FIRE_101",
        "name": "West Bengal Fire & Emergency Services HQ",
        "phone": "101",
        "type": "FIRE_RESCUE",
        "jurisdiction": "Kolkata Fire Control Division"
    },
    {
        "agency": "POLICE_100",
        "name": "Kolkata Police Control Room (Lalbazar Headquarters)",
        "phone": "100",
        "type": "LAW_ENFORCEMENT",
        "jurisdiction": "Metropolitan Law, Order & Traffic DMG"
    },
    {
        "agency": "NDRF_OPS",
        "name": "National Disaster Response Force (NDRF 2nd Bn Control)",
        "phone": "+91-33-2555-1122",
        "type": "HEAVY_DISASTER",
        "jurisdiction": "Specialized USAR & High-Level Inundation"
    },
    {
        "agency": "DEOC_COLLECTORATE",
        "name": "District Emergency Operations Centre (DEOC Kolkata)",
        "phone": "+91-33-2214-3526",
        "type": "CIVIL_ADMINISTRATION",
        "jurisdiction": "District Magistrate / Disaster Management Cell"
    }
]


class CommunicationAgent(BaseAgent):
    agent_name = "Agency Communication Agent"
    agent_type = "COMMUNICATION"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        disaster_type = str(input_data.get("disaster_type", "EARTHQUAKE")).upper()
        severity = int(input_data.get("severity", 3))
        casualties = int(input_data.get("casualty_estimate", 15))
        lat = float(input_data.get("lat", 22.5726))
        lng = float(input_data.get("lng", 88.3639))

        call_records = []
        now_str = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")

        for ag in BENCHMARK_AGENCIES:
            # Determine appropriate simulated message text
            message_body = (
                f"[ARES DISPATCH NOTIFICATION] Incident #{incident_id[:8]} - {disaster_type} (Severity {severity}/5). "
                f"Location: ({lat:.4f}, {lng:.4f}). Est. {casualties} casualties. "
                f"Multi-agent tactical response initiated. Immediate operational synchronization requested."
            )

            call_records.append({
                "agency_code": ag["agency"],
                "agency_name": ag["name"],
                "contact_number": ag["phone"],
                "timestamp": now_str,
                "protocol": "SIMULATED_VOIP_TELEMETRY",
                "message_payload": message_body,
                "status": "DELIVERED_ACKNOWLEDGED",
                "ack_latency_seconds": random.randint(3, 9),
                "responder_ack_badge": "CHIEF_DISPATCHER_ON_DUTY",
                "is_simulation": True
            })

        output = {
            "incident_id": incident_id,
            "dispatched_channels_count": len(call_records),
            "communications": call_records,
            "erss_112_ticket_id": f"ERSS-WB-2026-{random.randint(100000, 999999)}",
            "regulatory_note": "ALL EMERGENCY TELEPHONY TRANSMISSIONS ARE EXECUTED IN CERTIFIED SIMULATION MODE."
        }

        rec = (
            f"Executed simulated multi-agency dispatch across 6 core channels (ERSS 112, 108, 101, 100, NDRF, DEOC). "
            f"All channels confirmed receipt within 9 seconds. Incident Ticket: {output['erss_112_ticket_id']}."
        )

        res = AgentResult(
            status="success",
            output_data=output,
            recommendation=rec,
            confidence=0.99,
            source="ARES-ERSS112-Bridge-Simulated",
        )

        async with await self._get_db_session() as db:
            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()

        return res
