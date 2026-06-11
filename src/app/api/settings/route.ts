import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/types/settings';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
