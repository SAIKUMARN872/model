"use client";

import {
  Bell,
  Calendar,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";

import type {
  ApprovalMode,
  RecurrenceType,
  ScheduleConditions,
  ScheduleRecurrence,
  ScheduleTaskType,
} from "./types";

type CreateScheduleModalProps = {
  open: boolean;

  title: string;
  description: string;

  taskType: ScheduleTaskType;

  date: string;
  time: string;
  timezone: string;

  recurrence: ScheduleRecurrence;

  conditions: ScheduleConditions;

  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    beforeExecution: boolean;
  };

  approval: ApprovalMode;

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;

  onTaskTypeChange: (value: ScheduleTaskType) => void;

  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;

  onRecurrenceChange: (
    value: ScheduleRecurrence
  ) => void;

  onConditionsChange: (
    value: ScheduleConditions
  ) => void;

  onNotificationsChange: (value: {
    onSuccess: boolean;
    onFailure: boolean;
    beforeExecution: boolean;
  }) => void;

  onApprovalChange: (value: ApprovalMode) => void;

  onClose: () => void;
  onCreate: () => void;
};

const taskTypes: ScheduleTaskType[] = [
  "AI Task",
  "Agent Workflow",
  "Browser Automation",
  "Computer Use",
  "Knowledge Hub",
  "Plugin Workflow",
];

const recurrenceOptions: RecurrenceType[] = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
  "Custom",
];

export default function CreateScheduleModal({
  open,
  title,
  description,
  taskType,
  date,
  time,
  timezone,
  recurrence,
  conditions,
  notifications,
  approval,
  onTitleChange,
  onDescriptionChange,
  onTaskTypeChange,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
  onRecurrenceChange,
  onConditionsChange,
  onNotificationsChange,
  onApprovalChange,
  onClose,
  onCreate,
}: CreateScheduleModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Create Schedule
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Automate an AI task or ModelNow workflow.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Task */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Task
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Schedule Name
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    onTitleChange(event.target.value)
                  }
                  placeholder="e.g. Daily AI Report"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  What should ModelNow do?
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    onDescriptionChange(event.target.value)
                  }
                  placeholder="Describe the task in natural language..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Task Type
                </label>

                <select
                  value={taskType}
                  onChange={(event) =>
                    onTaskTypeChange(
                      event.target.value as ScheduleTaskType
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                >
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Schedule
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Calendar size={14} />
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    onDateChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Clock size={14} />
                  Time
                </label>

                <input
                  type="time"
                  value={time}
                  onChange={(event) =>
                    onTimeChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Timezone
                </label>

                <select
                  value={timezone}
                  onChange={(event) =>
                    onTimezoneChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                >
                  <option value="Asia/Kolkata">
                    Asia/Kolkata (IST)
                  </option>

                  <option value="UTC">
                    UTC
                  </option>

                  <option value="America/New_York">
                    America/New_York
                  </option>

                  <option value="America/Los_Angeles">
                    America/Los_Angeles
                  </option>

                  <option value="Europe/London">
                    Europe/London
                  </option>

                  <option value="Asia/Singapore">
                    Asia/Singapore
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Recurrence */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Repeat
            </h3>

            <select
              value={recurrence.type}
              onChange={(event) =>
                onRecurrenceChange({
                  ...recurrence,
                  type: event.target.value as RecurrenceType,
                })
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            >
              {recurrenceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {recurrence.type !== "None" && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Advanced recurrence rules will be configured here.
                </p>
              </div>
            )}
          </section>

          {/* Conditions */}
          <section className="border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Conditions
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={conditions.runOnlyIf ?? ""}
                onChange={(event) =>
                  onConditionsChange({
                    ...conditions,
                    runOnlyIf: event.target.value,
                  })
                }
                placeholder="Run only if... (optional)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />

              <input
                type="text"
                value={conditions.skipIf ?? ""}
                onChange={(event) =>
                  onConditionsChange({
                    ...conditions,
                    skipIf: event.target.value,
                  })
                }
                placeholder="Skip if... (optional)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </section>

          {/* Notifications */}
          <section className="border-t border-gray-100 pt-6">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={16} className="text-gray-600" />

              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={notifications.onSuccess}
                  onChange={(event) =>
                    onNotificationsChange({
                      ...notifications,
                      onSuccess: event.target.checked,
                    })
                  }
                />
                Notify me when the task succeeds
              </label>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={notifications.onFailure}
                  onChange={(event) =>
                    onNotificationsChange({
                      ...notifications,
                      onFailure: event.target.checked,
                    })
                  }
                />
                Notify me when the task fails
              </label>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={notifications.beforeExecution}
                  onChange={(event) =>
                    onNotificationsChange({
                      ...notifications,
                      beforeExecution: event.target.checked,
                    })
                  }
                />
                Notify me before execution
              </label>
            </div>
          </section>

          {/* Approval */}
          <section className="border-t border-gray-100 pt-6">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-gray-600" />

              <h3 className="text-sm font-semibold text-gray-900">
                Approval
              </h3>
            </div>

            <select
              value={approval}
              onChange={(event) =>
                onApprovalChange(
                  event.target.value as ApprovalMode
                )
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            >
              <option value="Always">
                Always require approval
              </option>

              <option value="Risky Actions">
                Require approval for risky actions
              </option>

              <option value="Never">
                No approval required
              </option>
            </select>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onCreate}
            disabled={!title.trim() || !date || !time}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Schedule
          </button>
        </div>
      </div>
    </div>
  );
}