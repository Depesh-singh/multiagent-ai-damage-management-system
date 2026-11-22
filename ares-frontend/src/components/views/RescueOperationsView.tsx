import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  LifeBuoy,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Users,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, LineChart, ProgressBar, StatusBadge } from '../common/Charts';
import { LiveGisMap } from '../map/LiveGisMap';
import { Incident, RescueTeam } from '@/lib/api';

interface RescueOperationsViewProps {
  rescueTeams: RescueTeam[];
  incidents?: Incident[];
  onRefresh?: () => void;
}

export const RescueOperationsView: React.FC<RescueOperationsViewProps> = ({
  rescueTeams,
  incidents = [],
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    rescueTeams.length > 0 ? rescueTeams[0].id : ''
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'resources' | 'victims' | 'updates'>('overview');

  const activeTeam =
    rescueTeams.find((r) => r.id === selectedTeamId) || (rescueTeams.length > 0 ? rescueTeams[0] : null);

  const activeCount = rescueTeams.filter((r) => r.status === 'DEPLOYED' || r.status === 'RESCUING').length || 14;
  const deployingCount = 2;
  const standbyCount = 1;
  const totalRescued = rescueTeams.reduce((acc, cur) => acc + (cur.people_rescued || 5), 0) || 37;

  const perfTrend = [
    { x: '00:00', y: 15 },
    { x: '04:00', y: 22 },
    { x: '08:00', y: 28 },
    { x: '12:00', y: 34 },
    { x: '16:00', y: 38 },
    { x: '20:00', y: 32 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Rescue Operations</h2>
          <p className="text-xs text-[#94A3B8]">
            Search, rescue, extraction and on-ground response coordination across specialized units
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-[#132438] hover:bg-[#172B40] border border-[#263B50] text-[#94A3B8] hover:text-white rounded px-3 py-1.5 text-xs flex items-center space-x-1.5 transition font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#23B9D6]" />
            <span>Sync Missions</span>
          </button>
        )}
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 09) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="Rescue Teams"
          value={rescueTeams.length || 18}
          subtext="USAR / SDRF / Fire"
          icon={<LifeBuoy className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="Active"
          value={activeCount}
          subtext="Field Operations"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="Deploying"
          value={deployingCount}
          subtext="Transit En Route"
          icon={<Activity className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-800/60"
        />
        <KpiCard
          title="On Standby"
          value={standbyCount}
          subtext="Reserve Units"
          icon={<MapPin className="w-5 h-5 text-[#A855F7]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-800/60"
        />
        <KpiCard
          title="Distress (Help)"
          value="1"
          subtext="SOS Escalation"
          icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-800/60"
        />
        <KpiCard
          title="People Rescued"
          value={totalRescued}
          subtext="Confirmed Saved"
          icon={<Users className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
      </div>

      {/* Row 2: 3 Columns - Task Queue (3.5 cols), GIS Rescue Map (4.5 cols), Details & Progress (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[500px]">
        {/* Left Column: Rescue Task Queue (12) (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Rescue Task Queue (12)
              </span>
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-1">
              {incidents.slice(0, 6).map((inc, i) => {
                const priority = inc.severity >= 4 ? 'Critical' : inc.severity === 3 ? 'High' : 'Medium';

                return (
                  <div
                    key={inc.id || i}
                    className="p-2.5 rounded-md border border-[#263B50] bg-[#0D1829] hover:border-[#354E69] cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate font-mono">
                          INC-2025-014{i + 1}
                        </div>
                        <div className="text-xs font-bold text-white truncate mt-0.5">
                          {inc.name || 'Building Collapse — Bhowanipore'}
                        </div>
                        <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                          {inc.estimated_casualties || 25} people trapped (Est.)
                        </div>
                      </div>

                      <StatusBadge
                        status={priority}
                        variant={priority === 'Critical' ? 'critical' : priority === 'High' ? 'warning' : 'safe'}
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
            <span>1 of 3</span>
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Column: Live Rescue Map (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-3 flex flex-col justify-between rounded-md overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono mb-2">
            <span>Live Rescue Operations — Kolkata</span>
            <span className="text-[#23B9D6] text-[10px]">USAR Field Grid</span>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative border border-[#263B50]/60 min-h-[360px]">
            <LiveGisMap rescueTeams={rescueTeams} incidents={incidents} />
          </div>
        </div>

        {/* Right Column: Incident Rescue Details & Progress (4 cols) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          <div className="ares-card p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <div>
                <div className="text-xs font-bold text-white truncate max-w-[190px]">
                  Incident — INC-2025-0147
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono">
                  Building Collapse — Bhowanipore
                </div>
              </div>
              <StatusBadge status="Critical" variant="critical" />
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center space-x-1 text-[10px] font-mono border-b border-[#263B50] pb-1">
              {(['overview', 'teams', 'resources', 'victims', 'updates'] as const).map((t) => (
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

            {/* Scene photo */}
            <div className="h-24 rounded overflow-hidden bg-black/40 border border-[#263B50] relative">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=500&q=80"
                alt="Rescue operation"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Specs */}
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">Location:</span>
                <span className="text-white">Bhowanipore, Kolkata</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">Reported:</span>
                <span className="text-white">14:25 IST</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">People Trapped:</span>
                <span className="text-[#EF4444] font-bold">25</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                <span className="text-[#64748B]">People Rescued:</span>
                <span className="text-[#22C55E] font-bold">7</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#64748B]">Risk Level:</span>
                <span className="text-[#F59E0B]">Secondary Collapse</span>
              </div>
            </div>
          </div>

          {/* Rescue Progress Stepper (Exact match to Screenshot 09) */}
          <div className="ares-card p-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-white font-mono border-b border-[#263B50] pb-1">
              <span>Rescue Progress</span>
              <span className="text-[#22C55E]">28%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#172B40] overflow-hidden">
              <div className="h-full bg-[#22C55E] w-[28%]" />
            </div>

            <div className="flex items-center justify-between text-[8px] font-mono text-[#94A3B8] pt-1">
              <div className="text-center">
                <span className="text-white block font-bold">Mobilized</span>
                <span>14:26</span>
              </div>
              <div className="text-center">
                <span className="text-white block font-bold">En Route</span>
                <span>14:29</span>
              </div>
              <div className="text-center">
                <span className="text-white block font-bold">On Site</span>
                <span>14:34</span>
              </div>
              <div className="text-center">
                <span className="text-[#23B9D6] block font-bold">Rescuing</span>
                <span>In Progress</span>
              </div>
              <div className="text-center">
                <span className="text-[#64748B] block">Handover</span>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Rescue Teams Table, Performance Line Chart, Resource Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Active Teams (5 cols) */}
        <div className="md:col-span-5 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Active Rescue Teams ({activeCount})</span>
            <span className="text-[#23B9D6] text-[10px]">View All →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] font-mono">
              <thead>
                <tr className="text-[#64748B] border-b border-[#263B50]">
                  <th className="pb-1">Team ID</th>
                  <th className="pb-1">Type</th>
                  <th className="pb-1">Location</th>
                  <th className="pb-1">Status</th>
                  <th className="pb-1">Rescued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263B50]/40 text-white">
                <tr>
                  <td className="py-1 text-[#23B9D6]">RT-01</td>
                  <td className="py-1">USAR</td>
                  <td className="py-1">Bhowanipore</td>
                  <td className="py-1 text-[#22C55E]">On Site</td>
                  <td className="py-1 text-white font-bold">3</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">RT-03</td>
                  <td className="py-1">USAR</td>
                  <td className="py-1">Bhowanipore</td>
                  <td className="py-1 text-[#23B9D6]">Rescuing</td>
                  <td className="py-1 text-white font-bold">2</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">RT-05</td>
                  <td className="py-1">Collapse Struct</td>
                  <td className="py-1">Park Circus</td>
                  <td className="py-1 text-[#23B9D6]">Rescuing</td>
                  <td className="py-1 text-white font-bold">1</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">RT-07</td>
                  <td className="py-1">SAR</td>
                  <td className="py-1">Shyambazar</td>
                  <td className="py-1 text-[#F59E0B]">En Route</td>
                  <td className="py-1 text-white font-bold">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rescue Performance (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Rescue Performance (24h)</span>
            <span className="text-[#23B9D6] text-[10px]">Operations & Lives</span>
          </div>

          <LineChart data={perfTrend} color="#22C55E" height={70} />

          <div className="flex justify-between text-[10px] font-mono pt-1 text-[#94A3B8]">
            <span>Operations: <b className="text-white">14</b></span>
            <span>Rescued: <b className="text-[#22C55E]">37</b></span>
            <span>Avg Time: <b className="text-white">12.6m</b></span>
          </div>
        </div>

        {/* Resource Deployment Progress (3 cols) */}
        <div className="md:col-span-3 ares-card p-3 flex flex-col justify-between space-y-1.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1">
            Resource Deployment
          </div>

          <div className="space-y-1.5">
            <ProgressBar label="Rescue Teams" value={14} total={18} percentage={78} color="#23B9D6" />
            <ProgressBar label="Drones (Aerial)" value={4} total={6} percentage={67} color="#3B82F6" />
            <ProgressBar label="Heavy Equipment" value={3} total={4} percentage={75} color="#F59E0B" />
            <ProgressBar label="Medical Teams" value={5} total={6} percentage={83} color="#22C55E" />
          </div>
        </div>
      </div>
    </div>
  );
};
