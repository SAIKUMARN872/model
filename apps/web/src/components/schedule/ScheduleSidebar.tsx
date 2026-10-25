"use client";

import {
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  Repeat,
} from "lucide-react";

import type { ScheduleSection } from "./types";

type ScheduleSidebarProps = {
  activeSection: ScheduleSection;
  onSectionChange: (section: ScheduleSection) => void;
  onNewSchedule: () => void;
};

export default function ScheduleSidebar({
  activeSection,
  onSectionChange,
  onNewSchedule,
}: ScheduleSidebarProps) {
  const getButtonClass = (section: ScheduleSection) => {
    return `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
      activeSection === section
        ? "bg-gray-100 font-medium text-gray-900"
        : "text-gray-600 hover:bg-gray-50"
    }`;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden min-h-[calc(100vh-64px)] w-64 border-r border-gray-200 bg-white p-4 md:block">
        {/* Sidebar Title */}
        <div className="mb-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Schedule
          </p>
        </div>

        {/* New Schedule */}
        <button
          type="button"
          onClick={onNewSchedule}
          className="mb-5 flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-300 px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Plus size={18} />
          <span>+ New Schedule</span>
        </button>

        {/* Scheduled Section */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-3 text-sm font-semibold text-gray-900">
            <Clock size={17} />
            <span>Scheduled</span>
          </div>

          <div className="ml-2 space-y-1 border-l border-gray-200 pl-3">
            {/* Today */}
            <button
              type="button"
              onClick={() => onSectionChange("Today")}
              className={getButtonClass("Today")}
            >
              <CalendarDays size={16} />
              <span>Today</span>
            </button>

            {/* Upcoming */}
            <button
              type="button"
              onClick={() => onSectionChange("Upcoming")}
              className={getButtonClass("Upcoming")}
            >
              <Calendar size={16} />
              <span>Upcoming</span>
            </button>

            {/* Recurring */}
            <button
              type="button"
              onClick={() => onSectionChange("Recurring")}
              className={getButtonClass("Recurring")}
            >
              <Repeat size={16} />
              <span>Recurring</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="border-b border-gray-200 bg-white p-3 md:hidden">
        <div className="grid grid-cols-3 gap-2">
          {/* Today */}
          <button
            type="button"
            onClick={() => onSectionChange("Today")}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              activeSection === "Today"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <CalendarDays size={16} />
            <span>Today</span>
          </button>

          {/* Upcoming */}
          <button
            type="button"
            onClick={() => onSectionChange("Upcoming")}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              activeSection === "Upcoming"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar size={16} />
            <span>Upcoming</span>
          </button>

          {/* Recurring */}
          <button
            type="button"
            onClick={() => onSectionChange("Recurring")}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              activeSection === "Recurring"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Repeat size={16} />
            <span>Recurring</span>
          </button>
        </div>
      </div>
    </>
  );
}