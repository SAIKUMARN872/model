"use client";

import { WandSparkles } from "lucide-react";

type MonitoringPanelProps = {
  requests: string;
  latency: string;
  quality: string;
  errorRate: string;
};

export default function MonitoringPanel({
  requests,
  latency,
  quality,
  errorRate,
}: MonitoringPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Continuous monitoring
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          ModelNow is watching production behavior
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          The system tracks usage, latency, quality and error
          signals and can identify opportunities for another
          training cycle.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBox
          label="Requests"
          value={requests}
        />

        <MetricBox
          label="Latency"
          value={latency}
        />

        <MetricBox
          label="Quality"
          value={quality}
        />

        <MetricBox
          label="Error rate"
          value={errorRate}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600">
            <WandSparkles size={18} />
          </div>

          <div>
            <p className="font-semibold text-purple-950">
              Continuous improvement signal
            </p>

            <p className="mt-1 text-sm leading-6 text-purple-800">
              ModelNow can use future production signals and
              new training data to identify the next
              improvement cycle automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}