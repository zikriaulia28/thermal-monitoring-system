import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getDeviceStatus } from "@/lib/deviceStatus";
import { aggregateData, formatTimeForRange } from "@/lib/aggregation";
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

    console.log("📊 Chart API:", {
      range: rangeParam,
      from: from.toISOString(),
      to: to.toISOString(),
      deviceId: deviceIdParam || "all",
    });

    const whereClause: any = {
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

      const aggregatedLogs = aggregateData(rawLogs, rangeParam);

      return {
        id: device.deviceId,
        name: `Ruang ${device.location}`,
        location: device.location,
        status: getDeviceStatus(device.lastSeen),
        lastSeen: device.lastSeen,
        readings: aggregatedLogs.map((log) => ({
          time: formatTimeForRange(log.createdAt, rangeParam),
          temperature: log.temperature,
          humidity: log.humidity,
        })),
      };
    });

    return NextResponse.json(result);
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
