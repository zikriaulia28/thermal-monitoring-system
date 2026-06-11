import DeviceCard from "./DeviceCard";
import { Device } from "@/types/device";

interface Props {
  devices: Device[];
}

export default function DeviceGrid({ devices }: Props) {
  // ✅ PERBAIKAN: 1 kolom di mobile, 2 kolom di tablet (sm), 3 kolom di desktop besar (xl)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
}
