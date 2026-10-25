"use client";

import type { LucideIcon } from "lucide-react";
import type { AgentId } from "../../lib/agent-workflows-api";

export type AgentTreeItem = {
  id: AgentId;
  name: string;
  description: string;
  icon: LucideIcon;
};

type AgentTreeProps = {
  agents: AgentTreeItem[];
  selectedAgentId: AgentId;
  disabled?: boolean;
  onSelect: (agentId: AgentId) => void;
};

export default function AgentTree({
  agents,
  selectedAgentId,
  disabled = false,
  onSelect,
}: AgentTreeProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Agents
        </p>

        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Agent tree
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Select an enterprise agent to view its exact workflow tree.
        </p>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const active = selectedAgentId === agent.id;

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelect(agent.id)}
              disabled={disabled}
              aria-pressed={active}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="flex gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold ${
                      active
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    {agent.name}
                  </div>

                  <p
                    className={`mt-1 text-[11px] leading-5 ${
                      active
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {agent.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}