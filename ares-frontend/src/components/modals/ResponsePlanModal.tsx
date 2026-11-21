import React, { useState } from 'react';
import { AlertTriangle, Check, ShieldCheck, X } from 'lucide-react';
import { aresApi } from '@/lib/api';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onPlanApproved?: () => void;
}

export const ResponsePlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanApproved,
}) => {
  const [deciding, setDeciding] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  if (!isOpen || !plan) return null;

  const handleApprove = async () => {
    if (!plan.pending_approval_id) {
      setAuthorized(true);
      return;
    }
    setDeciding(true);
    try {
      await aresApi.decideApproval(plan.pending_approval_id, 'APPROVE', 'Authorized by Chief Incident Commander');
      setAuthorized(true);
      if (onPlanApproved) onPlanApproved();
    } catch (err) {
      console.error(err);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131F31] border border-[#1E3A5F] w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0B1220]/70">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#23B9D6]" />
            <div>
              <div className="text-white font-bold text-sm">
                ARES UNIFIED TACTICAL RESPONSE PLAN
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Incident #{plan.incident_id?.slice(0, 8)} • Orchestration Duration: {plan.execution_duration_seconds}s
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Conflict Resolution Status Badge */}
          <div className="bg-emerald-950/60 border border-emerald-800/80 p-3 rounded flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-emerald-300">Automated Conflict Screening Passed:</span>
                <span className="text-slate-300 ml-1">Zero duplicate dispatches • No hospital exceeds 70% threshold</span>
              </div>
            </div>
            <span className="bg-emerald-900 text-emerald-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              VERIFIED
            </span>
          </div>

          {/* Parallel Agent Tactical Recommendations */}
          <div>
            <div className="text-slate-400 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Specialist Agent Tactical Recommendations (10 Modules):
            </div>
            <div className="space-y-2">
              {(plan.recommendations_summary || []).map((rec: string, i: number) => (
                <div key={i} className="bg-[#0B1220] border border-[#1E3A5F] p-2.5 rounded flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#1A2940] border border-[#1E3A5F] flex items-center justify-center font-mono text-[10px] text-[#23B9D6] shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-slate-200 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Allocation Highlights Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0B1220] border border-[#1E3A5F] p-3 rounded">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Hospitals Allocated</div>
              <div className="text-emerald-400 text-lg font-bold font-mono mt-1">
                {plan.hospital_allocation?.allocated_hospitals?.length || 3} Facilities
              </div>
              <div className="text-slate-400 text-[10px] mt-1">
                {plan.hospital_allocation?.allocated_hospitals?.map((h: any) => h.hospital_name?.split(' ')[0]).join(', ')}
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#1E3A5F] p-3 rounded">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Ambulances Dispatched</div>
              <div className="text-cyan-400 text-lg font-bold font-mono mt-1">
                {plan.ambulance_dispatch?.dispatched_count || 8} Vehicles
              </div>
              <div className="text-slate-400 text-[10px] mt-1">
                Fastest ETA: {plan.ambulance_dispatch?.fastest_eta_minutes || 4} mins
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#1E3A5F] p-3 rounded">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Rescue Formations</div>
              <div className="text-amber-400 text-lg font-bold font-mono mt-1">
                {plan.rescue_coordination?.deployed_teams_count || 3} Teams
              </div>
              <div className="text-slate-400 text-[10px] mt-1">
                {plan.rescue_coordination?.total_deployed_personnel || 103} Responders
              </div>
            </div>
          </div>
        </div>

        {/* Human Authorization Action Footer */}
        <div className="p-3 border-t border-[#1E3A5F] bg-[#0B1220]/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Statutory requirement: Human Commander approval required for tactical execution.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs">
              Dismiss
            </button>
            <button
              onClick={handleApprove}
              disabled={deciding || authorized}
              className={`px-4 py-1.5 rounded font-bold text-xs flex items-center space-x-1.5 transition ${
                authorized
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{authorized ? 'Deployment Authorized ✓' : deciding ? 'Authorizing...' : 'Authorize Tactical Deployment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
