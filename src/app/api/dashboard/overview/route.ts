import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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
    (d) => d.lastSeen && now - d.lastSeen.getTime() < 5 * 60 * 1000,
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
