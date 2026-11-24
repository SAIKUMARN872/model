"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
 YAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", latency: 120 },
  { day: "Tue", latency: 110 },
  { day: "Wed", latency: 140 },
  { day: "Thu", latency: 100 },
  { day: "Fri", latency: 95 },
  { day: "Sat", latency: 105 },
  { day: "Sun", latency: 115 },
];

export default function LatencyChart() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-4 text-lg font-semibold">
        Model Latency
      </h2>

      <div className="h-72">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day"/>
            <YAxis/>
            <Tooltip/>

            <Line
              type="monotone"
              dataKey="latency"
              stroke="#16a34a"
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}