"use client";

import {
  Check,
  Circle,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";

export type WorkflowStatus =
  | "pending"
  | "running"
  | "completed"
  | "approval_required"
  | "failed";

export type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
};

type WorkflowTimelineProps = {
  steps: WorkflowStep[];
};

const statusLabels: Record<WorkflowStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  approval_required: "Approval required",
  failed: "Failed",
};

function getStepIcon(status: WorkflowStatus) {
  if (status === "completed") {
    return <Check className="h-4 w-4" strokeWidth={2.5} />;
  }

  if (status === "running") {
    return (
      <Loader2 className="h-4 w-4 animate-spin" />
    );
  }

  if (status === "approval_required") {
    return <ShieldAlert className="h-4 w-4" />;
  }

  if (status === "failed") {
    return <X className="h-4 w-4" strokeWidth={2.5} />;
  }

  return <Circle className="h-3 w-3" />;
}

function getIconStyle(status: WorkflowStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-500 bg-emerald-500 text-white";

    case "running":
      return "border-blue-500 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100";

    case "approval_required":
      return "border-amber-500 bg-amber-50 text-amber-700";

    case "failed":
      return "border-red-500 bg-red-50 text-red-600";

    default:
      return "border-slate-300 bg-white text-slate-400";
  }
}

function getCardStyle(status: WorkflowStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-100 bg-white";

    case "running":
      return "border-blue-200 bg-blue-50/60 shadow-sm";

    case "approval_required":
      return "border-amber-200 bg-amber-50/60";

    case "failed":
      return "border-red-200 bg-red-50/60";

    default:
      return "border-slate-200 bg-white";
  }
}

function getStatusStyle(status: WorkflowStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";

    case "running":
      return "bg-blue-100 text-blue-700";

    case "approval_required":
      return "bg-amber-100 text-amber-800";

    case "failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
}

function getConnectorStyle(
  currentStatus: WorkflowStatus,
) {
  return currentStatus === "completed"
    ? "bg-emerald-300"
    : "bg-slate-200";
}

export default function WorkflowTimeline({
  steps,
}: WorkflowTimelineProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Execution workflow
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track each stage of your browser automation task.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600">
            {steps.length} stages
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-5">
        <ol className="space-y-0">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isActive = step.status === "running";
            const isApproval =
              step.status === "approval_required";
            const isFailed = step.status === "failed";
            const isCompleted =
              step.status === "completed";

            return (
              <li
                key={step.id}
                className="flex gap-4"
              >
                {/* Timeline rail */}
                <div className="flex w-9 shrink-0 flex-col items-center">
                  <div
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${getIconStyle(
                      step.status,
                    )}`}
                  >
                    {getStepIcon(step.status)}

                    {isActive && (
                      <span className="absolute inset-0 -z-10 animate-ping rounded-full border border-blue-300 opacity-40" />
                    )}
                  </div>

                  {!isLast && (
                    <div
                      className={`min-h-12 w-px flex-1 transition-colors duration-300 ${getConnectorStyle(
                        step.status,
                      )}`}
                    />
                  )}
                </div>

                {/* Step card */}
                <div
                  className={`mb-4 min-w-0 flex-1 rounded-xl border p-4 transition-all duration-300 ${getCardStyle(
                    step.status,
                  )}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Step {index + 1}
                        </span>

                        {isActive && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                        )}
                      </div>

                      <h3
                        className={`mt-1 text-sm font-semibold ${
                          isFailed
                            ? "text-red-900"
                            : isApproval
                              ? "text-amber-900"
                              : isActive
                                ? "text-blue-900"
                                : "text-slate-900"
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusStyle(
                        step.status,
                      )}`}
                    >
                      {statusLabels[step.status]}
                    </span>
                  </div>

                  <p
                    className={`mt-2 text-sm leading-5 ${
                      step.status === "pending"
                        ? "text-slate-400"
                        : isFailed
                          ? "text-red-700"
                          : isApproval
                            ? "text-amber-700"
                            : "text-slate-500"
                    }`}
                  >
                    {step.description}
                  </p>

                  {isActive && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-100/70 px-3 py-2 text-xs font-medium text-blue-700">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ModelNow is processing this stage...
                    </div>
                  )}

                  {isApproval && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-800">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      User confirmation is required before continuing.
                    </div>
                  )}

                  {isFailed && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-100/70 px-3 py-2 text-xs font-medium text-red-700">
                      <X className="h-3.5 w-3.5" />
                      This stage could not be completed.
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      Stage completed successfully
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}