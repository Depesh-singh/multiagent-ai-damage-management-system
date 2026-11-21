import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  LifeBuoy,
  Package,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { aresApi } from '@/lib/api';

interface ApprovalsViewProps {
  onRefreshAll: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ onRefreshAll }) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await aresApi.getApprovals(filter === 'ALL' ? undefined : filter);
      setApprovals(data || []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecide = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    const notes = decisionNotes[id] || (action === 'APPROVE' ? 'Deployment authorized by Incident Commander' : 'Tactical plan rejected for revision');
    try {
      await aresApi.decideApproval(id, action, notes);
      await loadApprovals();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to decide approval:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Top Header */}
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              INCIDENT COMMANDER APPROVAL WORKSPACE
            </h1>
            <p className="text-xs text-slate-400">
              Statutory Human-in-the-Loop Authorization for Resource Mobilization, Fleet Dispatches & Hospital Lock-ins
            </p>
          </div>
        </div>

        <button
          onClick={loadApprovals}
          className="bg-[#1A2940] hover:bg-[#223654] border border-[#1E3A5F] text-slate-300 px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#1E3A5F] pb-2 text-xs">
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition ${
            filter === 'PENDING'
              ? 'bg-amber-500 text-black font-bold shadow'
              : 'text-slate-300 hover:bg-[#1A2940] hover:text-white'
          }`}
        >
          Pending Review ({approvals.filter((a) => a.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition ${
            filter === 'APPROVED'
              ? 'bg-emerald-500 text-black font-bold shadow'
              : 'text-slate-300 hover:bg-[#1A2940] hover:text-white'
          }`}
        >
          Approved History
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition ${
            filter === 'REJECTED'
              ? 'bg-red-500 text-black font-bold shadow'
              : 'text-slate-300 hover:bg-[#1A2940] hover:text-white'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition ${
            filter === 'ALL'
              ? 'bg-[#23B9D6] text-black font-bold shadow'
              : 'text-slate-300 hover:bg-[#1A2940] hover:text-white'
          }`}
        >
          All Records
        </button>
      </div>

      {/* Approvals List */}
      <div className="ares-panel flex-1 overflow-hidden flex flex-col p-3">
        {approvals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            <h3 className="text-white font-bold text-sm mb-1">Approval Queue Clear</h3>
            <p className="text-xs max-w-sm">
              There are no {filter.toLowerCase()} authorization orders requiring commander intervention.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {approvals.map((appr) => {
              const isPending = appr.status === 'PENDING';
              const isBusy = processingId === appr.id;
              const payload = appr.payload || {};

              return (
                <div
                  key={appr.id}
                  className="bg-[#0B1220] border border-[#1E3A5F] rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-bold">
                          AUTHORIZATION #{appr.id.slice(0, 8)}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            appr.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : appr.status === 'PENDING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          {appr.status}
                        </span>
                      </div>
                      <h4 className="text-white font-bold text-sm mt-1">
                        Tactical Resource Allocation Plan for Incident #{appr.incident_id ? appr.incident_id.slice(0, 8) : 'GENERAL'}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {payload.incident_address || 'Kolkata Metropolitan Area'} • Severity Level 4
                      </p>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <div>Requested: {appr.created_at ? new Date(appr.created_at).toLocaleTimeString() : 'Recent'}</div>
                      {appr.decided_at && (
                        <div className="text-emerald-400">
                          Decided: {new Date(appr.decided_at).toLocaleTimeString()} by {appr.decided_by}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resource Breakdown Grid */}
                  <div className="grid grid-cols-4 gap-2 bg-[#131F31] p-3 rounded border border-[#1E3A5F] text-xs">
                    <div className="flex items-center space-x-2">
                      <Ambulance className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Ambulance Units</div>
                        <div className="text-white font-mono font-bold">
                          {payload.assigned_ambulances?.length || payload.ambulances?.length || 8} Units Assigned
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Hospital Beds</div>
                        <div className="text-white font-mono font-bold">
                          {payload.hospital_allocations?.length || 3} Receiving Facilities
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <LifeBuoy className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Rescue Formations</div>
                        <div className="text-white font-mono font-bold">
                          {payload.rescue_teams?.length || 3} Specialist Units (NDRF/Fire)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-slate-400 text-[10px]">Medical Logistics</div>
                        <div className="text-white font-mono font-bold">
                          IV Fluids & Blood Units Queued
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Controls */}
                  {isPending ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[#1E3A5F]">
                      <input
                        type="text"
                        placeholder="Commander decision notes / tactical override directives..."
                        value={decisionNotes[appr.id] || ''}
                        onChange={(e) =>
                          setDecisionNotes({ ...decisionNotes, [appr.id]: e.target.value })
                        }
                        className="flex-1 bg-[#131F31] border border-[#1E3A5F] rounded px-3 py-1.5 text-xs text-white placeholder-slate-500"
                      />

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDecide(appr.id, 'APPROVE')}
                          disabled={isBusy}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Approve Deployment</span>
                        </button>

                        <button
                          onClick={() => handleDecide(appr.id, 'REJECT')}
                          disabled={isBusy}
                          className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1.5 rounded text-xs flex items-center space-x-1 transition"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span>Reject / Revise</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-300 bg-[#131F31] p-2 rounded border border-[#1E3A5F] flex items-center justify-between">
                      <span>
                        <b>Decision Notes:</b> {appr.decision_notes || 'Action authorized by Incident Command.'}
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">AUDITED & LOCKED</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
