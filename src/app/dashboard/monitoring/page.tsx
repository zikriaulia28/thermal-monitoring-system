"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePageTitle } from "@/hooks/usePageTitle";

import MonitoringHeader from "@/components/monitoring/MonitoringHeader";
import DeviceCard from "@/components/devices/DeviceCard";

const EnhancedMonitoringChart = dynamic(
  () => import("@/components/monitoring/EnhancedMonitoringChart"),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl border border-border bg-card animate-pulse" /> },
);

import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";
import { getMonitoringData } from "@/services/monitoring.service";
import { transformMonitoringData } from "@/lib/chartUtils";

export default function MonitoringPage() {
  usePageTitle("Monitoring");
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<MonitoringTimeRange>("1h");

  const fetchData = useCallback(async (range: MonitoringTimeRange) => {
    try {
      const data = await getMonitoringData(range);
      setDevices(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Monitoring fetch error:", err);
      setDevices([]);
      setIsLoading(false);
    }
  }, []);

  // Data fetching + polling — setState hanya terjadi async (setelah await)
  // sehingga tidak trigger cascading renders synchronously di effect body
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getMonitoringData(timeRange);
        if (!cancelled) {
          setDevices(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Monitoring fetch error:", err);
        if (!cancelled) {
          setDevices([]);
          setIsLoading(false);
        }
      }
    };

    load();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 120000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [timeRange]);

  const handleTimeRangeChange = (newRange: MonitoringTimeRange) => {
    setTimeRange(newRange);
    setIsLoading(true);
    fetchData(newRange);
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    fetchData(timeRange);
  };

  const temperatureData = transformMonitoringData(devices, "temperature");
  const humidityData = transformMonitoringData(devices, "humidity");

  return (
    <div className="space-y-4 sm:space-y-6">
      <MonitoringHeader 
        devices={devices} 
        isLoading={isLoading}
        onRefresh={handleManualRefresh}
      />

      <EnhancedMonitoringChart 
        temperatureData={temperatureData}
        humidityData={humidityData}
        isLoading={isLoading}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
