import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getDeviceStatus } from "@/lib/deviceStatus";

// Mencegah Next.js melakukan caching pada API route ini
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        logs: {
          orderBy: {
            createdAt: "desc", // 1. UBAH ke "desc" agar database mengambil data TERBARU
          },
          take: 60, // 2. Ambil 60 data terbaru
        },
      },
    });

    const result = devices.map((device) => ({
      id: device.deviceId,
      name: `Ruang ${device.location}`,
      location: device.location,
      status: getDeviceStatus(device.lastSeen),
      lastSeen: device.lastSeen,

      // 3. Gunakan [...device.logs].reverse()
      // Ini membalik array dari (terbaru->terlama) menjadi (terlama->terbaru).
      // Sangat penting agar grafik (chart) tampil kronologis dari kiri ke kanan.
      readings: [...device.logs].reverse().map((log) => ({
        time: log.createdAt.toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta", // Konversi UTC ke WIB sudah benar di sini!
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: log.temperature,
        humidity: log.humidity,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/dashboard/chart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chart data",
      },
      {
        status: 500,
      },
    );
  }
}
