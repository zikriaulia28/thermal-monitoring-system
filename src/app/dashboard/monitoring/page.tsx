"use client";

import { useEffect, useState } from "react";

import MonitoringHeader from "@/components/monitoring/MonitoringHeader";
import MonitoringChart from "@/components/monitoring/MonitoringChart";
import MonitoringGrid from "@/components/monitoring/MonitoringGrid";

import { Device } from "@/types/device";
import { getMonitoringData } from "@/services/monitoring.service";
import { transformMonitoringData } from "@/lib/chartUtils";

export default function MonitoringPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const data = await getMonitoringData();
        if (mounted) {
          setDevices(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setIsLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const chartData = transformMonitoringData(devices);

  return (
    // ✅ Spacing responsif: lebih rapat di mobile, lebih lega di desktop
    <div className="space-y-4 sm:space-y-6">
      <MonitoringHeader devices={devices} isLoading={isLoading} />

      <MonitoringChart data={chartData} isLoading={isLoading} />

      {!isLoading && <MonitoringGrid devices={devices} />}
    </div>
  );
}
