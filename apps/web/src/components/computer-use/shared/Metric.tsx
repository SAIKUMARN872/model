type MetricProps = {
  label: string;
  value: string;
};

export default function Metric({
  label,
  value,
}: MetricProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}