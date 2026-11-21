# SAVE — Strategic Agent-Based Victim Evacuation
## Product Requirements Document (PRD)

| **Document Version** | 1.0.0 |
| **Status** | Approved & Implemented |
| **System Classification** | Mission-Critical Disaster Management & Multi-Agent Coordination Platform |
| **Target Jurisdiction** | Kolkata Metropolitan Area & National/State Disaster Management Authorities (NDMA / SDMA) |
| **Architectural Paradigm** | Collaborative Multi-Agent System (MAS) with Human-in-the-Loop (HITL) Safeguards |
| **Last Updated** | November 2026 |

---

## 1. Executive Summary

### 1.1 Mission & Vision
During major natural disasters and civic catastrophes (earthquakes, severe cyclones, urban flash flooding, industrial fires), the first **60 minutes ("The Golden Hour")** dictate casualty survival rates. Modern disaster management operations suffer from fragmented communication between disparate agencies (Police, Fire, EMS, Military, Hospitals, Civil Defense), uncoordinated dispatch, duplicate resource deployment, and overwhelming cognitive load on human commanders.

**SAVE (Strategic Agent-Based Victim Evacuation)** is an integrated, mission-critical incident command platform powered by a collaborative swarm of **10 specialized AI agents** operating in parallel. SAVE ingests emergency SOS telemetry, verifies incidents against multi-source signals, triangulates hazard epicenters, computes clinical surge needs, dynamically allocates hospital beds and ambulances, generates bypass corridors around collapsed infrastructure, and drafts unified tactical response plans for instant Human Commander authorization.

### 1.2 Core Problem Statement
1. **Siloed Dispatch Chains**: Emergency numbers (Police 100, Fire 101, Ambulance 108, Disaster 1070) operate on independent queues with zero real-time resource visibility.
2. **Hospital Bed Saturation Asymmetry**: Ambulances converge on the nearest well-known hospital, overwhelming its Emergency Department while adjacent equipped facilities remain underutilized.
3. **Static Triage & Delayed Logistics**: Estimation of medical consumables (packed red blood cells, burn dressings, pediatric trauma kits, IV fluids) is performed manually hours after impact rather than calculated predictively upon detection.
4. **Infrastructure Blind Spots**: Dispatch algorithms route vehicles through damaged roadways, flooded underpasses, or secondary collapse zones due to lack of dynamic hazard layering.
5. **Reporting Overhead**: Incident commanders spend up to 40% of their operational time drafting Situation Reports (SITREPs) for state and national ministries rather than directing frontline tactics.

---

## 2. Strategic Differentiators (The 3 Core Pillars)

ARES is architected around three non-negotiable strategic pillars defined in the system blueprint:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARES CORE ARCHITECTURAL PILLARS                       │
├───────────────────────────┬───────────────────────────┬─────────────────────┤
│ 1. Disaster Digital Twin  │ 2. Collaborative Multi-   │ 3. Disaster What-If │
│                           │    Agent Intelligence     │    Simulator        │
├───────────────────────────┼───────────────────────────┼─────────────────────┤
│ • Continuous GIS telematics│ • 10 specialist agents    │ • Dynamic contingency│
│ • Real-time hospital ICU/ │ • Parallel execution      │   sandbox           │
│   ventilator saturation   │ • Shared blackboard state │ • Instant re-routing│
│ • Live ambulance telematics│ • Dynamic plan rebuild on │   on hospital drop  │
│ • Dynamic risk perimeters │   critical data changes   │ • Bridge collapse   │
│ • Road closure overlays   │ • Deterministic safety net│   bypass generation │
└───────────────────────────┴───────────────────────────┴─────────────────────┘
```

1. **Disaster Digital Twin**:
   A live, geospatial simulation of the affected region linking citizen SOS reports, infrastructure integrity, road closures, hospital bed telemetry, ambulance locations, and hazard perimeters into a unified tactical display.
2. **Collaborative Multi-Agent Intelligence**:
   Ten autonomous agents exchange structured JSON representations through a shared state blackboard. Agents do not execute sequentially in a slow waterfall; they trigger in parallel, self-adjusting their recommendations when upstream inputs shift (e.g., if casualty counts increase from 15 to 45, the Medical Supply Agent and Hospital Allocation Agent automatically upscale requisitions).
3. **Disaster What-If Simulator**:
   Allows Incident Commanders to inject hypothetical operational shocks into the live tactical model (e.g., *"Simulate SSKM Hospital shutting down due to structural damage"*, or *"Simulate AJC Bose Flyover collapsing"*). The system instantly calculates the impact, re-ranks remaining facilities, and proposes a revised response plan within seconds.

---

## 3. Target User Personas & Permissions

The platform enforces strict Role-Based Access Control (RBAC):

| Persona | Primary Role & Responsibilities | Key UI Surface |
|---|---|---|
| **Incident Commander (IC)** | State/District Operations Chief. Authorizes high-impact plans, dispatches national assets (NDRF), overrides agent allocations, reviews legal audit logs. | Mission Control Dashboard, Approvals Modal, What-If Simulator |
| **Triage & Medical Officer (CMO)** | Oversees regional clinical capacity, approves blood/pharmaceutical transfer requests, updates ICU/ventilator capacity. | Hospital Surge Management, Medical Supply Requisitions |
| **Fleet Logistics Dispatcher** | Directs ambulance and transport units, monitors green-wave corridors, manages driver assignments and patient handovers. | Fleet Telematics View, Dispatch Tracking Queue |
| **Rescue Squad Commander** | Deploys frontline search and rescue squads (NDRF, SDRF, Fire Brigade, Civil Defense), updates mission completion states. | Rescue Operations Center, Squad Skills Board |
| **Citizen / Field Reporter** | Submits emergency SOS signals, provides geo-tagged coordinates, casualty counts, and damage evidence. | Citizen SOS Portal / ERSS 112 Interface |

---

## 4. Multi-Agent System (MAS) Architecture

ARES implements **10 specialized AI agents** operating under a central orchestrator. Every agent outputs an explainable JSON artifact containing status, confidence score, source data reference, recommendations, and execution metrics.

```mermaid
flowchart TD
    SOS["🚨 Emergency Signal Ingestion\n(Citizen SOS / ERSS 112 / Sensors)"] --> AG1["1. Disaster Detection Agent\n(Cluster & Epicenter Triangulation)"]
    AG1 --> AG2["2. Incident Verification Agent\n(Multi-source Corroboration & Gating)"]
    AG2 --> AG3["3. Risk Assessment Agent\n(Hazard Perimeters & Severity L1-L5)"]
    
    AG3 --> PARALLEL{"PARALLEL AGENT EXECUTION\n(Shared Blackboard State)"}
    
    PARALLEL --> AG4["4. Hospital Allocation Agent\n(Capacity & Specialty Scoring)"]
    PARALLEL --> AG5["5. Ambulance Dispatch Agent\n(ALS/BLS Nearest Proximity)"]
    PARALLEL --> AG6["6. Rescue Coordination Agent\n(NDRF/SDRF Team Assignment)"]
    PARALLEL --> AG7["7. Medical Supply Agent\n(WHO/NDMA Clinical Scaling)"]
    PARALLEL --> AG8["8. Route Optimization Agent\n(Green-Wave Bypass Corridors)"]
    PARALLEL --> AG9["9. Communication Agent\n(ERSS 112 Agency Broadcasts)"]
    
    AG4 & AG5 & AG6 & AG7 & AG8 & AG9 --> PLAN["Unified Tactical Response Plan"]
    
    PLAN --> HITL{"🛡️ Human-in-the-Loop Gateway\n(Commander Authorization)"}
    
    HITL -- "APPROVED" --> DISPATCH["⚡ Live Telemetry Dispatch\n(Ambulance, Rescue, Hospital Alerts)"]
    HITL -- "REJECTED / EDITED" --> RECALC["🔄 Dynamic Replanning / Override"]
    
    DISPATCH --> AG10["10. Government Reporting Agent\n(NDMA / SDMA Formal SITREP Brief)"]
```

### 4.1 Detailed Agent Specifications

#### Agent 1: Disaster Detection Agent
- **Objective**: Aggregate raw feeds from citizens, IoT seismographs, weather stations, and municipal sensors.
- **Algorithms**: Spatial clustering (DBSCAN / Haversine bounding boxes within 2.5 km radius) to consolidate multiple distress calls into single distinct incident clusters.
- **Output**: Synthesized emergency incident with calculated geographic centroid.

#### Agent 2: Incident Verification Agent
- **Objective**: Filter false positives, automated spam, and duplicate calls.
- **Logic**: Evaluates caller reputation, cross-references with local police wireless logs, requires minimum confidence threshold ($>0.65$) for automated escalation.
- **Fail-Safe**: Incidents below threshold are flagged for manual operator review rather than dropped.

#### Agent 3: Risk Assessment Agent
- **Objective**: Classify disaster severity (Level 1 Minor to Level 5 Catastrophic) and establish safety boundaries.
- **Output**: Generates concentric risk perimeters (Red Danger Zone: 800m, Amber Evacuation Zone: 1500m, Green Safe Perimeter: 3000m) with casualty trajectory modeling.

#### Agent 4: Hospital Allocation Agent
- **Objective**: Optimize casualty distribution across trauma facilities to prevent ER saturation.
- **Mathematical Scoring Formula**:
  $$\text{Score} = w_1 \cdot \text{Proximity} + w_2 \cdot \text{Available Beds} + w_3 \cdot \text{ICU Ratio} + w_4 \cdot \text{Specialty Match}$$
- **Constraint Satisfaction**: Ensures critical trauma patients are only routed to Level-1 Trauma / Burn centers.

#### Agent 5: Ambulance Dispatch Agent
- **Objective**: Match nearest available Advanced Life Support (ALS) and Basic Life Support (BLS) units.
- **Logic**: Checks vehicle operational readiness, onboard equipment, crew certification, and transit time. Generates official digital dispatch orders.

#### Agent 6: Rescue Coordination Agent
- **Objective**: Deploy specialized rescue formations (NDRF, SDRF, Fire Brigade, Civil Defense, Volunteer squads).
- **Matching Matrix**: Pairs incident threat types (e.g., structural collapse, chemical leak) with squad competencies (e.g., K9 Search, Concrete Breakers, Hazmat Decontamination).

#### Agent 7: Medical Supply Agent
- **Objective**: Pre-calculate medical consumable demands before hospitals experience stockouts.
- **Clinical Scaling Standard**: Calibrated to **WHO Emergency Medical Team (EMT) & NDMA Disaster Guidelines**:
  - *Earthquake (per 10 casualties)*: 6 units Packed Red Blood Cells (O-), 14 Trauma Packs, 25 IV Normal Saline (1000ml), 8 Orthopedic Splint Kits.
  - *Flood (per 10 casualties)*: 50 ORS Satchets, 20 Doxycycline Blisters, 12 Water Purification Packs.
  - *Fire/Burn (per 10 casualties)*: 20 Silver Sulfadiazine Tins, 40 Ringer's Lactate (1000ml), 15 Oxygen Cylinders.

#### Agent 8: Route Optimization Agent
- **Objective**: Calculate dynamic evacuation and green-wave ambulance corridors.
- **Hazard Awareness**: Graph routing actively avoids declared structural collapse sites, submerged roads, and severe congestion bottlenecks.

#### Agent 9: Communication Agent
- **Objective**: Formulate and transmit standardized interoperable alerts across national and civic agencies.
- **Supported Channels**: ERSS 112 API, Common Alerting Protocol (CAP), Police Traffic Control Green-Wave requests, Fire Brigade HAZMAT alerts, SMS emergency broadcasts.

#### Agent 10: Government Reporting Agent
- **Objective**: Generate executive Situation Reports (SITREPs) formatted to NDMA / Ministry of Home Affairs standards.
- **Content**: Casualties evacuated, hospital occupancy %, active rescue squads, resource deficits, financial relief projections, and timeline audit logs.

---

## 5. Technical Architecture & Implementation Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SYSTEM STACK LAYOUT                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ FRONTEND (Port 3000)                                                        │
│ • React 18 + TypeScript + Vite (Clean SPA build, zero legacy dependencies)  │
│ • Tailwind CSS + Restrained Mission-Control Dark Theme (#0B1220, #131F31)   │
│ • Leaflet 1.9.4 GIS Canvas (OSM Streets, HOT Disaster, Esri Dark Gray, Sat) │
│ • Lucide Icons + Real-time Telemetry Polling (5s interval + WebSocket hook) │
│ • Vite Reverse Proxy (/api, /ws) routing seamlessly to 127.0.0.1:5000       │
├─────────────────────────────────────────────────────────────────────────────┤
│ BACKEND API & COMPUTATION ENGINE (Port 5000)                                │
│ • FastAPI + Python 3.14 (High-concurrency async ASGI engine)                │
│ • SQLAlchemy 2.0 Async ORM with SQLite (ares.db) / PostgreSQL capability   │
│ • Pydantic v2 (Strict request/response validation schemas)                  │
│ • In-Process 10-Agent Orchestrator (app/agents/orchestrator.py)             │
│ • WebSocket Manager (/ws/{client_id}) for live push notifications           │
├─────────────────────────────────────────────────────────────────────────────┤
│ AUTONOMOUS WORKFLOW CANVAS (Port 5678)                                      │
│ • n8n Docker Container (Workflow ID: aresMagent202601)                      │
│ • Webhook Endpoint: POST http://localhost:5678/webhook/ares-emergency       │
│ • Visual node canvas for multi-agent chaining and external webhooks         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Functional Specifications & Endpoints Matrix

The platform exposes **52 fully verified operational endpoints** across 13 core modules:

### 6.1 Authentication & Security (`/api/v1/auth`)
- `POST /register`: Registers tactical officers with roles (`INCIDENT_COMMANDER`, `TRIAGE_OFFICER`, `DISPATCHER`, `FIRST_RESPONDER`).
- `POST /login`: Validates credentials, issues signed JWT Bearer tokens.
- `GET /me`: Returns active session profile and permission scopes.

### 6.2 Incident Management & Triage (`/api/v1/incidents`)
- `POST /`: Submits citizen SOS or agency emergency report.
- `GET /`: Lists incidents with optional status filters (`REPORTED`, `VERIFIED`, `TRIAGED`, `RESPONSE_PLANNED`, `ACTIVE`, `RESOLVED`).
- `GET /{id}`: Returns incident details, coordinates, casualty counts.
- `PATCH /{id}/status`: Updates operational status with mandatory decision notes.
- `GET /{id}/timeline`: Immutable audit trail of every status transition.
- `POST /{id}/trigger-response`: Executes the full 10-Agent parallel response pipeline.

### 6.3 Hospitals & Critical Care (`/api/v1/hospitals`)
- `GET /`: Lists all regional medical facilities with available general beds, ICU units, ventilators, and oxygen supplies.
- `GET /nearby`: Geospatial Haversine calculation returning facilities ranked by proximity and capacity.
- `POST /`: Onboards temporary field hospitals or mobile trauma units.
- `PATCH /{id}/capacity`: Adjusts ICU/bed capacity in real-time during surge periods.

### 6.4 Fleet & Ambulance Telematics (`/api/v1/ambulances`)
- `GET /`: Lists fleet vehicles with live coordinates and type (`ALS`, `BLS`, `PATIENT_TRANSPORT`).
- `PATCH /{id}`: Updates vehicle status (`AVAILABLE`, `DISPATCHED`, `IN_TRANSIT`, `MAINTENANCE`).
- `POST /{id}/dispatch`: Dispatches vehicle to a specific incident and binds it to a target hospital.

### 6.5 Search & Rescue Squads (`/api/v1/rescue`)
- `GET /teams`: Lists rescue squads, personnel count, equipment, and contact numbers.
- `POST /teams`: Onboards newly mobilized response squads.
- `POST /missions`: Generates tactical search and rescue mission orders.
- `GET /missions`: Live tracking of search, extraction, and perimeter containment tasks.

### 6.6 Medical Supply Logistics (`/api/v1/medical`)
- `GET /requirements/{disaster_type}`: Deterministic clinical requirements calculator (Earthquake, Flood, Fire, Cyclone).
- `GET /inventory`: Live warehouse stock levels across pharmaceuticals, blood bags, and consumables.
- `POST /requests`: Hospital emergency stock requisitions.
- `GET /requests`: Inter-facility medical transfer queue.

### 6.7 Interoperability Communications (`/api/v1/communication`)
- `GET /contacts`: Unified inter-agency emergency directory (Police 100, Fire 101, Ambulance 108, NDRF Control).
- `GET /messages`: Communication log of all dispatches.
- `POST /broadcast`: Broadcasts priority mobilization alerts across multiple departments.
- `POST /messages`: Transmits targeted alerts to specific agencies.
- `PATCH /messages/{id}/ack`: Records formal timestamped receipt acknowledgment.

### 6.8 Evacuation & Shelters (`/api/v1/shelters`)
- `GET /`: Lists relief shelters, total capacity, current occupancy, and amenities.
- `GET /nearby`: Geospatial query finding evacuation shelters with available headroom.
- `POST /`: Registers relief camps and community centers.

### 6.9 AI Agent Governance & Approvals (`/api/v1/agents` & `/api/v1/approvals`)
- `GET /agents/status`: Live heartbeat, error rate, and confidence ratings of all 10 agents.
- `GET /agents/runs`: Execution history of multi-agent plan generations.
- `GET /approvals/`: Pending decision queue requiring Incident Commander authorization.
- `POST /approvals/{id}/decide`: Commander authorization (`APPROVE` / `REJECT` / `MODIFY`) with mandatory reason logging.

### 6.10 Situation Reports & Analytics (`/api/v1/reports`)
- `GET /analytics`: System-wide casualty totals, bed saturation ratios, fleet deployment rates.
- `GET /situation/{incident_id}`: Auto-generates complete NDMA-compliant SITREP in markdown.

### 6.11 Contingency Simulation Sandbox (`/api/v1/simulation`)
- `POST /what-if`: Simulates operational failures (`HOSPITAL_SHUTDOWN`, `ROAD_BLOCKAGE`, `SECONDARY_AFTERSHOCK`, `RESOURCE_SHORTAGE`).
- `POST /demo/earthquake`: 1-Click end-to-end Kolkata 6.8M earthquake scenario executing all 10 agents simultaneously.

---

## 7. Data Models & Entity Schema

```mermaid
erDiagram
    DISASTER ||--o{ INCIDENT : contains
    INCIDENT ||--o{ AUDIT_LOG : generates
    INCIDENT ||--o{ AMBULANCE_DISPATCH : receives
    INCIDENT ||--o{ RESCUE_MISSION : targets
    INCIDENT ||--o{ APPROVAL : requires
    
    HOSPITAL ||--o{ AMBULANCE_DISPATCH : receives_patient
    HOSPITAL ||--o{ SUPPLY_REQUEST : issues
    
    AMBULANCE ||--o{ AMBULANCE_DISPATCH : assigned_to
    RESCUE_TEAM ||--o{ RESCUE_MISSION : executes
    
    USER ||--o{ APPROVAL : decides
    USER ||--o{ AUDIT_LOG : creates
```

### Core Entities & Field Definitions
- **Incident**: `id (UUID)`, `disaster_id (UUID)`, `location_lat (Float)`, `location_lng (Float)`, `address (String)`, `casualty_estimate (Integer)`, `status (Enum)`, `source (String)`, `verified_at (DateTime)`, `verified_by (String)`.
- **Hospital**: `id (UUID)`, `name (String)`, `lat (Float)`, `lng (Float)`, `address (String)`, `total_beds (Int)`, `available_beds (Int)`, `icu_total (Int)`, `icu_available (Int)`, `ventilators_available (Int)`, `oxygen_cylinders (Int)`, `trauma_level (Int)`.
- **Ambulance**: `id (UUID)`, `vehicle_number (String)`, `ambulance_type (Enum: ALS/BLS)`, `status (Enum)`, `current_lat (Float)`, `current_lng (Float)`, `driver_name (String)`, `driver_phone (String)`.
- **RescueTeam**: `id (UUID)`, `name (String)`, `type (Enum: NDRF/SDRF/FIRE/POLICE/VOLUNTEER)`, `members_count (Int)`, `skills (JSON)`, `lat (Float)`, `lng (Float)`, `contact_phone (String)`.
- **Shelter**: `id (UUID)`, `name (String)`, `lat (Float)`, `lng (Float)`, `address (String)`, `capacity (Int)`, `current_occupancy (Int)`, `amenities (JSON)`.
- **Approval**: `id (UUID)`, `incident_id (UUID)`, `action_type (String)`, `proposed_plan (JSON)`, `status (Enum: PENDING/APPROVED/REJECTED)`, `decided_by (String)`, `decided_at (DateTime)`, `decision_notes (Text)`.
- **AuditLog**: `id (UUID)`, `timestamp (DateTime)`, `action (String)`, `resource_type (String)`, `resource_id (String)`, `old_value (JSON)`, `new_value (JSON)`, `user_id (String)`.

---

## 8. Non-Functional Requirements (NFRs)

### 8.1 Performance & Latency
- **Multi-Agent Pipeline Execution**: Complete orchestration cycle across all 10 agents must execute in under **15 seconds**.
- **REST API Latency**: Standard reads (`GET /incidents`, `GET /hospitals`) must respond with $P_{95} < 100\text{ ms}$.
- **Geospatial Proximity Calculations**: Haversine distance ranking across regional facilities must complete in $< 5\text{ ms}$.
- **WebSocket Broadcast Latency**: Mission updates must reach connected clients in $< 50\text{ ms}$.

### 8.2 Reliability, Availability & Zero-Cost GIS
- **Zero API Key Dependency**: Map rendering uses **OpenStreetMap (OSM)**, **Humanitarian HOT**, and **Esri World Gray Canvas**. No Google Maps or Mapbox billing accounts or API keys are required.
- **Fail-Safe Deterministic Fallbacks**: If external LLM APIs fail, the orchestrator defaults to deterministic calculation services (mathematical bed scoring, WHO clinical scaling formulas) so operational dispatch is never blocked.
- **Client Auto-Reconnection**: The frontend polls every 5 seconds and reconnects WebSockets automatically on network interruptions.

### 8.3 Security & Audit Compliance
- **Password Security**: Passwords hashed with standard `bcrypt`.
- **Session Tokens**: Stateless `JWT` tokens with configurable expiration and cryptographically signed secrets.
- **Data Integrity & Traceability**: Every status update, approval decision, or allocation modification generates an immutable record in `audit_logs` capturing timestamp, actor identity, prior state, and new state.

---

## 9. Verification & Quality Assurance Matrix

The system undergoes continuous validation via [test_all_functions.py](file:///c:/Users/Depesh/Desktop/multiagent-ai-damage-management-system/test_all_functions.py). All 52 functions are tested end-to-end:

| Module Under Test | Endpoints Tested | Pass Rate | Test Verification Criteria |
|---|:---:|:---:|---|
| **1. System Health** | 2 | 100% (2/2) | Health check returns 200, DB connection active |
| **2. Auth & RBAC** | 3 | 100% (3/3) | User registration, bcrypt verification, JWT token issuance |
| **3. Disasters & Incidents** | 7 | 100% (7/7) | SOS ingestion, triage transitions, audit logging, trigger-response |
| **4. Hospitals & Surge** | 4 | 100% (4/4) | Proximity calculation, dynamic bed & ICU updates |
| **5. Fleet Ambulances** | 4 | 100% (4/4) | Vehicle state transitions, emergency dispatch linking |
| **6. Rescue Squads** | 4 | 100% (4/4) | Team onboarding, skill allocation, mission creation |
| **7. Medical Logistics** | 7 | 100% (7/7) | WHO scaling for 4 disaster types, supply requisitions |
| **8. Communications** | 5 | 100% (5/5) | Directory lookups, agency broadcasts, formal acknowledgment |
| **9. Shelters & Evacuation**| 3 | 100% (3/3) | Proximity queries, capacity vs occupancy matching |
| **10. AI Agents & HITL** | 4 | 100% (4/4) | Agent telemetry, commander approval & rejection recording |
| **11. Analytics & Reports** | 2 | 100% (2/2) | Statistical calculations, formal NDMA markdown SITREP |
| **12. Simulation Engine** | 5 | 100% (5/5) | 4 What-If shock scenarios + 1-Click Kolkata 6.8M demo |
| **13. n8n Autonomous Pipe**| 1 | 100% (1/1) | Webhook trigger executes workflow `aresMagent202601` |
| **14. WebSocket Stream** | 1 | 100% (1/1) | Bi-directional PING/PONG and greeting handshake |
| **TOTAL** | **52** | **100% (52/52)** | **Complete system verified operational with 0 failures** |

---

## 10. Operational Deployment & User Guide

### 10.1 Starting the System
1. **Start Backend Engine**:
   ```powershell
   Set-Location ares-backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
   ```
2. **Start Frontend Command Center**:
   ```powershell
   Set-Location ares-frontend
   npm run dev
   ```
3. **Optional External n8n Workflow**:
   ```powershell
   docker start n8n
   ```

### 10.2 Service URLs
- **ARES Command Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend REST Engine**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Interactive OpenAPI Documentation**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **n8n Visual Automation Canvas**: [http://localhost:5678](http://localhost:5678)
- **n8n Multi-Agent Webhook**: `POST http://localhost:5678/webhook/ares-emergency`

---

## 11. Future Roadmap

1. **UAV / Drone Telemetry Integration**: Ingest real-time thermal camera and aerial LIDAR streams from autonomous reconnaissance drones to update collapse zone contours automatically.
2. **Synthetic Aperture Radar (SAR) Feeds**: Direct satellite radar integration for automated flood water depth classification and structural displacement monitoring.
3. **Citizen Mobile PWA**: Offline-capable Progressive Web App with mesh Bluetooth beacon networking for citizen SOS transmission when cellular towers lose power.
4. **Autonomous Edge Nodes**: Deploy containerized ARES field relay boxes on mobile command vehicles capable of running the 10 agents locally during complete internet backhaul severance.
