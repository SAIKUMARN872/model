"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  PauseCircle,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";

type ActionStatus =
  | "completed"
  | "running"
  | "pending"
  | "approval"
  | "failed";

type BrowserAction = {
  id: string;
  step: number;
  title: string;
  detail: string;
};

type BrowserActionStreamProps = {
  task: string;
  currentStep: number;
  isRunning: boolean;
  isPaused: boolean;
  approvalRequired: boolean;
  isCompleted?: boolean;
  isFailed?: boolean;
  failureMessage?: string;
};

const TOTAL_STEPS = 9;

const actions: BrowserAction[] = [
  {
    id: "understand-request",
    step: 0,
    title: "Understanding request",
    detail:
      "Parsing the task and identifying the user's requirements.",
  },
  {
    id: "detect-constraints",
    step: 0,
    title: "Detecting constraints",
    detail:
      "Identifying preferences, limits, dates, quantities, and conditions.",
  },
  {
    id: "create-plan",
    step: 1,
    title: "Creating execution plan",
    detail:
      "Building a step-by-step browser automation workflow.",
  },
  {
    id: "select-tools",
    step: 1,
    title: "Selecting browser tools",
    detail:
      "Preparing navigation, interaction, and page-reading actions.",
  },
  {
    id: "open-website",
    step: 2,
    title: "Opening website",
    detail:
      "Navigating to the most relevant web application.",
  },
  {
    id: "locate-page",
    step: 2,
    title: "Locating relevant page",
    detail:
      "Finding the page required to complete the requested task.",
  },
  {
    id: "navigate",
    step: 3,
    title: "Navigating page",
    detail:
      "Moving through the website and interacting with controls.",
  },
  {
    id: "interact",
    step: 3,
    title: "Interacting with page",
    detail:
      "Clicking, scrolling, typing, or selecting available controls.",
  },
  {
    id: "search",
    step: 4,
    title: "Running search",
    detail:
      "Searching for the requested product, service, or information.",
  },
  {
    id: "read-results",
    step: 4,
    title: "Reading search results",
    detail:
      "Extracting relevant information from the available results.",
  },
  {
    id: "compare",
    step: 5,
    title: "Comparing options",
    detail:
      "Reviewing available choices against the task requirements.",
  },
  {
    id: "select",
    step: 5,
    title: "Preparing selection",
    detail:
      "Preparing the option that best matches the requested criteria.",
  },
  {
    id: "prepare-action",
    step: 6,
    title: "Preparing final action",
    detail:
      "Preparing the requested booking, purchase, submission, or action.",
  },
  {
    id: "review-sensitive-action",
    step: 6,
    title: "Reviewing sensitive action",
    detail:
      "Checking that the final action is ready for user confirmation.",
  },
  {
    id: "approval",
    step: 7,
    title: "Waiting for approval",
    detail:
      "User confirmation is required before the sensitive action continues.",
  },
  {
    id: "verify-action",
    step: 8,
    title: "Verifying result",
    detail:
      "Checking that the requested action completed successfully.",
  },
  {
    id: "capture-result",
    step: 8,
    title: "Capturing final result",
    detail:
      "Preparing the verified result for the user.",
  },
];

function getActionStatus(
  action: BrowserAction,
  currentStep: number,
  isRunning: boolean,
  isPaused: boolean,
  approvalRequired: boolean,
  isCompleted: boolean,
  isFailed: boolean,
): ActionStatus {
  if (isFailed && action.step === currentStep) {
    return "failed";
  }

  if (isCompleted) {
    return "completed";
  }

  if (approvalRequired && action.step === 7) {
    return "approval";
  }

  if (action.step < currentStep) {
    return "completed";
  }

  if (action.step > currentStep) {
    return "pending";
  }

  if (isPaused || isRunning) {
    return "running";
  }

  return "pending";
}

function getTaskLabel(task: string) {
  const value = task.toLowerCase();

  if (
    value.includes("movie") ||
    value.includes("film") ||
    value.includes("cinema") ||
    value.includes("ticket")
  ) {
    return "Movie automation";
  }

  if (
    value.includes("laptop") ||
    value.includes("computer") ||
    value.includes("phone") ||
    value.includes("shopping") ||
    value.includes("product") ||
    value.includes("buy")
  ) {
    return "Shopping automation";
  }

  if (
    value.includes("flight") ||
    value.includes("hotel") ||
    value.includes("travel") ||
    value.includes("trip")
  ) {
    return "Travel automation";
  }

  if (
    value.includes("restaurant") ||
    value.includes("food") ||
    value.includes("delivery") ||
    value.includes("order")
  ) {
    return "Food automation";
  }

  return "Browser automation";
}

function getProgress({
  currentStep,
  isCompleted,
}: {
  currentStep: number;
  isCompleted: boolean;
}) {
  if (isCompleted) {
    return 100;
  }

  const completedSteps = Math.max(
    0,
    Math.min(currentStep, TOTAL_STEPS),
  );

  return Math.round(
    (completedSteps / TOTAL_STEPS) * 100,
  );
}

function getStatusText({
  isRunning,
  isPaused,
  approvalRequired,
  isCompleted,
  isFailed,
}: {
  isRunning: boolean;
  isPaused: boolean;
  approvalRequired: boolean;
  isCompleted: boolean;
  isFailed: boolean;
}) {
  if (isFailed) {
    return "Execution failed";
  }

  if (approvalRequired) {
    return "Waiting for approval";
  }

  if (isPaused) {
    return "Execution paused";
  }

  if (isRunning) {
    return "Agent is working";
  }

  if (isCompleted) {
    return "Completed";
  }

  return "Ready";
}

export default function BrowserActionStream({
  task,
  currentStep,
  isRunning,
  isPaused,
  approvalRequired,
  isCompleted = false,
  isFailed = false,
  failureMessage,
}: BrowserActionStreamProps) {
  const safeCurrentStep = Math.max(
    0,
    Math.min(currentStep, TOTAL_STEPS - 1),
  );

  const progress = getProgress({
    currentStep,
    isCompleted,
  });

  const statusText = getStatusText({
    isRunning,
    isPaused,
    approvalRequired,
    isCompleted,
    isFailed,
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isFailed
                  ? "bg-red-50 text-red-600"
                  : approvalRequired
                    ? "bg-amber-50 text-amber-600"
                    : isPaused
                      ? "bg-orange-50 text-orange-600"
                      : isCompleted
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
              }`}
            >
              {isFailed ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Live Browser Activity
              </h2>

              <p className="mt-1 truncate text-xs text-slate-500">
                {getTaskLabel(task)}
              </p>
            </div>
          </div>

          <div
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              isFailed
                ? "bg-red-50 text-red-700"
                : approvalRequired
                  ? "bg-amber-50 text-amber-700"
                  : isPaused
                    ? "bg-orange-50 text-orange-700"
                    : isRunning
                      ? "bg-blue-50 text-blue-700"
                      : isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
            }`}
          >
            {statusText}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Execution progress
            </span>

            <span className="text-[11px] font-medium text-slate-600">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFailed
                  ? "bg-red-500"
                  : approvalRequired
                    ? "bg-amber-500"
                    : isPaused
                      ? "bg-orange-500"
                      : isCompleted
                        ? "bg-emerald-500"
                        : "bg-blue-600"
              }`}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Failure message */}
        {isFailed && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

              <div>
                <p className="text-xs font-semibold text-red-900">
                  Automation failed
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {failureMessage ??
                    "The browser automation could not complete this step."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="max-h-[430px] overflow-y-auto p-4">
        <div className="space-y-1">
          {actions.map((action, index) => {
            const status = getActionStatus(
              action,
              safeCurrentStep,
              isRunning,
              isPaused,
              approvalRequired,
              isCompleted,
              isFailed,
            );

            const isActive =
              status === "running" ||
              status === "approval" ||
              status === "failed";

            return (
              <div
                key={action.id}
                className={`relative flex gap-3 rounded-xl px-3 py-3 transition-colors ${
                  status === "running"
                    ? "bg-blue-50"
                    : status === "approval"
                      ? "bg-amber-50"
                      : status === "failed"
                        ? "bg-red-50"
                        : "bg-white"
                }`}
              >
                {index < actions.length - 1 && (
                  <div className="absolute left-[18px] top-[34px] h-[calc(100%+4px)] w-px bg-slate-200" />
                )}

                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                  {status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}

                  {status === "running" &&
                    (isPaused ? (
                      <PauseCircle className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    ))}

                  {status === "approval" && (
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                  )}

                  {status === "failed" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}

                  {status === "pending" && (
                    <Clock3 className="h-4 w-4 text-slate-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold ${
                        status === "completed"
                          ? "text-slate-700"
                          : status === "running"
                            ? "text-blue-800"
                            : status === "approval"
                              ? "text-amber-800"
                              : status === "failed"
                                ? "text-red-800"
                                : "text-slate-400"
                      }`}
                    >
                      {action.title}
                    </p>

                    <span
                      className={`text-[10px] ${
                        status === "completed"
                          ? "text-emerald-600"
                          : status === "running"
                            ? "text-blue-600"
                            : status === "approval"
                              ? "text-amber-600"
                              : status === "failed"
                                ? "text-red-600"
                                : "text-slate-400"
                      }`}
                    >
                      {status === "completed"
                        ? "Done"
                        : status === "running"
                          ? "Live"
                          : status === "approval"
                            ? "Approval"
                            : status === "failed"
                              ? "Failed"
                              : "Next"}
                    </span>
                  </div>

                  <p
                    className={`mt-1 text-[11px] leading-5 ${
                      status === "pending"
                        ? "text-slate-400"
                        : status === "failed"
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {action.detail}
                  </p>

                  {status === "running" && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-blue-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                      {isPaused
                        ? "Browser session paused"
                        : "Processing browser action..."}
                    </div>
                  )}

                  {status === "approval" && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-amber-700">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Confirmation required before continuing
                    </div>
                  )}

                  {status === "failed" && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-red-700">
                      <XCircle className="h-3.5 w-3.5" />
                      This step could not be completed
                    </div>
                  )}

                  {isActive && status === "running" && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-blue-100">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}