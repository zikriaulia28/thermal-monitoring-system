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
} from "@/components/charts/recharts";
import { useThresholds } from "@/hooks/useThresholds";

interface Props {
  data: {
    time: string;
    "Hum PDB": number | null;
    "Hum UPS": number | null;
    "Hum Baterai": number | null;
  }[];
}

function formatTime(value: string): string {
  const d = new Date(value);
  return d.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWIB(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ComparisonHumidityChart({ data }: Props) {
  const { humMin, humMax } = useThresholds();

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

        <ReferenceArea y1={humMax} y2={100} fill="#fef2f2" fillOpacity={0.5} />
        <ReferenceArea y1={-10} y2={humMin} fill="#fef2f2" fillOpacity={0.3} />

        <ReferenceLine
          y={humMax}
          stroke="#dc2626"
          strokeDasharray="6 3"
          strokeWidth={2}
          label={{ value: `CRITICAL ${humMax}%`, position: "insideTopRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }}
        />
        <ReferenceLine
          y={humMin}
          stroke="#dc2626"
          strokeDasharray="6 3"
          strokeWidth={2}
          label={{ value: `CRITICAL ${humMin}%`, position: "insideBottomRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }}
        />

        <XAxis
          dataKey="time"
          tickFormatter={formatTime}
          minTickGap={15}
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
        />

        <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} width={35} />

        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          labelFormatter={(value) => formatWIB(value)}
          formatter={(value, name) => [`${Number(value ?? 0).toFixed(2)} %`, name]}
        />

        <Legend wrapperStyle={{ fontSize: 11, paddingTop: "10px" }} iconType="circle" iconSize={8} />

        <Line type="natural" dataKey="Hum PDB" name="PDB" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={true} />
        <Line type="natural" dataKey="Hum UPS" name="UPS" stroke="#0d9488" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={true} />
        <Line type="natural" dataKey="Hum Baterai" name="BATTERY" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={true} />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
