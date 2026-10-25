"use client";

type StatusBadgeProps = {
  status: "Indexed" | "Processing" | "Error" | string;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles =
    status === "Indexed"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : status === "Processing"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
        : status === "Error"
          ? "border-red-500/20 bg-red-500/10 text-red-400"
          : "border-white/10 bg-white/5 text-gray-400";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}
    >
      {status}
    </span>
  );
}