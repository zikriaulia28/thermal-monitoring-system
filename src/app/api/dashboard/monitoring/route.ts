import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "1h";

    // Calculate time range
    const now = new Date();
    let hoursAgo = 1;

    switch (rangeParam) {
      case "6h":
        hoursAgo = 6;
        break;
      case "12h":
        hoursAgo = 12;
        break;
      case "24h":
        hoursAgo = 24;
        break;
      default:
        hoursAgo = 1;
    }

    const fromDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    const devices = await prisma.device.findMany({
      include: {
        logs: {
          where: {
            createdAt: {
              gte: fromDate,
              lte: now,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const OFFLINE_THRESHOLD = 5 * 60 * 1000;

    const result = devices.map((device) => {
      const lastSeen = device.lastSeen?.getTime();
      const isOnline =
        lastSeen !== undefined && Date.now() - lastSeen < OFFLINE_THRESHOLD;

      return {
        id: device.deviceId,
        name: device.location,
        location: device.location,
        status: isOnline ? "online" : "offline",
        lastSeen: device.lastSeen,
        readings: device.logs.map((log) => ({
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
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed fetch monitoring",
      },
      {
        status: 500,
      }
    );
  }
}
