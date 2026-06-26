import { Alert } from "@/types/alert";
import { formatWIB } from "@/lib/formatWIB";

interface Props {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  isLoading?: boolean;
}

export default function AlertRow({ alert, onAcknowledge, isLoading }: Props) {
  const isCritical = alert.severity === "CRITICAL";
  const isAcknowledged = alert.acknowledged;

  const severityConfig = isCritical
    ? {
        icon: "🔴",
        label: "Critical",
        dot: "bg-red-500",
        pulse: "animate-pulse",
        rowAccent: "border-l-red-500",
        badgeBg: "bg-red-100 dark:bg-red-900/30",
        badgeText: "text-red-800 dark:text-red-400",
      }
    : {
        icon: "🟡",
        label: "Warning",
        dot: "bg-yellow-500",
        pulse: "",
        rowAccent: "border-l-yellow-500",
        badgeBg: "bg-yellow-100 dark:bg-yellow-900/30",
        badgeText: "text-yellow-800 dark:text-yellow-400",
      };

  const statusBadge = isAcknowledged ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
      <Check className="w-3 h-3" />
      Acknowledged
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
      <span className={`relative flex h-2 w-2`}>
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      Active
    </span>
  );

  return (
    <tr
      className={`border-b border-slate-200 transition-colors hover:bg-slate-50 
                 dark:border-slate-700 dark:hover:bg-slate-800/50
                 border-l-4 ${severityConfig.rowAccent}
                 ${!isAcknowledged ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}
    >
      {/* Time */}
      <td className="whitespace-nowrap p-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span title={formatWIB(alert.createdAt, "long")}>
            {formatWIB(alert.createdAt, "medium")}
          </span>
        </div>
      </td>

      {/* Device */}
      <td className="whitespace-nowrap p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            {alert.deviceId.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {alert.deviceId}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {alert.location}
            </div>
          </div>
        </div>
      </td>

      {/* Severity */}
      <td className="whitespace-nowrap p-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${severityConfig.badgeBg} ${severityConfig.badgeText}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${severityConfig.dot} ${!isAcknowledged ? severityConfig.pulse : ""}`} />
          {alert.severity}
        </span>
      </td>

      {/* Message */}
      <td
        className="max-w-xs truncate p-4 text-sm text-slate-600 dark:text-slate-400"
        title={alert.message}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{severityConfig.icon}</span>
          <span>{alert.message}</span>
        </div>
      </td>

      {/* Status */}
      <td className="whitespace-nowrap p-4">
        {statusBadge}
      </td>

      {/* Action */}
      <td className="whitespace-nowrap p-4">
        {!isAcknowledged ? (
          <button
            onClick={() => onAcknowledge(alert.id)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
                     px-3 py-1.5 text-xs font-medium text-white shadow-sm 
                     transition-all duration-200 
                     hover:from-blue-600 hover:to-blue-700
                     hover:shadow-md active:scale-95
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                     dark:focus:ring-offset-slate-800
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[36px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Acknowledge
              </>
            )}
          </button>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600 italic">Done</span>
        )}
      </td>
    </tr>
  );
}

// ── Inline icons to avoid extra imports ──
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
