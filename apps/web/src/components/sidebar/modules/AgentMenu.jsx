import { Bot, PlusCircle, Workflow } from "lucide-react";

export default function AgentMenu() {
  const items = [
    {
      icon: <Bot size={18} />,
      label: "All Agents",
    },
    {
      icon: <PlusCircle size={18} />,
      label: "Create Agent",
    },
    {
      icon: <Workflow size={18} />,
      label: "Workflows",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase">
        Agents
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