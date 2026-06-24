import { Alert } from "@/types/alert";

interface Props {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  isLoading?: boolean;
}

export default function AlertRow({ alert, onAcknowledge, isLoading }: Props) {
  const formattedTime = new Date(alert.createdAt).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {severity}
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            {severity}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-400">
            {severity}
          </span>
        );
    }
  };

  return (
    <tr className="border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
      <td className="whitespace-nowrap p-4 text-sm text-slate-600 dark:text-slate-400">
        {formattedTime}
      </td>
      <td className="whitespace-nowrap p-4 text-sm font-medium text-slate-900 dark:text-white">
        {alert.deviceId}
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-slate-600 dark:text-slate-400">
        {alert.location}
      </td>
      <td className="whitespace-nowrap p-4">
        {getSeverityBadge(alert.severity)}
      </td>
      <td
        className="max-w-xs truncate p-4 text-sm text-slate-600 dark:text-slate-400"
        title={alert.message}
      >
        {alert.message}
      </td>
      <td className="whitespace-nowrap p-4">
        {alert.acknowledged ? (
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
            Acknowledged
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            Active
          </span>
        )}
      </td>
      <td className="whitespace-nowrap p-4">
        {!alert.acknowledged ? (
          <button
            onClick={() => onAcknowledge(alert.id)}
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm 
                     transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                     disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px]"
          >
            {isLoading ? "Processing..." : "Acknowledge"}
          </button>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
        )}
      </td>
    </tr>
  );
}
