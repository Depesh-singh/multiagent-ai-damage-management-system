"""
Multi-Agent Disaster Response System - Optimization Backend
Flask server with LIVE DATA SOURCES: MongoDB, Google Sheets, OpenStreetMap
Includes: Medicine Requirements based on disaster type
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from geopy.distance import geodesic
import json
import os
import sys
import requests
from datetime import datetime

# Import data sources
from data_sources import data_manager, MongoDBDataSource
# Import medicine requirements
from medicine_requirements import (
    get_medicine_requirements, 
    get_hospital_preparation_checklist,
    get_all_disaster_types,
    DISASTER_MEDICINE_MAP
)
from emergency_contacts import (
    get_emergency_contacts,
    simulate_emergency_calls,
    get_nearest_fire_stations,
    get_nearest_police_stations,
    EMERGENCY_CONTACTS
)

app = Flask(__name__)
CORS(app)  # Enable CORS for dashboard communication

# Store agent messages for the live panel
agent_messages = []

# ============================================
# CONFIGURATION
# ============================================

# Set data source via environment variable or default
# Options: "static", "mongodb", "google_sheets", "osm"
DATA_SOURCE = os.getenv("DATA_SOURCE", "osm")  # Default to OpenStreetMap for LIVE data

def log_agent_message(agent, message, message_type="info"):
    """Log agent communication for the live panel"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    agent_messages.append({
        "timestamp": timestamp,
        "agent": agent,
        "message": message,
        "type": message_type
    })
    # Keep only last 50 messages
    if len(agent_messages) > 50:
        agent_messages.pop(0)

# ============================================
# DATA SOURCE ENDPOINTS
# ============================================

@app.route('/data-sources', methods=['GET'])
def list_data_sources():
    """List available data sources"""
    return jsonify({
        "available": data_manager.list_sources(),
        "active": DATA_SOURCE
    })

@app.route('/set-data-source', methods=['POST'])
def set_data_source():
    """Change active data source"""
    global DATA_SOURCE
    source = request.json.get("source", "static")
    if source in data_manager.list_sources():
        DATA_SOURCE = source
        data_manager.set_primary_source(source)
        log_agent_message("System", f"Data source changed to: {source}", "info")
        return jsonify({"status": "ok", "source": source})
    return jsonify({"error": f"Unknown source: {source}"}), 400

@app.route('/hospitals', methods=['GET'])
def get_hospitals():
    """
    Get hospitals from the active data source.
    Query params: lat, lng, radius_km
    """
    lat = float(request.args.get('lat', 22.721))
    lng = float(request.args.get('lng', 88.485))
    radius = float(request.args.get('radius_km', 10))
    source = request.args.get('source', DATA_SOURCE)
    
    hospitals = data_manager.get_hospitals(lat, lng, radius, source)
    
    log_agent_message("Hospital Agent", f"Fetched {len(hospitals)} hospitals from {source}", "info")
    
    return jsonify({
        "hospitals": hospitals,
        "count": len(hospitals),
        "source": source,
        "location": {"lat": lat, "lng": lng}
    })

@app.route('/ambulances', methods=['GET'])
def get_ambulances():
    """
    Get ambulances from the active data source.
    """
    lat = float(request.args.get('lat', 22.721))
    lng = float(request.args.get('lng', 88.485))
    radius = float(request.args.get('radius_km', 10))
    source = request.args.get('source', DATA_SOURCE)
    
    ambulances = data_manager.get_ambulances(lat, lng, radius, source)
    
    log_agent_message("Emergency Agent", f"Fetched {len(ambulances)} ambulances from {source}", "info")
    
    return jsonify({
        "ambulances": ambulances,
        "count": len(ambulances),
        "source": source
    })

# ============================================
# OPTIMIZATION ENDPOINTS
# ============================================

@app.route('/optimize', methods=['POST'])
def optimize():
    """
    Optimize patient allocation to nearest hospitals.
    
    If hospitals not provided in body, fetches from active data source.
    """
    try:
        data = request.json
        patients = data["patients"]
        disaster_lat = data["lat"]
        disaster_lng = data["lng"]
        disaster_loc = (disaster_lat, disaster_lng)
        
        # Get hospitals from request or fetch from data source
        if "hospitals" in data and data["hospitals"]:
            hospitals = data["hospitals"]
            source = "request"
        else:
            # FETCH LIVE DATA!
            source = data.get("source", DATA_SOURCE)
            print(f"DEBUG: Optimize calling data_manager.get_hospitals(lat={disaster_lat}, lng={disaster_lng}, source={source})")
            sys.stdout.flush()
            hospitals = data_manager.get_hospitals(disaster_lat, disaster_lng, radius_km=10, source=source)
            print(f"DEBUG: Got {len(hospitals)} hospitals back")
            sys.stdout.flush()
            log_agent_message("Hospital Agent", f"[LIVE] Fetched {len(hospitals)} hospitals from {source}", "info")
        
        log_agent_message("Hospital Agent", f"Optimizing for {patients} patients at ({disaster_lat}, {disaster_lng})", "info")
        
        if not hospitals:
            log_agent_message("Hospital Agent", "No hospitals found! Using fallback data.", "warning")
            hospitals = data_manager.get_hospitals(disaster_lat, disaster_lng, source="static")
        
        # Sort hospitals by distance from disaster location
        for h in hospitals:
            h["_distance"] = geodesic(disaster_loc, (h["lat"], h["lng"])).km
        hospitals.sort(key=lambda h: h["_distance"])
        
        allocation = []
        remaining = patients
        
        for h in hospitals:
            if remaining <= 0:
                break
            
            beds = h.get("Beds", h.get("beds", 5))
            assigned = min(beds, remaining)
            distance = round(h["_distance"], 2)
            
            hospital_name = h.get("Hospital", h.get("name", "Unknown"))
            
            allocation.append({
                "hospital": hospital_name,
                "assigned": assigned,
                "available_beds": beds,
                "distance": distance,
                "address": h.get("address", ""),
                "phone": h.get("phone", ""),
                "lat": h.get("lat"),
                "lng": h.get("lng")
            })
            
            if assigned > 0:
                log_agent_message("Hospital Agent", f"{hospital_name} -> {assigned} patients ({distance}km)", "success")
            
            remaining -= assigned
        
        if remaining > 0:
            log_agent_message("Government Agent", f"WARNING: {remaining} patients unallocated!", "warning")
        else:
            log_agent_message("Government Agent", f"All {patients} patients allocated successfully", "success")
        
        return jsonify({
            "allocation": allocation,
            "remaining": remaining,
            "total_patients": patients,
            "disaster_location": {"lat": disaster_lat, "lng": disaster_lng},
            "data_source": source,
            "hospitals_checked": len(hospitals)
        })
        
    except Exception as e:
        log_agent_message("System", f"Optimization error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

@app.route('/optimize-live', methods=['POST'])
def optimize_live():
    """
    Optimization with LIVE data from OpenStreetMap.
    Fetches real hospitals near the disaster location.
    """
    try:
        data = request.json
        patients = data["patients"]
        disaster_lat = data["lat"]
        disaster_lng = data["lng"]
        radius_km = data.get("radius_km", 5)
        
        log_agent_message("System", f"[LIVE OSM] Fetching real hospitals near disaster...", "info")
        
        # Force OSM data source
        hospitals = data_manager.get_hospitals(disaster_lat, disaster_lng, radius_km, source="osm")
        
        if not hospitals:
            log_agent_message("System", "No hospitals found via OSM, using static fallback", "warning")
            hospitals = data_manager.get_hospitals(disaster_lat, disaster_lng, source="static")
        
        log_agent_message("Hospital Agent", f"[OSM] Found {len(hospitals)} real hospitals", "success")
        
        # Optimize using fetched data
        disaster_loc = (disaster_lat, disaster_lng)
        
        for h in hospitals:
            h["_distance"] = geodesic(disaster_loc, (h["lat"], h["lng"])).km
        hospitals.sort(key=lambda h: h["_distance"])
        
        allocation = []
        remaining = patients
        
        for h in hospitals:
            if remaining <= 0:
                break
            
            beds = h.get("Beds", 5)
            assigned = min(beds, remaining)
            distance = round(h["_distance"], 2)
            hospital_name = h.get("Hospital", "Unknown")
            
            allocation.append({
                "hospital": hospital_name,
                "assigned": assigned,
                "available_beds": beds,
                "distance": distance,
                "address": h.get("address", ""),
                "emergency": h.get("emergency", "yes"),
                "lat": h.get("lat"),
                "lng": h.get("lng")
            })
            
            if assigned > 0:
                log_agent_message("Hospital Agent", f"[OSM] {hospital_name} -> {assigned} patients", "success")
            
            remaining -= assigned
        
        return jsonify({
            "allocation": allocation,
            "remaining": remaining,
            "total_patients": patients,
            "data_source": "OpenStreetMap (LIVE)",
            "hospitals_found": len(hospitals)
        })
        
    except Exception as e:
        log_agent_message("System", f"Live optimization error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

@app.route('/ambulance-dispatch', methods=['POST'])
def ambulance_dispatch():
    """
    Handle ambulance dispatch - fetches from active data source.
    """
    try:
        data = request.json
        disaster_lat = data.get("lat", 22.721)
        disaster_lng = data.get("lng", 88.485)
        disaster_loc = (disaster_lat, disaster_lng)
        
        source = data.get("source", DATA_SOURCE)
        
        # Fetch ambulances from data source
        ambulances = data_manager.get_ambulances(disaster_lat, disaster_lng, radius_km=10, source=source)
        
        log_agent_message("Emergency Agent", f"Disaster at ({disaster_lat}, {disaster_lng})", "info")
        log_agent_message("Emergency Agent", f"Found {len(ambulances)} ambulances from {source}", "info")
        
        dispatch = []
        for amb in ambulances:
            amb_loc = (amb["lat"], amb["lng"])
            distance = round(geodesic(disaster_loc, amb_loc).km, 2)
            eta = round(distance * 3, 1)  # 3 min per km
            
            dispatch.append({
                "ambulance_id": amb.get("id", "UNKNOWN"),
                "distance": distance,
                "eta_minutes": eta,
                "status": amb.get("status", "available"),
                "driver": amb.get("driver", "")
            })
            
            log_agent_message("Emergency Agent", f"{amb.get('id')} dispatched -> ETA: {eta} min", "success")
        
        dispatch.sort(key=lambda x: x["distance"])
        
        return jsonify({
            "dispatch": dispatch,
            "total_ambulances": len(dispatch),
            "data_source": source
        })
        
    except Exception as e:
        log_agent_message("System", f"Dispatch error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

# ============================================
# MESSAGE ENDPOINTS
# ============================================

@app.route('/agent-messages', methods=['GET'])
def get_agent_messages():
    """Get all agent messages for the live panel."""
    return jsonify({"messages": agent_messages})

@app.route('/clear-messages', methods=['POST'])
def clear_messages():
    """Clear agent message history."""
    global agent_messages
    agent_messages = []
    log_agent_message("System", "New disaster response initiated", "info")
    return jsonify({"status": "cleared"})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy", 
        "service": "Disaster Response Backend",
        "data_source": DATA_SOURCE,
        "available_sources": data_manager.list_sources()
    })

# ============================================
# MEDICINE REQUIREMENTS ENDPOINTS
# ============================================

@app.route('/medicine-requirements', methods=['POST'])
def medicine_requirements():
    """
    Get medicine requirements based on disaster type and patient count.
    """
    try:
        data = request.json
        disaster_type = data.get("disaster_type", "FIRE")
        patient_count = data.get("patients", 6)
        
        requirements = get_medicine_requirements(disaster_type, patient_count)
        
        log_agent_message("Medical Supply Agent", 
            f"[{disaster_type}] Calculating supplies for {patient_count} patients", "info")
        
        critical_count = len(requirements["critical_items"])
        log_agent_message("Medical Supply Agent", 
            f"CRITICAL items needed: {critical_count}", "warning" if critical_count > 0 else "info")
        
        for item in requirements["critical_items"][:3]:
            log_agent_message("Medical Supply Agent", 
                f"URGENT: {item['name']} - {item['required_quantity']} {item['unit']}", "warning")
        
        return jsonify(requirements)
        
    except Exception as e:
        log_agent_message("System", f"Medicine calculation error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

@app.route('/hospital-checklist', methods=['POST'])
def hospital_checklist():
    """
    Generate preparation checklist for a hospital.
    """
    try:
        data = request.json
        disaster_type = data.get("disaster_type", "FIRE")
        patient_count = data.get("patients", 6)
        hospital_name = data.get("hospital", "City Hospital")
        
        checklist = get_hospital_preparation_checklist(disaster_type, patient_count, hospital_name)
        
        log_agent_message("Hospital Agent", 
            f"Alert sent to {hospital_name}: Prepare for {patient_count} patients", "success")
        log_agent_message("Hospital Agent", 
            f"Alert Level: {checklist['alert_level']}", 
            "warning" if checklist['alert_level'] == "CRITICAL" else "info")
        
        return jsonify(checklist)
        
    except Exception as e:
        log_agent_message("System", f"Checklist error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

@app.route('/disaster-types', methods=['GET'])
def disaster_types():
    """Get all supported disaster types."""
    return jsonify({
        "disaster_types": get_all_disaster_types(),
        "details": {dtype: {
            "priority": info["priority"],
            "description": info["description"]
        } for dtype, info in DISASTER_MEDICINE_MAP.items()}
    })

@app.route('/full-response', methods=['POST'])
def full_disaster_response():
    """
    Complete disaster response including:
    - Hospital allocation
    - Ambulance dispatch
    - Medicine requirements for each hospital
    """
    try:
        data = request.json
        patients = data["patients"]
        disaster_lat = data["lat"]
        disaster_lng = data["lng"]
        disaster_type = data.get("disaster_type", "FIRE")
        source = data.get("source", DATA_SOURCE)
        
        log_agent_message("Disaster Trigger Agent", 
            f"FULL RESPONSE: {disaster_type} at ({disaster_lat}, {disaster_lng})", "warning")
        
        # 1. Get hospitals
        hospitals = data_manager.get_hospitals(disaster_lat, disaster_lng, radius_km=10, source=source)
        disaster_loc = (disaster_lat, disaster_lng)
        
        # 2. Optimize allocation
        for h in hospitals:
            h["_distance"] = geodesic(disaster_loc, (h["lat"], h["lng"])).km
        hospitals.sort(key=lambda h: h["_distance"])
        
        allocation = []
        remaining = patients
        
        for h in hospitals:
            if remaining <= 0:
                break
            
            beds = h.get("Beds", h.get("beds", 5))
            assigned = min(beds, remaining)
            distance = round(h["_distance"], 2)
            hospital_name = h.get("Hospital", h.get("name", "Unknown"))
            
            # Get medicine requirements for this hospital
            hospital_meds = get_medicine_requirements(disaster_type, assigned)
            
            allocation.append({
                "hospital": hospital_name,
                "assigned": assigned,
                "available_beds": beds,
                "distance": distance,
                "address": h.get("address", ""),
                "phone": h.get("phone", ""),
                "lat": h.get("lat"),
                "lng": h.get("lng")
            })
            
            log_agent_message("Hospital Agent", 
                f"{hospital_name} -> {assigned} patients ({distance}km)", "success")
            log_agent_message("Medical Supply Agent", 
                f"{hospital_name}: {len(hospital_meds['critical_items'])} critical supplies needed", "info")
            
            remaining -= assigned
        
        # 3. Get ambulances
        ambulances = data_manager.get_ambulances(disaster_lat, disaster_lng, source=source)
        dispatch = []
        for amb in ambulances[:5]:
            amb_loc = (amb["lat"], amb["lng"])
            distance = round(geodesic(disaster_loc, amb_loc).km, 2)
            eta = round(distance * 3, 1)
            dispatch.append({
                "ambulance_id": amb.get("id", "UNKNOWN"),
                "distance": distance,
                "eta_minutes": eta
            })
            log_agent_message("Emergency Agent", f"{amb.get('id')} -> ETA {eta}min", "success")
        
        # 4. Overall medicine requirements
        total_meds = get_medicine_requirements(disaster_type, patients)
        
        log_agent_message("Government Agent", 
            f"Response coordinated: {patients - remaining}/{patients} patients allocated", 
            "success" if remaining == 0 else "warning")
        
        return jsonify({
            "disaster": {
                "type": disaster_type,
                "location": {"lat": disaster_lat, "lng": disaster_lng},
                "patients": patients
            },
            "hospital_allocation": allocation,
            "patients_unallocated": remaining,
            "ambulance_dispatch": dispatch,
            "total_medicine_requirements": {
                "priority": total_meds["priority"],
                "critical_items": total_meds["critical_items"],
                "equipment": total_meds["equipment"]
            },
            "data_source": source
        })
        
    except Exception as e:
        log_agent_message("System", f"Full response error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

# ============================================
# MONGODB MANAGEMENT
# ============================================

@app.route('/mongodb/seed', methods=['POST'])
def seed_mongodb():
    """Seed MongoDB with sample data"""
    try:
        if "mongodb" in data_manager.sources:
            data_manager.sources["mongodb"].seed_sample_data()
            log_agent_message("System", "MongoDB seeded with sample data", "success")
            return jsonify({"status": "seeded"})
        return jsonify({"error": "MongoDB not available"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ============================================
# GEOCODING ENDPOINT
# ============================================

@app.route('/geocode', methods=['GET'])
def geocode_location():
    """
    Geocode a location name to lat/lng using Nominatim OpenStreetMap API.
    Query params: q (location name)
    """
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"error": "Missing 'q' query parameter", "results": []}), 400

    try:
        log_agent_message("Geocoding Agent", f"Searching location: {query}", "info")

        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "limit": 5
            },
            headers={
                "User-Agent": "DisasterResponseSystem/1.0"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        results = []
        for item in data:
            results.append({
                "display_name": item.get("display_name", ""),
                "lat": float(item.get("lat", 0)),
                "lng": float(item.get("lon", 0))
            })

        log_agent_message("Geocoding Agent", f"Found {len(results)} results for '{query}'", "success")

        return jsonify({"results": results})

    except requests.exceptions.RequestException as e:
        log_agent_message("Geocoding Agent", f"Geocoding API error: {str(e)}", "error")
        return jsonify({"error": f"Geocoding failed: {str(e)}", "results": []}), 502
    except Exception as e:
        log_agent_message("Geocoding Agent", f"Geocoding error: {str(e)}", "error")
        return jsonify({"error": str(e), "results": []}), 500

# ============================================
# EMERGENCY CALLING AGENT ENDPOINTS
# ============================================

@app.route('/emergency-calls', methods=['POST'])
def emergency_calls():
    """
    Simulate emergency calls to all relevant services for a disaster.
    Body: {"disaster_type": "FIRE", "lat": 22.721, "lng": 88.485, "severity": "HIGH", "patients": 6}
    """
    try:
        data = request.json
        disaster_type = data.get("disaster_type", "FIRE")
        lat = data.get("lat", 22.721)
        lng = data.get("lng", 88.485)
        severity = data.get("severity", "HIGH")
        patients = data.get("patients", 6)

        log_agent_message("Emergency Calling Agent",
            f"Initiating emergency calls for {disaster_type} ({severity}) at ({lat}, {lng})", "warning")

        call_records = simulate_emergency_calls(
            disaster_type=disaster_type,
            lat=lat,
            lng=lng,
            severity=severity,
            patients=patients
        )

        for record in call_records:
            status_type = "success" if record.get("status") in ["CONNECTED", "DISPATCHED"] else "warning"
            svc_name = record.get("service_name", "Service")
            log_agent_message("Emergency Calling Agent",
                f"Called {svc_name}: {record.get('status', 'unknown')}", status_type)

        log_agent_message("Emergency Calling Agent",
            f"Completed {len(call_records)} emergency calls", "success")

        return jsonify({
            "calls": call_records,
            "call_records": call_records,
            "total_calls": len(call_records),
            "disaster_type": disaster_type,
            "location": {"lat": lat, "lng": lng}
        })

    except Exception as e:
        log_agent_message("System", f"Emergency calls error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

@app.route('/emergency-contacts', methods=['GET'])
def emergency_contacts_endpoint():
    """
    Get emergency contacts, optionally filtered by disaster type.
    Query params: disaster_type (optional), lat, lng
    """
    try:
        disaster_type = request.args.get('disaster_type', None)
        lat = float(request.args.get('lat', 22.721))
        lng = float(request.args.get('lng', 88.485))

        if disaster_type:
            contacts = get_emergency_contacts(disaster_type, lat, lng)
        else:
            contacts = EMERGENCY_CONTACTS

        return jsonify({
            "contacts": contacts,
            "disaster_type": disaster_type or "ALL"
        })

    except Exception as e:
        log_agent_message("System", f"Emergency contacts error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

@app.route('/nearby-stations', methods=['GET'])
def nearby_stations():
    """
    Get nearby fire or police stations.
    Query params: lat, lng, type (fire/police)
    """
    try:
        lat = float(request.args.get('lat', 22.721))
        lng = float(request.args.get('lng', 88.485))
        station_type = request.args.get('type', 'fire').lower()

        if station_type == 'fire':
            stations = get_nearest_fire_stations(lat, lng)
        elif station_type == 'police':
            stations = get_nearest_police_stations(lat, lng)
        else:
            return jsonify({"error": f"Unknown station type: {station_type}. Use 'fire' or 'police'."}), 400

        log_agent_message("Emergency Calling Agent",
            f"Found {len(stations)} nearby {station_type} stations", "info")

        return jsonify({
            "stations": stations,
            "count": len(stations),
            "type": station_type,
            "location": {"lat": lat, "lng": lng}
        })

    except Exception as e:
        log_agent_message("System", f"Nearby stations error: {str(e)}", "error")
        return jsonify({"error": str(e)}), 400

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("=" * 50)
    print("Multi-Agent Disaster Response Backend")
    print("=" * 50)
    print(f"[+] Active data source: {DATA_SOURCE}")
    print(f"[+] Available sources: {data_manager.list_sources()}")
    print("")
    print("[+] Endpoints:")
    print("    /optimize          - Patient allocation")
    print("    /optimize-live     - Allocation with OSM data")
    print("    /hospitals         - Get hospitals from data source")
    print("    /ambulances        - Get ambulances")
    print("    /data-sources      - List available sources")
    print("    /set-data-source   - Change active source")
    print("    /geocode           - Geocode location to lat/lng")
    print("    /emergency-calls   - Simulate emergency calls")
    print("    /emergency-contacts- Get emergency contacts")
    print("    /nearby-stations   - Find nearby fire/police stations")
    print("=" * 50)
    
    # Set primary data source
    data_manager.set_primary_source(DATA_SOURCE)
    
    app.run(port=5000, debug=True)
