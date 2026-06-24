import { useState, useEffect } from "react";
import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";
import { getMonitoringData } from "@/services/monitoring.service";

export function useMonitoringData(range: MonitoringTimeRange, mountedRef: React.MutableRefObject<boolean>) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMonitoringData(range);
        if (mountedRef.current) {
          setDevices(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Monitoring data fetch error:", err);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [range, mountedRef]);

  return { devices, isLoading };
}
