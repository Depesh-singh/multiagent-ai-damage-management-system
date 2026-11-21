"""ARES Smart Ambulance Dispatch Agent.

Coordinates emergency fleet allocation, vehicle capability matching (ALS vs BLS),
GPS-based ETA calculations, and vehicle-to-hospital routing.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from geopy.distance import geodesic
from sqlalchemy import select

from app.agents.base import AgentResult, BaseAgent
from app.models.ambulance import Ambulance, AmbulanceStatus, AmbulanceType


DEFAULT_AMBULANCES = [
    {"vehicle_number": "WB-01-AMB-1081", "type": "ALS", "lat": 22.5680, "lng": 88.3550, "driver": "Ramesh Das", "phone": "+91-98301-11001", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1082", "type": "ALS", "lat": 22.5510, "lng": 88.3610, "driver": "Subir Sen", "phone": "+91-98301-11002", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1083", "type": "BLS", "lat": 22.5800, "lng": 88.3700, "driver": "Anil Mondal", "phone": "+91-98301-11003", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1084", "type": "BLS", "lat": 22.5420, "lng": 88.3490, "driver": "Dipak Roy", "phone": "+91-98301-11004", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1085", "type": "ALS", "lat": 22.5620, "lng": 88.3800, "driver": "Bikash Paul", "phone": "+91-98301-11005", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1086", "type": "BLS", "lat": 22.5900, "lng": 88.3600, "driver": "Sunil Saha", "phone": "+91-98301-11006", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1087", "type": "ALS", "lat": 22.5350, "lng": 88.3650, "driver": "Gopal Ghosh", "phone": "+91-98301-11007", "status": "AVAILABLE"},
    {"vehicle_number": "WB-01-AMB-1088", "type": "BLS", "lat": 22.5710, "lng": 88.3900, "driver": "Prabir Banik", "phone": "+91-98301-11008", "status": "AVAILABLE"},
]


class AmbulanceDispatchAgent(BaseAgent):
    agent_name = "Ambulance Dispatch Agent"
    agent_type = "AMBULANCE_DISPATCH"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        inc_lat = float(input_data.get("lat", 22.5726))
        inc_lng = float(input_data.get("lng", 88.3639))
        patient_count = int(input_data.get("casualty_estimate", 15))
        severity = int(input_data.get("severity", 3))
        hospital_allocations = input_data.get("hospital_allocations", [])

        # Number of vehicles required (average 2 patients per ambulance)
        needed_vehicles = min(12, max(2, math.ceil(patient_count / 2.0)))

        fleet = []
        async with await self._get_db_session() as db:
            result = await db.execute(
                select(Ambulance).where(Ambulance.status == AmbulanceStatus.AVAILABLE)
            )
            db_ambs = result.scalars().all()

            if db_ambs:
                for a in db_ambs:
                    fleet.append({
                        "id": str(a.id),
                        "vehicle_number": a.vehicle_number,
                        "type": a.ambulance_type.value if hasattr(a.ambulance_type, 'value') else str(a.ambulance_type),
                        "lat": a.lat,
                        "lng": a.lng,
                        "driver": a.driver_name,
                        "phone": a.driver_phone,
                    })
            else:
                fleet = list(DEFAULT_AMBULANCES)

        # Compute distance to incident for all fleet units
        for amb in fleet:
            amb_coords = (amb["lat"], amb["lng"])
            dist = round(geodesic((inc_lat, inc_lng), amb_coords).km, 2)
            # ETA in minutes (avg 35 km/h urban + 2 min prep)
            eta = max(3, round((dist / 35.0) * 60 + 2))
            amb["distance_to_incident_km"] = dist
            amb["eta_to_incident_minutes"] = eta

        # Sort closest first; prioritize ALS if severity >= 4
        if severity >= 4:
            fleet.sort(key=lambda x: (0 if x["type"] == "ALS" else 1, x["eta_to_incident_minutes"]))
        else:
            fleet.sort(key=lambda x: x["eta_to_incident_minutes"])

        selected_fleet = fleet[:needed_vehicles]

        # Assign vehicles to destination hospitals
        dispatches = []
        hosp_index = 0
        hosp_count = len(hospital_allocations) if hospital_allocations else 1

        for i, amb in enumerate(selected_fleet):
            target_hosp = hospital_allocations[hosp_index % hosp_count] if hospital_allocations else {
                "hospital_name": "SSKM Hospital",
                "lat": 22.5398,
                "lng": 88.3426
            }
            hosp_index += 1

            # Estimate total mission time: vehicle->incident + 5m on scene + incident->hosp
            hosp_coords = (target_hosp.get("lat", 22.5398), target_hosp.get("lng", 88.3426))
            inc_to_hosp_km = round(geodesic((inc_lat, inc_lng), hosp_coords).km, 2)
            inc_to_hosp_eta = max(4, round((inc_to_hosp_km / 35.0) * 60))

            dispatches.append({
                "ambulance_id": amb.get("id", f"AMB-{i+1}"),
                "vehicle_number": amb["vehicle_number"],
                "type": amb["type"],
                "driver": amb.get("driver", "Duty Driver"),
                "phone": amb.get("phone", "+91-108"),
                "current_lat": amb["lat"],
                "current_lng": amb["lng"],
                "eta_to_incident_minutes": amb["eta_to_incident_minutes"],
                "distance_to_incident_km": amb["distance_to_incident_km"],
                "destination_hospital": target_hosp.get("hospital_name", "Designated Emergency Center"),
                "total_cycle_time_minutes": amb["eta_to_incident_minutes"] + 5 + inc_to_hosp_eta,
                "patient_capacity": 2,
                "status": "ASSIGNED_READY_FOR_DEPLOYMENT"
            })

        output = {
            "required_ambulances": needed_vehicles,
            "dispatched_count": len(dispatches),
            "dispatches": dispatches,
            "fastest_eta_minutes": min([d["eta_to_incident_minutes"] for d in dispatches]) if dispatches else 0,
            "average_eta_minutes": round(sum([d["eta_to_incident_minutes"] for d in dispatches]) / len(dispatches), 1) if dispatches else 0
        }

        rec = (
            f"Assigned {len(dispatches)} emergency vehicles ({sum(1 for d in dispatches if d['type'] == 'ALS')} ALS, "
            f"{sum(1 for d in dispatches if d['type'] == 'BLS')} BLS). "
            f"First responder ETA: {output['fastest_eta_minutes']} mins (avg {output['average_eta_minutes']} mins)."
        )

        res = AgentResult(
            status="success",
            output_data=output,
            recommendation=rec,
            confidence=0.95,
            source="ARES-SmartFleetOptimizer",
        )

        async with await self._get_db_session() as db:
            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()

        return res
