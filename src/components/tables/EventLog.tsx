"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { formatWIB, formatDurationSince } from "@/lib/formatWIB";

type Severity = "CRITICAL" | "WARNING" | "INFO" | string;

interface AlertItem {
  id: string;
  deviceId: string;
  location: string;
  type: string;
  message: string;
  severity: Severity;
  createdAt: string;
  acknowledged: boolean;
}

interface EventLogProps {
  alerts: AlertItem[];
  isLoading?: boolean;
}

const SEV_CONFIG: Record<string, { label: string; cls: string; Icon: typeof Info }> = {
  CRITICAL: { label: "CRIT", cls: "bg-[var(--cpems-offline)]/10 text-[var(--cpems-offline)] border border-[var(--cpems-offline)]/30", Icon: ShieldAlert },
  WARNING: { label: "WARN", cls: "bg-[var(--cpems-warning)]/10 text-[var(--cpems-warning)] border border-[var(--cpems-warning)]/30", Icon: AlertTriangle },
  INFO: { label: "INFO", cls: "bg-[var(--cpems-online)]/10 text-[var(--cpems-online)] border border-[var(--cpems-online)]/30", Icon: Info },
};

export default function EventLog({ alerts, isLoading = false }: EventLogProps) {
  const sev = (s: Severity) => SEV_CONFIG[s?.toUpperCase()] ?? SEV_CONFIG.INFO;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            Event Log
          </h2>
          <Link
            href="/dashboard/alerts"
            className="text-xs font-medium text-[var(--primary)] hover:underline whitespace-nowrap"
          >
            Lihat Semua →
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {alerts.length} event{alerts.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-auto max-h-[400px]">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground font-data">
            Memuat event…
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Tidak ada event</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.map((a) => {
              const s = sev(a.severity);
              const Icon = s.Icon;
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className={`shrink-0 mt-0.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold font-data ${s.cls}`}>
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {a.location}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground font-data whitespace-nowrap">
                        {formatWIB(a.createdAt, "medium")} · {formatDurationSince(a.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 break-words">
                      {a.message}
                    </p>
                  </div>
                  {a.acknowledged && (
                    <span className="shrink-0 text-[10px] text-muted-foreground font-data">✓</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
