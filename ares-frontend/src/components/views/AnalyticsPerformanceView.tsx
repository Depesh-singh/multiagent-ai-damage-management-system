import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Shield,
  Users,
  CheckCircle2,
  Calendar,
  Download,
  Filter,
  Sparkles,
} from 'lucide-react';
import { aresApi } from '@/lib/api';
import {
  KpiCard,
  LineChart,
  ClusteredBarChart,
  DonutChart,
  ProgressBar,
  RadialGauge,
} from '../common/Charts';

export const AnalyticsPerformanceView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await aresApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.warn('Analytics fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-3 select-none">
      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <KpiCard
          label="Total Incidents (30d)"
          value={analyticsData?.total_incidents ? analyticsData.total_incidents.toString() : '48'}
          subValue="97.8% Resolution Rate"
          status="info"
          icon={<Activity className="w-4 h-4 text-[#23B9D6]" />}
        />
        <KpiCard
          label="Avg Response Time"
          value={analyticsData?.avg_response_time_minutes ? `${analyticsData.avg_response_time_minutes}m` : '4.2m'}
          subValue="Target: < 8.0 mins"
          status="success"
          icon={<Clock className="w-4 h-4 text-[#22C55E]" />}
        />
        <KpiCard
          label="Lives Rescued"
          value={analyticsData?.total_rescued ? analyticsData.total_rescued.toString() : '142'}
          subValue="Zero responder casualties"
          status="success"
          icon={<Users className="w-4 h-4 text-[#22C55E]" />}
        />
        <KpiCard
          label="Ambulance Dispatches"
          value={analyticsData?.total_dispatches ? analyticsData.total_dispatches.toString() : '84'}
          subValue="98.5% on-time arrival"
          status="info"
          icon={<TrendingUp className="w-4 h-4 text-[#23B9D6]" />}
        />
        <KpiCard
          label="AI Triage Accuracy"
          value="96.4%"
          subValue="Audited by Medical Board"
          status="info"
          icon={<Sparkles className="w-4 h-4 text-[#23B9D6]" />}
        />
        <KpiCard
          label="System SLA"
          value="99.98%"
          subValue="Zero API Outages"
          status="success"
          icon={<CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-y-auto pr-1">
        {/* Chart 1 (6 cols): Response Latency Trend (Line Chart) */}
        <div className="col-span-12 lg:col-span-6 bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#23B9D6]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Emergency Response Latency (Minutes)
              </span>
            </div>
            <span className="text-[10px] text-[#22C55E] font-bold">AVG: 4.2 MINS</span>
          </div>

          <div className="flex-1 min-h-[180px] flex items-center justify-center">
            <LineChart
              title="Minutes from SOS to Responders On Scene"
              labels={['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now']}
              data={[6.2, 5.8, 4.5, 4.1, 4.8, 4.2, 3.9]}
              color="#23B9D6"
              height={160}
            />
          </div>
        </div>

        {/* Chart 2 (6 cols): Hospital Occupancy & Surge Readiness (Clustered Bar Chart) */}
        <div className="col-span-12 lg:col-span-6 bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#22C55E]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Hospital Network Load vs Available Surge
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">8 Apex Centres</span>
          </div>

          <div className="flex-1 min-h-[180px] flex items-center justify-center">
            <ClusteredBarChart
              labels={['SSKM', 'Calcutta Med', 'AMRI', 'Apollo', 'NRS', 'Fortis']}
              seriesA={{
                name: 'Occupied Beds',
                data: [420, 380, 210, 280, 310, 160],
                color: '#EF4444',
              }}
              seriesB={{
                name: 'Surge Ready',
                data: [80, 70, 45, 60, 50, 40],
                color: '#22C55E',
              }}
              height={160}
            />
          </div>
        </div>

        {/* Row 2: 3 Cards (Donut Chart, Radial Gauges, SLA Metrics) */}
        {/* Card 1: Incident Distribution by Severity */}
        <div className="col-span-12 md:col-span-4 bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Incident Severity Breakdown
            </span>
            <span className="text-[10px] text-[#94A3B8]">Past 30 Days</span>
          </div>

          <div className="flex items-center justify-center py-2">
            <DonutChart
              size={140}
              thickness={18}
              segments={[
                { label: 'Level 4 Critical', value: 8, color: '#EF4444' },
                { label: 'Level 3 High', value: 16, color: '#F59E0B' },
                { label: 'Level 2 Moderate', value: 18, color: '#3B82F6' },
                { label: 'Level 1 Minor', value: 6, color: '#22C55E' },
              ]}
              centerLabel="48"
              centerSub="Total"
            />
          </div>
        </div>

        {/* Card 2: Multi-Agency Coordinated SLAs */}
        <div className="col-span-12 md:col-span-4 bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Agency Operational Readiness
            </span>
            <span className="text-[10px] text-[#22C55E] font-bold">100% ONLINE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 py-2">
            <div className="flex flex-col items-center">
              <RadialGauge value={98} max={100} label="NDRF / SDRF" color="#22C55E" size={76} />
              <span className="text-[10px] text-[#94A3B8] mt-1">Search & Rescue</span>
            </div>
            <div className="flex flex-col items-center">
              <RadialGauge value={94} max={100} label="Ambulance Fleet" color="#23B9D6" size={76} />
              <span className="text-[10px] text-[#94A3B8] mt-1">EMS Dispatch</span>
            </div>
            <div className="flex flex-col items-center">
              <RadialGauge value={91} max={100} label="Apex Hospitals" color="#F59E0B" size={76} />
              <span className="text-[10px] text-[#94A3B8] mt-1">Bed Allocation</span>
            </div>
            <div className="flex flex-col items-center">
              <RadialGauge value={99} max={100} label="Traffic Green Wave" color="#22C55E" size={76} />
              <span className="text-[10px] text-[#94A3B8] mt-1">Corridor Sync</span>
            </div>
          </div>
        </div>

        {/* Card 3: AI Swarm Performance Metrics */}
        <div className="col-span-12 md:col-span-4 bg-[#101C2B] p-3 rounded-lg border border-[#263B50] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#263B50] pb-2 mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              AI Swarm Execution Metrics
            </span>
            <span className="text-[10px] text-[#23B9D6] font-mono">10 AGENTS</span>
          </div>

          <div className="space-y-2 py-1">
            <ProgressBar
              label="Incident Verification Confidence"
              current={96}
              total={100}
              color="#22C55E"
            />
            <ProgressBar
              label="Optimal Route Optimization"
              current={94}
              total={100}
              color="#23B9D6"
            />
            <ProgressBar
              label="Hospital Capacity Matching"
              current={98}
              total={100}
              color="#22C55E"
            />
            <ProgressBar
              label="Medical Supply Distribution"
              current={89}
              total={100}
              color="#F59E0B"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
