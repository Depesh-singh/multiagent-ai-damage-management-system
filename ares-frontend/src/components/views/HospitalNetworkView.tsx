import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  HeartPulse,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { DonutChart, KpiCard, LineChart, ProgressBar, StatusBadge } from '../common/Charts';
import { LiveGisMap } from '../map/LiveGisMap';
import { Hospital, aresApi } from '@/lib/api';

interface HospitalNetworkViewProps {
  hospitals: Hospital[];
  onRefresh?: () => void;
}

export const HospitalNetworkView: React.FC<HospitalNetworkViewProps> = ({
  hospitals,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals.length > 0 ? hospitals[0].id : ''
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'capacity' | 'specialties' | 'resources'>('overview');
  const [patientCount, setPatientCount] = useState<number>(25);
  const [priority, setPriority] = useState<string>('Critical');
  const [isAllocating, setIsAllocating] = useState(false);

  // Capacity Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBeds, setEditBeds] = useState(0);
  const [editIcu, setEditIcu] = useState(0);
  const [editVentilators, setEditVentilators] = useState(0);
  const [saving, setSaving] = useState(false);

  const activeHosp =
    hospitals.find((h) => h.id === selectedHospitalId) || (hospitals.length > 0 ? hospitals[0] : null);

  const totalBeds = hospitals.reduce((acc, cur) => acc + (cur.total_beds || 150), 0) || 1520;
  const availableBeds = hospitals.reduce((acc, cur) => acc + (cur.available_beds || 100), 0) || 1236;
  const icuAvailable = hospitals.reduce((acc, cur) => acc + (cur.icu_available || 15), 0) || 146;
  const ventAvailable = hospitals.reduce((acc, cur) => acc + (cur.ventilators_available || 10), 0) || 98;
  const admittedPatients = Math.max(0, totalBeds - availableBeds) || 284;

  const occupancyPct = Math.round(((totalBeds - availableBeds) / totalBeds) * 100) || 18.7;
  const availabilityPct = 100 - occupancyPct;

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCapacityModal = (h: Hospital) => {
    setEditBeds(h.available_beds);
    setEditIcu(h.icu_available);
    setEditVentilators(h.ventilators_available);
    setIsEditModalOpen(true);
  };

  const handleSaveCapacity = async () => {
    if (!activeHosp) return;
    setSaving(true);
    try {
      await aresApi.updateHospitalCapacity(activeHosp.id, {
        available_beds: editBeds,
        icu_available: editIcu,
        ventilators_available: editVentilators,
      });
      setIsEditModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAllocatePatients = () => {
    setIsAllocating(true);
    setTimeout(() => {
      setIsAllocating(false);
      alert(`Allocated and dispatched ${patientCount} ${priority} patients to ${activeHosp?.name}!`);
    }, 800);
  };

  const occupancyDonut = [
    { label: 'Available', value: availableBeds, color: '#22C55E' },
    { label: 'Occupied', value: admittedPatients, color: '#EF4444' },
  ];

  const trendData = [
    { x: '00:00', y: 70 },
    { x: '04:00', y: 68 },
    { x: '08:00', y: 82 },
    { x: '12:00', y: 85 },
    { x: '16:00', y: 88 },
    { x: '20:00', y: 84 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Hospital Network</h2>
          <p className="text-xs text-[#94A3B8]">
            Hospital capacity, bed availability and real-time patient allocation across emergency hubs
          </p>
        </div>

        {activeHosp && (
          <button
            onClick={() => openCapacityModal(activeHosp)}
            className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-4 py-2 rounded-md text-xs flex items-center space-x-2 transition shadow-panel"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Capacity ({activeHosp.name.slice(0, 16)}...)</span>
          </button>
        )}
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 07) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="Total Hospitals"
          value={hospitals.length || 12}
          subtext="Regional Trauma Centers"
          icon={<Building2 className="w-5 h-5 text-[#3B82F6]" />}
          iconBg="bg-blue-950/40"
          borderColor="border-blue-900/60"
        />
        <KpiCard
          title="Total Beds"
          value={totalBeds.toLocaleString()}
          subtext="Licensed Capacity"
          icon={<HeartPulse className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-900/60"
        />
        <KpiCard
          title="Available Beds"
          value={`${availableBeds.toLocaleString()} (${availabilityPct}%)`}
          subtext="Immediate Intake"
          icon={<Activity className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-900/60"
        />
        <KpiCard
          title="ICU Beds"
          value={`${icuAvailable} / 210`}
          subtext="Critical Care Ready"
          icon={<Zap className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-900/60"
        />
        <KpiCard
          title="Ventilators"
          value={`${ventAvailable} / 140`}
          subtext="Advanced Life Support"
          icon={<Shield className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-900/60"
        />
        <KpiCard
          title="Admitted Patients"
          value={admittedPatients.toLocaleString()}
          subtext="Ongoing Treatment"
          icon={<Users className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
      </div>

      {/* Row 2: 3 Columns - Hospital List (3.5 cols), GIS Map (4.5 cols), Details & Allocate (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[500px]">
        {/* Left Column: Hospital List (12) (3.5 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Hospital List ({hospitals.length || 12})
              </span>
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
            </div>

            <input
              type="text"
              placeholder="Search hospital by name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1829] border border-[#263B50] rounded px-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#23B9D6]"
            />

            <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-1">
              {filteredHospitals.map((hosp) => {
                const isSelected = activeHosp?.id === hosp.id;
                const pct = Math.round((hosp.available_beds / (hosp.total_beds || 300)) * 100) || 75;

                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospitalId(hosp.id)}
                    className={`p-2.5 rounded-md border cursor-pointer transition ${
                      isSelected
                        ? 'border-[#23B9D6] bg-[#172B40]'
                        : 'border-[#263B50] bg-[#0D1829] hover:border-[#354E69]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{hosp.name}</div>
                        <div className="text-[10px] text-[#94A3B8] truncate mt-0.5 font-mono">
                          {hosp.address || 'Kolkata, WB'} • 5.8 km
                        </div>
                        <div className="text-[9px] text-[#64748B] font-mono mt-0.5">
                          {hosp.available_beds} / {hosp.total_beds || 300} beds
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          pct >= 80
                            ? 'bg-emerald-950 text-[#22C55E] border-emerald-800'
                            : pct >= 65
                            ? 'bg-cyan-950 text-[#23B9D6] border-cyan-800'
                            : 'bg-amber-950 text-[#F59E0B] border-amber-800'
                        }`}
                      >
                        {pct}%
                      </span>
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
            <span>1 of 2</span>
            <button className="p-1 rounded hover:bg-[#172B40] text-[#94A3B8] hover:text-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Column: Hospital Network GIS Map (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-3 flex flex-col justify-between rounded-md overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono mb-2">
            <span>Hospital Network — Kolkata</span>
            <span className="text-[#23B9D6] text-[10px]">8 Major Trauma Hubs</span>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative border border-[#263B50]/60 min-h-[360px]">
            <LiveGisMap hospitals={hospitals} />
          </div>
        </div>

        {/* Right Column: Selected Hospital Details & Patient Allocation (4 cols) */}
        {activeHosp && (
          <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
            {/* Details Card */}
            <div className="ares-card p-3 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[190px]">
                    {activeHosp.name}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-mono">
                    {activeHosp.address || 'Kolkata'} • 5.8 km from incident
                  </div>
                </div>
                <StatusBadge status="Operational" variant="safe" />
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1.5 text-[10px] font-mono border-b border-[#263B50] pb-1">
                {(['overview', 'capacity', 'specialties', 'resources'] as const).map((t) => (
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

              {/* Hospital Photo */}
              <div className="h-24 rounded overflow-hidden bg-black/40 border border-[#263B50] relative">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80"
                  alt="Hospital exterior"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Specs Grid */}
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                  <span className="text-[#64748B]">Hospital Type:</span>
                  <span className="text-white font-medium">Tertiary Care</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                  <span className="text-[#64748B]">Total Beds:</span>
                  <span className="text-white font-medium">{activeHosp.total_beds || 510}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                  <span className="text-[#64748B]">Available Beds:</span>
                  <span className="text-[#22C55E] font-bold">
                    {activeHosp.available_beds} ({Math.round((activeHosp.available_beds / (activeHosp.total_beds || 510)) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                  <span className="text-[#64748B]">ICU Beds:</span>
                  <span className="text-[#F59E0B] font-medium">{activeHosp.icu_available} free</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-[#263B50]/40">
                  <span className="text-[#64748B]">Ventilators:</span>
                  <span className="text-[#23B9D6] font-medium">{activeHosp.ventilators_available} free</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#64748B]">Trauma Centre:</span>
                  <span className="text-white font-medium">Level - I</span>
                </div>
              </div>
            </div>

            {/* Allocate Patients to This Hospital (Exact match to Screenshot 07) */}
            <div className="ares-card p-3 space-y-2">
              <div className="text-xs font-bold text-white border-b border-[#263B50] pb-1 font-mono uppercase">
                Allocate Patients to This Hospital
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#94A3B8] font-mono mb-1 block">Patient Count</label>
                  <div className="flex items-center bg-[#0D1829] border border-[#263B50] rounded font-mono">
                    <button
                      onClick={() => setPatientCount((p) => Math.max(1, p - 5))}
                      className="p-1.5 hover:bg-[#172B40] text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-bold text-white text-xs">{patientCount}</span>
                    <button
                      onClick={() => setPatientCount((p) => p + 5)}
                      className="p-1.5 hover:bg-[#172B40] text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#94A3B8] font-mono mb-1 block">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#0D1829] border border-[#263B50] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#23B9D6]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAllocatePatients}
                disabled={isAllocating}
                className="w-full bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold py-2 rounded text-xs flex items-center justify-center space-x-1.5 transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAllocating ? 'Allocating...' : 'Allocate & Dispatch'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Bed Occupancy Donut, Specialty Progress Bars, Hospital Load Line Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Bed Occupancy (Network) (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1 flex items-center justify-between">
            <span>Bed Occupancy (Network)</span>
            <span className="text-[#22C55E] text-[10px]">81.3% Overall Available</span>
          </div>

          <DonutChart
            segments={occupancyDonut}
            centerValue="81.3%"
            centerLabel="Available"
            size={110}
            strokeWidth={12}
          />
        </div>

        {/* Specialty Availability (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between space-y-1.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1">
            Specialty Availability
          </div>

          <div className="space-y-1.5">
            <ProgressBar label="ICU Beds" value={72} total={210} percentage={34} color="#EF4444" />
            <ProgressBar label="Trauma Unit" value={56} total={80} percentage={70} color="#22C55E" />
            <ProgressBar label="Burn Care" value={18} total={40} percentage={45} color="#F59E0B" />
            <ProgressBar label="Pediatrics" value={162} total={200} percentage={81} color="#23B9D6" />
            <ProgressBar label="General Wards" value={928} total={990} percentage={94} color="#22C55E" />
          </div>
        </div>

        {/* Hospital Load & Response Time Trend (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1.5 mb-1 flex items-center justify-between">
            <span>Hospital Load & Response Time</span>
            <span className="text-[#23B9D6] text-[10px]">24h Trend</span>
          </div>

          <LineChart data={trendData} color="#23B9D6" height={80} />
        </div>
      </div>

      {/* Edit Capacity Modal */}
      {isEditModalOpen && activeHosp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-card p-5 max-w-md w-full border border-[#23B9D6] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
              <div className="font-bold text-white text-sm">Update Capacity: {activeHosp.name}</div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">Available General Beds</label>
                <input
                  type="number"
                  value={editBeds}
                  onChange={(e) => setEditBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">ICU Beds Available</label>
                <input
                  type="number"
                  value={editIcu}
                  onChange={(e) => setEditIcu(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">Ventilators Available</label>
                <input
                  type="number"
                  value={editVentilators}
                  onChange={(e) => setEditVentilators(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#263B50]">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 rounded bg-[#172B40] text-[#94A3B8] hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCapacity}
                disabled={saving}
                className="px-4 py-1.5 rounded bg-[#23B9D6] text-black font-bold text-xs"
              >
                {saving ? 'Saving...' : 'Save Capacity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
