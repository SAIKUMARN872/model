// src/app/home/components/ActivityFeed.tsx

"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bot,
  Database,
  Workflow,
} from "lucide-react";

export default function ActivityFeed() {
  const router = useRouter();

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Activity size={17} />
            </div>

            <h2 className="text-xl font-bold">
              Recent Activity
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Track recent activity across your ModelNow workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/observability")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Open Observability
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <ActivityPreview
            icon={Bot}
            title="Agents"
            description="Agent activity will appear here."
          />

          <ActivityPreview
            icon={Workflow}
            title="Workflows"
            description="Workflow activity will appear here."
          />

          <ActivityPreview
            icon={Database}
            title="Knowledge"
            description="Knowledge and RAG activity will appear here."
          />
        </div>

        <div className="border-t border-slate-100 px-5 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Activity size={20} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No recent activity
          </h3>

          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
            Activity events will appear here when agents, workflows,
            knowledge systems, models, or other platform features are used.
          </p>
        </div>
      </div>
    </section>
  );
}

function ActivityPreview({
  icon,
  title,
  description,
}: {
  icon: typeof Bot;
  title: string;
  description: string;
}) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
        <Icon size={17} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}