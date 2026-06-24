import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function formatDateWIB(date: Date): string {
  const d = new Date(date);
  const wib = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(wib.getDate())}/${pad(wib.getMonth() + 1)}/${wib.getFullYear()} ${pad(wib.getHours())}:${pad(wib.getMinutes())}:${pad(wib.getSeconds())}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const severity = searchParams.get('severity');
    const locationFilter = searchParams.get('location');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const whereClause: Prisma.AlertWhereInput = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (severity) {
      whereClause.severity = severity;
    }

    if (locationFilter) {
      whereClause.location = { contains: locationFilter, mode: 'insensitive' };
    }

    const [alerts, total, allAlertsForStats] = await Promise.all([
      prisma.alert.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where: whereClause }),
      prisma.alert.findMany({
        where: whereClause,
        select: { severity: true, acknowledged: true },
      }),
    ]);

    const stats = {
      total,
      critical: allAlertsForStats.filter((a) => a.severity === 'CRITICAL').length,
      warning: allAlertsForStats.filter((a) => a.severity === 'WARNING').length,
      acknowledged: allAlertsForStats.filter((a) => a.acknowledged).length,
      pending: allAlertsForStats.filter((a) => !a.acknowledged).length,
    };

    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      device: alert.deviceId,
      location: alert.location,
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      createdAt: formatDateWIB(new Date(alert.createdAt)),
      acknowledged: alert.acknowledged,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAlerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        ...stats,
        period: `${startDate} to ${endDate}`,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts report' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
