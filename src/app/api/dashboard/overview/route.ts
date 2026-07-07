import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getOfflineThresholdMs } from "@/lib/deviceStatus";

export async function GET() {
  const settings = await prisma.settings.findFirst();
  const intervalSeconds = settings?.monitoringIntervalSeconds;
  const thresholdMs = getOfflineThresholdMs(intervalSeconds);

  const devices = await prisma.device.findMany({
    include: {
      logs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const now = Date.now();

  const online = devices.filter(
    (d) => d.lastSeen && now - d.lastSeen.getTime() < thresholdMs,
  ).length;

  const offline = devices.length - online;

  const latestLogs = devices.map((d) => d.logs[0]).filter(Boolean);

  const avgTemp =
    latestLogs.reduce((a, b) => a + b.temperature, 0) /
    (latestLogs.length || 1);

  const avgHum =
    latestLogs.reduce((a, b) => a + b.humidity, 0) / (latestLogs.length || 1);

  return NextResponse.json({
    online,
    offline,
    avgTemperature: avgTemp,
    avgHumidity: avgHum,
  });
}
