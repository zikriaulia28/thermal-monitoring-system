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

const statCards = [
  {
    label: "Total Alert",
    valueKey: "total" as const,
    icon: Bell,
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    textClass: "text-blue-900 dark:text-blue-100",
  },
  {
    label: "Active",
    valueKey: "active" as const,
    icon: Activity,
    gradient: "from-rose-500 to-red-600",
    shadow: "shadow-red-500/20",
    textClass: "text-red-900 dark:text-red-100",
  },
  {
    label: "Acknowledged",
    valueKey: "ack" as const,
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-green-500/20",
    textClass: "text-emerald-900 dark:text-emerald-100",
  },
  {
    label: "Critical",
    valueKey: "critical" as const,
    icon: AlertTriangle,
    gradient: "from-orange-500 to-amber-600",
    shadow: "shadow-amber-500/20",
    textClass: "text-amber-900 dark:text-amber-100",
  },
];

export default function AlertSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const value = summary[stat.valueKey];
        return (
          <div
            key={stat.label}
            className="relative group overflow-hidden rounded-xl border bg-white p-4 shadow-sm 
                       dark:bg-slate-800 dark:border-slate-700
                       hover:shadow-md transition-all duration-200"
          >
            {/* Gradient Accent Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
            />

            {/* Icon */}
            <div
              className={`mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg
                         bg-gradient-to-br ${stat.gradient} ${stat.shadow}
                         text-white shadow-sm`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Value */}
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </div>

            {/* Label */}
            <div className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
