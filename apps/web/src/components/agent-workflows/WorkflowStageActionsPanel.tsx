"use client";

import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  GitBranch,
  Link2,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import type {
  WorkflowStageAction,
  WorkflowStageDefinition,
} from "../../lib/agent-workflows-api";

type WorkflowStageActionsPanelProps = {
  stage: WorkflowStageDefinition | null;
};

function getActionIcon(
  action: WorkflowStageAction,
) {
  switch (action.type) {
    case "tool":
      return Wrench;

    case "connector":
      return Link2;

    case "approval":
      return ShieldCheck;

    case "decision":
      return GitBranch;

    case "verification":
      return CheckCircle2;

    case "navigation":
      return ChevronRight;

    case "input":
    default:
      return CircleAlert;
  }
}

function getActionClasses(
  action: WorkflowStageAction,
) {
  if (!action.enabled) {
    return {
      container:
        "border-slate-200 bg-slate-50 text-slate-400",
      icon:
        "bg-slate-100 text-slate-400",
    };
  }

  if (action.requiresApproval) {
    return {
      container:
        "border-amber-200 bg-amber-50 text-amber-900",
      icon:
        "bg-amber-100 text-amber-700",
    };
  }

  return {
    container:
      "border-slate-200 bg-white text-slate-900",
    icon:
      "bg-slate-100 text-slate-600",
  };
}

export default function WorkflowStageActionsPanel({
  stage,
}: WorkflowStageActionsPanelProps) {
  if (!stage) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Current workflow stage
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {stage.name}
          </h3>

          {stage.description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {stage.description}
            </p>
          )}
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {stage.actions.length}{" "}
          {stage.actions.length === 1
            ? "action"
            : "actions"}
        </div>
      </div>

      {stage.actions.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {stage.actions.map(
            (action) => {
              const Icon =
                getActionIcon(action);

              const classes =
                getActionClasses(action);

              return (
                <div
                  key={action.id}
                  className={`rounded-2xl border p-4 transition ${classes.container}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes.icon}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold">
                          {action.label}
                        </h4>

                        {!action.enabled && (
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                            Disabled
                          </span>
                        )}

                        {action.requiresApproval && (
                          <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                            Approval
                          </span>
                        )}
                      </div>

                      {action.description && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {action.description}
                        </p>
                      )}

                      {(action.toolId ||
                        action.connectorId) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {action.toolId && (
                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500">
                              Tool:{" "}
                              {action.toolId}
                            </span>
                          )}

                          {action.connectorId && (
                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500">
                              Connector:{" "}
                              {action.connectorId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          The backend has not provided any
          actions for this stage.
        </div>
      )}
    </div>
  );
}