export default function MetricBadge({ status }) {
  const color =
    status === "high"
      ? "bg-red-100 text-red-700"
      : status === "low"
      ? "bg-yellow-100 text-yellow-700"
      : status === "abnormal"
      ? "bg-purple-100 text-purple-700"
      : "bg-green-100 text-green-700"; // default = normal

  const label = status ? status[0].toUpperCase() + status.slice(1) : "Normal";

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold tracking-wide ${color}`}
    >
      {label}
    </span>
  );
}
