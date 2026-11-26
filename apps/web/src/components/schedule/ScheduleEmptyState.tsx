"use client";

import { CalendarPlus } from "lucide-react";

type ScheduleEmptyStateProps = {
  section: string;
  onNewSchedule: () => void;
};

export default function ScheduleEmptyState({
  section,
  onNewSchedule,
}: ScheduleEmptyStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
        <CalendarPlus size={24} />
      </div>

      <h3 className="mt-5 text-base font-semibold text-gray-900">
        No {section.toLowerCase()} schedules
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        Create a schedule to automate AI tasks, workflows, reports,
        browser actions, or other ModelNow operations.
      </p>

      <button
        type="button"
        onClick={onNewSchedule}
        className="mt-5 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Create Schedule
      </button>
    </div>
  );
}