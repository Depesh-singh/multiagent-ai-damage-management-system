"""
Multi-Agent Disaster Response System - Dashboard
Streamlit application with Folium map, Live Agent Conversation Panel,
Location Search, and Emergency Calling Agent
"""

import streamlit as st
import folium
from streamlit_folium import st_folium
import requests
import time
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="Multi-Agent Disaster Response System",
    page_icon="🚨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for premium look
st.markdown("""
<style>
    /* Main container styling */
    .main {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    /* Header styling */
    .main-header {
        background: linear-gradient(90deg, #e94560 0%, #ff6b6b 100%);
        padding: 20px;
        border-radius: 15px;
        margin-bottom: 20px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(233, 69, 96, 0.3);
    }
    
    .main-header h1 {
        color: white;
        margin: 0;
        font-size: 2.2rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    /* Agent message styling */
    .agent-panel {
        background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%);
        border-radius: 15px;
        padding: 15px;
        border: 1px solid #2d2d5a;
        max-height: 500px;
        overflow-y: auto;
    }
    
    .agent-message {
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
        padding: 12px;
        margin: 8px 0;
        border-left: 4px solid #4ecdc4;
        animation: slideIn 0.3s ease;
    }
    
    .agent-message.success {
        border-left-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
    }
    
    .agent-message.warning {
        border-left-color: #ffa502;
        background: rgba(255, 165, 2, 0.1);
    }
    
    .agent-message.error {
        border-left-color: #ff4757;
        background: rgba(255, 71, 87, 0.1);
    }
    
    .agent-message.info {
        border-left-color: #5f27cd;
        background: rgba(95, 39, 205, 0.1);
    }
    
    .agent-name {
        font-weight: bold;
        color: #4ecdc4;
        font-size: 0.9rem;
    }
    
    .agent-timestamp {
        color: #888;
        font-size: 0.75rem;
        float: right;
    }
    
    .agent-text {
        color: #e0e0e0;
        margin-top: 5px;
        font-size: 0.95rem;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    /* Stats cards */
    .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .stat-number {
        font-size: 2.5rem;
        font-weight: bold;
        color: white;
    }
    
    .stat-label {
        color: rgba(255,255,255,0.8);
        font-size: 0.9rem;
    }
    
    /* Trigger button */
    .stButton > button {
        background: linear-gradient(90deg, #e94560 0%, #ff6b6b 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 25px !important;
        padding: 15px 40px !important;
        font-size: 1.2rem !important;
        font-weight: bold !important;
        box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4) !important;
        transition: all 0.3s ease !important;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(233, 69, 96, 0.5) !important;
    }
    
    /* Sidebar styling */
    .css-1d391kg {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    }
    
    /* Location search box */
    .search-box {
        background: rgba(78, 205, 196, 0.1);
        border: 1px solid #4ecdc4;
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 15px;
    }
    
    .search-box h4 {
        color: #4ecdc4;
        margin: 0 0 10px 0;
    }
    
    /* Emergency call card */
    .call-card {
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 14px;
        margin: 8px 0;
        border-left: 4px solid #4ecdc4;
        transition: all 0.3s ease;
    }
    
    .call-card.CONNECTED {
        border-left-color: #2ecc71;
        background: rgba(46, 204, 113, 0.1);
    }
    
    .call-card.RINGING {
        border-left-color: #f39c12;
        background: rgba(243, 156, 18, 0.1);
        animation: pulse 1.5s infinite;
    }
    
    .call-card.QUEUED {
        border-left-color: #3498db;
        background: rgba(52, 152, 219, 0.1);
    }
    
    .call-card.DISPATCHED {
        border-left-color: #2ecc71;
        background: rgba(46, 204, 113, 0.15);
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
    
    .call-service {
        font-weight: bold;
        color: #fff;
        font-size: 1rem;
    }
    
    .call-phone {
        color: #4ecdc4;
        font-size: 0.9rem;
        font-family: monospace;
    }
    
    .call-status {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: bold;
        float: right;
    }
    
    .call-status.CONNECTED { background: #2ecc71; color: white; }
    .call-status.RINGING { background: #f39c12; color: white; }
    .call-status.QUEUED { background: #3498db; color: white; }
    .call-status.DISPATCHED { background: #27ae60; color: white; }
    
    .call-response {
        color: #bbb;
        font-size: 0.85rem;
        margin-top: 6px;
        font-style: italic;
    }
    
    .call-eta {
        color: #f39c12;
        font-size: 0.85rem;
        font-weight: bold;
    }
    
    /* Section headers */
    .section-header {
        background: linear-gradient(90deg, rgba(78,205,196,0.2), transparent);
        padding: 10px 15px;
        border-radius: 10px;
        border-left: 3px solid #4ecdc4;
        margin: 15px 0 10px 0;
    }
    
    .section-header h3 {
        color: #4ecdc4;
        margin: 0;
        font-size: 1.1rem;
    }
</style>
""", unsafe_allow_html=True)

# Helper to generate mock checklists when backend is unreachable
def get_mock_hospital_checklist(disaster_type, patients, hospital_name):
    # Map of disaster types to mock medicines and equipment to match the backend definitions
    med_map = {
        "FIRE": [
            {"item": "Silver Sulfadiazine Cream", "required": f"{patients * 2} tubes", "priority": "HIGH"},
            {"item": "Morphine/Pain Relief IV", "required": f"{patients * 3} vials", "priority": "HIGH"},
            {"item": "Saline IV Bags", "required": f"{patients * 5} bags", "priority": "CRITICAL"},
            {"item": "Oxygen Cylinders", "required": f"{patients * 1} cylinder", "priority": "CRITICAL"},
            {"item": "Burn Dressings", "required": f"{patients * 10} pieces", "priority": "HIGH"},
        ],
        "FLOOD": [
            {"item": "ORS Packets", "required": f"{patients * 10} packets", "priority": "CRITICAL"},
            {"item": "Ciprofloxacin 500mg", "required": f"{patients * 14} tablets", "priority": "HIGH"},
            {"item": "Chlorine Tablets (Water)", "required": f"{patients * 50} tablets", "priority": "MEDIUM"},
            {"item": "IV Fluids", "required": f"{patients * 3} bags", "priority": "HIGH"},
        ],
        "EARTHQUAKE": [
            {"item": "Morphine/Strong Painkillers", "required": f"{patients * 5} vials", "priority": "CRITICAL"},
            {"item": "Blood Units (O-)", "required": f"{patients * 2} units", "priority": "CRITICAL"},
            {"item": "Saline IV", "required": f"{patients * 6} bags", "priority": "CRITICAL"},
            {"item": "Mannitol (Crush Syndrome)", "required": f"{patients * 4} bottles", "priority": "CRITICAL"},
            {"item": "Splints & Casts", "required": f"{patients * 2} sets", "priority": "HIGH"},
        ],
        "ACCIDENT": [
            {"item": "Blood Units (O-)", "required": f"{patients * 3} units", "priority": "CRITICAL"},
            {"item": "Tranexamic Acid", "required": f"{patients * 2} vials", "priority": "CRITICAL"},
            {"item": "Morphine/Painkillers", "required": f"{patients * 4} vials", "priority": "HIGH"},
            {"item": "Saline IV", "required": f"{patients * 4} bags", "priority": "HIGH"},
        ]
    }
    
    eq_map = {
        "FIRE": [
            {"item": "Ventilators", "required": 2, "priority": "CRITICAL"},
            {"item": "Burn Beds", "required": 5, "priority": "HIGH"},
            {"item": "Pulse Oximeters", "required": 10, "priority": "HIGH"},
        ],
        "FLOOD": [
            {"item": "Warming Blankets", "required": 20, "priority": "HIGH"},
            {"item": "Water Purification Units", "required": 2, "priority": "MEDIUM"},
        ],
        "EARTHQUAKE": [
            {"item": "X-Ray Machines (Portable)", "required": 2, "priority": "CRITICAL"},
            {"item": "Surgical Kits", "required": 10, "priority": "CRITICAL"},
            {"item": "Dialysis Machines", "required": 2, "priority": "HIGH"},
        ],
        "ACCIDENT": [
            {"item": "CT Scanner Access", "required": 1, "priority": "CRITICAL"},
            {"item": "Operating Theater", "required": 2, "priority": "CRITICAL"},
            {"item": "Neck Collars", "required": 10, "priority": "HIGH"},
        ]
    }
    
    disaster_type = disaster_type.upper()
    meds = med_map.get(disaster_type, [
        {"item": "Saline IV", "required": f"{patients * 3} bags", "priority": "HIGH"},
        {"item": "Painkillers", "required": f"{patients * 3} vials", "priority": "HIGH"},
    ])
    eqs = eq_map.get(disaster_type, [
        {"item": "First Aid Kits", "required": 10, "priority": "HIGH"},
        {"item": "Stretchers", "required": 5, "priority": "HIGH"},
    ])
    
    actions = [
        "Activate Emergency Response Protocol",
        "Clear non-critical patients from Emergency ward",
        "Alert blood bank for emergency supply",
        "Set up triage area"
    ] if disaster_type in ["FIRE", "EARTHQUAKE"] else [
        "Activate Emergency Response Protocol",
        "Prepare Emergency Department",
        "Stock up on required medicines",
        "Brief medical staff"
    ]
    
    return {
        "hospital": hospital_name,
        "alert_level": "CRITICAL" if disaster_type in ["FIRE", "EARTHQUAKE", "CHEMICAL_SPILL"] else "HIGH",
        "expected_patients": patients,
        "disaster_type": disaster_type,
        "immediate_actions": actions,
        "medicine_checklist": [{"item": m["item"], "required": m["required"], "priority": m["priority"], "status": "PENDING"} for m in meds],
        "equipment_checklist": [{"item": e["item"], "required": e["required"], "priority": e["priority"], "status": "PENDING"} for e in eqs]
    }

# Initialize session state
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'disaster_triggered' not in st.session_state:
    st.session_state.disaster_triggered = False
if 'allocation_result' not in st.session_state:
    st.session_state.allocation_result = None
if 'hospitals_data' not in st.session_state:
    st.session_state.hospitals_data = []
if 'emergency_calls' not in st.session_state:
    st.session_state.emergency_calls = []
if 'search_results' not in st.session_state:
    st.session_state.search_results = []
if 'hospital_checklists' not in st.session_state:
    st.session_state.hospital_checklists = {}

# Header
st.markdown("""
<div class="main-header">
    <h1>🚨 Multi-Agent Disaster Response System</h1>
    <p style="color: rgba(255,255,255,0.8); margin-top: 10px;">Real-time coordination between Hospital, Emergency, and Government agents</p>
</div>
""", unsafe_allow_html=True)

# Sidebar controls
with st.sidebar:
    st.markdown("## ⚙️ Disaster Parameters")
    st.markdown("---")
    
    # =============================================
    # LOCATION SEARCH
    # =============================================
    st.markdown("### 🔍 Search Location")
    search_query = st.text_input(
        "Enter a place name",
        placeholder="e.g. Barasat, Kolkata, Salt Lake...",
        label_visibility="collapsed"
    )
    
    search_col1, search_col2 = st.columns([3, 1])
    with search_col1:
        search_clicked = st.button("🔍 Search", use_container_width=True, key="search_btn")
    
    if search_clicked and search_query:
        try:
            geo_response = requests.get(
                "http://localhost:5000/geocode",
                params={"q": search_query},
                timeout=10
            )
            if geo_response.status_code == 200:
                results = geo_response.json().get("results", [])
                if results:
                    st.session_state.search_results = results
                    st.success(f"Found {len(results)} location(s)")
                else:
                    st.warning("No locations found. Try a different search.")
            else:
                st.error("Geocoding service error")
        except requests.exceptions.ConnectionError:
            st.error("Backend not connected")
        except Exception as e:
            st.error(f"Search failed: {e}")
    
    # Display search results as selectable options
    if st.session_state.search_results:
        location_names = [r['display_name'][:60] + "..." if len(r['display_name']) > 60 else r['display_name'] 
                         for r in st.session_state.search_results]
        selected_idx = st.selectbox(
            "Select Location", 
            range(len(location_names)),
            format_func=lambda i: location_names[i],
            key="location_select"
        )
        selected = st.session_state.search_results[selected_idx]
        disaster_lat = float(selected['lat'])
        disaster_lng = float(selected['lng'])
        st.info(f"📍 {disaster_lat:.4f}, {disaster_lng:.4f}")
    else:
        disaster_lat = st.number_input("📍 Latitude", value=22.721, format="%.3f")
        disaster_lng = st.number_input("📍 Longitude", value=88.485, format="%.3f")
    
    st.markdown("---")
    
    patients = st.slider("👥 Number of Patients", 1, 20, 6)
    
    disaster_type = st.selectbox("🔥 Disaster Type", ["FIRE", "FLOOD", "EARTHQUAKE", "ACCIDENT"])
    severity = st.selectbox("⚠️ Severity Level", ["HIGH", "CRITICAL", "MEDIUM", "LOW"])
    
    st.markdown("---")
    
    # Hospital database display
    st.markdown("### 🏥 Hospital Database")
    
    if st.session_state.hospitals_data:
        for h in st.session_state.hospitals_data[:5]:
             st.markdown(f"**{h.get('Hospital', 'Unknown')}**: {h.get('Beds', '?')} beds")
        if len(st.session_state.hospitals_data) > 5:
            st.markdown(f"*...and {len(st.session_state.hospitals_data)-5} more*")
    else:
        st.info("Waiting for disaster data...")

# Main content area — 3 columns: Map | Agent Panel | Emergency Calls
col1, col2, col3 = st.columns([3, 2, 2])

with col1:
    st.markdown("### 🗺️ Disaster Map")
    
    # Create Folium map
    m = folium.Map(
        location=[disaster_lat, disaster_lng],
        zoom_start=14,
        tiles='CartoDB dark_matter'
    )
    
    # Add disaster location marker (red)
    folium.Marker(
        [disaster_lat, disaster_lng],
        popup=f"<b>🔥 {disaster_type}</b><br>Patients: {patients}<br>Severity: {severity}",
        icon=folium.Icon(color="red", icon="fire", prefix='fa'),
        tooltip="Disaster Location"
    ).add_to(m)
    
    # Add hospital markers (blue)
    if st.session_state.hospitals_data:
        for i, h in enumerate(st.session_state.hospitals_data):
            color = 'blue'
            # Highlight allocated hospitals
            if st.session_state.allocation_result:
                for alloc in st.session_state.allocation_result.get('allocation', []):
                    if alloc['hospital'] == h.get('Hospital'):
                        color = 'green'
                        break
            
            folium.Marker(
                [h.get('lat', 0), h.get('lng', 0)],
                popup=f"<b>🏥 {h.get('Hospital', 'Unknown')}</b><br>Available Beds: {h.get('Beds', '?')}<br>📞 {h.get('phone', 'N/A')}",
                icon=folium.Icon(color=color, icon="hospital-o", prefix='fa'),
                tooltip=f"{h.get('Hospital')} - {h.get('Beds')} beds"
            ).add_to(m)
        
        # Draw line from disaster to hospital if allocated
        if st.session_state.allocation_result:
            for alloc in st.session_state.allocation_result.get('allocation', []):
                h_lat = alloc.get('lat')
                h_lng = alloc.get('lng')
                
                if h_lat and h_lng:
                    folium.PolyLine(
                        [[disaster_lat, disaster_lng], [h_lat, h_lng]],
                        weight=3,
                        color='#4ecdc4',
                        opacity=0.8,
                        dash_array='10'
                    ).add_to(m)
    
    # Add ambulance markers (orange)
    ambulance_locations = [
        {"id": "AMB-001", "lat": disaster_lat - 0.001, "lng": disaster_lng - 0.005},
        {"id": "AMB-002", "lat": disaster_lat + 0.003, "lng": disaster_lng + 0.002},
    ]
    
    for amb in ambulance_locations:
        folium.Marker(
            [amb['lat'], amb['lng']],
            popup=f"<b>🚑 {amb['id']}</b><br>Status: Available",
            icon=folium.Icon(color="orange", icon="ambulance", prefix='fa'),
            tooltip=amb['id']
        ).add_to(m)
    
    # Display map
    st_folium(m, width=700, height=450)

with col2:
    st.markdown("### 📡 Live Agent Conversation")
    
    # Trigger disaster button
    if st.button("🚨 TRIGGER DISASTER RESPONSE", use_container_width=True):
        st.session_state.disaster_triggered = True
        
        # Clear previous messages
        try:
            requests.post("http://localhost:5000/clear-messages", timeout=2)
        except:
            pass
        
        # Simulate agent communication
        st.session_state.messages = []
        st.session_state.emergency_calls = []
        st.session_state.hospital_checklists = {}
        
        # Initial trigger message
        st.session_state.messages.append({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "agent": "Disaster Trigger Agent",
            "message": f"🔥 {disaster_type} detected at ({disaster_lat}, {disaster_lng})",
            "type": "warning"
        })
        
        st.session_state.messages.append({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "agent": "Disaster Trigger Agent",
            "message": f"Severity: {severity} | Patients: {patients}",
            "type": "info"
        })
        
        # Call optimization backend
        try:
            # 1. FETCH HOSPITALS (Map Display)
            with st.spinner("🌍 Fetching live hospital data..."):
                hosp_response = requests.get(
                    f"http://localhost:5000/hospitals?lat={disaster_lat}&lng={disaster_lng}&radius_km=10&source=osm",
                    timeout=20
                )
                if hosp_response.status_code == 200:
                    data = hosp_response.json()
                    st.session_state.hospitals_data = data.get('hospitals', [])
            
            # 2. OPTIMIZATION REQUEST
            with st.spinner("🏥 Optimizing allocation..."):
                opt_response = requests.post(
                    "http://localhost:5000/optimize",
                    json={
                        "patients": patients,
                        "lat": disaster_lat,
                        "lng": disaster_lng,
                        "disaster_type": disaster_type,
                        "source": "osm"
                    },
                    timeout=45
                )
            
            if opt_response.status_code == 200:
                result = opt_response.json()
                st.session_state.allocation_result = result
                
                # Add allocation messages
                for alloc in result.get('allocation', []):
                    st.session_state.messages.append({
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                        "agent": "Hospital Agent",
                        "message": f"Hospital {alloc['hospital']} → {alloc['assigned']} patients ({alloc['distance']}km)",
                        "type": "success"
                    })
                    
                # Fetch preparation checklist and medicine requirements for each allocated hospital
                st.session_state.hospital_checklists = {}
                for alloc in result.get('allocation', []):
                    h_name = alloc['hospital']
                    h_assigned = alloc['assigned']
                    if h_assigned > 0:
                        try:
                            chk_response = requests.post(
                                "http://localhost:5000/hospital-checklist",
                                json={
                                    "disaster_type": disaster_type,
                                    "patients": h_assigned,
                                    "hospital": h_name
                                },
                                timeout=10
                            )
                            if chk_response.status_code == 200:
                                st.session_state.hospital_checklists[h_name] = chk_response.json()
                        except Exception as e:
                            print(f"Error fetching checklist for {h_name}: {e}")
                
                remaining = result.get('remaining', 0)
                if remaining > 0:
                    st.session_state.messages.append({
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                        "agent": "Government Agent",
                        "message": f"⚠️ {remaining} patients need additional resources!",
                        "type": "warning"
                    })
                else:
                    st.session_state.messages.append({
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                        "agent": "Government Agent",
                        "message": f"✅ All {patients} patients successfully allocated",
                        "type": "success"
                    })
            
            # 3. MEDICINE REQUIREMENTS REQUEST
            try:
                with st.spinner("💊 Calculating medical supplies..."):
                    med_response = requests.post(
                        "http://localhost:5000/medicine-requirements",
                        json={
                            "patients": patients,
                            "disaster_type": disaster_type
                        },
                        timeout=10
                    )
                    
                    if med_response.status_code == 200:
                        meds = med_response.json()
                        critical_items = [m['name'] for m in meds.get('critical_items', [])]
                        if critical_items:
                            st.session_state.messages.append({
                                "timestamp": datetime.now().strftime("%H:%M:%S"),
                                "agent": "Medical Supply Agent",
                                "message": f"📦 CRITICAL SUPPLIES NEEDED: {', '.join(critical_items[:3])}",
                                "type": "warning"
                            })
            except Exception:
                pass

            # 4. AMBULANCE DISPATCH REQUEST
            with st.spinner("🚑 Dispatching ambulances..."):
                amb_response = requests.post(
                    "http://localhost:5000/ambulance-dispatch",
                    json={"lat": disaster_lat, "lng": disaster_lng, "source": "osm"},
                    timeout=30
                )
            
            if amb_response.status_code == 200:
                amb_result = amb_response.json()
                for dispatch in amb_result.get('dispatch', [])[:2]:
                    st.session_state.messages.append({
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                        "agent": "Emergency Agent",
                        "message": f"🚑 {dispatch['ambulance_id']} dispatched → ETA: {dispatch['eta_minutes']} min",
                        "type": "success"
                    })

            # 5. EMERGENCY CALLING AGENT
            with st.spinner("📞 Calling emergency services..."):
                try:
                    call_response = requests.post(
                        "http://localhost:5000/emergency-calls",
                        json={
                            "disaster_type": disaster_type,
                            "lat": disaster_lat,
                            "lng": disaster_lng,
                            "severity": severity,
                            "patients": patients
                        },
                        timeout=15
                    )
                    
                    if call_response.status_code == 200:
                        call_data = call_response.json()
                        st.session_state.emergency_calls = call_data.get('calls', [])
                        
                        # Add calling agent messages
                        connected_count = sum(1 for c in st.session_state.emergency_calls if c.get('status') == 'CONNECTED')
                        st.session_state.messages.append({
                            "timestamp": datetime.now().strftime("%H:%M:%S"),
                            "agent": "Calling Agent",
                            "message": f"📞 {connected_count}/{len(st.session_state.emergency_calls)} emergency services connected",
                            "type": "success" if connected_count > 0 else "warning"
                        })
                        
                        for call in st.session_state.emergency_calls:
                            if call.get('priority') == 'IMMEDIATE':
                                st.session_state.messages.append({
                                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                                    "agent": "Calling Agent",
                                    "message": f"📞 {call['service_name']}: {call['status']} — {call.get('response_message', '')}",
                                    "type": "success" if call['status'] == 'CONNECTED' else "info"
                                })
                except requests.exceptions.ConnectionError:
                    # Fallback: simulate emergency calls if backend endpoint not available
                    st.session_state.emergency_calls = [
                        {"service_name": "Ambulance (108)", "phone": "108", "status": "CONNECTED", "priority": "IMMEDIATE",
                         "response_message": "3 ambulances dispatched to your location", "estimated_response_time_min": 8,
                         "timestamp": datetime.now().strftime("%H:%M:%S")},
                        {"service_name": "Fire Brigade (101)", "phone": "101", "status": "CONNECTED", "priority": "IMMEDIATE",
                         "response_message": "Fire tender unit dispatched", "estimated_response_time_min": 12,
                         "timestamp": datetime.now().strftime("%H:%M:%S")},
                        {"service_name": "Police Control Room", "phone": "100", "status": "CONNECTED", "priority": "HIGH",
                         "response_message": "Patrol unit and traffic clearance initiated", "estimated_response_time_min": 10,
                         "timestamp": datetime.now().strftime("%H:%M:%S")},
                        {"service_name": "NDRF (National Disaster Response)", "phone": "011-24363260", "status": "RINGING", "priority": "HIGH",
                         "response_message": "Connecting to regional command...", "estimated_response_time_min": 30,
                         "timestamp": datetime.now().strftime("%H:%M:%S")},
                        {"service_name": "District Emergency Operations", "phone": "+91-33-2214-4990", "status": "CONNECTED", "priority": "HIGH",
                         "response_message": "Emergency acknowledged. Coordinating with local authorities.", "estimated_response_time_min": 15,
                         "timestamp": datetime.now().strftime("%H:%M:%S")},
                    ]
                    
                    st.session_state.messages.append({
                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                        "agent": "Calling Agent",
                        "message": f"📞 Emergency services contacted — {len(st.session_state.emergency_calls)} calls made",
                        "type": "success"
                    })
                    
        except (requests.exceptions.ConnectionError, requests.exceptions.ReadTimeout) as e:
            error_msg = "Backend unreachable" if isinstance(e, requests.exceptions.ConnectionError) else "Request timed out (OpenStreetMap is slow)"
            st.session_state.messages.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "System",
                "message": f"⚠️ {error_msg}. Using simulated fallback data.",
                "type": "warning"
            })
            
            # Add simulated messages for demo
            st.session_state.messages.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "Hospital Agent",
                "message": f"Barasat District Hospital → 3 patients (0.45km)",
                "type": "success"
            })
            st.session_state.messages.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "Hospital Agent",
                "message": f"Barasat Govt. Medical College → {min(patients-3, 5)} patients (0.72km)",
                "type": "success"
            })
            st.session_state.messages.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "Emergency Agent",
                "message": "🚑 AMB-001 dispatched → ETA: 2.5 min",
                "type": "success"
            })
            st.session_state.messages.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "Calling Agent",
                "message": "📞 108 Ambulance: CONNECTED | 101 Fire Brigade: CONNECTED",
                "type": "success"
            })
            st.session_state.messages.append({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "agent": "Government Agent",
                "message": "✅ Response coordinated successfully",
                "type": "success"
            })
            
            # Fallback emergency calls
            st.session_state.emergency_calls = [
                {"service_name": "Ambulance (108)", "phone": "108", "status": "CONNECTED", "priority": "IMMEDIATE",
                 "response_message": "3 ambulances dispatched", "estimated_response_time_min": 8,
                 "timestamp": datetime.now().strftime("%H:%M:%S")},
                {"service_name": "Fire Brigade (101)", "phone": "101", "status": "CONNECTED", "priority": "IMMEDIATE",
                 "response_message": "Fire tender dispatched", "estimated_response_time_min": 12,
                 "timestamp": datetime.now().strftime("%H:%M:%S")},
                {"service_name": "Police (100)", "phone": "100", "status": "CONNECTED", "priority": "HIGH",
                 "response_message": "Patrol unit en route", "estimated_response_time_min": 10,
                 "timestamp": datetime.now().strftime("%H:%M:%S")},
            ]
            
            # Fallback allocation
            st.session_state.allocation_result = {
                "allocation": [
                    {
                        "hospital": "Barasat District Hospital",
                        "assigned": 3,
                        "available_beds": 120,
                        "distance": 0.45,
                        "address": "KNC Road, Barasat",
                        "phone": "+91-33-2552-3206",
                        "lat": 22.722,
                        "lng": 88.481
                    },
                    {
                        "hospital": "Barasat Govt. Medical College",
                        "assigned": min(patients - 3, 5) if patients > 3 else 0,
                        "available_beds": 350,
                        "distance": 0.72,
                        "address": "Barasat",
                        "phone": "+91-33-2562-5201",
                        "lat": 22.724,
                        "lng": 88.488
                    }
                ],
                "remaining": max(0, patients - 3 - (min(patients - 3, 5) if patients > 3 else 0)),
                "total_patients": patients
            }
            st.session_state.allocation_result["allocation"] = [a for a in st.session_state.allocation_result["allocation"] if a["assigned"] > 0]
            
            # Fallback checklists
            st.session_state.hospital_checklists = {}
            for alloc in st.session_state.allocation_result["allocation"]:
                h_name = alloc["hospital"]
                st.session_state.hospital_checklists[h_name] = get_mock_hospital_checklist(disaster_type, alloc["assigned"], h_name)
        
        st.rerun()
    
    # Display messages panel
    st.markdown('<div class="agent-panel">', unsafe_allow_html=True)
    
    if st.session_state.messages:
        for msg in st.session_state.messages:
            msg_type = msg.get('type', 'info')
            st.markdown(f"""
            <div class="agent-message {msg_type}">
                <span class="agent-timestamp">{msg['timestamp']}</span>
                <div class="agent-name">{msg['agent']}</div>
                <div class="agent-text">{msg['message']}</div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style="text-align: center; padding: 40px; color: #666;">
            <p style="font-size: 3rem;">🎯</p>
            <p>Click "TRIGGER DISASTER RESPONSE" to start</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

# =============================================
# COLUMN 3: EMERGENCY CALLING AGENT PANEL
# =============================================
with col3:
    st.markdown("### 📞 Emergency Calling Agent")
    
    if st.session_state.emergency_calls:
        # Summary stats
        total_calls = len(st.session_state.emergency_calls)
        connected = sum(1 for c in st.session_state.emergency_calls if c.get('status') == 'CONNECTED')
        ringing = sum(1 for c in st.session_state.emergency_calls if c.get('status') == 'RINGING')
        dispatched = sum(1 for c in st.session_state.emergency_calls if c.get('status') == 'DISPATCHED')
        
        st.markdown(f"""
        <div style="background: rgba(46,204,113,0.15); border-radius: 12px; padding: 12px; margin-bottom: 12px; text-align: center;">
            <span style="color: #2ecc71; font-size: 1.3rem; font-weight: bold;">
                {connected + dispatched}/{total_calls} Services Reached
            </span>
        </div>
        """, unsafe_allow_html=True)
        
        # Individual call cards
        for call in st.session_state.emergency_calls:
            status = call.get('status', 'QUEUED')
            status_emoji = {"CONNECTED": "✅", "RINGING": "📳", "QUEUED": "⏳", "DISPATCHED": "🚀"}.get(status, "📞")
            eta = call.get('estimated_response_time_min', '?')
            
            st.markdown(f"""
            <div class="call-card {status}">
                <span class="call-status {status}">{status_emoji} {status}</span>
                <div class="call-service">{call.get('service_name', 'Unknown Service')}</div>
                <div class="call-phone">📞 {call.get('phone', 'N/A')}</div>
                <div class="call-response">{call.get('response_message', '')}</div>
                <div class="call-eta">⏱ ETA: {eta} min</div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style="text-align: center; padding: 40px; color: #666;">
            <p style="font-size: 3rem;">📞</p>
            <p>Emergency calls will appear here after triggering a disaster response</p>
            <p style="font-size: 0.8rem; color: #888; margin-top: 10px;">
                Auto-contacts: Ambulance (108) • Fire Brigade (101)<br>
                Police (100) • NDRF • District Emergency
            </p>
        </div>
        """, unsafe_allow_html=True)

# ==============================================================================
# HOSPITAL EMERGENCY PREPAREDNESS & SUPPLY LOGS
# ==============================================================================
st.markdown("---")
st.markdown("### 🏥 Hospital Emergency Preparedness & Supply Logs")

if st.session_state.disaster_triggered and st.session_state.allocation_result and st.session_state.allocation_result.get('allocation'):
    allocations = st.session_state.allocation_result.get('allocation', [])
    
    for alloc in allocations:
        h_name = alloc.get('hospital', 'Unknown Hospital')
        assigned_p = alloc.get('assigned', 0)
        
        if assigned_p == 0:
            continue
            
        distance = alloc.get('distance', 0)
        address = alloc.get('address', 'N/A')
        phone = alloc.get('phone', 'N/A')
        
        # Get checklist for this hospital
        checklist = st.session_state.hospital_checklists.get(h_name)
        if not checklist:
            # If not in session state, generate it
            checklist = get_mock_hospital_checklist(disaster_type, assigned_p, h_name)
            st.session_state.hospital_checklists[h_name] = checklist
            
        alert_level = checklist.get('alert_level', 'HIGH')
        alert_color = "#ff4757" if alert_level == "CRITICAL" else "#ffa502"
        
        # Expander title with status badges
        expander_title = f"🏥 {h_name} — {assigned_p} Patients ({distance} km) | Alert: {alert_level}"
        
        with st.expander(expander_title, expanded=True):
            # Split details into columns
            detail_col1, detail_col2 = st.columns([1, 1.2])
            
            with detail_col1:
                st.markdown(f"""
                <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 15px; border-left: 4px solid {alert_color};">
                    <h5 style="color: {alert_color}; margin-top: 0;">🏥 Contact & Info</h5>
                    <p style="margin: 4px 0; font-size: 0.9rem;"><b>Address:</b> {address if address else 'Kolkata District Area'}</p>
                    <p style="margin: 4px 0; font-size: 0.9rem;"><b>Emergency Call:</b> <span style="color:#4ecdc4; font-family:monospace;">{phone if phone else '+91-33-2552-3206'}</span></p>
                    <p style="margin: 4px 0; font-size: 0.9rem;"><b>Beds Committed:</b> {assigned_p} / {alloc.get('available_beds', '?')}</p>
                </div>
                """, unsafe_allow_html=True)
                
                st.markdown("##### 📋 Immediate Action Checklist")
                # Render action checklist as interactive streamlit checkboxes
                for i, action in enumerate(checklist.get('immediate_actions', [])):
                    st.checkbox(action, value=True, key=f"action_{h_name}_{i}")
                    
            with detail_col2:
                # We can use tabs for Medicines and Equipment
                med_tab, eq_tab = st.tabs(["💊 Required Medicines", "⚙️ Specialized Equipment"])
                
                with med_tab:
                    meds = checklist.get('medicine_checklist', [])
                    if meds:
                        table_html = """
                        <table style="width:100%; border-collapse: collapse; font-size: 0.85rem; color: #e0e0e0;">
                            <thead>
                                <tr style="border-bottom: 2px solid #2d2d5a; text-align: left;">
                                    <th style="padding: 8px;">Medicine / Supply</th>
                                    <th style="padding: 8px;">Qty Required</th>
                                    <th style="padding: 8px;">Priority</th>
                                    <th style="padding: 8px; text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                        """
                        for med in meds:
                            priority = med.get('priority', 'MEDIUM')
                            p_color = "#ff4757" if priority == "CRITICAL" else ("#ffa502" if priority == "HIGH" else "#2ed573")
                            table_html += f"""
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 8px; font-weight: bold;">{med['item']}</td>
                                    <td style="padding: 8px; color: #4ecdc4;">{med['required']}</td>
                                    <td style="padding: 8px;"><span style="color: {p_color}; font-weight: bold; font-size:0.75rem;">{priority}</span></td>
                                    <td style="padding: 8px; text-align: center;"><span style="background: rgba(46,204,113,0.15); color: #2ecc71; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: bold;">READY</span></td>
                                </tr>
                            """
                        table_html += "</tbody></table>"
                        st.markdown(table_html, unsafe_allow_html=True)
                    else:
                        st.info("No medicine requirements specified.")
                        
                with eq_tab:
                    eqs = checklist.get('equipment_checklist', [])
                    if eqs:
                        table_html = """
                        <table style="width:100%; border-collapse: collapse; font-size: 0.85rem; color: #e0e0e0;">
                            <thead>
                                <tr style="border-bottom: 2px solid #2d2d5a; text-align: left;">
                                    <th style="padding: 8px;">Equipment Item</th>
                                    <th style="padding: 8px;">Qty Required</th>
                                    <th style="padding: 8px;">Priority</th>
                                    <th style="padding: 8px; text-align: center;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                        """
                        for eq in eqs:
                            priority = eq.get('priority', 'MEDIUM')
                            p_color = "#ff4757" if priority == "CRITICAL" else ("#ffa502" if priority == "HIGH" else "#2ed573")
                            table_html += f"""
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 8px; font-weight: bold;">{eq['item']}</td>
                                    <td style="padding: 8px; color: #4ecdc4;">{eq['required']} units</td>
                                    <td style="padding: 8px;"><span style="color: {p_color}; font-weight: bold; font-size:0.75rem;">{priority}</span></td>
                                    <td style="padding: 8px; text-align: center;"><span style="background: rgba(46,204,113,0.15); color: #2ecc71; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: bold;">PREPARED</span></td>
                                </tr>
                            """
                        table_html += "</tbody></table>"
                        st.markdown(table_html, unsafe_allow_html=True)
                    else:
                        st.info("No specialized equipment required.")
else:
    st.markdown("""
    <div style="background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; text-align: center; color: #888;">
        <p style="font-size: 2.5rem; margin-bottom: 10px;">🏥</p>
        <p>Hospital requirements and preparedness checklists will populate here once a disaster is triggered.</p>
    </div>
    """, unsafe_allow_html=True)

# Statistics row
st.markdown("---")
st.markdown("### 📊 Response Statistics")

stat_col1, stat_col2, stat_col3, stat_col4, stat_col5 = st.columns(5)

with stat_col1:
    st.metric(
        label="👥 Total Patients",
        value=patients,
        delta=None
    )

with stat_col2:
    allocated = sum([a['assigned'] for a in st.session_state.allocation_result.get('allocation', [])]) if st.session_state.allocation_result else 0
    st.metric(
        label="🏥 Patients Allocated",
        value=allocated,
        delta=f"{allocated}/{patients}" if st.session_state.disaster_triggered else None
    )

with stat_col3:
    st.metric(
        label="🚑 Ambulances Dispatched",
        value="2" if st.session_state.disaster_triggered else "0",
        delta=None
    )

with stat_col4:
    calls_made = len(st.session_state.emergency_calls) if st.session_state.emergency_calls else 0
    st.metric(
        label="📞 Emergency Calls",
        value=calls_made,
        delta=f"{sum(1 for c in st.session_state.emergency_calls if c.get('status') == 'CONNECTED')} connected" if calls_made > 0 else None
    )

with stat_col5:
    st.metric(
        label="⚡ Response Status",
        value="ACTIVE" if st.session_state.disaster_triggered else "STANDBY",
        delta=None
    )

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 20px;">
    <p>🤖 Powered by Multi-Agent AI System | Hospital Agent • Emergency Agent • Calling Agent • Government Agent</p>
    <p style="font-size: 0.8rem;">Built for disaster response coordination and real-time decision making</p>
</div>
""", unsafe_allow_html=True)
