import React, { useState } from 'react';
import { Activity, Building2, Edit3, HeartPulse, Phone, Save, ShieldCheck, X } from 'lucide-react';
import { aresApi } from '@/lib/api';

interface HospitalsViewProps {
  hospitals: any[];
  onRefresh?: () => void;
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({ hospitals, onRefresh }) => {
  const [editingHospital, setEditingHospital] = useState<any | null>(null);
  const [editBeds, setEditBeds] = useState<number>(0);
  const [editIcu, setEditIcu] = useState<number>(0);
  const [editVentilators, setEditVentilators] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const openEditModal = (h: any) => {
    setEditingHospital(h);
    setEditBeds(h.available_beds || 0);
    setEditIcu(h.icu_available || 0);
    setEditVentilators(h.ventilators_available || 0);
  };

  const handleSaveCapacity = async () => {
    if (!editingHospital) return;
    setSaving(true);
    try {
      await aresApi.updateHospitalCapacity(editingHospital.id, {
        available_beds: editBeds,
        icu_available: editIcu,
        ventilators_available: editVentilators,
      });
      setEditingHospital(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update capacity:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Top Header */}
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              REGIONAL HOSPITAL NETWORK & CRITICAL CARE INVENTORY
            </h1>
            <p className="text-xs text-slate-400">
              Trauma Centers • Available Beds • ICU Readiness • Ventilator & Oxygen Telemetry
            </p>
          </div>
        </div>

        <span className="text-xs bg-[#1A2940] border border-[#1E3A5F] px-3 py-1.5 rounded text-emerald-400 font-mono">
          {hospitals.length} Network Facilities Active
        </span>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-1">
        {hospitals.map((h, i) => (
          <div key={h.id || i} className="ares-panel p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">{h.name}</h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">{h.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                    ACTIVE RECEIVING
                  </span>
                  <button
                    onClick={() => openEditModal(h)}
                    title="Update Bed & ICU Capacity"
                    className="p-1 bg-[#1A2940] hover:bg-[#2A4A6B] text-cyan-400 rounded border border-[#1E3A5F] transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-[#0B1220] p-2.5 rounded border border-[#1E3A5F] text-xs text-center mt-3">
                <div>
                  <div className="text-slate-400 text-[10px]">Total Beds</div>
                  <div className="text-white font-mono font-bold mt-0.5">{h.total_beds || 1200}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Available</div>
                  <div className="text-emerald-400 font-mono font-bold mt-0.5">{h.available_beds ?? 180}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">ICU Ready</div>
                  <div className="text-cyan-400 font-mono font-bold mt-0.5">{h.icu_available ?? 16}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Ventilators</div>
                  <div className="text-slate-200 font-mono font-bold mt-0.5">{h.ventilators_available ?? 8}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1E3A5F]">
              <div className="flex flex-wrap gap-1">
                {(h.specialties || ['Trauma', 'Surgery', 'Burns']).slice(0, 3).map((spec: string, idx: number) => (
                  <span key={idx} className="bg-[#1A2940] text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                    {spec}
                  </span>
                ))}
              </div>
              <div className="text-slate-400 text-[11px] flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#23B9D6]" />
                <span className="font-mono">{h.phone || '+91-33-2223-1000'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Capacity Modal */}
      {editingHospital && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-panel w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Update Capacity — {editingHospital.name}</h3>
              </div>
              <button
                onClick={() => setEditingHospital(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">General Available Beds:</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={editBeds}
                  onChange={(e) => setEditBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">ICU Beds Ready:</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={editIcu}
                  onChange={(e) => setEditIcu(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Operational Ventilators:</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={editVentilators}
                  onChange={(e) => setEditVentilators(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1E3A5F]">
              <button
                onClick={() => setEditingHospital(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-[#1A2940]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCapacity}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center space-x-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Update Telemetry'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
