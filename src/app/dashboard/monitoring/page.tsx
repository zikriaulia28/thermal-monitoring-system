"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (range: MonitoringTimeRange) => {
    try {
      const data = await getMonitoringData(range);
      if (mountedRef.current) {
        setDevices(data);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    fetchData(timeRange);

    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchData(timeRange);
      }
    }, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [timeRange, fetchData]);

  const handleTimeRangeChange = (newRange: MonitoringTimeRange) => {
    setTimeRange(newRange);
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
