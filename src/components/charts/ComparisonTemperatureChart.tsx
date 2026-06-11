"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    time: string;
    "Ruang PDB": number | null;
    "Ruang UPS": number | null;
    "Ruang Baterai": number | null;
  }[];
}

export default function ComparisonTemperatureChart({ data }: Props) {
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
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

        <XAxis
          dataKey="time"
          minTickGap={15}
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
        />

        <YAxis
          unit="°C"
          domain={[20, 45]}
          tick={{ fontSize: 10, fill: "#64748b" }}
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
          formatter={(value) => [`${value} °C`]}
        />

        <Legend
          wrapperStyle={{
            fontSize: 11,
            paddingTop: "10px",
          }}
        />

        <Line
          type="natural"
          dataKey="Ruang PDB"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />

        <Line
          type="natural"
          dataKey="Ruang UPS"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />

        <Line
          type="natural"
          dataKey="Ruang Baterai"
          stroke="#eab308"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
