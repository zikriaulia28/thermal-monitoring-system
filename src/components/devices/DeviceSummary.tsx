import { Monitor, Wifi, WifiOff, Thermometer, Droplets } from "lucide-react";
import { Device } from "@/types/device";

interface Props {
  devices: Device[];
}

const COLOR_MAP: Record<string, string> = {
  Device: "var(--primary)",
  Online: "var(--cpems-online)",
  Offline: "var(--cpems-offline)",
  Temp: "var(--cpems-temp)",
  Humidity: "var(--cpems-humidity)",
};

export default function DeviceSummary({ devices }: Props) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.filter((d) => d.status === "offline").length;

  let temp = 0;
  let hum = 0;
  let tempCount = 0;
  let humCount = 0;

  devices.forEach((device) => {
    const latest = device.readings.at(-1);
    if (latest) {
      temp += latest.temperature;
      tempCount++;
      hum += latest.humidity;
      humCount++;
    }
  });

  const statCards = [
    { label: "Total Perangkat", value: devices.length, icon: Monitor, key: "Device" },
    { label: "Online", value: online, icon: Wifi, key: "Online" },
    { label: "Offline", value: offline, icon: WifiOff, key: "Offline" },
    { label: "Rata-rata Suhu", value: tempCount > 0 ? `${(temp / tempCount).toFixed(1)}°C` : "-", icon: Thermometer, key: "Temp" },
    { label: "Rata-rata Kelembaban", value: humCount > 0 ? `${(hum / humCount).toFixed(1)}%` : "-", icon: Droplets, key: "Humidity" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const accent = COLOR_MAP[stat.key];
        return (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* left accent bar */}
            <div
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
              style={{ backgroundColor: accent }}
            />
            <div className="pl-4">
              <div
                className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg text-white shadow-sm"
                style={{ backgroundColor: accent }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-data text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
