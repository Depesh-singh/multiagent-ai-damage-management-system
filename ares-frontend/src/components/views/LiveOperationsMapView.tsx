import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Eye,
  Layers,
  LifeBuoy,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Shield,
  ShieldAlert,
  Sliders,
  Users,
} from 'lucide-react';
import { LiveGisMap } from '../map/LiveGisMap';
import { RadialGauge, StatusBadge } from '../common/Charts';
import { Incident, Hospital, Ambulance as AmbulanceType, RescueTeam, Shelter } from '@/lib/api';

interface LiveOperationsMapViewProps {
  incidents: Incident[];
  hospitals: Hospital[];
  ambulances: AmbulanceType[];
  rescueTeams: RescueTeam[];
  shelters: Shelter[];
  routes?: any[];
  riskZones?: any[];
  roadClosures?: any[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onNavigateTab: (tab: string) => void;
}

export const LiveOperationsMapView: React.FC<LiveOperationsMapViewProps> = ({
  incidents,
  hospitals,
  ambulances,
  rescueTeams,
  shelters,
  routes = [],
  riskZones = [],
  roadClosures = [],
  selectedIncident,
  onSelectIncident,
  onNavigateTab,
}) => {
  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    hospitals: true,
    ambulances: true,
    rescueTeams: true,
    shelters: true,
    routes: true,
    riskZones: true,
    floodZone: false,
    density: false,
  });

  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeInc = selectedIncident || (incidents.length > 0 ? incidents[0] : null);

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-3 select-none">
      {/* Top Filter Pills & Basemap Switcher (Matching Reference Screenshot 03) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#101C2B] p-2 rounded-md border border-[#263B50]">
        {/* Layer Toggle Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => {
              const allOn = Object.values(activeLayers).every(Boolean);
              setActiveLayers({
                incidents: !allOn,
                hospitals: !allOn,
                ambulances: !allOn,
                rescueTeams: !allOn,
                shelters: !allOn,
                routes: !allOn,
                riskZones: !allOn,
                floodZone: false,
                density: false,
              });
            }}
            className="px-2.5 py-1 rounded bg-[#23B9D6] text-black font-bold text-[11px] shadow"
          >
            All Layers
          </button>

          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition ${
              activeLayers.incidents
                ? 'bg-red-950/60 text-[#EF4444] border-red-800'
                : 'bg-[#132438] text-[#94A3B8] border-[#263B50]'
            }`}
          >
            <span>⚠️ Incidents ({incidents.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('hospitals')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition ${
              activeLayers.hospitals
                ? 'bg-blue-950/60 text-[#3B82F6] border-blue-800'
                : 'bg-[#132438] text-[#94A3B8] border-[#263B50]'
            }`}
          >
            <span>🏥 Hospitals ({hospitals.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('ambulances')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition ${
              activeLayers.ambulances
                ? 'bg-cyan-950/60 text-[#23B9D6] border-cyan-800'
                : 'bg-[#132438] text-[#94A3B8] border-[#263B50]'
            }`}
          >
            <span>🚑 Ambulances ({ambulances.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('rescueTeams')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition ${
              activeLayers.rescueTeams
                ? 'bg-amber-950/60 text-[#F59E0B] border-amber-800'
                : 'bg-[#132438] text-[#94A3B8] border-[#263B50]'
            }`}
          >
            <span>🛡️ Rescue Teams ({rescueTeams.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('shelters')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition ${
              activeLayers.shelters
                ? 'bg-purple-950/60 text-[#A855F7] border-purple-800'
                : 'bg-[#132438] text-[#94A3B8] border-[#263B50]'
            }`}
          >
            <span>🏠 Shelters ({shelters.length})</span>
          </button>

          <button
            onClick={() => toggleLayer('routes')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition ${
              activeLayers.routes
                ? 'bg-emerald-950/60 text-[#22C55E] border-emerald-800'
                : 'bg-[#132438] text-[#94A3B8] border-[#263B50]'
            }`}
          >
            <span>🛣️ Routes</span>
          </button>
        </div>

        {/* Basemap Mode Switcher */}
        <div className="flex items-center space-x-1 bg-[#132438] p-1 rounded border border-[#263B50] text-xs">
          <span className="text-[#23B9D6] px-2 py-0.5 rounded font-bold text-[10px]">ArcGIS Streets</span>
          <span className="text-[#94A3B8] px-2 py-0.5 text-[10px]">OpenStreetMap</span>
          <span className="text-[#94A3B8] px-2 py-0.5 text-[10px]">Satellite</span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#172B40]"
            title="Toggle View Mode"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Center Stage: GIS Canvas & Floating Panels */}
      <div className="flex-1 flex gap-3 min-h-[460px] overflow-hidden relative">
        {/* Main Map Box */}
        <div className="flex-1 rounded-md overflow-hidden relative border border-[#263B50] ares-card flex flex-col">
          {/* Floating Collapsible Map Layers Widget (Top Left) */}
          <div className="absolute top-3 left-3 z-[1000] w-56 ares-card-elevated p-2.5 shadow-2xl border border-[#263B50] text-xs">
            <div
              onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
              className="flex items-center justify-between font-bold text-white cursor-pointer pb-1.5 border-b border-[#263B50]"
            >
              <div className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span>Map Layers</span>
              </div>
              {isLayersPanelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>

            {isLayersPanelOpen && (
              <div className="mt-2 space-y-1.5 text-[11px]">
                <label className="flex items-center space-x-2 cursor-pointer text-[#F1F5F9] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.incidents}
                    onChange={() => toggleLayer('incidents')}
                    className="rounded text-[#EF4444] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Incident Locations</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#F1F5F9] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.riskZones}
                    onChange={() => toggleLayer('riskZones')}
                    className="rounded text-[#F59E0B] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Risk Zones</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#F1F5F9] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.ambulances}
                    onChange={() => toggleLayer('ambulances')}
                    className="rounded text-[#23B9D6] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Resource Tracking</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#F1F5F9] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.hospitals}
                    onChange={() => toggleLayer('hospitals')}
                    className="rounded text-[#3B82F6] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Hospitals & Facilities</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#F1F5F9] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.shelters}
                    onChange={() => toggleLayer('shelters')}
                    className="rounded text-[#A855F7] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Evacuation Shelters</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#F1F5F9] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.routes}
                    onChange={() => toggleLayer('routes')}
                    className="rounded text-[#22C55E] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Optimized Routes</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#94A3B8] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.floodZone}
                    onChange={() => toggleLayer('floodZone')}
                    className="rounded text-[#38BDF8] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Flood Zone (Predictive)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-[#94A3B8] hover:text-white">
                  <input
                    type="checkbox"
                    checked={activeLayers.density}
                    onChange={() => toggleLayer('density')}
                    className="rounded text-[#EC4899] bg-[#080F1B] border-[#263B50]"
                  />
                  <span>Population Density</span>
                </label>
              </div>
            )}
          </div>

          {/* Actual Leaflet Map Canvas */}
          <LiveGisMap
            incidents={activeLayers.incidents ? incidents : []}
            hospitals={activeLayers.hospitals ? hospitals : []}
            ambulances={activeLayers.ambulances ? ambulances : []}
            rescueTeams={activeLayers.rescueTeams ? rescueTeams : []}
            shelters={activeLayers.shelters ? shelters : []}
            routes={activeLayers.routes ? routes : []}
            riskZones={activeLayers.riskZones ? riskZones : []}
            roadClosures={roadClosures}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
          />
        </div>

        {/* Right Side Panel: Selected Incident & Active Response (Exact match to Screenshot 03) */}
        <div className="w-80 ares-card p-3.5 flex flex-col justify-between shrink-0 space-y-3">
          <div className="space-y-3">
            {/* Selected Incident Card */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#94A3B8] mb-1.5 flex items-center justify-between">
                <span>Selected Incident</span>
                <StatusBadge status="Critical" variant="critical" />
              </div>

              <div className="bg-[#0D1829] p-3 rounded border border-[#263B50] space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {activeInc?.name || 'Building Collapse — Bhowanipore'}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-mono">
                      {activeInc?.address || 'Bhowanipore, Kolkata'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#263B50] text-center font-mono text-[10px]">
                  <div className="bg-[#132438] p-1.5 rounded">
                    <span className="text-[#64748B]">Affected</span>
                    <div className="text-white font-bold text-xs">56</div>
                  </div>
                  <div className="bg-[#132438] p-1.5 rounded">
                    <span className="text-[#64748B]">Injured</span>
                    <div className="text-[#EF4444] font-bold text-xs">17</div>
                  </div>
                  <div className="bg-[#132438] p-1.5 rounded">
                    <span className="text-[#64748B]">Trapped</span>
                    <div className="text-[#F59E0B] font-bold text-xs">8</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Response Breakdown */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#94A3B8] mb-1.5">
                Active Response
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-[#0D1829] p-2.5 rounded border border-[#263B50] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ambulance className="w-4 h-4 text-[#23B9D6]" />
                    <span className="text-white font-medium">Ambulances</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">3</span>
                    <span className="text-[#22C55E] text-[10px] ml-1.5">Enroute</span>
                  </div>
                </div>

                <div className="bg-[#0D1829] p-2.5 rounded border border-[#263B50] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LifeBuoy className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-white font-medium">Rescue Teams</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">2</span>
                    <span className="text-[#3B82F6] text-[10px] ml-1.5">On Site</span>
                  </div>
                </div>

                <div className="bg-[#0D1829] p-2.5 rounded border border-[#263B50] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-white font-medium">Hospitals Alerted</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">3</span>
                    <span className="text-[#94A3B8] text-[10px] ml-1.5">Triage</span>
                  </div>
                </div>

                <div className="bg-[#0D1829] p-2.5 rounded border border-[#263B50] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#A855F7]" />
                    <span className="text-white font-medium">Shelter Readiness</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[#22C55E] font-bold">1</span>
                    <span className="text-[#64748B] text-[10px] ml-1.5">(320/500)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('incidents')}
            className="w-full bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold p-2.5 rounded text-xs flex items-center justify-center space-x-2 transition shadow-panel"
          >
            <span>View Full Incident Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom 3 Panels (Exact match to Screenshot 03) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0">
        {/* Left: Region Overview — Kolkata (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-2 flex items-center justify-between">
            <span>Region Overview — Kolkata</span>
            <span className="text-[#23B9D6] text-[10px]">HQ Zone</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]/60">
              <span className="text-[#64748B] text-[10px]">Active Incidents</span>
              <div className="text-white font-bold text-sm">7</div>
            </div>
            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]/60">
              <span className="text-[#64748B] text-[10px]">Affected People</span>
              <div className="text-[#F59E0B] font-bold text-sm">1,842</div>
            </div>
            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]/60">
              <span className="text-[#64748B] text-[10px]">Resources Deployed</span>
              <div className="text-[#22C55E] font-bold text-sm">24</div>
            </div>
            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]/60">
              <span className="text-[#64748B] text-[10px]">High Risk Zones</span>
              <div className="text-[#EF4444] font-bold text-sm">3</div>
            </div>
          </div>
        </div>

        {/* Center: Risk Heatmap (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-2">
            Risk Heatmap (Spatial Propagation)
          </div>

          <div className="space-y-2 py-1">
            <div className="h-6 w-full rounded-md bg-gradient-to-r from-[#22C55E] via-[#F59E0B] to-[#EF4444] border border-[#263B50]/80 shadow-inner" />
            <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>Low (Green)</span>
              <span>Moderate</span>
              <span>High</span>
              <span>Critical (Red)</span>
            </div>
          </div>

          <p className="text-[10px] text-[#64748B]">
            Radii dynamically calculated from Richter magnitude and population density.
          </p>
        </div>

        {/* Right: Resource Status Live Radial Gauges (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1 flex items-center justify-between">
            <span>Resource Status (Live)</span>
            <span className="text-[#23B9D6] text-[10px]">Telematics Active</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            <RadialGauge
              percentage={75}
              label="Ambulances"
              sublabel="24 / 32"
              color="#23B9D6"
              size={70}
              strokeWidth={8}
            />
            <RadialGauge
              percentage={75}
              label="Rescue Teams"
              sublabel="6 / 8"
              color="#3B82F6"
              size={70}
              strokeWidth={8}
            />
            <RadialGauge
              percentage={81}
              label="Hospital Beds"
              sublabel="1,236/1,520"
              color="#8B5CF6"
              size={70}
              strokeWidth={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
