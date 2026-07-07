import { NextResponse } from "next/server";
import { revokeAdminSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    await revokeAdminSession();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("AUTH_LOGOUT", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
