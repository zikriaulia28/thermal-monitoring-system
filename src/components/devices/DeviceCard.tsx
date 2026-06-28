"use client";

import { useState } from "react";
import { Thermometer, Droplets, AlertTriangle, Eye, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Device } from "@/types/device";
import { formatWIB } from "@/lib/formatWIB";
import DeviceStatusBadge from "./DeviceStatusBadge";
import DeviceDetailModal from "./DeviceDetailModal";

interface Props {
  device: Device;
}

export default function DeviceCard({ device }: Props) {
  const latest = device.readings.at(-1);
  const [open, setOpen] = useState(false);

  const tempCritical = latest && (latest.temperature > 30 || latest.temperature < 15);
  const humCritical = latest && (latest.humidity > 70 || latest.humidity < 30);
  const isOffline = device.status === "offline";
  const isAlert = isOffline || tempCritical || humCritical;

  // Calculate temperature trend (last 3 readings)
  const readings = device.readings.slice(-5);
  const tempTrend = getTrend(readings.map((r) => r.temperature));
  const humTrend = getTrend(readings.map((r) => r.humidity));

  // Mini sparkline data (last 12 readings)
  const sparkData = device.readings.slice(-12);

  return (
    <div
      className={`relative group rounded-xl border bg-white p-4 sm:p-5 shadow-sm 
                  transition-all duration-200 hover:shadow-lg active:scale-[0.99]
                  dark:bg-slate-800 dark:border-slate-700
                  ${
                    isAlert
                      ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10"
                      : ""
                  }`}
    >
      {/* ── Alert Stripe ── */}
      {isAlert && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-xl" />
      )}

      {/* ── Header: Name + Status ── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm
              ${
                isOffline
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
              }`}
          >
            {device.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate text-slate-900 dark:text-white text-sm sm:text-base">
              {device.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
              {device.id} • 📍 {device.location}
            </p>
          </div>
        </div>
        <DeviceStatusBadge status={device.status} />
      </div>

      {/* ── Alert Warning ── */}
      {isAlert && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-xs font-medium text-red-700 dark:text-red-400">
            {isOffline
              ? "Device Offline"
              : tempCritical && humCritical
                ? "Temp & Humidity Alert"
                : tempCritical
                  ? "Temperature Alert"
                  : "Humidity Alert"}
          </span>
        </div>
      )}

      {/* ── Readings with Progress Bars ── */}
      <div className="space-y-3 mb-3">
        {/* Temperature */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Thermometer
                className={`h-4 w-4 ${tempCritical ? "text-red-600" : "text-red-500"} shrink-0`}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Temp</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getTrendIcon(tempTrend)}
              <span
                className={`font-semibold text-sm ${
                  tempCritical
                    ? "text-red-700 dark:text-red-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {latest ? `${latest.temperature}°C` : "--"}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                tempCritical
                  ? "bg-red-500"
                  : latest && latest.temperature > 25
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, ((latest?.temperature ?? 0) / 45) * 100))}%`,
              }}
            />
          </div>
          {/* Mini sparkline */}
          <MiniSparkline data={sparkData.map((r) => r.temperature)} color={tempCritical ? "#ef4444" : "#3b82f6"} />
        </div>

        {/* Humidity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplets
                className={`h-4 w-4 ${humCritical ? "text-yellow-600" : "text-blue-500"} shrink-0`}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Humidity</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getTrendIcon(humTrend)}
              <span
                className={`font-semibold text-sm ${
                  humCritical
                    ? "text-yellow-700 dark:text-yellow-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {latest ? `${latest.humidity}%` : "--"}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                humCritical
                  ? "bg-yellow-500"
                  : latest && latest.humidity > 60
                    ? "bg-amber-500"
                    : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, latest?.humidity ?? 0))}%`,
              }}
            />
          </div>
          {/* Mini sparkline */}
          <MiniSparkline data={sparkData.map((r) => r.humidity)} color={humCritical ? "#eab308" : "#3b82f6"} />
        </div>
      </div>

      {/* ── Last Seen ── */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
          <Clock className="w-3 h-3" />
          <span>Last seen</span>
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
          {device.lastSeen ? formatWIB(device.lastSeen, "medium") : "-"}
        </span>
      </div>

      {/* ── View Detail Button ── */}
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg
                 bg-gradient-to-r from-blue-500 to-blue-600
                 py-2.5 text-sm font-medium text-white shadow-sm
                 transition-all duration-200
                 hover:from-blue-600 hover:to-blue-700 hover:shadow-md
                 active:scale-[0.98]
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-slate-800"
      >
        <Eye className="w-4 h-4" />
        View Detail
      </button>

      {/* ── Modal ── */}
      <DeviceDetailModal
        device={device}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

// ── Mini Sparkline Component ──────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 120;
  const height = 20;
  const padding = 2;

  const points = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + ((max - val) / range) * (height - padding * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-5"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2"
        fill={color}
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}

// ── Trend helpers ─────────────────────────────────────────
function getTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const diff = last - prev;
  if (diff > 0.5) return "up";
  if (diff < -0.5) return "down";
  return "stable";
}

function getTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-3 h-3 text-red-500" />;
    case "down":
      return <TrendingDown className="w-3 h-3 text-blue-500" />;
    default:
      return <Minus className="w-3 h-3 text-slate-400" />;
  }
}
