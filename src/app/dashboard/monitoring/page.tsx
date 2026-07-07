"use client";

import { useEffect, useState, useCallback } from "react";

import MonitoringHeader from "@/components/monitoring/MonitoringHeader";
import EnhancedMonitoringChart from "@/components/monitoring/EnhancedMonitoringChart";
import MonitoringGrid from "@/components/monitoring/MonitoringGrid";

import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";
import { getMonitoringData } from "@/services/monitoring.service";
import { transformMonitoringData } from "@/lib/chartUtils";

export default function MonitoringPage() {
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
    }, 60000);

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
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleManualRefresh}
      />

      <EnhancedMonitoringChart 
        temperatureData={temperatureData}
        humidityData={humidityData}
        isLoading={isLoading}
      />

      {!isLoading && <MonitoringGrid devices={devices} />}
    </div>
  );
}
