"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Thermometer, Droplets } from "lucide-react";
import { Device } from "@/types/device";
import { formatWIB } from "@/lib/formatWIB";
import { buildComparisonData, getDeviceByLocation } from "@/lib/chartUtils";
import { useThresholds } from "@/hooks/useThresholds";

interface Props {
  devices: Device[];
  isLoading?: boolean;
}

const TEMP_COLORS: Record<string, string> = {
  "Ruang PDB": "#dc2626",
  "Ruang UPS": "#d97706",
  "Ruang Baterai": "#2563eb",
};

export default function DashboardChart({ devices, isLoading = false }: Props) {
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity">("temperature");

  const isTemperature = activeTab === "temperature";
  const unit = isTemperature ? "°C" : "%";
  const { tempMin, tempMax, tempWarning, humMin, humMax } = useThresholds();

  const chartData = useMemo(() => {
    if (!devices || !Array.isArray(devices) || devices.length === 0) return [];
    const pdb = getDeviceByLocation(devices, "PDB");
    const ups = getDeviceByLocation(devices, "UPS");
    const battery = getDeviceByLocation(devices, "BATTERY");
    const combined = buildComparisonData(pdb, ups, battery);
    // Ambil hanya kolom yang relevan dengan tab aktif
    return combined.map((row) => {
      const next: Record<string, number | string | null> = { time: row.time };
      if (isTemperature) {
        next["Ruang PDB"] = row["Ruang PDB"];
        next["Ruang UPS"] = row["Ruang UPS"];
        next["Ruang Baterai"] = row["Ruang Baterai"];
      } else {
        next["Ruang PDB"] = row["Hum PDB"];
        next["Ruang UPS"] = row["Hum UPS"];
        next["Ruang Baterai"] = row["Hum Baterai"];
      }
      return next;
    });
  }, [devices, isTemperature]);

  const keys = useMemo(
    () =>
      chartData.length > 0
        ? [...new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => k !== "time")))]
        : [],
    [chartData],
  );

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return isTemperature ? [15, 40] : [0, 100];

    let dataMin = Infinity;
    let dataMax = -Infinity;

    for (const row of chartData) {
      for (const key of keys) {
        const val = row[key] as number | null | undefined;
        if (val != null) {
          if (val < dataMin) dataMin = val;
          if (val > dataMax) dataMax = val;
        }
      }
    }

    if (!isFinite(dataMin) || !isFinite(dataMax)) {
      return isTemperature ? [15, 40] : [0, 100];
    }

    const padding = Math.max((dataMax - dataMin) * 0.15, isTemperature ? 2 : 5);
    return [
      Math.floor((dataMin - padding) * 10) / 10,
      Math.ceil((dataMax + padding) * 10) / 10,
    ];
  }, [chartData, keys, isTemperature]);

  return (
    <div className="h-full flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[var(--primary)] rounded-full" />
            Tren Gabungan
          </h2>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("temperature")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                isTemperature
                  ? "bg-card text-[var(--cpems-offline)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              Temperature
            </button>
            <button
              onClick={() => setActiveTab("humidity")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                !isTemperature
                  ? "bg-card text-emerald-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              Humidity
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Rata-rata 3 ruangan · {unit}
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Memuat tren…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Tidak ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis
                dataKey="time"
                tickFormatter={(iso) => formatWIB(iso, "short").replace(" WIB", "")}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={36}
                domain={yDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "6px 10px",
                }}
                labelFormatter={(iso) => formatWIB(iso, "medium")}
                formatter={(value, name) => [`${Number(value ?? 0).toFixed(1)} ${unit}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: "8px" }} iconType="circle" iconSize={8} />

              {isTemperature && (
                <>
                  <ReferenceLine y={tempMax} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `CRIT ${tempMax}°C`, position: "insideTopRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }} />
                  <ReferenceLine y={tempWarning} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `WARN ${tempWarning.toFixed(0)}°C`, position: "insideTopRight", fill: "#f59e0b", fontSize: 10, fontWeight: "bold" }} />
                  <ReferenceLine y={tempMin} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `LOW ${tempMin}°C`, position: "insideBottomRight", fill: "#3b82f6", fontSize: 10, fontWeight: "bold" }} />
                </>
              )}

              {!isTemperature && (
                <>
                  <ReferenceLine y={humMax} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `CRIT ${humMax}%`, position: "insideTopRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }} />
                  <ReferenceLine y={humMin} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `CRIT ${humMin}%`, position: "insideBottomRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }} />
                </>
              )}

              {keys.map((key) => (
                <Line
                  key={key}
                  type="natural"
                  dataKey={key}
                  stroke={TEMP_COLORS[key] || "#94a3b8"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                  connectNulls={true}
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
