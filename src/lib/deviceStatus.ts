export const OFFLINE_THRESHOLD = 5 * 60 * 1000; // 5 menit

export function getDeviceStatus(lastSeen: Date | string | null) {
  if (!lastSeen) return "offline";

  const last = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);

  const diff = Date.now() - last.getTime();

  return diff < OFFLINE_THRESHOLD ? "online" : "offline";
}
