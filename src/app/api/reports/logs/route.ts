import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const deviceId = searchParams.get('deviceId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '100')));
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

    const where: Record<string, unknown> = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (deviceId) {
      where.deviceId = deviceId;
    }

    const [logs, total] = await Promise.all([
      prisma.sensorLog.findMany({
        where,
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
      prisma.sensorLog.count({ where }),
    ]);

    const formattedLogs = logs.map((log) => ({
      time: formatDateWIB(new Date(log.createdAt)),
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

export const dynamic = 'force-dynamic';
