import { Device } from "@/types/device";

export async function getMonitoringData(): Promise<Device[]> {
  const res = await fetch("/api/dashboard/monitoring", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch monitoring");
  }

  return res.json();
}
