import { Device } from "@/types/device";

export function getDeviceByLocation(
  devices: Device[],
  location: string,
): Device | undefined {
  return devices.find((d) => d.location === location);
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

export function transformMonitoringData(devices: Device[]) {
  const map = new Map<
    string,
    {
      time: string;
      PDB?: number | null;
      UPS?: number | null;
      BATTERY?: number | null;
    }
  >();

  devices.forEach((device) => {
    device.readings.forEach((reading) => {
      if (!map.has(reading.time)) {
        map.set(reading.time, {
          time: reading.time,
        });
      }

      const row = map.get(reading.time)!;

      switch (device.location) {
        case "PDB":
          row.PDB = reading.temperature;
          break;

        case "UPS":
          row.UPS = reading.temperature;
          break;

        case "BATTERY":
          row.BATTERY = reading.temperature;
          break;
      }
    });
  });

  return [...map.values()].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
}
