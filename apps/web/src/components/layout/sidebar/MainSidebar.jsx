import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

export default function MainSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">

      <div className="p-5 text-2xl font-bold border-b border-slate-700">
        AI Dashboard
      </div>

      <WorkspaceSwitcher />

      <nav className="flex-1 p-4 space-y-2">

        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          title="Dashboard"
        />

        <SidebarItem
          icon={<MessageSquare size={18} />}
          title="Chat"
        />

        <SidebarItem
          icon={<Bot size={18} />}
          title="Agents"
        />

        <SidebarItem
          icon={<BarChart3 size={18} />}
          title="Analytics"
        />

        <SidebarItem
          icon={<Settings size={18} />}
          title="Settings"
        />

      </nav>

    </aside>
  );
}