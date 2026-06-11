import { Device } from "@/types/device";

export async function getChartData(): Promise<Device[]> {
  const response = await fetch("/api/dashboard/chart", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}
