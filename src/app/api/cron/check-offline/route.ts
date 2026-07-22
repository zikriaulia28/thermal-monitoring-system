import { prisma, getCachedSettings } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getOfflineThresholdMs } from "@/lib/deviceStatus";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/check-offline
 *
 * Vercel Cron job: cek semua device dan buat OFFLINE alert jika melebihi threshold.
 * Dipanggil setiap 5 menit, bukan dari path sensor POST.
 */
export async function GET() {
  try {
    const settings = await getCachedSettings();
    const intervalSeconds = settings?.monitoringIntervalSeconds;
    const thresholdMs = getOfflineThresholdMs(intervalSeconds);
    const now = Date.now();

    const devices = await prisma.device.findMany({
      select: { deviceId: true, location: true, lastSeen: true },
    });

    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const createdOffline = [];

    for (const dev of devices) {
      if (!dev.lastSeen) continue;

      const stale = now - dev.lastSeen.getTime();
      if (stale < thresholdMs) continue;

      // Dedupe: cek apakah alert OFFLINE sudah ada dalam 1 jam terakhir
      const existing = await prisma.alert.findFirst({
        where: {
          deviceId: dev.deviceId,
          type: "ALERT_OFFLINE",
          createdAt: { gte: oneHourAgo },
        },
      });

      if (!existing) {
        const offlineMinutes = Math.floor(stale / 60000);
        await prisma.alert.create({
          data: {
            deviceId: dev.deviceId,
            location: dev.location,
            type: "ALERT_OFFLINE",
            severity: offlineMinutes >= 15 ? "CRITICAL" : "WARNING",
            message: `${dev.location} tidak mengirim data selama ${offlineMinutes} menit`,
          },
        });
        createdOffline.push(dev.deviceId);
      }
    }

    return NextResponse.json({
      success: true,
      checked: devices.length,
      createdOffline: createdOffline.length,
    });
  } catch (error) {
    logger.error("CRON_CHECK_OFFLINE", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
