import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid request", message: "Password is required" },
        { status: 400 }
      );
    }

    if (verifyPassword(password)) {
      const token = await createAdminSession();

      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        token, // For client-side use (optional, cookie already set)
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("POST /api/auth/verify-admin error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
