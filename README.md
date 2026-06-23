# 🚨 Multi-Agent AI Disaster Management & Emergency Response System

An advanced, real-time emergency coordination dashboard powered by multi-agent collaboration. The system optimizes patient routing, dispatches emergency vehicles, logs communication with public safety agencies, and dynamically tracks medicine/equipment requirements per hospital based on the disaster type and severity.

---

## 🌟 Key Features

* **🗺️ Real-time GIS Mapping**: Interactive dark-matter map (`Folium`) displaying the disaster epicenter, nearby hospitals, dispatched ambulances, and path routing from the incident area to emergency centers.
* **🏥 Hospital Allocation Agent**: Evaluates hospital bed capacity and travel distances using geodesic coordinates to assign patients to the nearest optimal facility.
* **📞 Autonomous Calling Agent**: Simulates immediate connection logs with local emergency dispatch units (Ambulance `108`, Fire Brigade `101`, Police Control `100`, NDRF, and District Operations).
* **💊 Medical Supply Scaling**: A calculation engine that computes required medicines (vials, doses, tubes) and equipment based on specific disasters (e.g. `FIRE`, `FLOOD`, `EARTHQUAKE`, `ACCIDENT`).
* **📋 Hospital Preparedness Logs**: Interactive checklist showing immediate actions, medicine requirements, and specialized equipment prepared for each allocated hospital.
* **⚡ Dual-Data Integration**: Support for OpenStreetMap (OSM) Live Overpass queries or structured local static data sources.

---

## 🛠️ Tech Stack

* **Frontend**: Streamlit, Folium (interactive maps), CSS/HTML Injection (glassmorphic theme).
* **Backend**: Flask (microservices), Geopy (distance calculation), Requests.
* **Database**: MongoDB (optional seeding script included), Google Sheets integration.
* **Map Engine**: Nominatim & Overpass API (OpenStreetMap).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Python 3.10+ installed.

### 2. Install Dependencies
Clone the repository and install the required libraries:
```bash
pip install -r requirements.txt
```

### 3. Start the Flask Backend
Run the backend optimization and agency API:
```bash
cd backend-python
python optimize.py
```
*Runs on: http://localhost:5000*

### 4. Start the Streamlit Dashboard
Launch the user interface:
```bash
cd dashboard
streamlit run app.py
```
*Runs on: http://localhost:8501*

---

## 🤖 Multi-Agent Architecture
* **Hospital Agent**: Handles bed management and hospital selection metrics.
* **Emergency Agent**: Coordinates ambulance tracking, ETAs, and routing paths.
* **Calling Agent**: Simulates virtual telephony protocols to link regional emergency responders.
* **Medical Supply Agent**: Scales medical lists and action checklists.
* **Government Agent**: Aggregates final allocation statuses and triggers alerts.
