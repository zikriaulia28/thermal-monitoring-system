"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Wifi,
  WifiOff,
  Thermometer,
  Droplet,
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import StatCard from "@/components/cards/StatCard";
import RealtimeChart from "@/components/charts/RealtimeChart";
import DeviceMetrics from "@/components/charts/DeviceMetrics";
import EventLog from "@/components/tables/EventLog";
import TimeRangeFilter from "@/components/filters/TimeRangeFilter";

import { TimeRange } from "@/types/filter";
import { Device } from "@/types/device";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type HealthStatus = "normal" | "warning" | "critical";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const [timeRange, setTimeRange] = useState<TimeRange>("realtime");
  const [customDateFrom, setCustomDateFrom] = useState<Date | null>(null);
  const [customDateTo, setCustomDateTo] = useState<Date | null>(null);

  const chartParams = new URLSearchParams({ range: timeRange });
  if (customDateFrom) chartParams.set("from", customDateFrom.toISOString());
  if (customDateTo) chartParams.set("to", customDateTo.toISOString());

  const { data: overview, error, isLoading } = useSWR(
    "/api/dashboard/overview",
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: false },
  );

  const { data: devices } = useSWR(
    () => `/api/dashboard/chart?${chartParams.toString()}`,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: false },
  );

  const { data: alertsRes } = useSWR(
    "/api/dashboard/alerts",
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: false },
  );

  const dailyParams = new URLSearchParams({ range: timeRange });
  if (customDateFrom) dailyParams.set("from", customDateFrom.toISOString());
  if (customDateTo) dailyParams.set("to", customDateTo.toISOString());

  const { data: dailyRes } = useSWR(
    () => `/api/dashboard/daily-stats?${dailyParams.toString()}`,
    fetcher,
    { refreshInterval: 120000, revalidateOnFocus: false },
  );

  const dailyStats = dailyRes?.stats ?? [];
  const errorMessage = error ? "Gagal memuat data dashboard" : null;
  const activeAlerts = alertsRes?.active ?? 0;
  const criticalAlerts = alertsRes?.critical ?? 0;

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
  };

  // ── Health Status ──────────────────────────────────
  const health: HealthStatus = useMemo(() => {
    if (criticalAlerts > 0) return "critical";
    if ((overview?.offline ?? 0) > 0 || activeAlerts > 0) return "warning";
    return "normal";
  }, [criticalAlerts, activeAlerts, overview?.offline]);

  const healthConfig: Record<HealthStatus, { label: string; icon: typeof ShieldCheck; color: string; bg: string }> = {
    normal:    { label: "Normal",     icon: ShieldCheck,     color: "var(--cpems-online)",  bg: "var(--cpems-online)/10" },
    warning:   { label: "Warning",    icon: AlertCircle,     color: "var(--cpems-warning)", bg: "var(--cpems-warning)/10" },
    critical:  { label: "Critical",   icon: AlertTriangle,   color: "var(--cpems-offline)", bg: "var(--cpems-offline)/10" },
  };
  const hc = healthConfig[health];
  const HealthIcon = hc.icon;

  // ── Extreme Devices ────────────────────────────────
  const extremes = useMemo<{
    hottest: { name: string; location: string; temp: number } | null;
    coldest: { name: string; location: string; temp: number } | null;
  } | null>(() => {
    if (!devices || !Array.isArray(devices) || devices.length === 0) return null;
    let hottest: { name: string; location: string; temp: number } | null = null;
    let coldest: { name: string; location: string; temp: number } | null = null;

    (devices as Device[]).forEach((d: Device) => {
      const r = d.readings?.at(-1);
      if (!r || r.temperature == null) return;
      const entry = { name: d.name || d.id, location: d.location || "-", temp: r.temperature };
      if (!hottest || entry.temp > hottest.temp) hottest = entry;
      if (!coldest || entry.temp < coldest.temp) coldest = entry;
    });

    return { hottest, coldest };
  }, [devices]);

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
      status:
        overview?.offline && overview.offline > 0
          ? ("offline" as const)
          : undefined,
    },
    {
      title: "Rata-rata Suhu",
      value: isLoading
        ? "..."
        : `${overview?.avgTemperature?.toFixed(1) ?? 0}°C`,
      icon: Thermometer,
    },
    {
      title: "Rata-rata Kelembaban",
      value: isLoading ? "..." : `${overview?.avgHumidity?.toFixed(1) ?? 0}%`,
      icon: Droplet,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Overview
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Dashboard Monitoring Real-time
              </p>
            </div>
          </div>
        </div>
        <TimeRangeFilter value={timeRange} onChange={handleTimeRangeChange} />
      </div>

      {/* ── SYSTEM HEALTH BADGE ──────────────────────────── */}
      <div
        className="rounded-xl border shadow-sm p-4 flex items-center justify-between"
        style={{
          borderColor: `color-mix(in oklch, ${hc.color} 40%, transparent)`,
          backgroundColor: `color-mix(in oklch, ${hc.color} 8%, transparent)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-white"
            style={{ backgroundColor: hc.color }}
          >
            <HealthIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status Sistem</p>
            <h2
              className="font-data text-lg font-bold"
              style={{ color: hc.color }}
            >
              {hc.label}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Alert Aktif</p>
          <span className="font-data text-lg font-bold text-foreground">
            {(overview?.offline ?? 0) > 0
              ? `${criticalAlerts} critical`
              : criticalAlerts > 0
                ? `${criticalAlerts} critical`
                : activeAlerts > 0
                  ? `${activeAlerts} active`
                  : "Tidak ada"}
          </span>
        </div>
      </div>

      {/* ── EXTREME DEVICES ─────────────────────────────── */}
      {extremes && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--cpems-offline)]/20 bg-[var(--cpems-offline)]/5 p-3 flex items-center gap-3">
            <span className="text-lg shrink-0">🔥</span>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium uppercase">Tertinggi</p>
              <p className="text-sm font-bold text-foreground truncate font-data">
                {extremes.hottest?.name} — {extremes.hottest?.temp.toFixed(1)}°C
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {extremes.hottest?.location}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--cpems-humidity)]/20 bg-[var(--cpems-humidity)]/5 p-3 flex items-center gap-3">
            <span className="text-lg shrink-0">❄️</span>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium uppercase">Terendah</p>
              <p className="text-sm font-bold text-foreground truncate font-data">
                {extremes.coldest?.name} — {extremes.coldest?.temp.toFixed(1)}°C
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {extremes.coldest?.location}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {errorMessage && (
        <div className="relative rounded-xl border border-[var(--cpems-offline)]/30 bg-[var(--cpems-offline)]/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--cpems-offline)]/10">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--cpems-offline)]">
                Gagal Memuat Data
              </h3>
              <p className="text-sm text-[var(--cpems-offline)]/80 mt-1">
                {errorMessage}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Coba refresh halaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
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

      {/* RINGKASAN HARIAN */}
      {dailyStats.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-3 sm:p-4 md:p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[var(--cpems-online)] rounded-full" />
              Ringkasan Harian
            </h3>
            <DeviceMetrics stats={dailyStats} isLoading={!dailyRes} />
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="w-full xl:col-span-2">
          <RealtimeChart
            devices={devices ?? []}
            isLoading={isLoading}
            timeRange={timeRange}
            onTabChange={() => {}}
            customDateFrom={customDateFrom}
            customDateTo={customDateTo}
          />
        </div>
        <div className="w-full xl:col-span-1">
          <EventLog alerts={alertsRes?.data ?? []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
