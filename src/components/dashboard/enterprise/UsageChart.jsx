"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", usage: 120 },
  { day: "Tue", usage: 180 },
  { day: "Wed", usage: 150 },
  { day: "Thu", usage: 220 },
  { day: "Fri", usage: 190 },
  { day: "Sat", usage: 260 },
  { day: "Sun", usage: 210 },
];

export default function UsageChart() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-4 text-lg font-semibold">
        Weekly AI Usage
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="usage"
              stroke="#2563eb"
              fill="#93c5fd"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}