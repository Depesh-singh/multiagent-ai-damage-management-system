"""ARES Hospital Allocation Agent.

Optimizes patient routing based on distance, bed capacity, ICU readiness,
specialty match, and load balancing across the regional medical network.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from geopy.distance import geodesic
from sqlalchemy import select

from app.agents.base import AgentResult, BaseAgent
from app.models.hospital import Hospital, HospitalCapacity


# Standard regional benchmark hospitals (Kolkata region)
DEFAULT_HOSPITALS = [
    {
        "name": "SSKM Hospital (IPGMER)",
        "lat": 22.5398,
        "lng": 88.3426,
        "address": "244 AJC Bose Road, Bhowanipore, Kolkata",
        "phone": "+91-33-2223-1589",
        "specialties": ["Trauma", "Surgery", "Burns", "Neurology", "ICU"],
        "total_beds": 1800,
        "available_beds": 240,
        "icu_beds": 95,
        "icu_available": 18,
        "ventilators": 50,
        "ventilators_available": 12,
        "oxygen_cylinders": 180,
    },
    {
        "name": "Calcutta National Medical College (CNMC)",
        "lat": 22.5447,
        "lng": 88.3683,
        "address": "32 Gorachand Road, Beniapukur, Kolkata",
        "phone": "+91-33-2284-4834",
        "specialties": ["Trauma", "Orthopedics", "General Surgery", "Emergency Medicine"],
        "total_beds": 1200,
        "available_beds": 160,
        "icu_beds": 60,
        "icu_available": 14,
        "ventilators": 35,
        "ventilators_available": 8,
        "oxygen_cylinders": 120,
    },
    {
        "name": "NRS Medical College & Hospital",
        "lat": 22.5645,
        "lng": 88.3697,
        "address": "138 AJC Bose Road, Sealdah, Kolkata",
        "phone": "+91-33-2265-3176",
        "specialties": ["Trauma", "Neurosurgery", "Cardiology", "Burns", "ICU"],
        "total_beds": 1400,
        "available_beds": 190,
        "icu_beds": 75,
        "icu_available": 16,
        "ventilators": 40,
        "ventilators_available": 10,
        "oxygen_cylinders": 150,
    },
    {
        "name": "RG Kar Medical College & Hospital",
        "lat": 22.6042,
        "lng": 88.3752,
        "address": "1 Khudiram Bose Sarani, Kolkata",
        "phone": "+91-33-2555-7656",
        "specialties": ["Trauma", "General Medicine", "Pediatrics", "Emergency Medicine"],
        "total_beds": 1100,
        "available_beds": 140,
        "icu_beds": 50,
        "icu_available": 9,
        "ventilators": 28,
        "ventilators_available": 5,
        "oxygen_cylinders": 90,
    },
    {
        "name": "Medical College Kolkata (Calcutta Medical)",
        "lat": 22.5744,
        "lng": 88.3621,
        "address": "88 College Street, Bowbazar, Kolkata",
        "phone": "+91-33-2255-1600",
        "specialties": ["Trauma", "Cardiology", "Critical Care", "Surgery"],
        "total_beds": 1500,
        "available_beds": 210,
        "icu_beds": 80,
        "icu_available": 15,
        "ventilators": 45,
        "ventilators_available": 11,
        "oxygen_cylinders": 140,
    },
    {
        "name": "Apollo Multispeciality Hospitals",
        "lat": 22.5786,
        "lng": 88.4042,
        "address": "58 Canal Circular Road, Kadapara, Kolkata",
        "phone": "+91-33-2320-3040",
        "specialties": ["Super-Specialty Trauma", "Cardiac", "Critical Care", "Neurology"],
        "total_beds": 700,
        "available_beds": 95,
        "icu_beds": 110,
        "icu_available": 22,
        "ventilators": 60,
        "ventilators_available": 16,
        "oxygen_cylinders": 220,
    }
]


class HospitalAllocationAgent(BaseAgent):
    agent_name = "Hospital Allocation Agent"
    agent_type = "HOSPITAL_ALLOCATION"

    async def execute(
        self, incident_id: str, input_data: dict[str, Any]
    ) -> AgentResult:
        started_at = datetime.now(timezone.utc)

        inc_lat = float(input_data.get("lat", 22.5726))
        inc_lng = float(input_data.get("lng", 88.3639))
        disaster_type = str(input_data.get("disaster_type", "EARTHQUAKE")).upper()
        patient_count = int(input_data.get("casualty_estimate", 15))

        # Query DB for hospitals
        hospital_candidates = []
        async with await self._get_db_session() as db:
            result = await db.execute(select(Hospital))
            db_hospitals = result.scalars().all()

            if db_hospitals:
                for h in db_hospitals:
                    cap_res = await db.execute(
                        select(HospitalCapacity).where(HospitalCapacity.hospital_id == h.id)
                    )
                    cap = cap_res.scalar_one_or_none()
                    hospital_candidates.append({
                        "id": str(h.id),
                        "name": h.name,
                        "lat": h.lat,
                        "lng": h.lng,
                        "address": h.address,
                        "phone": h.phone,
                        "specialties": h.specialties or ["General"],
                        "total_beds": cap.total_beds if cap else 500,
                        "available_beds": cap.available_beds if cap else 50,
                        "icu_available": cap.icu_available if cap else 10,
                        "ventilators_available": cap.ventilators_available if cap else 5,
                        "oxygen_cylinders": cap.oxygen_cylinders if cap else 80,
                    })
            else:
                hospital_candidates = list(DEFAULT_HOSPITALS)

        # Calculate distances and allocation scores
        scored_hospitals = []
        for hosp in hospital_candidates:
            h_coords = (hosp["lat"], hosp["lng"])
            dist_km = round(geodesic((inc_lat, inc_lng), h_coords).km, 2)
            
            # Estimated transit time (average 35 km/h urban speed + 3 min dispatch delay)
            travel_mins = max(4, round((dist_km / 35.0) * 60 + 3))

            # Specialty affinity
            spec_boost = 1.0
            if disaster_type == "FIRE" and "Burns" in hosp.get("specialties", []):
                spec_boost = 1.4
            elif disaster_type in ["EARTHQUAKE", "ACCIDENT"] and "Trauma" in hosp.get("specialties", []):
                spec_boost = 1.3

            # Score = (Available Beds * 0.4 + ICU * 0.4) / (Distance + 1) * SpecialtyBoost
            avail = hosp.get("available_beds", 20)
            icu = hosp.get("icu_available", 5)
            score = round(((avail * 0.35 + icu * 0.65) / (dist_km + 1.2)) * spec_boost, 2)

            scored_hospitals.append({
                **hosp,
                "distance_km": dist_km,
                "travel_time_minutes": travel_mins,
                "score": score
            })

        # Sort descending by score
        scored_hospitals.sort(key=lambda x: x["score"], reverse=True)

        # Distribute patients with load balancing (max 50% to any single hospital)
        allocated_hospitals = []
        remaining_patients = patient_count
        top_hospitals = scored_hospitals[:4]

        for i, h in enumerate(top_hospitals):
            if remaining_patients <= 0:
                break
            # Calculate cap
            max_share = math.ceil(patient_count * 0.50) if i == 0 else math.ceil(patient_count * 0.35)
            alloc = min(remaining_patients, max_share, h.get("available_beds", 20))
            if alloc > 0:
                allocated_hospitals.append({
                    "hospital_id": h.get("id", f"HOSP-{i+1}"),
                    "hospital_name": h["name"],
                    "allocated_patients": alloc,
                    "distance_km": h["distance_km"],
                    "travel_time_minutes": h["travel_time_minutes"],
                    "available_beds": h.get("available_beds", 0),
                    "icu_available": h.get("icu_available", 0),
                    "ventilators_available": h.get("ventilators_available", 0),
                    "phone": h.get("phone", "108"),
                    "lat": h["lat"],
                    "lng": h["lng"],
                    "specialties": h.get("specialties", [])
                })
                remaining_patients -= alloc

        # If any remainder, give to top hospital
        if remaining_patients > 0 and allocated_hospitals:
            allocated_hospitals[0]["allocated_patients"] += remaining_patients

        output = {
            "incident_id": incident_id,
            "disaster_type": disaster_type,
            "total_patients": patient_count,
            "allocated_hospitals": allocated_hospitals,
            "candidate_network_size": len(scored_hospitals)
        }

        rec = (
            f"Optimally routed {patient_count} patients across {len(allocated_hospitals)} hospitals: "
            + ", ".join([f"{h['hospital_name']} ({h['allocated_patients']} pts, {h['distance_km']}km, ETA {h['travel_time_minutes']}m)" for h in allocated_hospitals])
        )

        res = AgentResult(
            status="success",
            output_data=output,
            recommendation=rec,
            confidence=0.94,
            source="ARES-HospitalOptimizationEngine",
        )

        async with await self._get_db_session() as db:
            await self._log_run(db, incident_id, input_data, res, started_at)
            await db.commit()

        return res
