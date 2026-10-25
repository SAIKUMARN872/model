"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  ChevronDown,
  Clock3,
  Database,
  DollarSign,
  Gauge,
  GitBranch,
  Layers3,
  RefreshCw,
  Search,
  Server,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

type ModelUsage = {
  id: string;
  model: string;
  provider: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  avgTokens: number;
  trend: number;
};

type WorkloadUsage = {
  name: string;
  type: string;
  tokens: number;
  percentage: number;
  requests: number;
};

const modelUsage: ModelUsage[] = [
  {
    id: "model-001",
    model: "GPT-5.6",
    provider: "OpenAI",
    requests: 28420,
    inputTokens: 18400000,
    outputTokens: 9200000,
    totalTokens: 27600000,
    cost: 82.46,
    avgTokens: 971,
    trend: 12.4,
  },
  {
    id: "model-002",
    model: "Claude Sonnet",
    provider: "Anthropic",
    requests: 22180,
    inputTokens: 14200000,
    outputTokens: 8100000,
    totalTokens: 22300000,
    cost: 61.82,
    avgTokens: 1005,
    trend: 8.6,
  },
  {
    id: "model-003",
    model: "GPT-5.6-mini",
    provider: "OpenAI",
    requests: 34820,
    inputTokens: 9800000,
    outputTokens: 4100000,
    totalTokens: 13900000,
    cost: 18.74,
    avgTokens: 399,
    trend: 18.2,
  },
  {
    id: "model-004",
    model: "Gemini Pro",
    provider: "Google",
    requests: 16420,
    inputTokens: 7200000,
    outputTokens: 3300000,
    totalTokens: 10500000,
    cost: 11.68,
    avgTokens: 640,
    trend: -4.8,
  },
  {
    id: "model-005",
    model: "Llama 4",
    provider: "Meta",
    requests: 11240,
    inputTokens: 5100000,
    outputTokens: 2300000,
    totalTokens: 7400000,
    cost: 6.42,
    avgTokens: 658,
    trend: 6.2,
  },
];

const workloadUsage: WorkloadUsage[] = [
  {
    name: "Customer Support Agent",
    type: "Agent",
    tokens: 18200000,
    percentage: 24,
    requests: 18420,
  },
  {
    name: "Research Agent",
    type: "Agent",
    tokens: 15400000,
    percentage: 20,
    requests: 12840,
  },
  {
    name: "Knowledge / RAG",
    type: "Retrieval",
    tokens: 12600000,
    percentage: 17,
    requests: 22640,
  },
  {
    name: "Document Processing",
    type: "Workflow",
    tokens: 10400000,
    percentage: 14,
    requests: 9460,
  },
  {
    name: "Browser Automation",
    type: "Tool",
    tokens: 8200000,
    percentage: 11,
    requests: 5240,
  },
  {
    name: "Computer Use",
    type: "Tool",
    tokens: 6200000,
    percentage: 8,
    requests: 3820,
  },
  {
    name: "Other workloads",
    type: "Platform",
    tokens: 4600000,
    percentage: 6,
    requests: 7420,
  },
];

const dailyUsage = [
  { day: "Mon", tokens: 6.8 },
  { day: "Tue", tokens: 7.2 },
  { day: "Wed", tokens: 7.8 },
  { day: "Thu", tokens: 8.1 },
  { day: "Fri", tokens: 7.6 },
  { day: "Sat", tokens: 6.2 },
  { day: "Sun", tokens: 5.9 },
];

export default function TokenUsagePage() {
  const [range, setRange] = useState("Last 7 days");
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("All providers");

  const totalTokens = modelUsage.reduce(
    (sum, model) => sum + model.totalTokens,
    0
  );

  const inputTokens = modelUsage.reduce(
    (sum, model) => sum + model.inputTokens,
    0
  );

  const outputTokens = modelUsage.reduce(
    (sum, model) => sum + model.outputTokens,
    0
  );

  const totalRequests = modelUsage.reduce(
    (sum, model) => sum + model.requests,
    0
  );

  const totalCost = modelUsage.reduce(
    (sum, model) => sum + model.cost,
    0
  );

  const averageTokensPerRequest =
    totalTokens / Math.max(totalRequests, 1);

  const filteredModels = useMemo(() => {
    return modelUsage.filter((model) => {
      const matchesSearch =
        model.model.toLowerCase().includes(search.toLowerCase()) ||
        model.provider.toLowerCase().includes(search.toLowerCase());

      const matchesProvider =
        provider === "All providers" || model.provider === provider;

      return matchesSearch && matchesProvider;
    });
  }, [search, provider]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/observability"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-[#2563eb]" />
                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Token Usage
                </h1>
              </div>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Monitor input tokens, output tokens, model usage, workload
                consumption, and token efficiency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RangeSelect value={range} onChange={setRange} />

            <button className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] font-medium text-[#475569] hover:bg-[#f8fafc]">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-8 py-7">
        <div className="grid grid-cols-5 gap-4">
          <MetricCard
            title="Total Tokens"
            value={formatCompact(totalTokens)}
            subtitle={`Last ${range.toLowerCase()}`}
            icon={<Zap size={18} />}
          />

          <MetricCard
            title="Input Tokens"
            value={formatCompact(inputTokens)}
            subtitle="Prompt and context"
            icon={<ArrowDown size={18} />}
          />

          <MetricCard
            title="Output Tokens"
            value={formatCompact(outputTokens)}
            subtitle="Generated responses"
            icon={<ArrowUp size={18} />}
          />

          <MetricCard
            title="Avg Tokens / Request"
            value={Math.round(averageTokensPerRequest).toLocaleString()}
            subtitle={`${totalRequests.toLocaleString()} requests`}
            icon={<Gauge size={18} />}
          />

          <MetricCard
            title="Token Cost"
            value={`$${totalCost.toFixed(2)}`}
            subtitle="Estimated usage cost"
            icon={<DollarSign size={18} />}
            positive
          />
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_370px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold">
                  Token consumption
                </h2>

                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  Daily token usage for {range.toLowerCase()}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-[#64748b]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                  Tokens
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#cbd5e1]" />
                  Average
                </span>
              </div>
            </div>

            <div className="p-5">
              <TokenChart data={dailyUsage} />

              <div className="mt-5 grid grid-cols-4 gap-3">
                <MiniStat
                  label="Peak usage"
                  value="8.1M"
                  detail="Thursday"
                />

                <MiniStat
                  label="Lowest usage"
                  value="5.9M"
                  detail="Sunday"
                />

                <MiniStat
                  label="Input share"
                  value={`${((inputTokens / totalTokens) * 100).toFixed(1)}%`}
                  detail="of total tokens"
                />

                <MiniStat
                  label="Output share"
                  value={`${((outputTokens / totalTokens) * 100).toFixed(1)}%`}
                  detail="of total tokens"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[15px] font-semibold">
                Token distribution
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Input versus output consumption
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-center">
                <TokenDonut
                  inputPercentage={(inputTokens / totalTokens) * 100}
                />
              </div>

              <div className="mt-6 space-y-3">
                <DistributionRow
                  label="Input tokens"
                  value={inputTokens}
                  percentage={(inputTokens / totalTokens) * 100}
                  className="bg-[#2563eb]"
                />

                <DistributionRow
                  label="Output tokens"
                  value={outputTokens}
                  percentage={(outputTokens / totalTokens) * 100}
                  className="bg-[#7c3aed]"
                />
              </div>

              <div className="mt-5 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
                <div className="flex items-center gap-2">
                  <Target size={15} className="text-[#2563eb]" />

                  <p className="text-[11px] font-semibold text-[#1e40af]">
                    Token efficiency
                  </p>
                </div>

                <p className="mt-1 text-[10px] leading-4 text-[#3b82f6]">
                  Monitor context size and output length to control latency and
                  model costs.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Model token usage
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Token consumption and cost by model provider.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search models..."
                  className="h-9 w-[200px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-8 pr-3 text-[11px] outline-none focus:border-[#93c5fd]"
                />
              </div>

              <FilterSelect
                value={provider}
                onChange={setProvider}
                options={[
                  "All providers",
                  "OpenAI",
                  "Anthropic",
                  "Google",
                  "Meta",
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_95px_105px_105px_105px_100px_90px] gap-4 bg-[#fafafa] px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
            <span>Model</span>
            <span>Requests</span>
            <span>Input</span>
            <span>Output</span>
            <span>Total</span>
            <span>Cost</span>
            <span>Trend</span>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="grid grid-cols-[minmax(0,1fr)_95px_105px_105px_105px_100px_90px] items-center gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <ModelIcon provider={model.provider} />

                  <div>
                    <p className="text-[12px] font-semibold text-[#334155]">
                      {model.model}
                    </p>

                    <p className="mt-1 text-[10px] text-[#94a3b8]">
                      {model.provider} · {model.avgTokens} avg tokens/request
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#475569]">
                  {formatCompact(model.requests)}
                </span>

                <span className="text-[11px] text-[#64748b]">
                  {formatCompact(model.inputTokens)}
                </span>

                <span className="text-[11px] text-[#64748b]">
                  {formatCompact(model.outputTokens)}
                </span>

                <span className="text-[11px] font-semibold text-[#334155]">
                  {formatCompact(model.totalTokens)}
                </span>

                <span className="text-[11px] font-medium text-[#475569]">
                  ${model.cost.toFixed(2)}
                </span>

                <TrendValue value={model.trend} />
              </div>
            ))}

            {filteredModels.length === 0 && (
              <div className="px-5 py-10 text-center text-[12px] text-[#94a3b8]">
                No models found.
              </div>
            )}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[15px] font-semibold">
                Token usage by workload
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Which agents and workloads consume the most tokens.
              </p>
            </div>

            <div className="p-5">
              <div className="space-y-5">
                {workloadUsage.map((workload) => (
                  <WorkloadRow
                    key={workload.name}
                    workload={workload}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[15px] font-semibold">
                Token optimization
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Areas that can reduce token consumption.
              </p>
            </div>

            <div className="space-y-1 px-5 py-3">
              <OptimizationRow
                icon={<TrendingDown size={15} />}
                title="Context compression"
                value="18%"
                description="Potential reduction in input tokens."
              />

              <OptimizationRow
                icon={<Gauge size={15} />}
                title="Output controls"
                value="12%"
                description="Reduce unnecessary generated tokens."
              />

              <OptimizationRow
                icon={<GitBranch size={15} />}
                title="Model routing"
                value="9%"
                description="Use smaller models for simple tasks."
              />

              <OptimizationRow
                icon={<Database size={15} />}
                title="RAG optimization"
                value="7%"
                description="Reduce redundant retrieved context."
              />
            </div>

            <div className="border-t border-[#eef2f7] px-5 py-4">
              <Link
                href="/agent-builder/observability/ai-optimization"
                className="flex items-center justify-between text-[11px] font-medium text-[#2563eb]"
              >
                Open AI optimization
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InsightCard
            icon={<TrendingUp size={17} />}
            title="Token growth"
            metric="+10.8%"
            label="period over period"
            description="Total platform token consumption has increased compared with the previous period."
            positive
          />

          <InsightCard
            icon={<DollarSign size={17} />}
            title="Cost per 1M tokens"
            metric="$2.42"
            label="blended estimate"
            description="Average blended token cost across the currently monitored model providers."
          />

          <InsightCard
            icon={<Target size={17} />}
            title="Optimization potential"
            metric="24%"
            label="estimated reduction"
            description="Context compression, routing, and output controls can reduce unnecessary token usage."
          />
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Token observability capabilities
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Connect token monitoring with cost, latency, and execution
                intelligence.
              </p>
            </div>

            <Link
              href="/agent-builder/observability/cost-analytics"
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563eb]"
            >
              View cost analytics
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            <Capability
              icon={<Zap size={17} />}
              title="Token tracking"
              description="Track input, output, and total tokens across every request."
            />

            <Capability
              icon={<DollarSign size={17} />}
              title="Cost correlation"
              description="Connect token consumption directly with model cost."
            />

            <Capability
              icon={<Clock3 size={17} />}
              title="Latency correlation"
              description="Understand how context and output size affect latency."
            />

            <Capability
              icon={<Target size={17} />}
              title="Optimization"
              description="Automatically identify opportunities to reduce token usage."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  positive,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
          {icon}
        </div>

        {positive && (
          <span className="text-[10px] font-medium text-[#16a34a]">
            Optimized
          </span>
        )}
      </div>

      <p className="mt-4 text-[11px] text-[#64748b]">{title}</p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">{subtitle}</p>
    </div>
  );
}

function RangeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[11px] font-medium text-[#475569] outline-none"
      >
        <option>Last 24 hours</option>
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[11px] font-medium text-[#475569] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
      />
    </div>
  );
}

function TokenChart({
  data,
}: {
  data: { day: string; tokens: number }[];
}) {
  const max = Math.max(...data.map((item) => item.tokens));

  return (
    <div className="relative h-[280px] rounded-lg border border-[#eef2f7] bg-[#fafbfc] p-5">
      <div className="absolute inset-x-5 bottom-8 top-5 flex flex-col justify-between">
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="border-t border-dashed border-[#e5e7eb]"
          />
        ))}
      </div>

      <div className="absolute inset-x-8 bottom-8 top-7 flex items-end justify-between gap-4">
        {data.map((item) => {
          const height = (item.tokens / max) * 100;

          return (
            <div
              key={item.day}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              <div className="mb-2 text-[9px] font-medium text-[#64748b]">
                {item.tokens.toFixed(1)}M
              </div>

              <div
                className="w-full max-w-[42px] rounded-t-md bg-[#2563eb]"
                style={{ height: `${height}%` }}
              />

              <span className="mt-2 text-[9px] text-[#94a3b8]">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TokenDonut({
  inputPercentage,
}: {
  inputPercentage: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const inputLength = (inputPercentage / 100) * circumference;
  const outputLength = circumference - inputLength;

  return (
    <div className="relative h-[170px] w-[170px]">
      <svg
        viewBox="0 0 140 140"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#ede9fe"
          strokeWidth="18"
        />

        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="18"
          strokeDasharray={`${inputLength} ${circumference}`}
          strokeLinecap="round"
        />

        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="18"
          strokeDasharray={`${outputLength} ${circumference}`}
          strokeDashoffset={-inputLength}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-semibold">
          {Math.round(inputPercentage)}%
        </span>

        <span className="text-[9px] text-[#94a3b8]">
          input tokens
        </span>
      </div>
    </div>
  );
}

function DistributionRow({
  label,
  value,
  percentage,
  className,
}: {
  label: string;
  value: number;
  percentage: number;
  className: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#64748b]">
          {label}
        </span>

        <span className="text-[10px] font-semibold text-[#475569]">
          {formatCompact(value)} · {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ModelIcon({ provider }: { provider: string }) {
  if (provider === "OpenAI") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
        <Bot size={16} />
      </div>
    );
  }

  if (provider === "Anthropic") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff7ed] text-[#ea580c]">
        <Layers3 size={16} />
      </div>
    );
  }

  if (provider === "Google") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#16a34a]">
        <span className="text-[14px] font-bold">G</span>
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
      <Server size={16} />
    </div>
  );
}

function WorkloadRow({
  workload,
}: {
  workload: WorkloadUsage;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#334155]">
            {workload.name}
          </p>

          <p className="mt-0.5 text-[9px] text-[#94a3b8]">
            {workload.type} · {workload.requests.toLocaleString()} requests
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-semibold text-[#475569]">
            {formatCompact(workload.tokens)}
          </p>

          <p className="text-[9px] text-[#94a3b8]">
            {workload.percentage}% of usage
          </p>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
        <div
          className="h-full rounded-full bg-[#2563eb]"
          style={{ width: `${workload.percentage}%` }}
        />
      </div>
    </div>
  );
}

function OptimizationRow({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 border-b border-[#f1f5f9] py-3 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-[#334155]">
            {title}
          </p>

          <span className="text-[10px] font-semibold text-[#16a34a]">
            {value}
          </span>
        </div>

        <p className="mt-0.5 text-[9px] leading-4 text-[#94a3b8]">
          {description}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-[#eef2f7] bg-[#fafafa] p-3">
      <p className="text-[10px] text-[#94a3b8]">{label}</p>

      <p className="mt-1 text-[15px] font-semibold text-[#334155]">
        {value}
      </p>

      <p className="mt-0.5 text-[9px] text-[#94a3b8]">{detail}</p>
    </div>
  );
}

function TrendValue({ value }: { value: number }) {
  const isPositive = value >= 0;

  return (
    <span
      className={`flex items-center gap-1 text-[10px] font-semibold ${
        isPositive ? "text-[#16a34a]" : "text-[#dc2626]"
      }`}
    >
      {isPositive ? (
        <ArrowUp size={12} />
      ) : (
        <ArrowDown size={12} />
      )}

      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function InsightCard({
  icon,
  title,
  metric,
  label,
  description,
  positive,
}: {
  icon: ReactNode;
  title: string;
  metric: string;
  label: string;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
          {icon}
        </div>

        <div className="text-right">
          <p
            className={`text-[18px] font-semibold ${
              positive ? "text-[#16a34a]" : "text-[#334155]"
            }`}
          >
            {metric}
          </p>

          <p className="text-[9px] text-[#94a3b8]">{label}</p>
        </div>
      </div>

      <h3 className="mt-4 text-[13px] font-semibold">{title}</h3>

      <p className="mt-1.5 text-[11px] leading-5 text-[#64748b]">
        {description}
      </p>
    </div>
  );
}

function Capability({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <h3 className="mt-3 text-[12px] font-semibold text-[#334155]">
        {title}
      </h3>

      <p className="mt-1 text-[11px] leading-5 text-[#94a3b8]">
        {description}
      </p>
    </div>
  );
}

function formatCompact(value: number) {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}