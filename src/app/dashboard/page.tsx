"use client";

import { useEffect, useState } from "react";
import {
  Wifi,
  WifiOff,
  Thermometer,
  Droplet,
  LayoutDashboard,
} from "lucide-react";

import StatCard from "@/components/cards/StatCard";
import RealtimeChart from "@/components/charts/RealtimeChart";
import DeviceMetrics from "@/components/charts/DeviceMetrics";
import EventTable from "@/components/tables/EventTable";
import TimeRangeFilter from "@/components/filters/TimeRangeFilter";

import { Device } from "@/types/device";
import { DashboardOverview, DeviceDailyStat } from "@/types/dashboard";
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

  // ── Daily trend state ──
  const [dailyStats, setDailyStats] = useState<DeviceDailyStat[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("daily-trend");

  // Load daily stats on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchDaily() {
      setDailyLoading(true);
      try {
        const data = await getDailyStats();
        if (!cancelled) setDailyStats(data.stats);
      } catch {
        // silent
      } finally {
        if (!cancelled) setDailyLoading(false);
      }
    }
    fetchDaily();
    return () => { cancelled = true; };
  }, []);

  // Main data load
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setError(null);
        const [chartData, overviewData] = await Promise.all([
          getChartData(timeRange, undefined, customDateFrom || undefined, customDateTo || undefined),
          getOverview(),
        ]);
        if (!cancelled) {
          setDevices(chartData);
          setOverview(overviewData);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        if (!cancelled) setError("Gagal memuat data dashboard");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [timeRange, customDateFrom, customDateTo]);

  const handleTimeRangeChange = (newRange: TimeRange, customFrom?: Date, customTo?: Date) => {
    setTimeRange(newRange);
    if (customFrom && customTo) {
      setCustomDateFrom(customFrom);
      setCustomDateTo(customTo);
    }
    setIsLoading(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const statCards = [
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
      status: overview?.offline && overview.offline > 0 ? ("offline" as const) : undefined,
    },
    {
      title: "Temperature Average",
      value: isLoading ? "..." : `${overview?.avgTemperature.toFixed(1) ?? 0}°C`,
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
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Overview
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Realtime IoT Monitoring Dashboard
              </p>
            </div>
          </div>
        </div>
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      {/* ── ERROR STATE ──────────────────────────────────── */}
      {error && (
        <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 p-4 sm:p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500" />
          <div className="flex items-start gap-3">
            <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">
                Gagal Memuat Data
              </h3>
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
              >
                Coba refresh halaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATS CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((item) => (
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

      {/* ── RINGKASAN HARIAN ────────────────────────────── */}
      {activeTab === "daily-trend" && dailyStats.length > 0 && (
        <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-3 sm:p-4 md:p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              Ringkasan Harian
            </h3>
            <DeviceMetrics stats={dailyStats} isLoading={dailyLoading} />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart */}
        <div className="w-full xl:col-span-2">
          <RealtimeChart
            devices={devices}
            isLoading={isLoading}
            timeRange={timeRange}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Event Table */}
        <div className="w-full xl:col-span-1">
          <EventTable devices={devices} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
