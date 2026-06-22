export type TimeRange = 
  | "realtime" 
  | "1d" 
  | "7d" 
  | "30d" 
  | "90d" 
  | "custom";

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
  description: string;
  hours: number;
}

export interface DateRangeFilter {
  range: TimeRange;
  from?: Date;
  to?: Date;
}

export interface AggregationConfig {
  range: TimeRange;
  intervalMinutes: number;
  maxPoints: number;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    value: "realtime",
    label: "Real-time",
    description: "Last 1 hour",
    hours: 1,
  },
  {
    value: "1d",
    label: "1 Hari",
    description: "Last 24 hours",
    hours: 24,
  },
  {
    value: "7d",
    label: "7 Hari",
    description: "Last 7 days",
    hours: 168,
  },
  {
    value: "30d",
    label: "1 Bulan",
    description: "Last 30 days",
    hours: 720,
  },
  {
    value: "90d",
    label: "3 Bulan",
    description: "Last 90 days",
    hours: 2160,
  },
  {
    value: "custom",
    label: "Custom Range",
    description: "Select date range",
    hours: 0,
  },
];

export const AGGREGATION_CONFIG: Record<TimeRange, AggregationConfig> = {
  realtime: {
    range: "realtime",
    intervalMinutes: 1,
    maxPoints: 60,
  },
  "1d": {
    range: "1d",
    intervalMinutes: 5,
    maxPoints: 288,
  },
  "7d": {
    range: "7d",
    intervalMinutes: 30,
    maxPoints: 336,
  },
  "30d": {
    range: "30d",
    intervalMinutes: 120,
    maxPoints: 360,
  },
  "90d": {
    range: "90d",
    intervalMinutes: 360,
    maxPoints: 360,
  },
  custom: {
    range: "custom",
    intervalMinutes: 60,
    maxPoints: 500,
  },
};

export function getDateRangeFromFilter(range: TimeRange, customFrom?: Date, customTo?: Date): { from: Date; to: Date } {
  const now = new Date();
  const to = customTo || now;

  if (range === "custom" && customFrom) {
    return { from: customFrom, to };
  }

  const option = TIME_RANGE_OPTIONS.find((opt) => opt.value === range);
  if (!option) {
    return { from: new Date(now.getTime() - 60 * 60 * 1000), to };
  }

  const from = new Date(now.getTime() - option.hours * 60 * 60 * 1000);
  return { from, to };
}
