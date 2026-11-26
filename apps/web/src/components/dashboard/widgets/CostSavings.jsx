"use client";

import { DollarSign } from "lucide-react";

export default function CostSavings() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <div className="flex items-center gap-3">

        <div className="rounded-full bg-green-100 p-3">
          <DollarSign className="text-green-600" />
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Monthly Savings
          </p>

          <h2 className="text-3xl font-bold">
            $2,450
          </h2>

          <p className="text-sm text-green-600">
            +18% from last month
          </p>
        </div>

      </div>

    </div>
  );
}