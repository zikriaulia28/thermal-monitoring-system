import { PrismaClient } from "@prisma/client";
import type { Settings } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  settingsCache: {
    data: Settings | null;
    ts: number;
  };
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In-memory cache — Settings jarang berubah, fetch max setiap 10 detik
const CACHE_TTL = 10_000;
globalForPrisma.settingsCache ??= { data: null, ts: 0 };

export async function getCachedSettings(): Promise<Settings | null> {
  const cache = globalForPrisma.settingsCache;
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }
  const settings = await prisma.settings.findFirst();
  cache.data = settings;
  cache.ts = Date.now();
  return settings;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
