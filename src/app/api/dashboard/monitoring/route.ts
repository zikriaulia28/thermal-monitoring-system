import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getOfflineThresholdMs } from "@/lib/deviceStatus";

export const dynamic = "force-dynamic";

/** Determine aggregation interval (minutes) based on requested time range. */
function getIntervalMinutes(hours: number): number {
  if (hours <= 1) return 1;
  if (hours <= 6) return 5;
  if (hours <= 12) return 10;
  return 30; // 24h
}

/** Truncate timestamp to a regular bucket (e.g., every 5 minutes). */
function truncateToInterval(date: Date, intervalMinutes: number): Date {
  const ms = date.getTime();
  const bucket = intervalMinutes * 60 * 1000;
  return new Date(Math.floor(ms / bucket) * bucket);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "1h";

    let hoursAgo = 1;
    switch (rangeParam) {
      case "6h": hoursAgo = 6; break;
      case "12h": hoursAgo = 12; break;
      case "24h": hoursAgo = 24; break;
      default: hoursAgo = 1;
    }

    const now = new Date();
    const fromDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const intervalMinutes = getIntervalMinutes(hoursAgo);

    const settings = await prisma.settings.findFirst();
    const intervalSeconds = settings?.monitoringIntervalSeconds;

    const devices = await prisma.device.findMany({
      include: {
        logs: {
          where: { createdAt: { gte: fromDate, lte: now } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const result = devices.map((device) => {
      const lastSeen = device.lastSeen?.getTime();
      const isOnline = lastSeen !== undefined && Date.now() - lastSeen < getOfflineThresholdMs(intervalSeconds);

      // Aggregate readings into regular time buckets
      const buckets = new Map<number, { temps: number[]; hums: number[] }>();

      for (const log of device.logs) {
        const bucketMs = truncateToInterval(log.createdAt, intervalMinutes).getTime();
        if (!buckets.has(bucketMs)) buckets.set(bucketMs, { temps: [], hums: [] });
        const b = buckets.get(bucketMs)!;
        b.temps.push(log.temperature);
        b.hums.push(log.humidity);
      }

      const readings = Array.from(buckets.entries())
        .sort(([a], [b]) => a - b)
        .map(([timeMs, { temps, hums }]) => ({
          time: new Date(timeMs).toISOString(),
          temperature: Number((temps.reduce((s, v) => s + v, 0) / temps.length).toFixed(2)),
          humidity: Number((hums.reduce((s, v) => s + v, 0) / hums.length).toFixed(2)),
        }));

      return {
        id: device.deviceId,
        name: device.location,
        location: device.location,
        status: isOnline ? "online" : "offline",
        lastSeen: device.lastSeen,
        readings,
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed fetch monitoring" }, { status: 500 });
  }
}
