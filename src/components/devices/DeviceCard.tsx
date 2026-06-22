"use client";

import { useState } from "react";
import { Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { Device } from "@/types/device";
import DeviceStatusBadge from "./DeviceStatusBadge";
import DeviceDetailModal from "./DeviceDetailModal";

interface Props {
  device: Device;
}

export default function DeviceCard({ device }: Props) {
  const latest = device.readings.at(-1);
  const [open, setOpen] = useState(false);

  // Check for critical conditions
  const tempCritical = latest && (latest.temperature > 30 || latest.temperature < 15);
  const humCritical = latest && (latest.humidity > 70 || latest.humidity < 30);
  const hasAlert = tempCritical || humCritical || device.status === "offline";

  // Determine card border color based on status
  const borderColor = hasAlert
    ? "border-red-300 bg-red-50/50"
    : "border-slate-200 bg-white";

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all ${borderColor}`}
    >
      {/* Alert Badge - Top Right */}
      {hasAlert && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-red-100 border border-red-200 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-semibold text-red-700">
              {device.status === "offline"
                ? "Device Offline"
                : tempCritical
                  ? "Temp Alert"
                  : "Humidity Alert"}
            </span>
          </div>
        </div>
      )}

      {/* Device Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate text-slate-900">{device.name}</h3>
          <p className="text-xs sm:text-sm text-slate-500 truncate">{device.id}</p>
        </div>

        <DeviceStatusBadge status={device.status} />
      </div>

      {/* Location */}
      <div className="mb-3 text-xs sm:text-sm text-slate-500 truncate">
        📍 {device.location}
      </div>

      {/* Readings */}
      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            tempCritical ? "bg-red-100" : "bg-slate-50"
          }`}
        >
          <Thermometer
            className={`h-4 w-4 ${tempCritical ? "text-red-600" : "text-red-500"}`}
          />
          <span
            className={`font-medium text-sm ${
              tempCritical ? "text-red-700" : "text-slate-700"
            }`}
          >
            {latest ? `${latest.temperature} °C` : "--"}
          </span>
          {tempCritical && (
            <span className="ml-auto text-xs font-semibold text-red-600">!</span>
          )}
        </div>

        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            humCritical ? "bg-yellow-100" : "bg-slate-50"
          }`}
        >
          <Droplets
            className={`h-4 w-4 ${humCritical ? "text-yellow-600" : "text-blue-500"}`}
          />
          <span
            className={`font-medium text-sm ${
              humCritical ? "text-yellow-700" : "text-slate-700"
            }`}
          >
            {latest ? `${latest.humidity} %` : "--"}
          </span>
          {humCritical && (
            <span className="ml-auto text-xs font-semibold text-yellow-600">!</span>
          )}
        </div>
      </div>

      {/* Last Seen */}
      <div className="mt-4 border-t pt-3">
        <p className="text-xs text-slate-500">Last Seen</p>
        <p className="text-xs sm:text-sm font-medium break-words text-slate-700">
          {device.lastSeen
            ? new Date(device.lastSeen).toLocaleString("id-ID")
            : "-"}
        </p>
      </div>

      {/* View Detail Button */}
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm sm:text-base text-white hover:bg-slate-700 transition-colors active:scale-95"
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
