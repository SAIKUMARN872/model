"use client";

import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";

import { useState } from "react";

type ReminderPanelProps = {
  transactionId: string;
  onReminderComplete: () => void;
};

export default function ReminderPanel({
  transactionId,
  onReminderComplete,
}: ReminderPanelProps) {
  const [settingReminder, setSettingReminder] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const setReminder = () => {
    if (settingReminder || completed) {
      return;
    }

    setSettingReminder(true);

    window.setTimeout(() => {
      setSettingReminder(false);
      setCompleted(true);
      onReminderComplete();
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            completed
              ? "bg-emerald-100 text-emerald-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={19} />
          ) : (
            <Bell size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Reminder
              </h3>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                {completed
                  ? "The reminder was added successfully."
                  : "Set a reminder for this completed workflow."}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : settingReminder
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {completed
                ? "Scheduled"
                : settingReminder
                  ? "Saving"
                  : "Ready"}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <CalendarClock
                    size={15}
                    className="text-slate-500"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Reminder
                  </span>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-800">
                  Follow up in 24 hours
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Clock3
                    size={15}
                    className="text-slate-500"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Transaction
                  </span>
                </div>

                <p className="mt-1 break-all text-xs font-semibold text-slate-800">
                  {transactionId}
                </p>
              </div>
            </div>
          </div>

          {completed ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-800">
                Reminder scheduled successfully
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                The workflow is now ready for final activity and
                history recording.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={setReminder}
              disabled={settingReminder}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {settingReminder ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Saving Reminder...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Set Reminder
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}