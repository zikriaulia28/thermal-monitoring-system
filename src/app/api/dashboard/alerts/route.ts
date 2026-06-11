import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // ✅ HITUNG SEMUA STATISTIK SECARA PARALEL (lebih efisien)
    const [alerts, total, active, ack, critical] = await Promise.all([
      prisma.alert.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.alert.count(),
      prisma.alert.count({ where: { acknowledged: false } }),
      prisma.alert.count({ where: { acknowledged: true } }),
      prisma.alert.count({
        where: {
          acknowledged: false,
          severity: "CRITICAL",
        },
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
      // ✅ TAMBAHKAN SUMMARY DI SINI
      summary: {
        total,
        active,
        ack,
        critical,
      },
    });
  } catch (error) {
    console.error(error);

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

    await prisma.alert.update({
      where: {
        id,
      },
      data: {
        acknowledged: true,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
