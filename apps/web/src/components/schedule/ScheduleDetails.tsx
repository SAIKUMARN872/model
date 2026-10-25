"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  X,
} from "lucide-react";

import type { ScheduleItem } from "./types";

type ScheduleDetailsProps = {
  schedule: ScheduleItem | null;
  open: boolean;

  onClose: () => void;
  onRunNow: () => void;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onCancel: () => void;
};

export default function ScheduleDetails({
  schedule,
  open,
  onClose,
  onRunNow,
  onPause,
  onResume,
  onRetry,
  onCancel,
}: ScheduleDetailsProps) {
  if (!open || !schedule) {
    return null;
  }

  const isScheduled = schedule.status === "Scheduled";
  const isRunning = schedule.status === "Running";
  const isPaused = schedule.status === "Paused";
  const isFailed = schedule.status === "Failed";
  const isCompleted = schedule.status === "Completed";
  const isCancelled = schedule.status === "Cancelled";

  const getStatusClass = () => {
    switch (schedule.status) {
      case "Completed":
        return "border-green-200 bg-green-50 text-green-700";

      case "Failed":
      case "Cancelled":
        return "border-red-200 bg-red-50 text-red-700";

      case "Paused":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";

      case "Running":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "Scheduled":
      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

        {/* Header */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">
              {schedule.title}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Schedule execution details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">

          {/* Status */}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Status
              </h3>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass()}`}
              >
                {schedule.status}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {schedule.executionStatus ||
                  "Waiting for execution."}
              </p>
            </div>
          </section>

          {/* Schedule Information */}

          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Schedule Information
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  Date
                </div>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {schedule.date}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} />
                  Time
                </div>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {schedule.time}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Task Type
                </p>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {schedule.taskType}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Timezone
                </p>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {schedule.timezone}
                </p>
              </div>

            </div>
          </section>

          {/* Description */}

          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Task
            </h3>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm leading-6 text-gray-600">
                {schedule.description}
              </p>
            </div>
          </section>

          {/* Recurrence */}

          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Recurrence
            </h3>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                {schedule.recurrence.type}
              </p>

              {schedule.recurrence.daysOfWeek &&
                schedule.recurrence.daysOfWeek.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Days:{" "}
                    {schedule.recurrence.daysOfWeek.join(", ")}
                  </p>
                )}

              {schedule.recurrence.dayOfMonth && (
                <p className="mt-2 text-xs text-gray-500">
                  Day of month:{" "}
                  {schedule.recurrence.dayOfMonth}
                </p>
              )}
            </div>
          </section>

          {/* Execution */}

          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Execution
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Next Run
                </p>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {schedule.nextRun || "Not scheduled"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">
                  Last Run
                </p>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {schedule.lastRun || "Not executed yet"}
                </p>
              </div>

            </div>
          </section>

          {/* Conditions */}

          {(schedule.conditions.runOnlyIf ||
            schedule.conditions.skipIf) && (
            <section className="border-t border-gray-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Conditions
              </h3>

              <div className="space-y-2 rounded-xl border border-gray-200 p-4">

                {schedule.conditions.runOnlyIf && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">
                      Run only if:
                    </span>{" "}
                    {schedule.conditions.runOnlyIf}
                  </p>
                )}

                {schedule.conditions.skipIf && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">
                      Skip if:
                    </span>{" "}
                    {schedule.conditions.skipIf}
                  </p>
                )}

              </div>
            </section>
          )}

          {/* Approval */}

          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Approval
            </h3>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                {schedule.approval}
              </p>
            </div>
          </section>

        </div>

        {/* Actions */}

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>

          <div className="flex flex-wrap gap-2">

            {/* Scheduled */}

            {isScheduled && (
              <>
                <button
                  type="button"
                  onClick={onRunNow}
                  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Play size={15} />
                  Run Now
                </button>

                <button
                  type="button"
                  onClick={onPause}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Pause size={15} />
                  Pause
                </button>
              </>
            )}

            {/* Running */}

            {isRunning && (
              <>
                <button
                  type="button"
                  onClick={onPause}
                  className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
                >
                  <Pause size={15} />
                  Pause
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <XCircle size={15} />
                  Cancel
                </button>
              </>
            )}

            {/* Paused */}

            {isPaused && (
              <>
                <button
                  type="button"
                  onClick={onResume}
                  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Play size={15} />
                  Resume
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <XCircle size={15} />
                  Cancel
                </button>
              </>
            )}

            {/* Failed */}

            {isFailed && (
              <>
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <RotateCcw size={15} />
                  Retry
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <XCircle size={15} />
                  Cancel
                </button>
              </>
            )}

            {/* Completed */}

            {isCompleted && (
              <>
                <button
                  type="button"
                  onClick={onRunNow}
                  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Play size={15} />
                  Run Again
                </button>

                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                  <CheckCircle2 size={15} />
                  Completed
                </div>
              </>
            )}

            {/* Cancelled */}

            {isCancelled && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                <XCircle size={15} />
                Cancelled
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}