"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";

import { formatWIB } from "@/lib/formatWIB";

interface Props {
  data: {
    time: string;
    temperature: number;
    humidity: number;
  }[];
}

const formatWIBShort = (iso: string) => formatWIB(iso, "short");

export default function DeviceDetailChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="time"
            tickFormatter={formatWIBShort}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            minTickGap={15}
          />

          <YAxis
            yAxisId="temp"
            orientation="left"
            unit="°C"
            domain={[20, 50]}
            tick={{ fill: "#ef4444", fontSize: 10 }}
            tickLine={false}
            width={35}
          />

          <YAxis
            yAxisId="humidity"
            orientation="right"
            unit="%"
            domain={[40, 90]}
            tick={{ fill: "#3b82f6", fontSize: 10 }}
            tickLine={false}
            width={35}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(value) => formatWIB(value, "long")}
            formatter={(value, name) => {
              if (name === "Temperature") {
                return [`${Number(value).toFixed(2)} °C`, name];
              }
              return [`${Number(value).toFixed(2)} %`, name];
            }}
          />

          <Legend
            wrapperStyle={{
              fontSize: 11,
              paddingTop: "10px",
            }}
          />

          <Area
            yAxisId="temp"
            type="natural"
            dataKey="temperature"
            name="Temperature"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTemp)"
            activeDot={{ r: 4 }}
          />

          <Area
            yAxisId="humidity"
            type="natural"
            dataKey="humidity"
            name="Humidity"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHum)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
