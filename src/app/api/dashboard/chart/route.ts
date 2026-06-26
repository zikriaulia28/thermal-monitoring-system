import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getDeviceStatus } from "@/lib/deviceStatus";
import { getDateRangeFromFilter, TimeRange } from "@/types/filter";

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

    // Fetch settings for adaptive threshold
    const settings = await prisma.settings.findFirst();
    const intervalSeconds = settings?.monitoringIntervalSeconds;

    const whereClause: Record<string, unknown> & { deviceId?: string } = {
      logs: {
        some: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
      },
    };

    if (deviceIdParam) {
      whereClause.deviceId = deviceIdParam;
    }

    const devices = await prisma.device.findMany({
      where: whereClause,
      include: {
        logs: {
          where: {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const result = devices.map((device) => {
      const rawLogs = device.logs.map((log) => ({
        temperature: log.temperature,
        humidity: log.humidity,
        createdAt: log.createdAt,
      }));

      return {
        id: device.deviceId,
        name: `Ruang ${device.location}`,
        location: device.location,
        status: getDeviceStatus(device.lastSeen, intervalSeconds),
        lastSeen: device.lastSeen,
        readings: rawLogs.map((log) => ({
          time: log.createdAt.toISOString(),
          temperature: log.temperature,
          humidity: log.humidity,
        })),
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
    console.error("GET /api/dashboard/chart error:", error);

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
