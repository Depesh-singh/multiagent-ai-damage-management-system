import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  Filter,
  GitBranch,
  Layers,
  Maximize2,
  RefreshCw,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import { StatusBadge } from '../common/Charts';
import { AgentRun } from '@/lib/api';

interface AgentExecutionTracesViewProps {
  agentRuns: AgentRun[];
  onRefresh?: () => void;
}

export const AgentExecutionTracesView: React.FC<AgentExecutionTracesViewProps> = ({
  agentRuns,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRunId, setSelectedRunId] = useState<string>(
    agentRuns.length > 0 ? agentRuns[0].id : 'INC-2025-0147'
  );
  const [activeTab, setActiveTab] = useState<'flow' | 'outputs' | 'decisions' | 'exchange' | 'performance'>('flow');
  const [selectedAgentName, setSelectedAgentName] = useState('Risk Assessment Agent');
  const [detailTab, setDetailTab] = useState<'input' | 'output' | 'decision' | 'logs'>('input');
  const [copied, setCopied] = useState(false);

  const selectedRun = agentRuns.find((r) => r.id === selectedRunId) || agentRuns[0];

  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleJsonInput = JSON.stringify(
    selectedRun?.input_data || {
      incident_id: 'INC-2025-0147',
      location: 'Bhowanipore, Kolkata',
      disaster_type: 'building_collapse',
      estimated_casualties: 25,
      affected_area_m2: 4800,
      seismic_intensity: 3.2,
      secondary_hazards: ['Gas line rupture', 'Structural instability'],
    },
    null,
    2
  );

  const sampleJsonOutput = JSON.stringify(
    selectedRun?.output_data || {
      danger_zone_radius_km: 1.2,
      evacuation_zone_radius_km: 2.8,
      risk_classification: 'CRITICAL',
      recommended_hospitals: 3,
      recommended_ambulances: 4,
      ndrf_usar_required: true,
      confidence_score: 0.94,
    },
    null,
    2
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agent Execution Traces</h2>
          <p className="text-xs text-[#94A3B8]">
            Detailed execution flow, agent decisions, inputs and outputs for complete auditability
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-[#132438] hover:bg-[#172B40] border border-[#263B50] text-[#94A3B8] hover:text-white rounded px-3 py-1.5 text-xs flex items-center space-x-1.5 transition font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#23B9D6]" />
            <span>Refresh Traces</span>
          </button>
        )}
      </div>

      {/* Main Container: Left Run Selector (3.5 cols) & Right Trace Inspector (8.5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[620px]">
        {/* Left: Execution Runs (124) List */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Execution Runs ({agentRuns.length || 124})
              </span>
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
            </div>

            <input
              type="text"
              placeholder="Search traces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1829] border border-[#263B50] rounded px-3 py-1 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#23B9D6]"
            />

            <div className="space-y-1.5 overflow-y-auto max-h-[480px] pr-1">
              {agentRuns.slice(0, 10).map((run, i) => {
                const isSelected = selectedRunId === run.id;

                return (
                  <div
                    key={run.id || i}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`p-2.5 rounded-md border cursor-pointer transition ${
                      isSelected
                        ? 'border-[#23B9D6] bg-[#172B40]'
                        : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate font-mono">
                          INC-2025-014{i + 1}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                          {run.agent_name || 'Building Collapse — Bhowanipore'}
                        </div>
                        <div className="text-[9px] text-[#64748B] font-mono mt-0.5">
                          {run.started_at ? new Date(run.started_at).toLocaleTimeString() : 'Jan 26, 14:25'}
                        </div>
                      </div>

                      <StatusBadge
                        status={run.status || 'COMPLETED'}
                        variant={run.status === 'COMPLETED' ? 'safe' : 'warning'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#263B50] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>1 of 25</span>
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Trace Header & Workflow Diagram & Gantt Timeline (8.5 cols) */}
        <div className="lg:col-span-8 ares-card p-4 flex flex-col justify-between space-y-3.5">
          {/* Selected Trace Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#263B50]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white font-mono">
                  Execution Trace — INC-2025-0147
                </span>
                <span className="text-[10px] bg-emerald-950 text-[#22C55E] border border-emerald-800 px-2 py-0.2 rounded font-bold font-mono">
                  Completed
                </span>
                <span className="text-[10px] text-[#23B9D6] font-mono bg-[#172B40] border border-[#263B50] px-2 py-0.2 rounded">
                  Total Time: 32.8 s
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Building Collapse — Bhowanipore, Kolkata • 10 Agents Successfully Synchronized
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center space-x-1 bg-[#0D1829] p-1 rounded border border-[#263B50] text-xs">
              <button
                onClick={() => setActiveTab('flow')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  activeTab === 'flow' ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Execution Flow
              </button>
              <button
                onClick={() => setActiveTab('outputs')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  activeTab === 'outputs' ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Agent Outputs
              </button>
              <button
                onClick={() => setActiveTab('decisions')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  activeTab === 'decisions' ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Decision Log
              </button>
              <button
                onClick={() => setActiveTab('exchange')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  activeTab === 'exchange' ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Data Exchange
              </button>
            </div>
          </div>

          {/* Top Panel: Multi-Agent Execution Workflow (Exact match to Screenshot 05) */}
          <div className="bg-[#0D1829] p-3 rounded-md border border-[#263B50] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
              <span className="flex items-center space-x-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span>Multi-Agent Execution Workflow</span>
              </span>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="flex items-center space-x-1 text-[#22C55E]">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                  <span>Completed</span>
                </span>
                <span className="flex items-center space-x-1 text-[#23B9D6]">
                  <span className="w-2 h-2 rounded-full bg-[#23B9D6]"></span>
                  <span>In Progress</span>
                </span>
                <span className="flex items-center space-x-1 text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#64748B]"></span>
                  <span>Pending</span>
                </span>
              </div>
            </div>

            {/* Visual Workflow Flowchart */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 py-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-[#172B40] border border-[#263B50] text-center">
                <span className="text-[#94A3B8]">Start</span>
                <div className="text-white font-bold">(Incident)</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#23B9D6]" />

              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-center">
                <span className="text-white font-bold">Detection</span>
                <div className="text-[#22C55E]">(2.1 s) ✓</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#23B9D6]" />

              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-center">
                <span className="text-white font-bold">Verification</span>
                <div className="text-[#22C55E]">(2.4 s) ✓</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#23B9D6]" />

              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-center">
                <span className="text-white font-bold">Risk Assessment</span>
                <div className="text-[#22C55E]">(3.6 s) ✓</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#23B9D6]" />

              {/* Parallel Box */}
              <div className="p-2 rounded bg-[#132438] border border-[#23B9D6]/50 space-y-1">
                <div className="text-[9px] text-[#23B9D6] uppercase font-bold text-center">
                  Parallel Fan-Out (5x)
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  <span className="bg-emerald-950 px-1 py-0.5 rounded text-[#22C55E] border border-emerald-800">
                    Hospital (3.8s)
                  </span>
                  <span className="bg-emerald-950 px-1 py-0.5 rounded text-[#22C55E] border border-emerald-800">
                    Ambulance (3.2s)
                  </span>
                  <span className="bg-emerald-950 px-1 py-0.5 rounded text-[#22C55E] border border-emerald-800">
                    Rescue (4.1s)
                  </span>
                  <span className="bg-emerald-950 px-1 py-0.5 rounded text-[#22C55E] border border-emerald-800">
                    Medical (2.9s)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#23B9D6]" />

              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-center">
                <span className="text-white font-bold">Comms</span>
                <div className="text-[#22C55E]">(2.6 s) ✓</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#23B9D6]" />

              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-center">
                <span className="text-white font-bold">Gov Report</span>
                <div className="text-[#22C55E]">(4.1 s) ✓</div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Execution Timeline Gantt (7 cols) & Selected Agent Details (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Execution Timeline (32.8 s) Gantt Chart (7 cols) */}
            <div className="md:col-span-7 bg-[#0D1829] p-3 rounded-md border border-[#263B50] space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#263B50] text-xs font-bold text-white font-mono">
                <span>Execution Timeline (32.8 s)</span>
                <span className="text-[#23B9D6] text-[10px]">Sequential + Parallel</span>
              </div>

              {/* Gantt Bars */}
              <div className="space-y-1.5 text-[10px] font-mono pt-1">
                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Detection</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-0 w-[12%] h-full bg-[#23B9D6] rounded text-[8px] text-black font-bold flex items-center justify-center">
                      2.1s
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Verification</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-[12%] w-[14%] h-full bg-[#23B9D6] rounded text-[8px] text-black font-bold flex items-center justify-center">
                      2.4s
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Risk Assessment</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-[26%] w-[18%] h-full bg-[#23B9D6] rounded text-[8px] text-black font-bold flex items-center justify-center">
                      3.6s
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Hospital Allocation</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-[44%] w-[19%] h-full bg-[#3B82F6] rounded text-[8px] text-white font-bold flex items-center justify-center">
                      3.8s
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Ambulance Dispatch</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-[44%] w-[16%] h-full bg-[#3B82F6] rounded text-[8px] text-white font-bold flex items-center justify-center">
                      3.2s
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Rescue Coordination</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-[44%] w-[20%] h-full bg-[#3B82F6] rounded text-[8px] text-white font-bold flex items-center justify-center">
                      4.1s
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-28 text-[#94A3B8] truncate">Government Report</span>
                  <div className="flex-1 bg-[#172B40] h-3.5 rounded overflow-hidden relative">
                    <div className="absolute left-[64%] w-[22%] h-full bg-[#22C55E] rounded text-[8px] text-black font-bold flex items-center justify-center">
                      4.1s
                    </div>
                  </div>
                </div>
              </div>

              {/* Time axis */}
              <div className="flex justify-between text-[8px] font-mono text-[#64748B] pt-1 border-t border-[#263B50]">
                <span>0s</span>
                <span>4s</span>
                <span>8s</span>
                <span>12s</span>
                <span>16s</span>
                <span>20s</span>
                <span>28s</span>
                <span>32.8s</span>
              </div>
            </div>

            {/* Selected Agent Details & JSON Inspector (5 cols) */}
            <div className="md:col-span-5 bg-[#0D1829] p-3 rounded-md border border-[#263B50] flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#263B50]">
                <select
                  value={selectedAgentName}
                  onChange={(e) => setSelectedAgentName(e.target.value)}
                  className="bg-[#172B40] text-xs font-bold text-white border border-[#263B50] rounded px-2 py-0.5 font-mono focus:outline-none focus:border-[#23B9D6]"
                >
                  <option value="Risk Assessment Agent">Risk Assessment Agent</option>
                  <option value="Disaster Detection Agent">Disaster Detection Agent</option>
                  <option value="Hospital Allocation Agent">Hospital Allocation Agent</option>
                  <option value="Ambulance Dispatch Agent">Ambulance Dispatch Agent</option>
                  <option value="Government Reporting Agent">Government Reporting Agent</option>
                </select>

                <StatusBadge status="Completed" variant="safe" />
              </div>

              {/* Execution Specs */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono bg-[#132438] p-1.5 rounded border border-[#263B50] text-center">
                <div>
                  <span className="text-[#64748B]">Duration:</span>
                  <div className="text-[#23B9D6] font-bold">3.6 s</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Started:</span>
                  <div className="text-white">14:25:14</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Ended:</span>
                  <div className="text-white">14:25:18</div>
                </div>
              </div>

              {/* Payload Tabs */}
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#263B50] pb-1">
                <div className="flex space-x-1">
                  {(['input', 'output', 'decision', 'logs'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        detailTab === tab ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopyJson(detailTab === 'input' ? sampleJsonInput : sampleJsonOutput)}
                  className="text-[#94A3B8] hover:text-white flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Monospace Code Editor View */}
              <div className="bg-[#080F1B] rounded p-2 border border-[#263B50] font-mono text-[9px] text-[#22C55E] overflow-x-auto max-h-36">
                <pre>{detailTab === 'input' ? sampleJsonInput : sampleJsonOutput}</pre>
              </div>
            </div>
          </div>

          {/* Execution Summary Row (Exact match to Screenshot 05) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#23B9D6]" />
              <div>
                <div className="text-white font-bold">10 / 10</div>
                <div className="text-[9px] text-[#64748B]">Agents Executed</div>
              </div>
            </div>

            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <div>
                <div className="text-white font-bold">32.8 s</div>
                <div className="text-[9px] text-[#64748B]">Total Execution Time</div>
              </div>
            </div>

            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#22C55E]" />
              <div>
                <div className="text-white font-bold">3.28 s</div>
                <div className="text-[9px] text-[#64748B]">Avg. Agent Time</div>
              </div>
            </div>

            <div className="bg-[#0D1829] p-2 rounded border border-[#263B50] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
              <div>
                <div className="text-white font-bold">100%</div>
                <div className="text-[9px] text-[#64748B]">Execution Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
