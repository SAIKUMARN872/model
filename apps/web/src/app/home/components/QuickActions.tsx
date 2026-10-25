"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  Globe,
  Workflow,
} from "lucide-react";

type QuickAction = {
  title: string;
  description: string;
  route: string;
  icon: React.ElementType;
};

const quickActions: QuickAction[] = [
  {
    title: "New Agent",
    description: "Create and configure an AI agent.",
    route: "/agent-builder",
    icon: Bot,
  },
  {
    title: "New Workflow",
    description: "Build an AI-powered business workflow.",
    route: "/home/features/agents-workflows",
    icon: Workflow,
  },
  {
    title: "Browser Task",
    description: "Start an automated browser task.",
    route: "/home/features/browser-automation",
    icon: Globe,
  },
  {
    title: "View Analytics",
    description: "Monitor AI usage, cost and performance.",
    route: "/chart",
    icon: BarChart3,
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Start common ModelNow tasks quickly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              type="button"
              onClick={() => router.push(action.route)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                <Icon size={19} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {action.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}