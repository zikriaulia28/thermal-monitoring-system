interface Props {
  status: "online" | "offline";
}

export default function DeviceStatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        status === "online"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status === "online" ? "Online" : "Offline"}
    </span>
  );
}
