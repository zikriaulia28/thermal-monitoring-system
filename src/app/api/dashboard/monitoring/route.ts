import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
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

    // ── DB-level aggregation ──
    const rows = await prisma.$queryRawUnsafe<Array<{
      device_id: string;
      location: string;
      last_seen: Date | null;
      bucket: Date;
      avg_t: number;
      avg_h: number;
    }>>(`
      SELECT
        d."deviceId" AS device_id,
        d."location",
        d."lastSeen" AS last_seen,
        date_trunc('minute', sl."createdAt")
          - (EXTRACT(MINUTE FROM sl."createdAt")::INT % $3) * INTERVAL '1 minute' AS bucket,
        AVG(sl."temperature")::FLOAT AS avg_t,
        AVG(sl."humidity")::FLOAT AS avg_h
      FROM "Device" d
      LEFT JOIN "SensorLog" sl
        ON sl."deviceId" = d."deviceId"
        AND sl."createdAt" >= $1::TIMESTAMP
        AND sl."createdAt" <= $2::TIMESTAMP
      GROUP BY d."deviceId", d."location", d."lastSeen", bucket
      ORDER BY d."deviceId", bucket
    `, fromDate, now, intervalMinutes);

    const deviceMap = new Map<string, {
      id: string;
      name: string;
      location: string;
      status: string;
      lastSeen: Date | null;
      readings: Array<{ time: string; temperature: number; humidity: number }>;
    }>();

    for (const row of rows) {
      if (!row.device_id) continue;
      if (!deviceMap.has(row.device_id)) {
        const isOnline = row.last_seen !== null && Date.now() - row.last_seen.getTime() < getOfflineThresholdMs(intervalSeconds);
        deviceMap.set(row.device_id, {
          id: row.device_id,
          name: row.location,
          location: row.location,
          status: isOnline ? "online" : "offline",
          lastSeen: row.last_seen,
          readings: [],
        });
      }
      if (row.bucket) {
        deviceMap.get(row.device_id)!.readings.push({
          time: row.bucket.toISOString(),
          temperature: Number(row.avg_t.toFixed(2)),
          humidity: Number(row.avg_h.toFixed(2)),
        });
      }
    }

    const result = Array.from(deviceMap.values());

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    logger.error("MONITORING", error);
    return NextResponse.json({ success: false, message: "Failed fetch monitoring" }, { status: 500 });
  }
}
