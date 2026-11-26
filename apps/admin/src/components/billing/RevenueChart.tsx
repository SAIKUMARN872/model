
"use client";

import { useState } from "react";
import { Download, TrendingUp } from "lucide-react";

type RevenuePoint = {
  month: string;
  revenue: number;
  subscriptions: number;
};

const revenueData: RevenuePoint[] = [
  { month: "Jan", revenue: 18200, subscriptions: 780 },
  { month: "Feb", revenue: 21400, subscriptions: 820 },
  { month: "Mar", revenue: 19800, subscriptions: 805 },
  { month: "Apr", revenue: 24600, subscriptions: 890 },
  { month: "May", revenue: 27800, subscriptions: 940 },
  { month: "Jun", revenue: 25400, subscriptions: 925 },
  { month: "Jul", revenue: 31200, subscriptions: 1010 },
  { month: "Aug", revenue: 29600, subscriptions: 1040 },
  { month: "Sep", revenue: 35400, subscriptions: 1120 },
  { month: "Oct", revenue: 38200, subscriptions: 1180 },
  { month: "Nov", revenue: 36100, subscriptions: 1210 },
  { month: "Dec", revenue: 48294, subscriptions: 1284 },
];

type RevenueChartProps = {
  data?: RevenuePoint[];
  title?: string;
  description?: string;
};

export default function RevenueChart({
  data = revenueData,
  title = "Revenue Overview",
  description = "Monthly revenue performance",
}: RevenueChartProps) {
  const [period, setPeriod] = useState("12 months");
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const visibleData =
    period === "6 months" ? data.slice(-6) : data;

  const width = 760;
  const height = 270;
  const paddingLeft = 58;
  const paddingRight = 18;
  const paddingTop = 22;
  const paddingBottom = 38;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxRevenue = Math.max(
    50000,
    ...visibleData.map((point) => point.revenue),
  );

  const maxSubscriptions = Math.max(
    1500,
    ...visibleData.map((point) => point.subscriptions),
  );

  const getX = (index: number) =>
    paddingLeft +
    (visibleData.length <= 1
      ? chartWidth / 2
      : (index / (visibleData.length - 1)) * chartWidth);

  const getY = (value: number, maxValue: number) =>
    paddingTop + chartHeight - (value / maxValue) * chartHeight;

  const revenuePoints = visibleData
    .map(
      (point, index) =>
        `${getX(index)},${getY(point.revenue, maxRevenue)}`,
    )
    .join(" ");

  const subscriptionPoints = visibleData
    .map(
      (point, index) =>
        `${getX(index)},${getY(point.subscriptions, maxSubscriptions)}`,
    )
    .join(" ");

  const areaPoints = [
    `${getX(0)},${paddingTop + chartHeight}`,
    revenuePoints,
    `${getX(visibleData.length - 1)},${paddingTop + chartHeight}`,
  ].join(" ");

  const latestRevenue = visibleData[visibleData.length - 1]?.revenue ?? 0;
  const previousRevenue =
    visibleData[visibleData.length - 2]?.revenue ?? latestRevenue;

  const growth =
    previousRevenue > 0
      ? ((latestRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  function exportCsv() {
    const rows = [
      ["Month", "Revenue (USD)", "Subscriptions"],
      ...visibleData.map((point) => [
        point.month,
        String(point.revenue),
        String(point.subscriptions),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-revenue.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Revenue chart period"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option>12 months</option>
            <option>6 months</option>
          </select>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Latest displayed revenue</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            ${latestRevenue.toLocaleString("en-US")}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium ${
            growth >= 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          <TrendingUp size={16} />
          {growth >= 0 ? "+" : ""}
          {growth.toFixed(1)}% vs. previous month
        </span>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Illustrative monthly revenue chart"
          className="h-auto min-w-[540px] w-full"
        >
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((step) => {
            const value = (maxRevenue / 4) * step;
            const y = getY(value, maxRevenue);

            return (
              <g key={step}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />

                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {value === 0
                    ? "$0"
                    : `$${Math.round(value / 1000)}k`}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill="url(#revenueArea)" />

          <polyline
            points={revenuePoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {showSubscriptions && (
            <polyline
              points={subscriptionPoints}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {visibleData.map((point, index) => (
            <g key={point.month}>
              <circle
                cx={getX(index)}
                cy={getY(point.revenue, maxRevenue)}
                r="4"
                fill="#2563eb"
                stroke="white"
                strokeWidth="2"
              ><title>
  {`${point.month}: $${point.revenue.toLocaleString("en-US")}`}
</title> 
              </circle>

              <text
                x={getX(index)}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {point.month}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Revenue
        </span>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showSubscriptions}
            onChange={(event) =>
              setShowSubscriptions(event.target.checked)
            }
            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          Show subscriptions trend
        </label>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Illustrative sample data. Connect your billing API for actual figures.
      </p>
    </section>
  );
}
