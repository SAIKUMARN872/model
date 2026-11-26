"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Repeat,
  XCircle,
} from "lucide-react";

type ScheduleOverviewProps = {
  total: number;
  today: number;
  upcoming: number;
  recurring: number;
  completed: number;
  failed: number;
};

export default function ScheduleOverview({
  total,
  today,
  upcoming,
  recurring,
  completed,
  failed,
}: ScheduleOverviewProps) {
  const stats = [
    {
      label: "Total schedules",
      value: total,
      icon: Calendar,
    },
    {
      label: "Today",
      value: today,
      icon: Clock,
    },
    {
      label: "Upcoming",
      value: upcoming,
      icon: Calendar,
    },
    {
      label: "Recurring",
      value: recurring,
      icon: Repeat,
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: failed,
      icon: XCircle,
    },
  ];

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Schedule Overview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Monitor scheduled AI tasks, workflows, and automated operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Icon size={19} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}