"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  Globe,
  Layers3,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

type HealthStatus = "Healthy" | "Warning" | "Critical";

type SuccessRecord = {
  id: string;
  name: string;
  type: string;
  requests: number;
  successful: number;
  failed: number;
  successRate: number;
  p95: number;
  trend: number;
  status: HealthStatus;
};

const initialRecords: SuccessRecord[] = [
  {
    id: "sr-001",
    name: "Customer Support Agent",
    type: "Agent",
    requests: 18420,
    successful: 18275,
    failed: 145,
    successRate: 99.21,
    p95: 1840,
    trend: 1.8,
    status: "Healthy",
  },
  {
    id: "sr-002",
    name: "Research Agent",
    type: "Agent",
    requests: 12840,
    successful: 12692,
    failed: 148,
    successRate: 98.85,
    p95: 3240,
    trend: 0.9,
    status: "Healthy",
  },
  {
    id: "sr-003",
    name: "Knowledge / RAG",
    type: "Retrieval",
    requests: 22640,
    successful: 22572,
    failed: 68,
    successRate: 99.7,
    p95: 760,
    trend: 2.4,
    status: "Healthy",
  },
  {
    id: "sr-004",
    name: "Browser Automation",
    type: "Tool",
    requests: 5240,
    successful: 5072,
    failed: 168,
    successRate: 96.79,
    p95: 6480,
    trend: -2.7,
    status: "Critical",
  },
  {
    id: "sr-005",
    name: "Model Gateway",
    type: "Infrastructure",
    requests: 31820,
    successful: 31438,
    failed: 382,
    successRate: 98.8,
    p95: 2180,
    trend: 0.6,
    status: "Warning",
  },
  {
    id: "sr-006",
    name: "MCP Tool Runtime",
    type: "Tool",
    requests: 11240,
    successful: 11184,
    failed: 56,
    successRate: 99.5,
    p95: 1260,
    trend: 1.2,
    status: "Healthy",
  },
  {
    id: "sr-007",
    name: "Document Processing",
    type: "Workflow",
    requests: 9460,
    successful: 9381,
    failed: 79,
    successRate: 99.16,
    p95: 1640,
    trend: 1.6,
    status: "Healthy",
  },
  {
    id: "sr-008",
    name: "Computer Use",
    type: "Tool",
    requests: 3820,
    successful: 3688,
    failed: 132,
    successRate: 96.54,
    p95: 5840,
    trend: -3.4,
    status: "Critical",
  },
];

const hourlyData = [
  { time: "09:00", rate: 98.7 },
  { time: "10:00", rate: 98.9 },
  { time: "11:00", rate: 99.1 },
  { time: "12:00", rate: 98.6 },
  { time: "13:00", rate: 99.2 },
  { time: "14:00", rate: 99.0 },
  { time: "15:00", rate: 98.8 },
  { time: "16:00", rate: 99.3 },
  { time: "17:00", rate: 99.1 },
  { time: "18:00", rate: 99.4 },
  { time: "19:00", rate: 99.2 },
  { time: "20:00", rate: 99.3 },
];

const failureReasons = [
  {
    label: "Tool timeout",
    count: 286,
    percentage: 31,
  },
  {
    label: "Model error",
    count: 214,
    percentage: 23,
  },
  {
    label: "Rate limit",
    count: 168,
    percentage: 18,
  },
  {
    label: "Validation failure",
    count: 132,
    percentage: 14,
  },
  {
    label: "Network error",
    count: 96,
    percentage: 10,
  },
  {
    label: "Other",
    count: 37,
    percentage: 4,
  },
];

export default function SuccessRatePage() {
  const [records] = useState<SuccessRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [range, setRange] = useState("Last 24 hours");
  const [selectedRecord, setSelectedRecord] =
    useState<SuccessRecord>(initialRecords[0]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(search.toLowerCase()) ||
        record.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const totalRequests = records.reduce(
    (sum, record) => sum + record.requests,
    0
  );

  const totalSuccessful = records.reduce(
    (sum, record) => sum + record.successful,
    0
  );

  const totalFailed = records.reduce(
    (sum, record) => sum + record.failed,
    0
  );

  const overallSuccessRate =
    (totalSuccessful / Math.max(totalRequests, 1)) * 100;

  const healthyCount = records.filter(
    (record) => record.status === "Healthy"
  ).length;

  const criticalCount = records.filter(
    (record) => record.status === "Critical"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/observability"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#64748b] transition hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#2563eb]" />
                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Success Rate
                </h1>
              </div>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Monitor execution reliability, failures, recovery behavior, and
                service health across your AI platform.
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
            title="Overall Success Rate"
            value={`${overallSuccessRate.toFixed(2)}%`}
            subtitle={`${totalSuccessful.toLocaleString()} successful requests`}
            icon={<CheckCircle2 size={18} />}
            positive
          />

          <MetricCard
            title="Total Requests"
            value={formatCompact(totalRequests)}
            subtitle={`Last ${range.toLowerCase()}`}
            icon={<Activity size={18} />}
          />

          <MetricCard
            title="Failed Requests"
            value={formatCompact(totalFailed)}
            subtitle="Across monitored workloads"
            icon={<XCircle size={18} />}
            warning
          />

          <MetricCard
            title="Critical Services"
            value={criticalCount.toString()}
            subtitle={`${healthyCount} services currently healthy`}
            icon={<AlertTriangle size={18} />}
            warning
          />
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold">
                  Success rate trend
                </h2>

                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  Platform reliability over {range.toLowerCase()}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                Success rate
              </div>
            </div>

            <div className="p-5">
              <SuccessChart data={hourlyData} />

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniStat
                  label="Best hour"
                  value="99.4%"
                  detail="18:00"
                />

                <MiniStat
                  label="Lowest hour"
                  value="98.6%"
                  detail="12:00"
                />

                <MiniStat
                  label="Target"
                  value="99.0%"
                  detail="SLA threshold"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[15px] font-semibold">
                Failure breakdown
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Main causes of unsuccessful executions
              </p>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                {failureReasons.map((reason) => (
                  <FailureRow
                    key={reason.label}
                    label={reason.label}
                    count={reason.count}
                    percentage={reason.percentage}
                  />
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-[#fef3c7] bg-[#fffbeb] p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={15}
                    className="text-[#d97706]"
                  />

                  <p className="text-[12px] font-semibold text-[#92400e]">
                    Reliability focus
                  </p>
                </div>

                <p className="mt-1 text-[11px] leading-5 text-[#a16207]">
                  Tool timeouts and model errors account for a large portion of
                  failed executions and should be monitored closely.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Service success rates
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Compare reliability across agents, tools, workflows, and
                infrastructure.
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
                  placeholder="Search services..."
                  className="h-9 w-[210px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-8 pr-3 text-[11px] outline-none focus:border-[#93c5fd]"
                />
              </div>

              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={["All", "Healthy", "Warning", "Critical"]}
              />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_100px_100px_100px_100px_100px] gap-4 bg-[#fafafa] px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
            <span>Service</span>
            <span>Requests</span>
            <span>Success</span>
            <span>Failed</span>
            <span>Rate</span>
            <span>Trend</span>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {filteredRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`grid w-full grid-cols-[minmax(0,1fr)_100px_100px_100px_100px_100px] items-center gap-4 px-5 py-4 text-left transition ${
                  selectedRecord.id === record.id
                    ? "bg-[#f8fbff]"
                    : "hover:bg-[#fafafa]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot status={record.status} />

                    <span className="truncate text-[12px] font-semibold text-[#334155]">
                      {record.name}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[#94a3b8]">
                    <span>{record.type}</span>
                    <span>•</span>
                    <span>{record.id}</span>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-[#475569]">
                  {formatCompact(record.requests)}
                </span>

                <span className="text-[11px] font-medium text-[#16a34a]">
                  {formatCompact(record.successful)}
                </span>

                <span className="text-[11px] font-medium text-[#dc2626]">
                  {record.failed.toLocaleString()}
                </span>

                <span
                  className={`text-[11px] font-semibold ${
                    record.successRate >= 99
                      ? "text-[#16a34a]"
                      : record.successRate >= 98
                        ? "text-[#d97706]"
                        : "text-[#dc2626]"
                  }`}
                >
                  {record.successRate.toFixed(2)}%
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
                  No services found
                </p>

                <p className="mt-1 text-[11px] text-[#94a3b8]">
                  Try changing your search or status filter.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Selected service
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Detailed reliability information
                  </p>
                </div>

                <StatusBadge status={selectedRecord.status} />
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between rounded-lg border border-[#eef2f7] bg-[#fafafa] p-4">
                <div>
                  <p className="text-[11px] text-[#94a3b8]">
                    Current success rate
                  </p>

                  <p className="mt-1 text-[30px] font-semibold tracking-[-0.04em]">
                    {selectedRecord.successRate.toFixed(2)}%
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[10px]">
                    <TrendValue value={selectedRecord.trend} />
                    <span className="text-[#94a3b8]">
                      vs previous period
                    </span>
                  </div>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-[#dcfce7] bg-white">
                  <CheckCircle2
                    size={25}
                    className="text-[#16a34a]"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniStat
                  label="Requests"
                  value={formatCompact(selectedRecord.requests)}
                  detail="total"
                />

                <MiniStat
                  label="Successful"
                  value={formatCompact(selectedRecord.successful)}
                  detail="completed"
                />

                <MiniStat
                  label="Failed"
                  value={selectedRecord.failed.toLocaleString()}
                  detail="errors"
                />
              </div>

              <div className="mt-5 space-y-3">
                <InfoRow
                  label="Service"
                  value={selectedRecord.name}
                  icon={<Server size={14} />}
                />

                <InfoRow
                  label="Type"
                  value={selectedRecord.type}
                  icon={<Layers3 size={14} />}
                />

                <InfoRow
                  label="P95 latency"
                  value={`${selectedRecord.p95}ms`}
                  icon={<Clock3 size={14} />}
                />

                <InfoRow
                  label="Reliability target"
                  value="99.0%"
                  icon={<Target size={14} />}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <h2 className="text-[15px] font-semibold">
                Reliability controls
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Monitor and improve execution reliability.
              </p>
            </div>

            <div className="space-y-1 px-5 py-3">
              <ControlRow
                icon={<ShieldCheck size={15} />}
                title="Failure alerts"
                description="Alert when success rate falls below target."
                active
              />

              <ControlRow
                icon={<RefreshCw size={15} />}
                title="Automatic retry"
                description="Retry transient tool and network failures."
                active
              />

              <ControlRow
                icon={<GitBranch size={15} />}
                title="Failure tracing"
                description="Capture failed execution traces."
                active
              />

              <ControlRow
                icon={<Database size={15} />}
                title="Error classification"
                description="Group failures by root-cause category."
                active
              />
            </div>
          </section>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InsightCard
            icon={<TrendingUp size={17} />}
            title="Reliability improvement"
            metric="+1.8%"
            label="overall trend"
            description="Overall platform reliability is trending upward compared with the previous period."
            positive
          />

          <InsightCard
            icon={<AlertTriangle size={17} />}
            title="Primary failure source"
            metric="31%"
            label="tool timeouts"
            description="Tool timeout failures represent the largest identified failure category."
          />

          <InsightCard
            icon={<Target size={17} />}
            title="SLA target"
            metric="99.0%"
            label="minimum target"
            description="Services below the reliability target should be investigated and monitored closely."
          />
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Reliability capabilities
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Connect success-rate monitoring with the rest of the
                observability platform.
              </p>
            </div>

            <Link
              href="/agent-builder/observability/execution-traces"
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563eb]"
            >
              View execution traces
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            <Capability
              icon={<GitBranch size={17} />}
              title="Failure traces"
              description="Inspect the exact execution path behind failed requests."
            />

            <Capability
              icon={<BarChart3 size={17} />}
              title="Error analytics"
              description="Analyze failure categories and reliability trends."
            />

            <Capability
              icon={<Clock3 size={17} />}
              title="Latency correlation"
              description="Compare reliability with latency and timeout behavior."
            />

            <Capability
              icon={<ShieldCheck size={17} />}
              title="SLA monitoring"
              description="Track services against configured reliability targets."
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

      <p className="mt-4 text-[11px] text-[#64748b]">{title}</p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">{subtitle}</p>
    </div>
  );
}

function SuccessChart({
  data,
}: {
  data: { time: string; rate: number }[];
}) {
  const max = 100;
  const min = 98;

  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 90 - ((item.rate - min) / (max - min)) * 68;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="relative h-[280px] rounded-lg border border-[#eef2f7] bg-[#fafbfc]">
        <div className="absolute inset-0 flex flex-col justify-between px-4 py-5">
          {[100, 99.5, 99, 98.5, 98].map((value) => (
            <div
              key={value}
              className="relative border-t border-dashed border-[#e5e7eb]"
            >
              <span className="absolute -top-2.5 left-0 text-[8px] text-[#cbd5e1]">
                {value.toFixed(1)}%
              </span>
            </div>
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
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            className="text-[#16a34a]"
          />

          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = 90 - ((item.rate - min) / (max - min)) * 68;

            return (
              <circle
                key={`${item.time}-${item.rate}`}
                cx={x}
                cy={y}
                r="1.4"
                className="fill-[#16a34a]"
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
    </div>
  );
}

function FailureRow({
  label,
  count,
  percentage,
}: {
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#64748b]">
          {label}
        </span>

        <span className="text-[10px] font-semibold text-[#475569]">
          {count} · {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
        <div
          className="h-full rounded-full bg-[#ef4444]"
          style={{ width: `${percentage}%` }}
        />
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
  status: HealthStatus;
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
  status: HealthStatus;
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
  const improving = value >= 0;

  return (
    <div
      className={`flex items-center gap-1 text-[10px] font-medium ${
        improving ? "text-[#16a34a]" : "text-[#dc2626]"
      }`}
    >
      {improving ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
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
      <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
        {icon}
        {label}
      </div>

      <span className="text-right text-[10px] font-medium text-[#475569]">
        {value}
      </span>
    </div>
  );
}

function ControlRow({
  icon,
  title,
  description,
  active,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#f1f5f9] py-3 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[#334155]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-[#94a3b8]">
          {description}
        </p>
      </div>

      <span
        className={`mt-1 h-2 w-2 rounded-full ${
          active ? "bg-[#22c55e]" : "bg-[#cbd5e1]"
        }`}
      />
    </div>
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
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}