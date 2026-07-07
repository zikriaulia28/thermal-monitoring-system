import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { summarizeByDay } from '@/lib/reportUtils';
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const locationFilter = searchParams.get('location');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch sensor logs in date range
    const logs = await prisma.sensorLog.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        device: locationFilter
          ? { location: { contains: locationFilter, mode: 'insensitive' } }
          : undefined,
      },
      include: {
        device: {
          select: {
            deviceId: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Aggregate by day and location
    const summaries = summarizeByDay(
      logs.map((log) => ({
        temperature: log.temperature,
        humidity: log.humidity,
        createdAt: log.createdAt,
        location: log.device.location,
        deviceId: log.device.deviceId,
      }))
    );

    // Fetch alerts for count
    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        location: locationFilter
          ? { contains: locationFilter, mode: 'insensitive' }
          : undefined,
      },
    });

    // Count alerts by date and location
    const alertCounts: Record<string, Record<string, number>> = {};
    alerts.forEach((alert) => {
      const date = new Date(alert.createdAt).toISOString().split('T')[0];
      if (!alertCounts[date]) alertCounts[date] = {};
      alertCounts[date][alert.location] =
        (alertCounts[date][alert.location] || 0) + 1;
    });

    // Add alert counts to summaries
    const summariesWithAlerts = summaries.map((summary) => ({
      ...summary,
      alertCount: alertCounts[summary.date]?.[summary.location] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: summariesWithAlerts,
      summary: {
        totalRecords: logs.length,
        period: `${startDate} to ${endDate}`,
        locations: [...new Set(logs.map((l) => l.device.location))],
      },
    });
  } catch (error) {
    logger.error("REPORT_SUMMARY", error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary report' },
      { status: 500 }
    );
  }
}
