import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "cpems_admin_session";
const SESSION_EXPIRY_HOURS = 24;

// Password diambil dari environment variable
function getAdminKey(): string {
  const key = process.env.ADMIN_KEY;
  if (!key) {
    console.warn("ADMIN_KEY not set in environment, using fallback for development");
    return "cpems2026"; // fallback untuk development
  }
  return key;
}

// Generate secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Hash token untuk disimpan di cookie
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Verify password
export function verifyPassword(password: string): boolean {
  return password === getAdminKey();
}

// Create admin session - returns token to be stored in cookie
export async function createAdminSession(): Promise<string> {
  const token = generateSessionToken();
  const hashedToken = hashToken(token);
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ hashedToken, expiresAt }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    path: "/",
  });

  return token;
}

// Check if request has valid admin session
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return false;
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Check expiry
    if (Date.now() > session.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Revoke admin session
export async function revokeAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Middleware helper untuk protect API routes
export async function withAdminAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const isAuthenticated = await checkAdminSession();

  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: "Admin access required" },
      { status: 401 }
    );
  }

  return handler();
}
