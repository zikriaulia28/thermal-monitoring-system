import { Device } from "@/types/device";

export async function getDevices(): Promise<Device[]> {
  const res = await fetch("/api/dashboard/chart", {
    cache: "force-cache",
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed fetch devices");
  }

  return res.json();
}
