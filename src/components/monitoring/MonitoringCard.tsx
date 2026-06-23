"use client";

import { Device } from "@/types/device";
import { AlertTriangle } from "lucide-react";

interface Props {
  device: Device;
}

export default function MonitoringCard({ device }: Props) {
  const latest = device.readings.at(-1);
  const isOnline = device.status === "online";

  // Check for critical conditions
  const tempCritical = latest && (latest.temperature > 30 || latest.temperature < 15);
  const humCritical = latest && (latest.humidity > 70 || latest.humidity < 30);
  const hasAlert = tempCritical || humCritical || !isOnline;

  return (
    <div className={`rounded-xl border p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${
      hasAlert 
        ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800" 
        : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
    }`}>
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

        {/* Status Badge */}
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

      {/* Metrics: Temperature & Humidity */}
      <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Temperature */}
        <div className={`rounded-lg p-3 sm:p-4 border ${
          tempCritical
            ? "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-800"
            : "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
        }`}>
          <p className={`text-xs sm:text-sm font-medium ${
            tempCritical 
              ? "text-red-700 dark:text-red-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            Temperature
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {latest?.temperature ?? "--"}
            <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
              °C
            </span>
          </h2>
          {tempCritical && (
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">!</span>
          )}
        </div>

        {/* Humidity */}
        <div className={`rounded-lg p-3 sm:p-4 border ${
          humCritical
            ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800"
            : "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20"
        }`}>
          <p className={`text-xs sm:text-sm font-medium ${
            humCritical 
              ? "text-yellow-700 dark:text-yellow-400" 
              : "text-blue-600 dark:text-blue-400"
          }`}>
            Humidity
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {latest?.humidity ?? "--"}
            <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
              %
            </span>
          </h2>
          {humCritical && (
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">!</span>
          )}
        </div>
      </div>

      {/* Footer: Last Seen */}
      <div className="mt-4 sm:mt-5 border-t border-slate-100 dark:border-slate-700 pt-3">
        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
          Last Seen
        </p>
        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
          {device.lastSeen
            ? new Date(device.lastSeen).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </p>
      </div>
    </div>
  );
}
