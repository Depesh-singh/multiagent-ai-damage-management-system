import React, { useState } from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  Building2,
  Ambulance,
  LifeBuoy,
  Shield,
  Download,
  Share2,
  Send,
  Printer,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Incident } from '@/lib/api';
import { KpiCard, ProgressBar, StatusBadge } from '../common/Charts';

interface SituationReportsViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident?: (inc: Incident) => void;
}

interface SitrepSummary {
  id: string;
  code: string;
  incidentId: string;
  incidentTitle: string;
  timestamp: string;
  status: 'FINAL' | 'DRAFT' | 'ARCHIVED';
  severity: string;
  leadAgency: string;
  casualties: number;
  evacuated: number;
  ambulancesDeployed: number;
  rescueTeamsActive: number;
  hospitalsReceiving: number;
  summaryText: string;
}

export const SituationReportsView: React.FC<SituationReportsViewProps> = ({
  incidents = [],
  selectedIncident,
  onSelectIncident,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'summary' | 'impact' | 'response' | 'next_actions'>('summary');
  const [autoSitrepAi, setAutoSitrepAi] = useState(true);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Generate realistic SITREPs anchored to real incidents
  const sitrepReports: SitrepSummary[] = [
    {
      id: 'sr-0147',
      code: 'SITREP - 0147',
      incidentId: selectedIncident?.id || 'INC-2025-0147',
      incidentTitle: selectedIncident?.location_name || 'Park Street & Camac St Crossing, Kolkata',
      timestamp: 'Today, 14:35 IST',
      status: 'FINAL',
      severity: selectedIncident?.severity || 'CRITICAL',
      leadAgency: 'ARES Unified Incident Command',
      casualties: selectedIncident?.estimated_casualties || 18,
      evacuated: 6820,
      ambulancesDeployed: 4,
      rescueTeamsActive: 2,
      hospitalsReceiving: 3,
      summaryText:
        'ARES Multi-Agent triage detected structural instability and mass casualty risk following seismic tremor. AI orchestration dispatched 4 Advanced Life Support ambulances and 2 NDRF Urban Search & Rescue teams. Emergency green wave transit corridor is active along Park Street toward SSKM Hospital. 25 civilians evacuated to St. Xavier Auditorium Shelter.',
    },
    {
      id: 'sr-0146',
      code: 'SITREP - 0146',
      incidentId: 'INC-2025-0146',
      incidentTitle: 'Howrah Station Approach, Kolkata',
      timestamp: 'Today, 14:15 IST',
      status: 'DRAFT',
      severity: 'HIGH',
      leadAgency: 'Railway Protection & SDRF',
      casualties: 8,
      evacuated: 1200,
      ambulancesDeployed: 2,
      rescueTeamsActive: 1,
      hospitalsReceiving: 2,
      summaryText:
        'Secondary structural damage reported on flyover junction. Traffic diverted to alternate northern corridor. Medical logistics delivered 450 emergency trauma kits.',
    },
    {
      id: 'sr-0145',
      code: 'SITREP - 0145',
      incidentId: 'INC-2025-0145',
      incidentTitle: 'Salt Lake Sector V Tech Hub',
      timestamp: 'Today, 13:45 IST',
      status: 'FINAL',
      severity: 'MODERATE',
      leadAgency: 'WB Fire Services & Police',
      casualties: 4,
      evacuated: 4500,
      ambulancesDeployed: 1,
      rescueTeamsActive: 1,
      hospitalsReceiving: 1,
      summaryText:
        'Commercial complex fire alarm triggered by electrical short-circuit after localized power surge. Building evacuated safely without major life hazards.',
    },
    {
      id: 'sr-0144',
      code: 'SITREP - 0144',
      incidentId: 'INC-2025-0144',
      incidentTitle: 'Shyambazar 5-Point Crossing',
      timestamp: 'Today, 12:30 IST',
      status: 'FINAL',
      severity: 'MODERATE',
      leadAgency: 'Kolkata Traffic & EMS',
      casualties: 2,
      evacuated: 300,
      ambulancesDeployed: 1,
      rescueTeamsActive: 0,
      hospitalsReceiving: 1,
      summaryText:
        'Multi-vehicle collision during storm rainfall. Scene cleared by rapid response towing and two injured stabilized at R.G. Kar Medical College.',
    },
    {
      id: 'sr-0143',
      code: 'SITREP - 0143',
      incidentId: 'INC-2025-0143',
      incidentTitle: 'Alipore Zoological Perimeter',
      timestamp: 'Yesterday, 22:00 IST',
      status: 'ARCHIVED',
      severity: 'LOW',
      leadAgency: 'Forest Dept & Police',
      casualties: 0,
      evacuated: 50,
      ambulancesDeployed: 0,
      rescueTeamsActive: 1,
      hospitalsReceiving: 0,
      summaryText:
        'Perimeter tree fall on high voltage powerline during nocturnal squall. Power safely isolated and debris removed by civil teams.',
    },
  ];

  const [selectedReportId, setSelectedReportId] = useState<string>(sitrepReports[0].id);
  const activeReport = sitrepReports.find((r) => r.id === selectedReportId) || sitrepReports[0];

  const triggerExport = (format: string) => {
    setDownloadNotice(`Generating ${format} SITREP for ${activeReport.code}...`);
    setTimeout(() => {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          JSON.stringify(
            {
              report: activeReport,
              generated_at: new Date().toISOString(),
              unified_command: 'ARES Autonomous Emergency System',
              standards: 'NDMA / NDMC National Disaster Guidelines v3.4',
            },
            null,
            2
          )
        );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${activeReport.code.replace(/\s+/g, '_')}_${format.toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloadNotice(`✓ ${format} SITREP Export Complete!`);
      setTimeout(() => setDownloadNotice(null), 3000);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-3 select-none">
      {/* 6 Top KPI Cards (Matching Visual Reference 13) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <KpiCard
          label="SITREPs Generated"
          value={sitrepReports.length.toString()}
          subValue="4 Published Today"
          status="info"
          icon={<FileText className="w-4 h-4 text-[#23B9D6]" />}
        />
        <KpiCard
          label="Active Incidents"
          value={Math.max(incidents.length, 3).toString()}
          subValue="2 Critical Level 4"
          status="critical"
          icon={<AlertTriangle className="w-4 h-4 text-[#EF4444]" />}
        />
        <KpiCard
          label="Agencies Involved"
          value="18"
          subValue="NDRF, SDRF, EMS, Fire"
          status="success"
          icon={<Shield className="w-4 h-4 text-[#22C55E]" />}
        />
        <KpiCard
          label="Total Affected Pop."
          value="8,450"
          subValue="6,820 Evacuated Safely"
          status="warning"
          icon={<TrendingUp className="w-4 h-4 text-[#F59E0B]" />}
        />
        <KpiCard
          label="Operational Readiness"
          value="94.2%"
          subValue="8/8 Command Services Active"
          status="success"
          icon={<CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
        />
        <KpiCard
          label="Avg. Report Latency"
          value="< 5 min"
          subValue="Autonomous AI Synthesis"
          status="info"
          icon={<Clock className="w-4 h-4 text-[#23B9D6]" />}
        />
      </div>

      {/* Main Workspace: 3 Columns (Left Timeline, Center Overview/GIS, Right Details/Actions) */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Column (3 cols): SITREP Timeline List */}
        <div className="col-span-12 lg:col-span-3 bg-[#101C2B] rounded-lg border border-[#263B50] flex flex-col overflow-hidden">
          <div className="p-2.5 bg-[#132438] border-b border-[#263B50] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#23B9D6]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">SITREP Timeline</span>
            </div>
            <button
              onClick={() => triggerExport('DRAFT')}
              className="px-2 py-1 bg-[#23B9D6]/20 text-[#23B9D6] border border-[#23B9D6]/40 hover:bg-[#23B9D6] hover:text-black rounded text-[11px] font-semibold transition"
            >
              + Generate SITREP
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {sitrepReports.map((report) => {
              const isSelected = report.id === selectedReportId;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-2.5 rounded-md border cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#172B40] border-[#23B9D6] shadow-md shadow-[#23B9D6]/10'
                      : 'bg-[#132438]/60 border-[#263B50] hover:bg-[#132438]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white font-mono">{report.code}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        report.status === 'FINAL'
                          ? 'bg-emerald-950/80 text-[#22C55E] border border-emerald-800'
                          : report.status === 'DRAFT'
                          ? 'bg-amber-950/80 text-[#F59E0B] border border-amber-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8] font-medium line-clamp-1 mb-1.5">
                    {report.incidentTitle}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.timestamp}</span>
                    </span>
                    <StatusBadge status={report.severity} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right Combined (9 cols): Active SITREP Detail & Incident Operational Overview */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Top Row: Mini GIS Map & Key Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#101C2B] p-3 rounded-lg border border-[#263B50]">
            {/* Incident Geographic Overview Mini-GIS */}
            <div className="md:col-span-5 bg-[#080F1B] rounded border border-[#263B50] p-2 relative flex flex-col justify-between min-h-[160px]">
              <div className="flex items-center justify-between border-b border-[#263B50] pb-1 mb-2">
                <span className="text-[11px] font-bold text-white flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#23B9D6]" />
                  <span>KOLKATA DISASTER SECTOR 4</span>
                </span>
                <span className="text-[10px] text-[#22C55E] font-mono">GPS LOCK: 22.5532° N, 88.3512° E</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#132438]/40 rounded border border-[#263B50]/50 p-2 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(#23B9D6_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                <div className="w-16 h-16 rounded-full border border-red-500/50 bg-red-500/10 flex items-center justify-center animate-pulse mb-2">
                  <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
                </div>
                <div className="text-xs font-bold text-white">{activeReport.incidentTitle}</div>
                <div className="text-[10px] text-[#94A3B8]">Evacuation Radius: 500m • Triage Sector Alpha</div>
              </div>
            </div>

            {/* SITREP Metadata & Tabs */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span className="font-mono text-[#23B9D6]">{activeReport.code}</span>
                      <span>—</span>
                      <span>INCIDENT ACTION REPORT</span>
                    </h2>
                    <div className="text-[11px] text-[#94A3B8] flex items-center space-x-2 mt-0.5">
                      <span>Ref ID: <b className="text-white font-mono">{activeReport.incidentId}</b></span>
                      <span>•</span>
                      <span>Lead: <b className="text-white">{activeReport.leadAgency}</b></span>
                      <span>•</span>
                      <span>Transmitted: <b className="text-emerald-400">{activeReport.timestamp}</b></span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#23B9D6]/20 text-[#23B9D6] border border-[#23B9D6]/40">
                    NATIONAL NDMA FORMAT
                  </span>
                </div>

                {/* Tabs: Summary / Impact / Response / Next Actions */}
                <div className="flex space-x-1 border-b border-[#263B50] pb-1 mb-2">
                  {[
                    { id: 'summary', label: 'Executive Summary' },
                    { id: 'impact', label: 'Impact & Casualties' },
                    { id: 'response', label: 'Response Resources' },
                    { id: 'next_actions', label: 'Next Directives' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id as any)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-t transition ${
                        activeReportTab === tab.id
                          ? 'bg-[#132438] text-[#23B9D6] border-b-2 border-[#23B9D6]'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Preview */}
              <div className="bg-[#132438]/80 p-2.5 rounded border border-[#263B50] text-xs text-[#F1F5F9] leading-relaxed">
                {activeReportTab === 'summary' && <p>{activeReport.summaryText}</p>}
                {activeReportTab === 'impact' && (
                  <p>
                    Estimated immediate casualties: <b>{activeReport.casualties}</b> individuals. Residential & commercial structures within a 350m perimeter assessed at Level 3 hazard. <b>{activeReport.evacuated.toLocaleString()}</b> citizens safely escorted across southern exit gates.
                  </p>
                )}
                {activeReportTab === 'response' && (
                  <p>
                    <b>{activeReport.ambulancesDeployed} Ambulances</b> stationed at Park Street crossing with emergency triage bay active. <b>{activeReport.rescueTeamsActive} NDRF formations</b> deploying acoustic search equipment. <b>{activeReport.hospitalsReceiving} designated receiving hospitals</b> holding bed reserves.
                  </p>
                )}
                {activeReportTab === 'next_actions' && (
                  <p>
                    1. Maintain designated green-wave corridor for transit until 18:00 IST.<br />
                    2. Coordinate with West Bengal State Disaster Management Authority (WBSDMA) for relief disbursement.<br />
                    3. AI Agent swarm running continuous acoustic structural integrity simulations.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Middle Row: Operational Summary Cards (3 Columns Matching Visual Reference 13) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Col 1: Operational Summary Stats */}
            <div className="bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
              <div className="text-xs font-bold text-white flex items-center space-x-1.5 border-b border-[#263B50] pb-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span className="uppercase tracking-wider">Operational Summary</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-1.5 bg-[#132438] rounded">
                  <span className="text-[#94A3B8] flex items-center space-x-1">
                    <Ambulance className="w-3.5 h-3.5 text-[#23B9D6]" />
                    <span>Ambulances Deployed</span>
                  </span>
                  <span className="font-bold text-white font-mono">{activeReport.ambulancesDeployed} Units</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#132438] rounded">
                  <span className="text-[#94A3B8] flex items-center space-x-1">
                    <LifeBuoy className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Rescue Formations</span>
                  </span>
                  <span className="font-bold text-white font-mono">{activeReport.rescueTeamsActive} Teams</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#132438] rounded">
                  <span className="text-[#94A3B8] flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Receiving Hospitals</span>
                  </span>
                  <span className="font-bold text-white font-mono">{activeReport.hospitalsReceiving} Hospitals</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#132438] rounded">
                  <span className="text-[#94A3B8] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Civilian Triage Completed</span>
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">25 Rescued</span>
                </div>
              </div>
            </div>

            {/* Col 2: Incident Progress Timeline */}
            <div className="bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
              <div className="text-xs font-bold text-white flex items-center space-x-1.5 border-b border-[#263B50] pb-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span className="uppercase tracking-wider">Incident Timeline</span>
              </div>
              <div className="space-y-2 text-xs relative pl-3 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#263B50]">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] absolute -left-[11px] top-1"></div>
                  <div className="text-[11px] font-bold text-white">14:25 — Emergency SOS Reported</div>
                  <div className="text-[10px] text-[#94A3B8]">Civilian alert verified by ARES triage agents</div>
                </div>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[#23B9D6] absolute -left-[11px] top-1"></div>
                  <div className="text-[11px] font-bold text-white">14:26 — AI Multi-Agent Triage</div>
                  <div className="text-[10px] text-[#94A3B8]">Hospital, Fleet, & Logistics optimal plan generated</div>
                </div>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] absolute -left-[11px] top-1"></div>
                  <div className="text-[11px] font-bold text-white">14:28 — Responders Dispatched</div>
                  <div className="text-[10px] text-[#94A3B8]">Corridor established along Park Street</div>
                </div>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E] absolute -left-[11px] top-1"></div>
                  <div className="text-[11px] font-bold text-white">14:35 — SITREP-0147 Dispatched</div>
                  <div className="text-[10px] text-[#94A3B8]">Autonomous transmission to State Command</div>
                </div>
              </div>
            </div>

            {/* Col 3: Impact & Response Progress Overview */}
            <div className="bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
              <div className="text-xs font-bold text-white flex items-center space-x-1.5 border-b border-[#263B50] pb-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span className="uppercase tracking-wider">Impact & Response Status</span>
              </div>
              <div className="space-y-2.5">
                <ProgressBar
                  label="Zone Evacuation Progress"
                  current={6820}
                  total={12400}
                  color="#22C55E"
                />
                <ProgressBar
                  label="Medical Triage Stabilization"
                  current={88}
                  total={100}
                  color="#23B9D6"
                />
                <ProgressBar
                  label="Transit Corridor Clearance"
                  current={92}
                  total={100}
                  color="#F59E0B"
                />
                <ProgressBar
                  label="Critical Infrastructure Shield"
                  current={75}
                  total={100}
                  color="#EF4444"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Export & Share Actions Bar (Matching Visual Reference 13) */}
          <div className="bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Share2 className="w-4 h-4 text-[#23B9D6]" />
                <span>Export & Share:</span>
              </span>

              <button
                onClick={() => triggerExport('PDF')}
                className="px-3 py-1.5 bg-[#132438] hover:bg-[#172B40] text-white border border-[#263B50] hover:border-[#23B9D6] rounded text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span>Download PDF Report</span>
              </button>

              <button
                onClick={() => triggerExport('EXCEL')}
                className="px-3 py-1.5 bg-[#132438] hover:bg-[#172B40] text-white border border-[#263B50] hover:border-[#22C55E] rounded text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Export Excel (NDMA)</span>
              </button>

              <button
                onClick={() => triggerExport('JSON')}
                className="px-3 py-1.5 bg-[#132438] hover:bg-[#172B40] text-white border border-[#263B50] hover:border-[#F59E0B] rounded text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Send className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Share with Agencies</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {downloadNotice && (
                <span className="text-xs font-bold text-[#22C55E] animate-pulse">
                  {downloadNotice}
                </span>
              )}

              {/* AI Auto-SITREP Toggle */}
              <div className="flex items-center space-x-2 bg-[#132438] px-2.5 py-1 rounded border border-[#263B50]">
                <Sparkles className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span className="text-xs text-[#94A3B8]">Auto-SITREP (AI):</span>
                <button
                  onClick={() => setAutoSitrepAi(!autoSitrepAi)}
                  className={`w-8 h-4 rounded-full transition relative ${
                    autoSitrepAi ? 'bg-[#23B9D6]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-black absolute top-0.5 transition ${
                      autoSitrepAi ? 'left-4' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
