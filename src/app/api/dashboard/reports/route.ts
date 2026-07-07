import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const deviceId = searchParams.get("deviceId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const reports = await prisma.sensorLog.findMany({
      where: {
        ...(deviceId && {
          deviceId,
        }),

        ...(start &&
          end && {
            createdAt: {
              gte: new Date(start),
              lte: new Date(end),
            },
          }),
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        device: true,
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    logger.error("DASHBOARD_REPORTS", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
      },
      {
        status: 500,
      },
    );
  }
}
