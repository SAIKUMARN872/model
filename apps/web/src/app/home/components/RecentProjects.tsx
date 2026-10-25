"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  Database,
  FolderKanban,
  Headphones,
  Layers3,
  Target,
} from "lucide-react";

const projects = [
  {
    name: "AI Automation",
    description: "Automate repetitive business operations.",
    icon: BriefcaseBusiness,
  },
  {
    name: "Enterprise RAG",
    description: "Private knowledge and enterprise search.",
    icon: Database,
  },
  {
    name: "Customer Support",
    description: "AI-powered customer support workflows.",
    icon: Headphones,
  },
  {
    name: "AI Agents",
    description: "Build and manage intelligent agents.",
    icon: Layers3,
  },
  {
    name: "Model Evaluation",
    description: "Evaluate model quality and performance.",
    icon: Target,
  },
  {
    name: "Analytics",
    description: "Monitor usage, cost and AI performance.",
    icon: BarChart3,
  },
];

export default function RecentProjects() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Recent Projects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Continue working on your ModelNow projects.
          </p>
        </div>

        <FolderKanban
          size={20}
          className="text-slate-400"
        />
      </div>

      <div className="mt-5 grid gap-3">
        {projects.map((project) => {
          const Icon = project.icon;

          return (
            <button
              key={project.name}
              type="button"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {project.name}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {project.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}