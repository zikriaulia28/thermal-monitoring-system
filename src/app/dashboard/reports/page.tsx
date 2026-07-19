"use client";

import { useState, useMemo } from "react";
import { useReportData } from "@/hooks/useReportData";
import { ReportType } from "@/types/reports";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  FileText,
  Download,
  FileJson,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  AlertTriangle,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function getDefaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function ReportsContent() {
  usePageTitle("Reports");
  const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();

  const [reportType, setReportType] = useState<ReportType>("summary");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const { showToast } = useToast();

  const splitDateTime = (dateTimeStr: string): { date: string; time: string } => {
    if (!dateTimeStr || dateTimeStr === "-") return { date: "-", time: "-" };
    const parts = dateTimeStr.split(" ");
    if (parts.length >= 2) {
      const time = parts[1].length > 5 ? parts[1].slice(0, 5) : parts[1];
      return { date: parts[0], time };
    }
    return { date: dateTimeStr, time: "-" };
  };

  const { data, summary, isLoading } = useReportData({
    type: reportType,
    startDate,
    endDate,
    location: location || undefined,
    severity: severity || undefined,
    page: currentPage,
    limit: 50,
  });

  // Transform data for detailed view: split time into date & time columns
  const displayData = useMemo(() => {
    if (reportType === "detailed") {
      return data.map((row: Record<string, unknown>) => {
        const { date, time } = splitDateTime(String(row.time ?? ""));
        return { ...row, date, time };
      });
    }
    return data;
  }, [data, reportType]);

  const reportTypes: { value: ReportType; label: string; icon: React.ReactNode }[] = [
    { value: "summary", label: "Ringkasan Harian", icon: <Calendar className="w-4 h-4" /> },
    { value: "detailed", label: "Log Detail", icon: <FileJson className="w-4 h-4" /> },
    { value: "alerts", label: "Laporan Alert", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const getTableColumns = (): string[] => {
    switch (reportType) {
      case "summary":
        return ["date", "location", "tempAvg", "tempMin", "tempMax", "humidityAvg", "alertCount"];
      case "detailed":
        return ["date", "time", "device", "location", "temperature", "humidity"];
      case "alerts":
        return ["createdAt", "device", "location", "severity", "message", "acknowledged"];
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
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    return String(value || "-");
  };

  const formatColumnHeader = (col: string): string => {
    const labels: Record<string, string> = {
      date: "Tanggal",
      time: "Waktu (WIB)",
      device: "Device",
      location: "Lokasi",
      tempAvg: "Suhu Rata-rata (°C)",
      tempMin: "Suhu Min (°C)",
      tempMax: "Suhu Max (°C)",
      humidityAvg: "Kelembaban Rata-rata (%)",
      humidityMin: "Kelembaban Min (%)",
      humidityMax: "Kelembaban Max (%)",
      temperature: "Suhu (°C)",
      humidity: "Kelembaban (%)",
      alertCount: "Alert",
      createdAt: "Tanggal & Waktu",
      severity: "Severity",
      message: "Pesan",
      acknowledged: "Status",
    };
    return labels[col] || col;
  };

    const handleExport = async (format: "csv" | "pdf") => {
    setExporting(format);
    try {
      const columns = getTableColumns();
      const formattedData = data.map((row: Record<string, unknown>) => {
        if (reportType === "detailed" && row.time) {
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
          (acc, col) => ({ ...acc, [col]: formatValue(col, row[col]) }),
          {} as Record<string, string>,
        );
      });

      const filename = `${reportType}-report-${startDate}-${endDate}`;
      const columnLabels = columns.map((col) => formatColumnHeader(col));

      if (format === "csv") {
        exportToCSV(formattedData, filename, columnLabels);
        showToast("success", "CSV berhasil didownload");
      } else {
        exportToPDF(formattedData, filename, columns, columnLabels);
        showToast("success", "PDF berhasil didownload");
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast("error", "Gagal export file. Coba lagi.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Reports
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Generate dan export laporan sistem
            </p>
          </div>
        </div>
      </div>

      {/* Report Type Pill Buttons */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => {
          const isActive = reportType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => { setReportType(type.value); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-card border border-border text-foreground hover:border-[var(--primary)] hover:shadow-sm"
              }`}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-xl border bg-card border-border shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)]" />
        <div className="p-4 sm:p-6 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Filter Laporan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl dark:bg-card dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-xl dark:bg-card dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {reportType !== "alerts" && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lokasi</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter lokasi..."
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl dark:bg-card dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            )}

            {reportType === "alerts" && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Severity</label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={severity}
                    onChange={(e) => { setSeverity(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-xl dark:bg-card dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                  >
                    <option value="">Semua Severity</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="rounded-xl border bg-card shadow-sm p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Periode:</span>
              <span className="font-semibold text-foreground">{summary.period}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Total Record:</span>
              <span className="font-semibold text-foreground">{summary.totalRecords}</span>
            </div>
            {reportType === "alerts" && summary.critical !== undefined && (
              <>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--cpems-offline)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--cpems-offline)]" /> Critical: {summary.critical}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--cpems-warning)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--cpems-warning)]" /> Warning: {summary.warning}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Pending: {summary.pending}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleExport("csv")}
          disabled={isLoading || data.length === 0 || exporting !== null}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          {exporting === "csv" ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Download CSV</span>
        </button>

        <button
          onClick={() => handleExport("pdf")}
          disabled={isLoading || data.length === 0 || exporting !== null}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          {exporting === "pdf" ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileJson className="w-4 h-4" />
          )}
          <span>Download PDF</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-14">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-muted" />
              <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-muted-foreground mt-3">Memuat data laporan...</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-14">
            <div className="p-3 rounded-xl bg-muted mb-3">
              <Search className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground">Tidak Ada Data</p>
            <p className="text-xs text-muted-foreground mt-1">Coba ubah filter atau rentang tanggal</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-border">
              {displayData.map((row: Record<string, unknown>, idx: number) => (
                <div key={idx} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    {reportType === "alerts" && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.severity === "CRITICAL"
                            ? "bg-[var(--cpems-offline)]/10 text-[var(--cpems-offline)]"
                            : "bg-[var(--cpems-warning)]/10 text-[var(--cpems-warning)]"
                        }`}
                      >
                        {String(row.severity)}
                      </span>
                    )}
                    {reportType === "summary" && (
                      <span className="text-xs font-medium text-foreground">{String(row.date)}</span>
                    )}
                    {reportType === "detailed" && (
                      <span className="text-xs text-muted-foreground">{String(row.time)}</span>
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
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Device:</span>
                      <span className="ml-1 text-foreground truncate">{String(row.device || row.location || "-")}</span>
                    </div>
                    {reportType === "summary" && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Suhu:</span>
                          <span className="ml-1 text-foreground">{formatValue("tempAvg", row.tempAvg)}°C</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kelembaban:</span>
                          <span className="ml-1 text-foreground">{formatValue("humidityAvg", row.humidityAvg)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Alert:</span>
                          <span className="ml-1 text-foreground">{String(row.alertCount || 0)}</span>
                        </div>
                      </>
                    )}
                    {reportType === "detailed" && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Device:</span>
                          <span className="ml-1 text-foreground truncate">{String(row.device || "-")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lokasi:</span>
                          <span className="ml-1 text-foreground truncate">{String(row.location || "-")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Suhu:</span>
                          <span className="ml-1 text-foreground">{formatValue("temperature", row.temperature)}°C</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kelembaban:</span>
                          <span className="ml-1 text-foreground">{formatValue("humidity", row.humidity)}%</span>
                        </div>
                      </>
                    )}
                    {reportType === "alerts" && (
                      <>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Device:</span>
                          <span className="ml-1 text-foreground">{String(row.device || "-")}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Lokasi:</span>
                          <span className="ml-1 text-foreground">{String(row.location || "-")}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Pesan:</span>
                          <p className="text-foreground text-xs mt-0.5 line-clamp-2">{String(row.message || "-")}</p>
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
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {getTableColumns().map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {formatColumnHeader(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayData.map((row: Record<string, unknown>, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                      {getTableColumns().map((col) => (
                        <td
                          key={col}
                          className="px-4 py-3 text-sm text-foreground max-w-[150px] sm:max-w-none truncate"
                          title={String(row[col] || "")}
                        >
                          {col === "acknowledged" ? (
                              <span className={row[col] ? "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}>
                                {row[col] ? "ACK" : "PENDING"}
                              </span>
                            ) : col === "severity" ? (
                              <span className={row[col] === "CRITICAL" ? "px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Menampilkan {(currentPage - 1) * 50 + 1} – {Math.min(currentPage * 50, summary.totalRecords)} dari {summary.totalRecords} record
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              Halaman {currentPage} / {Math.ceil(summary.totalRecords / 50)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * 50 >= summary.totalRecords}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
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
