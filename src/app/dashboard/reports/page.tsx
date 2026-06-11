"use client";

// ✅ PERBAIKAN 1: Hapus useEffect dari import
import { useState } from "react";
import { useReportData } from "@/hooks/useReportData";
import { ReportType } from "@/types/reports";
import { Loader2, Download, FileJson } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function ReportsPage() {
  const { startDate: defaultStart, endDate: defaultEnd } =
    getDefaultDateRange();

  const [reportType, setReportType] = useState<ReportType>("summary");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
        return ["time", "device", "location", "temperature", "humidity"];
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
        return Object.keys((data as Record<string, unknown>[])?.[0] || {});
    }
  };

  const formatValue = (key: string, value: unknown): string => {
    if (typeof value === "number") return value.toFixed(2);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value || "-");
  };

  const handleExport = (format: "csv" | "pdf") => {
    const columns = getTableColumns();
    // ✅ PERBAIKAN 2: Ganti 'any' dengan 'Record<string, unknown>'
    const formattedData = data.map((row: Record<string, unknown>) =>
      columns.reduce(
        (acc, col) => ({
          ...acc,
          [col]: formatValue(col, row[col]),
        }),
        {},
      ),
    );

    const filename = `${reportType}-report-${startDate}-${endDate}`;
    if (format === "csv") {
      exportToCSV(formattedData, filename);
    } else {
      exportToPDF(formattedData, filename, columns);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
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
            className={`px-4 py-2 rounded-lg font-medium transition ${
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
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Filters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {reportType !== "alerts" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {reportType === "alerts" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            <strong>Period:</strong> {summary.period} •{" "}
            <strong>Records:</strong> {summary.totalRecords}
            {reportType === "alerts" &&
              ` • Critical: ${summary.critical} • Warning: ${summary.warning} • Pending: ${summary.pending}`}
          </p>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleExport("csv")}
          disabled={isLoading || data.length === 0}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>

        <button
          onClick={() => handleExport("pdf")}
          disabled={isLoading || data.length === 0}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 transition"
        >
          <FileJson className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-slate-500">
            <p>No data available for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {getTableColumns().map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {col.replace(/([A-Z])/g, " $1").toUpperCase()}
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
                        className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
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
                            {/* ✅ PERBAIKAN 3: Konversi unknown ke string */}
                            {String(row[col])}
                          </span>
                        ) : (
                          formatValue(col, row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {summary && summary.totalRecords > 50 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * 50 + 1} to{" "}
            {Math.min(currentPage * 50, summary.totalRecords)} of{" "}
            {summary.totalRecords} records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * 50 >= summary.totalRecords}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
