"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Clock3,
  DollarSign,
  Gauge,
  Zap,
} from "lucide-react";

const usageItems = [
  {
    title: "Tokens",
    value: "No data yet",
    description: "Token consumption will appear here.",
    icon: Activity,
  },
  {
    title: "Cost",
    value: "No data yet",
    description: "AI spending will appear here.",
    icon: DollarSign,
  },
  {
    title: "Latency",
    value: "No data yet",
    description: "Average response latency will appear here.",
    icon: Clock3,
  },
  {
    title: "Quality",
    value: "No data yet",
    description: "Model quality metrics will appear here.",
    icon: Gauge,
  },
];

export default function UsageOverview() {
  const router = useRouter();

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            Usage Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monitor ModelNow usage, cost, latency and quality.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/chart")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <BarChart3 size={14} />
          View Analytics
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {usageItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <Icon size={18} />
                </div>

                <Zap
                  size={14}
                  className="text-slate-300"
                />
              </div>

              <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {item.title}
              </div>

              <div className="mt-2 text-lg font-semibold text-slate-900">
                {item.value}
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}