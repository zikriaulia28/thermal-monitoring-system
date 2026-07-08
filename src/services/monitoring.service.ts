import { Device } from "@/types/device";
import { MonitoringTimeRange } from "@/types/monitoring";

export async function getMonitoringData(range: MonitoringTimeRange = "1h"): Promise<Device[]> {
  const params = new URLSearchParams({ range });
  
  const res = await fetch(`/api/dashboard/monitoring?${params.toString()}`, {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch monitoring");
  }

  return res.json();
}
