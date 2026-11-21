import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  LifeBuoy,
  MessageSquare,
  Paperclip,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, LineChart, StatusBadge } from '../common/Charts';
import { AgencyMessage, EmergencyContact, aresApi } from '@/lib/api';

interface AgencyCommunicationsViewProps {
  contacts: EmergencyContact[];
  messages: AgencyMessage[];
  onRefresh?: () => void;
}

export const AgencyCommunicationsView: React.FC<AgencyCommunicationsViewProps> = ({
  contacts,
  messages,
  onRefresh,
}) => {
  const [selectedChannel, setSelectedChannel] = useState('EOC - All Agencies');
  const [composerTab, setComposerTab] = useState<'field' | 'public' | 'interagency'>('field');
  const [messageText, setMessageText] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [transmitting, setTransmitting] = useState(false);

  const channels = [
    { name: 'EOC - All Agencies', desc: 'Multi-agency coordination', badge: 12, status: 'Live' },
    { name: 'Police Operations', desc: 'Law & order, perimeter evacuation', badge: 3, status: 'Live' },
    { name: 'Health & Medical', desc: 'Hospitals, casualty, blood supply', badge: 6, status: 'Live' },
    { name: 'Fire & Rescue', desc: 'Fire combat, technical search & rescue', badge: 2, status: 'Live' },
    { name: 'Transport & Logistics', desc: 'Evacuation corridors & supply transit', badge: 5, status: 'Live' },
    { name: 'District Administration', desc: 'Field updates, DM collectorate reports', badge: 4, status: 'Live' },
  ];

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setTransmitting(true);
    try {
      await aresApi.sendAgencyMessage({
        agency_code: 'ALL_AGENCIES',
        subject: `${composerTab.toUpperCase()}: Broadcast Alert`,
        body: messageText,
        priority,
        is_simulation: true,
      });
      setMessageText('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTransmitting(false);
    }
  };

  const channelHealthDonut = [
    { label: 'Online', value: 12, color: '#22C55E' },
    { label: 'Degraded', value: 0, color: '#F59E0B' },
    { label: 'Offline', value: 0, color: '#EF4444' },
  ];

  const trafficTrend = [
    { x: '00:00', y: 110 },
    { x: '04:00', y: 135 },
    { x: '08:00', y: 190 },
    { x: '12:00', y: 220 },
    { x: '16:00', y: 248 },
    { x: '20:00', y: 215 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agency Communications</h2>
          <p className="text-xs text-[#94A3B8]">
            Multi-agency coordination, emergency broadcasts and automated dispatch logs (ERSS 112 Bridge)
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-[#132438] hover:bg-[#172B40] border border-[#263B50] text-[#94A3B8] hover:text-white rounded px-3 py-1.5 text-xs flex items-center space-x-1.5 transition font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#23B9D6]" />
            <span>Sync Comms</span>
          </button>
        )}
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 12) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="Connected Agencies"
          value={contacts.length || 12}
          subtext="Police / Fire / NDRF"
          icon={<Users className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="Messages (24h)"
          value="248"
          subtext="Telemetry Dispatches"
          icon={<MessageSquare className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="Active Channels"
          value="18"
          subtext="Secured Radio / VoIP"
          icon={<Radio className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-800/60"
        />
        <KpiCard
          title="Message Delivery"
          value="96.8%"
          subtext="Encrypted Protocol"
          icon={<Zap className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-800/60"
        />
        <KpiCard
          title="Comms. Failures"
          value="0"
          subtext="Zero Outages"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="Avg. Latency"
          value="2.4 s"
          subtext="Broadcast Relay"
          icon={<Clock className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
      </div>

      {/* Row 2: 3 Columns - Channels (3.5 cols), Multi-Agency Network (4.5 cols), Composer & Coordination (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[480px]">
        {/* Left Column: Communication Channels (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Communication Channels
              </span>
              <button className="text-[10px] bg-[#172B40] text-[#23B9D6] border border-[#23B9D6]/40 px-2 py-0.5 rounded font-mono hover:bg-[#23B9D6]/20">
                + Add Channel
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
              {channels.map((ch, i) => {
                const isSelected = selectedChannel === ch.name;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedChannel(ch.name)}
                    className={`p-2.5 rounded-md border cursor-pointer transition ${
                      isSelected
                        ? 'border-[#23B9D6] bg-[#172B40]'
                        : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                          <Radio className="w-3.5 h-3.5 text-[#23B9D6]" />
                          <span>{ch.name}</span>
                        </div>
                        <div className="text-[10px] text-[#94A3B8] truncate">{ch.desc}</div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] bg-emerald-950 text-[#22C55E] px-1.5 py-0.2 rounded font-mono flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] pulse-live" />
                          <span>Live</span>
                        </span>
                        <span className="text-[10px] bg-[#080F1B] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                          {ch.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#263B50] text-[10px] text-[#64748B] font-mono flex justify-between">
            <span>Unified ERSS 112 Bridge</span>
            <span>Simulated Telephony Active</span>
          </div>
        </div>

        {/* Center Column: Multi-Agency Network Radial Hub (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-3 flex flex-col justify-between items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono mb-2">
            <span>Multi-Agency Network</span>
            <span className="text-[#23B9D6] text-[10px]">Inter-Agency Relay</span>
          </div>

          {/* Radial Spokes Diagram */}
          <div className="relative w-full h-[360px] flex items-center justify-center my-auto">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 360">
              {/* Lines from center (200, 180) to 8 peripheral agency cards */}
              {[
                { x: 200, y: 35 },   // District Admin (top)
                { x: 320, y: 70 },   // Health Dept (top right)
                { x: 335, y: 180 },  // Fire & Rescue (right)
                { x: 320, y: 290 },  // Municipal Corp (bottom right)
                { x: 200, y: 325 },  // Telecom (bottom)
                { x: 80, y: 290 },   // Power & Utilities (bottom left)
                { x: 65, y: 180 },   // Transport (left)
                { x: 80, y: 70 },    // Police (top left)
              ].map((pos, i) => (
                <line
                  key={i}
                  x1="200"
                  y1="180"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#23B9D6"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  strokeOpacity="0.6"
                />
              ))}

              <circle cx="200" cy="180" r="45" fill="none" stroke="#23B9D6" strokeWidth="1" strokeOpacity="0.4" />
            </svg>

            {/* Central ARES Command (EOC) Hub */}
            <div className="z-10 w-24 h-24 rounded-full bg-[#080F1B] border-2 border-[#23B9D6] flex flex-col items-center justify-center text-center shadow-cyan-glow p-1">
              <div className="text-xl font-black text-[#23B9D6]">A</div>
              <div className="text-[10px] font-bold text-white">ARES Command</div>
              <div className="text-[8px] text-[#94A3B8] font-mono">(EOC)</div>
            </div>

            {/* Surrounding Agency Cards */}
            <div className="absolute top-2 bg-[#132438] border border-emerald-500/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              District Admin
            </div>

            <div className="absolute top-12 right-6 bg-[#132438] border border-red-500/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Health Dept
            </div>

            <div className="absolute right-2 top-40 bg-[#132438] border border-amber-500/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Fire & Rescue
            </div>

            <div className="absolute bottom-10 right-6 bg-[#132438] border border-[#23B9D6]/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Municipal Corp
            </div>

            <div className="absolute bottom-2 bg-[#132438] border border-purple-500/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Telecom
            </div>

            <div className="absolute bottom-10 left-6 bg-[#132438] border border-amber-500/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Power & Utilities
            </div>

            <div className="absolute left-2 top-40 bg-[#132438] border border-blue-500/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Transport
            </div>

            <div className="absolute top-12 left-6 bg-[#132438] border border-[#23B9D6]/80 rounded px-2 py-1 text-[9px] font-mono text-white text-center shadow">
              Police Control
            </div>
          </div>
        </div>

        {/* Right Column: Active Coordination & Alert Composer (4 cols) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          {/* Active Coordination List */}
          <div className="ares-card p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
              <span>Active Coordination</span>
              <span className="text-[#23B9D6] text-[10px]">View All →</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">INC-0147 Building Collapse</span>
                  <StatusBadge status="In Progress" variant="warning" />
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">
                  Police, Fire, Health, District Admin
                </div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">INC-0146 Flooded Area</span>
                  <StatusBadge status="In Progress" variant="warning" />
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">
                  NDRF, District Admin, Transport
                </div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate">INC-0144 Landslide Risk</span>
                  <StatusBadge status="Monitoring" variant="safe" />
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">
                  DM, Police, PWD, Local Admin
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast / Alert Composer (Exact match to Screenshot 12) */}
          <div className="ares-card p-3 space-y-2">
            <div className="text-xs font-bold text-white border-b border-[#263B50] pb-1 font-mono uppercase">
              Broadcast / Alert Composer
            </div>

            {/* Composer Tabs */}
            <div className="flex items-center space-x-1 text-[10px] font-mono bg-[#0D1829] p-1 rounded border border-[#263B50]">
              {(['field', 'public', 'interagency'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setComposerTab(t)}
                  className={`flex-1 py-1 rounded text-center capitalize transition ${
                    composerTab === t ? 'bg-[#23B9D6] text-black font-bold' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t === 'field' ? 'Field Alert' : t === 'public' ? 'Public Alert' : 'Inter-Agency'}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, 500))}
                placeholder="Type your message or select an automated dispatch template..."
                rows={3}
                className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#23B9D6] resize-none"
              />
              <span className="absolute bottom-2 right-2 text-[9px] font-mono text-[#64748B]">
                {messageText.length} / 500
              </span>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-[#94A3B8]">
                <button className="flex items-center space-x-1 hover:text-white">
                  <Paperclip className="w-3 h-3" />
                  <span>Attach</span>
                </button>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="bg-[#0D1829] border border-[#263B50] rounded px-1.5 py-0.5 text-[10px] text-white font-mono"
                >
                  <option value="CRITICAL">Priority: High</option>
                  <option value="HIGH">Priority: Medium</option>
                  <option value="LOW">Priority: Low</option>
                </select>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={transmitting || !messageText.trim()}
                className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-3 py-1 rounded text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{transmitting ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Communications Table, Message Traffic Line Chart, Channel Health Donut */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Recent Communications Table (5 cols) */}
        <div className="md:col-span-5 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Recent Communications (Live)</span>
            <span className="text-[#23B9D6] text-[10px]">View All →</span>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center justify-between p-1.5 rounded bg-[#0D1829]">
              <div className="flex items-center space-x-2 truncate">
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-[#22C55E] border border-emerald-800 shrink-0 font-bold">
                  Health
                </span>
                <span className="text-white truncate">Additional 5 ICU beds activated at RG Kar.</span>
              </div>
              <span className="text-[#64748B] shrink-0">14:35</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-[#0D1829]">
              <div className="flex items-center space-x-2 truncate">
                <span className="px-1.5 py-0.2 rounded bg-blue-950 text-[#3B82F6] border border-blue-800 shrink-0 font-bold">
                  Police
                </span>
                <span className="text-white truncate">Area Z-01 secured. Evacuation in progress.</span>
              </div>
              <span className="text-[#64748B] shrink-0">14:32</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-[#0D1829]">
              <div className="flex items-center space-x-2 truncate">
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-[#EF4444] border border-red-800 shrink-0 font-bold">
                  Fire
                </span>
                <span className="text-white truncate">Rescue team RT-03 reached incident site.</span>
              </div>
              <span className="text-[#64748B] shrink-0">14:28</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-[#0D1829]">
              <div className="flex items-center space-x-2 truncate">
                <span className="px-1.5 py-0.2 rounded bg-purple-950 text-[#A855F7] border border-purple-800 shrink-0 font-bold">
                  EOC
                </span>
                <span className="text-white truncate">All agencies: Maintain Scenario Bravo.</span>
              </div>
              <span className="text-[#64748B] shrink-0">14:12</span>
            </div>
          </div>
        </div>

        {/* Message Traffic Trend (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Message Traffic (Last 24 Hours)</span>
            <span className="text-[#23B9D6] text-[10px]">Peak: 248 msgs</span>
          </div>

          <LineChart data={trafficTrend} color="#23B9D6" height={70} />

          <div className="text-[10px] font-mono text-[#94A3B8] text-center pt-1">
            Zero Telephony Dropouts • Continuous Heartbeat
          </div>
        </div>

        {/* Channel Health Donut (3 cols) */}
        <div className="md:col-span-3 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1 mb-1">
            Channel Health
          </div>

          <DonutChart
            segments={channelHealthDonut}
            centerValue="12"
            centerLabel="Agencies"
            size={100}
            strokeWidth={12}
          />
        </div>
      </div>
    </div>
  );
};
