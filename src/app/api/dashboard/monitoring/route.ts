import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        logs: {
          orderBy: {
            createdAt: "asc",
          },
          take: 100,
        },
      },
    });

    const now = Date.now();

    const OFFLINE_THRESHOLD = 5 * 60 * 1000;

    const result = devices.map((device) => {
      const lastSeen = device.lastSeen?.getTime();

      const isOnline =
        lastSeen !== undefined && now - lastSeen < OFFLINE_THRESHOLD;

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

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed fetch monitoring",
      },
      {
        status: 500,
      },
    );
  }
}
