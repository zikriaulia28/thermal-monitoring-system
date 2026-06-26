"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";

import AlertSummary from "@/components/alerts/AlertSummary";
import AlertTable from "@/components/alerts/AlertTable";
import AlertFilter from "@/components/alerts/AlertFilter";
import { ToastProvider, useToast } from "@/components/ui/Toast";

import { acknowledgeAlert, getAlerts } from "@/services/alertService";
import { AlertTriangle, RefreshCw } from "lucide-react";

function AlertsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);

  const { showToast } = useToast();

  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    ["alerts", currentPage, search, severity, status],
    () =>
      getAlerts(currentPage, 10, {
        search,
        severity,
        status,
      }),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  const alerts = response?.data ?? [];
  const totalAlerts = response?.pagination?.total || 0;
  const totalPages = Math.ceil(totalAlerts / 10);
  const summary = response?.summary;

  const handleAcknowledge = useCallback(
    async (id: string) => {
      setAckLoadingId(id);

      if (!response) {
        showToast("error", "Gagal mengubah status alert.");
        setAckLoadingId(null);
        return;
      }

      const previousData = response;

      // Optimistic update
      mutate(
        {
          ...response,
          data: response.data.map((alert) =>
            alert.id === id ? { ...alert, acknowledged: true } : alert,
          ),
          summary: {
            ...response.summary,
            active: Math.max(0, response.summary.active - 1),
            ack: response.summary.ack + 1,
            critical: Math.max(
              0,
              response.summary.critical -
                (response.data.find((a) => a.id === id)?.severity === "CRITICAL"
                  ? 1
                  : 0),
            ),
          },
        },
        false,
      );

      try {
        await acknowledgeAlert(id);
        mutate();
        showToast("success", "Alert berhasil di-acknowledge.");
      } catch (error) {
        console.error("Failed to acknowledge:", error);
        mutate(previousData, false);
        showToast("error", "Gagal mengubah status alert. Silakan coba lagi.");
      } finally {
        setAckLoadingId(null);
      }
    },
    [response, mutate, showToast],
  );

  // Reset to page 1 when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Alerts
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Realtime Alarm & Event Monitoring
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                   border border-slate-300 dark:border-slate-600
                   text-sm font-medium text-slate-700 dark:text-slate-300
                   hover:bg-slate-50 dark:hover:bg-slate-800
                   transition-colors min-h-[44px] shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── SUMMARY CARDS ────────────────────────────────── */}
      {summary && (
        <AlertSummary summary={summary} />
      )}

      {/* ── FILTERS ──────────────────────────────────────── */}
      <AlertFilter
        search={search}
        setSearch={(val) => {
          setSearch(val);
          handleFilterChange();
        }}
        severity={severity}
        setSeverity={(val) => {
          setSeverity(val);
          handleFilterChange();
        }}
        status={status}
        setStatus={(val) => {
          setStatus(val);
          handleFilterChange();
        }}
      />

      {/* ── LOADING STATE ────────────────────────────────── */}
      {isLoading && !response && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="w-12 h-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Memuat alerts...</p>
        </div>
      )}

      {/* ── ALERT TABLE ──────────────────────────────────── */}
      {!isLoading && (
        <AlertTable
          alerts={alerts}
          onAcknowledge={handleAcknowledge}
          ackLoadingId={ackLoadingId}
          pagination={
            totalPages > 1
              ? {
                  currentPage,
                  totalPages,
                  totalAlerts,
                  alertsPerPage: 10,
                  onPageChange: setCurrentPage,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <ToastProvider>
      <AlertsContent />
    </ToastProvider>
  );
}
