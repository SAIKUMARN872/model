import { BarChart3, Activity, TrendingUp } from "lucide-react";

export default function AnalyticsMenu() {
  const items = [
    {
      icon: <BarChart3 size={18} />,
      label: "Overview",
    },
    {
      icon: <Activity size={18} />,
      label: "Usage",
    },
    {
      icon: <TrendingUp size={18} />,
      label: "Performance",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">
        Analytics
      </h3>

      {items.map((item) => (
        <button
          key={item.label}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800 transition"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}