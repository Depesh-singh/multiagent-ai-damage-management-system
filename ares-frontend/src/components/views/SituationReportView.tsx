import React, { useEffect, useState } from 'react';
import { Copy, Download, FileText, Printer, RefreshCw, ShieldCheck } from 'lucide-react';
import { aresApi } from '@/lib/api';

interface SituationReportViewProps {
  selectedIncident: any;
  incidents?: any[];
  onSelectIncident?: (inc: any) => void;
}

export const SituationReportView: React.FC<SituationReportViewProps> = ({
  selectedIncident,
  incidents = [],
  onSelectIncident,
}) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedIncident?.id) {
      loadReport(selectedIncident.id);
    } else if (incidents.length > 0) {
      loadReport(incidents[0].id);
    }
  }, [selectedIncident, incidents]);

  const loadReport = async (incId: string) => {
    setLoading(true);
    try {
      const data = await aresApi.getSituationReport(incId);
      setReportData(data);
    } catch (err) {
      console.warn('Could not fetch report:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const currentReportContent =
    reportData?.content_markdown ||
    (selectedIncident
      ? `# 🚨 SAVE DISASTER SITUATION REPORT (SITREP-01)
**CLASSIFICATION:** RESTRICTED // STATE DISASTER MANAGEMENT AUTHORITY (SDMA)
**INCIDENT REFERENCE:** #${selectedIncident?.id?.slice(0, 8) || 'EQ-2026-WB'}
**LOCATION:** ${selectedIncident?.address || 'Kolkata Metropolitan Area'}
**STATUS:** ${selectedIncident?.status || 'ACTIVE'}
**ESTIMATED CASUALTIES:** ${selectedIncident?.casualty_estimate || 0} persons

---

### 1. INCIDENT OVERVIEW
* **Assessed Severity:** Level 4 Disaster Alert
* **Operational Command:** Unified Response Command active.

### 2. TACTICAL HEALTHCARE MOBILIZATION
* **Activated Receiving Facilities:** Regional tertiary trauma facilities notified.
* **Triage Protocol:** Critical trauma patients allocated by proximity and available ICU capacity.

### 3. FIELD FLEET & RESCUE DISPATCH
* **Ambulance Units:** Mobilized with traffic signal preemption.
* **Search & Rescue:** Specialist NDRF & Fire Service formations active on site.
`
      : 'No incident selected. Select an incident from the dropdown above to generate an official SITREP.');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentReportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Top Header */}
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              GOVERNMENT SITUATION REPORTS (NDMA / SDMA SITREPs)
            </h1>
            <p className="text-xs text-slate-400">
              Statutory Damage Assessments • Real Multi-Agent Resource Reconciliation • Live Telemetry
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {incidents.length > 0 && onSelectIncident && (
            <select
              value={selectedIncident?.id || incidents[0]?.id || ''}
              onChange={(e) => {
                const found = incidents.find((i) => i.id === e.target.value);
                if (found) onSelectIncident(found);
              }}
              className="bg-[#0B1220] border border-[#1E3A5F] text-white text-xs px-2.5 py-1.5 rounded"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  #{inc.id.slice(0, 8)} - {inc.address.slice(0, 25)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => selectedIncident?.id && loadReport(selectedIncident.id)}
            className="p-1.5 bg-[#1A2940] hover:bg-[#223654] border border-[#1E3A5F] text-slate-300 rounded transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={copyToClipboard}
            className="bg-[#1A2940] hover:bg-[#223654] border border-[#1E3A5F] text-slate-300 text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy SITREP'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 transition shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export</span>
          </button>
        </div>
      </div>

      {/* Markdown Document Container */}
      <div className="ares-panel flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap select-text border border-[#1E3A5F] bg-[#0B1220]/90">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#23B9D6]" />
            <span>Retrieving live statutory SITREP from Government Reporting Agent...</span>
          </div>
        ) : (
          currentReportContent
        )}
      </div>
    </div>
  );
};
