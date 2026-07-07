import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const execute = searchParams.get("execute") === "true";
  const token = searchParams.get("token");

  try {
    const settings = await prisma.settings.findFirst();
    const days = settings?.dataRetentionDays ?? 365;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Execute — harus autorisasi
    if (execute) {
      const isAuthorized =
        (await checkAdminSession()) ||
        token === process.env.ADMIN_KEY ||
        request.headers.get("x-vercel-cron") === "1";

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, error: "Unauthorized", message: "Autentikasi diperlukan" },
          { status: 401 },
        );
      }

      // Hapus permanent data yang sudah melewati retention days
      const [deletedLogs, deletedAlerts] = await Promise.all([
        prisma.sensorLog.deleteMany({
          where: { createdAt: { lt: cutoff } },
        }),
        prisma.alert.deleteMany({
          where: { createdAt: { lt: cutoff } },
        }),
      ]);

      const total = deletedLogs.count + deletedAlerts.count;

      await prisma.cleanupLog.create({
        data: { recordCount: total, type: "auto" },
      });

      return NextResponse.json({
        success: true,
        data: {
          retentionDays: days,
          cutoffDate: cutoff.toISOString(),
          deletedLogs: deletedLogs.count,
          deletedAlerts: deletedAlerts.count,
          total,
        },
      });
    }

    // Preview — read-only, tidak perlu auth
    const [pendingLogs, pendingAlerts] = await Promise.all([
      prisma.sensorLog.count({
        where: { createdAt: { lt: cutoff } },
      }),
      prisma.alert.count({
        where: { createdAt: { lt: cutoff } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        retentionDays: days,
        cutoffDate: cutoff.toISOString(),
        pendingLogs,
        pendingAlerts,
        total: pendingLogs + pendingAlerts,
      },
    });
  } catch (error) {
    logger.error("SETTINGS_CLEANUP", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses cleanup" },
      { status: 500 },
    );
  }
}

async function checkAdminSession(): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const crypto = await import("crypto");

    const sessionCookie = cookieStore.get("cpems_admin_session");
    if (!sessionCookie?.value) return false;

    const session = JSON.parse(sessionCookie.value);
    if (Date.now() > session.expiresAt) return false;

    const signingSecret = process.env.SESSION_SECRET ?? process.env.ADMIN_KEY ?? "";
    const payload = JSON.stringify({ value: session.value, expiresAt: session.expiresAt });
    const expectedSig = crypto
      .createHmac("sha256", signingSecret)
      .update(payload)
      .digest("hex");

    const sigBuf = Buffer.from(session.sig || "", "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");

    if (sigBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}
