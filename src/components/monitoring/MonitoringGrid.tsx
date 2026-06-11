"use client";

import { Device } from "@/types/device";
import MonitoringCard from "./MonitoringCard";

interface Props {
  devices: Device[];
}

export default function MonitoringGrid({ devices }: Props) {
  if (devices.length === 0) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
        No devices found.
      </div>
    );
  }

  return (
    // ✅ 1 kolom (mobile) -> 2 kolom (tablet) -> 3 kolom (desktop besar)
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {devices.map((device) => (
        <MonitoringCard key={device.id} device={device} />
      ))}
    </div>
  );
}
