"use client";

import {
  CheckCircle2,
  Pause,
  Play,
  ShieldCheck,
  Square,
  X,
} from "lucide-react";

import type {
  AgentConnectorDefinition,
  AgentToolDefinition,
  ApprovalDecision,
  WorkflowExecution,
} from "../../lib/agent-workflows-api";

type CatalogStage = {
  stage: string;
  stageIndex: number;
  tools: AgentToolDefinition[];
  connectors: AgentConnectorDefinition[];
};

type ExecutionPanelProps = {
  execution: WorkflowExecution;
  currentStageCatalog?: CatalogStage;
  controlLoading: boolean;
  canPause: boolean;
  canResume: boolean;
  canStop: boolean;
  onPause: () => void | Promise<void>;
  onResume: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  onApproval: (
    decision: ApprovalDecision,
  ) => void | Promise<void>;
  onClear: () => void;
};

function statusClasses(
  status: WorkflowExecution["status"],
) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "failed":
      return "border-red-200 bg-red-50 text-red-700";

    case "cancelled":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "paused":
    case "waiting":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

export default function ExecutionPanel({
  execution,
  currentStageCatalog,
  controlLoading,
  canPause,
  canResume,
  canStop,
  onPause,
  onResume,
  onStop,
  onApproval,
  onClear,
}: ExecutionPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Execution
          </p>

          <h3 className="mt-1 text-xl font-bold">
            Backend execution status
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            Execution ID:{" "}
            <span className="font-mono text-slate-700">
              {execution.executionId}
            </span>
          </p>
        </div>

        <div
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
            execution.status,
          )}`}
        >
          {execution.status}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>{execution.currentStage}</span>

          <span>
            {Math.round(execution.progress)}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, execution.progress),
              )}%`,
            }}
          />
        </div>
      </div>

      {currentStageCatalog && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Active stage capabilities
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-800">
                Tools
              </div>

              <div className="mt-2 text-sm font-bold text-blue-700">
                {currentStageCatalog.tools.length}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-800">
                Connectors
              </div>

              <div className="mt-2 text-sm font-bold text-blue-700">
                {currentStageCatalog.connectors.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Stage
          </p>

          <p className="mt-1 text-sm font-bold">
            {execution.currentStageIndex + 1} /{" "}
            {execution.totalStages}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Workflow
          </p>

          <p className="mt-1 truncate text-sm font-bold">
            {execution.workflowId}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Message
          </p>

          <p className="mt-1 text-sm font-bold">
            {execution.message ||
              "Waiting for backend update"}
          </p>
        </div>
      </div>

      {execution.approval?.required && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                Human approval required
              </h4>

              <p className="mt-1 text-sm text-amber-800">
                {execution.approval.description}
              </p>

              {execution.approval.proposedAction && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">
                  <span className="font-semibold">
                    Proposed action:
                  </span>{" "}
                  {execution.approval.proposedAction}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void onApproval("reject")
                  }
                  disabled={controlLoading}
                  className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void onApproval("approve")
                  }
                  disabled={controlLoading}
                  className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
                >
                  Approve & continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {execution.verification && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-slate-700"
            />

            <div>
              <div className="text-sm font-bold">
                Verification
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Status:{" "}
                {execution.verification.status}
              </div>

              {execution.verification.message && (
                <p className="mt-2 text-sm text-slate-600">
                  {execution.verification.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {execution.error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {execution.error}
        </div>
      )}

      {execution.result !== undefined &&
        execution.status === "completed" && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              <CheckCircle2 size={18} />
              Workflow completed
            </div>

            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-white p-4 text-xs text-slate-700">
              {JSON.stringify(
                execution.result,
                null,
                2,
              )}
            </pre>
          </div>
        )}

      <div className="mt-5 flex flex-wrap gap-2">
        {canPause && (
          <button
            type="button"
            onClick={() => void onPause()}
            disabled={controlLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            <Pause size={15} />
            Pause
          </button>
        )}

        {canResume && (
          <button
            type="button"
            onClick={() => void onResume()}
            disabled={controlLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Play size={15} />
            Resume
          </button>
        )}

        {canStop && (
          <button
            type="button"
            onClick={() => void onStop()}
            disabled={controlLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Square size={14} />
            Stop
          </button>
        )}

        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X size={15} />
          Clear
        </button>
      </div>
    </div>
  );
}