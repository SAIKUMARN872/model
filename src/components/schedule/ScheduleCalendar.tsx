"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

import type { ScheduleItem } from "./types";

type CalendarView = "Month" | "Week" | "Day";

type ScheduleCalendarProps = {
  schedules: ScheduleItem[];
};

export default function ScheduleCalendar({
  schedules,
}: ScheduleCalendarProps) {
  const [view, setView] = useState<CalendarView>("Month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: Array<number | null> = [];

    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [currentDate]);

  const goPrevious = () => {
    setCurrentDate((date) => {
      const next = new Date(date);

      if (view === "Month") {
        next.setMonth(next.getMonth() - 1);
      } else if (view === "Week") {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }

      return next;
    });
  };

  const goNext = () => {
    setCurrentDate((date) => {
      const next = new Date(date);

      if (view === "Month") {
        next.setMonth(next.getMonth() + 1);
      } else if (view === "Week") {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }

      return next;
    });
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const getSchedulesForDay = (day: number) => {
    return schedules.filter((schedule) => {
      if (schedule.date === "Today") {
        return day === new Date().getDate();
      }

      const parsed = new Date(schedule.date);

      if (Number.isNaN(parsed.getTime())) {
        return false;
      }

      return (
        parsed.getFullYear() === currentDate.getFullYear() &&
        parsed.getMonth() === currentDate.getMonth() &&
        parsed.getDate() === day
      );
    });
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Calendar
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View scheduled AI tasks and workflows by date.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goPrevious}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="Previous"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="Next"
          >
            <ChevronRight size={17} />
          </button>

          <div className="flex rounded-lg border border-gray-200 p-1">
            {(["Month", "Week", "Day"] as CalendarView[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    view === item
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5 text-base font-semibold text-gray-900">
          {monthName}
        </div>

        {view === "Month" && (
          <>
            <div className="grid grid-cols-7 border-b border-gray-200">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-xs font-medium text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const daySchedules = day
                  ? getSchedulesForDay(day)
                  : [];

                return (
                  <div
                    key={`${day}-${index}`}
                    className="min-h-[110px] border-b border-r border-gray-100 p-2"
                  >
                    {day && (
                      <>
                        <div className="mb-2 text-xs font-medium text-gray-600">
                          {day}
                        </div>

                        <div className="space-y-1">
                          {daySchedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="truncate rounded-md bg-gray-100 px-2 py-1.5 text-[11px] text-gray-700"
                              title={schedule.title}
                            >
                              <div className="flex items-center gap-1">
                                <Clock size={11} />
                                <span>{schedule.time}</span>
                              </div>

                              <div className="mt-0.5 truncate font-medium">
                                {schedule.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === "Week" && (
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm font-medium text-gray-900">
              Week view
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Week scheduling layout will be connected to the execution
              timeline next.
            </p>
          </div>
        )}

        {view === "Day" && (
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-sm font-medium text-gray-900">
              Day view
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Day scheduling timeline will be connected to execution
              history next.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}