"use client";

import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";
import { Server, Wifi, WifiOff, Thermometer, Droplets, RefreshCw } from "lucide-react";
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
  onRefresh 
}: Props) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.length - online;

  // Calculate avg temp & humidity
  let totalTemp = 0;
  let totalHum = 0;
  let count = 0;

  devices.forEach((device) => {
    const latest = device.readings.at(-1);
    if (latest) {
      totalTemp += latest.temperature;
      totalHum += latest.humidity;
      count++;
    }
  });

  const avgTemp = count > 0 ? totalTemp / count : 0;
  const avgHum = count > 0 ? totalHum / count : 0;

  const stats = [
    {
      label: "Total Device",
      value: devices.length,
      icon: Server,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
    },
    {
      label: "Online",
      value: online,
      icon: Wifi,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Offline",
      value: offline,
      icon: WifiOff,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Avg Temp",
      value: `${avgTemp.toFixed(1)}°C`,
      icon: Thermometer,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Avg Humidity",
      value: `${avgHum.toFixed(1)}%`,
      icon: Droplets,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ];

  return (
    <div>
      {/* Header Title with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Realtime Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live Sensor Telemetry & Status
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector - Custom Dropdown */}
          <MonitoringTimeRangeSelector
            value={timeRange}
            onChange={onTimeRangeChange}
          />

          {/* Manual Refresh Button */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-3 sm:p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    {stat.label}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {stat.value}
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
