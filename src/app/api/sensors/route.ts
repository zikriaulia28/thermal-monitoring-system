import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { deviceId, location, temperature, humidity } = body;

    const tempValue = Number(temperature);
    const humValue = Number(humidity);

    // ==========================
    // VALIDATION
    // ==========================

    if (!deviceId || isNaN(tempValue) || isNaN(humValue)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid data: deviceId, temperature and humidity are required",
        },
        {
          status: 400,
        },
      );
    }

    console.log("📡 Sensor:", {
      deviceId,
      location,
      temperature: tempValue,
      humidity: humValue,
    });

    // ==========================
    // UPSERT DEVICE
    // ==========================

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

    // ==========================
    // SAVE SENSOR LOG
    // ==========================

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

    if (tempValue > 30) {
      const existing = await prisma.alert.findFirst({
        where: {
          deviceId,
          type: "TEMPERATURE",
          severity: "CRITICAL",
          createdAt: {
            gte: new Date(Date.now() - 1 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            deviceId,
            location,
            type: "TEMPERATURE",
            severity: "CRITICAL",
            message: `Temperature ${tempValue}°C exceeds critical threshold (>30°C)`,
          },
        });
      }
    } else if (tempValue >= 28) {
      const existing = await prisma.alert.findFirst({
        where: {
          deviceId,
          type: "TEMPERATURE",
          severity: "WARNING",
          createdAt: {
            gte: new Date(Date.now() - 1 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            deviceId,
            location,
            type: "TEMPERATURE",
            severity: "WARNING",
            message: `Temperature ${tempValue}°C exceeds warning threshold (28-30°C)`,
          },
        });
      }
    }

    // ==========================
    // HUMIDITY ALERT
    // ==========================

    if (humValue > 70) {
      const existing = await prisma.alert.findFirst({
        where: {
          deviceId,
          type: "HUMIDITY",
          severity: "CRITICAL",
          createdAt: {
            gte: new Date(Date.now() - 1 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            deviceId,
            location,
            type: "HUMIDITY",
            severity: "CRITICAL",
            message: `Humidity ${humValue}% exceeds critical threshold (>70%)`,
          },
        });
      }
    } else if (humValue > 60) {
      const existing = await prisma.alert.findFirst({
        where: {
          deviceId,
          type: "HUMIDITY",
          severity: "WARNING",
          createdAt: {
            gte: new Date(Date.now() - 1 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            deviceId,
            location,
            type: "HUMIDITY",
            severity: "WARNING",
            message: `Humidity ${humValue}% exceeds warning threshold (61-70%)`,
          },
        });
      }
    } else if (humValue < 30) {
      const existing = await prisma.alert.findFirst({
        where: {
          deviceId,
          type: "HUMIDITY",
          severity: "WARNING",
          createdAt: {
            gte: new Date(Date.now() - 1 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        await prisma.alert.create({
          data: {
            deviceId,
            location,
            type: "HUMIDITY",
            severity: "WARNING",
            message: `Humidity ${humValue}% below threshold (<30%)`,
          },
        });
      }
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
