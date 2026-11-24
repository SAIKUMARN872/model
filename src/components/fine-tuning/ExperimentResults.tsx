"use client";

import {
  BarChart3,
  CheckCircle2,
  FlaskConical,
  Trophy,
} from "lucide-react";

type Experiment = {
  name: string;
  strategy: string;
  status: string;
  score: number;
  description: string;
};

type ExperimentResultsProps = {
  experiments: Experiment[];
};

export default function ExperimentResults({
  experiments,
}: ExperimentResultsProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">
            Automatic experimentation
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            ModelNow compares training runs automatically.
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
          <FlaskConical size={14} />
          Experiment engine
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
        ModelNow evaluates multiple training strategies and
        identifies the candidate that best matches the objective.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {experiments.map((experiment) => {
          const isSelected =
            experiment.status.toLowerCase() ===
            "selected";

          return (
            <div
              key={experiment.name}
              className={`rounded-2xl border p-5 ${
                isSelected
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <BarChart3 size={18} />
                </div>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    <Trophy size={12} />
                    Selected
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    Evaluated
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-sm font-bold">
                {experiment.name}
              </h3>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {experiment.strategy}
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {experiment.description}
              </p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Evaluation score
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {experiment.score}%
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2
                    size={20}
                    className="text-emerald-600"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}