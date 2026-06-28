interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    online: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    offline: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  const label = status === "online" ? "Online" : status === "offline" ? "Offline" : status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {status === "online" && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            status === "online" ? "bg-green-500" : status === "offline" ? "bg-red-500" : "bg-slate-500"
          }`}
        />
      </span>
      {label}
    </span>
  );
}
