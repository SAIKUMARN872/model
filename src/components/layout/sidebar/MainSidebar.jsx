
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  BarChart3,
  Settings2,
  Image,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

// Scheduled icon – custom ChatGPT-style clock
function ScheduledIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l-3 2" />
    </svg>
  );
}

// Library icon – custom outlined books
function LibraryIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="9" y="4" width="5" height="16" rx="1.5" />
      <path d="M15 5h2a2 2 0 0 1 2 1.8l1 11a2 2 0 0 1-2 2.2h-3" />
    </svg>
  );
}

// Plugins icon – custom circular spiral
function PluginsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
      <path d="M15.5 9.5c-.5-1.4-1.7-2.2-3.3-2.2-2.2 0-3.7 1.7-3.7 4.1 0 2 1 3.4 2.6 3.4 1.2 0 2.2-.8 2.6-2" />
      <path d="M14.7 10.8c-.1 1.8-.9 2.9-2 2.9-1 0-1.6-.8-1.5-2.1.1-1.4.8-2.3 1.9-2.3 1 0 1.6.6 1.6 1.5Z" />
    </svg>
  );
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Chat",
    icon: MessageSquare,
  },
  {
    title: "Agents",
    icon: Bot,
  },
  {
    title: "Analytics",
    icon: BarChart3,
  },
  {
    title: "Images",
    icon: Image,
  },
  {
    title: "Schedule",
    icon: ScheduledIcon,
  },
  {
    title: "Library",
    icon: LibraryIcon,
  },
  {
    title: "Plugins",
    icon: PluginsIcon,
  },
  {
    title: "Settings",
    icon: Settings2,
  },
];

export default function MainSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100">

      {/* Brand */}
      <div className="border-b border-slate-800 px-5 py-5">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          ModelNow
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          AI Workspace
        </p>
      </div>

      {/* Workspace */}
      <div className="border-b border-slate-800 p-3">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-3 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <SidebarItem
              key={item.title}
              title={item.title}
              icon={
                <Icon
                  size={19}
                  strokeWidth={1.7}
                  className="shrink-0"
                />
              }
            />
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-4">
        <p className="text-xs text-slate-500">
          ModelNow Workspace
        </p>
        <p className="mt-1 text-[10px] text-slate-600">
          Enterprise AI Platform
        </p>
      </div>

    </aside>
  );
}
