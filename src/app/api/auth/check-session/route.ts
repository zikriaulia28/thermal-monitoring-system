import { NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/check-session
 *
 * Endpoint untuk client-side Settings page mengecek apakah admin session
 * masih valid di server (httpOnly cookie). Ini mencegah bypass dari
 * localStorage tampering.
 *
 * Response:
 *   { valid: true }   — session valid
 *   { valid: false }  — session expired/tidak valid
 */
export async function GET() {
  try {
    const isValid = await checkAdminSession();
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    logger.error("AUTH_CHECK", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
