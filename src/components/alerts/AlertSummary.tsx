import { Bell, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

interface SummaryData {
  total: number;
  active: number;
  ack: number;
  critical: number;
}

interface Props {
  summary: SummaryData;
}

const COLOR_MAP: Record<string, string> = {
  total: "var(--primary)",
  active: "var(--cpems-offline)",
  ack: "var(--cpems-online)",
  critical: "var(--cpems-warning)",
};

const statCards = [
  { label: "Total Alert", valueKey: "total" as const, icon: Bell, key: "total" },
  { label: "Active", valueKey: "active" as const, icon: Activity, key: "active" },
  { label: "Acknowledged", valueKey: "ack" as const, icon: CheckCircle2, key: "ack" },
  { label: "Critical", valueKey: "critical" as const, icon: AlertTriangle, key: "critical" },
];

export default function AlertSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const value = summary[stat.valueKey];
        const accent = COLOR_MAP[stat.key];
        return (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
              style={{ backgroundColor: accent }}
            />
            <div className="pl-4">
              <div
                className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg text-white shadow-sm"
                style={{ backgroundColor: accent }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-data text-2xl sm:text-3xl font-bold text-foreground">
                {value}
              </div>
              <div className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
