"use client";

import {
  BrainCircuit,
  Cpu,
  Database,
  Gauge,
} from "lucide-react";

type ExpertViewProps = {
  baseModel: string;
  trainingMethod: string;
  optimization: string;
  evaluation: string;
};

export default function ExpertView({
  baseModel,
  trainingMethod,
  optimization,
  evaluation,
}: ExpertViewProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <BrainCircuit size={18} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Advanced transparency
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            ModelNow expert view
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            ModelNow manages these technical decisions automatically.
            Expert view exposes the selected configuration without
            requiring manual configuration.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ExpertCard
          title="Base model"
          value={baseModel}
          icon={<Database size={17} />}
        />

        <ExpertCard
          title="Training method"
          value={trainingMethod}
          icon={<BrainCircuit size={17} />}
        />

        <ExpertCard
          title="Optimization"
          value={optimization}
          icon={<Gauge size={17} />}
        />

        <ExpertCard
          title="Compute"
          value="ModelNow infrastructure"
          icon={<Cpu size={17} />}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Evaluation strategy
        </p>

        <p className="mt-2 text-sm font-semibold text-blue-950">
          {evaluation}
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-800">
          ModelNow selects evaluation and benchmarking signals
          based on the dataset and business objective.
        </p>
      </div>
    </section>
  );
}

function ExpertCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-medium">
          {title}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}