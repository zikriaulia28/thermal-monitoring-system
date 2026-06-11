"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

import DeviceSummary from "@/components/devices/DeviceSummary";
import DeviceGrid from "@/components/devices/DeviceGrid";

import { Device } from "@/types/device";
import { getDevices } from "@/services/deviceService";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDevices() {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (error) {
        console.error("Failed to load devices:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDevices();

    const interval = setInterval(loadDevices, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsif */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Devices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage and monitor all IoT sensor nodes
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Device Summary */}
          <DeviceSummary devices={devices} />

          {/* Device Grid */}
          <DeviceGrid devices={devices} />
        </>
      )}
    </div>
  );
}
