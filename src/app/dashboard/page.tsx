"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  Thermometer,
  Droplet,
  AlertCircle,
} from "lucide-react";

import StatCard from "@/components/cards/StatCard";
import RealtimeChart from "@/components/charts/RealtimeChart";
import DeviceMetrics from "@/components/charts/DeviceMetrics";
import EventTable from "@/components/tables/EventTable";
import TimeRangeFilter from "@/components/filters/TimeRangeFilter";

import { Device } from "@/types/device";
import {
  DashboardOverview,
  DeviceDailyStat,
} from "@/types/dashboard";
import { TimeRange } from "@/types/filter";
import { getChartData, getOverview, getDailyStats } from "@/services/dashboard.service";

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("realtime");
  const [customDateFrom, setCustomDateFrom] = useState<Date | null>(null);
  const [customDateTo, setCustomDateTo] = useState<Date | null>(null);

  // ── Daily trend state (independent of dropdown) ──
  const [dailyStats, setDailyStats] = useState<DeviceDailyStat[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("daily-trend");

  // Load daily stats on mount once
  useEffect(() => {
    const load = async () => {
      setDailyLoading(true);
      try {
        const data = await getDailyStats();
        setDailyStats(data.stats);
      } catch {
        // silent
      } finally {
        setDailyLoading(false);
      }
    };
    load();
  }, []);

  // Main data loading (dipengaruhi dropdown)
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [chartData, overviewData] = await Promise.all([
          getChartData(
            timeRange,
            undefined,
            customDateFrom || undefined,
            customDateTo || undefined,
          ),
          getOverview(),
        ]);
        setDevices(chartData);
        setOverview(overviewData);
      } catch (error) {
        console.error("Dashboard load error:", error);
        setError("Gagal memuat data dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, [timeRange, customDateFrom, customDateTo]);

  const handleTimeRangeChange = (
    newRange: TimeRange,
    customFrom?: Date,
    customTo?: Date,
  ) => {
    setTimeRange(newRange);
    if (customFrom && customTo) {
      setCustomDateFrom(customFrom);
      setCustomDateTo(customTo);
    }
    setIsLoading(true);
  };

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const dynamicStats = [
    {
      title: "Device Online",
      value: isLoading ? "..." : `${overview?.online ?? 0}`,
      icon: Wifi,
      status: "online" as const,
    },
    {
      title: "Device Offline",
      value: isLoading ? "..." : `${overview?.offline ?? 0}`,
      icon: WifiOff,
      status:
        overview?.offline && overview.offline > 0
          ? ("offline" as const)
          : undefined,
    },
    {
      title: "Temperature Average",
      value: isLoading
        ? "..."
        : `${overview?.avgTemperature.toFixed(1) ?? 0}°C`,
      icon: Thermometer,
    },
    {
      title: "Humidity Average",
      value: isLoading ? "..." : `${overview?.avgHumidity.toFixed(1) ?? 0}%`,
      icon: Droplet,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsif */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Realtime IoT Monitoring Dashboard
          </p>
        </div>

        {/* Time Range Filter */}
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">
              Error Loading Data
            </h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards - Grid Responsif */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {dynamicStats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            status={item.status}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* ── DeviceMetrics — hanya muncul saat tab "Harian" aktif ── */}
      {activeTab === "daily-trend" && dailyStats.length > 0 && (
        <div className="rounded-xl border bg-white dark:bg-slate-800 shadow-sm p-3 sm:p-4 md:p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            Ringkasan Harian
          </h3>
          <DeviceMetrics stats={dailyStats} isLoading={dailyLoading} />
        </div>
      )}

      {/* Main Content - Side by side di desktop */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart - Full width di mobile, 2/3 di desktop */}
        <div className="w-full xl:col-span-2">
          <RealtimeChart
            devices={devices}
            isLoading={isLoading}
            timeRange={timeRange}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Event Table - Full width di mobile, 1/3 di desktop */}
        <div className="w-full xl:col-span-1">
          <EventTable devices={devices} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
