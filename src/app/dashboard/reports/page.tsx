"use client";

import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { ReportType, AlertReportItem, ReportSummary, DetailedLogReport } from "@/types/reports";
import { Loader2, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { Toast, ToastProvider, useToast } from "@/components/ui/Toast";

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function ReportsContent() {
  const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();

  const [reportType, setReportType] = useState<ReportType>("summary");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const { showToast } = useToast();

  const { data, summary, isLoading } = useReportData({
    type: reportType,
    startDate,
    endDate,
    location: location || undefined,
    severity: severity || undefined,
    page: currentPage,
    limit: 50,
  });

  const reportTypes: { value: ReportType; label: string; icon: string }[] = [
    { value: "summary", label: "Daily Summary", icon: "📊" },
    { value: "detailed", label: "Detailed Logs", icon: "📋" },
    { value: "alerts", label: "Alerts Report", icon: "🚨" },
  ];

  const getTableColumns = (): string[] => {
    switch (reportType) {
      case "summary":
        return [
          "date",
          "location",
          "tempAvg",
          "tempMin",
          "tempMax",
          "humidityAvg",
          "alertCount",
        ];
      case "detailed":
        return ["date", "time", "device", "location", "temperature", "humidity"];
      case "alerts":
        return [
          "createdAt",
          "device",
          "location",
          "severity",
          "message",
          "acknowledged",
        ];
      default:
        return data.length > 0 ? Object.keys(data[0]) : [];
    }
  };

  const formatValue = (key: string, value: unknown): string => {
    if (typeof value === "number") {
      if (key === "tempAvg" || key === "tempMin" || key === "tempMax") return `${value.toFixed(2)}°C`;
      if (key === "humidityAvg" || key === "humidityMin" || key === "humidityMax") return `${value.toFixed(2)}%`;
      if (key === "temperature") return `${value.toFixed(2)}°C`;
      if (key === "humidity") return `${value.toFixed(2)}%`;
      if (key === "alertCount") return String(value);
      return value.toFixed(2);
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value || "-");
  };

  const formatColumnHeader = (col: string): string => {
    const labels: Record<string, string> = {
      date: "Date",
      time: "Time (WIB)",
      device: "Device",
      location: "Location",
      tempAvg: "Temp Avg (°C)",
      tempMin: "Temp Min (°C)",
      tempMax: "Temp Max (°C)",
      humidityAvg: "Humidity Avg (%)",
      humidityMin: "Humidity Min (%)",
      humidityMax: "Humidity Max (%)",
      temperature: "Temperature (°C)",
      humidity: "Humidity (%)",
      alertCount: "Alerts",
      createdAt: "Date & Time",
      severity: "Severity",
      message: "Message",
      acknowledged: "Status",
    };
    return labels[col] || col.replace(/([A-Z])/g, " $1").toUpperCase();
  };

  const splitDateTime = (dateTimeStr: string): { date: string; time: string } => {
    if (!dateTimeStr || dateTimeStr === "-") return { date: "-", time: "-" };
    // Format: "24/06/2026 14:30:25"
    const parts = dateTimeStr.split(" ");
    if (parts.length >= 2) {
      return { date: parts[0], time: parts[1] };
    }
    return { date: dateTimeStr, time: "-" };
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setExporting(format);
    try {
      const columns = getTableColumns();
      const formattedData = data.map((row: Record<string, unknown>) => {
        if (reportType === "detailed" && row.time) {
          // Split time into date and time for detailed logs
          const { date, time } = splitDateTime(String(row.time));
          return columns.reduce(
            (acc, col) => {
              if (col === "date") return { ...acc, [col]: date };
              if (col === "time") return { ...acc, [col]: time };
              return { ...acc, [col]: formatValue(col, row[col]) };
            },
            {} as Record<string, string>,
          );
        }
        
        return columns.reduce(
          (acc, col) => ({
            ...acc,
            [col]: formatValue(col, row[col]),
          }),
          {} as Record<string, string>,
        );
      });

      const filename = `${reportType}-report-${startDate}-${endDate}`;
      
      // Generate column labels
      const columnLabels = columns.map(col => formatColumnHeader(col));
      
      if (format === "csv") {
        exportToCSV(formattedData, filename, columnLabels);
        showToast("success", "CSV file downloaded successfully");
      } else {
        exportToPDF(formattedData, filename, columns, columnLabels);
        showToast("success", "PDF file downloaded successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast("error", "Failed to export file. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
          Generate and export system reports
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setReportType(type.value);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition ${
              reportType === type.value
                ? "bg-blue-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
          Filters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {reportType !== "alerts" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {reportType === "alerts" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-400">
            <strong>Period:</strong> {summary.period} •{" "}
            <strong>Records:</strong> {summary.totalRecords}
            {reportType === "alerts" && summary.critical !== undefined &&
              ` • Critical: ${summary.critical} • Warning: ${summary.warning} • Pending: ${summary.pending}`}
          </p>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleExport("csv")}
          disabled={isLoading || data.length === 0 || exporting !== null}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg flex items-center gap-2 transition"
        >
          {exporting === "csv" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">CSV</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleExport("pdf")}
          disabled={isLoading || data.length === 0 || exporting !== null}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium rounded-lg flex items-center gap-2 transition"
        >
          {exporting === "pdf" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Exporting...</span>
            </>
          ) : (
            <>
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Data Table - Card Layout for Mobile */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 sm:p-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center p-8 sm:p-12 text-slate-500 text-sm sm:text-base">
            <p>No data available for the selected filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
              {data.map((row: Record<string, unknown>, idx: number) => (
                <div key={idx} className="p-3 space-y-2">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    {reportType === "alerts" && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {String(row.severity)}
                      </span>
                    )}
                    {reportType === "summary" && (
                      <span className="text-xs font-medium text-slate-900 dark:text-white">
                        {String(row.date)}
                      </span>
                    )}
                    {reportType === "detailed" && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {String(row.time)}
                      </span>
                    )}
                    {row.acknowledged !== undefined && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.acknowledged
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {row.acknowledged ? "ACK" : "PENDING"}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Device:</span>
                      <span className="ml-1 text-slate-900 dark:text-white truncate">{String(row.device || row.location || "-")}</span>
                    </div>
                    {reportType === "summary" && (
                      <>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Temp:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{formatValue("tempAvg", row.tempAvg)}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Humidity:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{formatValue("humidityAvg", row.humidityAvg)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Alerts:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{String(row.alertCount || 0)}</span>
                        </div>
                      </>
                    )}
                    {reportType === "detailed" && (
                      <>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Device:</span>
                          <span className="ml-1 text-slate-900 dark:text-white truncate">{String(row.device || "-")}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Location:</span>
                          <span className="ml-1 text-slate-900 dark:text-white truncate">{String(row.location || "-")}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Temp:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{formatValue("temperature", row.temperature)}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Humidity:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{formatValue("humidity", row.humidity)}%</span>
                        </div>
                      </>
                    )}
                    {reportType === "alerts" && (
                      <>
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-slate-400">Device:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{String(row.device || "-")}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-slate-400">Location:</span>
                          <span className="ml-1 text-slate-900 dark:text-white">{String(row.location || "-")}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-slate-400">Message:</span>
                          <p className="text-slate-900 dark:text-white text-xs mt-0.5 line-clamp-2">{String(row.message || "-")}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {getTableColumns().map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
                      >
                        {formatColumnHeader(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.map((row: Record<string, unknown>, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      {getTableColumns().map((col) => (
                        <td
                          key={col}
                          className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-[150px] sm:max-w-none truncate"
                          title={String(row[col] || "")}
                        >
                          {col === "acknowledged" ? (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                row[col]
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {row[col] ? "ACK" : "PENDING"}
                            </span>
                          ) : col === "severity" ? (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                row[col] === "CRITICAL"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {String(row[col])}
                            </span>
                          ) : (
                            <span className="truncate block">{formatValue(col, row[col])}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {summary && summary.totalRecords > 50 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            Showing {(currentPage - 1) * 50 + 1} to{" "}
            {Math.min(currentPage * 50, summary.totalRecords)} of{" "}
            {summary.totalRecords} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              ← Prev
            </button>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {Math.ceil(summary.totalRecords / 50)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * 50 >= summary.totalRecords}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ToastProvider>
      <ReportsContent />
    </ToastProvider>
  );
}
