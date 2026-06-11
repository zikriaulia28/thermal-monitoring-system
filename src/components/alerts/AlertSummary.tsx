interface SummaryData {
  total: number;
  active: number;
  ack: number;
  critical: number;
}

interface Props {
  summary: SummaryData;
}

export default function AlertSummary({ summary }: Props) {
  const stats = [
    {
      label: "Total Alert",
      value: summary.total,
      className: "text-slate-900 dark:text-white",
    },
    {
      label: "Active",
      value: summary.active,
      className: "text-red-500",
    },
    {
      label: "Acknowledged",
      value: summary.ack,
      className: "text-green-500",
    },
    {
      label: "Critical",
      value: summary.critical,
      className: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border bg-white p-3 sm:p-4 lg:p-5 shadow-sm 
                   dark:bg-slate-800 dark:border-slate-700"
        >
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {stat.label}
          </div>
          <div
            className={`mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-bold ${stat.className}`}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
