import { Device } from "@/types/device";

export async function getDevices(): Promise<Device[]> {
  const res = await fetch("/api/dashboard/chart", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed fetch devices");
  }

  return res.json();
}
