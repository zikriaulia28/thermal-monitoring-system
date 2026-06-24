import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateSettings } from "@/lib/settingsUtils";

export async function PATCH(request: NextRequest) {
  // Guard: Only authenticated admin can update settings
  const isAuthenticated = await checkAdminSession();

  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: "Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validateSettings(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Get existing settings or create if not exists
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: validation.data,
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: validation.data,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/settings/update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
