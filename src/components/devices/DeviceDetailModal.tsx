"use client";

import { useState, useEffect } from "react";
import { Download, X, Info } from "lucide-react";
import { Device } from "@/types/device";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import DeviceDetailChart from "@/components/charts/DeviceDetailChart";
import ModalTimeRangeSelector from "./ModalTimeRangeSelector";
import { TimeRange, TIME_RANGE_OPTIONS } from "@/types/filter";
import { getChartData } from "@/services/dashboard.service";
import { exportDeviceToPDF } from "@/lib/pdfExport";

interface Props {
  device: Device | null;
  open: boolean;
  onClose: () => void;
}

export default function DeviceDetailModal({ device, open, onClose }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1d");
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [deviceData, setDeviceData] = useState<Device | null>(device);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch device data when time range changes
  useEffect(() => {
    if (!device || !open) return;

    const fetchDeviceData = async () => {
      setIsLoadingData(true);
      try {
        const data = await getChartData(timeRange, device.id, customFrom || undefined, customTo || undefined);
        const updatedDevice = data.find((d) => d.id === device.id);
        if (updatedDevice) {
          setDeviceData(updatedDevice);
        }
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDeviceData();
  }, [timeRange, device, open, customFrom, customTo]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTimeRange("1d");
      setCustomFrom(null);
      setCustomTo(null);
      setDeviceData(device);
    }
  }, [open, device]);

  const handleTimeRangeChange = (range: TimeRange, from?: Date, to?: Date) => {
    setTimeRange(range);
    if (from && to) {
      setCustomFrom(from);
      setCustomTo(to);
    }
  };

  const handleExportPDF = () => {
    if (!deviceData) return;
    
    const rangeLabel = timeRange === "custom" && customFrom && customTo
      ? `${customFrom.toLocaleDateString("id-ID")} - ${customTo.toLocaleDateString("id-ID")}`
      : TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label || "";
    
    exportDeviceToPDF(deviceData, rangeLabel);
  };

  if (!deviceData) return null;

  const latest = deviceData.readings.at(-1);
  const tempCritical = latest && (latest.temperature > 30 || latest.temperature < 15);
  const humCritical = latest && (latest.humidity > 70 || latest.humidity < 30);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[calc(100%-1rem)] sm:w-[580px] md:w-[680px] lg:w-[720px] max-h-[90vh] overflow-hidden p-0 gap-0 rounded-2xl"
      >
        {/* Accessible Title for Screen Readers */}
        <DialogTitle className="sr-only">
          Device Detail - {deviceData.name}
        </DialogTitle>

        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 truncate">
                {deviceData.name}
              </h2>
              <p className="text-sm text-slate-300 truncate">
                {deviceData.location} • {deviceData.id}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Export Button */}
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all active:scale-95 shadow-lg"
                title="Export to PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-4 sm:p-5 space-y-5">
          {/* Status Banner */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            deviceData.status === "online"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              deviceData.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                deviceData.status === "online" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              }`}>
                Device {deviceData.status === "online" ? "Online" : "Offline"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Last seen: {deviceData.lastSeen ? new Date(deviceData.lastSeen).toLocaleString("id-ID") : "-"}
              </p>
            </div>
          </div>

          {/* Current Readings - Responsive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Temperature Card */}
            <div className={`relative overflow-hidden rounded-xl p-5 ${
              tempCritical
                ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800"
            }`}>
              <div className="relative z-10">
                <p className={`text-xs font-semibold mb-2 ${
                  tempCritical ? "text-red-100" : "text-red-600 dark:text-red-400"
                }`}>
                  Temperature
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${
                    tempCritical ? "text-white" : "text-red-700 dark:text-red-400"
                  }`}>
                    {latest?.temperature ?? "--"}
                  </span>
                  <span className={`text-2xl font-semibold ${
                    tempCritical ? "text-red-100" : "text-red-600 dark:text-red-400"
                  }`}>
                    °C
                  </span>
                </div>
                {tempCritical && (
                  <div className="mt-2 flex items-center gap-2 text-red-100">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-medium">Critical Level</span>
                  </div>
                )}
              </div>
              <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${
                tempCritical ? "bg-white/10" : "bg-red-200/30 dark:bg-red-700/20"
              }`} />
            </div>

            {/* Humidity Card */}
            <div className={`relative overflow-hidden rounded-xl p-5 ${
              humCritical
                ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
                : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800"
            }`}>
              <div className="relative z-10">
                <p className={`text-xs font-semibold mb-2 ${
                  humCritical ? "text-yellow-100" : "text-blue-600 dark:text-blue-400"
                }`}>
                  Humidity
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${
                    humCritical ? "text-white" : "text-blue-700 dark:text-blue-400"
                  }`}>
                    {latest?.humidity ?? "--"}
                  </span>
                  <span className={`text-2xl font-semibold ${
                    humCritical ? "text-yellow-100" : "text-blue-600 dark:text-blue-400"
                  }`}>
                    %
                  </span>
                </div>
                {humCritical && (
                  <div className="mt-2 flex items-center gap-2 text-yellow-100">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-medium">Critical Level</span>
                  </div>
                )}
              </div>
              <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${
                humCritical ? "bg-white/10" : "bg-blue-200/30 dark:bg-blue-700/20"
              }`} />
            </div>
          </div>

          {/* Historical Data Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            {/* Section Header with Time Range Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Historical Data
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {deviceData.readings.length} data points
                </p>
              </div>

              {/* Time Range Selector */}
              <ModalTimeRangeSelector
                value={timeRange}
                onChange={handleTimeRangeChange}
              />
            </div>

            {/* Chart - Larger Height */}
            <div className="h-[320px] sm:h-[380px] md:h-[420px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 relative">
              {isLoadingData ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading data...</p>
                </div>
              ) : deviceData.readings.length > 0 ? (
                <DeviceDetailChart data={deviceData.readings} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <p className="text-sm font-medium">No data available</p>
                  <p className="text-xs mt-1">Try selecting a different time range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
