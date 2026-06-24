const STORAGE_KEY = "cpems_admin";

// Check if admin session exists (UI-only convenience check)
// NOTE: This is NOT a security check — it just tells the UI whether to show the Admin badge.
// The REAL security validation happens server-side via httpOnly cookie on every protected API call.
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

// Verify admin password via server-side API
// Returns true if password is correct (httpOnly cookie is set by server)
export async function verifyAdminKey(password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/verify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        grantAdminAccess();
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Set local UI flag (after successful server-side verification)
export function grantAdminAccess(): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ authorized: true, timestamp: Date.now() })
  );
}

// Revoke admin access — clears local UI flag + server-side cookie
export async function revokeAdminAccess(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);

  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Best effort — cookie will expire on its own
  }
}
