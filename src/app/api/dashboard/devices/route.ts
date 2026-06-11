import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
        device.lastSeen && now - device.lastSeen.getTime() < 5 * 60 * 1000;

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

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

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
