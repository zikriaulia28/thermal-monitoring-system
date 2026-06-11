"use client";

import { useState } from "react";
import { Thermometer, Droplets } from "lucide-react";
import { Device } from "@/types/device";
import DeviceStatusBadge from "./DeviceStatusBadge";
import DeviceDetailModal from "./DeviceDetailModal";

interface Props {
  device: Device;
}

export default function DeviceCard({ device }: Props) {
  const latest = device.readings.at(-1);
  const [open, setOpen] = useState(false);

  return (
    // ✅ PERBAIKAN: Padding p-4 di mobile, p-5 di layar lebih besar
    <div className="rounded-xl border bg-white p-4 sm:p-5 shadow-sm hover:shadow-lg transition">
      <div className="mb-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          {/* ✅ PERBAIKAN: Truncate agar nama device panjang tidak merusak layout */}
          <h3 className="font-semibold truncate">{device.name}</h3>
          <p className="text-xs sm:text-sm text-slate-500 truncate">
            {device.id}
          </p>
        </div>

        <DeviceStatusBadge status={device.status} />
      </div>

      {/* ✅ PERBAIKAN: Truncate untuk lokasi */}
      <div className="mb-3 text-xs sm:text-sm text-slate-500 truncate">
        {device.location}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-red-500" />
          <span className="font-medium">
            {latest ? `${latest.temperature} °C` : "--"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="font-medium">
            {latest ? `${latest.humidity} %` : "--"}
          </span>
        </div>
      </div>

      <div className="mt-5 border-t pt-3">
        <p className="text-xs text-slate-500">Last Seen</p>
        <p className="text-xs sm:text-sm font-medium break-words">
          {device.lastSeen
            ? new Date(device.lastSeen).toLocaleString("id-ID")
            : "-"}
        </p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm sm:text-base text-white hover:bg-slate-700 transition-colors"
      >
        View Detail
      </button>

      <DeviceDetailModal
        device={device}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
