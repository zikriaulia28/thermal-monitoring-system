/**
 * Format an ISO timestamp string or Date to WIB (UTC+7) display.
 *
 * Examples:
 *   "2026-06-25T10:44:10.276Z"  → "17:44"     (short)
 *   "2026-06-25T10:44:10.276Z"  → "25/06 17:44" (medium)
 *   "2026-06-25T10:44:10.276Z"  → "25/06/2026 17:44:10" (long)
 */

export type WibFormat = "short" | "medium" | "long";

export function formatWIB(
  iso: string | Date | null | undefined,
  format: WibFormat = "short",
): string {
  if (!iso) return "--:--";

  const d = typeof iso === "string" ? new Date(iso) : iso;

  // UTC+7 offset
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const hh = pad(wib.getUTCHours());
  const mm = pad(wib.getUTCMinutes());
  const ss = pad(wib.getUTCSeconds());
  const dd = pad(wib.getUTCDate());
  const mo = pad(wib.getUTCMonth() + 1);
  const yyyy = wib.getUTCFullYear();

  switch (format) {
    case "long":
      return `${dd}/${mo}/${yyyy} ${hh}:${mm}:${ss} WIB`;
    case "medium":
      return `${dd}/${mo} ${hh}:${mm} WIB`;
    case "short":
    default:
      return `${hh}:${mm} WIB`;
  }
}
