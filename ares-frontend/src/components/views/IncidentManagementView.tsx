import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  FileCheck,
  Flame,
  LifeBuoy,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Trash2,
  Upload,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { KpiCard, StatusBadge } from '../common/Charts';
import { Incident, aresApi } from '@/lib/api';

interface IncidentManagementViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onTriggerResponse: (incId: string) => void;
  onOpenSosModal: () => void;
  onRefresh: () => void;
  loadingIncidentId?: string | null;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onTriggerResponse,
  onOpenSosModal,
  onRefresh,
  loadingIncidentId,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'risk' | 'plan' | 'resources' | 'timeline' | 'evidence'>('overview');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Sample tactical photos for incident evidence
  const evidencePhotos = [
    'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  ];

  // Derived counts
  const criticalList = incidents.filter((i) => i.severity >= 4);
  const highList = incidents.filter((i) => i.severity === 3);
  const mediumList = incidents.filter((i) => i.severity === 2);
  const lowList = incidents.filter((i) => i.severity === 1);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'CRITICAL' && inc.severity >= 4) ||
      (activeFilter === 'HIGH' && inc.severity === 3) ||
      (activeFilter === 'MEDIUM' && inc.severity === 2) ||
      (activeFilter === 'LOW' && inc.severity === 1);

    const matchesSearch =
      !searchTerm ||
      inc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.disaster_type?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeInc = selectedIncident || (incidents.length > 0 ? incidents[0] : null);

  const handleStatusChange = async (newStatus: string) => {
    if (!activeInc) return;
    setStatusUpdating(true);
    try {
      await aresApi.updateIncidentStatus(activeInc.id, newStatus, 'Commander status update via Operations Console.');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!activeInc || !window.confirm(`Are you sure you want to permanently delete incident #${activeInc.id}?`)) return;
    try {
      await aresApi.deleteIncident(activeInc.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Incident Management & SOS</h2>
          <p className="text-xs text-[#94A3B8]">
            Create, verify, assess and manage disaster incidents across regional telemetry
          </p>
        </div>

        <button
          onClick={onOpenSosModal}
          className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-4 py-2 rounded-md text-xs flex items-center space-x-2 transition shadow-panel"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident / SOS</span>
        </button>
      </div>

      {/* Row 1: 5 KPI Cards (Exact match to Reference Screenshot 02) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          title="Active Incidents"
          value={incidents.filter((i) => i.status !== 'RESOLVED').length || 7}
          change="↑ +2 (last 1 hr)"
          changeType="decrease"
          icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="Under Verification"
          value={incidents.filter((i) => i.status === 'REPORTED').length || 3}
          icon={<Zap className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-900/60"
        />
        <KpiCard
          title="Verified"
          value={incidents.filter((i) => i.status === 'VERIFIED').length || 4}
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-900/60"
        />
        <KpiCard
          title="Response In Progress"
          value={incidents.filter((i) => i.status === 'RESPONSE_PLANNED' || i.status === 'APPROVED').length || 2}
          icon={<LifeBuoy className="w-5 h-5 text-[#3B82F6]" />}
          iconBg="bg-blue-950/40"
          borderColor="border-blue-900/60"
        />
        <KpiCard
          title="Resolved (24h)"
          value={incidents.filter((i) => i.status === 'RESOLVED').length || 5}
          icon={<FileCheck className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-900/60"
        />
      </div>

      {/* Main Workspace: Left List (4 cols) & Right Detail (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[580px]">
        {/* Left: Incident List (4 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Header with Search */}
            <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Incident List ({incidents.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0D1829] border border-[#263B50] rounded px-8 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#23B9D6]"
              />
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center space-x-1 bg-[#0D1829] p-1 rounded border border-[#263B50] text-[10px] overflow-x-auto">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => {
                const count =
                  lvl === 'ALL'
                    ? incidents.length
                    : lvl === 'CRITICAL'
                    ? criticalList.length
                    : lvl === 'HIGH'
                    ? highList.length
                    : lvl === 'MEDIUM'
                    ? mediumList.length
                    : lowList.length;

                return (
                  <button
                    key={lvl}
                    onClick={() => setActiveFilter(lvl)}
                    className={`px-2 py-1 rounded font-medium transition whitespace-nowrap ${
                      activeFilter === lvl
                        ? 'bg-[#23B9D6] text-black font-bold'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {lvl} ({count})
                  </button>
                );
              })}
            </div>

            {/* Incident Cards Feed */}
            <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
              {filteredIncidents.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#94A3B8]">
                  No incidents found matching criteria.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = activeInc?.id === inc.id;
                  const severityBadge =
                    inc.severity >= 4 ? 'Critical' : inc.severity === 3 ? 'High' : inc.severity === 2 ? 'Medium' : 'Low';

                  return (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className={`p-2.5 rounded-md border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#23B9D6] bg-[#172B40]'
                          : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                inc.severity >= 4 ? 'bg-[#EF4444]' : inc.severity === 3 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
                              }`}
                            />
                            <span className="truncate">{inc.name || `${inc.disaster_type} - ${inc.address?.slice(0, 24) || 'Kolkata'}`}</span>
                          </div>
                          <div className="text-[11px] text-[#94A3B8] truncate flex items-center space-x-1">
                            <MapPin className="w-3 h-3 shrink-0 text-[#64748B]" />
                            <span className="truncate">{inc.address || 'Kolkata, WB'}</span>
                          </div>
                          <div className="text-[9px] text-[#64748B] font-mono flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {inc.created_at ? new Date(inc.created_at).toLocaleTimeString() : '12 min ago'}
                            </span>
                          </div>
                        </div>

                        <StatusBadge
                          status={severityBadge}
                          variant={inc.severity >= 4 ? 'critical' : inc.severity === 3 ? 'warning' : 'safe'}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="pt-2 border-t border-[#263B50] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>1 of 1</span>
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Selected Incident Detail Workspace (8 cols) */}
        {activeInc ? (
          <div className="lg:col-span-8 ares-card p-4 flex flex-col justify-between space-y-3.5">
            {/* Header: Title, Badges, Status Dropdown, Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#263B50]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {activeInc.name || `${activeInc.disaster_type} — ${activeInc.address || 'Bhowanipore'}`}
                  </h3>
                  <span className="text-[11px] bg-[#0D1829] border border-[#263B50] px-2 py-0.5 rounded font-mono text-[#23B9D6]">
                    INC-{activeInc.id?.slice(0, 8).toUpperCase()}
                  </span>
                  <StatusBadge
                    status={activeInc.severity >= 4 ? 'Critical' : 'High'}
                    variant={activeInc.severity >= 4 ? 'critical' : 'warning'}
                  />
                  <StatusBadge status={activeInc.status} variant="safe" />
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-2">
                <select
                  disabled={statusUpdating}
                  value={activeInc.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-[#0D1829] border border-[#263B50] rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#23B9D6]"
                >
                  <option value="REPORTED">Status: REPORTED</option>
                  <option value="VERIFIED">Status: VERIFIED</option>
                  <option value="RESPONSE_PLANNED">Status: RESPONSE_PLANNED</option>
                  <option value="APPROVED">Status: APPROVED</option>
                  <option value="RESOLVED">Status: RESOLVED</option>
                </select>

                <button
                  onClick={() => onTriggerResponse(activeInc.id)}
                  disabled={loadingIncidentId === activeInc.id}
                  className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-3 py-1 rounded text-xs flex items-center space-x-1.5 transition"
                >
                  <Zap className={`w-3.5 h-3.5 ${loadingIncidentId === activeInc.id ? 'animate-spin' : ''}`} />
                  <span>{loadingIncidentId === activeInc.id ? 'Triggering...' : 'Assign Response'}</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="p-1 rounded bg-[#0D1829] hover:bg-red-950/50 text-[#94A3B8] hover:text-[#EF4444] border border-[#263B50] transition"
                  title="Delete Incident"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Overview, Risk Assessment, Response Plan, Resources, Timeline, Evidence */}
            <div className="flex items-center space-x-2 border-b border-[#263B50] pb-2 text-xs">
              {(['overview', 'risk', 'plan', 'resources', 'timeline', 'evidence'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                    activeSubTab === tab
                      ? 'bg-[#172B40] text-[#23B9D6] border border-[#23B9D6]/40'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tab === 'risk'
                    ? 'Risk Assessment'
                    : tab === 'plan'
                    ? 'Response Plan'
                    : tab}
                </button>
              ))}
            </div>

            {/* Top Details Grid: Photo Carousel + Incident Summary & Mini GIS Map */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Photo Carousel (5 cols) */}
              <div className="md:col-span-5 bg-[#0D1829] rounded-md border border-[#263B50] p-2 flex flex-col justify-between">
                <div className="relative rounded overflow-hidden h-36 bg-black flex items-center justify-center">
                  <img
                    src={evidencePhotos[currentImageIdx]}
                    alt="Disaster Scene"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                    {currentImageIdx + 1} / {evidencePhotos.length}
                  </span>
                  <button
                    onClick={() => setCurrentImageIdx((prev) => (prev > 0 ? prev - 1 : evidencePhotos.length - 1))}
                    className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIdx((prev) => (prev < evidencePhotos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto">
                  {evidencePhotos.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      onClick={() => setCurrentImageIdx(i)}
                      alt="thumb"
                      className={`w-10 h-8 object-cover rounded cursor-pointer border ${
                        currentImageIdx === i ? 'border-[#23B9D6]' : 'border-transparent opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Incident Summary & Mini Coordinates (7 cols) */}
              <div className="md:col-span-7 bg-[#0D1829] rounded-md border border-[#263B50] p-3 flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <div className="font-bold text-white text-xs mb-1">Incident Summary</div>
                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    Partial building collapse reported in Bhowanipore area. Multiple people feared trapped under
                    debris. NDRF and local fire brigades mobilized to site.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#132438] p-2 rounded border border-[#263B50]">
                  <div>
                    <span className="text-[#64748B]">Location:</span>
                    <div className="text-white font-medium">{activeInc.address || 'Bhowanipore, Kolkata'}</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Reported At:</span>
                    <div className="text-white font-medium">
                      {activeInc.created_at ? new Date(activeInc.created_at).toLocaleTimeString() : '14:25:00 IST'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Last Updated:</span>
                    <div className="text-white font-medium">14:37:09 IST</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Reported By:</span>
                    <div className="text-[#23B9D6] font-medium">{activeInc.source || 'Citizen SOS (Verified)'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Key Stat Tiles matching Reference Screenshot 02 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] text-center">
                <div className="text-[10px] text-[#94A3B8]">Estimated Affected</div>
                <div className="text-lg font-bold font-mono text-[#23B9D6]">
                  {activeInc.estimated_casualties ? activeInc.estimated_casualties * 3 : 56}
                </div>
                <div className="text-[9px] text-[#64748B]">People</div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] text-center">
                <div className="text-[10px] text-[#94A3B8]">Injured (Est.)</div>
                <div className="text-lg font-bold font-mono text-[#EF4444]">
                  {activeInc.estimated_casualties || 17}
                </div>
                <div className="text-[9px] text-[#64748B]">Patients</div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] text-center">
                <div className="text-[10px] text-[#94A3B8]">Trapped (Est.)</div>
                <div className="text-lg font-bold font-mono text-[#F59E0B]">8</div>
                <div className="text-[9px] text-[#64748B]">Debris Zone</div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] text-center">
                <div className="text-[10px] text-[#94A3B8]">Nearby Hospitals</div>
                <div className="text-lg font-bold font-mono text-white">3</div>
                <div className="text-[9px] text-[#64748B]">1.2 - 4.8 km</div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] text-center">
                <div className="text-[10px] text-[#94A3B8]">Ambulances Enroute</div>
                <div className="text-lg font-bold font-mono text-[#22C55E]">4</div>
                <div className="text-[9px] text-[#64748B]">ETA: 8-15 min</div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] text-center">
                <div className="text-[10px] text-[#94A3B8]">Rescue Teams</div>
                <div className="text-lg font-bold font-mono text-[#3B82F6]">2</div>
                <div className="text-[9px] text-[#64748B]">On Site</div>
              </div>
            </div>

            {/* Bottom Row: AI Agent Processing & Current Status & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#263B50]">
              {/* AI Agent Processing */}
              <div className="bg-[#0D1829] p-3 rounded-md border border-[#263B50] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#263B50] pb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#23B9D6]" />
                    <span>AI Agent Processing</span>
                  </span>
                  <span className="text-[10px] text-[#22C55E] font-mono">Autonomous Pipeline</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F1F5F9] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span>Disaster Detection Agent</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#22C55E] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F1F5F9] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span>Incident Verification Agent</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#22C55E] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F1F5F9] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span>Risk Assessment Agent</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#22C55E] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      Assessed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F1F5F9] flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#23B9D6] pulse-live ml-0.5 mr-1" />
                      <span>Hospital Allocation Agent</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#23B9D6] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] flex items-center space-x-1.5 ml-3">
                      <span>Ambulance Dispatch Agent</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8] bg-slate-800 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8] flex items-center space-x-1.5 ml-3">
                      <span>Rescue Coordination Agent</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8] bg-slate-800 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Status & Actions Stepper */}
              <div className="bg-[#0D1829] p-3 rounded-md border border-[#263B50] flex flex-col justify-between space-y-2">
                <div className="text-xs font-bold text-white border-b border-[#263B50] pb-1.5">
                  Current Status & Actions
                </div>

                {/* Horizontal Stepper */}
                <div className="flex items-center justify-between text-[10px] px-1 py-1">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-[10px]">✓</div>
                    <span className="text-white mt-1">Reported</span>
                    <span className="text-[#64748B] font-mono text-[8px]">14:25</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-[#22C55E]" />

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-[10px]">✓</div>
                    <span className="text-white mt-1">Verified</span>
                    <span className="text-[#64748B] font-mono text-[8px]">14:31</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-[#23B9D6]" />

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#23B9D6] text-black font-bold flex items-center justify-center text-[10px] pulse-live">●</div>
                    <span className="text-[#23B9D6] font-bold mt-1">Assessing</span>
                    <span className="text-[#23B9D6] font-mono text-[8px]">Active</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-[#263B50]" />

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#172B40] text-[#64748B] font-bold flex items-center justify-center text-[10px]">○</div>
                    <span className="text-[#64748B] mt-1">Responding</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-[#263B50]" />

                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-[#172B40] text-[#64748B] font-bold flex items-center justify-center text-[10px]">○</div>
                    <span className="text-[#64748B] mt-1">Resolved</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => onTriggerResponse(activeInc.id)}
                    className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold p-2 rounded text-[11px] flex items-center justify-center space-x-1"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>View Plan</span>
                  </button>

                  <button className="bg-[#172B40] hover:bg-[#263B50] text-white p-2 rounded text-[11px] border border-[#263B50] flex items-center justify-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#23B9D6]" />
                    <span>Track Fleet</span>
                  </button>

                  <button className="bg-[#172B40] hover:bg-[#263B50] text-[#F59E0B] p-2 rounded text-[11px] border border-[#263B50] flex items-center justify-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 ares-card p-12 flex flex-col items-center justify-center text-[#94A3B8]">
            <AlertCircle className="w-12 h-12 text-[#64748B] mb-2" />
            <p className="text-sm font-medium">Select an incident from the list to view tactical operations.</p>
          </div>
        )}
      </div>
    </div>
  );
};
