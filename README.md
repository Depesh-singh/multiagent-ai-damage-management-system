# 🚨 ARES: Autonomous Response & Emergency System
**Next-Generation Multi-Agent AI Disaster Management & Tactical Emergency Coordination Platform**

ARES is an enterprise-grade, real-time emergency operations command system designed to coordinate multi-agency disaster response with sub-second latency. Powered by a 10-agent autonomous orchestration pipeline, ARES synchronizes triage, hospital bed allocation, ambulance dispatch, search and rescue deployments, route optimization, medical supply requisitions, and statutory government SITREPs—all governed by deterministic mathematical safeguards and a statutory Human Commander Authorization Gate.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ARES SYSTEM ARCHITECTURE                             │
└────────────────────────────────────────────────────────────────────────────────────────┘

    [Citizen SOS / ERSS 112 / Sensor Telemetry / n8n Multi-Agent Webhooks]
                                      │
                                      ▼
    ┌────────────────────────────────────────────────────────────────────────────────┐
    │                       ARES BACKEND (FastAPI + Async Python)                    │
    │  • Async REST API (/api/v1)              • WebSocket Broadcast Engine (/ws)    │
    │  • Canonical SQLite DB (ares-backend/ares.db) • Telemetry & Event Pub/Sub       │
    └──────────────────────┬──────────────────────────────────┬──────────────────────┘
                           │                                  │
                           ▼                                  ▼
    ┌──────────────────────────────────────────────┐   ┌─────────────────────────────┐
    │          MULTI-AGENT ORCHESTRATION PIPELINE  │   │     REACT 18 OPERATIONS UI  │
    │  STAGE 1: SEQUENTIAL INGESTION & ASSESSMENT  │   │  • Command Dashboard        │
    │   01. Disaster Detection Agent               │   │  • Live GIS Map (Leaflet)   │
    │   02. Incident Verification Agent            │   │  • Dedicated Incidents View │
    │   03. Risk Assessment Agent                  │   │  • Dedicated Approvals Inbox│
    │   04. Hospital Allocation Agent              │   │  • Fleet Dispatch Controls  │
    │                                              │   │  • Hospital Bed Management  │
    │  STAGE 2: CONCURRENT SPECIALIST FAN-OUT      │   │  • Medical Inventory Stock  │
    │   05. Ambulance Dispatch Agent               │   │  • ERSS 112 Communications  │
    │   06. Rescue Coordination Agent              │   │  • AI Agent Control Room    │
    │   07. Medical Supply Agent                   │   │  • What-If Simulator        │
    │   08. Route Optimization Agent               │   │  • NDMA Situation Reports   │
    │   09. Agency Communication Agent             │   └─────────────────────────────┘
    │                                              │
    │  STAGE 3: STATUTORY SAFEGUARD & REPORTING    │
    │   🛡️ Human Commander Approval Gate           │
    │   10. Government Reporting Agent (SITREP)    │
    └──────────────────────────────────────────────┘
```

---

## 🤖 10 Autonomous Specialist Agents

| # | Agent Name | Pipeline Stage | Execution Method | Core Responsibilities |
|---|---|---|---|---|
| **01** | **Disaster Detection Agent** | Stage 1 (Sequential) | Hybrid (Rules + AI) | Incident classification, sensor fusion, spatial deduplication screening, severity indexing. |
| **02** | **Incident Verification Agent** | Stage 1 (Sequential) | Agentic AI | Cross-reference corroboration & credibility scoring across telemetry and citizen reports. |
| **03** | **Risk Assessment Agent** | Stage 1 (Sequential) | Deterministic Math | Generates 3-tier concentric risk zones (Danger, Evacuation, Safe) and population-at-risk envelopes. |
| **04** | **Hospital Allocation Agent** | Stage 1 (Sequential) | Deterministic Math | Matches triage requirements against real ICU/bed capacities and minimizes Haversine transit time. |
| **05** | **Ambulance Dispatch Agent** | Stage 2 (Concurrent) | Deterministic Math | ALS/BLS capability matching, road distance calculation, ETA minimization, live fleet state tracking. |
| **06** | **Rescue Coordination Agent** | Stage 2 (Concurrent) | Hybrid | NDRF, SDRF, and Fire Brigade mission allocation, extrication priorities, and tactical deployment. |
| **07** | **Medical Supply Agent** | Stage 2 (Concurrent) | Deterministic Math | Scales required blood units (2 per casualty) and IV fluids (6 per casualty) against database inventory. |
| **08** | **Route Optimization Agent** | Stage 2 (Concurrent) | Deterministic Math | A* pathfinding avoiding road closures and establishing Green Wave emergency transit corridors. |
| **09** | **Agency Communication Agent** | Stage 2 (Concurrent) | Deterministic Rule | ERSS 112 unified ticketing, emergency telephony logs, and cross-agency broadcast logs. |
| **10** | **Government Reporting Agent** | Stage 3 (Reporting) | Agentic AI | Synthesizes official NDMA/SDMA Situation Reports (SITREP-01) for District Magistrates and SDMA leadership. |

### 🛡️ Statutory Safeguards: Human-in-the-Loop Governance
To prevent catastrophic AI hallucination in live emergency dispatch:
* **Separation of Concerns**: Mathematical allocations (bed subtractions, fuel ranges, transit times) run on deterministic algorithms; agentic LLMs handle unstructured perception, corroboration, and narrative synthesis.
* **Statutory Authorization Gate**: All tactical resource movements require affirmative commander review in the **Approvals Inbox** (`/approvals`) before permanent field execution.

---

## 🛠️ Technology Stack

### Frontend Command Operations Center
* **Framework**: React 18 (Vite, TypeScript)
* **Styling**: Tailwind CSS with custom Dark Operations HUD palette
* **GIS Mapping Engine**: Leaflet with free, API-keyless basemaps:
  * ArcGIS World Streets (Default high-resolution vector road network)
  * OpenStreetMap Standard (OSM)
  * Tactical Dark HUD Filter
  * Esri World Imagery (Satellite)
* **Real-time Telemetry**: Native WebSocket hook (`useAresWebSocket`) with automatic heartbeat and fallback polling.
* **Component System**: Lucide Icons, responsive tactical split-drawers, and modal controllers.

### Backend Operations Microservice
* **Framework**: FastAPI (Python 3.10+) with Pydantic v2 schemas
* **Database**: Canonical SQLite database (`ares-backend/ares.db`) powered by SQLAlchemy 2.0 Async ORM
* **Live Telemetry Engine**: WebSockets (`/ws` and `/ws/{client_id}`) with event broadcasting on incident state transitions, dispatches, and agent runs.
* **Health Check**: Dynamic health probe (`/health`) executing active `SELECT 1` queries on the canonical database.

### Workflow & Agent Automation
* **n8n Workflow Engine**: `ares_multiagent_v2.json` provides visual execution flow, Webhook ingestion, automated escalation, and notification routing.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: v18 or higher (with npm)

### 1. Start the FastAPI Backend
```bash
# Navigate to backend directory
cd ares-backend

# Install python dependencies
pip install -r requirements.txt

# Start the FastAPI server on port 5000
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```
* Backend API Documentation: `http://localhost:5000/docs`
* Health Check: `http://localhost:5000/health`
* WebSocket Telemetry: `ws://localhost:5000/ws`

### 2. Start the React Frontend Command Center
```bash
# In a new terminal, navigate to the frontend directory
cd ares-frontend

# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev
```
* Command Operations Dashboard: `http://localhost:3000`

---

## 🗺️ Key Application Workspaces

1. **Command Dashboard (`/dashboard`)**: High-level KPI cards, live interactive GIS operations map, active incident feed, and tactical response inspection.
2. **Live Operations Map (`/map`)**: Fullscreen GIS tactical mapping with layer toggles (Incidents, Hospitals, Ambulances, Rescue Units, Risk Zones, Routes) and zero API key requirements.
3. **Incidents & SOS (`/incidents`)**: Complete incident management center with status filtering (`REPORTED`, `VERIFIED`, `RESPONSE_PLANNED`, `APPROVED`, `RESOLVED`), new incident creation modal, and multi-agent AI execution triggers.
4. **Approvals Inbox (`/approvals`)**: Statutory Human-in-the-Loop decision workspace. Displays pending tactical deployments, allocated resources, commander decision notes, and one-click Approve / Reject actions.
5. **Ambulance & Dispatch (`/dispatch`)**: Real-time fleet status tracking with interactive **[Dispatch to Incident]** modal to assign available ALS/BLS vehicles directly to active disasters.
6. **Hospital Network (`/hospitals`)**: Regional healthcare monitoring with live **[Update Capacity]** modal to edit available general beds, ICU beds, and ventilators.
7. **Medical Supplies (`/medical`)**: Real inventory tracking connecting directly to database stock levels with an emergency **[Order Stock / Requisition]** workflow.
8. **Agency Communication (`/communication`)**: Public safety dispatch center supporting ERSS 112 emergency broadcasts, agency direct messages, and timestamped receipt acknowledgements.
9. **AI Agent Control Room (`/agents`)**: Interactive pipeline architecture visualizer displaying the 3-stage execution flow, agent methods, and real run history logs with execution durations and JSON payloads.
10. **Situation Reports (`/reports`)**: Executive SITREP generator rendering markdown reports with incident selector, refresh telemetry, and print/export controls.
11. **What-If Disaster Simulator (`/simulator`)**: Scenario modeling modal allowing commanders to simulate variable casualty counts, infrastructure failures, and resource deficits before deployment.

---

## 📁 Repository Directory Structure

```
multiagent-ai-damage-management-system/
├── ares-backend/               # Canonical FastAPI Backend
│   ├── app/
│   │   ├── core/               # Configuration & DB initialization (ares-backend/ares.db)
│   │   ├── models/             # SQLAlchemy ORM models (Incidents, Hospitals, Ambulances, Runs, etc.)
│   │   ├── routers/            # REST & WebSocket endpoints (incidents, hospitals, approvals, ws, etc.)
│   │   └── schemas/            # Pydantic validation schemas
│   ├── ares.db                 # Canonical SQLite database (Single source of truth)
│   └── requirements.txt        # Backend dependencies
│
├── ares-frontend/              # React 18 + Vite Operations Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar navigation & TopBar command controls
│   │   │   ├── map/            # LiveGisMap with Leaflet & ArcGIS/OSM tiles
│   │   │   ├── modals/         # SOS Report, What-If Simulator, Response Plan modals
│   │   │   └── views/          # Dashboard, Incidents, Approvals, Dispatch, Hospitals, Agents, etc.
│   │   ├── lib/                # API client (api.ts) & WebSocket telemetry hook (useWebSocket.ts)
│   │   └── App.tsx             # Root application orchestrator
│   ├── package.json
│   └── vite.config.ts
│
├── ares_multiagent_v2.json     # Complete n8n Multi-Agent Workflow v2
├── prd.md                      # Comprehensive Product Requirement Document
└── README.md                   # System Architecture & Documentation
```

---

## 🔒 Security & Statutory Compliance
* **Zero External API Costs**: High-performance OpenStreetMap and ArcGIS World Streets tile servers operate with zero mandatory proprietary keys.
* **Database Isolation**: Single authoritative SQLite database path anchored inside `ares-backend/` ensures consistency across CLI commands and background server daemons.
* **Audit Trail**: Every agent recommendation, tactical deployment approval, and message acknowledgement is cryptographically timestamped in the database.
