"use client";

import { Device } from "@/types/device";

interface Props {
  devices: Device[];
}

export default function MonitoringHistory({ devices }: Props) {
  const rows = devices.flatMap((device) =>
    device.readings.map((reading) => ({
      device: device.id,
      location: device.location,
      ...reading,
    })),
  );

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Sensor History</h2>

      <div className="max-h-[500px] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th>Time</th>
              <th>Device</th>
              <th>Location</th>
              <th>Temperature</th>
              <th>Humidity</th>
            </tr>
          </thead>

          <tbody>
            {rows
              .reverse()
              .slice(0, 100)
              .map((row, index) => (
                <tr key={index} className="border-b">
                  <td>{row.time}</td>

                  <td>{row.device}</td>

                  <td>{row.location}</td>

                  <td>{row.temperature}°C</td>

                  <td>{row.humidity}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
