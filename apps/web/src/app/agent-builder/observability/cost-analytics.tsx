"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronDown,
  Clock3,
  Coins,
  DollarSign,
  Download,
  Filter,
  Gauge,
  Layers3,
  RefreshCw,
  Search,
  Server,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

type CostRecord = {
  id: string;
  model: string;
  provider: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  avgLatency: number;
  percentage: number;
};

type DailyCost = {
  day: string;
  cost: number;
  requests: number;
};

const costRecords: CostRecord[] = [
  {
    id: "1",
    model: "GPT-5.6",
    provider: "OpenAI",
    requests: 12480,
    inputTokens: 18400000,
    outputTokens: 6200000,
    totalTokens: 24600000,
    cost: 842.4,
    avgLatency: 1.42,
    percentage: 42.8,
  },
  {
    id: "2",
    model: "Claude Sonnet",
    provider: "Anthropic",
    requests: 8940,
    inputTokens: 12800000,
    outputTokens: 4700000,
    totalTokens: 17500000,
    cost: 512.7,
    avgLatency: 1.68,
    percentage: 26.1,
  },
  {
    id: "3",
    model: "GPT-5.6-mini",
    provider: "OpenAI",
    requests: 15820,
    inputTokens: 10200000,
    outputTokens: 3100000,
    totalTokens: 13300000,
    cost: 284.3,
    avgLatency: 0.91,
    percentage: 14.4,
  },
  {
    id: "4",
    model: "Gemini Pro",
    provider: "Google",
    requests: 6420,
    inputTokens: 7600000,
    outputTokens: 2500000,
    totalTokens: 10100000,
    cost: 198.6,
    avgLatency: 1.17,
    percentage: 10.1,
  },
  {
    id: "5",
    model: "Llama 4",
    provider: "Meta",
    requests: 3940,
    inputTokens: 4200000,
    outputTokens: 1300000,
    totalTokens: 5500000,
    cost: 129.2,
    avgLatency: 1.31,
    percentage: 6.6,
  },
];

const dailyCosts: DailyCost[] = [
  { day: "Sep 14", cost: 61.4, requests: 3180 },
  { day: "Sep 15", cost: 68.8, requests: 3520 },
  { day: "Sep 16", cost: 72.2, requests: 3690 },
  { day: "Sep 17", cost: 76.4, requests: 3910 },
  { day: "Sep 18", cost: 70.8, requests: 3610 },
  { day: "Sep 19", cost: 81.6, requests: 4180 },
  { day: "Sep 20", cost: 84.3, requests: 4360 },
];

const workloadCosts = [
  {
    name: "Agent Workflows",
    cost: 784.4,
    percentage: 39.8,
    requests: 10480,
  },
  {
    name: "Knowledge & RAG",
    cost: 492.6,
    percentage: 25.0,
    requests: 8240,
  },
  {
    name: "Browser Automation",
    cost: 318.2,
    percentage: 16.1,
    requests: 4260,
  },
  {
    name: "Computer Use",
    cost: 214.8,
    percentage: 10.9,
    requests: 2860,
  },
  {
    name: "Multimodal AI",
    cost: 161.7,
    percentage: 8.2,
    requests: 1940,
  },
];

const optimizationSuggestions = [
  {
    title: "Increase low-cost model routing",
    description:
      "Simple classification and extraction requests can be routed to smaller models.",
    savings: "$184–$260 / month",
    impact: "High",
  },
  {
    title: "Reduce oversized RAG context",
    description:
      "Several workflows send more retrieved context than required.",
    savings: "$96–$142 / month",
    impact: "Medium",
  },
  {
    title: "Enable semantic response caching",
    description:
      "Repeated requests were detected across multiple workflows.",
    savings: "$72–$118 / month",
    impact: "Medium",
  },
];

export default function CostAnalyticsPage() {
  const [range, setRange] = useState("Last 7 days");
  const [modelFilter, setModelFilter] = useState("All models");
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return costRecords.filter((record) => {
      const matchesSearch =
        !query ||
        record.model.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query);

      const matchesModel =
        modelFilter === "All models" || record.model === modelFilter;

      return matchesSearch && matchesModel;
    });
  }, [search, modelFilter]);

  const totalCost = costRecords.reduce(
    (sum, record) => sum + record.cost,
    0,
  );

  const totalRequests = costRecords.reduce(
    (sum, record) => sum + record.requests,
    0,
  );

  const totalTokens = costRecords.reduce(
    (sum, record) => sum + record.totalTokens,
    0,
  );

  const averageCostPerRequest =
    totalRequests > 0 ? totalCost / totalRequests : 0;

  const runAnalysis = () => {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/observability"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#f3f4f6]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span>Observability</span>
                <span>/</span>
                <span className="text-[#111827]">Cost Analytics</span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.02em]">
                Cost Analytics
              </h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Monitor AI spending, token consumption, model usage, and
                optimization opportunities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAnalysis}
              disabled={running}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={running ? "animate-spin" : ""}
              />
              {running ? "Analyzing..." : "Refresh"}
            </button>

            <button className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#374151]">
              <Download size={16} />
              Export
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-4 gap-4">
          <MetricCard
            label="Total spend"
            value={`$${totalCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            subtitle="Current selected period"
            icon={<DollarSign size={17} />}
            trend="+6.8%"
            trendPositive={false}
          />

          <MetricCard
            label="Cost / request"
            value={`$${averageCostPerRequest.toFixed(3)}`}
            subtitle="Average AI request cost"
            icon={<Coins size={17} />}
            trend="-8.4%"
            trendPositive
          />

          <MetricCard
            label="Total tokens"
            value={formatCompact(totalTokens)}
            subtitle="Input + output tokens"
            icon={<Zap size={17} />}
            trend="-4.7%"
            trendPositive
          />

          <MetricCard
            label="Total requests"
            value={totalRequests.toLocaleString()}
            subtitle="Across all AI workloads"
            icon={<Activity size={17} />}
            trend="+12.3%"
            trendPositive={false}
          />
        </section>

        <section className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#4f46e5]" />
                <h2 className="text-base font-semibold">
                  Spend overview
                </h2>
              </div>

              <p className="mt-1 text-xs text-[#6b7280]">
                Daily AI infrastructure spend for the selected period.
              </p>
            </div>

            <div className="relative">
              <select
                value={range}
                onChange={(event) => setRange(event.target.value)}
                className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-8 text-xs font-medium text-[#374151] outline-none"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-6">
            <CostChart />

            <div className="space-y-3">
              <SummaryCard
                label="Projected monthly spend"
                value="$2,480"
                description="Based on current usage"
                icon={<TrendingUp size={16} />}
              />

              <SummaryCard
                label="Previous period"
                value="$2,176"
                description="Compared with selected period"
                icon={<ArrowDownRight size={16} />}
              />

              <SummaryCard
                label="Optimization potential"
                value="$420"
                description="Estimated monthly savings"
                icon={<TrendingDown size={16} />}
              />

              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-[#6b7280]" />
                  <span className="text-xs font-semibold">
                    Cost efficiency
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <span className="text-[22px] font-semibold">
                    82.4%
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    +5.8%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div className="h-full w-[82%] rounded-full bg-[#111827]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#eef0f3] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    Model cost breakdown
                  </h2>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Spending and usage by model.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                  <Filter size={14} />
                  <span>{range}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search models..."
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-sm outline-none focus:bg-white"
                  />
                </div>

                <div className="relative w-44">
                  <select
                    value={modelFilter}
                    onChange={(event) =>
                      setModelFilter(event.target.value)
                    }
                    className="h-9 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-8 text-xs font-medium text-[#374151] outline-none"
                  >
                    <option>All models</option>
                    {costRecords.map((record) => (
                      <option key={record.id}>{record.model}</option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#eef0f3] bg-[#fafafa]">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#6b7280]">
                      Model
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6b7280]">
                      Requests
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6b7280]">
                      Tokens
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6b7280]">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6b7280]">
                      Cost share
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6b7280]">
                      Latency
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eef0f3]">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-[#fafafa]"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280]">
                            <Server size={15} />
                          </div>

                          <div>
                            <p className="text-xs font-semibold">
                              {record.model}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                              {record.provider}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-xs font-medium">
                        {record.requests.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-right text-xs text-[#4b5563]">
                        {formatCompact(record.totalTokens)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="text-xs font-semibold">
                          ${record.cost.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#eef0f3]">
                            <div
                              className="h-full rounded-full bg-[#111827]"
                              style={{
                                width: `${record.percentage * 2}%`,
                              }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-[#6b7280]">
                            {record.percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-xs text-[#4b5563]">
                        {record.avgLatency}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#eef0f3] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Layers3 size={16} className="text-[#6b7280]" />
                  <h2 className="text-sm font-semibold">
                    Cost by workload
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-[#eef0f3]">
                {workloadCosts.map((workload) => (
                  <div key={workload.name} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {workload.name}
                      </span>

                      <span className="text-xs font-semibold">
                        ${workload.cost.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eef0f3]">
                        <div
                          className="h-full rounded-full bg-[#111827]"
                          style={{
                            width: `${workload.percentage * 2.1}%`,
                          }}
                        />
                      </div>

                      <span className="w-9 text-right text-[10px] text-[#9ca3af]">
                        {workload.percentage}%
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-[#9ca3af]">
                      {workload.requests.toLocaleString()} requests
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#eef0f3] px-4 py-3">
                <div className="flex items-center gap-2">
                  <TrendingDown
                    size={16}
                    className="text-emerald-600"
                  />
                  <h2 className="text-sm font-semibold">
                    Savings opportunities
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-[#eef0f3]">
                {optimizationSuggestions.map((item) => (
                  <div key={item.title} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold leading-4">
                        {item.title}
                      </h3>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        {item.impact}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-[#6b7280]">
                      {item.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-[#9ca3af]">
                        Estimated savings
                      </span>

                      <span className="text-xs font-semibold text-emerald-600">
                        {item.savings}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4">
                <Link
                  href="/agent-builder/observability/ai-optimization"
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  Open optimization engine
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-[#6b7280]" />
                <h2 className="text-sm font-semibold">
                  Cost controls
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                <ControlRow
                  label="Budget alerts"
                  value="Enabled"
                  enabled
                />
                <ControlRow
                  label="Cost anomaly detection"
                  value="Enabled"
                  enabled
                />
                <ControlRow
                  label="Automatic model downgrade"
                  value="Disabled"
                  enabled={false}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  trend: string;
  trendPositive: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280]">
          {icon}
        </div>

        <span
          className={`flex items-center gap-1 text-[11px] font-medium ${
            trendPositive ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {trendPositive ? (
            <TrendingDown size={12} />
          ) : (
            <TrendingUp size={12} />
          )}
          {trend}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-[#6b7280]">
        {label}
      </p>

      <p className="mt-1 text-[24px] font-semibold">{value}</p>

      <p className="mt-1 text-[11px] text-[#9ca3af]">
        {subtitle}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
      <div className="flex items-center gap-2 text-[#6b7280]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-3 text-[21px] font-semibold">{value}</p>

      <p className="mt-1 text-[10px] text-[#9ca3af]">
        {description}
      </p>
    </div>
  );
}

function CostChart() {
  const maxCost = Math.max(...dailyCosts.map((item) => item.cost));

  return (
    <div className="rounded-xl border border-[#e5e7eb] p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#6b7280]">
            Daily spend
          </p>
          <p className="mt-1 text-[22px] font-semibold">$515.50</p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <TrendingDown size={13} />
          5.8% vs previous period
        </div>
      </div>

      <div className="flex h-[220px] items-end gap-3 border-b border-[#eef0f3] px-2">
        {dailyCosts.map((item) => {
          const height = Math.max(
            12,
            (item.cost / maxCost) * 175,
          );

          return (
            <div
              key={item.day}
              className="flex h-full flex-1 flex-col justify-end"
            >
              <div className="group relative flex justify-center">
                <div
                  className="w-full max-w-[44px] rounded-t-md bg-[#111827] transition hover:bg-[#374151]"
                  style={{ height: `${height}px` }}
                  title={`$${item.cost.toFixed(2)}`}
                />

                <div className="pointer-events-none absolute -top-8 rounded-md bg-[#111827] px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  ${item.cost.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-3 px-2">
        {dailyCosts.map((item) => (
          <div
            key={item.day}
            className="flex-1 text-center text-[10px] text-[#9ca3af]"
          >
            {item.day.replace("Sep ", "")}
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlRow({
  label,
  value,
  enabled,
}: {
  label: string;
  value: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#6b7280]">{label}</span>

      <span
        className={`flex items-center gap-1.5 text-[11px] font-medium ${
          enabled ? "text-emerald-600" : "text-[#9ca3af]"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            enabled ? "bg-emerald-500" : "bg-[#9ca3af]"
          }`}
        />
        {value}
      </span>
    </div>
  );
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toString();
}