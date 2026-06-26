import { Device } from "@/types/device";

export function getDeviceByLocation(
  devices: Device[],
  location: string,
): Device | undefined {
  const loc = location.toUpperCase().trim();
  return devices.find((d) => {
    const dl = d.location.toUpperCase().trim();
    return dl.includes(loc) || loc.includes(dl);
  });
}

export function getLocationKey(location: string): string {
  const loc = location.toUpperCase().trim();
  if (loc.includes("PDB")) return "PDB";
  if (loc.includes("UPS")) return "UPS";
  if (loc.includes("BATTERY") || loc.includes("BAT")) return "BATTERY";
  return location;
}

// ───────────────────────────────────────────────────────────
// Time Axis — Regular Buckets per 1 Minute
// ───────────────────────────────────────────────────────────

function roundToMinute(iso: string): number {
  const t = new Date(iso).getTime();
  return Math.floor(t / 60000) * 60000;
}

/**
 * Generate regular time axis (1-minute buckets) spanning
 * the earliest to latest reading across all devices.
 */
export function generateTimeAxis(devices: Device[]): string[] {
  let minMs = Infinity;
  let maxMs = -Infinity;

  for (const device of devices) {
    for (const reading of device.readings) {
      const ms = roundToMinute(reading.time);
      if (ms < minMs) minMs = ms;
      if (ms > maxMs) maxMs = ms;
    }
  }

  if (!isFinite(minMs) || !isFinite(maxMs)) return [];

  const axis: string[] = [];
  for (let t = minMs; t <= maxMs; t += 60000) {
    axis.push(new Date(t).toISOString());
  }
  return axis;
}

/**
 * Align readings to a regular time axis.
 * Multiple readings in the same bucket are averaged.
 * Empty buckets get null.
 */
export function alignReadings(
  readings: Device["readings"],
  timeAxis: string[],
): { time: string; temperature: number | null; humidity: number | null }[] {
  const bucketMap = new Map<string, { temps: number[]; hums: number[] }>();

  for (const r of readings) {
    const bucketMs = roundToMinute(r.time);
    const key = new Date(bucketMs).toISOString();
    if (!bucketMap.has(key)) {
      bucketMap.set(key, { temps: [], hums: [] });
    }
    const bucket = bucketMap.get(key)!;
    bucket.temps.push(r.temperature);
    bucket.hums.push(r.humidity);
  }

  return timeAxis.map((time) => {
    const bucket = bucketMap.get(time);
    if (!bucket || bucket.temps.length === 0) {
      return { time, temperature: null, humidity: null };
    }
    return {
      time,
      temperature: Number(
        (bucket.temps.reduce((a, b) => a + b, 0) / bucket.temps.length).toFixed(2),
      ),
      humidity: Number(
        (bucket.hums.reduce((a, b) => a + b, 0) / bucket.hums.length).toFixed(2),
      ),
    };
  });
}

// ───────────────────────────────────────────────────────────
// Forward Fill — Last Observation Carried Forward (LOCF)
// ───────────────────────────────────────────────────────────

/**
 * Forward-fill null values for each field from the first
 * non-null value onwards. Leading nulls (before first data)
 * remain null. Internal and trailing nulls are replaced with
 * the last known value.
 *
 * This ensures all chart lines span the full time axis even
 * when sensors don't report at the same minute boundaries.
 */
export function locf<T extends Record<string, number | string | null>>(
  data: T[],
  fields: string[],
): T[] {
  if (data.length === 0) return data;

  // Clone all rows first
  const results: T[] = data.map((row) => ({ ...row }));

  // For each field, forward-fill nulls after first non-null value
  for (const field of fields) {
    let lastVal: number | null = null;
    let hasSeenData = false;

    for (let i = 0; i < results.length; i++) {
      const val = results[i][field] as number | null;

      if (val !== null) {
        lastVal = val;
        hasSeenData = true;
      } else if (hasSeenData) {
        // Internal or trailing null → fill with last known value
        results[i] = { ...results[i], [field]: lastVal as number };
      }
      // Leading nulls (before first data) remain null
    }
  }

  return results;
}

// ───────────────────────────────────────────────────────────
// Dashboard — Comparison Charts (Temperature + Humidity)
// ───────────────────────────────────────────────────────────

export function buildComparisonData(
  pdb?: Device,
  ups?: Device,
  battery?: Device,
) {
  const devices = [pdb, ups, battery].filter(Boolean) as Device[];
  const timeAxis = generateTimeAxis(devices);

  const pdbData = pdb ? alignReadings(pdb.readings, timeAxis) : [];
  const upsData = ups ? alignReadings(ups.readings, timeAxis) : [];
  const batData = battery ? alignReadings(battery.readings, timeAxis) : [];

  const combined = timeAxis.map((time, i) => ({
    time,
    "Ruang PDB": pdbData[i]?.temperature ?? null,
    "Ruang UPS": upsData[i]?.temperature ?? null,
    "Ruang Baterai": batData[i]?.temperature ?? null,
    "Hum PDB": pdbData[i]?.humidity ?? null,
    "Hum UPS": upsData[i]?.humidity ?? null,
    "Hum Baterai": batData[i]?.humidity ?? null,
  }));

  // Forward-fill trailing nulls so all lines end at the same X
  return locf(combined, [
    "Ruang PDB",
    "Ruang UPS",
    "Ruang Baterai",
    "Hum PDB",
    "Hum UPS",
    "Hum Baterai",
  ]);
}

// ───────────────────────────────────────────────────────────
// Monitoring — Transform Data + Alignment
// ───────────────────────────────────────────────────────────

export function transformMonitoringData(
  devices: Device[],
  type: "temperature" | "humidity" = "temperature",
) {
  const timeAxis = generateTimeAxis(devices);
  const valueField = type === "temperature" ? "temperature" : "humidity";

  // Pre-compute aligned data per device
  const deviceAligned = devices.map((device) => {
    const key = getLocationKey(device.location);
    const aligned = alignReadings(device.readings, timeAxis);
    return { key, aligned };
  });

  const combined = timeAxis.map((time, i) => {
    const row: Record<string, number | string | null> = { time };
    for (const { key, aligned } of deviceAligned) {
      row[key] = aligned[i]?.[valueField] ?? null;
    }
    return row;
  });

  // Forward-fill trailing nulls
  const keys = deviceAligned.map((d) => d.key);
  return locf(combined, keys);
}
