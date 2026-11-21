import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  Filter,
  Flame,
  GitBranch,
  Layers,
  LifeBuoy,
  MessageSquare,
  Navigation,
  Package,
  Radio,
  RefreshCw,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import { KpiCard, LineChart, RadialGauge, StatusBadge } from '../common/Charts';
import { AgentRun, AgentStatus } from '@/lib/api';

interface AgentControlRoomViewProps {
  agentsStatus: AgentStatus[];
  agentRuns: AgentRun[];
  onTriggerDemo: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AgentControlRoomView: React.FC<AgentControlRoomViewProps> = ({
  agentsStatus,
  agentRuns,
  onTriggerDemo,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const defaultAgents = [
    { name: 'Disaster Detection Agent', type: 'DETECTION', status: 'Online', desc: 'Detects and classifies disaster events', icon: AlertCircle, color: '#EF4444' },
    { name: 'Incident Verification Agent', type: 'VERIFICATION', status: 'Online', desc: 'Verifies reports and source credibility', icon: Shield, color: '#22C55E' },
    { name: 'Risk Assessment Agent', type: 'RISK_ASSESSMENT', status: 'Online', desc: 'Assesses hazard, impact and risk level', icon: Activity, color: '#F59E0B' },
    { name: 'Hospital Allocation Agent', type: 'HOSPITAL_ALLOCATION', status: 'Online', desc: 'Allocates hospitals and bed capacity', icon: Activity, color: '#3B82F6' },
    { name: 'Ambulance Dispatch Agent', type: 'AMBULANCE_DISPATCH', status: 'In Progress', desc: 'Selects and dispatches ambulance fleet', icon: Navigation, color: '#23B9D6' },
    { name: 'Rescue Coordination Agent', type: 'RESCUE_COORDINATION', status: 'Online', desc: 'Deploys and tracks rescue teams', icon: LifeBuoy, color: '#F59E0B' },
    { name: 'Medical Supply Agent', type: 'MEDICAL_SUPPLY', status: 'Online', desc: 'Calculates and manages medical supplies', icon: Package, color: '#3B82F6' },
    { name: 'Route Optimization Agent', type: 'ROUTE_OPTIMIZATION', status: 'Online', desc: 'Finds safe and fastest response routes', icon: GitBranch, color: '#22C55E' },
    { name: 'Communication Agent', type: 'COMMUNICATION', status: 'Online', desc: 'Handles multi-agency communication', icon: Radio, color: '#A855F7' },
    { name: 'Government Reporting Agent', type: 'GOVERNMENT_REPORTING', status: 'Online', desc: 'Generates situation reports (SITREP)', icon: FileText, color: '#23B9D6' },
  ];

  const executionTrendData = [
    { x: '00:00', y: 12 },
    { x: '04:00', y: 18 },
    { x: '08:00', y: 22 },
    { x: '12:00', y: 35 },
    { x: '16:00', y: 28 },
    { x: '20:00', y: 24 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Agent Control Room</h2>
          <p className="text-xs text-[#94A3B8]">
            Multi-agent orchestration for end-to-end disaster response & deterministic safeguards
          </p>
        </div>

        <button
          onClick={onTriggerDemo}
          className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-4 py-2 rounded-md text-xs flex items-center space-x-2 transition shadow-panel"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Trigger Orchestration Demo</span>
        </button>
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 04) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="AI Agents"
          value="10"
          subtext="Specialist Roster"
          icon={<Cpu className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="Online"
          value="9"
          subtext="Ready for Inference"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="In Progress"
          value="1"
          subtext="Dispatch Pipeline"
          icon={<Clock className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-800/60"
        />
        <KpiCard
          title="Total Executions"
          value={agentRuns.length > 0 ? agentRuns.length : 124}
          subtext="Lifecycle Traces"
          icon={<Layers className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-800/60"
          onClick={() => onNavigateTab('traces')}
        />
        <KpiCard
          title="Success Rate"
          value="98.4%"
          subtext="Safeguard Guardrails"
          icon={<Zap className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="Avg. Response Time"
          value="6.8 s"
          subtext="Sub-Second Latency"
          icon={<Activity className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
      </div>

      {/* Row 2: 3 Columns - Agent Status List (3 cols), Orchestration Network (5 cols), Current Execution & Logs (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[480px]">
        {/* Left Column: Agent Status (10) (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Agent Status (10)
            </span>
            <div className="flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
              <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
            </div>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[420px] pr-1">
            {defaultAgents.map((ag, i) => {
              const Icon = ag.icon;
              const isSelected = selectedAgent?.type === ag.type;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedAgent(ag)}
                  className={`p-2 rounded-md border cursor-pointer transition ${
                    isSelected
                      ? 'border-[#23B9D6] bg-[#172B40]'
                      : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center shrink-0 border border-[#263B50]"
                        style={{ backgroundColor: `${ag.color}20`, color: ag.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{ag.name}</div>
                        <div className="text-[9px] text-[#94A3B8] truncate">{ag.desc}</div>
                      </div>
                    </div>

                    <StatusBadge
                      status={ag.status}
                      variant={ag.status === 'In Progress' ? 'warning' : 'safe'}
                      pulse={ag.status === 'In Progress'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Multi-Agent Orchestration Radial Spoke Diagram (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-4 flex flex-col justify-between items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#263B50] mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#23B9D6]" />
              <span>Multi-Agent Orchestration</span>
            </span>
            <span className="bg-red-950/60 text-[#EF4444] border border-red-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] pulse-critical" />
              <span>Live Execution</span>
            </span>
          </div>

          {/* Radial Orchestration Visualizer Canvas */}
          <div className="relative w-full h-[360px] flex items-center justify-center my-auto">
            {/* SVG Connecting Spokes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 360">
              <defs>
                <linearGradient id="hubGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#23B9D6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#103649" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Connecting lines from center (200, 180) to 10 nodes */}
              {[
                { x: 200, y: 35 },   // 1 Detection (top)
                { x: 295, y: 70 },   // 2 Verification
                { x: 345, y: 150 },  // 3 Risk Assessment
                { x: 335, y: 245 },  // 4 Hospital Allocation
                { x: 270, y: 315 },  // 5 Ambulance Dispatch
                { x: 130, y: 315 },  // 6 Rescue Coordination
                { x: 65, y: 245 },   // 7 Medical Supply
                { x: 55, y: 150 },   // 8 Route Optimization
                { x: 105, y: 70 },   // 9 Communication
                { x: 200, y: 100 },  // 10 Gov Reporting
              ].map((pos, i) => (
                <line
                  key={i}
                  x1="200"
                  y1="180"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#23B9D6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  strokeOpacity="0.5"
                />
              ))}

              {/* Concentric Pulse Rings around Central Hub */}
              <circle cx="200" cy="180" r="48" fill="none" stroke="#23B9D6" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="200" cy="180" r="70" fill="none" stroke="#23B9D6" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.15" />
            </svg>

            {/* Central ARES Orchestrator Hub */}
            <div className="z-10 w-24 h-24 rounded-full bg-[#080F1B] border-2 border-[#23B9D6] flex flex-col items-center justify-center text-center shadow-cyan-glow p-2">
              <div className="text-xl font-black text-[#23B9D6] tracking-tighter">A</div>
              <div className="text-[10px] font-bold text-white tracking-wider">ARES</div>
              <div className="text-[8px] text-[#94A3B8] font-mono leading-none">Orchestrator</div>
            </div>

            {/* 10 Spoke Nodes positioned radially */}
            <div className="absolute top-2 w-20 text-center">
              <div className="bg-[#132438] border border-red-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Detection
              </div>
            </div>

            <div className="absolute top-12 right-12 w-22 text-center">
              <div className="bg-[#132438] border border-emerald-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Verification
              </div>
            </div>

            <div className="absolute right-2 top-36 w-24 text-center">
              <div className="bg-[#132438] border border-amber-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Risk Assessment
              </div>
            </div>

            <div className="absolute right-6 bottom-14 w-24 text-center">
              <div className="bg-[#132438] border border-blue-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Hospital Allocation
              </div>
            </div>

            <div className="absolute bottom-2 right-16 w-24 text-center">
              <div className="bg-[#132438] border border-[#23B9D6] rounded px-1.5 py-1 text-[9px] font-mono text-[#23B9D6] font-bold shadow pulse-live">
                Ambulance Dispatch
              </div>
            </div>

            <div className="absolute bottom-2 left-16 w-24 text-center">
              <div className="bg-[#132438] border border-amber-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Rescue Coordination
              </div>
            </div>

            <div className="absolute left-6 bottom-14 w-22 text-center">
              <div className="bg-[#132438] border border-blue-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Medical Supply
              </div>
            </div>

            <div className="absolute left-2 top-36 w-24 text-center">
              <div className="bg-[#132438] border border-emerald-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Route Optimization
              </div>
            </div>

            <div className="absolute top-12 left-12 w-22 text-center">
              <div className="bg-[#132438] border border-purple-500/80 rounded px-1.5 py-1 text-[9px] font-mono text-white shadow">
                Communication
              </div>
            </div>

            <div className="absolute top-20 text-center">
              <div className="bg-[#132438] border border-[#23B9D6] rounded px-1.5 py-0.5 text-[8px] font-mono text-[#23B9D6] shadow">
                Government Reporting
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Current Execution & Live Logs (3.5 cols) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          {/* Top: Current Execution (Incident INC-2025-0147) */}
          <div className="ares-card p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span>Current Execution</span>
              </span>
              <span className="text-[10px] text-[#23B9D6]">INC-2025-0147</span>
            </div>

            <div className="space-y-1 text-[10px] font-mono max-h-44 overflow-y-auto pr-1">
              <div className="flex items-center justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#22C55E]">1. Disaster Detection</span>
                <span className="text-[#94A3B8]">Completed 1.2s</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#22C55E]">2. Incident Verification</span>
                <span className="text-[#94A3B8]">Completed 2.1s</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#22C55E]">3. Risk Assessment</span>
                <span className="text-[#94A3B8]">Completed 3.6s</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#22C55E]">4. Hospital Allocation</span>
                <span className="text-[#94A3B8]">Completed 2.8s</span>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-[#263B50]/40 text-[#23B9D6] font-bold">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#23B9D6] pulse-live" />
                  <span>5. Ambulance Dispatch</span>
                </span>
                <span>In Progress</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-[#64748B]">
                <span>6. Rescue Coordination</span>
                <span>Pending</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-[#64748B]">
                <span>7. Medical Supply</span>
                <span>Pending</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-[#64748B]">
                <span>8. Route Optimization</span>
                <span>Pending</span>
              </div>
            </div>
          </div>

          {/* Bottom: Agent Execution Logs (Live) */}
          <div className="ares-card p-3 space-y-2 flex-1">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
              <span>Agent Execution Logs (Live)</span>
              <button
                onClick={() => onNavigateTab('traces')}
                className="text-[#23B9D6] text-[10px] hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono text-[#94A3B8] max-h-40 overflow-y-auto">
              <div>
                <span className="text-[#64748B]">[14:25:23]</span>{' '}
                <span className="text-[#23B9D6]">INFO</span> Ambulance Dispatch Agent started...
              </div>
              <div>
                <span className="text-[#64748B]">[14:25:20]</span>{' '}
                <span className="text-[#22C55E]">SUCCESS</span> Hospital allocation complete (3 hospitals)
              </div>
              <div>
                <span className="text-[#64748B]">[14:25:14]</span>{' '}
                <span className="text-[#22C55E]">SUCCESS</span> Risk assessment complete (Risk: Critical)
              </div>
              <div>
                <span className="text-[#64748B]">[14:25:10]</span>{' '}
                <span className="text-[#22C55E]">SUCCESS</span> Incident verified (Confidence: 0.94)
              </div>
              <div>
                <span className="text-[#64748B]">[14:25:08]</span>{' '}
                <span className="text-[#23B9D6]">INFO</span> Disaster detected: Building Collapse
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Performance Gauges, 24h Execution Trend Line Chart, Agent Health (Exact match to Screenshot 04) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* System Performance (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1">
            System Performance
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            <RadialGauge percentage={98.4} label="Success Rate" color="#23B9D6" size={68} strokeWidth={8} />
            <RadialGauge percentage={75} label="Avg. Response" sublabel="6.8 s" color="#22C55E" size={68} strokeWidth={8} />
            <RadialGauge percentage={88} label="Executions" sublabel="124" color="#8B5CF6" size={68} strokeWidth={8} />
          </div>
        </div>

        {/* Execution Trend Last 24 Hours (5 cols) */}
        <div className="md:col-span-5 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1 flex items-center justify-between">
            <span>Execution Trend (Last 24 Hours)</span>
            <span className="text-[#23B9D6] text-[10px]">Peak: 35 runs/hr</span>
          </div>

          <LineChart data={executionTrendData} color="#23B9D6" height={80} />
        </div>

        {/* Agent Health (3 cols) */}
        <div className="md:col-span-3 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1 flex items-center justify-between">
            <span>Agent Health</span>
            <span className="text-[#22C55E] text-[10px]">90% Healthy</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 py-3 h-16 px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
              <div
                key={num}
                className={`flex-1 rounded-sm transition ${
                  i === 9 ? 'bg-[#F59E0B] h-10' : 'bg-[#22C55E] h-12'
                }`}
                title={`Agent ${num}: ${i === 9 ? 'Degraded/High Load' : 'Optimal'}`}
              />
            ))}
          </div>

          <div className="text-[10px] text-[#94A3B8] font-mono text-center">
            9 / 10 Agents Healthy
          </div>
        </div>
      </div>
    </div>
  );
};
