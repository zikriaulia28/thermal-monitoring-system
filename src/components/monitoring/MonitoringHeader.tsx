"use client";

import { Device } from "@/types/device";
import { Server, Wifi, WifiOff, Loader2 } from "lucide-react";

interface Props {
  devices: Device[];
  isLoading?: boolean;
}

export default function MonitoringHeader({ devices, isLoading }: Props) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.length - online;

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
  ];

  return (
    <div>
      {/* Header Title */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Realtime Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live Sensor Telemetry & Status
          </p>
        </div>

        {isLoading && (
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Stats Grid */}
      {/* ✅ 1 kolom di mobile, 3 kolom di tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 sm:p-5 shadow-sm flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {stat.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
