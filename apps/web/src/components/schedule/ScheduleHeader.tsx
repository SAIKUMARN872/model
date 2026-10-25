"use client";

import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type ScheduleHeaderProps = {
  onNewSchedule: () => void;
};

export default function ScheduleHeader({
  onNewSchedule,
}: ScheduleHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <h1 className="text-lg font-semibold">Schedule</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewSchedule}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={17} />
          New Schedule
        </button>
      </div>
    </header>
  );
}