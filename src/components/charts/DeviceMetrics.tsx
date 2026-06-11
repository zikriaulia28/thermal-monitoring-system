import { Device } from "@/types/device";
import { Thermometer, Droplets } from "lucide-react";

interface Props {
  devices: Device[];
}

export default function DeviceMetrics({ devices }: Props) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {devices.map((device) => {
        const latest = device.readings.at(-1);

        return (
          <div
            key={device.id}
            className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm"
          >
            {/* Device Name */}
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 truncate">
              {device.name}
            </div>

            {/* Metrics - Always stacked vertically for better readability */}
            <div className="space-y-3">
              {/* Temperature */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    Temp
                  </span>
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {latest?.temperature ?? "--"}°C
                </span>
              </div>

              {/* Humidity */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Hum
                  </span>
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {latest?.humidity ?? "--"}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
