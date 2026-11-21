import React, { useState } from 'react';
import { Ambulance, CheckCircle2, Clock, MapPin, Navigation, Send, ShieldAlert, X } from 'lucide-react';
import { aresApi } from '@/lib/api';

interface DispatchViewProps {
  ambulances: any[];
  incidents?: any[];
  onRefresh?: () => void;
}

export const DispatchView: React.FC<DispatchViewProps> = ({ ambulances, incidents = [], onRefresh }) => {
  const [selectedAmb, setSelectedAmb] = useState<any | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [dispatching, setDispatching] = useState(false);

  const openDispatchModal = (amb: any) => {
    setSelectedAmb(amb);
    if (incidents.length > 0) {
      setSelectedIncidentId(incidents[0].id);
    }
  };

  const handleDispatch = async () => {
    if (!selectedAmb || !selectedIncidentId) return;
    setDispatching(true);
    try {
      await aresApi.dispatchAmbulance(selectedAmb.id, selectedIncidentId);
      setSelectedAmb(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Dispatch failed:', err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Top Header */}
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-[#23B9D6]">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              SMART AMBULANCE FLEET DISPATCH & TELEMETRY
            </h1>
            <p className="text-xs text-slate-400">
              Active Fleet Control • ALS / BLS Clinical Matching • Emergency Green Wave Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-[#1A2940] border border-[#1E3A5F] px-3 py-1.5 rounded text-cyan-400 font-mono">
            {ambulances.filter((a) => a.status === 'AVAILABLE').length} Available / {ambulances.length} Total Units
          </span>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="ares-panel flex-1 overflow-hidden flex flex-col p-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F] text-xs font-semibold text-slate-400">
          <div className="w-32">Vehicle No.</div>
          <div className="w-20">Type</div>
          <div className="flex-1">Driver & Contact</div>
          <div className="w-36">Assigned Mission</div>
          <div className="w-28 text-center">Status</div>
          <div className="w-36 text-right">Dispatch Control</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pt-2 pr-1">
          {ambulances.map((amb, i) => {
            const isDispatched = amb.status === 'DISPATCHED' || amb.status === 'ASSIGNED_READY_FOR_DEPLOYMENT';
            const assignedInc = incidents.find((inc) => inc.id === amb.assigned_incident_id);

            return (
              <div
                key={amb.id || i}
                className="bg-[#0B1220] border border-[#1E3A5F] p-3 rounded-md flex items-center justify-between text-xs hover:border-slate-600 transition"
              >
                <div className="w-32 font-bold font-mono text-white flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isDispatched ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'} inline-block`}></span>
                  <span>{amb.vehicle_number}</span>
                </div>

                <div className="w-20">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      amb.ambulance_type === 'ALS' || amb.type === 'ALS'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {amb.ambulance_type || amb.type || 'BLS'}
                  </span>
                </div>

                <div className="flex-1 text-slate-300">
                  <span className="font-medium text-white">{amb.driver_name || amb.driver || 'Emergency Driver'}</span>
                  <span className="text-slate-400 text-[11px] ml-2">({amb.driver_phone || amb.phone || '+91-108'})</span>
                </div>

                <div className="w-36 text-slate-300 text-[11px]">
                  {assignedInc ? (
                    <div className="line-clamp-1 text-cyan-300 font-medium" title={assignedInc.address}>
                      📍 {assignedInc.address}
                    </div>
                  ) : amb.assigned_incident_id ? (
                    <div className="font-mono text-slate-400">Incident #{String(amb.assigned_incident_id).slice(0, 8)}</div>
                  ) : (
                    <span className="text-slate-500 italic">Unassigned</span>
                  )}
                </div>

                <div className="w-28 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isDispatched
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {amb.status}
                  </span>
                </div>

                <div className="w-36 text-right">
                  {!isDispatched ? (
                    <button
                      onClick={() => openDispatchModal(amb)}
                      className="bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-bold px-3 py-1 rounded text-[11px] inline-flex items-center space-x-1 shadow transition"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Dispatch Unit</span>
                    </button>
                  ) : (
                    <span className="text-cyan-400 text-[11px] font-mono font-medium">In Transit (ETA 4m)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatch Modal */}
      {selectedAmb && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-panel w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]">
              <div className="flex items-center space-x-2">
                <Ambulance className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  Dispatch Unit {selectedAmb.vehicle_number} ({selectedAmb.ambulance_type || 'BLS'})
                </h3>
              </div>
              <button
                onClick={() => setSelectedAmb(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">
                  Select Target Incident for Deployment:
                </label>
                {incidents.length === 0 ? (
                  <div className="text-amber-400 p-2 bg-amber-950/40 rounded border border-amber-800">
                    No active incidents reported. Report an SOS incident first to dispatch this vehicle.
                  </div>
                ) : (
                  <select
                    value={selectedIncidentId}
                    onChange={(e) => setSelectedIncidentId(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded p-2 text-white text-xs"
                  >
                    {incidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        #{inc.id.slice(0, 8)}: {inc.address} (Est: {inc.casualty_estimate} casualties)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-[#131F31] p-3 rounded border border-[#1E3A5F] text-[11px] space-y-1 text-slate-300">
                <div><b>Assigned Driver:</b> {selectedAmb.driver_name || 'Staff Driver'}</div>
                <div><b>Direct Emergency Line:</b> {selectedAmb.driver_phone || '+91-108'}</div>
                <div><b>Capacity:</b> {selectedAmb.capacity || 2} stretcher patients</div>
                <div className="text-emerald-400 font-semibold pt-1">
                  Traffic Signal Preemption / Green Wave Corridor Activated upon dispatch.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E3A5F]">
              <button
                onClick={() => setSelectedAmb(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-[#1A2940]"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                disabled={dispatching || incidents.length === 0}
                className="bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-bold px-4 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{dispatching ? 'Dispatching...' : 'Authorize Immediate Mobilization'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
