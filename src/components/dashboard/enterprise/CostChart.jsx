"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", cost: 120 },
  { month: "Feb", cost: 180 },
  { month: "Mar", cost: 150 },
  { month: "Apr", cost: 220 },
  { month: "May", cost: 170 },
];

export default function CostChart() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-4 text-lg font-semibold">
        Monthly Cost
      </h2>

      <div className="h-72">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="cost"
              fill="#2563eb"
              radius={[6,6,0,0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}