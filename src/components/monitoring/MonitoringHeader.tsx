"use client";

import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";
import {
  Server,
  Wifi,
  Droplets,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
} from "lucide-react";
import MonitoringTimeRangeSelector from "./MonitoringTimeRangeSelector";

interface Props {
  devices: Device[];
  isLoading?: boolean;
  timeRange: MonitoringTimeRange;
  onTimeRangeChange: (range: MonitoringTimeRange) => void;
  onRefresh: () => void;
}

export default function MonitoringHeader({
  devices,
  isLoading,
  timeRange,
  onTimeRangeChange,
  onRefresh,
}: Props) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.length - online;

  let totalTemp = 0;
  let totalHum = 0;
  let count = 0;
  let deviceAtRisk = 0;

  devices.forEach((device) => {
    const latest = device.readings.at(-1);
    if (latest) {
      totalTemp += latest.temperature;
      totalHum += latest.humidity;
      count++;
      if (latest.temperature > 30 || latest.temperature < 15 || latest.humidity > 70 || latest.humidity < 30) {
        deviceAtRisk++;
      }
    }
  });

  const avgTemp = count > 0 ? totalTemp / count : 0;
  const avgHum = count > 0 ? totalHum / count : 0;

  const firstReadings: number[] = [];
  const lastReadings: number[] = [];

  devices.forEach((device) => {
    const readings = device.readings;
    if (readings.length >= 2) {
      firstReadings.push(readings[0].temperature);
      lastReadings.push(readings[readings.length - 1].temperature);
    }
  });

  const trendUp =
    firstReadings.length > 0 &&
    lastReadings.reduce((s, v) => s + v, 0) / lastReadings.length >
      firstReadings.reduce((s, v) => s + v, 0) / firstReadings.length;

  const totalDataPoints = devices.reduce((sum, d) => sum + d.readings.length, 0);

  const stats = [
    {
      label: "Total Device",
      value: devices.length,
      icon: Server,
      accent: "from-blue-500 to-indigo-500",
      detail: `${totalDataPoints} titik data`,
    },
    {
      label: "Online",
      value: online,
      icon: Wifi,
      accent: "from-green-500 to-emerald-500",
      detail: `${offline > 0 ? `${offline} offline` : "Semua terhubung"}`,
    },
    {
      label: "Rata-rata Suhu",
      value: `${avgTemp.toFixed(1)}°C`,
      icon: trendUp ? TrendingUp : TrendingDown,
      accent: "from-orange-500 to-amber-500",
      detail: trendUp ? "Naik" : "Turun / Stabil",
    },
    {
      label: "Rata-rata Kelembaban",
      value: `${avgHum.toFixed(1)}%`,
      icon: Droplets,
      accent: "from-blue-500 to-cyan-500",
      detail: "Rata-rata lingkungan",
    },
    {
      label: "Device Berisiko",
      value: deviceAtRisk > 0 ? deviceAtRisk : "Aman",
      icon: deviceAtRisk > 0 ? AlertTriangle : Activity,
      accent: deviceAtRisk > 0 ? "from-red-500 to-rose-500" : "from-emerald-500 to-teal-500",
      detail: deviceAtRisk > 0 ? "Threshold violation" : "Semua dalam batas normal",
    },
  ];

  return (
    <div>
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Realtime Monitoring
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Live Sensor Telemetry & Status
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MonitoringTimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700 transition-all hover:shadow-md"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent}`} />
              <div className="p-3 sm:p-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {stat.label}
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {stat.value}
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
