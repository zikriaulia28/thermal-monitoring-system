"use client";

import { useState } from "react";
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
  ReferenceArea,
} from "recharts";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Thermometer, Droplets, AlertCircle } from "lucide-react";
import { useThresholds } from "@/hooks/useThresholds";

interface Props {
  temperatureData: any[];
  humidityData: any[];
  isLoading?: boolean;
}

const TEMP_COLORS: Record<string, string> = {
  PDB: "#dc2626",
  UPS: "#d97706",
  BATTERY: "#2563eb",
};

const HUM_COLORS: Record<string, string> = {
  PDB: "#7c3aed",
  UPS: "#0d9488",
  BATTERY: "#16a34a",
};

export default function EnhancedMonitoringChart({
  temperatureData,
  humidityData,
  isLoading,
}: Props) {
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity">("temperature");
  const { tempMin, tempMax, tempWarning, humMin, humMax } = useThresholds();

  const isTemperature = activeTab === "temperature";
  const chartData = isTemperature ? temperatureData : humidityData;
  const colors = isTemperature ? TEMP_COLORS : HUM_COLORS;
  const unit = isTemperature ? "°C" : "%";
  const title = isTemperature ? "Temperature Monitoring" : "Humidity Monitoring";

  const keys = chartData.length > 0
    ? [...new Set(chartData.flatMap((d) => Object.keys(d).filter((k) => k !== "time")))]
    : [];

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 sm:p-5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {chartData.length} data points · Real-time monitoring
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("temperature")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              isTemperature
                ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span className="hidden sm:inline">Temperature</span>
          </button>
          <button
            onClick={() => setActiveTab("humidity")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              !isTemperature
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span className="hidden sm:inline">Humidity</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[280px] sm:h-[340px] md:h-[400px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner />
            <p className="text-sm text-slate-500 mt-3">Loading data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs mt-1">Try selecting a different time range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                className="dark:opacity-20"
              />

              {/* Background zones for temperature */}
              {isTemperature && (
                <>
                  <ReferenceArea
                    y1={tempMax + 5}
                    y2={tempMax + 20}
                    fill="#fef2f2"
                    fillOpacity={0.6}
                  />
                  <ReferenceArea
                    y1={tempWarning}
                    y2={tempMax}
                    fill="#fff7ed"
                    fillOpacity={0.4}
                  />
                  <ReferenceArea
                    y1={-10}
                    y2={tempMin}
                    fill="#eff6ff"
                    fillOpacity={0.4}
                  />
                </>
              )}

              {/* Background zones for humidity */}
              {!isTemperature && (
                <>
                  <ReferenceArea
                    y1={humMax}
                    y2={100}
                    fill="#fef2f2"
                    fillOpacity={0.6}
                  />
                  <ReferenceArea
                    y1={-10}
                    y2={humMin}
                    fill="#fef2f2"
                    fillOpacity={0.4}
                  />
                </>
              )}

              <XAxis
                dataKey="time"
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                minTickGap={30}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={isTemperature ? [tempMin - 5, tempMax + 10] : [0, 100]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleString("id-ID", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                formatter={(value: any, name: any) => [
                  `${Number(value).toFixed(2)} ${unit}`,
                  name,
                ]}
              />

              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: "12px" }}
                iconType="circle"
                iconSize={8}
              />

              {/* Reference lines for temperature thresholds */}
              {isTemperature && (
                <>
                  <ReferenceLine
                    y={tempMax + 5}
                    stroke="#dc2626"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={{
                      value: `CRITICAL ${tempMax + 5}°C`,
                      position: "insideTopRight",
                      fill: "#dc2626",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <ReferenceLine
                    y={tempWarning}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `WARNING ${tempWarning}°C`,
                      position: "insideTopRight",
                      fill: "#f59e0b",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <ReferenceLine
                    y={tempMin}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `LOW ${tempMin}°C`,
                      position: "insideBottomRight",
                      fill: "#3b82f6",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                </>
              )}

              {/* Reference lines for humidity thresholds */}
              {!isTemperature && (
                <>
                  <ReferenceLine
                    y={humMax}
                    stroke="#dc2626"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={{
                      value: `CRITICAL ${humMax}%`,
                      position: "insideTopRight",
                      fill: "#dc2626",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <ReferenceLine
                    y={humMin}
                    stroke="#dc2626"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={{
                      value: `CRITICAL ${humMin}%`,
                      position: "insideBottomRight",
                      fill: "#dc2626",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                </>
              )}

              {keys.map((key) => (
                <Line
                  key={key}
                  type="natural"
                  dataKey={key}
                  stroke={colors[key] || "#94a3b8"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  connectNulls={true}
                  name={`${key}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Threshold Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 px-1">
        {isTemperature ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
              <span className="text-red-700">Critical &gt;{tempMax}°C</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-300" />
              <span className="text-amber-700">Warning {tempWarning}-{tempMax}°C</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-300" />
              <span className="text-blue-700">Low &lt;{tempMin}°C</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-auto">
              Normal: {tempMin}-{tempWarning}°C
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
              <span className="text-red-700">Critical &gt;{humMax}% or &lt;{humMin}%</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-auto">
              Normal: {humMin}-{humMax}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}
