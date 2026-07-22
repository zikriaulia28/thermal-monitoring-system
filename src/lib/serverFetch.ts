import { headers } from "next/headers";

/**
 * Fetch dari server component ke route handler internal.
 * Pakai host dari request header (Next 16 server component tidak resolve relative URL otomatis).
 * cache: "no-store" — data realtime, tidak di-cache di server.
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (!host) return null;
    const res = await fetch(`${proto}://${host}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
