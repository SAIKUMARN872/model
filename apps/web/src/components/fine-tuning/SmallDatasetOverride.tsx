"use client";

import {
  AlertTriangle,
  ArrowRight,
  Database,
} from "lucide-react";

type SmallDatasetOverrideProps = {
  examples: number;
  enabled: boolean;
  onEnable: () => void;
};

export default function SmallDatasetOverride({
  examples,
  enabled,
  onEnable,
}: SmallDatasetOverrideProps) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Small dataset detected
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
            {examples.toLocaleString()} training examples detected
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            ModelNow normally expects a larger dataset for automated
            fine-tuning. You can still continue, but the platform will treat
            this as a small-data training workflow.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-white/80 p-4">
          <Database
            size={18}
            className="text-amber-700"
          />

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Dataset size
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {examples.toLocaleString()} examples
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Workflow
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            Small-data optimization
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            User control
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            Optional override
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          The override does not skip validation. It only allows a validated
          small dataset to continue into preparation and training.
        </p>

        <button
          type="button"
          onClick={onEnable}
          disabled={enabled}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            enabled
              ? "cursor-default bg-emerald-100 text-emerald-700"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {enabled
            ? "Small-data mode enabled"
            : "Continue with small dataset"}

          {!enabled && <ArrowRight size={16} />}
        </button>
      </div>
    </section>
  );
}