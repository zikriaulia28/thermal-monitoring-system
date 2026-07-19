import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getDateRangeFromFilter, TimeRange } from "@/types/filter";

export const dynamic = "force-dynamic";

/** Get WIB hour (0-23) from any Date — timezone-safe. */
function getWIBHour(date: Date): number {
  const h = parseInt(
    date.toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    }),
  );
  return h; // 0-23
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = (searchParams.get("range") || "realtime") as TimeRange;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let filterFrom: Date;
    let filterTo: Date;

    if (rangeParam === "custom" && fromParam && toParam) {
      filterFrom = new Date(fromParam);
      filterTo = new Date(toParam);
    } else {
      const dateRange = getDateRangeFromFilter(rangeParam);
      filterFrom = dateRange.from;
      filterTo = dateRange.to;
    }

    const devices = await prisma.device.findMany({
      include: {
        logs: {
          where: { createdAt: { gte: filterFrom, lte: filterTo } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // ── Per-device daily stats ──
    const stats = devices.map((device) => {
      const temps = device.logs.map((l) => l.temperature);
      const hums = device.logs.map((l) => l.humidity);

      return {
        deviceId: device.deviceId,
        location: device.location,
        name: `Ruang ${device.location}`,
        count: device.logs.length,
        minTemp: temps.length ? Math.min(...temps) : 0,
        maxTemp: temps.length ? Math.max(...temps) : 0,
        avgTemp:
          temps.length > 0
            ? temps.reduce((a, b) => a + b, 0) / temps.length
            : 0,
        minHum: hums.length ? Math.min(...hums) : 0,
        maxHum: hums.length ? Math.max(...hums) : 0,
        avgHum:
          hums.length > 0
            ? hums.reduce((a, b) => a + b, 0) / hums.length
            : 0,
      };
    });

    // ── Hourly aggregation (WIB) ──
    const hourlyBuckets: Record<
      string,
      Record<string, { temps: number[]; hums: number[] }>
    > = {};

    devices.forEach((device) => {
      device.logs.forEach((log) => {
        const wibHour = getWIBHour(log.createdAt);
        const hourKey = `${String(wibHour).padStart(2, "0")}:00`;

        if (!hourlyBuckets[hourKey]) hourlyBuckets[hourKey] = {};
        if (!hourlyBuckets[hourKey][device.deviceId])
          hourlyBuckets[hourKey][device.deviceId] = { temps: [], hums: [] };

        const b = hourlyBuckets[hourKey][device.deviceId];
        b.temps.push(log.temperature);
        b.hums.push(log.humidity);
      });
    });

    interface HourlyEntry {
      hour: string;
      deviceId: string;
      location: string;
      count: number;
      minTemp: number | null;
      maxTemp: number | null;
      avgTemp: number | null;
      minHum: number | null;
      maxHum: number | null;
      avgHum: number | null;
    }
    const hourly: HourlyEntry[] = [];

    // Build complete hour range 00-23 so chart axis is continuous
    for (let h = 0; h < 24; h++) {
      const hourKey = `${String(h).padStart(2, "0")}:00`;

      for (const device of devices) {
        const bucket = hourlyBuckets[hourKey]?.[device.deviceId];

        hourly.push({
          hour: hourKey,
          deviceId: device.deviceId,
          location: device.location,
          count: bucket ? bucket.temps.length : 0,
          minTemp: bucket ? Math.min(...bucket.temps) : null,
          maxTemp: bucket ? Math.max(...bucket.temps) : null,
          avgTemp: bucket
            ? bucket.temps.reduce((a, b) => a + b, 0) / bucket.temps.length
            : null,
          minHum: bucket ? Math.min(...bucket.hums) : null,
          maxHum: bucket ? Math.max(...bucket.hums) : null,
          avgHum: bucket
            ? bucket.hums.reduce((a, b) => a + b, 0) / bucket.hums.length
            : null,
        });
      }
    }

    return NextResponse.json(
      { stats, hourly },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    logger.error("DAILY_STATS", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily stats" },
      { status: 500 },
    );
  }
}
