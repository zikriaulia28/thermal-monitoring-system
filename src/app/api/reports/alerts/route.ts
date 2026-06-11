import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const severity = searchParams.get('severity');
    const locationFilter = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
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

    const whereClause: any = {
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

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where: whereClause }),
    ]);

    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      device: alert.deviceId,
      location: alert.location,
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      createdAt: new Date(alert.createdAt).toLocaleString('id-ID'),
      acknowledged: alert.acknowledged,
    }));

    // Summary stats
    const stats = {
      total,
      critical: alerts.filter((a) => a.severity === 'CRITICAL').length,
      warning: alerts.filter((a) => a.severity === 'WARNING').length,
      acknowledged: alerts.filter((a) => a.acknowledged).length,
      pending: alerts.filter((a) => !a.acknowledged).length,
    };

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
