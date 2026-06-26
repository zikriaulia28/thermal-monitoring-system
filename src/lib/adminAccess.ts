const STORAGE_KEY = "cpems_admin";

// ─── Client-side Check ────────────────────────────────────
// NOTE: Ini hanya convenience check untuk UI (nampilin Admin badge).
// REAL security validation terjadi server-side via httpOnly cookie.
export function checkAdminAccess(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session.authorized === true;
  } catch {
    return false;
  }
}

// ─── Server-side Session Validation ───────────────────────
/**
 * Verifikasi bahwa httpOnly cookie session masih valid di server.
 *
 * Meskipun localStorage sudah bilang "authorized", kita tetap cek
 * ke server untuk memastikan cookie tidak expired/dimodifikasi.
 * Ini mencegah bypass dengan cara memanipulasi localStorage.
 *
 * Returns: true jika session valid, false otherwise.
 */
export async function verifyServerSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/check-session", {
      cache: "no-store",
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// ─── Password Verification ─────────────────────────────────
export async function verifyAdminKey(password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/verify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.status === 429) {
      // Rate limited — lempar error spesifik biar UI bisa handle
      const data = await response.json();
      throw new Error(data.message || "Terlalu banyak percobaan");
    }

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        grantAdminAccess();
        return true;
      }
    }
    return false;
  } catch (error) {
    // Re-throw rate limit errors
    if (error instanceof Error && error.message.includes("Terlalu banyak")) {
      throw error;
    }
    return false;
  }
}

// ─── Set local UI flag ────────────────────────────────────
export function grantAdminAccess(): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ authorized: true, timestamp: Date.now() }),
  );
}

// ─── Revoke Admin Access ──────────────────────────────────
export async function revokeAdminAccess(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Best effort — cookie will expire on its own
  }
}
