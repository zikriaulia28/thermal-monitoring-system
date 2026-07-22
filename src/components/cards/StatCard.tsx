import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: "online" | "offline";
  isLoading?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  Device: "var(--primary)",
  Online: "var(--cpems-online)",
  Offline: "var(--cpems-offline)",
  Temperature: "var(--cpems-temp)",
  Humidity: "var(--cpems-humidity)",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  status,
  isLoading = false,
}: StatCardProps) {
  const isOfflineAlert = status === "offline" && value !== "0" && value !== 0;

  // Pick accent color based on title keywords
  const accentKey = Object.keys(COLOR_MAP).find((k) =>
    title.toLowerCase().includes(k.toLowerCase()),
  );
  const accentColor = COLOR_MAP[accentKey || "Device"];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        isOfflineAlert
          ? "border-[var(--cpems-offline)]/30 bg-[var(--cpems-offline)]/5"
          : "border-border"
      }`}
    >
      {/* Left accent bar — solid color, no gradient */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
        style={{ backgroundColor: isOfflineAlert ? "var(--cpems-offline)" : accentColor }}
      />

      <div className="flex items-start justify-between pl-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
            {title}
          </p>
          {isLoading ? (
            <div className="mt-2 h-7 sm:h-8 w-20 bg-muted rounded animate-pulse" />
          ) : (
            <h2
              className={`font-data mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight ${
                isOfflineAlert
                  ? "text-[var(--cpems-offline)]"
                  : "text-foreground"
              }`}
            >
              {value}
            </h2>
          )}
        </div>

        {/* Flat icon container — no gradient */}
        <div
          className="shrink-0 ml-3 inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          <Icon size={20} className="sm:size-6" />
        </div>
      </div>

      {isOfflineAlert && !isLoading && (
        <p className="text-xs text-[var(--cpems-offline)] mt-2 flex items-center gap-1 pl-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--cpems-offline)] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cpems-offline)]" />
          </span>
          Ada device offline
        </p>
      )}
    </div>
  );
}
