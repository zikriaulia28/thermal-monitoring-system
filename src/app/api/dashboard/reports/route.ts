import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const deviceId = searchParams.get("deviceId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100")));
    const skip = (page - 1) * limit;

    const where: Prisma.SensorLogWhereInput = {};
    if (deviceId) {
      where.deviceId = deviceId;
    }
    if (start && end) {
      where.createdAt = { gte: new Date(start), lte: new Date(end) };
    }

    const [reports, total] = await Promise.all([
      prisma.sensorLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { device: true },
        skip,
        take: limit,
      }),
      prisma.sensorLog.count({ where }),
    ]);

    return NextResponse.json({
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("DASHBOARD_REPORTS", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
