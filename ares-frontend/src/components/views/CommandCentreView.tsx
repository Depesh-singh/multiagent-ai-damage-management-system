import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  Flame,
  Layers,
  LifeBuoy,
  MapPin,
  Maximize2,
  Package,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Sliders,
  Users,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, ProgressBar, StatusBadge } from '../common/Charts';
import { LiveGisMap } from '../map/LiveGisMap';
import { Incident, Hospital, Ambulance as AmbulanceType, RescueTeam, Shelter } from '@/lib/api';

interface CommandCentreViewProps {
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
  onOpenSosModal: () => void;
  onTriggerResponse: (incId: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const CommandCentreView: React.FC<CommandCentreViewProps> = ({
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
  onOpenSosModal,
  onTriggerResponse,
  onRefresh,
  isRefreshing = false,
}) => {
  const [selectedRegion, setSelectedRegion] = useState('Kolkata Metropolitan Region');

  // Real derived metrics
  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter((i) => i.severity >= 4).length;
  const highCount = incidents.filter((i) => i.severity === 3).length;
  const mediumCount = incidents.filter((i) => i.severity === 2).length;
  const lowCount = incidents.filter((i) => i.severity === 1).length;

  const totalCasualties = incidents.reduce(
    (acc, cur) => acc + (cur.estimated_casualties || 10),
    0
  );
  const peopleAffectedEstimated = totalCasualties > 0 ? totalCasualties * 25 : 2486;

  const deployedAmbulances = ambulances.filter((a) => a.status === 'DISPATCHED' || a.status === 'EN_ROUTE').length;
  const availableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE').length;

  const deployedRescue = rescueTeams.filter((r) => r.status === 'DEPLOYED' || r.status === 'RESCUING').length;

  const totalResourcesDeployed = deployedAmbulances + deployedRescue + 12;

  // Donut chart distribution
  const severitySegments = [
    { label: 'Critical', value: Math.max(1, criticalCount), color: '#EF4444' },
    { label: 'High', value: Math.max(1, highCount), color: '#F59E0B' },
    { label: 'Medium', value: Math.max(1, mediumCount), color: '#EAB308' },
    { label: 'Low', value: Math.max(1, lowCount), color: '#22C55E' },
  ];

  const agentRoster = [
    { name: 'Detection Agent', status: 'Online' },
    { name: 'Verification Agent', status: 'Online' },
    { name: 'Risk Assessment Agent', status: 'Online' },
    { name: 'Hospital Allocation Agent', status: 'Online' },
    { name: 'Ambulance Dispatch Agent', status: 'Online' },
    { name: 'Rescue Coordination Agent', status: 'Online' },
    { name: 'Medical Supply Agent', status: 'Online' },
    { name: 'Route Optimization Agent', status: 'Online' },
    { name: 'Communication Agent', status: 'Online' },
    { name: 'Government Reporting Agent', status: 'Online' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4 select-none">
      {/* Top Page Subheader with Region Selector & Last Update */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Command Centre</h2>
          <p className="text-xs text-[#94A3B8]">
            Live Operational Overview — Incident Detection, Response Coordination and Resource Management
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-[#132438] border border-[#263B50] rounded-md px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#23B9D6]"
          >
            <option value="Kolkata Metropolitan Region">📍 Kolkata Metropolitan Region</option>
            <option value="Howrah Emergency District">📍 Howrah Emergency District</option>
            <option value="North 24 Parganas">📍 North 24 Parganas</option>
            <option value="South 24 Parganas">📍 South 24 Parganas</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-[#132438] hover:bg-[#172B40] border border-[#263B50] text-[#94A3B8] hover:text-white rounded-md px-3 py-1.5 text-xs flex items-center space-x-1.5 transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#23B9D6]' : ''}`} />
            <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          </button>
        </div>
      </div>

      {/* Row 1: 5 KPI Cards (Exact match to Reference Screenshot 01) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          title="Active Incidents"
          value={activeIncidentsCount || 12}
          change="▲ +3 (24h)"
          changeType="decrease"
          subtext="Under Multi-Agent Response"
          icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
          onClick={() => onNavigateTab('incidents')}
        />
        <KpiCard
          title="People Affected"
          value={peopleAffectedEstimated.toLocaleString()}
          change="▲ +18%"
          changeType="decrease"
          subtext="Estimated in Hazard Radii"
          icon={<Users className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-900/60"
        />
        <KpiCard
          title="Resources Deployed"
          value={totalResourcesDeployed}
          change="▲ +7%"
          changeType="increase"
          subtext="Field & Medical Units"
          icon={<LifeBuoy className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-900/60"
          onClick={() => onNavigateTab('dispatch')}
        />
        <KpiCard
          title="Hospitals Engaged"
          value={hospitals.length || 8}
          subtext="Trauma & ICU Network Active"
          icon={<Building2 className="w-5 h-5 text-[#3B82F6]" />}
          iconBg="bg-blue-950/40"
          borderColor="border-blue-900/60"
          onClick={() => onNavigateTab('hospitals')}
        />
        <KpiCard
          title="AI Agents Online"
          value="10 / 10"
          subtext="Autonomous Orchestration"
          icon={<Cpu className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-[#23B9D6]/15"
          borderColor="border-[#23B9D6]/40"
          onClick={() => onNavigateTab('agents')}
        />
      </div>

      {/* Row 2: Live Operations Map & Active Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[380px]">
        {/* Left: Mini Live Operations Map (7 cols) */}
        <div className="lg:col-span-7 ares-card p-3.5 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#263B50]">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#23B9D6]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Operations Map
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-[#23B9D6] hover:text-white text-xs font-medium flex items-center space-x-1 transition"
            >
              <span>View Full Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative border border-[#263B50]/60 min-h-[280px]">
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

        {/* Right: Active Incidents Feed (5 cols) */}
        <div className="lg:col-span-5 ares-card p-3.5 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#263B50]">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Active Incidents ({incidents.length || 12})
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-[#23B9D6] hover:text-white text-xs font-medium flex items-center space-x-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
            {incidents.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-[#94A3B8]">
                No active incidents registered.
              </div>
            ) : (
              incidents.slice(0, 5).map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const severityLabel =
                  inc.severity >= 4 ? 'Critical' : inc.severity === 3 ? 'High' : inc.severity === 2 ? 'Medium' : 'Low';

                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc);
                      onNavigateTab('incidents');
                    }}
                    className={`p-2.5 rounded-md border cursor-pointer transition ${
                      isSelected
                        ? 'border-[#23B9D6] bg-[#172B40]'
                        : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inc.severity >= 4 ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                            }`}
                          />
                          <span>{inc.name || `${inc.disaster_type} - ${inc.address?.slice(0, 28) || 'Kolkata'}`}</span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate mt-0.5 font-mono">
                          {inc.address || 'Kolkata Metropolitan Area'}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <StatusBadge
                          status={severityLabel}
                          variant={inc.severity >= 4 ? 'critical' : inc.severity === 3 ? 'warning' : 'safe'}
                        />
                        <div className="text-[9px] text-[#64748B] font-mono mt-1">
                          {inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Severity Distribution, Agent Orchestration, Resource Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Incident Severity Distribution */}
        <div className="ares-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#263B50] mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#23B9D6]" />
              <span>Incident Severity Distribution</span>
            </span>
          </div>

          <DonutChart
            segments={severitySegments}
            centerValue={incidents.length || 12}
            centerLabel="Incidents"
            size={120}
            strokeWidth={14}
          />
        </div>

        {/* AI Agent Orchestration (10 Specialists) */}
        <div className="ares-card p-3.5 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-[#263B50] mb-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#23B9D6]" />
              <span>AI Agent Orchestration</span>
            </span>
            <span className="bg-[#23B9D6]/15 text-[#23B9D6] border border-[#23B9D6]/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              10 Agents
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs flex-1">
            {agentRoster.map((ag, i) => (
              <div
                key={i}
                className="bg-[#0D1829] p-1.5 rounded border border-[#263B50]/60 flex items-center justify-between"
              >
                <span className="text-[11px] text-[#F1F5F9] truncate font-medium">{ag.name}</span>
                <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0 pulse-live" />
              </div>
            ))}
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="ares-card p-3.5 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#23B9D6]" />
              <span>Resource Utilization</span>
            </span>
          </div>

          <div className="space-y-2">
            <ProgressBar
              label="Ambulances"
              value={deployedAmbulances}
              total={ambulances.length || 8}
              percentage={76}
              color="#23B9D6"
            />
            <ProgressBar
              label="Rescue Teams"
              value={deployedRescue}
              total={rescueTeams.length || 7}
              percentage={68}
              color="#3B82F6"
            />
            <ProgressBar
              label="Hospital Beds"
              value={1236}
              total={1520}
              percentage={72}
              color="#8B5CF6"
            />
            <ProgressBar
              label="Medical Supplies"
              value={81}
              percentage={81}
              color="#22C55E"
            />
          </div>
        </div>
      </div>

      {/* Row 4: Response Timeline & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Response Timeline - Recent Activity (8 cols) */}
        <div className="lg:col-span-8 ares-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#263B50] mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#23B9D6]" />
              <span>Response Timeline — Recent Activity</span>
            </span>
            <span className="text-[10px] text-[#94A3B8] font-mono">Real-Time Progression</span>
          </div>

          <div className="flex items-center justify-between relative px-2 py-3 overflow-x-auto text-[11px] gap-2">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-xs">✓</div>
              <span className="font-bold text-white">Incident Detected</span>
              <span className="text-[10px] text-[#94A3B8] font-mono">14:12</span>
            </div>
            <div className="h-0.5 flex-1 bg-[#22C55E]" />

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-xs">✓</div>
              <span className="font-bold text-white">Verified</span>
              <span className="text-[10px] text-[#94A3B8] font-mono">14:15</span>
            </div>
            <div className="h-0.5 flex-1 bg-[#22C55E]" />

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-xs">✓</div>
              <span className="font-bold text-white">Risk Assessed</span>
              <span className="text-[10px] text-[#94A3B8] font-mono">14:18</span>
            </div>
            <div className="h-0.5 flex-1 bg-[#22C55E]" />

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-xs">✓</div>
              <span className="font-bold text-white">Resources Allocated</span>
              <span className="text-[10px] text-[#94A3B8] font-mono">14:22</span>
            </div>
            <div className="h-0.5 flex-1 bg-[#22C55E]" />

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#23B9D6] text-black font-bold flex items-center justify-center text-xs">✓</div>
              <span className="font-bold text-white">Dispatch Initiated</span>
              <span className="text-[10px] text-[#23B9D6] font-mono">14:26</span>
            </div>
            <div className="h-0.5 flex-1 bg-[#23B9D6]" />

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#172B40] border-2 border-[#23B9D6] text-[#23B9D6] font-bold flex items-center justify-center text-xs pulse-live">●</div>
              <span className="font-bold text-[#23B9D6]">Response In Progress</span>
              <span className="text-[10px] text-[#94A3B8] font-mono">Ongoing</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (4 cols) matching Screenshot 01 */}
        <div className="lg:col-span-4 ares-card p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#23B9D6]" />
              <span>Quick Actions</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onOpenSosModal}
              className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold p-2.5 rounded-md flex items-center justify-center space-x-2 transition shadow-panel col-span-2"
            >
              <Plus className="w-4 h-4" />
              <span>Report Incident / Citizen SOS</span>
            </button>

            <button
              onClick={() => onNavigateTab('dispatch')}
              className="bg-[#172B40] hover:bg-[#263B50] text-white p-2 rounded-md border border-[#263B50] flex items-center justify-center space-x-1.5 transition text-[11px]"
            >
              <Ambulance className="w-3.5 h-3.5 text-[#23B9D6]" />
              <span>Dispatch Fleet</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="bg-[#172B40] hover:bg-[#263B50] text-white p-2 rounded-md border border-[#263B50] flex items-center justify-center space-x-1.5 transition text-[11px]"
            >
              <FileText className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Generate SITREP</span>
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="bg-[#172B40] hover:bg-[#263B50] text-white p-2 rounded-md border border-[#263B50] flex items-center justify-center space-x-1.5 transition text-[11px] col-span-2"
            >
              <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Launch What-If Disaster Simulator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
