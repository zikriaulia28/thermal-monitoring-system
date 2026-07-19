"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { Device } from "@/types/device";
import { formatWIB } from "@/lib/formatWIB";
import { Clock } from "lucide-react";

interface EventTableProps {
  devices: Device[];
  isLoading?: boolean;
}

export default function EventTable({ devices, isLoading = false }: EventTableProps) {
  return (
    <div className="h-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          Sensor Node Status
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {devices.length} devices
        </p>
      </div>

      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
              <th className="px-5 py-3">Device</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Last Read</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
                      <div>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1.5" />
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              devices.map((device) => {
                const latestReading = device.readings.at(-1);
                const isOffline = device.status === "offline";

                return (
                  <tr
                    key={device.id}
                    className="border-b border-border/50 last:border-none transition-colors hover:bg-muted/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                                      isOffline
                                                        ? "bg-[var(--cpems-offline)]/10 text-[var(--cpems-offline)]"
                                                        : "bg-[var(--primary)] text-white"
                                                    }`}
                        >
                          {device.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {device.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {device.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="font-data whitespace-nowrap">
                          {formatWIB(latestReading?.time, "medium")}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!isLoading && devices.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Tidak ada device ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
