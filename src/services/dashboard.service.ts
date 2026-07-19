import { DashboardOverview, DailyStatsResponse } from "@/types/dashboard";
import { Device } from "@/types/device";
import { TimeRange } from "@/types/filter";

async function fetchWithTimeout(
  resource: RequestInfo,
  options: RequestInit = {},
  timeout = 60000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => "Could not read error body");
      throw new Error(
        `Failed to fetch ${resource}. Status: ${response.status}. Body: ${errorBody}`,
      );
    }
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function getOverview(): Promise<DashboardOverview> {
  const res = await fetchWithTimeout("/api/dashboard/overview", {
    cache: "no-store",
  });
  return res.json();
}

export async function getChartData(
  range: TimeRange = "realtime",
  deviceId?: string,
  customFrom?: Date,
  customTo?: Date,
): Promise<Device[]> {
  const params = new URLSearchParams({ range });

  if (deviceId) {
    params.append("deviceId", deviceId);
  }

  if (range === "custom" && customFrom && customTo) {
    params.set("from", customFrom.toISOString());
    params.set("to", customTo.toISOString());
  }

  const res = await fetchWithTimeout(
    `/api/dashboard/chart?${params.toString()}`,
    {
      cache: "no-store",
    },
  );
  return res.json();
}

export async function getDailyStats(
  range: TimeRange = "realtime",
  customFrom?: Date,
  customTo?: Date,
): Promise<DailyStatsResponse> {
  const params = new URLSearchParams({ range });
  if (range === "custom" && customFrom && customTo) {
    params.set("from", customFrom.toISOString());
    params.set("to", customTo.toISOString());
  }
  const res = await fetchWithTimeout(`/api/dashboard/daily-stats?${params.toString()}`, {
    cache: "no-store",
  });
  return res.json();
}
