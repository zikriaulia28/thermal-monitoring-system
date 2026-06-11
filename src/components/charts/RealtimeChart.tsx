"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Thermometer, Droplets, MapPin } from "lucide-react";

import DeviceMetrics from "./DeviceMetrics";
import ComparisonTemperatureChart from "./ComparisonTemperatureChart";
import ComparisonHumidityChart from "./ComparisonHumidityChart";
import DeviceDetailChart from "./DeviceDetailChart";

import { Device } from "@/types/device";
import { buildComparisonData, getDeviceByLocation } from "@/lib/chartUtils";

interface RealtimeChartProps {
  devices: Device[];
}

export default function RealtimeChart({ devices }: RealtimeChartProps) {
  const [activeTab, setActiveTab] = useState("comparison-temp");

  const pdbDevice = getDeviceByLocation(devices, "PDB");
  const upsDevice = getDeviceByLocation(devices, "UPS");
  const batteryDevice = getDeviceByLocation(devices, "BATTERY");

  const comparisonData = useMemo(
    () => buildComparisonData(pdbDevice, upsDevice, batteryDevice),
    [pdbDevice, upsDevice, batteryDevice],
  );

  const currentSingleDevice = devices.find((device) => device.id === activeTab);
  const singleDeviceData = currentSingleDevice?.readings ?? [];

  const getContextInfo = () => {
    if (activeTab === "comparison-temp") {
      return {
        title: "Temperature Comparison",
        description:
          "Perbandingan suhu realtime antar lokasi (PDB, UPS, Battery)",
        unit: "°C",
        icon: <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
        latest: "Multi-device",
      };
    }
    if (activeTab === "comparison-hum") {
      return {
        title: "Humidity Comparison",
        description: "Perbandingan kelembaban udara realtime antar lokasi",
        unit: "%",
        icon: <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
        latest: "Multi-device",
      };
    }
    if (currentSingleDevice) {
      const latest = singleDeviceData.at(-1);
      return {
        title: `${currentSingleDevice.location} Telemetry`,
        description: `Data sensor realtime dari node ${currentSingleDevice.location}`,
        unit: latest
          ? `Temp: ${latest.temperature}°C · Hum: ${latest.humidity}%`
          : "Waiting for data...",
        icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />,
        latest: latest ? `${latest.temperature}°C / ${latest.humidity}%` : "-",
      };
    }
    return { title: "", description: "", unit: "", icon: null, latest: "-" };
  };

  const context = getContextInfo();

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      {/* Header & Navigation */}
      <div className="p-3 sm:p-4 md:p-5 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-3 mb-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span className="truncate">Telemetry Analytics</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Realtime monitoring · Last 60 minutes
            </p>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 w-fit flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400">
              Live Sync
            </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="relative -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5">
            <TabsList className="w-full justify-start overflow-x-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-lg gap-1 scrollbar-hide flex-nowrap">
              <TabsTrigger
                value="comparison-temp"
                className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm px-3 py-1.5 text-xs sm:text-sm"
              >
                🌡️ Suhu
              </TabsTrigger>
              <TabsTrigger
                value="comparison-hum"
                className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm px-3 py-1.5 text-xs sm:text-sm"
              >
                💧 Humidity
              </TabsTrigger>
              {devices.map((device) => (
                <TabsTrigger
                  key={device.id}
                  value={device.id}
                  className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm px-2.5 py-1.5 text-xs sm:text-sm"
                >
                  📍 {device.location}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Metrics Section */}
      <div className="p-3 sm:p-4 md:p-5 pt-2 sm:pt-3 md:pt-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
        <DeviceMetrics devices={devices} />
      </div>

      {/* Chart Context & Visualization */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Dynamic Context Header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5 sm:mt-1 shadow-sm flex-shrink-0">
              {context.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                {context.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                {context.description}
              </p>
            </div>
          </div>

          {/* Latest Value Display */}
          <div className="w-full sm:w-auto bg-slate-50 dark:bg-slate-900/50 px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 sm:text-right">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Latest Reading
            </p>
            <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5 break-all sm:break-normal">
              {context.latest}
            </p>
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-2 sm:p-3 shadow-inner relative" style={{ minWidth: 0, minHeight: 0 }}>
          {activeTab === "comparison-temp" && (
            <ComparisonTemperatureChart data={comparisonData} />
          )}
          {activeTab === "comparison-hum" && (
            <ComparisonHumidityChart data={comparisonData} />
          )}
          {!activeTab.startsWith("comparison") &&
            singleDeviceData.length > 0 && (
              <DeviceDetailChart data={singleDeviceData} />
            )}

          {/* Empty State */}
          {!activeTab.startsWith("comparison") &&
            singleDeviceData.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4">
                <Activity className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 opacity-40" />
                <p className="text-xs sm:text-sm font-semibold text-center">
                  No telemetry data available
                </p>
                <p className="text-[10px] sm:text-xs mt-1 text-center">
                  Device might be offline or not reporting yet
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
