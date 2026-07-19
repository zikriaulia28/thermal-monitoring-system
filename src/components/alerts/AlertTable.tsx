"use client";

import AlertRow from "./AlertRow";
import { Alert } from "@/types/alert";
import { formatWIB, formatDurationSince } from "@/lib/formatWIB";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalAlerts: number;
  alertsPerPage: number;
  onPageChange: (page: number) => void;
}

interface Props {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  ackLoadingId?: string | null;
  pagination?: PaginationProps;
}

export default function AlertTable({
  alerts,
  onAcknowledge,
  ackLoadingId,
  pagination,
}: Props) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* ── EMPTY STATE ──────────────────────────────────── */}
      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Tidak Ada Alert
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Semua alert telah di-acknowledge atau belum ada alert yang terpicu. Sistem berjalan normal.
          </p>
        </div>
      )}

      {/* ── DESKTOP TABLE ────────────────────────────────── */}
      {alerts.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Time</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={onAcknowledge}
                    isLoading={ackLoadingId === alert.id}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS ──────────────────────────────── */}
          <div className="md:hidden divide-y divide-border">
            {alerts.map((alert) => {
              const isCritical = alert.severity === "CRITICAL";
              const isAcknowledged = alert.acknowledged;

              const severityColor = isCritical
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";

              return (
                <div
                  key={alert.id}
                  className={`p-4 space-y-3 transition-colors ${
                    !isAcknowledged
                      ? "bg-red-50/30 dark:bg-red-950/10 border-l-4 border-l-red-500"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  {/* Header: Severity + Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityColor}`}>
                        {isCritical ? "🔴" : "🟡"} {alert.severity}
                      </span>
                      {!isAcknowledged && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatWIB(alert.createdAt, "medium")}
                    </span>
                  </div>

                  {/* Device + Location */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                      {alert.deviceId.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground text-sm truncate">
                        {alert.deviceId}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        📍 {alert.location}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">{isCritical ? "🔴" : "🟡"}</span>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {alert.message}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-data mt-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatWIB(alert.createdAt, "medium")} · {formatDurationSince(alert.createdAt)}
                  </div>

                  {/* Action */}
                  {!isAcknowledged && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      disabled={ackLoadingId === alert.id}
                      className="w-full flex items-center justify-center gap-2 rounded-lg
                               bg-[var(--primary)]
                                                              px-3 py-2.5 text-sm font-medium text-white shadow-sm
                                                              transition-all duration-200
                                                              hover:brightness-110
                               hover:shadow-md active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      {ackLoadingId === alert.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Acknowledge
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── PAGINATION ──────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 py-4 bg-muted/50">
          {/* Info Text */}
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {(pagination.currentPage - 1) * pagination.alertsPerPage + 1}
            </span>
            {" – "}
            <span className="font-semibold text-foreground">
              {Math.min(
                pagination.currentPage * pagination.alertsPerPage,
                pagination.totalAlerts,
              )}
            </span>
            {" dari "}
            <span className="font-semibold text-foreground">
              {pagination.totalAlerts}
            </span>
          </p>

          {/* Navigation */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                       border border-border
                                              text-sm font-medium text-foreground/80
                                              disabled:opacity-50 disabled:cursor-not-allowed
                                              hover:bg-card
                       transition-colors min-h-[40px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers (max 5) */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers(pagination.currentPage, pagination.totalPages).map(
                (pageNum, i) =>
                  pageNum === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1 text-sm text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => pagination.onPageChange(pageNum as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                        ${
                          pageNum === pagination.currentPage
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ),
              )}
            </div>

            {/* Mobile: just show page indicator */}
            <span className="sm:hidden px-2 py-1 text-sm text-muted-foreground">
              {pagination.currentPage} / {pagination.totalPages}
            </span>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                       border border-border
                                              text-sm font-medium text-foreground/80
                                              disabled:opacity-50 disabled:cursor-not-allowed
                                              hover:bg-card
                       transition-colors min-h-[40px]"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
