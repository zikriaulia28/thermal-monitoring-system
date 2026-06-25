/**
 * Adaptive device status detection.
 *
 * Threshold is dynamic berdasarkan monitoringIntervalSeconds dari Settings.
 * Formula: OFFLINE_AFTER = intervalSeconds × GRACE_MULTIPLIER
 *
 * Default fallback jika interval tidak disediakan: 5 menit (300.000ms)
 */
export const DEFAULT_INTERVAL_SECONDS = 60;
export const GRACE_MULTIPLIER = 3;

export function getOfflineThresholdMs(intervalSeconds?: number): number {
  return (intervalSeconds ?? DEFAULT_INTERVAL_SECONDS) * GRACE_MULTIPLIER * 1000;
}

export function getDeviceStatus(
  lastSeen: Date | string | null,
  intervalSeconds?: number,
): "online" | "offline" {
  if (!lastSeen) return "offline";

  const last = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);
  const threshold = getOfflineThresholdMs(intervalSeconds);

  return Date.now() - last.getTime() < threshold ? "online" : "offline";
}
