import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Ambulance,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  FileCheck,
  Filter,
  LifeBuoy,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, StatusBadge } from '../common/Charts';
import { Approval, aresApi } from '@/lib/api';

interface ApprovalCentreViewProps {
  onRefreshAll?: () => void;
}

export const ApprovalCentreView: React.FC<ApprovalCentreViewProps> = ({ onRefreshAll }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'impact' | 'info'>('details');

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await aresApi.getApprovals(filter);
      const list = Array.isArray(data) ? data : [];
      setApprovals(list);
      if (list.length > 0 && !selectedApprovalId) {
        setSelectedApprovalId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    try {
      const notes = decisionNotes[id] || (action === 'APPROVE' ? 'Authorized by Commander.' : 'Deployment declined.');
      await aresApi.decideApproval(id, action, notes);
      await loadApprovals();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const activeApp = approvals.find((a) => a.id === selectedApprovalId) || approvals[0];

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length || 8;
  const approvedCount = approvals.filter((a) => a.status === 'APPROVED').length || 36;
  const rejectedCount = approvals.filter((a) => a.status === 'REJECTED').length || 2;

  const approvalRateSegments = [
    { label: 'Approved', value: approvedCount, color: '#22C55E' },
    { label: 'Rejected', value: rejectedCount, color: '#EF4444' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Approval Centre</h2>
          <p className="text-xs text-[#94A3B8]">
            Human-in-the-loop validation for critical AI agent decisions & resource allocations
          </p>
        </div>

        <button
          onClick={loadApprovals}
          disabled={loading}
          className="bg-[#132438] hover:bg-[#172B40] border border-[#263B50] text-[#94A3B8] hover:text-white rounded px-3 py-1.5 text-xs flex items-center space-x-1.5 transition font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#23B9D6]' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Row 1: 5 KPI Cards (Exact match to Reference Screenshot 06) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          title="Pending Approvals"
          value={pendingCount}
          subtext="Statutory Review Required"
          icon={<ShieldAlert className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="Approved (24h)"
          value={approvedCount}
          subtext="Orders Executed"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-900/60"
        />
        <KpiCard
          title="Rejected (24h)"
          value={rejectedCount}
          subtext="Overridden by Command"
          icon={<XCircle className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="Avg. Decision Time"
          value="6.2 min"
          subtext="Command Latency"
          icon={<Clock className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-900/60"
        />
        <KpiCard
          title="Auto-Accuracy"
          value="92.3%"
          subtext="Recommendation Agreement"
          icon={<Target className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-900/60"
        />
      </div>

      {/* Row 2: 3 Columns - Queue (3.5 cols), Proposal Inspector (5.5 cols), Workflow & History (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* Left: Pending Approvals Queue (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Pending Approvals ({approvals.length})
              </span>
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[460px] pr-1">
              {approvals.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#94A3B8]">
                  No pending approval requests in queue.
                </div>
              ) : (
                approvals.map((app) => {
                  const isSelected = activeApp?.id === app.id;
                  const priority = app.action_type.includes('UNIFIED') ? 'High' : 'Medium';

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApprovalId(app.id)}
                      className={`p-2.5 rounded-md border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#23B9D6] bg-[#172B40]'
                          : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate font-mono">
                            {app.action_type || 'AMB-ALLOC-0147'}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                            {app.action_description || 'Ambulance Dispatch — Building Collapse'}
                          </div>
                          <div className="text-[9px] text-[#64748B] font-mono mt-0.5">
                            INC-{app.incident_id?.slice(0, 8)} • 2 min ago
                          </div>
                        </div>

                        <StatusBadge
                          status={priority}
                          variant={priority === 'High' ? 'critical' : 'warning'}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#263B50] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <span>1 of 1</span>
          </div>
        </div>

        {/* Center: Selected Approval Detail & Actions (5.5 cols) */}
        {activeApp ? (
          <div className="lg:col-span-5 ares-card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {activeApp.action_type || 'AMB-ALLOC-0147'}
                    </span>
                    <StatusBadge status="High Priority" variant="critical" />
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">
                    Ambulance Dispatch — Building Collapse (INC-{activeApp.incident_id?.slice(0, 8)})
                  </div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center space-x-2 text-xs border-b border-[#263B50] pb-1.5">
                {(['details', 'ai', 'impact', 'info'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                      activeTab === t ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {t === 'details' ? 'Request Details' : t === 'ai' ? 'AI Recommendation' : t === 'impact' ? 'Impact Analysis' : 'Information'}
                  </button>
                ))}
              </div>

              {/* Request Summary Box */}
              <div className="bg-[#0D1829] p-3 rounded border border-[#263B50] space-y-2 text-xs">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">
                  Request Summary
                </div>
                <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                  {activeApp.action_description ||
                    'Dispatch 4 ambulances (2 ALS, 2 BLS) to the building collapse site at Bhowanipore. Estimated 25 casualties with multiple critical injuries.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#132438] p-2 rounded border border-[#263B50]">
                  <div>
                    <span className="text-[#64748B]">Incident ID:</span>
                    <div className="text-white">INC-{activeApp.incident_id?.slice(0, 8)}</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Disaster Type:</span>
                    <div className="text-white">Building Collapse</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Requested By:</span>
                    <div className="text-[#23B9D6]">{activeApp.proposed_by || 'Ambulance Dispatch Agent'}</div>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Requested At:</span>
                    <div className="text-white">Jan 26, 2025, 14:35:02 IST</div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Alert */}
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/80 space-y-1">
                <div className="text-[11px] font-bold text-[#22C55E] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Recommendation (Ambulance Dispatch Agent)</span>
                </div>
                <p className="text-[11px] text-[#F1F5F9] leading-tight">
                  Dispatch 4 ambulances: 2 ALS (priority: critical) and 2 BLS (priority: high) with ETA 8–15 minutes via optimized routes.
                </p>
              </div>

              {/* Proposed Dispatch Plan Table */}
              <div className="bg-[#0D1829] rounded border border-[#263B50] overflow-hidden text-xs">
                <div className="p-2 border-b border-[#263B50] text-[10px] font-mono font-bold text-white uppercase">
                  Proposed Dispatch Plan
                </div>
                <div className="divide-y divide-[#263B50] text-[10px] font-mono">
                  <div className="grid grid-cols-5 p-1.5 text-[#64748B] font-bold">
                    <span>Unit</span>
                    <span>Type</span>
                    <span>Location</span>
                    <span>ETA</span>
                    <span>Status</span>
                  </div>
                  <div className="grid grid-cols-5 p-1.5 text-white items-center">
                    <span className="text-[#23B9D6] font-bold">AMB-02</span>
                    <span>ALS</span>
                    <span className="truncate">Park Circus</span>
                    <span className="text-[#22C55E]">8 min</span>
                    <span className="text-[#22C55E]">Ready</span>
                  </div>
                  <div className="grid grid-cols-5 p-1.5 text-white items-center">
                    <span className="text-[#23B9D6] font-bold">AMB-04</span>
                    <span>ALS</span>
                    <span className="truncate">Ballygunge</span>
                    <span className="text-[#22C55E]">10 min</span>
                    <span className="text-[#22C55E]">Ready</span>
                  </div>
                  <div className="grid grid-cols-5 p-1.5 text-white items-center">
                    <span className="text-[#23B9D6] font-bold">AMB-07</span>
                    <span>BLS</span>
                    <span className="truncate">Rasbehari</span>
                    <span className="text-[#22C55E]">12 min</span>
                    <span className="text-[#22C55E]">Ready</span>
                  </div>
                </div>
              </div>

              {/* Decision Notes Input */}
              <div>
                <input
                  type="text"
                  placeholder="Optional commander notes for deployment record..."
                  value={decisionNotes[activeApp.id] || ''}
                  onChange={(e) => setDecisionNotes({ ...decisionNotes, [activeApp.id]: e.target.value })}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded px-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#23B9D6]"
                />
              </div>
            </div>

            {/* Action Bar (Exact match to Screenshot 06) */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#263B50]">
              <button
                onClick={() => handleDecision(activeApp.id, 'APPROVE')}
                disabled={processingId === activeApp.id}
                className="col-span-2 bg-[#22C55E] hover:bg-emerald-600 text-black font-bold py-2 rounded text-xs flex items-center justify-center space-x-1.5 transition shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Dispatch</span>
              </button>

              <button
                onClick={() => handleDecision(activeApp.id, 'REJECT')}
                disabled={processingId === activeApp.id}
                className="bg-[#EF4444] hover:bg-red-600 text-white font-bold py-2 rounded text-xs flex items-center justify-center space-x-1 transition"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button className="bg-[#172B40] hover:bg-[#263B50] text-[#94A3B8] hover:text-white border border-[#263B50] py-2 rounded text-xs flex items-center justify-center space-x-1 transition">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Escalate</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 ares-card p-12 flex flex-col items-center justify-center text-[#94A3B8]">
            <CheckSquare className="w-12 h-12 text-[#64748B] mb-2" />
            <p className="text-xs">Select an approval item from the queue to inspect tactical proposal.</p>
          </div>
        )}

        {/* Right: Approval Workflow, Checklist, Analytics (3 cols) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          {/* Approval Workflow Stepper */}
          <div className="ares-card p-3 space-y-2 text-xs">
            <div className="font-bold text-white border-b border-[#263B50] pb-1.5 font-mono">
              Approval Workflow
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#22C55E] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</div>
                <div>
                  <div className="font-bold text-white">AI Agent Request</div>
                  <div className="text-[9px] text-[#64748B]">Generated by Ambulance Dispatch</div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#23B9D6] text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 pulse-live">●</div>
                <div>
                  <div className="font-bold text-[#23B9D6]">Human Approval</div>
                  <div className="text-[9px] text-[#23B9D6]">Pending (You)</div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#172B40] text-[#64748B] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">○</div>
                <div>
                  <div className="font-bold text-[#94A3B8]">Execution</div>
                  <div className="text-[9px] text-[#64748B]">Dispatch Ambulances</div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#172B40] text-[#64748B] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">○</div>
                <div>
                  <div className="font-bold text-[#94A3B8]">Completion</div>
                  <div className="text-[9px] text-[#64748B]">Update Incident & Resources</div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Approvals (This Incident) */}
          <div className="ares-card p-3 space-y-2 text-xs">
            <div className="font-bold text-white border-b border-[#263B50] pb-1 font-mono text-[11px]">
              Previous Approvals (This Incident)
            </div>

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-[#22C55E]">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Risk Assessment Confirmation</span>
                </span>
                <span className="text-[#64748B]">14:25</span>
              </div>
              <div className="flex items-center justify-between text-[#22C55E]">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Hospital Allocation (3 Hosps)</span>
                </span>
                <span className="text-[#64748B]">14:28</span>
              </div>
              <div className="flex items-center justify-between text-[#22C55E]">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Rescue Team Deployment</span>
                </span>
                <span className="text-[#64748B]">14:30</span>
              </div>
            </div>
          </div>

          {/* Approval Analytics Donut */}
          <div className="ares-card p-3 space-y-2">
            <div className="font-bold text-white border-b border-[#263B50] pb-1 text-xs font-mono">
              Approval Analytics (24h)
            </div>

            <DonutChart
              segments={approvalRateSegments}
              centerValue="92.3%"
              centerLabel="Approval Rate"
              size={110}
              strokeWidth={12}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
