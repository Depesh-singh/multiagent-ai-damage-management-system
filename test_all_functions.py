"""
ARES End-to-End System Health & Function Verification Suite
Executes and validates all API routers, database entities, agent workflows, and the n8n pipeline.
"""

import sys
import json
import time
import urllib.request
import urllib.error

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "http://localhost:5000"
N8N_WEBHOOK = "http://localhost:5678/webhook/ares-emergency"

passed = []
failed = []

def req(method, path, body=None, token=None, expected_status=(200, 201)):
    url = f"{BASE_URL}{path}" if path.startswith("/") else path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=15) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            try:
                parsed = json.loads(content)
            except Exception:
                parsed = content
            if status in expected_status:
                passed.append(f"[{method}] {path} -> {status}")
                return True, parsed
            else:
                failed.append(f"[{method}] {path} -> Expected {expected_status}, got {status}: {content[:100]}")
                return False, parsed
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        failed.append(f"[{method}] {path} -> HTTPError {e.code}: {err_msg[:120]}")
        return False, err_msg
    except Exception as e:
        failed.append(f"[{method}] {path} -> Exception: {str(e)[:100]}")
        return False, str(e)


def run_all_tests():
    print("=" * 60)
    print("🚀 Starting ARES Full System Function Verification Suite")
    print("=" * 60)

    # 1. Health Endpoints
    print("\n--- 1. System Health ---")
    req("GET", "/health")
    req("GET", "/api/v1/health")

    # 2. Authentication & Security
    print("\n--- 2. Auth & User RBAC ---")
    test_email = f"officer_{int(time.time())}@ares.gov.in"
    ok, reg = req("POST", "/api/v1/auth/register", {
        "email": test_email,
        "password": "SecurePassword123!",
        "full_name": "Major Arvind Roy",
        "role": "INCIDENT_COMMANDER"
    })
    token = reg.get("access_token") if ok and isinstance(reg, dict) else None

    ok, login_res = req("POST", "/api/v1/auth/login", {
        "email": test_email,
        "password": "SecurePassword123!"
    })
    if not token and ok and isinstance(login_res, dict):
        token = login_res.get("access_token")

    if token:
        req("GET", "/api/v1/auth/me", token=token)

    # 3. Disasters & Incidents
    print("\n--- 3. Disasters & Citizen SOS Incidents ---")
    ok, disaster = req("POST", "/api/v1/incidents/disasters", {
        "name": "Kolkata Seismic Event M6.4",
        "type": "EARTHQUAKE",
        "epicenter_lat": 22.5520,
        "epicenter_lng": 88.3530,
        "radius_km": 4.5,
        "severity": 4,
        "description": "Seismic activity registered along seismic fault line."
    })
    disaster_id = disaster.get("id") if ok and isinstance(disaster, dict) else None

    req("GET", "/api/v1/incidents/disasters")

    ok, incident = req("POST", "/api/v1/incidents/", {
        "disaster_id": disaster_id,
        "location_lat": 22.5535,
        "location_lng": 88.3540,
        "address": "Park Street Crossing, Kolkata",
        "casualty_estimate": 25,
        "description": "Severe building facade collapse, survivors trapped.",
        "source": "CITIZEN_SOS"
    })
    incident_id = incident.get("id") if ok and isinstance(incident, dict) else None

    req("GET", "/api/v1/incidents/")
    if incident_id:
        req("GET", f"/api/v1/incidents/{incident_id}")
        req("PATCH", f"/api/v1/incidents/{incident_id}/status", {
            "status": "TRIAGED",
            "decision_notes": "Triage verified by Incident Commander."
        })
        req("GET", f"/api/v1/incidents/{incident_id}/timeline")
        print("\n--- Triggering 10-Agent AI Response Pipeline ---")
        req("POST", f"/api/v1/incidents/{incident_id}/trigger-response")

    # 4. Hospitals & Critical Care
    print("\n--- 4. Hospitals & Critical Care ---")
    ok, hospitals = req("GET", "/api/v1/hospitals/")
    req("GET", "/api/v1/hospitals/nearby?lat=22.5550&lng=88.3510&radius_km=15")
    
    # Create Hospital
    ok_hosp, new_hosp = req("POST", "/api/v1/hospitals/", {
        "name": "Ruby General Hospital Surge Center",
        "lat": 22.5130,
        "lng": 88.4020,
        "address": "EM Bypass, Kasba, Kolkata",
        "phone": "+91-33-3987-1800",
        "specialties": ["Trauma", "Cardiology", "Burn Unit"]
    })
    if ok_hosp and isinstance(new_hosp, dict):
        hosp_id = new_hosp.get("id")
        req("PATCH", f"/api/v1/hospitals/{hosp_id}/capacity", {
            "available_beds": 45,
            "icu_available": 8,
            "ventilators_available": 6
        })

    # 5. Ambulances & Fleet
    print("\n--- 5. Ambulances & Fleet ---")
    ok, ambulances = req("GET", "/api/v1/ambulances/")
    req("GET", "/api/v1/ambulances/?status=AVAILABLE")

    if ok and isinstance(ambulances, list) and len(ambulances) > 0:
        amb_id = ambulances[0]["id"]
        req("PATCH", f"/api/v1/ambulances/{amb_id}", {
            "status": "AVAILABLE"
        })
        if incident_id:
            req("POST", f"/api/v1/ambulances/{amb_id}/dispatch?incident_id={incident_id}")

    # 6. Rescue Teams & Missions
    print("\n--- 6. Rescue Teams & Missions ---")
    ok, rescue_teams = req("GET", "/api/v1/rescue/teams")
    ok_team, new_team = req("POST", "/api/v1/rescue/teams", {
        "name": "Civil Defense Quick Action Team 4",
        "type": "VOLUNTEER",
        "members_count": 20,
        "skills": ["First Aid", "Debris Clearance", "Traffic Diversion"],
        "lat": 22.5400,
        "lng": 88.3600,
        "contact_phone": "+91-98311-22334"
    })
    if ok_team and isinstance(new_team, dict) and incident_id:
        req("POST", "/api/v1/rescue/missions", {
            "rescue_team_id": new_team["id"],
            "incident_id": incident_id,
            "task_description": "Perimeter safety and survivor extraction at Park Street Site A",
            "priority": "HIGH"
        })
    req("GET", "/api/v1/rescue/missions")

    # 7. Medical Supplies & Logistics
    print("\n--- 7. Medical Supplies & Clinical Scaling ---")
    req("GET", "/api/v1/medical/requirements/EARTHQUAKE?patient_count=40")
    req("GET", "/api/v1/medical/requirements/FLOOD?patient_count=30")
    req("GET", "/api/v1/medical/requirements/FIRE?patient_count=20")
    req("GET", "/api/v1/medical/requirements/CYCLONE?patient_count=50")
    req("GET", "/api/v1/medical/inventory")

    if incident_id and ok and isinstance(hospitals, list) and len(hospitals) > 0:
        req("POST", "/api/v1/medical/requests", {
            "incident_id": incident_id,
            "hospital_id": hospitals[0]["id"],
            "item_name": "Packed Red Blood Cells (O-)",
            "quantity_required": 24
        })
    req("GET", "/api/v1/medical/requests")

    # 8. Communication & ERSS 112
    print("\n--- 8. Communication & Interoperability ---")
    req("GET", "/api/v1/communication/contacts")
    req("GET", "/api/v1/communication/messages")
    req("POST", "/api/v1/communication/broadcast?subject=TACTICAL+ALERT&body=Code+Red+Mobilization")
    ok_msg, msg = req("POST", "/api/v1/communication/messages", {
        "incident_id": incident_id,
        "recipient_agency": "POLICE_100",
        "recipient_name": "Kolkata Traffic HQ",
        "recipient_phone": "100",
        "message_type": "ALERT",
        "subject": "Green Wave Clearance Order",
        "body": "Clear corridors for 6 incoming trauma ambulances.",
        "priority": "CRITICAL"
    })
    if ok_msg and isinstance(msg, dict):
        req("PATCH", f"/api/v1/communication/messages/{msg['id']}/ack")

    # 9. Shelters & Evacuation
    print("\n--- 9. Shelters & Evacuation Network ---")
    req("GET", "/api/v1/shelters/")
    req("GET", "/api/v1/shelters/nearby?lat=22.5550&lng=88.3510")
    req("POST", "/api/v1/shelters/", {
        "name": "Alipore Community Hall Relief Shelter",
        "lat": 22.5310,
        "lng": 88.3320,
        "address": "Belvedere Road, Alipore, Kolkata",
        "capacity": 800,
        "amenities": ["Drinking Water", "First Aid", "Dry Rations"],
        "contact_phone": "+91-33-2479-1122"
    })

    # 10. AI Agents & Human-in-the-Loop Approvals
    print("\n--- 10. AI Agents & Human-in-the-Loop Approvals ---")
    req("GET", "/api/v1/agents/status")
    req("GET", "/api/v1/agents/runs")
    ok, approvals = req("GET", "/api/v1/approvals/")
    if ok and isinstance(approvals, list) and len(approvals) > 0:
        appr_id = approvals[0]["id"]
        req("POST", f"/api/v1/approvals/{appr_id}/decide", {
            "action": "APPROVE",
            "decision_notes": "Authorized by Commander Roy via automated audit suite."
        })

    # 11. Reports & Analytics
    print("\n--- 11. Reports & Analytics ---")
    req("GET", "/api/v1/reports/analytics")
    if incident_id:
        req("GET", f"/api/v1/reports/situation/{incident_id}")

    # 12. Simulation Scenarios
    print("\n--- 12. Simulation Contingency Scenarios ---")
    req("POST", "/api/v1/simulation/what-if", {"scenario_type": "HOSPITAL_SHUTDOWN", "target_entity": "SSKM Hospital"})
    req("POST", "/api/v1/simulation/what-if", {"scenario_type": "ROAD_BLOCKAGE", "target_entity": "AJC Bose Flyover"})
    req("POST", "/api/v1/simulation/what-if", {"scenario_type": "SECONDARY_AFTERSHOCK"})
    req("POST", "/api/v1/simulation/what-if", {"scenario_type": "RESOURCE_SHORTAGE"})
    req("POST", "/api/v1/simulation/demo/earthquake")

    # 13. n8n Multi-Agent Workflow Webhook
    print("\n--- 13. n8n Autonomous Multi-Agent Pipeline ---")
    req("POST", N8N_WEBHOOK, {
        "disaster_type": "EARTHQUAKE",
        "location_name": "Park Street & Esplanade, Kolkata",
        "latitude": 22.5550,
        "longitude": 88.3510,
        "casualty_estimate": 45
    })

    # Summary
    print("\n" + "=" * 60)
    print(f"✅ PASSED ENDPOINTS/FUNCTIONS: {len(passed)}")
    print(f"❌ FAILED ENDPOINTS/FUNCTIONS: {len(failed)}")
    print("=" * 60)
    if failed:
        print("\nFailures:")
        for f in failed:
            print("  - " + f)
        sys.exit(1)
    else:
        print("🎉 ALL FUNCTIONS ARE FULLY OPERATIONAL AND VERIFIED WORKING!")

if __name__ == "__main__":
    run_all_tests()
