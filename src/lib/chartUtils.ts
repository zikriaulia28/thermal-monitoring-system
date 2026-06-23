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

function roundTime(time: string): string {
  const d = new Date(time);
  d.setSeconds(0, 0);
  return d.toISOString();
}

export function buildComparisonData(
  pdb?: Device,
  ups?: Device,
  battery?: Device,
) {
  const map = new Map<
    string,
    {
      time: string;
      "Ruang PDB": number | null;
      "Ruang UPS": number | null;
      "Ruang Baterai": number | null;
      "Hum PDB": number | null;
      "Hum UPS": number | null;
      "Hum Baterai": number | null;
    }
  >();

  const insertDevice = (
    device: Device | undefined,
    tempKey: "Ruang PDB" | "Ruang UPS" | "Ruang Baterai",
    humKey: "Hum PDB" | "Hum UPS" | "Hum Baterai",
  ) => {
    if (!device) return;

    device.readings.forEach((reading) => {
      if (!map.has(reading.time)) {
        map.set(reading.time, {
          time: reading.time,
          "Ruang PDB": null,
          "Ruang UPS": null,
          "Ruang Baterai": null,
          "Hum PDB": null,
          "Hum UPS": null,
          "Hum Baterai": null,
        });
      }

      const row = map.get(reading.time)!;
      row[tempKey] = reading.temperature;
      row[humKey] = reading.humidity;
    });
  };

  insertDevice(pdb, "Ruang PDB", "Hum PDB");
  insertDevice(ups, "Ruang UPS", "Hum UPS");
  insertDevice(battery, "Ruang Baterai", "Hum Baterai");

  return [...map.values()].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
}

export function transformMonitoringData(
  devices: Device[],
  type: "temperature" | "humidity" = "temperature"
) {
  const map = new Map<string, Record<string, any>>();

  devices.forEach((device) => {
    const key = getLocationKey(device.location);

    device.readings.forEach((reading) => {
      const bucketTime = roundTime(reading.time);

      if (!map.has(bucketTime)) {
        map.set(bucketTime, { time: bucketTime });
      }

      const row = map.get(bucketTime)!;
      const value = type === "temperature" ? reading.temperature : reading.humidity;
      row[key] = value;
    });
  });

  return [...map.values()].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
}
