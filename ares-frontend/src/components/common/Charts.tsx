import React from 'react';

// ==========================================
// 1. KPI CARD
// ==========================================
export interface KpiCardProps {
  title?: string;
  label?: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  subtext?: string;
  subValue?: string;
  status?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  borderColor?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  label,
  value,
  change,
  changeType = 'increase',
  subtext,
  subValue,
  status,
  icon,
  iconBg = 'bg-[#172B40]',
  borderColor = 'border-[#263B50]',
  onClick,
}) => {
  const displayTitle = title || label || '';
  const displaySub = subtext || subValue || status || '';

  return (
    <div
      onClick={onClick}
      className={`ares-card p-4 flex items-center justify-between border ${borderColor} transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:border-[#354E69]' : ''
      }`}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase truncate">
          {displayTitle}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl lg:text-3xl font-extrabold font-mono text-white tracking-tight">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs font-mono font-semibold flex items-center ${
                changeType === 'increase'
                  ? 'text-[#22C55E]'
                  : changeType === 'decrease'
                  ? 'text-[#EF4444]'
                  : 'text-[#94A3B8]'
              }`}
            >
              {change}
            </span>
          )}
        </div>
        {displaySub && (
          <div className="text-[11px] text-[#94A3B8] truncate font-mono">
            {displaySub}
          </div>
        )}
      </div>

      {icon && (
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border border-[#263B50]/60 ${iconBg}`}
        >
          {icon}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. DONUT CHART (SVG)
// ==========================================
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  centerValue?: string | number;
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  centerValue,
  centerLabel,
  size = 140,
  strokeWidth = 18,
  showLegend = true,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Base background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#172B40"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (seg.value / total) * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        {(centerValue !== undefined || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            {centerValue !== undefined && (
              <span className="text-lg font-bold font-mono text-white leading-tight">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex-1 space-y-1.5 text-xs w-full">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                <span className="text-[#94A3B8] text-[11px] truncate">{seg.label}</span>
              </div>
              <span className="font-mono font-bold text-white text-[11px]">
                {seg.value} ({Math.round((seg.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. RADIAL GAUGE (Circular Progress Gauge)
// ==========================================
export interface RadialGaugeProps {
  percentage: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  percentage,
  label,
  sublabel,
  size = 90,
  strokeWidth = 10,
  color = '#23B9D6',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = isNaN(clamped) ? circumference : circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#172B40"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isNaN(strokeDashoffset) ? 0 : strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-white">
          {Math.round(clamped)}%
        </div>
      </div>
      <div className="mt-1.5 text-[11px] font-bold text-white">{label}</div>
      {sublabel && <div className="text-[10px] text-[#94A3B8] font-mono">{sublabel}</div>}
    </div>
  );
};

// ==========================================
// 4. SMOOTH SVG LINE CHART
// ==========================================
export interface LineChartPoint {
  x: string;
  y: number;
}

export interface LineChartProps {
  data: (LineChartPoint | number)[];
  labels?: string[];
  title?: string;
  color?: string;
  height?: number;
  showPoints?: boolean;
  valueSuffix?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  color = '#23B9D6',
  height = 100,
  showPoints = true,
  valueSuffix = '',
}) => {
  if (!data || data.length === 0) return null;

  const normalizedPoints: LineChartPoint[] = data.map((d, i) => {
    if (typeof d === 'number') {
      return { x: labels?.[i] || `${i}`, y: isNaN(d) ? 0 : d };
    }
    const safeY = typeof d?.y === 'number' && !isNaN(d.y) ? d.y : 0;
    return { x: d?.x || labels?.[i] || `${i}`, y: safeY };
  });

  const maxY = Math.max(...normalizedPoints.map((d) => d.y), 1);
  const minY = Math.min(...normalizedPoints.map((d) => d.y), 0);
  const range = maxY - minY || 1;

  const width = 400; // virtual SVG width
  const paddingX = 25;
  const paddingY = 15;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = normalizedPoints.map((d, i) => {
    const x = paddingX + (i / Math.max(1, normalizedPoints.length - 1)) * usableWidth;
    const y = height - paddingY - ((d.y - minY) / range) * usableHeight;
    return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y, raw: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const lastPt = points[points.length - 1] || { x: width - paddingX, y: height - paddingY };
  const firstPt = points[0] || { x: paddingX, y: height - paddingY };
  const areaD = `${pathD} L ${lastPt.x} ${height - paddingY} L ${firstPt.x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill={`url(#gradient-${color})`} />

          {/* Stroke path */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {showPoints &&
            points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="#080F1B"
                stroke={color}
                strokeWidth="2"
              />
            ))}
        </svg>
      </div>

      {/* X-Axis labels */}
      <div className="flex justify-between items-center text-[9px] font-mono text-[#64748B] mt-1.5 px-2">
        {normalizedPoints.map((d, i) => (
          <span key={i}>{d.x}</span>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 5. CLUSTERED BAR CHART (SVG)
// ==========================================
export interface BarGroup {
  label: string;
  valA: number; // e.g. In Stock
  valB: number; // e.g. Requested
}

export interface ClusteredBarChartProps {
  groups?: BarGroup[];
  labels?: string[];
  seriesA?: { name?: string; data: number[]; color?: string };
  seriesB?: { name?: string; data: number[]; color?: string };
  labelA?: string;
  labelB?: string;
  colorA?: string;
  colorB?: string;
  height?: number;
}

export const ClusteredBarChart: React.FC<ClusteredBarChartProps> = ({
  groups,
  labels,
  seriesA,
  seriesB,
  labelA = 'In Stock',
  labelB = 'Requested',
  colorA = '#23B9D6',
  colorB = '#3B82F6',
  height = 140,
}) => {
  const resolvedGroups: BarGroup[] =
    groups && groups.length > 0
      ? groups
      : (labels || []).map((l, i) => ({
          label: l,
          valA: seriesA?.data?.[i] ?? 0,
          valB: seriesB?.data?.[i] ?? 0,
        }));

  const actualColorA = seriesA?.color || colorA;
  const actualColorB = seriesB?.color || colorB;
  const actualLabelA = seriesA?.name || labelA;
  const actualLabelB = seriesB?.name || labelB;

  const maxVal = Math.max(
    ...resolvedGroups.map((g) => Math.max(g.valA || 0, g.valB || 0)),
    10
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end space-x-4 text-[10px]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: actualColorA }}></span>
          <span className="text-[#94A3B8]">{actualLabelA}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: actualColorB }}></span>
          <span className="text-[#94A3B8]">{actualLabelB}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 pt-2 border-b border-[#263B50]" style={{ height }}>
        {resolvedGroups.map((g, i) => {
          const hA = ((g.valA || 0) / maxVal) * (height - 25);
          const hB = ((g.valB || 0) / maxVal) * (height - 25);

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div className="flex items-end gap-1 w-full justify-center">
                <div
                  className="w-3 sm:w-4 rounded-t transition-all duration-500"
                  style={{ height: `${isNaN(hA) ? 0 : hA}px`, backgroundColor: actualColorA }}
                  title={`${actualLabelA}: ${g.valA}`}
                ></div>
                <div
                  className="w-3 sm:w-4 rounded-t transition-all duration-500"
                  style={{ height: `${isNaN(hB) ? 0 : hB}px`, backgroundColor: actualColorB }}
                  title={`${actualLabelB}: ${g.valB}`}
                ></div>
              </div>
              <span className="text-[9px] font-mono text-[#94A3B8] truncate max-w-[55px] text-center">
                {g.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 6. HORIZONTAL PROGRESS BAR
// ==========================================
export interface ProgressBarProps {
  label: string;
  value?: number;
  current?: number;
  total?: number;
  percentage?: number;
  color?: string;
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  current,
  total,
  percentage,
  color = '#23B9D6',
  showPercent = true,
}) => {
  const actualVal = value !== undefined ? value : (current !== undefined ? current : 0);
  const pct =
    percentage !== undefined
      ? percentage
      : total && total > 0
      ? Math.round((actualVal / total) * 100)
      : Math.min(100, actualVal);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#94A3B8] text-[11px] font-medium">{label}</span>
        <span className="font-mono text-white text-[11px] font-bold">
          {total ? `${actualVal} / ${total}` : `${actualVal}`} {showPercent && `(${pct}%)`}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#172B40] overflow-hidden border border-[#263B50]/60">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, isNaN(pct) ? 0 : pct))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 7. STATUS BADGE
// ==========================================
export interface StatusBadgeProps {
  status: string;
  variant?: 'critical' | 'warning' | 'safe' | 'info' | 'cyan' | 'neutral';
  pulse?: boolean;
  size?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  pulse = false,
}) => {
  let v = variant;
  if (!v) {
    const s = status.toUpperCase();
    if (s.includes('CRIT') || s.includes('FAIL') || s.includes('REJECT') || s.includes('EMERG')) {
      v = 'critical';
    } else if (s.includes('HIGH') || s.includes('WARN') || s.includes('PEND') || s.includes('PROGRESS')) {
      v = 'warning';
    } else if (s.includes('SAFE') || s.includes('COMPL') || s.includes('APPROV') || s.includes('ONLINE') || s.includes('RESOLV')) {
      v = 'safe';
    } else if (s.includes('INFO') || s.includes('ROUTE') || s.includes('DISPATCH')) {
      v = 'cyan';
    } else {
      v = 'neutral';
    }
  }

  const styles = {
    critical: 'bg-red-950/60 text-[#EF4444] border-red-800/80',
    warning: 'bg-amber-950/60 text-[#F59E0B] border-amber-800/80',
    safe: 'bg-emerald-950/60 text-[#22C55E] border-emerald-800/80',
    cyan: 'bg-[#23B9D6]/15 text-[#23B9D6] border-[#23B9D6]/40',
    info: 'bg-blue-950/60 text-[#3B82F6] border-blue-800/80',
    neutral: 'bg-slate-800/60 text-[#94A3B8] border-slate-700/80',
  }[v];

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border tracking-wider uppercase ${styles}`}
    >
      {pulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full inline-block ${
            v === 'critical' ? 'bg-[#EF4444] pulse-critical' : 'bg-[#23B9D6] pulse-live'
          }`}
        />
      )}
      <span>{status}</span>
    </span>
  );
};
