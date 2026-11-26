"use client";

import {
  MessageSquare,
  FileText,
  Upload,
  Settings,
} from "lucide-react";

const actions = [
  {
    icon: <MessageSquare size={20} />,
    label: "New Chat",
  },
  {
    icon: <Upload size={20} />,
    label: "Upload File",
  },
  {
    icon: <FileText size={20} />,
    label: "Create Prompt",
  },
  {
    icon: <Settings size={20} />,
    label: "Settings",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-3 rounded-lg border p-5 transition hover:bg-blue-50 hover:border-blue-400"
          >
            <div className="text-blue-600">
              {action.icon}
            </div>

            <span className="text-sm font-medium">
              {action.label}
            </span>
          </button>
        ))}

      </div>

    </div>
  );
}