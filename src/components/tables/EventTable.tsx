"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { Device } from "@/types/device";

interface EventTableProps {
  devices: Device[];
  isLoading?: boolean;
}

export default function EventTable({ devices, isLoading = false }: EventTableProps) {
  return (
    <div className="h-full rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Sensor Node Status</h2>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead>
            <tr className="border-b text-xs font-medium uppercase text-gray-400">
              <th className="pb-3 text-left">Device</th>
              <th className="pb-3 text-left">Status</th>
              <th className="pb-3 text-right">Last Read</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-3.5">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td className="py-3.5">
                    <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="h-4 w-12 bg-slate-200 rounded animate-pulse ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              devices.map((device) => {
                const latestReading = device.readings.at(-1);

                return (
                  <tr
                    key={device.id}
                    className="border-b transition-colors hover:bg-slate-50 last:border-none"
                  >
                    <td className="py-3.5">
                      <div className="font-medium text-gray-900">
                        {device.name}
                      </div>

                      <div className="text-xs text-gray-400">{device.id}</div>
                    </td>

                    <td className="py-3.5">
                      <StatusBadge status={device.status} />
                    </td>

                    <td className="py-3.5 text-right font-mono text-gray-600">
                      {latestReading?.time ?? "--:--"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!isLoading && devices.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            No device found
          </div>
        )}
      </div>
    </div>
  );
}
