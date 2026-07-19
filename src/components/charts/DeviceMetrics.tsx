import { Thermometer, Droplets, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { DeviceDailyStat } from "@/types/dashboard";

interface Props {
  stats: DeviceDailyStat[];
  isLoading?: boolean;
  timeRange?: string;
}

const Skeleton = ({ width = "w-16" }: { width?: string }) => (
  <div className={`h-3 ${width} bg-slate-200 dark:bg-slate-700 rounded animate-pulse`} />
);

export default function DeviceMetrics({ stats, isLoading = false }: Props) {
  if (stats.length === 0) return null;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.deviceId}
          className="rounded-xl border bg-card border-border p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Device Name */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {stat.name}
            </span>
            <span className="text-[10px] font-medium text-slate-400 ml-auto bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
              {stat.count} data
            </span>
          </div>

          <div className="space-y-2">
            {/* ── Temperature ── */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-900/10 dark:to-red-900/5 border border-red-100 dark:border-red-900/20">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Temperature
                  </span>
                </div>
                {isLoading ? <Skeleton width="w-14" /> : (
                  <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {stat.avgTemp.toFixed(1)}°C
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-medium">
                <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                  <ArrowDown className="w-2.5 h-2.5" />
                  {isLoading ? <Skeleton width="w-10" /> : `${stat.minTemp.toFixed(1)}°`}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                  <ArrowUp className="w-2.5 h-2.5" />
                  {isLoading ? <Skeleton width="w-10" /> : `${stat.maxTemp.toFixed(1)}°`}
                </span>
              </div>
            </div>

            {/* ── Humidity ── */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/10 dark:to-blue-900/5 border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Humidity
                  </span>
                </div>
                {isLoading ? <Skeleton width="w-14" /> : (
                  <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {stat.avgHum.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-medium">
                <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                  <ArrowDown className="w-2.5 h-2.5" />
                  {isLoading ? <Skeleton width="w-10" /> : `${stat.minHum.toFixed(1)}%`}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                  <ArrowUp className="w-2.5 h-2.5" />
                  {isLoading ? <Skeleton width="w-10" /> : `${stat.maxHum.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
