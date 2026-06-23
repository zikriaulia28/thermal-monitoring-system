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
  ReferenceLine,
  ReferenceArea,
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
      <LineChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />

        <ReferenceArea y1={35} y2={100} fill="#fef2f2" fillOpacity={0.5} />
        <ReferenceArea y1={30} y2={35} fill="#fff7ed" fillOpacity={0.3} />
        <ReferenceArea y1={-10} y2={15} fill="#eff6ff" fillOpacity={0.3} />

        <ReferenceLine
          y={35}
          stroke="#dc2626"
          strokeDasharray="6 3"
          strokeWidth={2}
          label={{ value: "CRITICAL 35°C", position: "insideTopRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }}
        />
        <ReferenceLine
          y={30}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeWidth={2}
          label={{ value: "WARNING 30°C", position: "insideTopRight", fill: "#f59e0b", fontSize: 10, fontWeight: "bold" }}
        />
        <ReferenceLine
          y={15}
          stroke="#3b82f6"
          strokeDasharray="4 4"
          strokeWidth={2}
          label={{ value: "LOW 15°C", position: "insideBottomRight", fill: "#3b82f6", fontSize: 10, fontWeight: "bold" }}
        />

        <XAxis
          dataKey="time"
          minTickGap={15}
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
        />

        <YAxis
          unit="°C"
          domain={[10, 45]}
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          formatter={(value: any, name: any) => [`${Number(value).toFixed(2)} °C`, name]}
        />

        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: "10px" }}
          iconType="circle"
          iconSize={8}
        />

        <Line
          type="natural"
          dataKey="Ruang PDB"
          name="PDB"
          stroke="#dc2626"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={true}
        />

        <Line
          type="natural"
          dataKey="Ruang UPS"
          name="UPS"
          stroke="#d97706"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={true}
        />

        <Line
          type="natural"
          dataKey="Ruang Baterai"
          name="BATTERY"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
