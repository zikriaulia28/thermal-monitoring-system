"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import { MonitoringChartData } from "@/types/monitoring";
import { Loader2 } from "lucide-react";

interface Props {
  data: MonitoringChartData[];
  isLoading?: boolean;
}

export default function MonitoringChart({ data, isLoading }: Props) {
  return (
    <div className="rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
          Temperature Monitoring
        </h2>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* ✅ Tinggi chart responsif: 250px (mobile) -> 300px (tablet) -> 380px (desktop) */}
      <div className="h-[250px] sm:h-[300px] md:h-[380px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="time"
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              minTickGap={20}
            />

            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              width={35}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelFormatter={(value) =>
                new Date(value).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />

            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: "10px" }}
              iconType="circle"
            />

            <Line
              type="monotone"
              dataKey="PDB"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="UPS"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="BATTERY"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
