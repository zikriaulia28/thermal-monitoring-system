import { prisma, getCachedSettings } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getOfflineThresholdMs } from "@/lib/deviceStatus";
import { getDateRangeFromFilter, TimeRange, AGGREGATION_CONFIG } from "@/types/filter";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = (searchParams.get("range") || "realtime") as TimeRange;
    const deviceIdParam = searchParams.get("deviceId");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let from: Date;
    let to: Date;

    if (rangeParam === "custom" && fromParam && toParam) {
      from = new Date(fromParam);
      to = new Date(toParam);
    } else {
      const dateRange = getDateRangeFromFilter(rangeParam);
      from = dateRange.from;
      to = dateRange.to;
    }

    const agg = AGGREGATION_CONFIG[rangeParam] || AGGREGATION_CONFIG.realtime;
    const intervalMinutes = agg.intervalMinutes;

    const settings = await getCachedSettings();
    const intervalSeconds = settings?.monitoringIntervalSeconds;

    // ── DB-level aggregation: Postgres date_trunc buckets ──
    const rows = await prisma.$queryRaw<Array<{
      device_id: string;
      location: string;
      last_seen: Date | null;
      bucket: Date;
      avg_t: number;
      avg_h: number;
    }>>(Prisma.sql`
      SELECT
        d."deviceId" AS device_id,
        d."location",
        d."lastSeen" AS last_seen,
        date_trunc('minute', sl."createdAt")
          - (EXTRACT(MINUTE FROM sl."createdAt")::INT % ${intervalMinutes}) * INTERVAL '1 minute' AS bucket,
        AVG(sl."temperature")::FLOAT AS avg_t,
        AVG(sl."humidity")::FLOAT AS avg_h
      FROM "Device" d
      LEFT JOIN "SensorLog" sl
        ON sl."deviceId" = d."deviceId"
        AND sl."createdAt" >= ${from}::TIMESTAMP
        AND sl."createdAt" <= ${to}::TIMESTAMP
      WHERE (${deviceIdParam || null}::TEXT IS NULL OR d."deviceId" = ${deviceIdParam || null})
      GROUP BY d."deviceId", d."location", d."lastSeen", bucket
      ORDER BY d."deviceId", bucket
    `);

    // ── Group rows into device objects ──
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
          name: `Ruang ${row.location}`,
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
    logger.error("CHART", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chart data",
      },
      {
        status: 500,
      }
    );
  }
}
