"""
Multi-Agent Disaster Response System - Optimization Backend
Flask server with LIVE DATA SOURCES: MongoDB, Google Sheets, OpenStreetMap
Includes: Medicine Requirements based on disaster type
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from geopy.distance import geodesic
from collections import deque
import json
import os
import sys
import logging
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

import threading
import queue

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # 1MB request size limit

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8501").split(",")
CORS(app, origins=allowed_origins)

# Global locks and queues for thread safety
_messages_lock = threading.Lock()
_config_lock = threading.Lock()
_sse_subscribers = []
_sse_lock = threading.Lock()

# Store agent messages for the live panel
agent_messages = deque(maxlen=50)

# ============================================
# CONFIGURATION
# ============================================

# Set data source via environment variable or default
# Options: "static", "mongodb", "google_sheets", "osm"
DATA_SOURCE = os.getenv("DATA_SOURCE", "osm")  # Default to OpenStreetMap for LIVE data

logger = logging.getLogger(__name__)

def log_agent_message(agent, message, message_type="info"):
    """Log agent communication for the live panel and broadcast to active SSE subscribers."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    msg = {
        "timestamp": timestamp,
        "agent": agent,
        "message": message,
        "type": message_type
    }
    with _messages_lock:
        agent_messages.append(msg)

    with _sse_lock:
        dead = []
        for q in _sse_subscribers:
            try:
                q.put_nowait(msg)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _sse_subscribers.remove(q)

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
    with _config_lock:
        global DATA_SOURCE
        if not request.is_json or request.json is None:
            return jsonify({"error": "Request body must be JSON"}), 400
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
    
    # Calculate distance for each hospital and sort nearest first
    for h in hospitals:
        h_lat = h.get('lat')
        h_lng = h.get('lng')
        if h_lat and h_lng:
            dist = geodesic((lat, lng), (h_lat, h_lng)).km
            h['_distance'] = round(dist, 2)
            h['distance'] = h['_distance']
        else:
            h['_distance'] = 999.0
            h['distance'] = 999.0
            
    hospitals.sort(key=lambda x: x.get('_distance', 999.0))
    
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
    """Enhanced ambulance dispatch with capacity matching and smart ETA."""
    try:
        data = request.json
        disaster_lat = data.get("lat", 22.721)
        disaster_lng = data.get("lng", 88.485)
        patient_count = data.get("patients", 6)
        disaster_loc = (disaster_lat, disaster_lng)
        
        source = data.get("source", DATA_SOURCE)
        
        # Fetch ambulances from data source
        all_ambulances = data_manager.get_ambulances(disaster_lat, disaster_lng, radius_km=10, source=source)
        
        log_agent_message("Emergency Agent", f"Disaster at ({disaster_lat}, {disaster_lng}) - {patient_count} patients", "info")
        
        # Filter: only available ambulances
        available = [amb for amb in all_ambulances if amb.get("status", "available") == "available"]
        log_agent_message("Emergency Agent", f"{len(available)}/{len(all_ambulances)} ambulances available from {source}", "info")
        
        # Calculate distance and smart ETA for each
        for amb in available:
            amb_loc = (amb["lat"], amb["lng"])
            dist = geodesic(disaster_loc, amb_loc).km
            amb["_distance"] = round(dist, 2)
            # Smart ETA: base 3 min/km with modifiers
            if dist > 10:
                eta = dist * 3 * 1.2  # highway factor
            elif dist < 2:
                eta = dist * 3 * 0.7  # urban proximity
            else:
                eta = dist * 3
            amb["_eta"] = round(eta, 1)
        
        # Sort by composite score: 70% distance, 30% inverse capacity preference
        if available:
            max_dist = max(a["_distance"] for a in available) or 1
            max_cap = max(a.get("capacity", 2) for a in available) or 1
            for amb in available:
                norm_dist = amb["_distance"] / max_dist
                norm_cap = 1 - (amb.get("capacity", 2) / max_cap)  # prefer higher capacity
                amb["_score"] = 0.7 * norm_dist + 0.3 * norm_cap
            available.sort(key=lambda x: x["_score"])
        
        # Check if hospital allocations passed in request
        allocations = data.get("allocation", [])
        
        # Greedy dispatch: assign closest available until all patients covered
        dispatch = []
        patients_remaining = patient_count
        
        alloc_idx = 0
        current_alloc_patients_handled = 0
        
        for amb in available:
            if patients_remaining <= 0:
                break
            
            cap = amb.get("capacity", 2)
            assigned = min(cap, patients_remaining)
            
            dispatch_item = {
                "ambulance_id": amb.get("id", "UNKNOWN"),
                "type": amb.get("ambulance_type", amb.get("type", "BLS")),
                "capacity": cap,
                "patients_assigned": assigned,
                "distance_km": amb["_distance"],
                "eta_minutes": amb["_eta"],
                "status": "dispatched",
                "driver": amb.get("driver", ""),
                "lat": amb.get("lat"),
                "lng": amb.get("lng")
            }
            
            # Link to allocated hospital if available
            if allocations and alloc_idx < len(allocations):
                target_alloc = allocations[alloc_idx]
                dispatch_item["assigned_hospital"] = target_alloc.get("hospital", target_alloc.get("name", "Nearest Hospital"))
                dispatch_item["hospital_lat"] = target_alloc.get("lat")
                dispatch_item["hospital_lng"] = target_alloc.get("lng")
                dispatch_item["hospital_distance_km"] = target_alloc.get("distance", 0)
                dispatch_item["hospital_beds_available"] = target_alloc.get("available_beds", target_alloc.get("beds", 0))
                
                current_alloc_patients_handled += assigned
                if current_alloc_patients_handled >= target_alloc.get("assigned", 1):
                    alloc_idx += 1
                    current_alloc_patients_handled = 0
            
            dispatch.append(dispatch_item)
            
            # Mark as dispatched in memory
            amb["status"] = "dispatched"
            
            h_msg = f" ➔ Hospital: {dispatch_item.get('assigned_hospital')}" if dispatch_item.get('assigned_hospital') else ""
            log_agent_message("Emergency Agent", 
                f"{amb.get('id')} ({amb.get('ambulance_type', 'BLS')}) dispatched -> {assigned} patients, ETA: {amb['_eta']} min{h_msg}", "success")
            
            patients_remaining -= assigned
        
        patients_covered = patient_count - max(patients_remaining, 0)
        total_capacity = sum(d["capacity"] for d in dispatch)
        available_remaining = len([a for a in all_ambulances if a.get("status", "available") == "available"])
        
        if patients_remaining > 0:
            log_agent_message("Emergency Agent", f"WARNING: {patients_remaining} patients uncovered! Insufficient ambulances.", "warning")
        else:
            log_agent_message("Emergency Agent", f"All {patient_count} patients covered by {len(dispatch)} ambulances", "success")
        
        return jsonify({
            "dispatch": dispatch,
            "total_dispatched": len(dispatch),
            "total_capacity": total_capacity,
            "patients_covered": patients_covered,
            "patients_uncovered": max(patients_remaining, 0),
            "available_remaining": available_remaining,
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
    with _messages_lock:
        return jsonify({"messages": list(agent_messages)})

@app.route('/agent-messages/stream', methods=['GET'])
def stream_agent_messages():
    """Server-Sent Events (SSE) endpoint for real-time agent message streaming."""
    def event_generator():
        q = queue.Queue(maxsize=100)
        with _sse_lock:
            _sse_subscribers.append(q)
        try:
            with _messages_lock:
                history = list(agent_messages)
            for msg in history:
                yield f"data: {json.dumps(msg)}\n\n"

            while True:
                try:
                    msg = q.get(timeout=15)
                    yield f"data: {json.dumps(msg)}\n\n"
                except queue.Empty:
                    yield ": heartbeat\n\n"
        except GeneratorExit:
            pass
        finally:
            with _sse_lock:
                if q in _sse_subscribers:
                    _sse_subscribers.remove(q)

    return app.response_class(event_generator(), mimetype='text/event-stream')

@app.route('/clear-messages', methods=['POST'])
def clear_messages():
    """Clear agent message history."""
    with _messages_lock:
        agent_messages.clear()
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
        all_ambulances = data_manager.get_ambulances(disaster_lat, disaster_lng, source=source)
        available_ambs = [amb for amb in all_ambulances if amb.get("status", "available") == "available"]
        for amb in available_ambs:
            amb_loc = (amb["lat"], amb["lng"])
            dist = geodesic(disaster_loc, amb_loc).km
            amb["_distance"] = round(dist, 2)
            if dist > 10:
                eta = dist * 3 * 1.2
            elif dist < 2:
                eta = dist * 3 * 0.7
            else:
                eta = dist * 3
            amb["_eta"] = round(eta, 1)
        
        available_ambs.sort(key=lambda x: x["_distance"])
        dispatch = []
        amb_patients_remaining = patients
        for amb in available_ambs:
            if amb_patients_remaining <= 0:
                break
            cap = amb.get("capacity", 2)
            assigned = min(cap, amb_patients_remaining)
            dispatch.append({
                "ambulance_id": amb.get("id", "UNKNOWN"),
                "type": amb.get("ambulance_type", amb.get("type", "BLS")),
                "capacity": cap,
                "patients_assigned": assigned,
                "distance_km": amb["_distance"],
                "eta_minutes": amb["_eta"],
                "status": "dispatched",
                "driver": amb.get("driver", "")
            })
            amb["status"] = "dispatched"
            amb_patients_remaining -= assigned
            log_agent_message("Emergency Agent", f"{amb.get('id')} ({amb.get('ambulance_type', 'BLS')}) dispatched -> {assigned} patients, ETA {amb['_eta']}min", "success")
        
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

@app.route('/ambulance-status', methods=['PATCH'])
def update_ambulance_status():
    """Update an ambulance's status (e.g., mark as returning or available)."""
    try:
        data = request.json
        ambulance_id = data.get("ambulance_id")
        new_status = data.get("status")
        
        if not ambulance_id or not new_status:
            return jsonify({"error": "ambulance_id and status are required"}), 400
        
        valid_statuses = ["available", "dispatched", "en_route", "returning"]
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400
        
        log_agent_message("Emergency Agent", f"{ambulance_id} status -> {new_status}", "info")
        
        return jsonify({"status": "updated", "ambulance_id": ambulance_id, "new_status": new_status})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found", "status_code": 404}), 404

@app.errorhandler(405)
def method_not_allowed_error(error):
    return jsonify({"error": "Method not allowed", "status_code": 405}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "status_code": 500}), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"

    logger.info("=" * 50)
    logger.info("Multi-Agent Disaster Response Backend")
    logger.info("=" * 50)
    logger.info(f"Active data source: {DATA_SOURCE}")
    logger.info(f"Available sources: {data_manager.list_sources()}")
    logger.info("=" * 50)

    data_manager.set_primary_source(DATA_SOURCE)
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
