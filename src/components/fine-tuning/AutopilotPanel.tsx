"use client";

import {
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

type AutopilotPanelProps = {
  running: boolean;
  complete: boolean;
  currentStep: number;
  progress: number;
  activeMessage: string;
  messages: string[];
};

export default function AutopilotPanel({
  running,
  complete,
  currentStep,
  progress,
  activeMessage,
}: AutopilotPanelProps) {
  const statusLabel = complete
    ? "Autopilot complete"
    : running
      ? "Autopilot running"
      : "Autopilot ready";

  const statusDescription = complete
    ? "The automated fine-tuning workflow has completed successfully."
    : running
      ? activeMessage
      : "ModelNow will automatically coordinate the fine-tuning workflow.";

  return (
    <section
      className={`rounded-3xl border bg-white p-6 shadow-sm sm:p-8 ${
        complete
          ? "border-emerald-200"
          : running
            ? "border-blue-200"
            : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              complete
                ? "bg-emerald-50 text-emerald-700"
                : running
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {complete ? (
              <CheckCircle2 size={14} />
            ) : running ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Sparkles size={14} />
            )}

            {statusLabel}
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            {complete
              ? "Your model lifecycle is complete."
              : "ModelNow Autopilot"}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {statusDescription}
          </p>
        </div>

        <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:w-auto sm:min-w-[150px]">
          <p className="text-xs font-medium text-slate-500">
            Progress
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {progress}%
          </p>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            complete
              ? "bg-emerald-500"
              : "bg-blue-600"
          }`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, progress),
            )}%`,
          }}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard
          label="Current stage"
          value={
            complete
              ? "Completed"
              : running
                ? `Stage ${currentStep}`
                : "Waiting"
          }
        />

        <StatusCard
          label="Automation"
          value="Managed automatically"
        />

        <StatusCard
          label="Training pipeline"
          value={
            complete
              ? "Ready"
              : running
                ? "Active"
                : "Prepared"
          }
        />
      </div>

      {running && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Loader2
              size={18}
              className="shrink-0 animate-spin text-blue-600"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-900">
                {activeMessage}
              </p>

              <p className="mt-1 text-xs text-blue-700">
                ModelNow is coordinating the current workflow stage.
              </p>
            </div>
          </div>
        </div>
      )}

      {complete && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Autopilot completed successfully
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                The selected model is ready for the next production
                lifecycle stages.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}