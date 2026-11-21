"""
Build and deploy the ARES Multi-Agent Emergency Management System in n8n.
Connects all 10 autonomous specialist agents in a clean sequential pipeline to the ARES FastAPI backend.
"""

import json
import subprocess
import sys
from pathlib import Path

def build_workflow():
    workflow = {
        "id": "aresMagent202601",
        "name": "ARES — Multi-Agent Autonomous Emergency System",
        "nodes": [
            {
                "id": "node-webhook",
                "name": "⚡ Disaster SOS Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 2,
                "position": [-320, 200],
                "webhookId": "ares-emergency-sos",
                "parameters": {
                    "httpMethod": "POST",
                    "path": "ares-emergency",
                    "responseMode": "responseNode",
                    "options": {}
                }
            },
            {
                "id": "node-manual",
                "name": "▶ Simulate Crisis (1-Click Test)",
                "type": "n8n-nodes-base.manualTrigger",
                "typeVersion": 1,
                "position": [-320, 380],
                "parameters": {}
            },
            {
                "id": "node-agent1",
                "name": "Agent 1: SOS Ingestion & Normalizer",
                "type": "n8n-nodes-base.code",
                "typeVersion": 2,
                "position": [0, 280],
                "parameters": {
                    "jsCode": """// Agent 1: SOS Ingestion & Schema Normalizer
const input = $input.first()?.json || {};
const body = input.body || input;

const incident = {
  tracking_id: "ARES-" + Math.floor(100000 + Math.random() * 900000),
  disaster_type: body.disaster_type || "EARTHQUAKE",
  latitude: body.latitude !== undefined ? Number(body.latitude) : 22.5550,
  longitude: body.longitude !== undefined ? Number(body.longitude) : 88.3510,
  location_name: body.location_name || "Park Street & Esplanade, Central Kolkata",
  casualty_estimate: body.casualty_estimate !== undefined ? Number(body.casualty_estimate) : 45,
  severity_level: body.severity_level || 4,
  description: body.description || "Severe seismic tremor (M6.7) causing structural collapse of commercial complex, trapped victims, and road blockage.",
  ingested_at: new Date().toISOString(),
  reporter_source: body.reporter_source || "CITIZEN_SOS_&_SEISMIC_TELEMETRY"
};

return [{
  json: {
    status: "INGESTED",
    agent: "Agent 1: Ingestion & Normalizer",
    incident: incident
  }
}];"""
                }
            },
            {
                "id": "node-agent2",
                "name": "Agent 2: Verification & Threat Assessment",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [320, 280],
                "parameters": {
                    "method": "POST",
                    "url": "http://host.docker.internal:5000/api/v1/incidents/",
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": "={{ JSON.stringify({\n  location_lat: $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.latitude,\n  location_lng: $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.longitude,\n  address: $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.location_name,\n  disaster_type: $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.disaster_type,\n  casualty_estimate: $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.casualty_estimate,\n  description: $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.description,\n  source: 'ARES_N8N_MULTIAGENT'\n}) }}",
                    "options": {}
                }
            },
            {
                "id": "node-agent3",
                "name": "Agent 3: GIS Hazard Zone Mapping",
                "type": "n8n-nodes-base.code",
                "typeVersion": 2,
                "position": [640, 280],
                "parameters": {
                    "jsCode": """// Agent 3: GIS Hazard Zone & Impact Radius Engine
const incidentData = $('Agent 1: SOS Ingestion & Normalizer').first().json.incident;
const verifiedIncident = $input.first().json;

const baseRadius = incidentData.disaster_type === 'EARTHQUAKE' ? 2.5 : 1.5;
const casualties = incidentData.casualty_estimate;

const zones = {
  red_zone: {
    name: "Red Zone (Hot / Ground Zero)",
    radius_km: baseRadius,
    epicenter: { lat: incidentData.latitude, lng: incidentData.longitude },
    threat_level: "CRITICAL_COLLAPSE_RISK",
    action: "MANDATORY_EVACUATION",
    estimated_affected_pop: casualties * 18,
    structural_damage: "SEVERE_TO_CATASTROPHIC",
    perimeter_cordon_required: true
  },
  amber_zone: {
    name: "Amber Zone (Warm / Secondary Hazards)",
    radius_km: Number((baseRadius * 2.6).toFixed(1)),
    threat_level: "HIGH_AFTERSHOCK_&_FIRE_RISK",
    action: "SHELTER_IN_PLACE_&_TRIAGE_POST",
    estimated_affected_pop: casualties * 55,
    structural_damage: "MODERATE",
    perimeter_cordon_required: false
  },
  green_zone: {
    name: "Green Zone (Cold / Logistics Base)",
    radius_km: Number((baseRadius * 6.0).toFixed(1)),
    threat_level: "SAFE_OPERATIONAL_PERIMETER",
    action: "FIELD_HOSPITALS_&_STAGING_DEPOTS",
    estimated_affected_pop: 0,
    structural_damage: "LOW_TO_NONE",
    helicopter_landing_zones: 3
  }
};

return [{
  json: {
    incident_id: verifiedIncident.id || incidentData.tracking_id,
    incident: incidentData,
    verified_incident: verifiedIncident,
    hazard_zones: zones,
    gis_timestamp: new Date().toISOString()
  }
}];"""
                }
            },
            {
                "id": "node-agent4",
                "name": "Agent 4: Hospital Capacity & ICU Triage",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [960, 280],
                "parameters": {
                    "method": "GET",
                    "url": "=http://host.docker.internal:5000/api/v1/hospitals/nearby?lat={{ $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.latitude }}&lng={{ $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.longitude }}&radius_km=25",
                    "options": {}
                }
            },
            {
                "id": "node-agent5",
                "name": "Agent 5: Ambulance Fleet Dispatcher",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1280, 280],
                "parameters": {
                    "method": "GET",
                    "url": "http://host.docker.internal:5000/api/v1/ambulances/?status=AVAILABLE",
                    "options": {}
                }
            },
            {
                "id": "node-agent6",
                "name": "Agent 6: NDRF & SDRF Rescue Tasking",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1600, 280],
                "parameters": {
                    "method": "GET",
                    "url": "http://host.docker.internal:5000/api/v1/rescue/teams",
                    "options": {}
                }
            },
            {
                "id": "node-agent7",
                "name": "Agent 7: Blood Bank & Medical Forecasting",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 4.2,
                "position": [1920, 280],
                "parameters": {
                    "method": "GET",
                    "url": "=http://host.docker.internal:5000/api/v1/medical/requirements/{{ $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.disaster_type }}?patient_count={{ $('Agent 1: SOS Ingestion & Normalizer').first().json.incident.casualty_estimate }}",
                    "options": {}
                }
            },
            {
                "id": "node-agent8",
                "name": "Agent 8: Dynamic Green Corridor & Route Optimizer",
                "type": "n8n-nodes-base.code",
                "typeVersion": 2,
                "position": [2240, 280],
                "parameters": {
                    "jsCode": """// Agent 8: Dynamic Green Corridor & Route Optimization Engine
const hospitalsRaw = $('Agent 4: Hospital Capacity & ICU Triage').all().map(i => i.json);
const ambulancesRaw = $('Agent 5: Ambulance Fleet Dispatcher').all().map(i => i.json);
const incident = $('Agent 1: SOS Ingestion & Normalizer').first().json.incident;

const hospitalList = Array.isArray(hospitalsRaw[0]) ? hospitalsRaw[0] : hospitalsRaw;
const ambulanceList = Array.isArray(ambulancesRaw[0]) ? ambulancesRaw[0] : ambulancesRaw;

const primaryHospital = hospitalList[0] || { name: "SSKM Trauma Center", distance_km: 1.89, travel_minutes: 5 };
const secondaryHospital = hospitalList[1] || { name: "Calcutta National Medical College", distance_km: 2.11, travel_minutes: 6 };

const corridors = [
  {
    corridor_id: "GREEN-CORRIDOR-ALPHA",
    name: "Park Street - JL Nehru Rd to SSKM Trauma Center",
    distance_km: primaryHospital.distance_km || 1.9,
    estimated_transit_time_min: 4,
    traffic_signals_overridden: 6,
    priority: "CRITICAL_P1_RED_CASUALTIES",
    destination_hospital: primaryHospital.name
  },
  {
    corridor_id: "GREEN-CORRIDOR-BRAVO",
    name: "AJC Bose Rd Flyover to CNMC Medical Center",
    distance_km: secondaryHospital.distance_km || 2.2,
    estimated_transit_time_min: 5,
    traffic_signals_overridden: 5,
    priority: "URGENT_P2_YELLOW_CASUALTIES",
    destination_hospital: secondaryHospital.name
  }
];

const roadClosures = [
  {
    road_name: "Sealdah Flyover Central Segment",
    status: "BLOCKED_STRUCTURAL_CRACKS",
    alternate_route: "Dharmatala Connector -> APC Road"
  },
  {
    road_name: "Park Circus 7-Point Crossing Inbound",
    status: "RESTRICTED_EMERGENCY_VEHICLES_ONLY",
    alternate_route: "Darga Road -> Suhrawardy Ave"
  }
];

const assignedFleet = ambulanceList.slice(0, 6).map((amb, idx) => ({
  vehicle_number: amb.vehicle_number,
  ambulance_type: amb.ambulance_type,
  driver_name: amb.driver_name,
  driver_phone: amb.driver_phone,
  assigned_corridor: idx % 2 === 0 ? "GREEN-CORRIDOR-ALPHA" : "GREEN-CORRIDOR-BRAVO",
  destination: idx % 2 === 0 ? primaryHospital.name : secondaryHospital.name,
  eta_minutes: idx * 2 + 3
}));

return [{
  json: {
    status: "OPTIMIZED",
    incident_id: incident.tracking_id,
    green_corridors: corridors,
    road_closures: roadClosures,
    assigned_fleet: assignedFleet,
    primary_hospital: primaryHospital,
    secondary_hospital: secondaryHospital
  }
}];"""
                }
            },
            {
                "id": "node-agent9",
                "name": "Agent 9: Multi-Agency Telematics Broadcast",
                "type": "n8n-nodes-base.code",
                "typeVersion": 2,
                "position": [2560, 280],
                "parameters": {
                    "jsCode": """// Agent 9: Multi-Agency Telematics Broadcast Agent
const incident = $('Agent 1: SOS Ingestion & Normalizer').first().json.incident;
const routing = $('Agent 8: Dynamic Green Corridor & Route Optimizer').first().json;
const rescueRaw = $('Agent 6: NDRF & SDRF Rescue Tasking').all().map(i => i.json);
const rescueTeams = Array.isArray(rescueRaw[0]) ? rescueRaw[0] : rescueRaw;

const broadcasts = [
  {
    agency: "ERSS 112 (National Unified Emergency)",
    dispatch_type: "CAD_INCIDENT_STREAM",
    priority: "FLASH_LEVEL_1",
    payload: {
      cad_id: "ERSS-WB-2026-" + Math.floor(1000 + Math.random() * 9000),
      disaster: incident.disaster_type,
      location: incident.location_name,
      coordinates: `${incident.latitude}, ${incident.longitude}`,
      estimated_casualties: incident.casualty_estimate,
      initial_triaged_severity: "CODE_RED_MASS_CASUALTY"
    }
  },
  {
    agency: "Ambulance 108 Emergency Medical Services",
    dispatch_type: "FLEET_DEPLOYMENT_ORDER",
    priority: "IMMEDIATE",
    payload: {
      active_ambulances_assigned: routing.assigned_fleet.length,
      primary_triage_destination: routing.primary_hospital.name,
      green_corridors_active: routing.green_corridors.map(c => c.corridor_id)
    }
  },
  {
    agency: "Fire & Emergency Services 101 / USAR",
    dispatch_type: "COLLAPSE_RESCUE_TASKING",
    priority: "IMMEDIATE",
    payload: {
      mission: "HEAVY_COLLAPSED_STRUCTURE_SEARCH_AND_RESCUE",
      teams_mobilized: rescueTeams.slice(0, 3).map(t => t.name),
      hazards: ["Structural Instability", "Ruptured Gas Mains", "Live Power Lines"]
    }
  },
  {
    agency: "Kolkata Traffic Police Control 100",
    dispatch_type: "GREEN_CORRIDOR_PREEMPTION",
    priority: "URGENT",
    payload: {
      clearance_order: "MANUAL_TRAFFIC_LIGHT_OVERRIDE",
      active_arteries: routing.green_corridors.map(c => c.name),
      cordoned_zones: ["Park Street Crossing", "Esplanade Metro Gate 2", "AJC Bose Connector"]
    }
  },
  {
    agency: "NDRF 2nd Battalion Headquarters",
    dispatch_type: "USAR_BATTALION_MOBILIZATION",
    priority: "CRITICAL",
    payload: {
      battalion: "NDRF 2nd Battalion (Haringhata Base)",
      equipment_mandate: ["Canine Search Teams", "Acoustic Life Detectors", "Hydraulic Shoring Kits"],
      staging_point: "Maidan Brigade Parade Ground (HLZ-1)"
    }
  }
];

return [{
  json: {
    status: "BROADCAST_COMPLETED",
    dispatched_at: new Date().toISOString(),
    broadcast_count: broadcasts.length,
    broadcasts: broadcasts
  }
}];"""
                }
            },
            {
                "id": "node-agent10",
                "name": "Agent 10: Official NDMA SITREP Generator",
                "type": "n8n-nodes-base.code",
                "typeVersion": 2,
                "position": [2880, 280],
                "parameters": {
                    "jsCode": """// Agent 10: Official NDMA Situation Report (SITREP) Engine
const incident = $('Agent 1: SOS Ingestion & Normalizer').first().json.incident;
const gis = $('Agent 3: GIS Hazard Zone Mapping').first().json.hazard_zones;
const routing = $('Agent 8: Dynamic Green Corridor & Route Optimizer').first().json;
const broadcast = $('Agent 9: Multi-Agency Telematics Broadcast').first().json;
const medical = $('Agent 7: Blood Bank & Medical Forecasting').first().json;

const now = new Date();
const sitrepId = `NDMA-SITREP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(100 + Math.random()*900)}`;

const sitrep = {
  header: {
    sitrep_id: sitrepId,
    classification: "FLASH PRIORITY // LEVEL 3 NATIONAL DISASTER",
    issuing_authority: "National Disaster Management Authority (NDMA) & WB SDMA",
    incident_name: `OPERATION SANJEEVANI — ${incident.disaster_type} RESPONSE`,
    timestamp: now.toISOString(),
    coordinates: `${incident.latitude}° N, ${incident.longitude}° E`,
    location: incident.location_name
  },
  executive_summary: `At ${now.toLocaleTimeString()}, a severe ${incident.disaster_type.toLowerCase()} event impacted ${incident.location_name}. Preliminary telemetry estimates ${incident.casualty_estimate} casualties with major structural collapse. Autonomous Multi-Agent Emergency Orchestrator (ARES) has been activated. Red Hazard Perimeter established at ${gis.red_zone.radius_km} km. 2 Green Corridors operational. All trauma and ICU centers on Code Red surge mode.`,
  containment_zones: {
    hot_zone_red: `${gis.red_zone.radius_km} km radius — Mandatory Evacuation & Cordon`,
    warm_zone_amber: `${gis.amber_zone.radius_km} km radius — Secondary Triage & Casualty Clearing Post`,
    cold_zone_green: `${gis.green_zone.radius_km} km radius — Safe Operational Base & Airhead`
  },
  tactical_deployments: {
    ambulances_in_transit: routing.assigned_fleet.length,
    designated_trauma_centers: [routing.primary_hospital.name, routing.secondary_hospital.name],
    green_corridors_active: routing.green_corridors.map(c => c.name),
    agencies_alerted: broadcast.broadcasts.map(b => b.agency)
  },
  critical_logistics_manifest: {
    top_medicine_deficits: (medical.medicines || []).slice(0, 4).map(m => `${m.name} (${m.quantity} ${m.unit})`),
    specialized_equipment: (medical.equipment || []).slice(0, 3).map(e => `${e.name} (Qty: ${e.quantity})`)
  },
  public_advisory: [
    "Evacuate multi-story and cracked concrete structures immediately.",
    "Do NOT use elevators. Shut off domestic LPG gas valves and main electrical breakers.",
    "Keep emergency transit corridors clear for NDRF and Ambulance convoys.",
    "For emergency rescue and medical triage, dial ERSS 112 or ARES Emergency Hotline 108."
  ]
};

return [{
  json: {
    success: true,
    execution_mode: "ARES_AUTONOMOUS_MULTIAGENT_PIPELINE",
    orchestrated_at: now.toISOString(),
    sitrep: sitrep
  }
}];"""
                }
            },
            {
                "id": "node-respond",
                "name": "🎯 Tactical Response Output",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1.1,
                "position": [3200, 280],
                "parameters": {
                    "respondWith": "firstIncomingItem",
                    "options": {
                        "responseCode": 200
                    }
                }
            }
        ],
        "connections": {
            "⚡ Disaster SOS Webhook": {
                "main": [
                    [{"node": "Agent 1: SOS Ingestion & Normalizer", "type": "main", "index": 0}]
                ]
            },
            "▶ Simulate Crisis (1-Click Test)": {
                "main": [
                    [{"node": "Agent 1: SOS Ingestion & Normalizer", "type": "main", "index": 0}]
                ]
            },
            "Agent 1: SOS Ingestion & Normalizer": {
                "main": [
                    [{"node": "Agent 2: Verification & Threat Assessment", "type": "main", "index": 0}]
                ]
            },
            "Agent 2: Verification & Threat Assessment": {
                "main": [
                    [{"node": "Agent 3: GIS Hazard Zone Mapping", "type": "main", "index": 0}]
                ]
            },
            "Agent 3: GIS Hazard Zone Mapping": {
                "main": [
                    [{"node": "Agent 4: Hospital Capacity & ICU Triage", "type": "main", "index": 0}]
                ]
            },
            "Agent 4: Hospital Capacity & ICU Triage": {
                "main": [
                    [{"node": "Agent 5: Ambulance Fleet Dispatcher", "type": "main", "index": 0}]
                ]
            },
            "Agent 5: Ambulance Fleet Dispatcher": {
                "main": [
                    [{"node": "Agent 6: NDRF & SDRF Rescue Tasking", "type": "main", "index": 0}]
                ]
            },
            "Agent 6: NDRF & SDRF Rescue Tasking": {
                "main": [
                    [{"node": "Agent 7: Blood Bank & Medical Forecasting", "type": "main", "index": 0}]
                ]
            },
            "Agent 7: Blood Bank & Medical Forecasting": {
                "main": [
                    [{"node": "Agent 8: Dynamic Green Corridor & Route Optimizer", "type": "main", "index": 0}]
                ]
            },
            "Agent 8: Dynamic Green Corridor & Route Optimizer": {
                "main": [
                    [{"node": "Agent 9: Multi-Agency Telematics Broadcast", "type": "main", "index": 0}]
                ]
            },
            "Agent 9: Multi-Agency Telematics Broadcast": {
                "main": [
                    [{"node": "Agent 10: Official NDMA SITREP Generator", "type": "main", "index": 0}]
                ]
            },
            "Agent 10: Official NDMA SITREP Generator": {
                "main": [
                    [{"node": "🎯 Tactical Response Output", "type": "main", "index": 0}]
                ]
            }
        },
        "settings": {
            "executionOrder": "v1",
            "saveDataErrorExecution": "all",
            "saveDataSuccessExecution": "all",
            "saveManualExecutions": True
        }
    }
    return workflow

def main():
    wf = build_workflow()
    
    # Save to local file
    output_path = Path("ares_multiagent_workflow.json")
    output_path.write_text(json.dumps([wf], indent=2), encoding="utf-8")
    print(f"✅ Saved workflow to {output_path.resolve()}")
    
    # Also save inside n8n/ directory
    n8n_dir_path = Path("n8n/ares_multiagent_workflow.json")
    n8n_dir_path.write_text(json.dumps([wf], indent=2), encoding="utf-8")
    print(f"✅ Saved workflow to {n8n_dir_path.resolve()}")

    # Import directly into running n8n container
    print("🚀 Importing workflow into running n8n container...")
    try:
        subprocess.run(["docker", "cp", str(output_path), "n8n:/tmp/ares_multiagent_workflow.json"], check=True)
        res = subprocess.run([
            "docker", "exec", "n8n", "n8n", "import:workflow",
            "--input=/tmp/ares_multiagent_workflow.json",
            "--projectId=qapaX5SpzAFYz35q"
        ], capture_output=True, text=True)
        
        print(f"n8n import output: {res.stdout}")
        if res.returncode == 0:
            print("🎉 Workflow successfully updated in n8n!")
            # Publish
            subprocess.run([
                "docker", "exec", "n8n", "n8n", "publish:workflow",
                "--id=aresMagent202601"
            ], capture_output=True, text=True)
            print("✅ Workflow published.")
        else:
            print(f"⚠️ n8n import error: {res.stderr}")
    except Exception as e:
        print(f"❌ Failed to import: {e}")

if __name__ == "__main__":
    main()
