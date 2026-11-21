import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  Megaphone,
  PhoneCall,
  Radio,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { aresApi } from '@/lib/api';

interface CommunicationViewProps {
  contacts: any[];
  messages: any[];
  onRefresh?: () => void;
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({ contacts, messages, onRefresh }) => {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSendMsgOpen, setIsSendMsgOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('CRITICAL DISASTER MOBILIZATION');
  const [broadcastBody, setBroadcastBody] = useState('All units execute emergency deployment orders. Triage centers active.');
  const [selectedAgency, setSelectedAgency] = useState('ERSS_112');
  const [directSubject, setDirectSubject] = useState('Priority Dispatch Directive');
  const [directBody, setDirectBody] = useState('Standby for mass casualty routing instructions.');
  const [sending, setSending] = useState(false);
  const [ackInProgress, setAckInProgress] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const defaultContacts = [
    { agency: 'ERSS_112', name: 'National Emergency Response Support System', phone: '112', jurisdiction: 'All India Unified Command' },
    { agency: 'AMBULANCE_108', name: 'State Emergency Ambulance Service (GVK EMRI)', phone: '108', jurisdiction: 'State Health Logistics' },
    { agency: 'FIRE_101', name: 'West Bengal Fire & Emergency HQ', phone: '101', jurisdiction: 'Kolkata Metropolitan Fire Division' },
    { agency: 'POLICE_100', name: 'Kolkata Police Control Room (Lalbazar)', phone: '100', jurisdiction: 'Law, Order & Traffic DMG' },
    { agency: 'NDRF_OPS', name: 'NDRF 2nd Battalion Ops Room', phone: '+91-33-2555-1122', jurisdiction: 'Disaster Search & Rescue' },
    { agency: 'DEOC_COLLECTORATE', name: 'District Emergency Operations Centre', phone: '+91-33-2214-3526', jurisdiction: 'District Magistrate Office' },
  ];

  const displayContacts = contacts.length > 0 ? contacts : defaultContacts;

  const handleBroadcast = async () => {
    setSending(true);
    try {
      await aresApi.broadcastAlert(broadcastSubject, broadcastBody, 'CRITICAL');
      setIsBroadcastOpen(false);
      setStatusMessage('Emergency broadcast successfully transmitted to all responding agencies.');
      setTimeout(() => setStatusMessage(null), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendDirect = async () => {
    setSending(true);
    const targetContact = displayContacts.find((c) => c.agency === selectedAgency) || displayContacts[0];
    try {
      await aresApi.sendAgencyMessage({
        recipient_agency: targetContact.agency,
        recipient_name: targetContact.name,
        recipient_phone: targetContact.phone,
        message_type: 'ORDER',
        subject: directSubject,
        body: directBody,
        priority: 'HIGH',
      });
      setIsSendMsgOpen(false);
      setStatusMessage(`Direct order dispatched to ${targetContact.name}.`);
      setTimeout(() => setStatusMessage(null), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Direct message failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAcknowledge = async (msgId: string) => {
    setAckInProgress(msgId);
    try {
      await aresApi.acknowledgeMessage(msgId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Ack error:', err);
    } finally {
      setAckInProgress(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Top Header */}
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-[#23B9D6]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              INTER-AGENCY COMMUNICATION CENTRE & ERSS 112 BRIDGE
            </h1>
            <p className="text-xs text-slate-400">
              Direct Telematics with ERSS 112, 108 Ambulance, 101 Fire, 100 Police, NDRF & District DEOC
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow transition"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={() => setIsSendMsgOpen(true)}
            className="bg-[#1A2940] hover:bg-[#2A4A6B] text-cyan-300 border border-[#1E3A5F] font-semibold px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Direct Message</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 px-4 py-2 rounded text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
        {/* Left 5 Cols: Directory */}
        <div className="col-span-5 ares-panel p-3 flex flex-col overflow-hidden">
          <div className="text-xs font-bold text-white mb-2 pb-2 border-b border-[#1E3A5F] flex items-center justify-between">
            <span>OFFICIAL EMERGENCY DIRECTORY</span>
            <span className="text-[10px] text-slate-400 font-mono">ERSS-112 Verified</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {displayContacts.map((c, i) => (
              <div key={i} className="bg-[#0B1220] border border-[#1E3A5F] p-2.5 rounded text-xs hover:border-slate-600 transition">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-[10px] bg-[#1A2940] text-[#23B9D6] px-1.5 py-0.5 rounded font-mono font-bold">
                    {c.agency}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{c.jurisdiction}</div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#1E3A5F] text-[11px]">
                  <span className="text-slate-400">Emergency Line:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>{c.phone}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 7 Cols: Telemetry Logs */}
        <div className="col-span-7 ares-panel p-3 flex flex-col overflow-hidden">
          <div className="text-xs font-bold text-[#23B9D6] mb-2 pb-2 border-b border-[#1E3A5F] flex items-center justify-between">
            <span>DISPATCH & BROADCAST TELEMETRY LOGS</span>
            <div className="flex items-center space-x-1.5 text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 font-mono">
              <ShieldAlert className="w-3 h-3" />
              <span>Simulation Mode (Zero Live Carrier Cost)</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {messages.length > 0 ? (
              messages.map((m, i) => {
                const isAcked = m.status === 'ACKNOWLEDGED';
                const isBusy = ackInProgress === m.id;

                return (
                  <div key={m.id || i} className="bg-[#0B1220] border border-[#1E3A5F] p-3 rounded text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{m.subject}</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">
                          {m.priority || 'HIGH'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                          isAcked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>
                        Recipient: <b className="text-[#23B9D6]">{m.recipient_agency}</b> ({m.recipient_phone || '112'})
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {m.sent_at ? new Date(m.sent_at).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>

                    <p className="text-slate-200 text-[11px] bg-[#131F31] p-2 rounded border border-[#1E3A5F] font-mono whitespace-pre-wrap">
                      {m.body}
                    </p>

                    {!isAcked && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleAcknowledge(m.id)}
                          disabled={isBusy}
                          className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 px-2.5 py-1 rounded text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isBusy ? 'Acknowledging...' : 'Acknowledge Receipt'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs space-y-2">
                <Radio className="w-8 h-8 text-slate-600" />
                <span>No automated broadcast logs yet. Use controls above to dispatch an alert.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-panel w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white text-sm">Emergency Broadcast Order</h3>
              </div>
              <button onClick={() => setIsBroadcastOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Broadcast Subject:</label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded p-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Directive Content:</label>
                <textarea
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded p-2 text-white font-mono text-xs"
                />
              </div>

              <div className="bg-[#131F31] p-2.5 rounded border border-[#1E3A5F] text-[11px] text-amber-300">
                ⚠️ This will simultaneously notify ERSS-112, 108 Ambulance, 101 Fire, and Police Command.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E3A5F]">
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-[#1A2940]"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={sending}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Transmitting...' : 'Transmit National Broadcast'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {isSendMsgOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-panel w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Send Direct Inter-Agency Order</h3>
              </div>
              <button onClick={() => setIsSendMsgOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Target Agency:</label>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded p-2 text-white text-xs"
                >
                  {displayContacts.map((c) => (
                    <option key={c.agency} value={c.agency}>
                      {c.name} ({c.agency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Subject:</label>
                <input
                  type="text"
                  value={directSubject}
                  onChange={(e) => setDirectSubject(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded p-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Directive Message:</label>
                <textarea
                  rows={3}
                  value={directBody}
                  onChange={(e) => setDirectBody(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded p-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E3A5F]">
              <button
                onClick={() => setIsSendMsgOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-[#1A2940]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDirect}
                disabled={sending}
                className="bg-[#23B9D6] hover:bg-[#1fa1bb] text-black font-bold px-4 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending...' : 'Transmit Agency Order'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
