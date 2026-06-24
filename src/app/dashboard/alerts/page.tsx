"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import debounce from "lodash.debounce";

import AlertSummary from "@/components/alerts/AlertSummary";
import AlertTable from "@/components/alerts/AlertTable";
import AlertFilter from "@/components/alerts/AlertFilter";
import { ToastProvider, useToast } from "@/components/ui/Toast";

import { acknowledgeAlert, getAlerts } from "@/services/alertService";

function AlertsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [ackLoadingId, setAckLoadingId] = useState<string | null>(null);

  const { showToast } = useToast();

  // Debounce search input
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearch(value);
    }, 300),
    [],
  );

  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

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
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Alerts
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base mt-1">
          Realtime Alarm & Event Monitoring
        </p>
      </div>

      {/* Alert Summary */}
      {summary && (
        <div className="mb-4 sm:mb-6">
          <AlertSummary summary={summary} />
        </div>
      )}

      {/* Alert Filter */}
      <div className="mb-4 sm:mb-6">
        <AlertFilter
          search={search}
          setSearch={handleSearchChange}
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
      </div>

      {/* Loading State */}
      {isLoading && !response && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Alert Table & Pagination */}
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
