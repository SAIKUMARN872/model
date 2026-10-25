"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Repeat,
} from "lucide-react";

import type { ScheduleItem } from "./types";

type ScheduleTaskCardProps = {
  schedule: ScheduleItem;
  onOpen?: () => void;
};

export default function ScheduleTaskCard({
  schedule,
  onOpen,
}: ScheduleTaskCardProps) {
  const getTypeIcon = () => {
    switch (schedule.type) {
      case "Recurring":
        return <Repeat size={16} />;

      case "Upcoming":
        return <Calendar size={16} />;

      case "Today":
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusClass = () => {
    switch (schedule.status) {
      case "Completed":
        return "border-green-200 bg-green-50 text-green-700";

      case "Cancelled":
        return "border-red-200 bg-red-50 text-red-700";

      case "Failed":
        return "border-red-200 bg-red-50 text-red-700";

      case "Paused":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";

      case "Scheduled":
      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon */}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          {getTypeIcon()}
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {schedule.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {schedule.description}
              </p>
            </div>

            {/* Details button */}

            <button
              type="button"
              onClick={onOpen}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label={`Open ${schedule.title}`}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Schedule information */}

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{schedule.date}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{schedule.time}</span>
            </div>

            <span className="text-gray-300">•</span>

            <span>{schedule.taskType}</span>
          </div>

          {/* Status */}

          <div className="mt-4 flex items-center justify-between">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClass()}`}
            >
              {schedule.status}
            </span>

            {schedule.status === "Completed" && (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircle2 size={14} />

                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}