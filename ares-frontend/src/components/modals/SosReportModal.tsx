import React, { useState } from 'react';
import { AlertTriangle, Send, X } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const SosReportModal: React.FC<SosModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    disaster_type: 'EARTHQUAKE',
    location_lat: 22.5535,
    location_lng: 88.3540,
    address: 'Park Street & Camac Street Crossing, Kolkata',
    casualty_estimate: 15,
    description: 'Structural building facade collapse with multiple people trapped in ground floor debris.',
    reporter_name: 'Ananya Sen',
    reporter_phone: '+91-98300-44556',
    source: 'CITIZEN_SOS',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131F31] border border-[#1E3A5F] w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0B1220]/60">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>SUBMIT EMERGENCY DISASTER SOS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Disaster Classification</label>
            <select
              value={formData.disaster_type}
              onChange={(e) => setFormData({ ...formData, disaster_type: e.target.value })}
              className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white focus:outline-none focus:border-[#23B9D6]"
            >
              <option value="EARTHQUAKE">EARTHQUAKE (Building Collapse & Structural Damage)</option>
              <option value="FIRE">FIRE (Thermal & Smoke Inhalation)</option>
              <option value="FLOOD">FLOOD (Water Logging & Inundation)</option>
              <option value="ACCIDENT">ACCIDENT (Mass Transport Collision)</option>
              <option value="CYCLONE">CYCLONE (Severe Storm Surge)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.location_lat}
                onChange={(e) => setFormData({ ...formData, location_lat: parseFloat(e.target.value) })}
                className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.location_lng}
                onChange={(e) => setFormData({ ...formData, location_lng: parseFloat(e.target.value) })}
                className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Incident Address / Landmark</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Estimated Casualties</label>
              <input
                type="number"
                min="1"
                value={formData.casualty_estimate}
                onChange={(e) => setFormData({ ...formData, casualty_estimate: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Reporting Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white"
              >
                <option value="CITIZEN_SOS">CITIZEN SOS</option>
                <option value="ERSS_112">ERSS 112 DISPATCH</option>
                <option value="POLICE_PATROL">POLICE PATROL</option>
                <option value="FIRE_SERVICES">FIRE BRIGADE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Situation Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 font-semibold text-white flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting SOS...' : 'Transmit SOS Signal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
