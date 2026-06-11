interface Props {
  severity: string;
}

export default function SeverityBadge({ severity }: Props) {
  if (severity === "HIGH") {
    return (
      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
        HIGH
      </span>
    );
  }

  if (severity === "MEDIUM") {
    return (
      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
        MEDIUM
      </span>
    );
  }

  return (
    <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
      LOW
    </span>
  );
}
