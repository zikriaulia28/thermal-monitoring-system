"use client";

import { Device } from "@/types/device";

interface Props {
  devices: Device[];
}

export default function MonitoringStatistic({ devices }: Props) {
  const latest = devices.flatMap((d) => d.readings);

  const avgTemp =
    latest.length > 0
      ? (latest.reduce((a, b) => a + b.temperature, 0) / latest.length).toFixed(
          1,
        )
      : "--";

  const avgHum =
    latest.length > 0
      ? (latest.reduce((a, b) => a + b.humidity, 0) / latest.length).toFixed(1)
      : "--";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-500">Total Device</p>
        <h2 className="text-3xl font-bold">{devices.length}</h2>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-500">Average Temperature</p>
        <h2 className="text-3xl font-bold">{avgTemp}°C</h2>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-500">Average Humidity</p>
        <h2 className="text-3xl font-bold">{avgHum}%</h2>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-500">Total Records</p>
        <h2 className="text-3xl font-bold">{latest.length}</h2>
      </div>
    </div>
  );
}
