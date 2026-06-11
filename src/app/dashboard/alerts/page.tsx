"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";

import AlertSummary from "@/components/alerts/AlertSummary";
import AlertTable from "@/components/alerts/AlertTable";
import AlertFilter from "@/components/alerts/AlertFilter";

import { acknowledgeAlert, getAlerts } from "@/services/alertService";

export default function AlertsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 10;

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");

  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    ["alerts", currentPage, alertsPerPage],
    () => getAlerts(currentPage, alertsPerPage),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  const alerts = response?.data ?? [];
  const totalAlerts = response?.pagination?.total || 0;
  const totalPages = Math.ceil(totalAlerts / alertsPerPage);
  const summary = response?.summary;

  const handleAcknowledge = useCallback(
    async (id: string) => {
      if (!response) return;

      const previousData = response;

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
      } catch (error) {
        console.error("Failed to acknowledge:", error);
        mutate(previousData, false);
        alert("Gagal mengubah status alert. Silakan coba lagi.");
      }
    },
    [response, mutate],
  );

  const filteredAlerts = alerts.filter((alert) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      alert.deviceId.toLowerCase().includes(keyword) ||
      alert.location.toLowerCase().includes(keyword) ||
      alert.message.toLowerCase().includes(keyword);
    const matchSeverity = severity === "" || alert.severity === severity;
    const matchStatus =
      status === "" ||
      (status === "active" && !alert.acknowledged) ||
      (status === "ack" && alert.acknowledged);

    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    // ✅ Padding responsif
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
          setSearch={setSearch}
          severity={severity}
          setSeverity={setSeverity}
          status={status}
          setStatus={setStatus}
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
          alerts={filteredAlerts}
          onAcknowledge={handleAcknowledge}
          pagination={
            totalPages > 1
              ? {
                  currentPage,
                  totalPages,
                  totalAlerts,
                  alertsPerPage,
                  onPageChange: setCurrentPage,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
