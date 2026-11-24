"use client";

import {
  Bot,
  ChevronRight,
  CircleCheck,
  Clock3,
  GitBranch,
  Search,
} from "lucide-react";

const agents = [
  {
    name: "Sales Lead Agent",
    description: "Qualifies new leads and prepares follow-up actions.",
    status: "Active",
    icon: Bot,
  },
  {
    name: "Support Agent",
    description: "Handles customer support and knowledge retrieval.",
    status: "Active",
    icon: GitBranch,
  },
  {
    name: "Research Agent",
    description: "Researches information and summarizes findings.",
    status: "Active",
    icon: Search,
  },
];

export default function RecentAgents() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Recent Agents
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Continue working with your AI agents.
          </p>
        </div>

        <Bot
          size={20}
          className="text-slate-400"
        />
      </div>

      <div className="mt-5 space-y-3">
        {agents.map((agent) => {
          const Icon = agent.icon;

          return (
            <button
              key={agent.name}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {agent.name}
                </div>

                <div className="mt-1 text-xs leading-5 text-slate-500">
                  {agent.description}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <CircleCheck size={12} />
                    {agent.status}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock3 size={11} />
                    Recent
                  </span>
                </div>
              </div>

              <ChevronRight
                size={16}
                className="shrink-0 text-slate-300"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}