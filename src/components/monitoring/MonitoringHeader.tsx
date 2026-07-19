"use client";

import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";
import {
  Server,
  Wifi,
  Droplets,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
} from "lucide-react";
import MonitoringTimeRangeSelector from "./MonitoringTimeRangeSelector";
import { Button } from "@/components/ui/button";

interface Props {
  devices: Device[];
  isLoading?: boolean;
  timeRange: MonitoringTimeRange;
  onTimeRangeChange: (range: MonitoringTimeRange) => void;
  onRefresh: () => void;
}

const COLOR_MAP: Record<string, string> = {
  Device: "var(--primary)",
  Online: "var(--cpems-online)",
  Suhu: "var(--cpems-temp)",
  Kelembaban: "var(--cpems-humidity)",
  Risk: "var(--cpems-offline)",
};

export default function MonitoringHeader({
  devices,
  isLoading,
  timeRange,
  onTimeRangeChange,
  onRefresh,
}: Props) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.length - online;

  let totalTemp = 0;
  let totalHum = 0;
  let count = 0;
  let deviceAtRisk = 0;

  devices.forEach((device) => {
    const latest = device.readings.at(-1);
    if (latest) {
      totalTemp += latest.temperature;
      totalHum += latest.humidity;
      count++;
      if (latest.temperature > 30 || latest.temperature < 15 || latest.humidity > 70 || latest.humidity < 30) {
        deviceAtRisk++;
      }
    }
  });

  const avgTemp = count > 0 ? totalTemp / count : 0;
  const avgHum = count > 0 ? totalHum / count : 0;

  const firstReadings: number[] = [];
  const lastReadings: number[] = [];

  devices.forEach((device) => {
    const readings = device.readings;
    if (readings.length >= 2) {
      firstReadings.push(readings[0].temperature);
      lastReadings.push(readings[readings.length - 1].temperature);
    }
  });

  const trendUp =
    firstReadings.length > 0 &&
    lastReadings.reduce((s, v) => s + v, 0) / lastReadings.length >
      firstReadings.reduce((s, v) => s + v, 0) / firstReadings.length;

  const totalDataPoints = devices.reduce((sum, d) => sum + d.readings.length, 0);

  const stats = [
    {
      label: "Total Device",
      value: devices.length,
      icon: Server,
      key: "Device",
      detail: `${totalDataPoints} titik data`,
    },
    {
      label: "Online",
      value: online,
      icon: Wifi,
      key: "Online",
      detail: `${offline > 0 ? `${offline} offline` : "Semua terhubung"}`,
    },
    {
      label: "Rata-rata Suhu",
      value: `${avgTemp.toFixed(1)}°C`,
      icon: trendUp ? TrendingUp : TrendingDown,
      key: "Suhu",
      detail: trendUp ? "Naik" : "Turun / Stabil",
    },
    {
      label: "Rata-rata Kelembaban",
      value: `${avgHum.toFixed(1)}%`,
      icon: Droplets,
      key: "Kelembaban",
      detail: "Rata-rata lingkungan",
    },
    {
      label: "Device Berisiko",
      value: deviceAtRisk > 0 ? deviceAtRisk : "Aman",
      icon: deviceAtRisk > 0 ? AlertTriangle : Activity,
      key: "Risk",
      detail: deviceAtRisk > 0 ? "Threshold violation" : "Semua dalam batas normal",
    },
  ];

  return (
    <div>
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Monitoring Real-time
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Telemetri & Status Sensor Langsung
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MonitoringTimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const accent = COLOR_MAP[stat.key];
          const isRisk = stat.key === "Risk" && deviceAtRisk > 0;
          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md ${
                isRisk ? "border-[var(--cpems-offline)]/30 bg-[var(--cpems-offline)]/5" : "border-border bg-card"
              }`}
            >
              <div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                style={{ backgroundColor: accent }}
              />
              <div className="p-3 sm:p-4 pl-4">
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white shadow-sm"
                    style={{ backgroundColor: accent }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium truncate">
                      {stat.label}
                    </p>
                    <h2 className="font-data text-lg sm:text-xl font-bold text-foreground mt-0.5 truncate">
                      {stat.value}
                    </h2>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
