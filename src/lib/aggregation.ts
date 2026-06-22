import { AGGREGATION_CONFIG, TimeRange } from "@/types/filter";

interface DataPoint {
  temperature: number;
  humidity: number;
  createdAt: Date;
}

interface AggregatedDataPoint {
  temperature: number;
  humidity: number;
  createdAt: Date;
  count: number;
}

export function aggregateData(
  data: DataPoint[],
  range: TimeRange
): AggregatedDataPoint[] {
  const config = AGGREGATION_CONFIG[range];

  if (range === "realtime" || data.length <= config.maxPoints) {
    return data.map((point) => ({
      ...point,
      count: 1,
    }));
  }

  const intervalMs = config.intervalMinutes * 60 * 1000;
  const buckets = new Map<number, DataPoint[]>();

  data.forEach((point) => {
    const timestamp = point.createdAt.getTime();
    const bucketKey = Math.floor(timestamp / intervalMs) * intervalMs;

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey)!.push(point);
  });

  const aggregated: AggregatedDataPoint[] = [];

  buckets.forEach((points, bucketKey) => {
    const avgTemp =
      points.reduce((sum, p) => sum + p.temperature, 0) / points.length;
    const avgHum =
      points.reduce((sum, p) => sum + p.humidity, 0) / points.length;

    aggregated.push({
      temperature: Number(avgTemp.toFixed(2)),
      humidity: Number(avgHum.toFixed(2)),
      createdAt: new Date(bucketKey),
      count: points.length,
    });
  });

  return aggregated.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function formatTimeForRange(date: Date, range: TimeRange): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
  };

  switch (range) {
    case "realtime":
    case "1d":
      return date.toLocaleTimeString("id-ID", {
        ...options,
        hour: "2-digit",
        minute: "2-digit",
      });

    case "7d":
      return date.toLocaleDateString("id-ID", {
        ...options,
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

    case "30d":
    case "90d":
      return date.toLocaleDateString("id-ID", {
        ...options,
        day: "2-digit",
        month: "short",
      });

    case "custom":
      return date.toLocaleDateString("id-ID", {
        ...options,
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    default:
      return date.toLocaleTimeString("id-ID", {
        ...options,
        hour: "2-digit",
        minute: "2-digit",
      });
  }
}
