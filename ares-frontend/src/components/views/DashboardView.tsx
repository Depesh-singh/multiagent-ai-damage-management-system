import React from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  LifeBuoy,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import { LiveGisMap } from '../map/LiveGisMap';

interface DashboardViewProps {
  incidents: any[];
  hospitals: any[];
  ambulances: any[];
  rescueTeams: any[];
  shelters: any[];
  routes?: any[];
  riskZones?: any[];
  roadClosures?: any[];
  selectedIncident: any;
  onSelectIncident: (inc: any) => void;
  onTriggerResponse: (incId: string) => void;
  onViewPlan: (plan: any) => void;
  onOpenSosModal?: () => void;
  onClearIncidents?: () => void;
  responsePlan?: any;
  loadingIncidentId?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
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
  onTriggerResponse,
  onViewPlan,
  onOpenSosModal,
  onClearIncidents,
  responsePlan,
  loadingIncidentId,
}) => {
  // KPI Metrics calculation
  const activeIncCount = incidents.filter(
    (i) => i.status !== 'RESOLVED'
  ).length;
  const dispatchedAmbCount = ambulances.filter(
    (a) => a.status === 'DISPATCHED' || a.status === 'ASSIGNED_READY_FOR_DEPLOYMENT'
  ).length;
  const availableBedsCount = hospitals.reduce(
    (acc, h) => acc + (h.available_beds || 0),
    0
  );
  const deployedRescueTeamsCount = rescueTeams.filter(
    (r) => r.status === 'AVAILABLE' || r.status === 'DEPLOYED'
  ).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-3">
      {/* 4 KPI Cards Across Top */}
      <div className="grid grid-cols-4 gap-3 select-none">
        {/* Card 1: Active Incidents */}
        <div className="ares-panel p-3.5 border-l-4 border-l-red-500 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Active Incidents
            </div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-0.5">
              {activeIncCount}
            </div>
            <div className="text-[10px] text-red-400/80 mt-1 flex items-center space-x-1">
              <span>{activeIncCount > 0 ? '● Level 4 Critical Alert' : '● Sectors Stable (Standby)'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Ambulances Dispatched */}
        <div className="ares-panel p-3.5 border-l-4 border-l-[#23B9D6] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Ambulance Fleet
            </div>
            <div className="text-2xl font-bold font-mono text-[#23B9D6] mt-0.5">
              {dispatchedAmbCount} / {ambulances.length || 8}
            </div>
            <div className="text-[10px] text-[#23B9D6]/80 mt-1">
              <span>{dispatchedAmbCount > 0 ? 'Avg Transit ETA: 4.8 mins' : 'All Units On Standby'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-[#23B9D6]">
            <Ambulance className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Hospital Beds Ready */}
        <div className="ares-panel p-3.5 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Hospital Beds Ready
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {availableBedsCount || 1035}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">
              <span>6 Hospitals • 89 ICU Ready</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Rescue Formations */}
        <div className="ares-panel p-3.5 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Rescue Teams Active
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
              {deployedRescueTeamsCount || 5} Formations
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1">
              <span>NDRF, SDRF, Fire, Police DMG</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Live GIS Map (Left) + Tactical Decision Panel (Right) */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left 8 Columns: Large GIS Map */}
        <div className="col-span-8 flex flex-col h-full rounded-lg overflow-hidden ares-panel p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-1 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-wide">LIVE OPERATIONS GIS MAP</span>
              <span className="text-[10px] text-slate-400 font-mono">OpenStreetMap / Dark Matter</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block pulse-live"></span>
                <span>GPS Telematics Active</span>
              </span>
            </div>
          </div>
          <div className="flex-1 w-full h-full min-h-[480px] relative">
            <LiveGisMap
              incidents={incidents}
              hospitals={hospitals}
              ambulances={ambulances}
              rescueTeams={rescueTeams}
              shelters={shelters}
              routes={routes}
              riskZones={riskZones}
              roadClosures={roadClosures}
              selectedIncident={selectedIncident}
              onSelectIncident={onSelectIncident}
            />
          </div>
        </div>

        {/* Right 4 Columns: Incident Feed & Multi-Agent Recommendations */}
        <div className="col-span-4 flex flex-col h-full gap-3 overflow-hidden">
          {/* Active Incident Feed */}
          <div className="ares-panel p-3 flex flex-col h-1/2 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E3A5F]">
              <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>ACTIVE INCIDENTS FEED</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {incidents.length} Registered
                </span>
                {onClearIncidents && incidents.length > 0 && (
                  <button
                    onClick={onClearIncidents}
                    title="Clear all test incidents"
                    className="text-[10px] text-red-400 hover:text-red-300 font-mono underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {incidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#0B1220]/40 rounded-md border border-dashed border-[#1E3A5F]/70">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
                  <div className="text-white font-semibold text-xs mb-1">NO ACTIVE INCIDENTS</div>
                  <div className="text-slate-400 text-[11px] max-w-xs mb-3">
                    All metropolitan sectors are currently stable. No preloaded alerts queued.
                  </div>
                  {onOpenSosModal && (
                    <button
                      onClick={onOpenSosModal}
                      className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1.5 px-3 rounded text-[11px] flex items-center space-x-1.5 transition shadow"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report New Incident</span>
                    </button>
                  )}
                </div>
              ) : (
                incidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const isLoading = loadingIncidentId === inc.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className={`p-2.5 rounded-md border cursor-pointer transition text-xs ${isSelected
                        ? 'bg-[#1A2940] border-[#23B9D6] shadow-sm'
                        : 'bg-[#0B1220] border-[#1E3A5F] hover:border-slate-500'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-red-400 text-xs">
                          ⚠️ LEVEL 4 DISASTER
                        </span>
                        <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-mono">
                          {inc.status}
                        </span>
                      </div>

                      <div className="text-white font-medium text-[11px] line-clamp-1 mb-1">
                        {inc.address}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                        <span>Est. Casualties: <b className="text-red-400 font-mono">{inc.casualty_estimate}</b></span>
                        <span>Source: {inc.source}</span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTriggerResponse(inc.id);
                          }}
                          disabled={isLoading}
                          className="flex-1 bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-bold py-1 px-2 rounded text-[11px] flex items-center justify-center space-x-1 transition"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>{isLoading ? 'Orchestrating...' : 'Trigger Agent AI'}</span>
                        </button>

                        {responsePlan && responsePlan.incident_id === inc.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewPlan(responsePlan);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1 px-2 rounded text-[11px] transition"
                          >
                            View Plan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Orchestrator Recommendations & Live Telematics */}
          <div className="ares-panel p-3 flex flex-col h-1/2 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E3A5F]">
              <div className="font-bold text-[#23B9D6] text-xs flex items-center space-x-1.5">
                <Cpu className="w-4 h-4" />
                <span>AI RECOMMENDATIONS & AUDIT</span>
              </div>
              <span className="text-[10px] bg-[#23B9D6]/20 text-[#23B9D6] px-1.5 py-0.5 rounded border border-[#23B9D6]/40 font-mono">
                10 Agents Sync
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {responsePlan ? (
                <div className="space-y-2">
                  <div className="bg-emerald-950/60 border border-emerald-800 p-2 rounded text-[11px] text-emerald-300 font-semibold flex items-center justify-between">
                    <span>Unified Tactical Plan Orchestrated</span>
                    <button
                      onClick={() => onViewPlan(responsePlan)}
                      className="text-black bg-emerald-400 hover:bg-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]"
                    >
                      Inspect & Authorize
                    </button>
                  </div>
                  {(responsePlan.recommendations_summary || []).slice(0, 4).map((rec: string, i: number) => (
                    <div key={i} className="bg-[#0B1220] p-2 rounded border border-[#1E3A5F] text-[11px] text-slate-300 flex items-start space-x-2">
                      <span className="text-[#23B9D6] font-mono font-bold shrink-0">#{i + 1}</span>
                      <p className="line-clamp-2">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500 space-y-2">
                  <Cpu className="w-8 h-8 text-slate-600" />
                  <p className="text-[11px]">Select an incident and click "Trigger Agent AI" or "Run Earthquake Demo" to observe autonomous coordination.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
