import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "cpems_admin_session";
const SESSION_EXPIRY_HOURS = 24;

// ─── Admin Key ────────────────────────────────────────────
// Wajib di-set di environment variable (Vercel atau .env.local).
// TIDAK ada fallback — kalau tidak di-set, autentikasi selalu gagal.
function getAdminKey(): string {
  const key = process.env.ADMIN_KEY;
  if (!key) {
    throw new Error("ADMIN_KEY environment variable is not configured. Set it in Vercel or .env.local.");
  }
  return key;
}

// ─── HMAC Session Signing ─────────────────────────────────
// Gunakan SESSION_SECRET untuk HMAC, atau fallback ke ADMIN_KEY sebagai signing key.
function getSigningSecret(): string {
  return process.env.SESSION_SECRET ?? getAdminKey();
}

/**
 * Generate HMAC-SHA256 signature untuk session value.
 * Digunakan untuk memastikan cookie tidak dimodifikasi di client.
 */
function signSession(data: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(data)
    .digest("hex");
}

// ─── Token Generation ─────────────────────────────────────
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Password Verification ────────────────────────────────
export function verifyPassword(password: string): boolean {
  // Timing-safe comparison: hindari timing attack
  const adminKey = getAdminKey();
  const inputBuf = Buffer.from(password, "utf-8");
  const correctBuf = Buffer.from(adminKey, "utf-8");
  return inputBuf.length === correctBuf.length && crypto.timingSafeEqual(inputBuf, correctBuf);
}

// ─── Create Session ───────────────────────────────────────
/**
 * Create admin session. Returns token, sets httpOnly cookie.
 * Cookie value berisi: { value, expiresAt, sig }
 * - value: random token
 * - expiresAt: timestamp expiry
 * - sig: HMAC signature untuk integrity check
 */
export async function createAdminSession(): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

  // Create signed session payload
  const payload = JSON.stringify({ value: token, expiresAt });
  const sig = signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    JSON.stringify({ value: token, expiresAt, sig }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
      path: "/",
    },
  );

  return token;
}

// ─── Check Session ────────────────────────────────────────
/**
 * Verify admin session dari httpOnly cookie.
 * Cek: (1) cookie exists, (2) expiry, (3) HMAC integrity.
 */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return false;
    }

    const session = JSON.parse(sessionCookie.value);

    // 1. Check expiry
    if (Date.now() > session.expiresAt) {
      return false;
    }

    // 2. Verify HMAC signature — detect cookie tampering
    const payload = JSON.stringify({ value: session.value, expiresAt: session.expiresAt });
    const expectedSig = signSession(payload);
    const sigBuf = Buffer.from(session.sig || "", "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ─── Revoke Session ───────────────────────────────────────
export async function revokeAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ─── API Auth Middleware Helper ────────────────────────────
export async function withAdminAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const isAuthenticated = await checkAdminSession();
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: "Admin access required" },
      { status: 401 },
    );
  }
  return handler();
}
