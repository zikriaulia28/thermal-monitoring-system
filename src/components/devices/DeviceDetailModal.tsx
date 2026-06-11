"use client";

import { Device } from "@/types/device";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import DeviceDetailChart from "@/components/charts/DeviceDetailChart";

interface Props {
  device: Device | null;
  open: boolean;
  onClose: () => void;
}

export default function DeviceDetailModal({ device, open, onClose }: Props) {
  if (!device) return null;

  const latest = device.readings.at(-1);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`
          w-[calc(100%-2rem)] sm:w-[90%] md:w-[85%] 
          max-w-2xl md:max-w-4xl lg:max-w-5xl 
          
          /* ✅ PERBAIKAN: Scroll hanya di mobile/tablet, di desktop (lg) tinggi otomatis tanpa scroll */
          max-h-[90vh] overflow-y-auto 
          lg:max-h-none lg:overflow-visible lg:h-auto
          
          p-4 sm:p-6 lg:p-8 
          rounded-xl gap-4 sm:gap-6
        `}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {device.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Detail monitoring dan riwayat data sensor untuk perangkat ini.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ PERBAIKAN: Jarak antar section lebih rapat di desktop agar muat 1 layar */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* 1. Informasi Dasar Perangkat */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <InfoItem label="Device ID" value={device.id} mono />
            <InfoItem label="Location" value={device.location} />
            <InfoItem label="Status" value={device.status} />
            <InfoItem
              label="Last Seen"
              value={
                device.lastSeen
                  ? new Date(device.lastSeen).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
              }
            />
          </div>

          {/* 2. Kartu Suhu & Kelembapan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 sm:p-6 flex flex-col justify-between">
              <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
                Temperature
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-700 dark:text-red-400 mt-2">
                {latest?.temperature ?? "--"}
                <span className="text-lg sm:text-2xl md:text-3xl">°C</span>
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 sm:p-6 flex flex-col justify-between">
              <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                Humidity
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-400 mt-2">
                {latest?.humidity ?? "--"}
                <span className="text-lg sm:text-2xl md:text-3xl">%</span>
              </h2>
            </div>
          </div>

          {/* 3. Grafik Detail */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
              Historical Data
            </h3>
            {/* ✅ PERBAIKAN: Tinggi grafik disesuaikan agar pas di layar desktop tanpa scroll */}
            <div className="h-[200px] sm:h-[250px] lg:h-[280px] w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
              <DeviceDetailChart data={device.readings} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Komponen kecil pembantu untuk merapikan kode InfoItem
function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-slate-900 dark:text-white break-all ${mono ? "font-mono text-xs sm:text-sm" : ""}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}
