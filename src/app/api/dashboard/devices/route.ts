import { prisma, getCachedSettings } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getOfflineThresholdMs } from "@/lib/deviceStatus";

export async function GET() {
  try {
    // Fetch settings for adaptive threshold
    const settings = await getCachedSettings();
    const intervalSeconds = settings?.monitoringIntervalSeconds;

    const devices = await prisma.device.findMany({
      include: {
        logs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        location: "asc",
      },
    });

    const now = Date.now();

    const result = devices.map((device) => {
      const isOnline =
        device.lastSeen && now - device.lastSeen.getTime() < getOfflineThresholdMs(intervalSeconds);

      const latest = device.logs[0];

      return {
        id: device.deviceId,
        location: device.location,
        status: isOnline ? "online" : "offline",
        lastSeen: device.lastSeen,
        temperature: latest?.temperature ?? null,
        humidity: latest?.humidity ?? null,
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    logger.error("DEVICES", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch devices",
      },
      {
        status: 500,
      },
    );
  }
}
