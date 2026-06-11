"use client";

import { Device } from "@/types/device";

interface Props {
  device: Device;
}

export default function MonitoringCard({ device }: Props) {
  const latest = device.readings.at(-1);
  const isOnline = device.status === "online";

  return (
    // ✅ PERBAIKAN: Padding responsif, dark mode, dan hover effect
    <div className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header: Lokasi & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* ✅ Truncate agar teks panjang tidak merusak layout */}
          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
            {device.location}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
            {device.id}
          </p>
        </div>

        {/* ✅ Status Badge dengan animasi pulse untuk online */}
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
      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Temperature */}
        <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
            Temperature
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {latest?.temperature ?? "--"}
            <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
              °C
            </span>
          </h2>
        </div>

        {/* Humidity */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
            Humidity
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {latest?.humidity ?? "--"}
            <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
              %
            </span>
          </h2>
        </div>
      </div>

      {/* Footer: Last Seen */}
      <div className="mt-4 sm:mt-5 border-t border-slate-100 dark:border-slate-700 pt-3">
        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
          Last Seen
        </p>
        {/* ✅ Format tanggal diperpendek agar tidak berantakan di mobile */}
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
