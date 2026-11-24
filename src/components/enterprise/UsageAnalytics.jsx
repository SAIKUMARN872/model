"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", users: 120 },
  { day: "Tue", users: 180 },
  { day: "Wed", users: 220 },
  { day: "Thu", users: 260 },
  { day: "Fri", users: 300 },
  { day: "Sat", users: 240 },
  { day: "Sun", users: 280 },
];

export default function UsageAnalytics() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        Weekly Usage Analytics
      </h2>

      <div className="h-80">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="users"
              stroke="#2563eb"
              fill="#93c5fd"
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}