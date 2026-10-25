"use client";

import type { ElementType } from "react";

export type MediaTool = {
  id: string;
  name: string;
  description: string;
  icon: ElementType;
};

type ToolSidebarProps = {
  activeCategory: string;
  tools: MediaTool[];
  selectedTool: string;
  onToolSelect: (tool: MediaTool) => void;
};

export default function ToolSidebar({
  activeCategory,
  tools,
  selectedTool,
  onToolSelect,
}: ToolSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="px-3 pb-3 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {activeCategory} capabilities
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Select a multimodal operation
        </p>
      </div>

      <div className="max-h-[600px] space-y-1 overflow-y-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolSelect(tool)}
              className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  active ? "bg-white/10" : "bg-slate-50"
                }`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    active ? "text-white" : "text-slate-800"
                  }`}
                >
                  {tool.name}
                </p>

                <p
                  className={`mt-1 text-[11px] leading-4 ${
                    active ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {tool.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}