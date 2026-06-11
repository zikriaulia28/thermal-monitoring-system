interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const styles = {
    Online: "bg-green-100 text-green-700",
    Offline: "bg-red-100 text-red-700",
    Warning: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles]
      }`}
    >
      {status}
    </span>
  );
}
