import { Brain, Cpu, Layers } from "lucide-react";

export default function ModelMenu() {
  const items = [
    {
      icon: <Brain size={18} />,
      label: "Available Models",
    },
    {
      icon: <Cpu size={18} />,
      label: "Model Router",
    },
    {
      icon: <Layers size={18} />,
      label: "Compare Models",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">
        Models
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