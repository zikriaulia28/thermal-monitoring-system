"use client";

import AlertRow from "./AlertRow";
import { Alert } from "@/types/alert";

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
  pagination?: PaginationProps;
}

export default function AlertTable({
  alerts,
  onAcknowledge,
  pagination,
}: Props) {
  return (
    <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700">
      {/* Header - Hidden di mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <th className="p-4">Time</th>
              <th className="p-4">Device</th>
              <th className="p-4">Location</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Message</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={onAcknowledge}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No alerts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ CARD LAYOUT untuk Mobile */}
      <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {/* Header Card: Severity + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Severity Badge */}
                  {alert.severity === "CRITICAL" ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {alert.severity}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {alert.severity}
                    </span>
                  )}

                  {/* Status Badge */}
                  {alert.acknowledged ? (
                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                      Acknowledged
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
                      Active
                    </span>
                  )}
                </div>

                {/* Time */}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(alert.createdAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Device & Location */}
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {alert.deviceId}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  📍 {alert.location}
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {alert.message}
              </p>

              {/* Action Button */}
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No alerts found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
          {/* Info Text */}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Showing{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {(pagination.currentPage - 1) * pagination.alertsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(
                pagination.currentPage * pagination.alertsPerPage,
                pagination.totalAlerts,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {pagination.totalAlerts}
            </span>{" "}
            results
          </p>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 
                       text-sm font-medium text-slate-700 dark:text-slate-300
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       hover:bg-white dark:hover:bg-slate-800 transition-colors
                       min-h-[44px]"
            >
              Previous
            </button>

            <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 
                       text-sm font-medium text-slate-700 dark:text-slate-300
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       hover:bg-white dark:hover:bg-slate-800 transition-colors
                       min-h-[44px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
