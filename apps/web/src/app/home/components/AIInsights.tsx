"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Gauge,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

const insightItems = [
  {
    title: "Cost Optimization",
    description:
      "AI cost-saving recommendations will appear here once usage data is connected.",
    icon: DollarSign,
  },
  {
    title: "Latency Optimization",
    description:
      "Latency patterns and optimization suggestions will appear here.",
    icon: Gauge,
  },
  {
    title: "Model Quality",
    description:
      "Quality and evaluation insights will appear here after model activity is available.",
    icon: BarChart3,
  },
  {
    title: "Security & Governance",
    description:
      "Security and governance insights will appear here from platform activity.",
    icon: ShieldCheck,
  },
];

export default function AIInsights() {
  const router = useRouter();

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Lightbulb size={17} />
            </div>

            <h2 className="text-xl font-bold">
              AI Insights
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Intelligent recommendations for improving your AI platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/chart")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          View Analytics
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insightItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 inline-flex rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                    Awaiting platform data
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}