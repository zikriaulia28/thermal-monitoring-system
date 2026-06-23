export type MonitoringTimeRange = "1h" | "6h" | "12h" | "24h";

export interface MonitoringTimeRangeOption {
  value: MonitoringTimeRange;
  label: string;
  hours: number;
}

export interface MonitoringChartData {
  time: string;
  PDB?: number | null;
  UPS?: number | null;
  BATTERY?: number | null;
}

export const MONITORING_TIME_RANGE_OPTIONS: MonitoringTimeRangeOption[] = [
  {
    value: "1h",
    label: "Last 1 Hour",
    hours: 1,
  },
  {
    value: "6h",
    label: "Last 6 Hours",
    hours: 6,
  },
  {
    value: "12h",
    label: "Last 12 Hours",
    hours: 12,
  },
  {
    value: "24h",
    label: "Last 24 Hours",
    hours: 24,
  },
];

export function getMonitoringDateRange(range: MonitoringTimeRange): { from: Date; to: Date } {
  const now = new Date();
  const option = MONITORING_TIME_RANGE_OPTIONS.find((opt) => opt.value === range);
  
  if (!option) {
    return { from: new Date(now.getTime() - 60 * 60 * 1000), to: now };
  }

  const from = new Date(now.getTime() - option.hours * 60 * 60 * 1000);
  return { from, to: now };
}
