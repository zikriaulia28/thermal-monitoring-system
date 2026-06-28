import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: "online" | "offline";
  isLoading?: boolean;
}

const GRADIENT_MAP: Record<string, string> = {
  Device: "from-blue-500 to-indigo-600 shadow-blue-500/20",
  Online: "from-emerald-500 to-green-600 shadow-green-500/20",
  Offline: "from-red-500 to-rose-600 shadow-red-500/20",
  Temperature: "from-amber-500 to-orange-600 shadow-amber-500/20",
  Humidity: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  status,
  isLoading = false,
}: StatCardProps) {
  const isOfflineAlert = status === "offline" && value !== "0" && value !== 0;

  // Pick gradient based on title keywords
  const gradKey = Object.keys(GRADIENT_MAP).find((k) =>
    title.toLowerCase().includes(k.toLowerCase()),
  );
  const gradient = GRADIENT_MAP[gradKey || "Device"];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800 dark:border-slate-700 ${
        isOfflineAlert
          ? "border-red-300 bg-red-50/50 dark:bg-red-950/10 dark:border-red-800"
          : ""
      }`}
    >
      {/* Accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isOfflineAlert
            ? "from-red-500 to-rose-500"
            : gradient?.replace("shadow-", "").split(" ")[0]
            || "from-blue-500 to-indigo-600"
        }`}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
            {title}
          </p>
          {isLoading ? (
            <div className="mt-2 h-7 sm:h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            <h2
              className={`mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight ${
                isOfflineAlert
                  ? "text-red-700 dark:text-red-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {value}
            </h2>
          )}
        </div>

        <div
          className={`shrink-0 ml-3 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl
                     bg-gradient-to-br ${gradient || "from-blue-500 to-indigo-600"}
                     text-white shadow-sm`}
        >
          <Icon size={20} className="sm:size-6" />
        </div>
      </div>

      {isOfflineAlert && !isLoading && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Ada device offline
        </p>
      )}
    </div>
  );
}
