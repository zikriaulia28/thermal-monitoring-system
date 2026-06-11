import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Mencegah Next.js melakukan caching pada API route ini
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { deviceId, location, temperature, humidity } = body;

    // ==========================
    // VALIDASI & KONVERSI DATA
    // ==========================

    // Konversi ke number untuk memastikan perbandingan bekerja dengan benar
    const tempValue = Number(temperature);
    const humValue = Number(humidity);

    // Validasi data
    if (!deviceId || isNaN(tempValue) || isNaN(humValue)) {
      console.error("Invalid data received:", {
        deviceId,
        temperature,
        humidity,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid data: deviceId, temperature, and humidity are required",
        },
        {
          status: 400,
        },
      );
    }

    // Logging untuk debugging
    console.log("📡 Sensor data received:", {
      deviceId,
      location,
      temperature: tempValue,
      humidity: humValue,
    });

    await prisma.device.upsert({
      where: {
        deviceId,
      },
      update: {
        location,
        lastSeen: new Date(),
      },
      create: {
        deviceId,
        location,
        lastSeen: new Date(),
      },
    });

    await prisma.sensorLog.create({
      data: {
        deviceId,
        temperature: tempValue,
        humidity: humValue,
      },
    });

    // ==========================
    // TEMPERATURE ALERT
    // ==========================

    if (tempValue >= 35) {
      console.log(`🚨 CRITICAL ALERT: Temperature ${tempValue}°C exceeds 35°C`);
      await prisma.alert.create({
        data: {
          deviceId,
          location,
          type: "TEMPERATURE",
          severity: "CRITICAL",
          message: `Temperature ${tempValue}°C exceeds critical threshold (35°C)`,
        },
      });
    } else if (tempValue >= 30) {
      console.log(`⚠️ WARNING ALERT: Temperature ${tempValue}°C exceeds 30°C`);
      await prisma.alert.create({
        data: {
          deviceId,
          location,
          type: "TEMPERATURE",
          severity: "WARNING",
          message: `Temperature ${tempValue}°C exceeds warning threshold (30°C)`,
        },
      });
    }

    // ==========================
    // HUMIDITY ALERT
    // ==========================

    if (humValue >= 60) {
      console.log(`⚠️ WARNING ALERT: Humidity ${humValue}% exceeds 60%`);
      await prisma.alert.create({
        data: {
          deviceId,
          location,
          type: "HUMIDITY",
          severity: "WARNING",
          message: `Humidity ${humValue}% exceeds threshold (60%)`,
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Sensor API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
