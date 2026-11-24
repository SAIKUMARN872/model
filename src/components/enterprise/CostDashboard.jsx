"use client";

import { DollarSign, TrendingUp } from "lucide-react";

const monthlyCosts = [
  { month: "Jan", amount: "$1,250" },
  { month: "Feb", amount: "$1,480" },
  { month: "Mar", amount: "$1,720" },
  { month: "Apr", amount: "$1,650" },
];

export default function CostDashboard() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <div className="mb-6 flex items-center gap-3">
        <DollarSign className="text-green-600" size={28} />
        <h2 className="text-2xl font-bold">
          Cost Dashboard
        </h2>
      </div>

      <div className="space-y-4">
        {monthlyCosts.map((cost) => (
          <div
            key={cost.month}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span className="font-medium">
              {cost.month}
            </span>

            <span className="font-semibold text-green-600">
              {cost.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-green-600">
        <TrendingUp size={20} />
        <span>12% lower than last quarter</span>
      </div>

    </div>
  );
}