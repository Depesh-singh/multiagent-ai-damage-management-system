import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Fuel,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Send,
  Shield,
  Signal,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, LineChart, ProgressBar, StatusBadge } from '../common/Charts';
import { LiveGisMap } from '../map/LiveGisMap';
import { Ambulance as AmbulanceType, Incident, aresApi } from '@/lib/api';

interface FleetDispatchViewProps {
  ambulances: AmbulanceType[];
  incidents: Incident[];
  onRefresh?: () => void;
}

export const FleetDispatchView: React.FC<FleetDispatchViewProps> = ({
  ambulances,
  incidents,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmbId, setSelectedAmbId] = useState<string>(
    ambulances.length > 0 ? ambulances[0].id : ''
  );
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents.length > 0 ? incidents[0].id : ''
  );
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const activeAmb =
    ambulances.find((a) => a.id === selectedAmbId) || (ambulances.length > 0 ? ambulances[0] : null);

  const availableCount = ambulances.filter((a) => a.status === 'AVAILABLE').length || 24;
  const onDispatchCount = ambulances.filter((a) => a.status === 'DISPATCHED' || a.status === 'EN_ROUTE').length || 6;
  const maintenanceCount = ambulances.filter((a) => a.status === 'MAINTENANCE').length || 2;
  const totalCount = ambulances.length || 32;

  const fleetDonut = [
    { label: 'Available', value: availableCount, color: '#22C55E' },
    { label: 'On Dispatch', value: onDispatchCount, color: '#F59E0B' },
    { label: 'Maintenance', value: maintenanceCount, color: '#EF4444' },
  ];

  const perfTrend = [
    { x: '00:00', y: 5.5 },
    { x: '04:00', y: 4.8 },
    { x: '08:00', y: 6.2 },
    { x: '12:00', y: 5.0 },
    { x: '16:00', y: 4.5 },
    { x: '20:00', y: 4.8 },
  ];

  const handleManualDispatch = async () => {
    if (!activeAmb || !selectedIncidentId) return;
    setDispatching(true);
    try {
      await aresApi.dispatchAmbulance(activeAmb.id, selectedIncidentId);
      setIsDispatchModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const handleAutoDispatch = async () => {
    if (incidents.length === 0) return;
    setDispatching(true);
    try {
      await aresApi.triggerMultiAgentResponse(incidents[0].id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fleet & Ambulance Dispatch</h2>
          <p className="text-xs text-[#94A3B8]">
            Real-time fleet tracking, dispatch coordination and response management
          </p>
        </div>

        <button
          onClick={() => setIsDispatchModalOpen(true)}
          className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-4 py-2 rounded-md text-xs flex items-center space-x-2 transition shadow-panel"
        >
          <Send className="w-4 h-4" />
          <span>Manual Fleet Dispatch</span>
        </button>
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 08) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="Total Ambulances"
          value={totalCount}
          subtext="Citywide Fleet"
          icon={<Ambulance className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="Available"
          value={availableCount}
          subtext="Stationed & Ready"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="On Dispatch"
          value={onDispatchCount}
          subtext="Active Mission Enroute"
          icon={<Navigation className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-900/60"
        />
        <KpiCard
          title="Under Maintenance"
          value={maintenanceCount}
          subtext="Workshop Depots"
          icon={<Wrench className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="Avg. Dispatch Time"
          value="4.8 min"
          subtext="Ticket to Rolling"
          icon={<Clock className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="On-time Response"
          value="91.6%"
          subtext="Under 15m Target"
          icon={<Zap className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-900/60"
        />
      </div>

      {/* Row 2: 3 Columns - Fleet List (3.5 cols), Tracking Map (4.5 cols), Dispatch Details & Actions (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[500px]">
        {/* Left Column: Ambulance Fleet (32) (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Ambulance Fleet ({ambulances.length || 32})
              </span>
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-1">
              {ambulances.map((amb, i) => {
                const isSelected = activeAmb?.id === amb.id;
                const status = amb.status || (i % 3 === 0 ? 'AVAILABLE' : i % 3 === 1 ? 'DISPATCHED' : 'EN_ROUTE');

                return (
                  <div
                    key={amb.id || i}
                    onClick={() => setSelectedAmbId(amb.id)}
                    className={`p-2.5 rounded-md border cursor-pointer transition ${
                      isSelected
                        ? 'border-[#23B9D6] bg-[#172B40]'
                        : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded bg-[#132438] border border-[#263B50] flex items-center justify-center text-[#23B9D6]">
                          <Ambulance className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-mono">
                            {amb.vehicle_number || `AMB-0${i + 1}`}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] font-mono">
                            {amb.base_location || 'Park Circus Base'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <StatusBadge
                          status={status === 'AVAILABLE' ? 'Available' : status === 'DISPATCHED' ? 'On Dispatch' : 'En Route'}
                          variant={status === 'AVAILABLE' ? 'safe' : 'warning'}
                        />
                        <div className="flex items-center justify-end space-x-1 text-[9px] text-[#22C55E] font-mono mt-1">
                          <Signal className="w-2.5 h-2.5" />
                          <span>Telemetry OK</span>
                        </div>
                      </div>
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
            <span>1 of 6</span>
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Column: Live Fleet Tracking Map (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-3 flex flex-col justify-between rounded-md overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono mb-2">
            <span>Live Fleet Tracking — Kolkata</span>
            <span className="text-[#23B9D6] text-[10px]">Active GPS Beacons</span>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative border border-[#263B50]/60 min-h-[360px]">
            <LiveGisMap ambulances={ambulances} incidents={incidents} />
          </div>
        </div>

        {/* Right Column: Dispatch Details & Actions (4 cols) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          {/* Dispatch Details Box */}
          <div className="ares-card p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
              <span>Dispatch Details</span>
              <StatusBadge status="Critical" variant="critical" />
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="font-bold text-white text-xs">
                {incidents[0]?.name || 'INC-2025-0147 Building Collapse'}
              </div>
              <div className="text-[#94A3B8] text-[10px]">
                {incidents[0]?.address || 'Bhowanipore, Kolkata'}
              </div>

              <div className="pt-1.5 border-t border-[#263B50]/40 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Reported:</span>
                  <span className="text-white">14:25 IST (12 min ago)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Required:</span>
                  <span className="text-[#23B9D6]">4 Ambulances (ALS: 2, BLS: 2)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Primary Hospital:</span>
                  <span className="text-white">RG Kar Medical College</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Estimated Casualties:</span>
                  <span className="text-[#EF4444] font-bold">~ 25</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Actions (Exact match to Screenshot 08) */}
          <div className="ares-card p-3 space-y-2">
            <div className="text-xs font-bold text-white border-b border-[#263B50] pb-1 font-mono uppercase">
              Dispatch Actions
            </div>

            <div className="space-y-2">
              <button
                onClick={handleAutoDispatch}
                disabled={dispatching}
                className="w-full bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold py-2 rounded text-xs flex items-center justify-center space-x-2 transition shadow-panel"
              >
                <Zap className={`w-3.5 h-3.5 fill-current ${dispatching ? 'animate-spin' : ''}`} />
                <span>{dispatching ? 'Orchestrating...' : 'Auto Dispatch (AI)'}</span>
              </button>

              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="w-full bg-[#172B40] hover:bg-[#263B50] text-white py-2 rounded text-xs border border-[#263B50] flex items-center justify-center space-x-1.5 transition"
              >
                <Send className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span>Manual Dispatch</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button className="bg-[#132438] hover:bg-[#172B40] text-[#94A3B8] hover:text-white py-1.5 rounded text-[11px] border border-[#263B50] transition">
                  Reassign
                </button>
                <button className="bg-[#132438] hover:bg-red-950/40 text-[#EF4444] py-1.5 rounded text-[11px] border border-red-900/60 transition">
                  ✕ Cancel Dispatch
                </button>
              </div>
            </div>
          </div>

          {/* Fuel & Readiness Note */}
          <div className="bg-[#0D1829] p-2.5 rounded border border-[#263B50] text-[10px] font-mono text-[#94A3B8]">
            <div className="flex justify-between text-white font-bold mb-1">
              <span>Avg. Fleet Fuel Level</span>
              <span className="text-[#22C55E]">76%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#172B40] overflow-hidden">
              <div className="h-full bg-[#22C55E] w-[76%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Dispatches Table, Response Performance Trend, Fleet Status Donut */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Active Dispatches (6) Table (5 cols) */}
        <div className="md:col-span-5 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Active Dispatches ({onDispatchCount})</span>
            <span className="text-[#23B9D6] text-[10px] cursor-pointer hover:underline">View All →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] font-mono">
              <thead>
                <tr className="text-[#64748B] border-b border-[#263B50]">
                  <th className="pb-1">Incident ID</th>
                  <th className="pb-1">Location</th>
                  <th className="pb-1">Fleet</th>
                  <th className="pb-1">ETA</th>
                  <th className="pb-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263B50]/40 text-white">
                <tr>
                  <td className="py-1 text-[#23B9D6]">INC-0147</td>
                  <td className="py-1 truncate max-w-[80px]">Bhowanipore</td>
                  <td className="py-1">AMB-07, 15</td>
                  <td className="py-1 text-[#22C55E]">4 min</td>
                  <td className="py-1 text-[#22C55E]">En Route</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">INC-0146</td>
                  <td className="py-1 truncate max-w-[80px]">Howrah</td>
                  <td className="py-1">AMB-03</td>
                  <td className="py-1 text-[#F59E0B]">7 min</td>
                  <td className="py-1 text-[#F59E0B]">En Route</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">INC-0145</td>
                  <td className="py-1 truncate max-w-[80px]">Salt Lake</td>
                  <td className="py-1">AMB-19</td>
                  <td className="py-1 text-[#F59E0B]">9 min</td>
                  <td className="py-1 text-[#F59E0B]">En Route</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">INC-0144</td>
                  <td className="py-1 truncate max-w-[80px]">Garden Reach</td>
                  <td className="py-1">AMB-20, 24</td>
                  <td className="py-1 text-[#22C55E]">6 min</td>
                  <td className="py-1 text-[#22C55E]">En Route</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Response Performance Trend (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Response Performance (24h)</span>
            <span className="text-[#23B9D6] text-[10px]">ETA vs Dispatch</span>
          </div>

          <LineChart data={perfTrend} color="#23B9D6" height={70} />

          <div className="flex justify-between text-[10px] font-mono pt-1 text-[#94A3B8]">
            <span>Avg Dispatch: <b className="text-white">4.8m</b></span>
            <span>Avg On-Scene: <b className="text-white">7.2m</b></span>
            <span>On-Time: <b className="text-[#22C55E]">91.6%</b></span>
          </div>
        </div>

        {/* Fleet Status Donut (3 cols) */}
        <div className="md:col-span-3 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1 mb-1">
            Fleet Status
          </div>

          <DonutChart
            segments={fleetDonut}
            centerValue={totalCount}
            centerLabel="Vehicles"
            size={100}
            strokeWidth={12}
          />
        </div>
      </div>

      {/* Manual Dispatch Modal */}
      {isDispatchModalOpen && activeAmb && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-card p-5 max-w-md w-full border border-[#23B9D6] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
              <div className="font-bold text-white text-sm">
                Dispatch Ambulance: {activeAmb.vehicle_number}
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">Target Incident</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.name || `${inc.disaster_type} - ${inc.address || 'Kolkata'}`} (Severity: {inc.severity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-[#132438] p-3 rounded border border-[#263B50] space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Vehicle Type:</span>
                  <span className="text-white">{activeAmb.vehicle_type || 'ALS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Current Base:</span>
                  <span className="text-white">{activeAmb.base_location || 'Park Circus'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Estimated Transit ETA:</span>
                  <span className="text-[#22C55E] font-bold">~ 6.5 minutes</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#263B50]">
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-3 py-1.5 rounded bg-[#172B40] text-[#94A3B8] hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleManualDispatch}
                disabled={dispatching}
                className="px-4 py-1.5 rounded bg-[#23B9D6] text-black font-bold text-xs flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{dispatching ? 'Dispatching...' : 'Confirm Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
