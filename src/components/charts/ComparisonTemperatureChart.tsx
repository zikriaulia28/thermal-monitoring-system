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
import { useThresholds } from "@/hooks/useThresholds";

interface Props {
  data: {
    time: string;
    "Ruang PDB": number | null;
    "Ruang UPS": number | null;
    "Ruang Baterai": number | null;
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

export default function ComparisonTemperatureChart({ data }: Props) {
  const { tempMin, tempMax, tempWarning } = useThresholds();

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

        <ReferenceArea y1={tempMax + 5} y2={tempMax + 20} fill="#fef2f2" fillOpacity={0.5} />
        <ReferenceArea y1={tempWarning} y2={tempMax} fill="#fff7ed" fillOpacity={0.3} />
        <ReferenceArea y1={-10} y2={tempMin} fill="#eff6ff" fillOpacity={0.3} />

        <ReferenceLine
          y={tempMax + 5}
          stroke="#dc2626"
          strokeDasharray="6 3"
          strokeWidth={2}
          label={{ value: `CRITICAL ${tempMax + 5}°C`, position: "insideTopRight", fill: "#dc2626", fontSize: 10, fontWeight: "bold" }}
        />
        <ReferenceLine
          y={tempWarning}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeWidth={2}
          label={{ value: `WARNING ${tempWarning}°C`, position: "insideTopRight", fill: "#f59e0b", fontSize: 10, fontWeight: "bold" }}
        />
        <ReferenceLine
          y={tempMin}
          stroke="#3b82f6"
          strokeDasharray="4 4"
          strokeWidth={2}
          label={{ value: `LOW ${tempMin}°C`, position: "insideBottomRight", fill: "#3b82f6", fontSize: 10, fontWeight: "bold" }}
        />

        <XAxis
          dataKey="time"
          tickFormatter={formatTime}
          minTickGap={15}
          tick={{ fontSize: 10, fill: "#64748b" }}
          tickLine={false}
        />

        <YAxis
          unit="°C"
          domain={[tempMin - 5, tempMax + 10]}
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
          labelFormatter={(value) => formatWIB(value)}
          formatter={(value: number | string, name: string) => [`${Number(value).toFixed(2)} °C`, name]}
        />

        <Legend wrapperStyle={{ fontSize: 11, paddingTop: "10px" }} iconType="circle" iconSize={8} />

        <Line type="natural" dataKey="Ruang PDB" name="PDB" stroke="#dc2626" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={true} />
        <Line type="natural" dataKey="Ruang UPS" name="UPS" stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={true} />
        <Line type="natural" dataKey="Ruang Baterai" name="BATTERY" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls={true} />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
