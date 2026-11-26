import {
  Sparkles,
  Workflow,
} from "lucide-react";

import type {
  WorkflowPlanningState,
} from "../../lib/agent-workflows-api";

type PlanningReasoningPanelProps = {
  planning: WorkflowPlanningState;
};

function planStatusClasses(
  status:
    | "pending"
    | "active"
    | "completed"
    | "blocked"
    | "skipped",
) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "active":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "blocked":
      return "border-red-200 bg-red-50 text-red-700";

    case "skipped":
      return "border-slate-200 bg-slate-100 text-slate-500";

    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}

function reasoningStatusClasses(
  status:
    | "pending"
    | "active"
    | "completed",
) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "active":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}

export default function PlanningReasoningPanel({
  planning,
}: PlanningReasoningPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Planning + reasoning
          </p>

          <h3 className="mt-1 text-xl font-bold">
            Backend execution plan
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This plan was returned by the backend planner. The frontend does
            not invent or modify these reasoning stages.
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {planning.plan.length} plan steps
        </div>
      </div>

      {planning.intent && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Detected intent
          </div>

          <h4 className="mt-2 text-base font-bold text-slate-900">
            {planning.intent.name}
          </h4>

          {planning.intent.description && (
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {planning.intent.description}
            </p>
          )}

          {typeof planning.intent.confidence ===
            "number" && (
            <div className="mt-3 text-xs font-semibold text-slate-500">
              Confidence:{" "}
              {Math.round(
                planning.intent.confidence * 100,
              )}
              %
            </div>
          )}
        </div>
      )}

      {planning.message && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {planning.message}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Workflow
              size={17}
              className="text-slate-600"
            />

            <h4 className="text-sm font-bold">
              Planned execution
            </h4>
          </div>

          <div className="space-y-3">
            {planning.plan.map((step) => (
              <div
                key={step.id}
                className={`rounded-2xl border p-4 ${planStatusClasses(
                  step.status,
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-xs font-bold">
                    {step.index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        {step.title}
                      </div>

                      <span className="rounded-full border border-current px-2 py-0.5 text-[9px] font-semibold uppercase">
                        {step.status}
                      </span>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-600">
                      {step.stage}
                    </div>

                    {step.description && (
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {planning.plan.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
                The backend returned no planning steps.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles
              size={17}
              className="text-slate-600"
            />

            <h4 className="text-sm font-bold">
              Reasoning
            </h4>
          </div>

          <div className="space-y-3">
            {planning.reasoning.map((step) => (
              <div
                key={step.id}
                className={`rounded-2xl border p-4 ${reasoningStatusClasses(
                  step.status,
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-xs font-bold">
                    {step.index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        {step.title}
                      </div>

                      <span className="rounded-full border border-current px-2 py-0.5 text-[9px] font-semibold uppercase">
                        {step.status}
                      </span>
                    </div>

                    {step.description && (
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {planning.reasoning.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
                The backend returned no reasoning steps.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}