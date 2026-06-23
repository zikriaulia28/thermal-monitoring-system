const ADMIN_KEY = "cpems2026";
const STORAGE_KEY = "cpems_admin";
const EXPIRY_HOURS = 24;

interface AdminSession {
  authorized: boolean;
  timestamp: number;
}

export function checkAdminAccess(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const session: AdminSession = JSON.parse(raw);
    if (!session.authorized) return false;

    const elapsed = Date.now() - session.timestamp;
    const maxAge = EXPIRY_HOURS * 60 * 60 * 1000;

    if (elapsed > maxAge) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function verifyAdminKey(key: string): boolean {
  return key === ADMIN_KEY;
}

export function grantAdminAccess(): void {
  const session: AdminSession = {
    authorized: true,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function revokeAdminAccess(): void {
  localStorage.removeItem(STORAGE_KEY);
}
