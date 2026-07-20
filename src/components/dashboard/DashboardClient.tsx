"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
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
import DeviceMetrics from "@/components/charts/DeviceMetrics";
import EventLog from "@/components/tables/EventLog";
import { Device } from "@/types/device";
import type { AlertItem } from "@/components/tables/EventLog";

// Recharts berat (~150KB+) — lazy load biar tidak blocking First Load JS
const DashboardChart = dynamic(
  () => import("@/components/charts/DashboardChart"),
  {
    ssr: false,
    loading: () => (
      <div className="col-span-1 lg:col-span-2 rounded-xl border bg-card border-border shadow-sm p-6">
        <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">
          Memuat grafik…
        </div>
      </div>
    ),
  },
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type HealthStatus = "normal" | "warning" | "critical";

interface Overview {
  online: number;
  offline: number;
  avgTemperature: number;
  avgHumidity: number;
}
interface AlertsSummary {
  active: number;
  critical: number;
}
interface RecentAlertsResp {
  data: AlertItem[];
}
interface DailyResp {
  stats: import("@/types/dashboard").DeviceDailyStat[];
}

interface Props {
  overview: Overview | null;
  devices: Device[] | null;
  alertsSummary: AlertsSummary | null;
  recentAlerts: RecentAlertsResp | null;
  dailyStats: DailyResp | null;
}

export default function DashboardClient({
  overview: overviewFallback,
  devices: devicesFallback,
  alertsSummary: alertsSummaryFallback,
  recentAlerts: recentAlertsFallback,
  dailyStats: dailyFallback,
}: Props) {
  usePageTitle("Dashboard");

  const chartParams = new URLSearchParams({ range: "realtime" });
  const dailyParams = new URLSearchParams({ range: "realtime" });

  const { data: overview } = useSWR<Overview | null>(
    "/api/dashboard/overview",
    fetcher,
    { refreshInterval: 120000, revalidateOnFocus: false, fallbackData: overviewFallback },
  );

  const { data: devices } = useSWR<Device[] | null>(
    () => `/api/dashboard/chart?${chartParams.toString()}`,
    fetcher,
    { refreshInterval: 120000, revalidateOnFocus: false, fallbackData: devicesFallback },
  );

  const { data: alertsSummary } = useSWR<AlertsSummary | null>(
    "/api/dashboard/alerts?summary=true",
    fetcher,
    { refreshInterval: 120000, revalidateOnFocus: false, fallbackData: alertsSummaryFallback },
  );

  const { data: recentAlerts } = useSWR<RecentAlertsResp | null>(
    "/api/dashboard/alerts?limit=5",
    fetcher,
    { refreshInterval: 120000, revalidateOnFocus: false, fallbackData: recentAlertsFallback },
  );

  const { data: dailyRes } = useSWR<DailyResp | null>(
    () => `/api/dashboard/daily-stats?${dailyParams.toString()}`,
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: false, fallbackData: dailyFallback },
  );

  const dailyStats = dailyRes?.stats ?? [];
  const activeAlerts = alertsSummary?.active ?? 0;
  const criticalAlerts = alertsSummary?.critical ?? 0;

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
      value: `${overview?.online ?? 0}`,
      icon: Wifi,
      status: "online" as const,
    },
    {
      title: "Device Offline",
      value: `${overview?.offline ?? 0}`,
      icon: WifiOff,
      status:
        overview?.offline && overview.offline > 0
          ? ("offline" as const)
          : undefined,
    },
    {
      title: "Rata-rata Suhu",
      value: `${overview?.avgTemperature?.toFixed(1) ?? 0}°C`,
      icon: Thermometer,
    },
    {
      title: "Rata-rata Kelembaban",
      value: `${overview?.avgHumidity?.toFixed(1) ?? 0}%`,
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

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            status={item.status}
            isLoading={false}
          />
        ))}
      </div>

      {/* RINGKASAN HARIAN */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-3 sm:p-4 md:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[var(--cpems-online)] rounded-full" />
            Ringkasan Harian
          </h3>
          <DeviceMetrics stats={dailyStats} isLoading={false} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="w-full xl:col-span-2 h-[360px]">
          <DashboardChart devices={Array.isArray(devices) ? devices : []} isLoading={false} />
        </div>
        <div className="w-full xl:col-span-1">
          <EventLog alerts={recentAlerts?.data ?? []} isLoading={false} />
        </div>
      </div>
    </div>
  );
}
