"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import { HourlyReading, DeviceDailyStat } from "@/types/dashboard";
import { Loader2, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  stats: DeviceDailyStat[];
  hourly: HourlyReading[];
  isLoading?: boolean;
}

const DEVICE_ORDER = ["BATTERY", "PDB", "UPS"] as const;

const DEVICE_META: Record<string, { color: string; gradient: string; icon: string }> = {
  BATTERY: {
    color: "#3b82f6",
    gradient: "from-blue-500/10 to-blue-500/0",
    icon: "🔋",
  },
  PDB: {
    color: "#ef4444",
    gradient: "from-red-500/10 to-red-500/0",
    icon: "⚡",
  },
  UPS: {
    color: "#f97316",
    gradient: "from-orange-500/10 to-orange-500/0",
    icon: "🔌",
  },
};

function getDeviceLocation(deviceId: string, stats: DeviceDailyStat[]): string {
  return stats.find((s) => s.deviceId === deviceId)?.location ?? deviceId;
}

function getCurrentWIBHour(): number {
  return (new Date().getUTCHours() + 7) % 24;
}

function buildGroupedData(hourly: HourlyReading[]) {
  const grouped: Record<string, Record<string, HourlyReading>> = {};
  for (const row of hourly) {
    if (!grouped[row.hour]) grouped[row.hour] = {};
    grouped[row.hour][row.deviceId] = row;
  }
  return grouped;
}

/* ─── Single Device Mini Chart ─── */
function DeviceMiniChart({
  deviceId,
  hourly,
  stats,
  currentHour,
}: {
  deviceId: string;
  hourly: HourlyReading[];
  stats: DeviceDailyStat[];
  currentHour: number;
  index: number;
}) {
  const location = getDeviceLocation(deviceId, stats);
  const stat = stats.find((s) => s.deviceId === deviceId);
  const meta = DEVICE_META[location] || { color: "#94a3b8", gradient: "from-slate-500/10 to-slate-500/0", icon: "📊" };

  // Build chart data for this device only
  const grouped = buildGroupedData(hourly);
  const chartData = Object.keys(grouped)
    .sort()
    .map((hour) => {
      const d = grouped[hour][deviceId];
      return {
        hour,
        avg: d?.avgTemp ?? undefined,
        min: d?.minTemp ?? undefined,
        max: d?.maxTemp ?? undefined,
      };
    });

  const currentDataPoint = chartData.find(
    (d) => parseInt(String(d.hour).split(":")[0]) === currentHour,
  );

  if (!stat) return null;

  return (
    <div className="flex flex-col">
      {/* Device Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/40 rounded-t-xl border border-b-0 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.icon}</span>
          <span
            className="text-sm font-bold"
            style={{ color: meta.color }}
          >
            {location}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {stat.count} data points
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-blue-500">
            <ArrowDown className="w-3 h-3" />
            {stat.minTemp.toFixed(1)}°
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {stat.avgTemp.toFixed(1)}°
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <ArrowUp className="w-3 h-3" />
            {stat.maxTemp.toFixed(1)}°
          </span>
        </div>
      </div>

      {/* Chart */}
      <div
        className="relative h-[110px] sm:h-[130px] border border-slate-200 dark:border-slate-700 rounded-b-xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${meta.color}08 0%, transparent 100%)`,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`fill-${deviceId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={meta.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={meta.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              interval={3}
            />

            <YAxis
              yAxisId="temp"
              orientation="left"
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}°`}
              width={40}
            />

            <Tooltip
              content={
                <MiniTooltip color={meta.color} location={location} />
              }
              cursor={{
                stroke: meta.color,
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.4,
              }}
            />

            {/* "Now" reference line */}
            <ReferenceLine
              yAxisId="temp"
              x={`${String(currentHour).padStart(2, "0")}:00`}
              stroke={meta.color}
              strokeDasharray="2 2"
              strokeOpacity={0.3}
              label=""
            />

            {/* Area band (min → max) */}
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="max"
              stroke="none"
              fill={`url(#fill-${deviceId})`}
              legendType="none"
            />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="min"
              stroke="none"
              fill="white"
              fillOpacity={1}
              legendType="none"
            />

            {/* Avg line — bold solid */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="avg"
              stroke={meta.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "white",
                fill: meta.color,
              }}
              connectNulls={false}
              legendType="none"
            />

            {/* Now dot */}
            {currentDataPoint && currentDataPoint.avg !== undefined && (
              <ReferenceDot
                yAxisId="temp"
                x={currentDataPoint.hour}
                y={currentDataPoint.avg}
                r={4}
                fill={meta.color}
                stroke="white"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Compact Tooltip ─── */
interface MiniTooltipPayload {
  dataKey: string;
  value: number;
}
interface MiniTooltipProps {
  active?: boolean;
  payload?: MiniTooltipPayload[];
  label?: string | number;
  color: string;
  location: string;
}
function MiniTooltip({
  active,
  payload,
  label,
  color,
  location,
}: MiniTooltipProps) {
  if (!active || !payload?.length) return null;

  const entry = payload.find(
    (p) => p.dataKey === "avg" || p.dataKey === "min" || p.dataKey === "max",
  );
  if (!entry) return null;

  const avg = payload.find((p) => p.dataKey === "avg")?.value;
  const min = payload.find((p) => p.dataKey === "min")?.value;
  const max = payload.find((p) => p.dataKey === "max")?.value;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-200 px-3 py-2 min-w-[120px]">
      <p className="text-[10px] font-bold text-slate-400 mb-1">
        {String(label)} WIB
      </p>
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-bold text-slate-700">{location}</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        {min !== undefined && (
          <span className="flex items-center gap-0.5">
            <ArrowDown className="w-2.5 h-2.5 text-blue-400" />
            {Number(min).toFixed(1)}°
          </span>
        )}
        {avg !== undefined && (
          <span className="font-semibold text-slate-700">
            {Number(avg).toFixed(1)}°
          </span>
        )}
        {max !== undefined && (
          <span className="flex items-center gap-0.5">
            <ArrowUp className="w-2.5 h-2.5 text-red-400" />
            {Number(max).toFixed(1)}°
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DailyTrendChart({
  stats,
  hourly,
  isLoading = false,
}: Props) {
  const currentHour = getCurrentWIBHour();

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-xs font-semibold">Loading daily trend...</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs font-semibold">Belum ada data hari ini</p>
        <p className="text-[10px] mt-1">
          Data akan muncul setelah sensor mengirim pembacaan
        </p>
      </div>
    );
  }

  // Get unique deviceIds in defined order
  const deviceIds: string[] = DEVICE_ORDER.filter((loc) =>
    stats.some((s) => s.location === loc),
  );
  // Add any remaining devices not in DEVICE_ORDER
  for (const s of stats) {
    if (!deviceIds.includes(s.location)) {
      deviceIds.push(s.location);
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto space-y-3 pr-1">
      {deviceIds.map((location, idx) => {
        const stat = stats.find((s) => s.location === location);
        if (!stat) return null;
        return (
          <DeviceMiniChart
            key={stat.deviceId}
            deviceId={stat.deviceId}
            hourly={hourly}
            stats={stats}
            currentHour={currentHour}
            index={idx}
          />
        );
      })}
    </div>
  );
}
