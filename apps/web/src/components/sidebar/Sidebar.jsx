import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Brain,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "Chat", icon: MessageSquare },
  { title: "Agents", icon: Bot },
  { title: "Models", icon: Brain },
  { title: "Analytics", icon: BarChart3 },
  { title: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-5">

      <h2 className="text-2xl font-bold mb-8">
        AI Platform
      </h2>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-slate-800 transition"
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}