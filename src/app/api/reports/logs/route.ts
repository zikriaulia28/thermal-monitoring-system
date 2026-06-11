import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const deviceId = searchParams.get('deviceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
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

    if (deviceId) {
      whereClause.deviceId = deviceId;
    }

    const [logs, total] = await Promise.all([
      prisma.sensorLog.findMany({
        where: whereClause,
        include: {
          device: {
            select: {
              deviceId: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.sensorLog.count({ where: whereClause }),
    ]);

    const formattedLogs = logs.map((log) => ({
      time: new Date(log.createdAt).toLocaleString('id-ID'),
      device: log.device.deviceId,
      location: log.device.location,
      temperature: log.temperature,
      humidity: log.humidity,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalRecords: total,
        period: `${startDate} to ${endDate}`,
      },
    });
  } catch (error) {
    console.error('GET /api/reports/logs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch detailed logs' },
      { status: 500 }
    );
  }
}
