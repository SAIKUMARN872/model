
"use client";

import { useState } from "react";

const demoUsage = {
  messages: { used: 24, limit: 40 },
  storage: { used: 512, limit: 512 },
  documents: 12,
  images: 8,
};

function UsageRow({
  title,
  description,
  used,
  limit,
  unit,
}: {
  title: string;
  description: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const percentage =
    limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="border-b border-gray-200 py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <p className="shrink-0 text-sm text-gray-500">
          {used} / {limit} {unit}
        </p>
      </div>

      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
      >
        <div
          className="h-full rounded-full bg-gray-900"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function UsageSettingsPage() {
  const [period, setPeriod] = useState("Current period");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-10 pb-12">
      <header>
        <h1 className="text-3xl font-normal tracking-tight">Usage</h1>
        <p className="mt-2 text-sm text-gray-500">
          View your usage and resource activity.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Usage details</h2>

          <select
            aria-label="Usage period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-full border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none"
          >
            <option>Current period</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>

        <div className="rounded-[22px] border border-gray-200 px-5">
          <UsageRow
            title="Chat messages"
            description="Messages sent to ModelNow"
            used={demoUsage.messages.used}
            limit={demoUsage.messages.limit}
            unit="messages"
          />

          <UsageRow
            title="Storage"
            description="Files and images stored"
            used={demoUsage.storage.used}
            limit={demoUsage.storage.limit}
            unit="MB"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Activity</h2>

        <div className="divide-y divide-gray-200 rounded-[22px] border border-gray-200 px-5">
          <div className="flex items-center justify-between gap-4 py-5">
            <span className="text-sm font-medium">Documents processed</span>
            <span className="text-sm text-gray-500">
              {demoUsage.documents}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-5">
            <span className="text-sm font-medium">Images generated</span>
            <span className="text-sm text-gray-500">
              {demoUsage.images}
            </span>
          </div>
        </div>
      </section>

      <p className="text-xs leading-5 text-gray-500">
        Demo usage figures are shown. Actual limits and usage will appear
        when ModelNow’s usage-tracking service is connected.
      </p>
    </main>
  );
}
