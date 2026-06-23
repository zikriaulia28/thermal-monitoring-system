import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getThresholds() {
  const settings = await prisma.settings.findFirst();
  return {
    tempMax: settings?.thresholdTempMax ?? 35,
    tempWarning: settings ? settings.thresholdTempMax - 5 : 28,
    humMax: settings?.thresholdHumidityMax ?? 70,
    humMin: settings?.thresholdHumidityMin ?? 30,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, location, temperature, humidity } = body;

    const tempValue = Number(temperature);
    const humValue = Number(humidity);

    if (!deviceId || isNaN(tempValue) || isNaN(humValue)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data: deviceId, temperature and humidity are required",
        },
        { status: 400 },
      );
    }

    await prisma.device.upsert({
      where: { deviceId },
      update: { location, lastSeen: new Date() },
      create: { deviceId, location, lastSeen: new Date() },
    });

    await prisma.sensorLog.create({
      data: { deviceId, temperature: tempValue, humidity: humValue },
    });

    const thresholds = await getThresholds();

    // Temperature Alert
    if (tempValue > thresholds.tempMax) {
      const existing = await prisma.alert.findFirst({
        where: { deviceId, type: "TEMPERATURE", severity: "CRITICAL", createdAt: { gte: new Date(Date.now() - 60000) } },
      });
      if (!existing) {
        await prisma.alert.create({
          data: { deviceId, location, type: "TEMPERATURE", severity: "CRITICAL", message: `Temperature ${tempValue}°C exceeds critical threshold (>${thresholds.tempMax}°C)` },
        });
      }
    } else if (tempValue >= thresholds.tempWarning) {
      const existing = await prisma.alert.findFirst({
        where: { deviceId, type: "TEMPERATURE", severity: "WARNING", createdAt: { gte: new Date(Date.now() - 60000) } },
      });
      if (!existing) {
        await prisma.alert.create({
          data: { deviceId, location, type: "TEMPERATURE", severity: "WARNING", message: `Temperature ${tempValue}°C exceeds warning threshold (>${thresholds.tempWarning}°C)` },
        });
      }
    }

    // Humidity Alert
    if (humValue > thresholds.humMax) {
      const existing = await prisma.alert.findFirst({
        where: { deviceId, type: "HUMIDITY", severity: "CRITICAL", createdAt: { gte: new Date(Date.now() - 60000) } },
      });
      if (!existing) {
        await prisma.alert.create({
          data: { deviceId, location, type: "HUMIDITY", severity: "CRITICAL", message: `Humidity ${humValue}% exceeds critical threshold (>${thresholds.humMax}%)` },
        });
      }
    } else if (humValue < thresholds.humMin) {
      const existing = await prisma.alert.findFirst({
        where: { deviceId, type: "HUMIDITY", severity: "WARNING", createdAt: { gte: new Date(Date.now() - 60000) } },
      });
      if (!existing) {
        await prisma.alert.create({
          data: { deviceId, location, type: "HUMIDITY", severity: "WARNING", message: `Humidity ${humValue}% below threshold (<${thresholds.humMin}%)` },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sensor API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
