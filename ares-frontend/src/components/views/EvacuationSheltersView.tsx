import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Home,
  Layers,
  MapPin,
  Megaphone,
  Play,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Users,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, LineChart, ProgressBar, StatusBadge } from '../common/Charts';
import { LiveGisMap } from '../map/LiveGisMap';
import { Shelter } from '@/lib/api';

interface EvacuationSheltersViewProps {
  shelters: Shelter[];
  onRefresh?: () => void;
}

export const EvacuationSheltersView: React.FC<EvacuationSheltersViewProps> = ({
  shelters,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('Z-01');
  const [activeTab, setActiveTab] = useState<'overview' | 'population' | 'routes' | 'resources'>('overview');
  const [isAlerting, setIsAlerting] = useState(false);

  const zones = [
    { id: 'Z-01', name: 'Bhowanipore', priority: 'Critical', pop: 12400, evacuated: 6820, inProgress: 4910, status: 'Evacuating', risk: 'Critical', est: '~ 42 min' },
    { id: 'Z-02', name: 'Park Circus', priority: 'High', pop: 8750, evacuated: 5200, inProgress: 2400, status: 'In Progress', risk: 'High', est: '~ 60 min' },
    { id: 'Z-03', name: 'Alipore', priority: 'High', pop: 7620, evacuated: 4100, inProgress: 2100, status: 'In Progress', risk: 'High', est: '~ 55 min' },
    { id: 'Z-04', name: 'Tollygunge', priority: 'Medium', pop: 5980, evacuated: 5980, inProgress: 0, status: 'Evacuated', risk: 'Moderate', est: 'Complete' },
    { id: 'Z-05', name: 'Salt Lake (Sec V)', priority: 'Medium', pop: 4320, evacuated: 4320, inProgress: 0, status: 'Evacuated', risk: 'Moderate', est: 'Complete' },
    { id: 'Z-06', name: 'Howrah Border', priority: 'Low', pop: 3690, evacuated: 0, inProgress: 910, status: 'Pending', risk: 'Low', est: '~ 90 min' },
  ];

  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const sampleShelters = shelters.length > 0 ? shelters : [
    { id: '1', name: 'Kolkata Stadium Hall', address: 'Maidan, Kolkata', capacity: 2500, current_occupancy: 1890, latitude: 22.55, longitude: 88.34 },
    { id: '2', name: 'Bidhan Nagar School Hub', address: 'Salt Lake, Kolkata', capacity: 1800, current_occupancy: 1260, latitude: 22.58, longitude: 88.41 },
    { id: '3', name: 'Tollygunge Community Centre', address: 'Tollygunge, Kolkata', capacity: 1500, current_occupancy: 1220, latitude: 22.50, longitude: 88.34 },
    { id: '4', name: 'Alipore Relief Camp', address: 'Alipore, Kolkata', capacity: 1200, current_occupancy: 720, latitude: 22.53, longitude: 88.32 },
    { id: '5', name: 'Park Circus Relief Shelter', address: 'Park Circus, Kolkata', capacity: 2000, current_occupancy: 1640, latitude: 22.54, longitude: 88.36 },
  ];

  const evacDonut = [
    { label: 'Evacuated', value: 28450, color: '#22C55E' },
    { label: 'In Progress', value: 10320, color: '#F59E0B' },
    { label: 'Pending', value: 4000, color: '#64748B' },
  ];

  const timelineData = [
    { x: '10:00', y: 18 },
    { x: '11:00', y: 32 },
    { x: '12:00', y: 45 },
    { x: '13:00', y: 56 },
    { x: '14:00', y: 62 },
    { x: '15:00', y: 66.5 },
  ];

  const handleSendAlerts = () => {
    setIsAlerting(true);
    setTimeout(() => {
      setIsAlerting(false);
      alert('Emergency public announcement and IVR alerts dispatched to designated cell towers!');
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Evacuation & Shelters</h2>
          <p className="text-xs text-[#94A3B8]">
            Population evacuation, safe shelter management and relocation tracking across municipal perimeters
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-[#132438] hover:bg-[#172B40] border border-[#263B50] text-[#94A3B8] hover:text-white rounded px-3 py-1.5 text-xs flex items-center space-x-1.5 transition font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#23B9D6]" />
            <span>Sync Evacuation Telemetry</span>
          </button>
        )}
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="People to Evacuate"
          value="42,760"
          subtext="Target Envelopes"
          icon={<Users className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="Evacuated"
          value="28,450 (66.5%)"
          subtext="Safe in Relief Hubs"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="In Progress"
          value="10,320"
          subtext="Transit Corridors"
          icon={<Clock className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-800/60"
        />
        <KpiCard
          title="Active Shelters"
          value={sampleShelters.length || 24}
          subtext="Designated Facilities"
          icon={<Home className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-800/60"
        />
        <KpiCard
          title="High Risk Zones"
          value="3"
          subtext="Mandatory Evacuation"
          icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="Shelter Readiness"
          value="98.2%"
          subtext="Supplies & Rations OK"
          icon={<Shield className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
      </div>

      {/* Row 2: 3 Columns - Zones (3.5 cols), GIS Map (4.5 cols), Selected Zone & Actions (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[480px]">
        {/* Left Column: Evacuation Zones (6) (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Evacuation Zones ({zones.length})
              </span>
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
              {zones.map((z) => {
                const isSelected = activeZone.id === z.id;

                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`p-2.5 rounded-md border cursor-pointer transition ${
                      isSelected
                        ? 'border-[#23B9D6] bg-[#172B40]'
                        : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-[#23B9D6] font-mono">{z.id}</span>
                          <span className="text-xs font-bold text-white">{z.name}</span>
                        </div>
                        <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                          Priority: {z.priority} • Pop: {z.pop.toLocaleString()}
                        </div>
                      </div>

                      <StatusBadge
                        status={z.status}
                        variant={z.status === 'Evacuating' ? 'critical' : z.status === 'In Progress' ? 'warning' : 'safe'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#263B50] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <span>1 of 1</span>
          </div>
        </div>

        {/* Center Column: GIS Evacuation Map (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-3 flex flex-col justify-between rounded-md overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono mb-2">
            <span>Evacuation Operations — Kolkata</span>
            <span className="text-[#23B9D6] text-[10px]">Perimeter Corridors</span>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative border border-[#263B50]/60 min-h-[340px]">
            <LiveGisMap shelters={sampleShelters} />
          </div>
        </div>

        {/* Right Column: Selected Zone Details & Evacuation Actions (4 cols) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          <div className="ares-card p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <div>
                <div className="text-xs font-bold text-white">
                  Selected Zone: {activeZone.id} ({activeZone.name})
                </div>
              </div>
              <StatusBadge status={activeZone.risk} variant="critical" />
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center space-x-1 text-[10px] font-mono border-b border-[#263B50] pb-1">
              {(['overview', 'population', 'routes', 'resources'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    activeTab === t ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Aerial scene image */}
            <div className="h-24 rounded overflow-hidden bg-black/40 border border-[#263B50] relative">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80"
                alt="Emergency Relief Shelter"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Specs */}
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">Total Population:</span>
                <span className="text-white font-medium">{activeZone.pop.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">Evacuated:</span>
                <span className="text-[#22C55E] font-bold">
                  {activeZone.evacuated.toLocaleString()} ({Math.round((activeZone.evacuated / activeZone.pop) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">In Progress:</span>
                <span className="text-[#F59E0B] font-medium">{activeZone.inProgress.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">Est. Completion:</span>
                <span className="text-white font-medium">{activeZone.est}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#64748B]">Risk Level:</span>
                <span className="text-[#EF4444] font-bold">{activeZone.risk}</span>
              </div>
            </div>
          </div>

          {/* Evacuation Actions Bar */}
          <div className="ares-card p-3 space-y-2">
            <div className="text-xs font-bold text-white border-b border-[#263B50] pb-1 font-mono uppercase">
              Evacuation Actions
            </div>

            <div className="space-y-2">
              <button
                onClick={() => alert(`Evacuation initiated for Zone ${activeZone.id}!`)}
                className="w-full bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold py-2 rounded text-xs flex items-center justify-center space-x-1.5 transition shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initiate Evacuation</span>
              </button>

              <button className="w-full bg-[#172B40] hover:bg-[#263B50] text-white py-1.5 rounded text-[11px] border border-[#263B50] transition">
                Expand Perimeter Zone
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSendAlerts}
                  disabled={isAlerting}
                  className="bg-[#132438] hover:bg-[#172B40] text-[#23B9D6] p-1.5 rounded text-[10px] border border-[#263B50] flex items-center justify-center space-x-1 transition"
                >
                  <Bell className="w-3 h-3" />
                  <span>Send Alerts</span>
                </button>
                <button
                  onClick={handleSendAlerts}
                  disabled={isAlerting}
                  className="bg-[#132438] hover:bg-[#172B40] text-[#22C55E] p-1.5 rounded text-[10px] border border-[#263B50] flex items-center justify-center space-x-1 transition"
                >
                  <Megaphone className="w-3 h-3" />
                  <span>Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Shelter Status Table, Evacuation Progress Donut, Timeline Line Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Shelter Status Table (5 cols) */}
        <div className="md:col-span-5 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Shelter Status ({sampleShelters.length})</span>
            <span className="text-[#23B9D6] text-[10px]">View All →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] font-mono">
              <thead>
                <tr className="text-[#64748B] border-b border-[#263B50]">
                  <th className="pb-1">Shelter Name</th>
                  <th className="pb-1">Location</th>
                  <th className="pb-1 text-right">Capacity</th>
                  <th className="pb-1 text-right">Occupied</th>
                  <th className="pb-1 text-right">Util. %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263B50]/40 text-white">
                {sampleShelters.map((s) => {
                  const pct = Math.round((s.current_occupancy / s.capacity) * 100);
                  return (
                    <tr key={s.id}>
                      <td className="py-1 font-sans font-medium truncate max-w-[120px]">{s.name}</td>
                      <td className="py-1 text-[#94A3B8] truncate max-w-[70px]">{s.address}</td>
                      <td className="py-1 text-right font-bold">{s.capacity}</td>
                      <td className="py-1 text-right text-[#22C55E]">{s.current_occupancy}</td>
                      <td className="py-1 text-right font-bold">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evacuation Progress Donut (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1 mb-1">
            Evacuation Progress
          </div>

          <DonutChart
            segments={evacDonut}
            centerValue="66.5%"
            centerLabel="Evacuated"
            size={110}
            strokeWidth={12}
          />
        </div>

        {/* Evacuation Timeline Line Chart (3 cols) */}
        <div className="md:col-span-3 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1 mb-1 flex items-center justify-between">
            <span>Evacuation Timeline</span>
            <span className="text-[#22C55E] text-[10px]">66.5% Done</span>
          </div>

          <LineChart data={timelineData} color="#22C55E" height={70} />

          <div className="text-[10px] font-mono text-[#94A3B8] text-center pt-1">
            42,760 Total Citizens Relocated
          </div>
        </div>
      </div>
    </div>
  );
};
