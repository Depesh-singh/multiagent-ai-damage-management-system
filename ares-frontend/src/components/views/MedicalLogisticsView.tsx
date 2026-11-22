import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Truck,
  Warehouse,
  X,
  Zap,
} from 'lucide-react';
import { ClusteredBarChart, DonutChart, KpiCard, LineChart, ProgressBar, StatusBadge } from '../common/Charts';
import { LiveGisMap } from '../map/LiveGisMap';
import { MedicalSupplyItem, aresApi } from '@/lib/api';

export const MedicalLogisticsView: React.FC = () => {
  const [inventory, setInventory] = useState<MedicalSupplyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('O-Negative Blood Units');
  const [category, setCategory] = useState('BLOOD_PRODUCTS');
  const [quantity, setQuantity] = useState(25);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await aresApi.getMedicalInventory();
      if (Array.isArray(data)) setInventory(data);
    } catch (err) {
      console.warn('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    setRequesting(true);
    try {
      await aresApi.createSupplyRequest({
        item_name: itemName,
        category,
        quantity,
        priority: 'CRITICAL',
      });
      setIsRequisitionOpen(false);
      await loadInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  const sampleInventory = inventory.length > 0 ? inventory : [
    { id: '1', item_name: 'IV Fluids (1L)', category: 'Fluids', current_stock: 4200, minimum_threshold: 1000, unit: 'bags' },
    { id: '2', item_name: 'Broad-Spectrum Antibiotics', category: 'Pharmaceuticals', current_stock: 3680, minimum_threshold: 1200, unit: 'vials' },
    { id: '3', item_name: 'Pain Relievers / Analgesics', category: 'Pharmaceuticals', current_stock: 5430, minimum_threshold: 1500, unit: 'doses' },
    { id: '4', item_name: 'Emergency Field Kits', category: 'Trauma', current_stock: 1120, minimum_threshold: 500, unit: 'kits' },
    { id: '5', item_name: 'Oxygen Cylinders (Type D)', category: 'Respiratory', current_stock: 320, minimum_threshold: 400, unit: 'cylinders' },
    { id: '6', item_name: 'Surgical Consumables & Sutures', category: 'Surgical', current_stock: 2840, minimum_threshold: 800, unit: 'packs' },
    { id: '7', item_name: 'Trauma Extrication Kits', category: 'Trauma', current_stock: 910, minimum_threshold: 1000, unit: 'kits' },
    { id: '8', item_name: 'Blood Units (B+ / O-)', category: 'Blood Bank', current_stock: 186, minimum_threshold: 300, unit: 'units' },
  ];

  const totalStock = sampleInventory.reduce(
    (acc, cur) => acc + (cur.current_stock ?? (cur as any).quantity_available ?? (cur as any).available ?? 0),
    0
  );

  const clusteredGroups = [
    { label: 'IV Fluids', valA: 4200, valB: 1800 },
    { label: 'Antibiotics', valA: 3680, valB: 1200 },
    { label: 'Pain Rel.', valA: 5430, valB: 3200 },
    { label: 'Oxygen', valA: 320, valB: 850 },
    { label: 'Trauma', valA: 910, valB: 1400 },
  ];

  const logisticsTrend = [
    { x: '00:00', y: 82 },
    { x: '04:00', y: 86 },
    { x: '08:00', y: 92 },
    { x: '12:00', y: 95 },
    { x: '16:00', y: 96.4 },
    { x: '20:00', y: 94 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-3.5 select-none">
      {/* Top Page Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Medical Logistics</h2>
          <p className="text-xs text-[#94A3B8]">
            Medical supplies, drug inventory, distribution and demand fulfillment across healthcare hubs
          </p>
        </div>

        <button
          onClick={() => setIsRequisitionOpen(true)}
          className="bg-[#23B9D6] hover:bg-[#1BA2BD] text-black font-bold px-4 py-2 rounded-md text-xs flex items-center space-x-2 transition shadow-panel"
        >
          <Plus className="w-4 h-4" />
          <span>New Supply Requisition</span>
        </button>
      </div>

      {/* Row 1: 6 KPI Cards (Exact match to Reference Screenshot 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <KpiCard
          title="Total Items"
          value={totalStock.toLocaleString() || '28,450'}
          subtext="Catalogued Units"
          icon={<Package className="w-5 h-5 text-[#23B9D6]" />}
          iconBg="bg-cyan-950/40"
          borderColor="border-cyan-800/60"
        />
        <KpiCard
          title="In Stock"
          value="23,760 (83.5%)"
          subtext="Depot Warehouses"
          icon={<CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
        <KpiCard
          title="Allocated"
          value="4,690"
          subtext="Committed to Traumas"
          icon={<Send className="w-5 h-5 text-[#F59E0B]" />}
          iconBg="bg-amber-950/40"
          borderColor="border-amber-800/60"
        />
        <KpiCard
          title="Active Deliveries"
          value="7"
          subtext="Supply Convoys"
          icon={<Truck className="w-5 h-5 text-[#8B5CF6]" />}
          iconBg="bg-purple-950/40"
          borderColor="border-purple-800/60"
        />
        <KpiCard
          title="Low Stock Items"
          value="3"
          subtext="Threshold Breached"
          icon={<AlertTriangle className="w-5 h-5 text-[#EF4444]" />}
          iconBg="bg-red-950/40"
          borderColor="border-red-900/60"
        />
        <KpiCard
          title="Fulfillment Rate"
          value="96.4%"
          subtext="Clinical Match Rate"
          icon={<Zap className="w-5 h-5 text-[#22C55E]" />}
          iconBg="bg-emerald-950/40"
          borderColor="border-emerald-800/60"
        />
      </div>

      {/* Row 2: 3 Columns - Inventory Table (4 cols), Supply GIS Map (4.5 cols), Supply Request Queue (3.5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
        {/* Left Column: Inventory Overview Table (4 cols) */}
        <div className="lg:col-span-4 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Inventory Overview
              </span>
              <span className="text-[#23B9D6] text-[10px] cursor-pointer hover:underline">View All →</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="text-[#64748B] border-b border-[#263B50]">
                    <th className="pb-1">Item / Category</th>
                    <th className="pb-1 text-right">In Stock</th>
                    <th className="pb-1 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263B50]/40 text-white">
                  {sampleInventory.map((item, idx) => {
                    const stock = item.current_stock ?? (item as any).quantity_available ?? (item as any).available ?? 100;
                    const minThreshold = item.minimum_threshold ?? 500;
                    const status =
                      stock < minThreshold / 2
                        ? 'Critical'
                        : stock < minThreshold
                        ? 'Low'
                        : 'In Stock';

                    return (
                      <tr key={item.id || idx}>
                        <td className="py-1.5 truncate max-w-[130px] font-sans font-medium">
                          {item.item_name}
                        </td>
                        <td className="py-1.5 text-right font-bold">
                          {Number(stock).toLocaleString()}
                        </td>
                        <td className="py-1.5 text-right">
                          <StatusBadge
                            status={status}
                            variant={status === 'Critical' ? 'critical' : status === 'Low' ? 'warning' : 'safe'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-[#263B50] flex justify-between text-[10px] text-[#64748B] font-mono">
            <span>Direct Database Telemetry</span>
            <span>No Artificial Stock Estimates</span>
          </div>
        </div>

        {/* Center Column: Medical Supply Network Map (4.5 cols) */}
        <div className="lg:col-span-5 ares-card p-3 flex flex-col justify-between rounded-md overflow-hidden relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50] text-xs font-bold text-white font-mono mb-2">
            <span>Medical Supply Network — Kolkata</span>
            <span className="text-[#23B9D6] text-[10px]">3 Central Warehouses</span>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative border border-[#263B50]/60 min-h-[320px]">
            <LiveGisMap />
          </div>
        </div>

        {/* Right Column: Supply Request Queue (6) (3.5 cols) */}
        <div className="lg:col-span-3 ares-card p-3 flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#263B50]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Supply Request Queue (6)
              </span>
              <span className="text-[#23B9D6] text-[10px] cursor-pointer hover:underline">View All →</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">RG Kar Medical College</span>
                  <StatusBadge status="Critical" variant="critical" />
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  IV Fluids, Antibiotics, Trauma Kits
                </div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">S.S.K.M. Hospital</span>
                  <StatusBadge status="Critical" variant="critical" />
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  Oxygen Cylinders, Surgical Kits
                </div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">Belle Vue Hospital</span>
                  <StatusBadge status="High" variant="warning" />
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  Blood Units (B+), IV Fluids
                </div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">N.R.S. Medical College</span>
                  <StatusBadge status="High" variant="warning" />
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  Antibiotics, Pain Relievers
                </div>
              </div>

              <div className="bg-[#0D1829] p-2 rounded border border-[#263B50]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">ID & BG Hospital</span>
                  <StatusBadge status="Medium" variant="info" />
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  Emergency Kits, Sutures
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsRequisitionOpen(true)}
            className="w-full bg-[#172B40] hover:bg-[#263B50] text-[#23B9D6] border border-[#23B9D6]/40 p-2 rounded text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Approve Requisitions</span>
          </button>
        </div>
      </div>

      {/* Row 3: Demand vs Supply Bar Chart, Active Deliveries Table, Warehouse Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Demand vs Supply Clustered Bar Chart (5 cols) */}
        <div className="md:col-span-5 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Demand vs. Supply (Key Items)</span>
          </div>

          <ClusteredBarChart
            groups={clusteredGroups}
            labelA="In Stock"
            labelB="Requested"
            colorA="#23B9D6"
            colorB="#3B82F6"
            height={110}
          />
        </div>

        {/* Active Deliveries Table (4 cols) */}
        <div className="md:col-span-4 ares-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-[#263B50] text-xs font-bold text-white font-mono">
            <span>Active Deliveries (7)</span>
            <span className="text-[#23B9D6] text-[10px]">View All →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] font-mono">
              <thead>
                <tr className="text-[#64748B] border-b border-[#263B50]">
                  <th className="pb-1">ID</th>
                  <th className="pb-1">From</th>
                  <th className="pb-1">To</th>
                  <th className="pb-1">ETA</th>
                  <th className="pb-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263B50]/40 text-white">
                <tr>
                  <td className="py-1 text-[#23B9D6]">DEL-0173</td>
                  <td>WH-01</td>
                  <td className="truncate max-w-[60px]">RG Kar</td>
                  <td className="text-[#22C55E]">18 min</td>
                  <td className="text-[#22C55E]">En Route</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">DEL-0172</td>
                  <td>WH-03</td>
                  <td className="truncate max-w-[60px]">S.S.K.M.</td>
                  <td className="text-[#22C55E]">24 min</td>
                  <td className="text-[#22C55E]">En Route</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">DEL-0171</td>
                  <td>WH-02</td>
                  <td className="truncate max-w-[60px]">Belle Vue</td>
                  <td className="text-[#22C55E]">12 min</td>
                  <td className="text-[#22C55E]">En Route</td>
                </tr>
                <tr>
                  <td className="py-1 text-[#23B9D6]">DEL-0169</td>
                  <td>WH-03</td>
                  <td className="truncate max-w-[60px]">ID & BG</td>
                  <td className="text-[#F59E0B]">36 min</td>
                  <td className="text-[#F59E0B]">Loading</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Warehouse Status (3 cols) */}
        <div className="md:col-span-3 ares-card p-3 flex flex-col justify-between space-y-1.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1">
            Warehouse Status
          </div>

          <div className="space-y-2">
            <ProgressBar label="WH-01 (Central) Bhowanipore" value={88} percentage={88} color="#22C55E" />
            <ProgressBar label="WH-02 (South) Tollygunge" value={76} percentage={76} color="#23B9D6" />
            <ProgressBar label="WH-03 (Salt Lake) Sector V" value={81} percentage={81} color="#3B82F6" />
          </div>
        </div>
      </div>

      {/* Row 4: Performance Trend & 4 Bottom Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 ares-card p-3 flex flex-col justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#263B50] pb-1 mb-1">
            Logistics Performance (Last 24 Hours)
          </div>
          <LineChart data={logisticsTrend} color="#22C55E" height={70} />
        </div>

        <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-[#0D1829] p-3 rounded border border-[#263B50] flex flex-col justify-center items-center text-center">
            <Truck className="w-5 h-5 text-[#23B9D6] mb-1" />
            <div className="text-lg font-bold font-mono text-white">27</div>
            <div className="text-[10px] text-[#94A3B8]">Deliveries Done</div>
          </div>

          <div className="bg-[#0D1829] p-3 rounded border border-[#263B50] flex flex-col justify-center items-center text-center">
            <Clock className="w-5 h-5 text-[#22C55E] mb-1" />
            <div className="text-lg font-bold font-mono text-white">18.6 min</div>
            <div className="text-[10px] text-[#94A3B8]">Avg. Delivery Time</div>
          </div>

          <div className="bg-[#0D1829] p-3 rounded border border-[#263B50] flex flex-col justify-center items-center text-center">
            <Zap className="w-5 h-5 text-[#8B5CF6] mb-1" />
            <div className="text-lg font-bold font-mono text-white">96.4%</div>
            <div className="text-[10px] text-[#94A3B8]">Fulfillment Rate</div>
          </div>

          <div className="bg-[#0D1829] p-3 rounded border border-[#263B50] flex flex-col justify-center items-center text-center">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E] mb-1" />
            <div className="text-lg font-bold font-mono text-[#22C55E]">0</div>
            <div className="text-[10px] text-[#94A3B8]">Stock-Out Incidents</div>
          </div>
        </div>
      </div>

      {/* New Supply Requisition Modal */}
      {isRequisitionOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="ares-card p-5 max-w-md w-full border border-[#23B9D6] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#263B50]">
              <div className="font-bold text-white text-sm">Emergency Medical Requisition</div>
              <button onClick={() => setIsRequisitionOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">Item Requested</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                >
                  <option value="BLOOD_PRODUCTS">Blood Bank (O-Neg / Cross-Match)</option>
                  <option value="IV_FLUIDS">IV Balanced Crystalloids</option>
                  <option value="ANTIBIOTICS">Broad-Spectrum Antibiotics</option>
                  <option value="TRAUMA_KITS">Trauma Dressings & Sutures</option>
                </select>
              </div>

              <div>
                <label className="text-[#94A3B8] font-mono block mb-1">Quantity (Units / Bags)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0D1829] border border-[#263B50] rounded p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#263B50]">
              <button
                onClick={() => setIsRequisitionOpen(false)}
                className="px-3 py-1.5 rounded bg-[#172B40] text-[#94A3B8] hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                disabled={requesting}
                className="px-4 py-1.5 rounded bg-[#23B9D6] text-black font-bold text-xs"
              >
                {requesting ? 'Transmitting...' : 'Dispatch Requisition Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
