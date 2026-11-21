import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  History,
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { aresApi } from '@/lib/api';

interface IncidentsViewProps {
  incidents: any[];
  selectedIncident: any;
  onSelectIncident: (inc: any) => void;
  onTriggerResponse: (incId: string) => void;
  onOpenSosModal: () => void;
  onRefresh: () => void;
  loadingIncidentId?: string | null;
}

const STATUS_OPTIONS = [
  'ALL',
  'REPORTED',
  'VERIFIED',
  'RESPONSE_PLANNED',
  'APPROVED',
  'DISPATCHED',
  'ON_SCENE',
  'RESOLVED',
];

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onTriggerResponse,
  onOpenSosModal,
  onRefresh,
  loadingIncidentId,
}) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [timelineIncident, setTimelineIncident] = useState<any | null>(null);
  const [timelineLogs, setTimelineLogs] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Filtered incidents
  const filtered = incidents.filter((inc) => {
    if (filterStatus === 'ALL') return true;
    return inc.status === filterStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionInProgress(id);
    try {
      await aresApi.updateIncidentStatus(id, newStatus, `Manual status change to ${newStatus}`);
      await onRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!window.confirm('Delete this incident and associated dispatch records?')) return;
    setActionInProgress(id);
    try {
      await aresApi.deleteIncident(id);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete incident:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenTimeline = async (inc: any) => {
    setTimelineIncident(inc);
    setLoadingTimeline(true);
    try {
      const logs = await aresApi.getIncidentTimeline(inc.id);
      setTimelineLogs(logs || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
      setTimelineLogs([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Top Header */}
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              INCIDENT MANAGEMENT & CITIZEN SOS WORKSPACE
            </h1>
            <p className="text-xs text-slate-400">
              Live Emergency Triage • Multi-Source Verification • Command Lifecycle Tracking
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSosModal}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Report New SOS</span>
          </button>

          <button
            onClick={onRefresh}
            className="bg-[#1A2940] hover:bg-[#223654] border border-[#1E3A5F] text-slate-300 px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#1E3A5F] pb-2 text-xs">
        <span className="text-slate-400 mr-2 text-[11px] font-semibold uppercase">Status Filter:</span>
        {STATUS_OPTIONS.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              filterStatus === st
                ? 'bg-[#23B9D6] text-black font-bold shadow'
                : 'text-slate-300 hover:bg-[#1A2940] hover:text-white'
            }`}
          >
            {st} {st === 'ALL' ? `(${incidents.length})` : `(${incidents.filter((i) => i.status === st).length})`}
          </button>
        ))}
      </div>

      {/* Incidents Table / Grid */}
      <div className="ares-panel flex-1 overflow-hidden flex flex-col p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
            <h3 className="text-white font-bold text-sm mb-1">No Incidents Found</h3>
            <p className="text-xs max-w-sm mb-4">
              {filterStatus === 'ALL'
                ? 'No active emergency incidents are currently registered in the database.'
                : `No incidents with status "${filterStatus}".`}
            </p>
            <button
              onClick={onOpenSosModal}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1.5 px-3 rounded text-xs flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit New Incident</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filtered.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isOrchestrating = loadingIncidentId === inc.id;
              const isBusy = actionInProgress === inc.id;

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#1A2940] border-[#23B9D6] shadow-md'
                      : 'bg-[#0B1220] border-[#1E3A5F] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold">
                        INCIDENT #{inc.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          inc.status === 'APPROVED' || inc.status === 'DISPATCHED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : inc.status === 'VERIFIED'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : inc.status === 'RESOLVED'
                            ? 'bg-slate-800 text-slate-300 border border-slate-600'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Source: <b className="text-slate-200">{inc.source}</b>
                    </div>
                  </div>

                  <div className="text-white font-semibold text-sm mb-2 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{inc.address}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-[#131F31] p-2.5 rounded border border-[#1E3A5F] text-xs mb-3">
                    <div>
                      <span className="text-slate-400 text-[10px]">Estimated Casualties:</span>
                      <div className="text-red-400 font-bold font-mono text-sm">{inc.casualty_estimate} persons</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">GPS Coordinates:</span>
                      <div className="text-slate-200 font-mono text-xs">{inc.location_lat?.toFixed(4)}, {inc.location_lng?.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Reported Time:</span>
                      <div className="text-slate-300 font-mono text-xs">
                        {inc.created_at ? new Date(inc.created_at).toLocaleTimeString() : 'Recent'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Command Verification:</span>
                      <div className="text-emerald-400 font-mono text-xs">
                        {inc.verified_by ? `By ${inc.verified_by}` : 'Pending Verification'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F] text-xs">
                    {/* Status Advance Controls */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 text-[11px] mr-1">Transition Status:</span>
                      {inc.status === 'REPORTED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(inc.id, 'VERIFIED');
                          }}
                          disabled={isBusy}
                          className="bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 px-2 py-1 rounded text-[11px] font-semibold"
                        >
                          Mark Verified
                        </button>
                      )}
                      {inc.status !== 'APPROVED' && inc.status !== 'DISPATCHED' && inc.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(inc.id, 'APPROVED');
                          }}
                          disabled={isBusy}
                          className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 px-2 py-1 rounded text-[11px] font-semibold"
                        >
                          Approve Plan
                        </button>
                      )}
                      {inc.status === 'APPROVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(inc.id, 'DISPATCHED');
                          }}
                          disabled={isBusy}
                          className="bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 px-2 py-1 rounded text-[11px] font-semibold"
                        >
                          Authorize Dispatch
                        </button>
                      )}
                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(inc.id, 'RESOLVED');
                          }}
                          disabled={isBusy}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded text-[11px]"
                        >
                          Resolve
                        </button>
                      )}
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTimeline(inc);
                        }}
                        className="bg-[#131F31] hover:bg-[#1A2940] border border-[#1E3A5F] text-slate-300 px-2.5 py-1 rounded text-[11px] flex items-center space-x-1"
                      >
                        <History className="w-3 h-3 text-[#23B9D6]" />
                        <span>Timeline</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerResponse(inc.id);
                        }}
                        disabled={isOrchestrating}
                        className="bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-bold px-3 py-1 rounded text-[11px] flex items-center space-x-1 shadow transition"
                      >
                        <Cpu className="w-3 h-3" />
                        <span>{isOrchestrating ? 'Orchestrating...' : 'Trigger Agent AI'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIncident(inc.id);
                        }}
                        disabled={isBusy}
                        title="Delete incident"
                        className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline Modal Drawer */}
      {timelineIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-panel w-full max-w-2xl max-h-[80vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F] mb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#23B9D6]" />
                <h3 className="font-bold text-white text-sm">
                  INCIDENT AUDIT LOG & TIMELINE — #{timelineIncident.id.slice(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setTimelineIncident(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {loadingTimeline ? (
                <div className="p-8 text-center text-slate-400">Loading audit records...</div>
              ) : timelineLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No chronological audit events recorded for this incident yet.
                </div>
              ) : (
                timelineLogs.map((log, idx) => (
                  <div key={idx} className="bg-[#0B1220] border border-[#1E3A5F] p-3 rounded flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[#23B9D6] mt-1 shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      {log.details && (
                        <pre className="mt-1 bg-[#131F31] p-2 rounded text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
