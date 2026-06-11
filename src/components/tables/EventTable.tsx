"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { Device } from "@/types/device";

interface EventTableProps {
  devices: Device[];
}

export default function EventTable({ devices }: EventTableProps) {
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
            {devices.map((device) => {
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
            })}
          </tbody>
        </table>

        {devices.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-400">
            No device found
          </div>
        )}
      </div>
    </div>
  );
}
