import { Monitor, Wifi, WifiOff, Thermometer, Droplets } from "lucide-react";
import { Device } from "@/types/device";

interface Props {
  devices: Device[];
}

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
    {
      label: "Total Device",
      value: devices.length,
      icon: Monitor,
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Online",
      value: online,
      icon: Wifi,
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-green-500/20",
    },
    {
      label: "Offline",
      value: offline,
      icon: WifiOff,
      gradient: "from-red-500 to-rose-600",
      shadow: "shadow-red-500/20",
    },
    {
      label: "Avg Temp",
      value: tempCount > 0 ? `${(temp / tempCount).toFixed(1)}°C` : "-",
      icon: Thermometer,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Avg Humidity",
      value: humCount > 0 ? `${(hum / humCount).toFixed(1)}%` : "-",
      icon: Droplets,
      gradient: "from-cyan-500 to-blue-600",
      shadow: "shadow-cyan-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="relative group overflow-hidden rounded-xl border bg-white p-4 shadow-sm 
                       dark:bg-slate-800 dark:border-slate-700
                       hover:shadow-md transition-all duration-200"
          >
            {/* Gradient Accent Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
            />

            {/* Icon */}
            <div
              className={`mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg
                         bg-gradient-to-br ${stat.gradient} ${stat.shadow}
                         text-white shadow-sm`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Value */}
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>

            {/* Label */}
            <div className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
