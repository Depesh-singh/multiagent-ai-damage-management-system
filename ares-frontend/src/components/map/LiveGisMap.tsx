import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon paths in modern bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  incidents?: any[];
  hospitals?: any[];
  ambulances?: any[];
  rescueTeams?: any[];
  shelters?: any[];
  routes?: any[];
  riskZones?: any[];
  roadClosures?: any[];
  selectedIncident?: any;
  onSelectIncident?: (inc: any) => void;
}

const CARTO_API_KEY =
  (import.meta as any).env?.VITE_CARTO_API_KEY ||
  'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfemM4M3U2cjgiLCJqdGkiOiI5NzIxNWIwOGQ1ODYyMDVhOGE2MTYzYjdjNWQ3MjBlOSJ9.qlVKkfKfwBHeqlXxLrekoLQdi2re30r5Yx4CXPpA1xM';

type BasemapStyle = 'tactical_dark' | 'disaster_hot' | 'osm_streets' | 'satellite' | 'carto_dark';

const BASEMAP_CONFIGS: Record<BasemapStyle, {
  name: string;
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom: number;
  className?: string;
}> = {
  tactical_dark: {
    name: 'Tactical Dark (High-Contrast)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: 'tactical-dark-tile',
  },
  disaster_hot: {
    name: 'Disaster HOT (Emergency Map)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.hotosm.org/">Humanitarian OSM</a> &copy; OpenStreetMap',
    subdomains: 'abc',
    maxZoom: 19,
  },
  osm_streets: {
    name: 'Standard OSM Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'World Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
    maxZoom: 18,
  },
  carto_dark: {
    name: 'CartoDB Dark Matter',
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?api_key=${CARTO_API_KEY}`,
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

export const LiveGisMap: React.FC<MapProps> = ({
  incidents = [],
  hospitals = [],
  ambulances = [],
  rescueTeams = [],
  shelters = [],
  routes = [],
  riskZones = [],
  roadClosures = [],
  selectedIncident,
  onSelectIncident,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const lastFocusedIncidentIdRef = useRef<string | null>(null);

  // Basemap style selector (Defaults to 100% Reliable Tactical Dark)
  const [mapStyle, setMapStyle] = useState<BasemapStyle>('tactical_dark');

  // Layer filter toggles
  const [layers, setLayers] = useState({
    incidents: true,
    hospitals: true,
    ambulances: true,
    rescueTeams: true,
    shelters: true,
    riskZones: true,
    routes: true,
  });

  // Switch basemap layer dynamically
  const applyTileLayer = (map: L.Map, style: BasemapStyle) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    const cfg = BASEMAP_CONFIGS[style] || BASEMAP_CONFIGS.tactical_dark;
    const tileOptions: L.TileLayerOptions = {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      className: cfg.className,
    };
    if (cfg.subdomains) {
      tileOptions.subdomains = cfg.subdomains;
    }

    const tile = L.tileLayer(cfg.url, tileOptions);

    // Automatic fallback: if an external tile fails or gets blocked by client ISP/adblocker, fallback to OSM
    tile.on('tileerror', (event: any) => {
      if (event.tile && event.coords) {
        const fallback = `https://tile.openstreetmap.org/${event.coords.z}/${event.coords.x}/${event.coords.y}.png`;
        if (event.tile.src !== fallback) {
          event.tile.src = fallback;
        }
      }
    });

    tile.addTo(map);
    tileLayerRef.current = tile;
  };

  // Initialize Leaflet map with React 18 StrictMode safety
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Remove stale Leaflet ID to avoid "Map container is already initialized" during hot reloads
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Default center on Kolkata Operations Command
    const map = L.map(mapContainerRef.current, {
      center: [22.5620, 88.3639],
      zoom: 13,
      zoomControl: false,
    });

    applyTileLayer(map, mapStyle);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Trigger invalidateSize after CSS flexbox / grid layout renders
    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 600);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    // Responsive container observer
    let ro: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      layerGroupRef.current = null;
      tileLayerRef.current = null;
      labelLayerRef.current = null;
    };
  }, []);

  // Update tile layer whenever user changes style
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, mapStyle);
    }
  }, [mapStyle]);

  // Update map markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Invalidate size on data update to ensure sharp tile rendering
    map.invalidateSize();

    // 1. Risk Zones (Concentric circles)
    if (layers.riskZones && riskZones && riskZones.length > 0) {
      riskZones.forEach((z) => {
        if (!z.center || typeof z.center.lat !== 'number') return;
        const circle = L.circle([z.center.lat, z.center.lng], {
          radius: z.radius_meters || 1000,
          color: z.color || '#EF4444',
          weight: 2,
          opacity: 0.8,
          fillColor: z.color || '#EF4444',
          fillOpacity: z.fill_opacity || 0.2,
          dashArray: z.type === 'EVACUATION_ZONE' ? '6, 6' : undefined,
        });
        circle.bindTooltip(`<b>${z.label || 'Risk Zone'}</b><br/>${z.access_rule || 'Evacuate'}`, { sticky: true });
        circle.addTo(group);
      });
    }

    // 2. Road Closures
    if (roadClosures && roadClosures.length > 0) {
      roadClosures.forEach((rc) => {
        if (typeof rc.lat !== 'number' || typeof rc.lng !== 'number') return;
        const closureMarker = L.circleMarker([rc.lat, rc.lng], {
          radius: 8,
          color: '#EF4444',
          fillColor: '#EF4444',
          fillOpacity: 0.9,
          weight: 3,
        });
        closureMarker.bindPopup(`
          <div class="p-2 text-xs">
            <div class="text-red-400 font-bold mb-1">🚫 ROAD CLOSED</div>
            <div class="font-semibold text-white mb-1">${rc.road_name || 'Corridor Closed'}</div>
            <div class="text-slate-300 mb-1"><b>Reason:</b> ${rc.reason || 'Structural Damage'}</div>
            <div class="text-emerald-400"><b>Bypass:</b> ${rc.bypass_corridor || 'Alternative route assigned'}</div>
          </div>
        `);
        closureMarker.addTo(group);
      });
    }

    // 3. Evacuation Corridors & Green Wave Routes
    if (layers.routes && routes && routes.length > 0) {
      routes.forEach((r) => {
        if (r.waypoints && r.waypoints.length > 1) {
          const latlngs = r.waypoints.map((w: any) => [w.lat, w.lng]);
          const polyline = L.polyline(latlngs, {
            color: '#23B9D6',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8',
          });
          polyline.bindTooltip(`<b>${r.destination_hospital || 'Route'}</b>: ${r.distance_km || 0}km (${r.estimated_minutes || 0} mins)`, { sticky: true });
          polyline.addTo(group);
        }
      });
    }

    // 4. Hospitals
    if (layers.hospitals && hospitals) {
      hospitals.forEach((h) => {
        if (typeof h.lat !== 'number' || typeof h.lng !== 'number') return;
        const icon = L.divIcon({
          className: 'custom-hosp-marker',
          html: `
            <div style="background-color: #131F31; border: 2px solid #22C55E; color: #22C55E; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);">
              🏥
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const marker = L.marker([h.lat, h.lng], { icon });
        marker.bindPopup(`
          <div class="p-2 text-xs leading-relaxed">
            <div class="font-bold text-emerald-400 text-sm mb-1">${h.name}</div>
            <div class="text-slate-300 text-[11px] mb-2">${h.address || ''}</div>
            <div class="grid grid-cols-2 gap-2 bg-[#0B1220] p-2 rounded mb-2 border border-[#1E3A5F]">
              <div>Available Beds: <b class="text-emerald-400">${h.available_beds ?? 45}</b></div>
              <div>ICU Ready: <b class="text-cyan-400">${h.icu_available ?? 12}</b></div>
              <div>Ventilators: <b class="text-slate-200">${h.ventilators_available ?? 6}</b></div>
              <div>Oxygen Cyl: <b class="text-slate-200">${h.oxygen_cylinders ?? 120}</b></div>
            </div>
            <div class="text-[11px] text-slate-400">📞 ${h.phone || '+91-33-2223-1589'}</div>
          </div>
        `);
        marker.addTo(group);
      });
    }

    // 5. Ambulances
    if (layers.ambulances && ambulances) {
      ambulances.forEach((a) => {
        const lat = a.lat || a.current_lat;
        const lng = a.lng || a.current_lng;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const isDispatched = a.status === 'DISPATCHED' || a.status === 'ASSIGNED_READY_FOR_DEPLOYMENT';
        const color = isDispatched ? '#23B9D6' : '#22C55E';
        const icon = L.divIcon({
          className: 'custom-amb-marker',
          html: `
            <div style="background-color: #131F31; border: 2px solid ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 8px ${color}80;">
              🚑
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-cyan-400 text-sm">${a.vehicle_number}</div>
            <div class="text-[11px] text-slate-300 mb-1">Type: <b>${a.ambulance_type || a.type || 'ALS'}</b> (Cap: ${a.capacity || 2} pts)</div>
            <div class="text-[11px] text-slate-300">Driver: ${a.driver_name || a.driver || 'Staff'} (${a.driver_phone || a.phone || '108'})</div>
            <div class="mt-2 text-[11px] px-2 py-0.5 rounded inline-block ${isDispatched ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}">
              ${a.status}
            </div>
          </div>
        `);
        marker.addTo(group);
      });
    }

    // 6. Rescue Teams
    if (layers.rescueTeams && rescueTeams) {
      rescueTeams.forEach((t) => {
        if (typeof t.lat !== 'number' || typeof t.lng !== 'number') return;
        const icon = L.divIcon({
          className: 'custom-rescue-marker',
          html: `
            <div style="background-color: #131F31; border: 2px solid #F59E0B; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);">
              🛡️
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([t.lat, t.lng], { icon });
        marker.bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-amber-400 text-sm mb-1">${t.name}</div>
            <div class="text-slate-300">Personnel: <b>${t.members_count || 30} Active Responders</b></div>
            <div class="text-slate-400 text-[11px] mt-1">Specialties: ${(t.skills || []).slice(0, 2).join(', ')}</div>
            <div class="text-slate-400 text-[11px]">📞 ${t.contact_phone || '112'}</div>
          </div>
        `);
        marker.addTo(group);
      });
    }

    // 7. Shelters
    if (layers.shelters && shelters) {
      shelters.forEach((s) => {
        if (typeof s.lat !== 'number' || typeof s.lng !== 'number') return;
        const icon = L.divIcon({
          className: 'custom-shelter-marker',
          html: `
            <div style="background-color: #131F31; border: 2px solid #3B82F6; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 13px;">
              ⛺
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const marker = L.marker([s.lat, s.lng], { icon });
        marker.bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-blue-400 mb-1">${s.name}</div>
            <div>Capacity: <b>${s.capacity}</b> (Occupancy: ${s.current_occupancy || 0})</div>
            <div class="text-slate-400 text-[11px] mt-1">${s.address || ''}</div>
          </div>
        `);
        marker.addTo(group);
      });
    }

    // 8. Incidents (Epicenters & Disaster sites)
    if (layers.incidents && incidents) {
      incidents.forEach((inc) => {
        if (typeof inc.location_lat !== 'number' || typeof inc.location_lng !== 'number') return;
        const isSelected = selectedIncident && (selectedIncident.id === inc.id);
        const icon = L.divIcon({
          className: 'custom-inc-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.22); border: 1.5px solid rgba(239, 68, 68, 0.6); box-shadow: 0 0 14px rgba(239, 68, 68, 0.5);"></div>
              <div style="background-color: #EF4444; color: white; width: 34px; height: 34px; border-radius: 50%; border: ${isSelected ? '3px solid #23B9D6' : '3px solid #FFFFFF'}; display: flex; align-items: center; justify-content: center; font-size: 16px; position: relative; z-index: 2; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);">
                ⚠️
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
        const marker = L.marker([inc.location_lat, inc.location_lng], { icon });
        marker.bindPopup(`
          <div class="p-2 text-xs">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-red-400 text-sm">${inc.source === 'USGS_REALTIME' ? 'REAL-TIME SEISMIC' : 'LEVEL 4 DISASTER'}</span>
              <span class="bg-red-950 text-red-300 px-1.5 py-0.5 rounded text-[10px] border border-red-800">${inc.status}</span>
            </div>
            <div class="font-semibold text-white mb-1">${inc.address}</div>
            <div class="text-[11px] text-amber-300 font-mono mb-1">📍 Lat: ${Number(inc.location_lat).toFixed(4)}, Lng: ${Number(inc.location_lng).toFixed(4)}</div>
            ${inc.source === 'USGS_REALTIME' ? '<div class="text-[10px] text-cyan-300 bg-cyan-950/70 p-1.5 rounded border border-cyan-800/80 mb-2 leading-relaxed">🌊 <b>Offshore Event:</b> Epicenter is in open maritime waters. Switch to <i>Disaster HOT</i> or click <i>Focus Command HQ</i> to view land assets.</div>' : ''}
            <div class="text-slate-300">Estimated Casualties: <b class="text-red-400 font-mono">${inc.casualty_estimate}</b></div>
            <div class="text-[11px] text-slate-400 mb-2">Source: ${inc.source}</div>
            <button id="btn-select-inc-${inc.id}" class="w-full bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-semibold py-1 px-2 rounded text-[11px] mt-1 transition">
              View Tactical Response
            </button>
          </div>
        `);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-inc-${inc.id}`);
          if (btn && onSelectIncident) {
            btn.onclick = () => onSelectIncident(inc);
          }
        });
        marker.addTo(group);
      });
    }

    // Auto-focus selected incident ONLY when the selected incident changes (prevents map jumping on poll)
    if (
      selectedIncident &&
      typeof selectedIncident.location_lat === 'number' &&
      typeof selectedIncident.location_lng === 'number'
    ) {
      if (selectedIncident.id !== lastFocusedIncidentIdRef.current) {
        lastFocusedIncidentIdRef.current = selectedIncident.id;
        const isLocalKolkata =
          selectedIncident.location_lat > 20 &&
          selectedIncident.location_lat < 25 &&
          selectedIncident.location_lng > 86 &&
          selectedIncident.location_lng < 90;
        // For local city incidents, zoom in to 13 for street-level tactical view
        // For global/offshore seismic events, zoom to 5 so surrounding landmass & coasts are clearly visible
        const targetZoom = isLocalKolkata ? 13 : 5;
        map.flyTo(
          [selectedIncident.location_lat, selectedIncident.location_lng],
          targetZoom,
          { duration: 0.8 }
        );
      }
    }
  }, [incidents, hospitals, ambulances, rescueTeams, shelters, routes, riskZones, roadClosures, layers, selectedIncident]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden border border-[#1E3A5F]">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      />

      {/* Top Map Floating Header: Basemap Selectors + Layers */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Basemap Style Selector + Nav Helpers */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
          <div className="bg-[#131F31]/95 backdrop-blur border border-[#1E3A5F] rounded-md p-1 shadow-xl flex items-center space-x-1 text-xs">
            {(Object.keys(BASEMAP_CONFIGS) as BasemapStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  mapStyle === style
                    ? 'bg-[#23B9D6] text-black font-semibold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {style === 'tactical_dark'
                  ? '🌙 Tactical Dark'
                  : style === 'disaster_hot'
                  ? '🚨 Disaster HOT'
                  : style === 'osm_streets'
                  ? '🗺️ OSM Streets'
                  : style === 'satellite'
                  ? '🛰️ Satellite'
                  : '🌃 CartoDB Dark'}
              </button>
            ))}
          </div>

          <div className="bg-[#131F31]/95 backdrop-blur border border-[#1E3A5F] rounded-md p-1 shadow-xl flex items-center space-x-1 text-xs">
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([22.5620, 88.3639], 13, { duration: 0.8 });
                }
              }}
              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#172B40] text-cyan-300 hover:bg-[#23B9D6] hover:text-black border border-cyan-800/60 transition shadow flex items-center space-x-1"
              title="Return camera to Command HQ, Hospitals, and Fleet"
            >
              <span>🎯 Focus Command HQ</span>
            </button>
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([15, 95], 4, { duration: 0.8 });
                }
              }}
              className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#172B40] text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition shadow"
              title="Zoom out to Global Overview"
            >
              <span>🌐 Global View</span>
            </button>
          </div>
        </div>

        {/* Layer Controls Bar */}
        <div className="bg-[#131F31]/95 backdrop-blur border border-[#1E3A5F] rounded-md px-2.5 py-1 text-xs shadow-xl flex items-center space-x-2 pointer-events-auto overflow-x-auto">
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.incidents}
              onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
              className="rounded text-red-500 focus:ring-0 bg-transparent border-slate-600"
            />
            <span className="text-red-400 font-medium text-[11px]">⚠️ Incidents</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.hospitals}
              onChange={(e) => setLayers({ ...layers, hospitals: e.target.checked })}
              className="rounded text-emerald-500 focus:ring-0 bg-transparent border-slate-600"
            />
            <span className="text-emerald-400 font-medium text-[11px]">🏥 Hospitals</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.ambulances}
              onChange={(e) => setLayers({ ...layers, ambulances: e.target.checked })}
              className="rounded text-cyan-500 focus:ring-0 bg-transparent border-slate-600"
            />
            <span className="text-cyan-400 font-medium text-[11px]">🚑 Fleet</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.rescueTeams}
              onChange={(e) => setLayers({ ...layers, rescueTeams: e.target.checked })}
              className="rounded text-amber-500 focus:ring-0 bg-transparent border-slate-600"
            />
            <span className="text-amber-400 font-medium text-[11px]">🛡️ Rescue</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.riskZones}
              onChange={(e) => setLayers({ ...layers, riskZones: e.target.checked })}
              className="rounded text-indigo-500 focus:ring-0 bg-transparent border-slate-600"
            />
            <span className="text-indigo-300 font-medium text-[11px]">⭕ Risk</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.routes}
              onChange={(e) => setLayers({ ...layers, routes: e.target.checked })}
              className="rounded text-sky-500 focus:ring-0 bg-transparent border-slate-600"
            />
            <span className="text-sky-300 font-medium text-[11px]">🛣️ Routes</span>
          </label>
        </div>
      </div>

      {/* Bottom Left: Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#131F31]/95 backdrop-blur border border-[#1E3A5F] rounded-md px-3 py-2 text-[11px] shadow-lg flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-300">Danger Zone</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-300">Evacuation Zone</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">Safe Perimeter</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
          <span className="text-slate-300">Green Wave Corridor</span>
        </div>
      </div>
    </div>
  );
};
