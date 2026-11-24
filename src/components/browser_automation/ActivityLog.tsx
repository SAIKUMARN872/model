"use client";

import {
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export type ActivityStatus =
  | "completed"
  | "running"
  | "pending"
  | "approval"
  | "failed";

export type ActivityItem = {
  id: string;
  message: string;
  detail?: string;
  status: ActivityStatus;
};

type ActivityLogProps = {
  items: ActivityItem[];
};

const statusLabel: Record<ActivityStatus, string> = {
  completed: "Completed",
  running: "Running",
  pending: "Pending",
  approval: "Approval",
  failed: "Failed",
};

function ActivityIcon({
  status,
}: {
  status: ActivityStatus;
}) {
  switch (status) {
    case "completed":
      return (
        <CheckCircle2
          size={18}
          className="text-emerald-600"
        />
      );

    case "running":
      return (
        <Loader2
          size={18}
          className="animate-spin text-blue-600"
        />
      );

    case "approval":
      return (
        <ShieldCheck
          size={18}
          className="text-amber-600"
        />
      );

    case "failed":
      return (
        <XCircle
          size={18}
          className="text-red-600"
        />
      );

    default:
      return (
        <Circle
          size={18}
          className="text-slate-300"
        />
      );
  }
}

function iconBackgroundClass(status: ActivityStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-50";

    case "running":
      return "bg-blue-50";

    case "approval":
      return "bg-amber-50";

    case "failed":
      return "bg-red-50";

    default:
      return "bg-slate-50";
  }
}

function statusBadgeClass(status: ActivityStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";

    case "running":
      return "bg-blue-50 text-blue-700";

    case "approval":
      return "bg-amber-50 text-amber-700";

    case "failed":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
}

function messageClass(status: ActivityStatus) {
  switch (status) {
    case "running":
      return "text-blue-800";

    case "approval":
      return "text-amber-800";

    case "failed":
      return "text-red-800";

    case "completed":
      return "text-slate-800";

    default:
      return "text-slate-600";
  }
}

function rowBackgroundClass(status: ActivityStatus) {
  switch (status) {
    case "running":
      return "bg-blue-50/40";

    case "approval":
      return "bg-amber-50/50";

    case "failed":
      return "bg-red-50/40";

    default:
      return "bg-white";
  }
}

function getActivitySummary(items: ActivityItem[]) {
  if (items.length === 0) {
    return {
      label: "Waiting for activity",
      className: "text-slate-400",
      dotClassName: "bg-slate-300",
    };
  }

  const latest = items[items.length - 1];

  if (latest.status === "failed") {
    return {
      label: "Stopped",
      className: "text-red-600",
      dotClassName: "bg-red-500",
    };
  }

  if (latest.status === "approval") {
    return {
      label: "Waiting",
      className: "text-amber-600",
      dotClassName: "bg-amber-500",
    };
  }

  if (latest.status === "running") {
    return {
      label: "Updating",
      className: "text-blue-600",
      dotClassName: "bg-blue-500",
    };
  }

  if (
    latest.status === "completed" &&
    items.every((item) => item.status === "completed")
  ) {
    return {
      label: "Complete",
      className: "text-emerald-600",
      dotClassName: "bg-emerald-500",
    };
  }

  return {
    label: "Updating",
    className: "text-slate-500",
    dotClassName: "bg-slate-400",
  };
}

export default function ActivityLog({
  items,
}: ActivityLogProps) {
  const activitySummary = getActivitySummary(items);

  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;

  const runningCount = items.filter(
    (item) => item.status === "running",
  ).length;

  const failedCount = items.filter(
    (item) => item.status === "failed",
  ).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Activity
              </h2>

              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                Live
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Live browser automation events
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-2 text-[11px] font-medium ${activitySummary.className}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${activitySummary.dotClassName} ${
                activitySummary.label === "Updating"
                  ? "animate-pulse"
                  : ""
              }`}
            />

            {activitySummary.label}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <ActivitySummary
              label="Events"
              value={items.length}
            />

            <ActivitySummary
              label="Completed"
              value={completedCount}
            />

            {runningCount > 0 && (
              <ActivitySummary
                label="Running"
                value={runningCount}
              />
            )}

            {failedCount > 0 && (
              <ActivitySummary
                label="Failed"
                value={failedCount}
              />
            )}
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="max-h-[420px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Clock3 size={18} />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-600">
              Waiting for browser activity
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
              Activity from the automation workflow will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const isLatest =
                index === items.length - 1;

              return (
                <div
                  key={item.id}
                  className={`flex gap-3 px-5 py-4 transition-colors ${rowBackgroundClass(
                    item.status,
                  )}`}
                >
                  {/* Timeline */}
                  <div className="flex shrink-0 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBackgroundClass(
                        item.status,
                      )}`}
                    >
                      <ActivityIcon status={item.status} />
                    </div>

                    {index < items.length - 1 && (
                      <div className="mt-1 min-h-6 w-px flex-1 bg-slate-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-semibold ${messageClass(
                              item.status,
                            )}`}
                          >
                            {item.message}
                          </p>

                          {isLatest &&
                            item.status === "running" && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                            )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadgeClass(
                          item.status,
                        )}`}
                      >
                        {statusLabel[item.status]}
                      </span>
                    </div>

                    {item.detail && (
                      <p className="mt-1.5 text-xs leading-5 text-slate-500">
                        {item.detail}
                      </p>
                    )}

                    {item.status === "running" && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-100/60 px-3 py-2 text-[11px] font-medium text-blue-700">
                        <Loader2
                          size={12}
                          className="animate-spin"
                        />

                        ModelNow is processing this stage...
                      </div>
                    )}

                    {item.status === "approval" && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100/60 px-3 py-2 text-[11px] font-medium text-amber-700">
                        <ShieldCheck size={12} />

                        Waiting for your confirmation
                      </div>
                    )}

                    {item.status === "failed" && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-100/60 px-3 py-2 text-[11px] font-medium text-red-700">
                        <XCircle size={12} />

                        Workflow stopped at this stage.
                      </div>
                    )}

                    {item.status === "completed" && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-emerald-600">
                        <CheckCircle2 size={12} />

                        Event completed successfully
                      </div>
                    )}

                    {item.status === "pending" && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-400">
                        <Clock3 size={12} />

                        Waiting for this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function ActivitySummary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-700">
          {value}
        </span>
      </div>
    </div>
  );
}