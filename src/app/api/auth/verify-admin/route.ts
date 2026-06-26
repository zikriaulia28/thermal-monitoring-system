import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminSession } from "@/lib/auth";

// ─── In-Memory Rate Limiter ───────────────────────────────
// Maksimal 5 percobaan gagal per IP per 15 menit.
// Serverless-friendly: reset saat instance baru.
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const record = loginAttempts.get(ip);
  if (!record) return false;

  // Jika window sudah expired, reset
  if (Date.now() - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const existing = loginAttempts.get(ip);

  if (!existing || Date.now() - existing.firstAttempt > WINDOW_MS) {
    // Window baru atau expired
    loginAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    existing.count += 1;
  }
}

function getRemainingWaitSeconds(ip: string): number {
  const record = loginAttempts.get(ip);
  if (!record) return 0;
  const elapsed = Date.now() - record.firstAttempt;
  const remaining = WINDOW_MS - elapsed;
  return Math.max(0, Math.ceil(remaining / 1000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid request", message: "Password is required" },
        { status: 400 },
      );
    }

    const clientIP = getClientIP(request);

    // Check rate limit
    if (isRateLimited(clientIP)) {
      const waitSeconds = getRemainingWaitSeconds(clientIP);
      return NextResponse.json(
        {
          success: false,
          error: "Too many attempts",
          message: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(waitSeconds / 60)} menit.`,
          retryAfter: waitSeconds,
        },
        { status: 429 },
      );
    }

    if (verifyPassword(password)) {
      // Success — reset rate limit
      loginAttempts.delete(clientIP);

      const token = await createAdminSession();

      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        token, // For client-side use (optional, cookie already set)
      });
    } else {
      // Failed — record attempt
      recordFailedAttempt(clientIP);

      const attemptsLeft = MAX_ATTEMPTS - (loginAttempts.get(clientIP)?.count || 0);
      const message =
        attemptsLeft > 0
          ? `Password salah. Sisa percobaan: ${attemptsLeft}`
          : "Terlalu banyak percobaan. Akun diblokir sementara.";

      return NextResponse.json(
        { success: false, error: "Unauthorized", message },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("POST /api/auth/verify-admin error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
