"use client";

import {
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type SmallDataTrainingProfileProps = {
  enabled: boolean;
};

export default function SmallDataTrainingProfile({
  enabled,
}: SmallDataTrainingProfileProps) {
  if (!enabled) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Sparkles size={21} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Small-data training profile
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
            ModelNow adjusted the training workflow
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Because this dataset is small, ModelNow will use a more
            conservative training configuration and place additional emphasis
            on validation, stability and efficient adaptation.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-white/80 p-5">
          <Gauge
            size={19}
            className="text-blue-600"
          />

          <h3 className="mt-3 text-sm font-bold text-slate-900">
            Conservative adaptation
          </h3>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Reduce unnecessary training changes when limited examples are
            available.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white/80 p-5">
          <ShieldCheck
            size={19}
            className="text-blue-600"
          />

          <h3 className="mt-3 text-sm font-bold text-slate-900">
            Stronger validation
          </h3>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Place more emphasis on dataset quality and evaluation signals.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white/80 p-5">
          <CheckCircle2
            size={19}
            className="text-blue-600"
          />

          <h3 className="mt-3 text-sm font-bold text-slate-900">
            Efficient training
          </h3>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Keep the workflow focused on efficient model adaptation.
          </p>
        </div>
      </div>
    </section>
  );
}