import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    // Server-side filters
    const search = searchParams.get("search") || "";
    const severity = searchParams.get("severity") || "";
    const status = searchParams.get("status") || ""; // "active" | "ack" | ""

    // Build where clause
    const where: Prisma.AlertWhereInput = {};

    if (severity) {
      where.severity = severity;
    }

    if (status === "active") {
      where.acknowledged = false;
    } else if (status === "ack") {
      where.acknowledged = true;
    }

    if (search) {
      where.OR = [
        { deviceId: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    // Hitung total UNTUK query yang sudah di-filter (bukan semua data)
    const total = await prisma.alert.count({ where });

    // Hitung summary dari filtered data
    const [[active, ackCount, critical], alerts] = await Promise.all([
      Promise.all([
        prisma.alert.count({ where: { ...where, acknowledged: false } }),
        prisma.alert.count({ where: { ...where, acknowledged: true } }),
        prisma.alert.count({ where: { ...where, acknowledged: false, severity: "CRITICAL" } }),
      ]),
      prisma.alert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total,
        active,
        ack: ackCount,
        critical,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/alerts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch alerts",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Alert ID is required" },
        { status: 400 },
      );
    }

    await prisma.alert.update({
      where: { id },
      data: { acknowledged: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/dashboard/alerts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to acknowledge alert" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
