import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Filter,
  Layers,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AgentsViewProps {
  agentsStatus: any[];
  agentRuns: any[];
  onTriggerDemo: () => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agentsStatus,
  agentRuns = [],
  onTriggerDemo,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'history'>('architecture');
  const [filterAgentType, setFilterAgentType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const displayAgents = agentsStatus.length > 0 ? agentsStatus : [
    { name: 'Disaster Detection Agent', type: 'DETECTION', phase: 'Stage 1 (Sequential)', stage: 1, method: 'HYBRID', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.95, description: 'Incident classification, sensor fusion, duplicate screening, and severity scoring.' },
    { name: 'Incident Verification Agent', type: 'VERIFICATION', phase: 'Stage 1 (Sequential)', stage: 1, method: 'AI_REASONING', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.98, description: 'Cross-reference corroboration & credibility scoring across telemetry and citizen feeds.' },
    { name: 'Risk Assessment Agent', type: 'RISK_ASSESSMENT', phase: 'Stage 1 (Sequential)', stage: 1, method: 'DETERMINISTIC', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.91, description: 'Dynamic 3-tier risk zones (Danger, Evacuation, Safe), hazard propagation, and vulnerable population estimation.' },
    { name: 'Hospital Allocation Agent', type: 'HOSPITAL_ALLOCATION', phase: 'Stage 1 (Sequential)', stage: 1, method: 'DETERMINISTIC', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.94, description: 'Deterministic bed/ICU/ventilator matching, travel time optimization, and patient load distribution.' },
    { name: 'Ambulance Dispatch Agent', type: 'AMBULANCE_DISPATCH', phase: 'Stage 2 (Concurrent)', stage: 2, method: 'DETERMINISTIC', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.95, description: 'ALS/BLS vehicle matching, road distance calculation, ETA minimization, and fleet state updates.' },
    { name: 'Rescue Coordination Agent', type: 'RESCUE_COORDINATION', phase: 'Stage 2 (Concurrent)', stage: 2, method: 'HYBRID', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.96, description: 'NDRF/SDRF/Civil Defence formation allocation, extrication priorities, and tactical deployment.' },
    { name: 'Medical Supply Agent', type: 'MEDICAL_SUPPLY', phase: 'Stage 2 (Concurrent)', stage: 2, method: 'DETERMINISTIC', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.98, description: 'Clinical formula scaling (2 blood units, 6 IV fluids per casualty), real hospital inventory deficit checks.' },
    { name: 'Route Optimization Agent', type: 'ROUTE_OPTIMIZATION', phase: 'Stage 2 (Concurrent)', stage: 2, method: 'DETERMINISTIC', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.92, description: 'Obstacle and closure avoidance, green-wave emergency corridor generation between sites.' },
    { name: 'Agency Communication Agent', type: 'COMMUNICATION', phase: 'Stage 2 (Concurrent)', stage: 2, method: 'DETERMINISTIC', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.99, description: 'Unified ERSS 112 ticketing, VoIP telemetry records, and cross-agency broadcast logs.' },
    { name: 'Government Reporting Agent', type: 'GOVERNMENT_REPORTING', phase: 'Stage 3 (Reporting)', stage: 3, method: 'AI_REASONING', status: 'ACTIVE_OPERATIONAL', last_confidence: 0.97, description: 'Automated NDMA/SDMA Situation Report (SITREP) synthesis and executive command briefings.' },
  ];

  // Filtering for run history
  const filteredRuns = agentRuns.filter((run) => {
    const matchesType = filterAgentType === 'ALL' || run.agent_type === filterAgentType;
    const matchesSearch =
      !searchTerm ||
      run.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.incident_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.recommendation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Header Banner */}
      <div className="ares-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#23B9D6]/20 border border-[#23B9D6]/40 flex items-center justify-center text-[#23B9D6]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              SAVE AI AGENT CONTROL ROOM & MULTI-AGENT ORCHESTRATION
            </h1>
            <p className="text-xs text-slate-400">
              10 Specialist Autonomous Agents • Deterministic Safeguards • Common State Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sub-tab Switcher */}
          <div className="flex bg-[#0B1220] p-1 rounded-md border border-[#1E3A5F] text-xs">
            <button
              onClick={() => setActiveSubTab('architecture')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeSubTab === 'architecture'
                  ? 'bg-[#23B9D6] text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pipeline & Roster (10)
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded font-medium transition flex items-center space-x-1.5 ${
                activeSubTab === 'history'
                  ? 'bg-[#23B9D6] text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Execution Runs</span>
              <span className="bg-slate-800 text-slate-200 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {agentRuns.length}
              </span>
            </button>
          </div>

          <button
            onClick={onTriggerDemo}
            className="bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-bold px-4 py-2 rounded text-xs flex items-center space-x-2 transition shadow-md"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Trigger Multi-Agent Run</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'architecture' ? (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Pipeline Visualizer Box */}
          <div className="ares-panel p-4 bg-[#0D1829] border border-[#1E3A5F]">
            <div className="flex items-center justify-between mb-3 border-b border-[#1E3A5F] pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#23B9D6]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Multi-Agent Execution Pipeline Architecture
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-300">Deterministic Rule Engine</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#23B9D6]"></span>
                  <span className="text-slate-300">Agentic AI Reasoning</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-slate-300">Human Commander Gate</span>
                </span>
              </div>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Stage 1: Sequential Ingestion */}
              <div className="bg-[#0B1220] p-3 rounded border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 border-b border-slate-800 pb-1.5">
                  <span>STAGE 1: INGESTION & ASSESSMENT</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                    Sequential
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">01 Disaster Detection</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Rule+AI</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">02 Incident Verification</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#23B9D6]/20 text-[#23B9D6] border border-[#23B9D6]/40">AI Score</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">03 Risk Assessment</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Math Radii</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">04 Hospital Allocation</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Deterministic</span>
                  </div>
                </div>
              </div>

              {/* Stage 2: Concurrent Fan-Out */}
              <div className="bg-[#0B1220] p-3 rounded border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 border-b border-slate-800 pb-1.5">
                  <span>STAGE 2: CONCURRENT SPECIALIST FAN-OUT</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                    Parallel (5x)
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">05 Ambulance Dispatch</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Haversine</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">06 Rescue Coordination</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#23B9D6]/20 text-[#23B9D6] border border-[#23B9D6]/40">Allocation</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">07 Medical Supply Agent</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Clinical Ratio</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">08 Route Optimization</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">A* Corridor</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">09 Agency Communication</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">ERSS 112</span>
                  </div>
                </div>
              </div>

              {/* Stage 3: Safeguard & Reporting */}
              <div className="bg-[#0B1220] p-3 rounded border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 border-b border-slate-800 pb-1.5">
                  <span>STAGE 3: STATUTORY SAFEGUARD & REPORTING</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                    Gate + SITREP
                  </span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-600/60 text-amber-300 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                    <div>
                      <div className="font-bold">Human Commander Authorization Gate</div>
                      <div className="text-[10px] text-amber-200/80">Pending approval halts tactical deployment until signed off.</div>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-[#131F31] border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-200">10 Government Reporting</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-[#23B9D6]/20 text-[#23B9D6] border border-[#23B9D6]/40">NDMA SITREP</span>
                  </div>
                  <div className="p-2 rounded bg-[#131F31] border border-slate-700 text-[10px] text-slate-400">
                    SITREP markdown synthesized dynamically and dispatched to District Magistrate & SDMA dashboard.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roster of 10 Agents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayAgents.map((agent, i) => {
              const isSelected = selectedAgent?.type === agent.type;
              return (
                <div
                  key={agent.type || i}
                  onClick={() => setSelectedAgent(agent)}
                  className={`ares-panel p-3.5 cursor-pointer transition border ${
                    isSelected
                      ? 'border-[#23B9D6] bg-[#1A2940]'
                      : 'hover:border-slate-500 bg-[#131F31]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded bg-[#0B1220] border border-[#1E3A5F] flex items-center justify-center font-mono text-[11px] text-[#23B9D6] font-bold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-white text-xs">{agent.name}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block pulse-live"></span>
                      <span>ONLINE</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-3 line-clamp-2">{agent.description}</p>

                  <div className="grid grid-cols-3 gap-2 bg-[#0B1220] p-2 rounded border border-[#1E3A5F] text-[10px]">
                    <div>
                      <span className="text-slate-400">Confidence:</span>
                      <div className="text-emerald-400 font-mono font-bold mt-0.5">
                        {Math.round((agent.last_confidence || 0.95) * 100)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Execution:</span>
                      <div className="text-[#23B9D6] font-mono font-bold mt-0.5 truncate">
                        {agent.method === 'DETERMINISTIC' ? 'Rule-Based Math' : agent.method === 'HYBRID' ? 'Deterministic+AI' : 'Agentic AI'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Pipeline Phase:</span>
                      <div className="text-slate-200 font-mono font-bold mt-0.5 truncate">
                        {agent.phase || 'Sequential'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Agent Inspection Drawer */}
          {selectedAgent && (
            <div className="ares-panel p-3 bg-[#0B1220] border-t-2 border-t-[#23B9D6] text-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white">{selectedAgent.name}</span>
                  <span className="text-slate-400 ml-2">Type: {selectedAgent.type} • Status: Operational</span>
                </div>
              </div>
              <div className="text-slate-400 text-[11px]">
                Statutory Safeguard: Human Commander authorization enforced for critical interventions.
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Run History Tab */
        <div className="flex-1 flex flex-col overflow-hidden ares-panel p-4 gap-3 bg-[#0D1829]">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E3A5F] pb-3">
            <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent runs by name, incident ID, or recommendation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#23B9D6]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterAgentType}
                onChange={(e) => setFilterAgentType(e.target.value)}
                className="bg-[#0B1220] border border-[#1E3A5F] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#23B9D6]"
              >
                <option value="ALL">All Agent Types ({agentRuns.length})</option>
                <option value="DETECTION">Detection</option>
                <option value="VERIFICATION">Verification</option>
                <option value="RISK_ASSESSMENT">Risk Assessment</option>
                <option value="HOSPITAL_ALLOCATION">Hospital Allocation</option>
                <option value="AMBULANCE_DISPATCH">Ambulance Dispatch</option>
                <option value="RESCUE_COORDINATION">Rescue Coordination</option>
                <option value="MEDICAL_SUPPLY">Medical Supply</option>
                <option value="ROUTE_OPTIMIZATION">Route Optimization</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="GOVERNMENT_REPORTING">Government Reporting</option>
              </select>
            </div>
          </div>

          {/* Runs Feed */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredRuns.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 text-slate-600" />
                <span className="text-xs">No execution records found matching your filter.</span>
                <button
                  onClick={onTriggerDemo}
                  className="bg-[#23B9D6]/20 text-[#23B9D6] border border-[#23B9D6]/40 px-3 py-1 rounded text-xs hover:bg-[#23B9D6]/30 font-medium"
                >
                  Execute Multi-Agent Run Now
                </button>
              </div>
            ) : (
              filteredRuns.map((run) => {
                const isExpanded = expandedRunId === run.id;
                const durationMs =
                  run.completed_at && run.started_at
                    ? Math.round(
                        (new Date(run.completed_at).getTime() - new Date(run.started_at).getTime())
                      )
                    : null;

                return (
                  <div
                    key={run.id}
                    className="p-3 bg-[#0B1220] border border-[#1E3A5F] rounded-md hover:border-slate-500 transition"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{run.agent_name}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                              {run.agent_type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref #{run.incident_id?.slice(0, 8)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                            {run.recommendation || run.task}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs">
                        {durationMs !== null && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {durationMs} ms
                          </span>
                        )}
                        <span className="text-emerald-400 font-mono font-bold text-[11px]">
                          {Math.round((run.confidence || 0.95) * 100)}% Conf
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            run.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Payload & Output */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#1E3A5F] space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#131F31] p-2.5 rounded border border-[#1E3A5F]">
                            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Telemetry Input</span>
                              <span className="text-slate-500 font-mono text-[9px]">{run.started_at}</span>
                            </div>
                            <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 p-1.5 bg-[#0B1220] rounded border border-slate-800">
                              {JSON.stringify(run.input_data, null, 2)}
                            </pre>
                          </div>

                          <div className="bg-[#131F31] p-2.5 rounded border border-[#1E3A5F]">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Agent Output & Allocation</span>
                              <span className="text-slate-500 font-mono text-[9px]">{run.completed_at}</span>
                            </div>
                            <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 p-1.5 bg-[#0B1220] rounded border border-slate-800">
                              {JSON.stringify(run.output_data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
