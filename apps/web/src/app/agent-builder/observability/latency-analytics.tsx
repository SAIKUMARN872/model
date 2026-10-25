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
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gauge,
  GitBranch,
  Globe,
  Layers3,
  RefreshCw,
  Search,
  Server,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

type LatencyRecord = {
  id: string;
  operation: string;
  agent: string;
  model: string;
  latency: number;
  p50: number;
  p95: number;
  p99: number;
  requests: number;
  trend: number;
  status: "Healthy" | "Warning" | "Critical";
};

type TimePoint = {
  time: string;
  latency: number;
};

const latencyRecords: LatencyRecord[] = [
  {
    id: "lat-001",
    operation: "Agent Planning",
    agent: "Research Agent",
    model: "GPT-5.6",
    latency: 820,
    p50: 640,
    p95: 1320,
    p99: 1840,
    requests: 12840,
    trend: -8.4,
    status: "Healthy",
  },
  {
    id: "lat-002",
    operation: "Model Inference",
    agent: "Support Agent",
    model: "Claude Sonnet",
    latency: 1240,
    p50: 980,
    p95: 2180,
    p99: 2940,
    requests: 9460,
    trend: 5.8,
    status: "Warning",
  },
  {
    id: "lat-003",
    operation: "RAG Retrieval",
    agent: "Knowledge Agent",
    model: "Embedding + Vector DB",
    latency: 410,
    p50: 320,
    p95: 760,
    p99: 1120,
    requests: 18320,
    trend: -12.2,
    status: "Healthy",
  },
  {
    id: "lat-004",
    operation: "Browser Automation",
    agent: "Browser Agent",
    model: "Browser Runtime",
    latency: 3860,
    p50: 3120,
    p95: 6480,
    p99: 8920,
    requests: 4280,
    trend: 14.7,
    status: "Critical",
  },
  {
    id: "lat-005",
    operation: "Tool Execution",
    agent: "Sales Agent",
    model: "REST / MCP",
    latency: 680,
    p50: 510,
    p95: 1260,
    p99: 1780,
    requests: 11240,
    trend: -3.2,
    status: "Healthy",
  },
  {
    id: "lat-006",
    operation: "Response Generation",
    agent: "Communication Agent",
    model: "GPT-5.6-mini",
    latency: 540,
    p50: 420,
    p95: 940,
    p99: 1380,
    requests: 15480,
    trend: -6.8,
    status: "Healthy",
  },
];

const timeSeries: TimePoint[] = [
  { time: "09:00", latency: 940 },
  { time: "10:00", latency: 1020 },
  { time: "11:00", latency: 980 },
  { time: "12:00", latency: 1160 },
  { time: "13:00", latency: 1090 },
  { time: "14:00", latency: 1240 },
  { time: "15:00", latency: 1180 },
  { time: "16:00", latency: 1060 },
  { time: "17:00", latency: 990 },
  { time: "18:00", latency: 1120 },
  { time: "19:00", latency: 1080 },
  { time: "20:00", latency: 1010 },
];

const latencyDistribution = [
  { label: "< 250ms", value: 18 },
  { label: "250–500ms", value: 27 },
  { label: "500ms–1s", value: 31 },
  { label: "1–2s", value: 16 },
  { label: "> 2s", value: 8 },
];

export default function LatencyAnalyticsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [range, setRange] = useState("Last 24 hours");
  const [selectedRecord, setSelectedRecord] =
    useState<LatencyRecord>(latencyRecords[0]);

  const filteredRecords = useMemo(() => {
    return latencyRecords.filter((record) => {
      const matchesSearch =
        record.operation.toLowerCase().includes(search.toLowerCase()) ||
        record.agent.toLowerCase().includes(search.toLowerCase()) ||
        record.model.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || record.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const averageLatency =
    latencyRecords.reduce((sum, record) => sum + record.latency, 0) /
    latencyRecords.length;

  const p95Average =
    latencyRecords.reduce((sum, record) => sum + record.p95, 0) /
    latencyRecords.length;

  const healthyCount = latencyRecords.filter(
    (record) => record.status === "Healthy"
  ).length;

  const criticalCount = latencyRecords.filter(
    (record) => record.status === "Critical"
  ).length;

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
                <Gauge size={20} className="text-[#2563eb]" />
                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Latency Analytics
                </h1>
              </div>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Monitor response times, latency percentiles, bottlenecks, and
                performance trends across your AI platform.
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
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Average Latency"
            value={`${Math.round(averageLatency)}ms`}
            subtitle="Across all operations"
            icon={<Clock3 size={18} />}
          />

          <MetricCard
            title="P95 Latency"
            value={`${Math.round(p95Average)}ms`}
            subtitle="95% of requests complete below"
            icon={<BarChart3 size={18} />}
          />

          <MetricCard
            title="Healthy Services"
            value={`${healthyCount}/${latencyRecords.length}`}
            subtitle="Within configured thresholds"
            icon={<CheckCircle2 size={18} />}
            positive
          />

          <MetricCard
            title="Critical Operations"
            value={criticalCount.toString()}
            subtitle="Require performance attention"
            icon={<TrendingUp size={18} />}
            warning
          />
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold">
                  Latency trend
                </h2>
                <p className="mt-1 text-[12px] text-[#94a3b8]">
                  Average platform latency over time
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                Average latency
              </div>
            </div>

            <div className="p-5">
              <LatencyChart data={timeSeries} />
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[15px] font-semibold">
                Latency distribution
              </h2>

              <p className="mt-1 text-[12px] text-[#94a3b8]">
                Request distribution by response time
              </p>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                {latencyDistribution.map((item) => (
                  <DistributionRow
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
                <div className="flex items-center gap-2">
                  <Target size={15} className="text-[#2563eb]" />
                  <p className="text-[12px] font-semibold text-[#1e40af]">
                    Target latency
                  </p>
                </div>

                <p className="mt-1 text-[11px] leading-5 text-[#3b82f6]">
                  Keep common AI interactions below 1 second and investigate
                  operations consistently above 2 seconds.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold">
                  Operation latency
                </h2>

                <p className="mt-1 text-[12px] text-[#94a3b8]">
                  Compare latency across agents, models, tools, and runtime
                  operations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search operations..."
                    className="h-9 w-[220px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-[12px] outline-none focus:border-[#93c5fd]"
                  />
                </div>

                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  options={["All", "Healthy", "Warning", "Critical"]}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_350px]">
            <div className="divide-y divide-[#f1f5f9]">
              <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_90px_100px] gap-4 bg-[#fafafa] px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                <span>Operation</span>
                <span>P50</span>
                <span>P95</span>
                <span>P99</span>
                <span>Trend</span>
              </div>

              {filteredRecords.map((record) => (
                <button
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_90px_90px_90px_100px] gap-4 px-5 py-4 text-left transition ${
                    selectedRecord.id === record.id
                      ? "bg-[#f8fbff]"
                      : "hover:bg-[#fafafa]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusDot status={record.status} />

                      <span className="truncate text-[12px] font-semibold text-[#334155]">
                        {record.operation}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#94a3b8]">
                      <span>{record.agent}</span>
                      <span>•</span>
                      <span>{record.model}</span>
                    </div>
                  </div>

                  <span className="text-[12px] font-medium text-[#475569]">
                    {record.p50}ms
                  </span>

                  <span className="text-[12px] font-medium text-[#475569]">
                    {record.p95}ms
                  </span>

                  <span className="text-[12px] font-medium text-[#475569]">
                    {record.p99}ms
                  </span>

                  <TrendValue value={record.trend} />
                </button>
              ))}

              {filteredRecords.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <Search
                    size={23}
                    className="mx-auto text-[#cbd5e1]"
                  />

                  <p className="mt-3 text-[13px] font-medium text-[#64748b]">
                    No operations found
                  </p>
                </div>
              )}
            </div>

            <aside className="border-l border-[#e5e7eb]">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold">
                      Operation details
                    </h3>
                    <p className="mt-1 text-[11px] text-[#94a3b8]">
                      {selectedRecord.id}
                    </p>
                  </div>

                  <StatusBadge status={selectedRecord.status} />
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
                  <p className="text-[11px] text-[#94a3b8]">
                    Current latency
                  </p>

                  <p className="mt-1 text-[27px] font-semibold tracking-[-0.03em]">
                    {selectedRecord.latency}ms
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[#64748b]">
                    {selectedRecord.trend <= 0 ? (
                      <ArrowDown size={12} className="text-[#16a34a]" />
                    ) : (
                      <ArrowUp size={12} className="text-[#dc2626]" />
                    )}

                    {Math.abs(selectedRecord.trend).toFixed(1)}% vs previous
                    period
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <InfoRow
                    label="Agent"
                    value={selectedRecord.agent}
                    icon={<GitBranch size={14} />}
                  />

                  <InfoRow
                    label="Model / Runtime"
                    value={selectedRecord.model}
                    icon={<Server size={14} />}
                  />

                  <InfoRow
                    label="Requests"
                    value={selectedRecord.requests.toLocaleString()}
                    icon={<Activity size={14} />}
                  />

                  <InfoRow
                    label="P50"
                    value={`${selectedRecord.p50}ms`}
                    icon={<Clock3 size={14} />}
                  />

                  <InfoRow
                    label="P95"
                    value={`${selectedRecord.p95}ms`}
                    icon={<BarChart3 size={14} />}
                  />

                  <InfoRow
                    label="P99"
                    value={`${selectedRecord.p99}ms`}
                    icon={<Gauge size={14} />}
                  />
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InsightCard
            icon={<TrendingDown size={17} />}
            title="Fastest improvement"
            description="RAG retrieval latency has decreased consistently after retrieval and indexing optimizations."
            metric="-12.2%"
            label="latency trend"
          />

          <InsightCard
            icon={<Zap size={17} />}
            title="Highest bottleneck"
            description="Browser automation currently has the highest P95 and P99 latency across monitored operations."
            metric="6.48s"
            label="P95 latency"
          />

          <InsightCard
            icon={<Layers3 size={17} />}
            title="Optimization focus"
            description="Model inference and browser operations are the main opportunities for reducing end-to-end response time."
            metric="2"
            label="priority areas"
          />
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Latency monitoring capabilities
              </h2>

              <p className="mt-1 text-[12px] text-[#94a3b8]">
                Track latency from the first request through every downstream
                AI operation.
              </p>
            </div>

            <Link
              href="/agent-builder/observability/execution-traces"
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#2563eb]"
            >
              View execution traces
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            <Capability
              icon={<Activity size={17} />}
              title="Real-time monitoring"
              description="Monitor live latency across production AI workloads."
            />

            <Capability
              icon={<BarChart3 size={17} />}
              title="Percentile analytics"
              description="Analyze P50, P95, and P99 latency to identify tail latency."
            />

            <Capability
              icon={<GitBranch size={17} />}
              title="Bottleneck detection"
              description="Identify the agent, model, tool, or workflow step causing delays."
            />

            <Capability
              icon={<Globe size={17} />}
              title="Service-level latency"
              description="Compare performance across environments and distributed services."
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
  warning,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
          {icon}
        </div>

        {positive && (
          <span className="text-[10px] font-medium text-[#16a34a]">
            Healthy
          </span>
        )}

        {warning && (
          <span className="text-[10px] font-medium text-[#dc2626]">
            Attention
          </span>
        )}
      </div>

      <p className="mt-4 text-[12px] text-[#64748b]">{title}</p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-[#94a3b8]">{subtitle}</p>
    </div>
  );
}

function LatencyChart({ data }: { data: TimePoint[] }) {
  const max = Math.max(...data.map((item) => item.latency));
  const min = Math.min(...data.map((item) => item.latency));
  const range = Math.max(max - min, 1);

  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 92 - ((item.latency - min) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="relative h-[280px] rounded-lg border border-[#eef2f7] bg-[#fafbfc]">
        <div className="absolute inset-0 flex flex-col justify-between px-4 py-5">
          {[0, 1, 2, 3, 4].map((line) => (
            <div
              key={line}
              className="border-t border-dashed border-[#e5e7eb]"
            />
          ))}
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-5 h-[calc(100%-40px)] w-[calc(100%-40px)] overflow-visible"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            className="text-[#2563eb]"
          />

          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = 92 - ((item.latency - min) / range) * 72;

            return (
              <circle
                key={`${item.time}-${item.latency}`}
                cx={x}
                cy={y}
                r="1.5"
                className="fill-[#2563eb]"
              />
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] text-[#94a3b8]">
          {data.map((item) => (
            <span key={item.time}>{item.time}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-[#94a3b8]">Minimum</p>
          <p className="text-[13px] font-semibold">{min}ms</p>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-[#94a3b8]">Average</p>
          <p className="text-[13px] font-semibold">
            {Math.round(
              data.reduce((sum, item) => sum + item.latency, 0) /
                data.length
            )}
            ms
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-[#94a3b8]">Maximum</p>
          <p className="text-[13px] font-semibold">{max}ms</p>
        </div>
      </div>
    </div>
  );
}

function DistributionRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#64748b]">
          {label}
        </span>

        <span className="text-[11px] font-semibold text-[#334155]">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
        <div
          className="h-full rounded-full bg-[#2563eb]"
          style={{ width: `${value}%` }}
        />
      </div>
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
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#475569] outline-none"
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
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[12px] font-medium text-[#475569] outline-none"
      >
        <option>Last 1 hour</option>
        <option>Last 6 hours</option>
        <option>Last 24 hours</option>
        <option>Last 7 days</option>
        <option>Last 30 days</option>
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
      />
    </div>
  );
}

function StatusDot({
  status,
}: {
  status: "Healthy" | "Warning" | "Critical";
}) {
  const styles = {
    Healthy: "bg-[#22c55e]",
    Warning: "bg-[#f59e0b]",
    Critical: "bg-[#ef4444]",
  };

  return (
    <span className={`h-2 w-2 rounded-full ${styles[status]}`} />
  );
}

function StatusBadge({
  status,
}: {
  status: "Healthy" | "Warning" | "Critical";
}) {
  const styles = {
    Healthy: "border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]",
    Warning: "border-[#fde68a] bg-[#fffbeb] text-[#d97706]",
    Critical: "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TrendValue({ value }: { value: number }) {
  const improving = value <= 0;

  return (
    <div
      className={`flex items-center gap-1 text-[11px] font-medium ${
        improving ? "text-[#16a34a]" : "text-[#dc2626]"
      }`}
    >
      {improving ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
      {Math.abs(value).toFixed(1)}%
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f1f5f9] pb-3">
      <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
        {icon}
        {label}
      </div>

      <span className="text-right text-[11px] font-medium text-[#475569]">
        {value}
      </span>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  metric,
  label,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  metric: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
          {icon}
        </div>

        <div className="text-right">
          <p className="text-[18px] font-semibold text-[#334155]">
            {metric}
          </p>
          <p className="text-[10px] text-[#94a3b8]">{label}</p>
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