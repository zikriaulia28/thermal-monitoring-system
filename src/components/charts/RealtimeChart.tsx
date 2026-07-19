"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Thermometer, Droplets, MapPin, TrendingUp } from "lucide-react";

import ComparisonTemperatureChart from "./ComparisonTemperatureChart";
import ComparisonHumidityChart from "./ComparisonHumidityChart";
import DeviceDetailChart from "./DeviceDetailChart";
import DailyTrendChart from "./DailyTrendChart";

import { Device } from "@/types/device";
import { DeviceDailyStat, HourlyReading } from "@/types/dashboard";
import { buildComparisonData, getDeviceByLocation } from "@/lib/chartUtils";
import { TimeRange, TIME_RANGE_OPTIONS } from "@/types/filter";
import { getDailyStats } from "@/services/dashboard.service";

interface RealtimeChartProps {
  devices: Device[];
  isLoading?: boolean;
  timeRange?: TimeRange;
  onTabChange?: (tab: string) => void;
  customDateFrom?: Date | null;
  customDateTo?: Date | null;
}

export type { RealtimeChartProps };

export default function RealtimeChart({
  devices,
  isLoading = false,
  timeRange = "realtime",
  onTabChange,
  customDateFrom,
  customDateTo,
}: RealtimeChartProps) {
  const [activeTab, setActiveTab] = useState("daily-trend");
  const [dailyStats, setDailyStats] = useState<{ stats: DeviceDailyStat[]; hourly: HourlyReading[] }>({ stats: [], hourly: [] });
  const [dailyLoading, setDailyLoading] = useState(false);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      onTabChange?.(value);
    },
    [onTabChange],
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchDaily() {
      setDailyLoading(true);
      try {
        const data = await getDailyStats(timeRange);
        if (!cancelled) setDailyStats(data);
      } catch {
        // silent
      } finally {
        if (!cancelled) setDailyLoading(false);
      }
    }
    fetchDaily();
    return () => { cancelled = true; };
  }, [timeRange]);

  const pdbDevice = getDeviceByLocation(devices, "PDB");
  const upsDevice = getDeviceByLocation(devices, "UPS");
  const batteryDevice = getDeviceByLocation(devices, "BATTERY");

  const comparisonData = useMemo(
    () => buildComparisonData(pdbDevice, upsDevice, batteryDevice),
    [pdbDevice, upsDevice, batteryDevice],
  );

  const currentSingleDevice = devices.find((device) => String(device.id) === activeTab);
  const singleDeviceData = currentSingleDevice?.readings ?? [];

  const timeRangeLabel = TIME_RANGE_OPTIONS.find((opt) => opt.value === timeRange)?.description || "Last 60 minutes";

  const getContextInfo = () => {
    if (activeTab === "daily-trend") {
      return {
        title: "Daily Temperature Trend",
        description: "Average, min & max temperature per hour today (WIB)",
        unit: "°C",
        icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />,
        latest: "Per hour",
      };
    }
    if (activeTab === "comparison-temp") {
      return {
        title: "Temperature Comparison",
        description: "Real-time temperature comparison across locations (PDB, UPS, Battery)",
        unit: "°C",
        icon: <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
        latest: "Multi-device",
      };
    }
    if (activeTab === "comparison-hum") {
      return {
        title: "Humidity Comparison",
        description: "Real-time humidity comparison across locations",
        unit: "%",
        icon: <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
        latest: "Multi-device",
      };
    }
    if (currentSingleDevice) {
      const latest = singleDeviceData.at(-1);
      return {
        title: `${currentSingleDevice.location} Telemetry`,
        description: `Real-time sensor data from node ${currentSingleDevice.location}`,
        unit: latest ? `Temp: ${latest.temperature}°C · Hum: ${latest.humidity}%` : "Waiting for data...",
        icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />,
        latest: latest ? `${latest.temperature}°C / ${latest.humidity}%` : "-",
      };
    }
    return { title: "", description: "", unit: "", icon: null, latest: "-" };
  };

  const context = getContextInfo();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-5 pb-3 sm:pb-4 border-b border-border">
        <div className="flex flex-col gap-3 mb-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span className="truncate">Telemetry Analytics</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Real-time monitoring · {timeRangeLabel}
            </p>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted border border-border w-fit shrink-0">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                Live
              </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="relative px-3 sm:px-4 md:px-5 pt-3 sm:pt-4">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted p-1 rounded-lg gap-1 scrollbar-hide flex-nowrap">
            <TabsTrigger value="daily-trend" className="shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-card shadow-sm px-3 py-1.5 text-xs sm:text-sm">
              📈 Daily
            </TabsTrigger>
            <TabsTrigger value="comparison-temp" className="shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-card shadow-sm px-3 py-1.5 text-xs sm:text-sm">
              🌡️ Temperature
            </TabsTrigger>
            <TabsTrigger value="comparison-hum" className="shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-card shadow-sm px-3 py-1.5 text-xs sm:text-sm">
              💧 Humidity
            </TabsTrigger>
            {devices.map((device) => (
              <TabsTrigger key={device.id} value={String(device.id)} className="shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm px-2.5 py-1.5 text-xs sm:text-sm">
                📍 {device.location}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Chart */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Context Header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted mt-0.5 sm:mt-1 shadow-sm shrink-0">
              {context.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {context.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {context.description}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto bg-muted/50 px-3 sm:px-4 py-2 rounded-lg border border-border sm:text-right">
            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Latest Reading
            </p>
            <p className="text-sm sm:text-lg font-bold text-foreground font-mono mt-0.5 break-all sm:break-normal">
              {context.latest}
            </p>
          </div>
        </div>

        {/* Chart Container */}
        <div
          className="w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-lg sm:rounded-xl border border-border bg-card/50 p-2 sm:p-3 shadow-inner relative"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-card/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-border" />
                <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute inset-0" />
              </div>
              <p className="mt-3 text-xs sm:text-sm font-semibold text-center">Loading chart data...</p>
            </div>
          ) : (
            <>
              {activeTab === "daily-trend" && <DailyTrendChart stats={dailyStats.stats} hourly={dailyStats.hourly} isLoading={dailyLoading} />}
              {activeTab === "comparison-temp" && <ComparisonTemperatureChart data={comparisonData} />}
              {activeTab === "comparison-hum" && <ComparisonHumidityChart data={comparisonData} />}
              {!activeTab.startsWith("comparison") && activeTab !== "daily-trend" && singleDeviceData.length > 0 && <DeviceDetailChart data={singleDeviceData} />}

              {/* Empty State */}
              {!activeTab.startsWith("comparison") && activeTab !== "daily-trend" && singleDeviceData.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-card/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4">
                  <Activity className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 opacity-40" />
                  <p className="text-xs sm:text-sm font-semibold text-center">No telemetry data</p>
                  <p className="text-[10px] sm:text-xs mt-1 text-center">Device may be offline or has not reported data</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
