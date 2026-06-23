"""
Emergency Contacts & Calling Agent Simulation System
Real Indian emergency service contacts for Kolkata / West Bengal region.
Includes: contact lookup, call simulation, nearest station finders.
"""

from typing import Dict, List, Optional
from datetime import datetime
import random
import math

# ============================================
# EMERGENCY CONTACTS DATABASE
# ============================================

EMERGENCY_CONTACTS: Dict[str, Dict] = {
    "AMBULANCE": {
        "description": "Ambulance & Emergency Medical Services",
        "contacts": [
            {
                "name": "National Ambulance Service (GVK EMRI)",
                "phone": "108",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Free ambulance with BLS/ALS support"
            },
            {
                "name": "Government Ambulance Service",
                "phone": "102",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Govt hospital ambulance, pregnancy & infant transport"
            },
            {
                "name": "Kolkata Municipal Ambulance Service",
                "phone": "+91-33-2286-1212",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata Municipal Corporation area",
                "notes": "KMC operated ambulance fleet"
            },
            {
                "name": "SSKM Hospital Ambulance (PG Hospital)",
                "phone": "+91-33-2223-4567",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata & suburbs",
                "notes": "Government super-specialty hospital ambulance"
            },
            {
                "name": "NRS Medical College Ambulance",
                "phone": "+91-33-2265-3176",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Central Kolkata",
                "notes": "Major government medical college & hospital"
            },
            {
                "name": "Barasat District Hospital Ambulance",
                "phone": "+91-33-2562-2300",
                "type": "landline",
                "available_24x7": True,
                "coverage": "North 24 Parganas district",
                "notes": "District level ambulance service"
            },
        ]
    },

    "FIRE_BRIGADE": {
        "description": "Fire & Rescue Services",
        "contacts": [
            {
                "name": "National Fire Service",
                "phone": "101",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Universal fire emergency number"
            },
            {
                "name": "Kolkata Fire Service Control Room",
                "phone": "+91-33-2252-0111",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata Metropolitan Area",
                "notes": "West Bengal Fire & Emergency Services HQ"
            },
            {
                "name": "Kolkata Fire Service (Alt)",
                "phone": "+91-33-2252-3473",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata Metropolitan Area",
                "notes": "Alternate fire control room line"
            },
            {
                "name": "Central Avenue Fire Station",
                "phone": "+91-33-2236-3050",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Central Kolkata",
                "notes": "One of Kolkata's primary fire stations"
            },
            {
                "name": "Barasat Fire Station",
                "phone": "+91-33-2562-2101",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Barasat & North 24 Parganas",
                "notes": "Sub-divisional fire station"
            },
        ]
    },

    "POLICE": {
        "description": "Police & Law Enforcement",
        "contacts": [
            {
                "name": "Police Emergency",
                "phone": "100",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Universal police emergency number"
            },
            {
                "name": "Emergency Response Support System (ERSS)",
                "phone": "112",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Unified emergency number for police, fire, ambulance"
            },
            {
                "name": "Kolkata Police Control Room",
                "phone": "+91-33-2214-5060",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata Metropolitan Area",
                "notes": "Main Lalbazar police control room"
            },
            {
                "name": "Kolkata Police Control Room (Alt)",
                "phone": "+91-33-2214-3024",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata Metropolitan Area",
                "notes": "Alternate Kolkata Police HQ line"
            },
            {
                "name": "Barasat Police District Control Room",
                "phone": "+91-33-2562-1010",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Barasat sub-division, North 24 Parganas",
                "notes": "District SP office control room"
            },
            {
                "name": "Women Helpline",
                "phone": "1091",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Women in distress helpline"
            },
        ]
    },

    "DISASTER_MANAGEMENT": {
        "description": "Disaster Response & Relief Agencies",
        "contacts": [
            {
                "name": "National Disaster Response Force (NDRF)",
                "phone": "011-24363260",
                "type": "landline",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "NDRF HQ New Delhi – specialized disaster response"
            },
            {
                "name": "NDRF 2nd Battalion Kolkata",
                "phone": "+91-33-2337-2408",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Eastern India",
                "notes": "NDRF battalion stationed at Kolkata for eastern region"
            },
            {
                "name": "State Disaster Response Force (SDRF) West Bengal",
                "phone": "+91-33-2214-4990",
                "type": "landline",
                "available_24x7": True,
                "coverage": "West Bengal state",
                "notes": "WB state-level disaster response team"
            },
            {
                "name": "District Emergency Operations Center (DEOC) North 24 Parganas",
                "phone": "+91-33-2562-3500",
                "type": "landline",
                "available_24x7": True,
                "coverage": "North 24 Parganas district",
                "notes": "District level emergency coordination center"
            },
            {
                "name": "West Bengal State Emergency Operations Center",
                "phone": "+91-33-2214-3526",
                "type": "landline",
                "available_24x7": True,
                "coverage": "West Bengal state",
                "notes": "State EOC under Dept of Disaster Management"
            },
            {
                "name": "NDMA Helpline (National Disaster Management Authority)",
                "phone": "1078",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "National disaster management helpline"
            },
        ]
    },

    "MEDICAL_HELPLINE": {
        "description": "Health Helplines & Medical Assistance",
        "contacts": [
            {
                "name": "Health Helpline (Govt of India)",
                "phone": "104",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Free medical advice, hospital info, ambulance coordination"
            },
            {
                "name": "National Poison Information Centre (AIIMS)",
                "phone": "011-26593677",
                "type": "landline",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "AIIMS New Delhi – poison emergency advice"
            },
            {
                "name": "Poison Control – Kolkata (SSKM Hospital)",
                "phone": "+91-33-2223-2131",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Eastern India",
                "notes": "Toxicology department for poison cases"
            },
            {
                "name": "West Bengal Voluntary Blood Donors Forum",
                "phone": "+91-33-2248-8686",
                "type": "landline",
                "available_24x7": False,
                "coverage": "West Bengal",
                "notes": "Blood bank coordination, 8 AM - 10 PM"
            },
            {
                "name": "Red Cross Blood Bank Kolkata",
                "phone": "+91-33-2248-7280",
                "type": "landline",
                "available_24x7": False,
                "coverage": "Kolkata & suburbs",
                "notes": "Indian Red Cross Society – blood availability"
            },
            {
                "name": "Child Helpline",
                "phone": "1098",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Children in distress – CHILDLINE India Foundation"
            },
        ]
    },

    "GOVERNMENT": {
        "description": "Government Administration & Utilities",
        "contacts": [
            {
                "name": "District Magistrate Office – North 24 Parganas",
                "phone": "+91-33-2562-2550",
                "type": "landline",
                "available_24x7": False,
                "coverage": "North 24 Parganas district",
                "notes": "DM office for district-level disaster coordination"
            },
            {
                "name": "Kolkata Municipal Corporation (KMC) Control Room",
                "phone": "+91-33-2286-1000",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata Municipal Corporation area",
                "notes": "Civic infrastructure, waterlogging, road damage"
            },
            {
                "name": "Barasat Municipality",
                "phone": "+91-33-2562-2035",
                "type": "landline",
                "available_24x7": False,
                "coverage": "Barasat municipal area",
                "notes": "Local civic body"
            },
            {
                "name": "CESC Electricity Emergency (Kolkata)",
                "phone": "+91-33-2225-7535",
                "type": "landline",
                "available_24x7": True,
                "coverage": "Kolkata & Howrah",
                "notes": "Power outage, downed lines, electrocution risk"
            },
            {
                "name": "WBSEDCL Power Emergency (West Bengal)",
                "phone": "1912",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "West Bengal (non-Kolkata)",
                "notes": "State electricity distribution – Barasat, suburbs"
            },
            {
                "name": "Gas Leak Emergency (GAIL)",
                "phone": "1906",
                "type": "toll_free",
                "available_24x7": True,
                "coverage": "All India",
                "notes": "Natural gas pipeline leak emergency"
            },
        ]
    },
}

# ============================================
# DISASTER TYPE → SERVICE PRIORITY MAPPING
# ============================================

DISASTER_TO_SERVICES: Dict[str, List[Dict]] = {
    "FIRE": [
        {"service": "FIRE_BRIGADE",        "priority": "IMMEDIATE"},
        {"service": "AMBULANCE",            "priority": "IMMEDIATE"},
        {"service": "POLICE",               "priority": "HIGH"},
        {"service": "GOVERNMENT",           "priority": "HIGH",    "reason": "Electricity shutoff, road closure"},
        {"service": "MEDICAL_HELPLINE",     "priority": "MEDIUM",  "reason": "Burns treatment guidance"},
        {"service": "DISASTER_MANAGEMENT",  "priority": "MEDIUM",  "reason": "Large-scale fire only"},
    ],
    "FLOOD": [
        {"service": "DISASTER_MANAGEMENT",  "priority": "IMMEDIATE"},
        {"service": "AMBULANCE",            "priority": "IMMEDIATE"},
        {"service": "POLICE",               "priority": "HIGH"},
        {"service": "GOVERNMENT",           "priority": "HIGH",    "reason": "Drainage, waterlogging, relief camps"},
        {"service": "FIRE_BRIGADE",         "priority": "HIGH",    "reason": "Water rescue & pumping ops"},
        {"service": "MEDICAL_HELPLINE",     "priority": "MEDIUM",  "reason": "Waterborne disease advisory"},
    ],
    "EARTHQUAKE": [
        {"service": "DISASTER_MANAGEMENT",  "priority": "IMMEDIATE"},
        {"service": "AMBULANCE",            "priority": "IMMEDIATE"},
        {"service": "FIRE_BRIGADE",         "priority": "IMMEDIATE", "reason": "Search & rescue, structural collapse"},
        {"service": "POLICE",               "priority": "HIGH"},
        {"service": "MEDICAL_HELPLINE",     "priority": "HIGH",    "reason": "Crush syndrome, trauma guidance"},
        {"service": "GOVERNMENT",           "priority": "HIGH",    "reason": "Gas shutoff, building safety"},
    ],
    "ACCIDENT": [
        {"service": "AMBULANCE",            "priority": "IMMEDIATE"},
        {"service": "POLICE",               "priority": "IMMEDIATE"},
        {"service": "FIRE_BRIGADE",         "priority": "HIGH",    "reason": "Vehicle extrication, fuel spill"},
        {"service": "MEDICAL_HELPLINE",     "priority": "MEDIUM",  "reason": "Blood bank, hospital bed availability"},
        {"service": "GOVERNMENT",           "priority": "MEDIUM",  "reason": "Road clearance"},
        {"service": "DISASTER_MANAGEMENT",  "priority": "LOW",     "reason": "Only for mass casualty events"},
    ],
    "CHEMICAL_SPILL": [
        {"service": "FIRE_BRIGADE",         "priority": "IMMEDIATE", "reason": "Hazmat response"},
        {"service": "DISASTER_MANAGEMENT",  "priority": "IMMEDIATE"},
        {"service": "AMBULANCE",            "priority": "IMMEDIATE"},
        {"service": "POLICE",               "priority": "HIGH",    "reason": "Evacuation zone enforcement"},
        {"service": "MEDICAL_HELPLINE",     "priority": "HIGH",    "reason": "Poison control, antidote guidance"},
        {"service": "GOVERNMENT",           "priority": "HIGH",    "reason": "Industrial safety, environmental agency"},
    ],
    "BUILDING_COLLAPSE": [
        {"service": "DISASTER_MANAGEMENT",  "priority": "IMMEDIATE"},
        {"service": "FIRE_BRIGADE",         "priority": "IMMEDIATE", "reason": "Search & rescue"},
        {"service": "AMBULANCE",            "priority": "IMMEDIATE"},
        {"service": "POLICE",               "priority": "HIGH",    "reason": "Crowd control, perimeter security"},
        {"service": "MEDICAL_HELPLINE",     "priority": "HIGH",    "reason": "Crush injury, blood bank"},
        {"service": "GOVERNMENT",           "priority": "HIGH",    "reason": "Structural engineer, utilities shutoff"},
    ],
}

# Priority ordering for sorting
_PRIORITY_ORDER = {"IMMEDIATE": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}

# ============================================
# KOLKATA / BARASAT FIRE STATIONS
# ============================================

KOLKATA_FIRE_STATIONS: List[Dict] = [
    {
        "name": "Central Avenue Fire Station",
        "phone": "+91-33-2236-3050",
        "lat": 22.5726,
        "lng": 88.3639,
        "address": "17 Central Avenue, Kolkata 700012",
        "vehicles": 4,
    },
    {
        "name": "Bowbazar Fire Station",
        "phone": "+91-33-2236-1818",
        "lat": 22.5670,
        "lng": 88.3555,
        "address": "Bowbazar Street, Kolkata 700012",
        "vehicles": 3,
    },
    {
        "name": "Park Street Fire Station",
        "phone": "+91-33-2229-7070",
        "lat": 22.5512,
        "lng": 88.3531,
        "address": "Park Street Area, Kolkata 700016",
        "vehicles": 3,
    },
    {
        "name": "Behala Fire Station",
        "phone": "+91-33-2497-1010",
        "lat": 22.4987,
        "lng": 88.3120,
        "address": "Behala, Kolkata 700034",
        "vehicles": 3,
    },
    {
        "name": "Salt Lake Fire Station",
        "phone": "+91-33-2335-5050",
        "lat": 22.5804,
        "lng": 88.4193,
        "address": "Sector V, Salt Lake City, Kolkata 700091",
        "vehicles": 4,
    },
    {
        "name": "Rajarhat Fire Station",
        "phone": "+91-33-2324-2020",
        "lat": 22.6101,
        "lng": 88.4512,
        "address": "New Town, Rajarhat, Kolkata 700156",
        "vehicles": 3,
    },
    {
        "name": "Howrah Fire Station",
        "phone": "+91-33-2660-1010",
        "lat": 22.5958,
        "lng": 88.3110,
        "address": "Howrah Maidan, Howrah 711101",
        "vehicles": 4,
    },
    {
        "name": "Dum Dum Fire Station",
        "phone": "+91-33-2559-1010",
        "lat": 22.6243,
        "lng": 88.4227,
        "address": "Dum Dum, Kolkata 700028",
        "vehicles": 3,
    },
    {
        "name": "Barasat Fire Station",
        "phone": "+91-33-2562-2101",
        "lat": 22.7230,
        "lng": 88.4813,
        "address": "Barasat, North 24 Parganas 700124",
        "vehicles": 3,
    },
    {
        "name": "Barrackpore Fire Station",
        "phone": "+91-33-2594-1010",
        "lat": 22.7624,
        "lng": 88.3744,
        "address": "Barrackpore, North 24 Parganas 700120",
        "vehicles": 2,
    },
]

# ============================================
# KOLKATA / BARASAT POLICE STATIONS
# ============================================

KOLKATA_POLICE_STATIONS: List[Dict] = [
    {
        "name": "Lalbazar Police HQ",
        "phone": "+91-33-2214-5060",
        "lat": 22.5701,
        "lng": 88.3508,
        "address": "4 Lalbazar Street, Kolkata 700001",
        "jurisdiction": "Kolkata city-wide coordination",
    },
    {
        "name": "Bowbazar Police Station",
        "phone": "+91-33-2236-2255",
        "lat": 22.5658,
        "lng": 88.3555,
        "address": "Bowbazar, Kolkata 700012",
        "jurisdiction": "Bowbazar, Central Kolkata",
    },
    {
        "name": "Park Street Police Station",
        "phone": "+91-33-2229-6310",
        "lat": 22.5524,
        "lng": 88.3543,
        "address": "Park Street, Kolkata 700016",
        "jurisdiction": "Park Street, Shakespeare Sarani",
    },
    {
        "name": "New Market Police Station",
        "phone": "+91-33-2252-3401",
        "lat": 22.5558,
        "lng": 88.3505,
        "address": "New Market Area, Kolkata 700013",
        "jurisdiction": "New Market, Esplanade",
    },
    {
        "name": "Salt Lake Police Station",
        "phone": "+91-33-2335-6690",
        "lat": 22.5790,
        "lng": 88.4175,
        "address": "Sector III, Salt Lake, Kolkata 700098",
        "jurisdiction": "Salt Lake City, Bidhannagar",
    },
    {
        "name": "Rajarhat Police Station",
        "phone": "+91-33-2324-3100",
        "lat": 22.6095,
        "lng": 88.4500,
        "address": "Action Area I, New Town, Kolkata 700156",
        "jurisdiction": "Rajarhat, New Town",
    },
    {
        "name": "Dum Dum Police Station",
        "phone": "+91-33-2559-2205",
        "lat": 22.6240,
        "lng": 88.4215,
        "address": "Dum Dum, Kolkata 700028",
        "jurisdiction": "Dum Dum, Nagerbazar",
    },
    {
        "name": "Behala Police Station",
        "phone": "+91-33-2497-2330",
        "lat": 22.4982,
        "lng": 88.3130,
        "address": "Behala, Kolkata 700034",
        "jurisdiction": "Behala, Parnasree",
    },
    {
        "name": "Barasat Police Station",
        "phone": "+91-33-2562-2177",
        "lat": 22.7235,
        "lng": 88.4808,
        "address": "Barasat Sadar, North 24 Parganas 700124",
        "jurisdiction": "Barasat town & surrounds",
    },
    {
        "name": "Madhyamgram Police Station",
        "phone": "+91-33-2538-1200",
        "lat": 22.6692,
        "lng": 88.4520,
        "address": "Madhyamgram, North 24 Parganas 700129",
        "jurisdiction": "Madhyamgram, Barasat rural",
    },
    {
        "name": "Barrackpore Police Commissionerate",
        "phone": "+91-33-2594-2300",
        "lat": 22.7612,
        "lng": 88.3760,
        "address": "Barrackpore, North 24 Parganas 700120",
        "jurisdiction": "Barrackpore, Titagarh, North suburbs",
    },
]


# ============================================
# CORE FUNCTIONS
# ============================================

def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great-circle distance between two points in kilometres."""
    R = 6371.0  # Earth radius in km
    rlat1, rlng1, rlat2, rlng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = rlat2 - rlat1
    dlng = rlng2 - rlng1
    a = math.sin(dlat / 2) ** 2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_emergency_contacts(disaster_type: str, lat: float, lng: float) -> Dict:
    """
    Return all relevant emergency contacts for a disaster type, sorted by
    service priority.

    Args:
        disaster_type: Type of disaster (FIRE, FLOOD, EARTHQUAKE, ACCIDENT, etc.)
        lat: Latitude of the disaster site.
        lng: Longitude of the disaster site.

    Returns:
        Dictionary containing:
            - disaster_type: Normalised disaster type string
            - location: {lat, lng}
            - services: list of service blocks sorted by priority, each
              containing service name, priority, reason, and full contacts
            - total_contacts: Total number of individual phone entries
    """
    disaster_type = disaster_type.upper()
    service_mapping = DISASTER_TO_SERVICES.get(disaster_type, DISASTER_TO_SERVICES["ACCIDENT"])

    # Sort services by priority
    sorted_services = sorted(service_mapping, key=lambda s: _PRIORITY_ORDER.get(s["priority"], 99))

    services_out: List[Dict] = []
    total_contacts = 0

    for svc in sorted_services:
        category_key = svc["service"]
        category_data = EMERGENCY_CONTACTS.get(category_key, {})
        contacts = category_data.get("contacts", [])
        total_contacts += len(contacts)

        services_out.append({
            "service": category_key,
            "service_label": category_data.get("description", category_key),
            "priority": svc["priority"],
            "reason": svc.get("reason", "Primary response"),
            "contacts": contacts,
        })

    return {
        "disaster_type": disaster_type,
        "location": {"lat": lat, "lng": lng},
        "services": services_out,
        "total_contacts": total_contacts,
    }


def simulate_emergency_calls(
    disaster_type: str,
    lat: float,
    lng: float,
    severity: str = "HIGH",
    patients: int = 1,
) -> List[Dict]:
    """
    Simulate placing emergency calls to every relevant service for a disaster.

    Each call record contains realistic metadata – status, response message,
    estimated response time, and timestamp.  This is a *simulation*; no real
    calls are made.

    Args:
        disaster_type: Type of disaster (FIRE, FLOOD, etc.)
        lat: Latitude of the disaster site.
        lng: Longitude of the disaster site.
        severity: One of LOW, MEDIUM, HIGH, CRITICAL.
        patients: Number of patients / affected persons.

    Returns:
        A list of call-record dicts, one per contact, sorted by priority.
        Each record contains:
            service_name, phone, status, response_message, timestamp,
            priority, estimated_response_time_min
    """
    contacts_data = get_emergency_contacts(disaster_type, lat, lng)
    timestamp_base = datetime.now()

    # Status weights vary by severity
    severity = severity.upper()
    if severity == "CRITICAL":
        status_weights = ["CONNECTED"] * 8 + ["RINGING"] * 2
    elif severity == "HIGH":
        status_weights = ["CONNECTED"] * 7 + ["RINGING"] * 2 + ["QUEUED"]
    elif severity == "MEDIUM":
        status_weights = ["CONNECTED"] * 6 + ["RINGING"] * 3 + ["QUEUED"]
    else:  # LOW
        status_weights = ["CONNECTED"] * 5 + ["RINGING"] * 3 + ["QUEUED"] * 2

    # Pre-built response templates per service category
    _response_templates: Dict[str, List[str]] = {
        "AMBULANCE": [
            "Ambulance dispatched. ETA {eta} minutes to disaster site.",
            "BLS ambulance en route. {patients} patient(s) noted.",
            "Nearest ambulance unit alerted. Standby for arrival.",
        ],
        "FIRE_BRIGADE": [
            "Fire tender dispatched with {vehicles}-vehicle convoy. ETA {eta} min.",
            "Fire crew mobilised. Confirm site access for heavy vehicles.",
            "Hazmat-equipped tender rolling. Clear a 100 m perimeter.",
        ],
        "POLICE": [
            "Patrol cars dispatched. Traffic diversion being set up.",
            "Control room acknowledged. Officers en route, ETA {eta} min.",
            "FIR process initiated. Crowd control team dispatched.",
        ],
        "DISASTER_MANAGEMENT": [
            "NDRF/SDRF team alerted. Deployment in {eta} min.",
            "Emergency operations center activated. Relief materials staged.",
            "Search-and-rescue team mobilised from nearest battalion.",
        ],
        "MEDICAL_HELPLINE": [
            "Medical advisory line connected. Triage guidance available.",
            "Poison control notified. Antidote protocol shared.",
            "Blood bank alerted – {patients} units O-negative reserved.",
        ],
        "GOVERNMENT": [
            "Municipal control room notified. Utilities team on standby.",
            "DM office informed. Inter-agency coordination initiated.",
            "Electricity emergency crew dispatched. ETA {eta} min.",
        ],
    }

    call_records: List[Dict] = []
    call_index = 0

    for svc_block in contacts_data["services"]:
        service_key = svc_block["service"]
        priority = svc_block["priority"]

        # Base ETA varies by priority
        base_eta = {"IMMEDIATE": 8, "HIGH": 15, "MEDIUM": 25, "LOW": 40}.get(priority, 20)

        templates = _response_templates.get(service_key, [
            "Emergency service acknowledged. Response unit mobilised."
        ])

        for contact in svc_block["contacts"]:
            status = random.choice(status_weights)
            eta = base_eta + random.randint(-3, 7)
            eta = max(3, eta)  # floor at 3 minutes

            if status == "QUEUED":
                response_msg = "Call queued. All lines busy – auto-retry in 30 seconds."
                eta += 10
            elif status == "RINGING":
                response_msg = "Ringing… no answer yet. Will retry automatically."
                eta += 5
            else:
                template = random.choice(templates)
                response_msg = template.format(
                    eta=eta,
                    patients=patients,
                    vehicles=random.randint(2, 5),
                )

            call_records.append({
                "service_name": contact["name"],
                "service_category": service_key,
                "phone": contact["phone"],
                "status": status,
                "response_message": response_msg,
                "timestamp": (timestamp_base).strftime("%Y-%m-%dT%H:%M:%S"),
                "priority": priority,
                "estimated_response_time_min": eta,
            })
            call_index += 1

    # Final sort: IMMEDIATE → HIGH → MEDIUM → LOW
    call_records.sort(key=lambda r: _PRIORITY_ORDER.get(r["priority"], 99))
    return call_records


def get_nearest_fire_stations(lat: float, lng: float, limit: int = 5) -> List[Dict]:
    """
    Return the nearest Kolkata-region fire stations sorted by distance.

    Args:
        lat: Latitude of the point of interest.
        lng: Longitude of the point of interest.
        limit: Maximum number of stations to return (default 5).

    Returns:
        List of fire-station dicts, each augmented with ``distance_km``.
    """
    stations = []
    for fs in KOLKATA_FIRE_STATIONS:
        dist = round(_haversine_km(lat, lng, fs["lat"], fs["lng"]), 2)
        stations.append({**fs, "distance_km": dist})

    stations.sort(key=lambda s: s["distance_km"])
    return stations[:limit]


def get_nearest_police_stations(lat: float, lng: float, limit: int = 5) -> List[Dict]:
    """
    Return the nearest Kolkata / Barasat police stations sorted by distance.

    Args:
        lat: Latitude of the point of interest.
        lng: Longitude of the point of interest.
        limit: Maximum number of stations to return (default 5).

    Returns:
        List of police-station dicts, each augmented with ``distance_km``.
    """
    stations = []
    for ps in KOLKATA_POLICE_STATIONS:
        dist = round(_haversine_km(lat, lng, ps["lat"], ps["lng"]), 2)
        stations.append({**ps, "distance_km": dist})

    stations.sort(key=lambda s: s["distance_km"])
    return stations[:limit]


# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    import json as _json

    print("=" * 60)
    print("Emergency Contacts & Calling Agent – Self-Test")
    print("=" * 60)

    test_lat, test_lng = 22.7210, 88.4853  # Barasat area

    # 1. Contacts lookup
    contacts = get_emergency_contacts("FIRE", test_lat, test_lng)
    print(f"\n[FIRE] Total contacts: {contacts['total_contacts']}")
    for svc in contacts["services"]:
        print(f"  {svc['priority']:10s} | {svc['service_label']}")

    # 2. Simulate calls
    print("\n" + "-" * 60)
    calls = simulate_emergency_calls("FIRE", test_lat, test_lng, severity="CRITICAL", patients=6)
    print(f"Simulated {len(calls)} calls:\n")
    for c in calls[:8]:
        print(f"  [{c['priority']:9s}] {c['status']:10s} {c['phone']:22s} {c['service_name']}")
        print(f"             > {c['response_message']}")

    # 3. Nearest fire stations
    print("\n" + "-" * 60)
    fire = get_nearest_fire_stations(test_lat, test_lng)
    print("Nearest fire stations:")
    for fs in fire:
        print(f"  {fs['distance_km']:6.2f} km – {fs['name']} ({fs['phone']})")

    # 4. Nearest police stations
    print("\n" + "-" * 60)
    police = get_nearest_police_stations(test_lat, test_lng)
    print("Nearest police stations:")
    for ps in police:
        print(f"  {ps['distance_km']:6.2f} km – {ps['name']} ({ps['phone']})")
