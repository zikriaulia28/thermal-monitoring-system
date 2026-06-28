interface Props {
  status: "online" | "offline";
}

export default function DeviceStatusBadge({ status }: Props) {
  const isOnline = status === "online";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold
        ${
          isOnline
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
    >
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </span>
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}
