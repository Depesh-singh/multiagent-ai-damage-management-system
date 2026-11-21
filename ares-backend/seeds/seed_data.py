"""ARES Database Seeding Script.

Populates initial data for Kolkata disaster management:
- Super Admin, Incident Commander, Hospital Admin users
- 6 Major Tertiary Hospitals with Bed/ICU capacities
- 8 Ambulances (ALS/BLS) with Kolkata GPS coordinates
- 5 Specialized Rescue Formations (NDRF, SDRF, Fire, Police DMG, Civil Defense)
- 3 Large Capacity Shelters
- Default Medical Inventory
"""

import asyncio
import os
import sys
import uuid

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, async_session, engine
from app.core.security import get_password_hash
from app.models.ambulance import Ambulance, AmbulanceStatus, AmbulanceType
from app.models.hospital import Hospital, HospitalCapacity
from app.models.medical import MedicalInventory, Priority
from app.models.rescue import RescueTeam, RescueTeamStatus, RescueTeamType
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import User


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        print("🌱 Seeding ARES database...")

        # 1. Users
        users_data = [
            ("commander@ares.gov.in", "admin123", "Chief Commander R. K. Mukherjee", "INCIDENT_COMMANDER"),
            ("dispatcher@ares.gov.in", "admin123", "Officer P. Sen (Dispatch Controller)", "DISPATCHER"),
            ("hospital@ares.gov.in", "admin123", "Dr. A. Banerjee (Chief Medical Officer)", "HOSPITAL_ADMIN"),
            ("superadmin@ares.gov.in", "admin123", "ARES System Administrator", "SUPER_ADMIN"),
        ]

        for email, pwd, name, role in users_data:
            from sqlalchemy import select
            res = await db.execute(select(User).where(User.email == email))
            if not res.scalar_one_or_none():
                user = User(
                    id=uuid.uuid4(),
                    email=email,
                    hashed_password=get_password_hash(pwd),
                    full_name=name,
                    role=role,
                    is_active=True,
                )
                db.add(user)
        print("✅ Users seeded.")

        # 2. Hospitals
        hospitals_data = [
            ("SSKM Hospital (IPGMER)", 22.5398, 88.3426, "244 AJC Bose Road, Bhowanipore, Kolkata", "+91-33-2223-1589",
             ["Trauma", "Surgery", "Burns", "Neurology", "ICU"], 1800, 240, 95, 18, 50, 12, 180),
            ("Calcutta National Medical College (CNMC)", 22.5447, 88.3683, "32 Gorachand Road, Beniapukur, Kolkata", "+91-33-2284-4834",
             ["Trauma", "Orthopedics", "General Surgery", "Emergency Medicine"], 1200, 160, 60, 14, 35, 8, 120),
            ("NRS Medical College & Hospital", 22.5645, 88.3697, "138 AJC Bose Road, Sealdah, Kolkata", "+91-33-2265-3176",
             ["Trauma", "Neurosurgery", "Cardiology", "Burns", "ICU"], 1400, 190, 75, 16, 40, 10, 150),
            ("RG Kar Medical College & Hospital", 22.6042, 88.3752, "1 Khudiram Bose Sarani, Kolkata", "+91-33-2555-7656",
             ["Trauma", "General Medicine", "Pediatrics", "Emergency Medicine"], 1100, 140, 50, 9, 28, 5, 90),
            ("Medical College Kolkata (Calcutta Medical)", 22.5744, 88.3621, "88 College Street, Bowbazar, Kolkata", "+91-33-2255-1600",
             ["Trauma", "Cardiology", "Critical Care", "Surgery"], 1500, 210, 80, 15, 45, 11, 140),
            ("Apollo Multispeciality Hospitals", 22.5786, 88.4042, "58 Canal Circular Road, Kadapara, Kolkata", "+91-33-2320-3040",
             ["Super-Specialty Trauma", "Cardiac", "Critical Care", "Neurology"], 700, 95, 110, 22, 60, 16, 220),
        ]

        for name, lat, lng, addr, phone, specs, t_beds, a_beds, icu_t, icu_a, vent_t, vent_a, oxy in hospitals_data:
            from sqlalchemy import select
            res = await db.execute(select(Hospital).where(Hospital.name == name))
            if not res.scalar_one_or_none():
                h_id = uuid.uuid4()
                hosp = Hospital(
                    id=h_id,
                    name=name,
                    lat=lat,
                    lng=lng,
                    address=addr,
                    phone=phone,
                    specialties=specs,
                    is_active=True,
                )
                db.add(hosp)
                cap = HospitalCapacity(
                    id=uuid.uuid4(),
                    hospital_id=h_id,
                    total_beds=t_beds,
                    available_beds=a_beds,
                    icu_beds=icu_t,
                    icu_available=icu_a,
                    ventilators=vent_t,
                    ventilators_available=vent_a,
                    oxygen_cylinders=oxy,
                )
                db.add(cap)
        print("✅ Hospitals and Capacities seeded.")

        # 3. Ambulances
        ambulances_data = [
            ("WB-01-AMB-1081", AmbulanceType.ALS, 22.5680, 88.3550, "Ramesh Das", "+91-98301-11001"),
            ("WB-01-AMB-1082", AmbulanceType.ALS, 22.5510, 88.3610, "Subir Sen", "+91-98301-11002"),
            ("WB-01-AMB-1083", AmbulanceType.BLS, 22.5800, 88.3700, "Anil Mondal", "+91-98301-11003"),
            ("WB-01-AMB-1084", AmbulanceType.BLS, 22.5420, 88.3490, "Dipak Roy", "+91-98301-11004"),
            ("WB-01-AMB-1085", AmbulanceType.ALS, 22.5620, 88.3800, "Bikash Paul", "+91-98301-11005"),
            ("WB-01-AMB-1086", AmbulanceType.BLS, 22.5900, 88.3600, "Sunil Saha", "+91-98301-11006"),
            ("WB-01-AMB-1087", AmbulanceType.ALS, 22.5350, 88.3650, "Gopal Ghosh", "+91-98301-11007"),
            ("WB-01-AMB-1088", AmbulanceType.BLS, 22.5710, 88.3900, "Prabir Banik", "+91-98301-11008"),
        ]

        for v_num, a_type, lat, lng, driver, phone in ambulances_data:
            from sqlalchemy import select
            res = await db.execute(select(Ambulance).where(Ambulance.vehicle_number == v_num))
            if not res.scalar_one_or_none():
                amb = Ambulance(
                    id=uuid.uuid4(),
                    vehicle_number=v_num,
                    lat=lat,
                    lng=lng,
                    ambulance_type=a_type,
                    driver_name=driver,
                    driver_phone=phone,
                    capacity=2,
                    status=AmbulanceStatus.AVAILABLE,
                )
                db.add(amb)
        print("✅ Ambulances seeded.")

        # 4. Rescue Teams
        teams_data = [
            ("NDRF 2nd Battalion (USAR Specialist)", RescueTeamType.NDRF, 45, 22.5600, 88.3500,
             ["Collapsed Structure Search & Rescue (CSSR)", "Heavy Extrication", "Canine Detection", "Medical First Response"], "+91-33-2555-1122"),
            ("WB SDRF Emergency Task Force", RescueTeamType.SDRF, 30, 22.5850, 88.3750,
             ["Trench Rescue", "Shoring & Stabilization", "High-Angle Rope Rescue"], "+91-33-2214-5566"),
            ("Kolkata Fire Services - Central Headquarters", RescueTeamType.FIRE, 28, 22.5595, 88.3528,
             ["Fire Suppression", "Thermal Imaging", "Hydraulic Cutters", "Smoke Evacuation"], "+91-33-2252-2222"),
            ("Kolkata Police Disaster Management Group (DMG)", RescueTeamType.POLICE, 35, 22.5710, 88.3530,
             ["Perimeter Cordon", "Crowd Control", "Evacuation Escort", "Traffic Management"], "+91-33-2214-3000"),
            ("Civil Defense Volunteer Corps (Zone South)", RescueTeamType.VOLUNTEER, 50, 22.5350, 88.3500,
             ["Stretcher Bearers", "Shelter Management", "Relief Food/Water Logistics"], "+91-33-2287-9911"),
        ]

        for name, r_type, count, lat, lng, skills, phone in teams_data:
            from sqlalchemy import select
            res = await db.execute(select(RescueTeam).where(RescueTeam.name == name))
            if not res.scalar_one_or_none():
                team = RescueTeam(
                    id=uuid.uuid4(),
                    name=name,
                    type=r_type,
                    members_count=count,
                    lat=lat,
                    lng=lng,
                    skills=skills,
                    contact_phone=phone,
                    status=RescueTeamStatus.AVAILABLE,
                )
                db.add(team)
        print("✅ Rescue Teams seeded.")

        # 5. Shelters
        shelters_data = [
            ("Netaji Indoor Stadium Evacuation Center", 22.5675, 88.3444, "Eden Gardens, Strand Road, Kolkata", 2500, 320,
             ["Drinking Water", "Mobile Medical Clinic", "Sanitation", "Emergency Power", "Cots"], "+91-33-2248-0411"),
            ("Rabindra Sarovar Relief Complex", 22.5120, 88.3580, "Southern Avenue, Kolkata", 1500, 150,
             ["Water Purification", "First Aid", "Food Packets", "Blankets"], "+91-33-2464-1200"),
            ("Salt Lake Stadium (Yuva Bharati) Community Hub", 22.5697, 88.4060, "Sector III, Bidhannagar, Kolkata", 5000, 650,
             ["Multi-tier Shelter", "Surgical First Aid Post", "Helipad Access", "Kitchens"], "+91-33-2335-0810"),
        ]

        for name, lat, lng, addr, cap, occ, amens, phone in shelters_data:
            from sqlalchemy import select
            res = await db.execute(select(Shelter).where(Shelter.name == name))
            if not res.scalar_one_or_none():
                sh = Shelter(
                    id=uuid.uuid4(),
                    name=name,
                    lat=lat,
                    lng=lng,
                    address=addr,
                    capacity=cap,
                    current_occupancy=occ,
                    amenities=amens,
                    contact_phone=phone,
                    status=ShelterStatus.OPEN,
                )
                db.add(sh)
        print("✅ Shelters seeded.")

        await db.commit()
        print("🎉 ARES Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
