import { DashboardOverview, DailyStatsResponse } from "@/types/dashboard";
import { Device } from "@/types/device";
import { TimeRange } from "@/types/filter";

export async function getOverview(): Promise<DashboardOverview> {
  const res = await fetch("/api/dashboard/overview", {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch overview");
  }

  return res.json();
}

export async function getChartData(
  range: TimeRange = "realtime",
  deviceId?: string,
  customFrom?: Date,
  customTo?: Date
): Promise<Device[]> {
  const params = new URLSearchParams({ range });
  
  if (deviceId) {
    params.append("deviceId", deviceId);
  }
  
  if (range === "custom" && customFrom && customTo) {
    params.set("from", customFrom.toISOString());
    params.set("to", customTo.toISOString());
  }

  const res = await fetch(`/api/dashboard/chart?${params.toString()}`, {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch chart data");
  }

  return res.json();
}

export async function getDailyStats(): Promise<DailyStatsResponse> {
  const res = await fetch("/api/dashboard/daily-stats", {
    cache: "force-cache",
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch daily stats");
  }

  return res.json();
}
