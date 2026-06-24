import { NextResponse } from "next/server";
import { revokeAdminSession } from "@/lib/auth";

export async function POST() {
  try {
    await revokeAdminSession();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
