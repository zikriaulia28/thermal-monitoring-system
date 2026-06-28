"use client";

import { Device } from "@/types/device";
import { AlertTriangle } from "lucide-react";
import { formatWIB } from "@/lib/formatWIB";

interface Props {
  device: Device;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const w = 120;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.01;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((val - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(" L")}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L${points[points.length - 1].split(",")[0]},${h} L${points[0].split(",")[0]},${h} Z`}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MonitoringCard({ device }: Props) {
  const latest = device.readings.at(-1);
  const isOnline = device.status === "online";

  const tempCritical = latest && (latest.temperature > 30 || latest.temperature < 15);
  const humCritical = latest && (latest.humidity > 70 || latest.humidity < 30);
  const hasAlert = tempCritical || humCritical || !isOnline;

  const tempValues = device.readings.slice(-30).map((r) => r.temperature);
  const humValues = device.readings.slice(-30).map((r) => r.humidity);

  const tempTrend =
    tempValues.length >= 2
      ? tempValues[tempValues.length - 1] > tempValues[0]
        ? "up"
        : tempValues[tempValues.length - 1] < tempValues[0]
        ? "down"
        : "flat"
      : "flat";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md ${
        hasAlert
          ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800"
          : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
      }`}
    >
      {/* Accent border-left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          hasAlert ? "bg-red-500" : isOnline ? "bg-green-500" : "bg-slate-400"
        }`}
      />

      <div className="pl-4 pr-4 pt-4 pb-4 sm:pl-5 sm:pr-5 sm:pt-5 sm:pb-5">
        {/* Alert Badge */}
        {hasAlert && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-1 bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800 rounded-lg w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
              {!isOnline ? "Offline" : tempCritical ? "Temp Alert" : "Humidity Alert"}
            </span>
          </div>
        )}

        {/* Header: Lokasi & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {device.location}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
              {device.id}
            </p>
          </div>

          <span
            className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {isOnline && (
              <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            {device.status}
          </span>
        </div>

        {/* Metrics */}
        <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Temperature */}
          <div
            className={`rounded-lg p-3 sm:p-4 border ${
              tempCritical
                ? "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-800"
                : "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
            }`}
          >
            <p
              className={`text-xs sm:text-sm font-medium ${
                tempCritical
                  ? "text-red-700 dark:text-red-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              Temperature
              {tempTrend === "up" && <span className="ml-1.5 inline-block text-[10px]">↑</span>}
              {tempTrend === "down" && <span className="ml-1.5 inline-block text-[10px]">↓</span>}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {latest?.temperature ?? "--"}
              <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">°C</span>
            </h2>
            {tempCritical && (
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">!</span>
            )}
          </div>

          {/* Humidity */}
          <div
            className={`rounded-lg p-3 sm:p-4 border ${
              humCritical
                ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800"
                : "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20"
            }`}
          >
            <p
              className={`text-xs sm:text-sm font-medium ${
                humCritical
                  ? "text-yellow-700 dark:text-yellow-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              Humidity
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {latest?.humidity ?? "--"}
              <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">%</span>
            </h2>
            {humCritical && (
              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">!</span>
            )}
          </div>
        </div>

        {/* Sparkline Section */}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-1">
              Trend Suhu (30 titik)
            </span>
            <Sparkline data={tempValues} color={tempCritical ? "#dc2626" : "#ef4444"} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-1">
              Trend Kelembaban (30 titik)
            </span>
            <Sparkline data={humValues} color={humCritical ? "#eab308" : "#3b82f6"} />
          </div>
        </div>

        {/* Footer: Last Seen */}
        <div className="mt-2 sm:mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
            Terakhir Terlihat
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
            {formatWIB(device.lastSeen, "medium")}
          </p>
        </div>
      </div>
    </div>
  );
}
