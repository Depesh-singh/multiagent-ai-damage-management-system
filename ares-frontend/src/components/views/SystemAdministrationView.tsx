import React, { useState } from 'react';
import {
  Shield,
  Server,
  Database,
  Users,
  Key,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu,
  Wifi,
  Globe,
  HardDrive,
  Activity,
} from 'lucide-react';
import { aresApi } from '@/lib/api';
import { KpiCard, StatusBadge } from '../common/Charts';

interface SystemAdministrationViewProps {
  onRefreshAll: () => Promise<void>;
  onClearIncidents?: () => Promise<void>;
  dbConnected: boolean;
  incidentCount: number;
}

export const SystemAdministrationView: React.FC<SystemAdministrationViewProps> = ({
  onRefreshAll,
  onClearIncidents,
  dbConnected,
  incidentCount,
}) => {
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to clear all active incidents and reset to a clean operational state?')) {
      return;
    }
    setClearing(true);
    setClearMessage('Purging incidents from SQLite database...');
    try {
      if (onClearIncidents) {
        await onClearIncidents();
      }
      setClearMessage('✓ Database Reset to Clean State Successfully!');
      setTimeout(() => setClearMessage(null), 3000);
    } catch (err: any) {
      setClearMessage(`Error resetting: ${err.message || 'Unknown error'}`);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-3 select-none">
      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <KpiCard
          label="System Status"
          value={dbConnected ? 'OPERATIONAL' : 'DISCONNECTED'}
          subValue="All Daemons Active"
          status={dbConnected ? 'success' : 'critical'}
          icon={<Server className="w-4 h-4 text-[#22C55E]" />}
        />
        <KpiCard
          label="Database Cluster"
          value="SQLite / PG"
          subValue="WAL Mode Enabled"
          status="info"
          icon={<Database className="w-4 h-4 text-[#23B9D6]" />}
        />
        <KpiCard
          label="Active Incidents"
          value={incidentCount.toString()}
          subValue="In Local Memory"
          status="warning"
          icon={<AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
        />
        <KpiCard
          label="Security Protocol"
          value="TLS 1.3 / RBAC"
          subValue="Enterprise Hardened"
          status="success"
          icon={<Shield className="w-4 h-4 text-[#22C55E]" />}
        />
        <KpiCard
          label="WebSocket Bridge"
          value="ws://:5000"
          subValue="Real-time Broadcast"
          status="info"
          icon={<Wifi className="w-4 h-4 text-[#23B9D6]" />}
        />
        <KpiCard
          label="GIS Basemap Service"
          value="CartoDB / Esri"
          subValue="100% Free - No API Key"
          status="success"
          icon={<Globe className="w-4 h-4 text-[#22C55E]" />}
        />
      </div>

      {/* Main Settings & Admin Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-y-auto pr-1">
        {/* Column 1 (6 cols): Core Services Health Matrix */}
        <div className="col-span-12 lg:col-span-6 bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#23B9D6]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Microservices Health & Uptime
                </span>
              </div>
              <span className="text-[10px] text-[#22C55E] font-bold">ALL HEALTHY</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  name: 'FastAPI REST Core Engine',
                  port: ':5000',
                  status: 'ONLINE',
                  uptime: '99.98%',
                  latency: '12ms',
                },
                {
                  name: 'Real-time WebSocket Push Bus',
                  port: ':5000/ws',
                  status: 'ONLINE',
                  uptime: '100%',
                  latency: '4ms',
                },
                {
                  name: 'ARES Multi-Agent Swarm (10 Agents)',
                  port: 'In-Memory',
                  status: 'ACTIVE',
                  uptime: '100%',
                  latency: '85ms',
                },
                {
                  name: 'SQLite Operational Datastore',
                  port: 'ares.db (WAL)',
                  status: 'ONLINE',
                  uptime: '100%',
                  latency: '1ms',
                },
                {
                  name: 'Vite React 18 Production Host',
                  port: ':3000',
                  status: 'ONLINE',
                  uptime: '100%',
                  latency: '8ms',
                },
              ].map((svc, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#132438] rounded border border-[#263B50] flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{svc.name}</span>
                      <span className="text-[10px] text-[#23B9D6] font-mono">{svc.port}</span>
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      Uptime: {svc.uptime} • Latency: {svc.latency}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-[#22C55E] border border-emerald-800">
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={() => onRefreshAll()}
              className="w-full py-2 bg-[#132438] hover:bg-[#172B40] text-white border border-[#263B50] hover:border-[#23B9D6] rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#23B9D6]" />
              <span>Poll Service Diagnostics</span>
            </button>
          </div>
        </div>

        {/* Column 2 (6 cols): Database Maintenance & RBAC Roles */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-3">
          {/* Card 1: Database Operations & State Reset */}
          <div className="bg-[#101C2B] p-3 rounded-lg border border-[#263B50]">
            <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-[#EF4444]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Database Management & Data Purge
                </span>
              </div>
              <span className="text-[10px] text-[#EF4444] font-bold">ADMIN ELEVATED</span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">
              If duplicate mock incidents or test simulation data have populated the operational database, use this function to purge incidents and return the workspace to a pristine command-ready state.
            </p>

            {clearMessage && (
              <div className="p-2 mb-3 bg-[#132438] rounded border border-[#263B50] text-xs font-bold text-[#22C55E] animate-pulse">
                {clearMessage}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleResetData}
                disabled={clearing}
                className="flex-1 py-2 bg-red-950/80 hover:bg-red-900 text-[#EF4444] hover:text-white border border-red-800 rounded text-xs font-bold flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearing ? 'Purging Database...' : 'Clear All Incidents (Fresh State)'}</span>
              </button>

              <button
                onClick={() => onRefreshAll()}
                className="px-4 py-2 bg-[#132438] hover:bg-[#172B40] text-white border border-[#263B50] rounded text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#23B9D6]" />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Card 2: Role-Based Access Control (RBAC) */}
          <div className="bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex-1">
            <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#23B9D6]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Role-Based Access Control (RBAC)
                </span>
              </div>
              <span className="text-[10px] text-[#94A3B8]">CURRENT USER: COMMANDER</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { role: 'Incident Commander', user: 'commander@ares.gov.in', permissions: 'Full Read/Write, Human Approval, Dispatch' },
                { role: 'Fleet Dispatcher', user: 'dispatch.kolkata@ares.gov.in', permissions: 'Ambulance & Route Override' },
                { role: 'Medical Logistics Officer', user: 'medical.sskm@ares.gov.in', permissions: 'Supply Requisition & Hospital Intake' },
                { role: 'Search & Rescue Leader', user: 'ndrf.sector4@gov.in', permissions: 'Rescue Formation Tracking & Check-in' },
              ].map((r, i) => (
                <div key={i} className="p-2 bg-[#132438] rounded border border-[#263B50]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{r.role}</span>
                    <span className="text-[10px] text-[#23B9D6] font-mono">{r.user}</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">{r.permissions}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
