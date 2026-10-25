"use client";

import {
  CheckCircle2,
  RefreshCw,
  Workflow,
} from "lucide-react";

import type { WorkflowExecution } from "../../lib/agent-workflows-api";

type WorkflowTreeProps = {
  agentId: string;
  steps: string[];
  execution: WorkflowExecution | null;
};

function getStageState(
  execution: WorkflowExecution | null,
  index: number,
) {
  if (!execution) {
    return "pending";
  }

  if (index < execution.currentStageIndex) {
    return "completed";
  }

  if (index === execution.currentStageIndex) {
    if (execution.status === "completed") {
      return "completed";
    }

    return "running";
  }

  return "pending";
}

export default function WorkflowTree({
  agentId,
  steps,
  execution,
}: WorkflowTreeProps) {
  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Workflow tree
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            These stages define the agent workflow.
          </p>
        </div>

        <Workflow
          size={18}
          className="text-slate-400"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const state = getStageState(
              execution,
              index,
            );

            return (
              <div
                key={`${agentId}-${step}`}
              >
                <div
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                    state === "completed"
                      ? "border-emerald-200 bg-emerald-50"
                      : state === "running"
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      state === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : state === "running"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {state === "completed" ? (
                      <CheckCircle2 size={19} />
                    ) : state === "running" ? (
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {step}
                    </div>

                    {execution &&
                      execution.currentStage ===
                        step && (
                        <div className="mt-1 text-xs text-slate-500">
                          {execution.message ||
                            "Backend is processing this stage."}
                        </div>
                      )}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                      state === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : state === "running"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {state}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="ml-9 h-4 border-l border-dashed border-slate-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}