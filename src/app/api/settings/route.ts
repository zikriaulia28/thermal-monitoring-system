import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { DEFAULT_SETTINGS } from "@/types/settings";

export async function GET() {
  // Settings GET doesn't require auth - dashboard needs to read thresholds for chart reference lines
  // but we still guard the sensitive settings differently
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
    logger.error("SETTINGS", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
