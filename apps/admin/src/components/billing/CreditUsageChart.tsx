
"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Coins,
  TrendingUp,
  Zap,
} from "lucide-react";

type CreditUsagePoint = {
  label: string;
  credits: number;
  requests: number;
};

type CreditUsageChartProps = {
  data?: CreditUsagePoint[];
  title?: string;
  description?: string;
  totalCredits?: number;
  usedCredits?: number;
};

const sampleUsage: CreditUsagePoint[] = [
  { label: "Oct 27", credits: 12400, requests: 1820 },
  { label: "Oct 28", credits: 15800, requests: 2140 },
  { label: "Oct 29", credits: 13900, requests: 1960 },
  { label: "Oct 30", credits: 18400, requests: 2480 },
  { label: "Oct 31", credits: 17200, requests: 2310 },
  { label: "Nov 01", credits: 22100, requests: 2890 },
  { label: "Nov 02", credits: 24600, requests: 3210 },
  { label: "Nov 03", credits: 21800, requests: 2980 },
  { label: "Nov 04", credits: 26300, requests: 3460 },
  { label: "Nov 05", credits: 25100, requests: 3290 },
  { label: "Nov 06", credits: 28700, requests: 3710 },
  { label: "Nov 07", credits: 31200, requests: 4020 },
];

export default function CreditUsageChart({
  data = sampleUsage,
  title = "Credit Usage",
  description = "Track credit consumption across your billing account.",
  totalCredits = 1000000,
  usedCredits = 684200,
}: CreditUsageChartProps) {
  const [period, setPeriod] = useState("7");
  const [showRequests, setShowRequests] = useState(false);

  const visibleData = useMemo(() => {
    const count = Number(period);
    return data.slice(-count);
  }, [data, period]);

  const availableCredits = Math.max(0, totalCredits - usedCredits);
  const usagePercentage =
    totalCredits > 0
      ? Math.min(100, Math.max(0, (usedCredits / totalCredits) * 100))
      : 0;

  const visibleCredits = visibleData.reduce(
    (total, point) => total + point.credits,
    0,
  );

  const visibleRequests = visibleData.reduce(
    (total, point) => total + point.requests,
    0,
  );

  const averageCredits =
    visibleData.length > 0
      ? Math.round(visibleCredits / visibleData.length)
      : 0;

  const width = 760;
  const height = 270;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 42;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const selectedValues = visibleData.map((point) =>
    showRequests ? point.requests : point.credits,
  );

  const maxValue = Math.max(1, ...selectedValues) * 1.15;

  const getX = (index: number) =>
    paddingLeft +
    (visibleData.length <= 1
      ? chartWidth / 2
      : (index / (visibleData.length - 1)) * chartWidth);

  const getY = (value: number) =>
    paddingTop + chartHeight - (value / maxValue) * chartHeight;

  const linePoints = selectedValues
    .map((value, index) => `${getX(index)},${getY(value)}`)
    .join(" ");

  const areaPoints = [
    `${getX(0)},${paddingTop + chartHeight}`,
    linePoints,
    `${getX(visibleData.length - 1)},${paddingTop + chartHeight}`,
  ].join(" ");

  function exportCsv() {
    const headers = ["Date", "Credits Used", "Requests"];
    const rows = visibleData.map((point) => [
      point.label,
      point.credits,
      point.requests,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-credit-usage.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
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
            aria-label="Credit usage time period"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="7">Last 7 points</option>
            <option value="12">Last 12 points</option>
          </select>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Credits used
            </span>
            <Coins size={18} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {usedCredits.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {usagePercentage.toFixed(1)}% of allocated credits
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Available credits
            </span>
            <Zap size={18} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {availableCredits.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Remaining allocation
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Average credits per point
            </span>
            <TrendingUp size={18} className="text-violet-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {averageCredits.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on the selected chart period
          </p>
        </div>
      </div>

      <div className="px-5 pb-2">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${usagePercentage}%` }}
            role="progressbar"
            aria-label="Credit allocation used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(usagePercentage)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {showRequests ? "Requests over time" : "Credit consumption over time"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {visibleRequests.toLocaleString("en-US")} requests across the selected points
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showRequests}
            onChange={(event) => setShowRequests(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Show requests
        </label>
      </div>

      <div className="px-3 pb-5 pt-3 sm:px-5">
        {visibleData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            No usage data available for this period.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={
                showRequests
                  ? "Line chart showing request volume"
                  : "Line chart showing credit consumption"
              }
              className="h-auto w-full min-w-[500px]"
            >
              <defs>
                <linearGradient
                  id="creditUsageGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={showRequests ? "#8b5cf6" : "#2563eb"}
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="100%"
                    stopColor={showRequests ? "#8b5cf6" : "#2563eb"}
                    stopOpacity="0.01"
                  />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3, 4].map((step) => {
                const y = paddingTop + (chartHeight / 4) * step;
                const value = Math.round(maxValue * (1 - step / 4));

                return (
                  <g key={step}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 5"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="11"
                    >
                      {value >= 1000
                        ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
                        : value}
                    </text>
                  </g>
                );
              })}

              <polygon
                points={areaPoints}
                fill="url(#creditUsageGradient)"
              />

              <polyline
                points={linePoints}
                fill="none"
                stroke={showRequests ? "#8b5cf6" : "#2563eb"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {selectedValues.map((value, index) => (
                <circle
                  key={`${visibleData[index].label}-${index}`}
                  cx={getX(index)}
                  cy={getY(value)}
                  r="4"
                  fill="white"
                  stroke={showRequests ? "#8b5cf6" : "#2563eb"}
                  strokeWidth="2"
                >
                  <title>
                    {visibleData[index].label}: {value.toLocaleString("en-US")}
                  </title>
                </circle>
              ))}

              {visibleData.map((point, index) => (
                <text
                  key={`${point.label}-label`}
                  x={getX(index)}
                  y={height - 14}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                >
                  {point.label}
                </text>
              ))}
            </svg>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <p className="text-xs leading-5 text-slate-400">
          Illustrative sample data. Connect the billing usage API to display
          actual account balances and consumption. The chart period controls
          the plotted points; the allocation cards show the supplied account
          totals.
        </p>
      </div>
    </section>
  );
}
