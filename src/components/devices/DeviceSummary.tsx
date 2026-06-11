import { Device } from "@/types/device";

interface Props {
  devices: Device[];
}

export default function DeviceSummary({ devices }: Props) {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.filter((d) => d.status === "offline").length;

  let temp = 0;
  let hum = 0;
  let total = 0;

  devices.forEach((device) => {
    const latest = device.readings.at(-1);

    if (latest) {
      temp += latest.temperature;
      hum += latest.humidity;
      total++;
    }
  });

  return (
    // ✅ PERBAIKAN: grid-cols-2 untuk mobile, gap lebih kecil di mobile
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      <SummaryCard title="Total Device" value={devices.length} />
      <SummaryCard title="Online" value={online} />
      <SummaryCard title="Offline" value={offline} />
      <SummaryCard
        title="Avg Temperature"
        value={total > 0 ? `${(temp / total).toFixed(1)}°C` : "-"}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    // ✅ PERBAIKAN: Padding dan font size menyesuaikan layar
    <div className="rounded-xl border bg-white p-3 sm:p-5 shadow-sm">
      <p className="text-xs sm:text-sm text-slate-500">{title}</p>
      <h3 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">{value}</h3>
    </div>
  );
}
