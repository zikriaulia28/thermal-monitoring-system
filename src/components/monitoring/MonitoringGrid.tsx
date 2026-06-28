"use client";

import { Device } from "@/types/device";
import MonitoringCard from "./MonitoringCard";
import { Radio } from "lucide-react";

interface Props {
  devices: Device[];
}

export default function MonitoringGrid({ devices }: Props) {
  if (devices.length === 0) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-10 text-center">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 inline-block mb-3">
          <Radio className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak Ada Device</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Device mungkin offline atau belum melaporkan data</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {devices.map((device) => (
        <MonitoringCard key={device.id} device={device} />
      ))}
    </div>
  );
}
