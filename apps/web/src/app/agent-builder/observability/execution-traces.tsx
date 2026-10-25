"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Filter,
  Gauge,
  GitBranch,
  Globe,
  Layers3,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Terminal,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

type TraceStatus = "Success" | "Running" | "Failed";

type Trace = {
  id: string;
  name: string;
  agent: string;
  status: TraceStatus;
  startedAt: string;
  duration: number;
  tokens: number;
  cost: number;
  steps: number;
  environment: string;
};

const initialTraces: Trace[] = [
  {
    id: "trace-8f31a",
    name: "Customer Support Resolution",
    agent: "Support Agent",
    status: "Success",
    startedAt: "2 min ago",
    duration: 1840,
    tokens: 8420,
    cost: 0.084,
    steps: 12,
    environment: "Production",
  },
  {
    id: "trace-4b92c",
    name: "Research & Summarization",
    agent: "Research Agent",
    status: "Success",
    startedAt: "8 min ago",
    duration: 3240,
    tokens: 14680,
    cost: 0.146,
    steps: 18,
    environment: "Production",
  },
  {
    id: "trace-91de2",
    name: "Document Classification",
    agent: "Document Agent",
    status: "Running",
    startedAt: "12 min ago",
    duration: 9210,
    tokens: 9210,
    cost: 0.092,
    steps: 9,
    environment: "Production",
  },
  {
    id: "trace-73aa1",
    name: "Lead Qualification",
    agent: "Sales Agent",
    status: "Failed",
    startedAt: "18 min ago",
    duration: 2180,
    tokens: 7340,
    cost: 0.073,
    steps: 7,
    environment: "Staging",
  },
  {
    id: "trace-c52bd",
    name: "Knowledge Retrieval",
    agent: "RAG Agent",
    status: "Success",
    startedAt: "25 min ago",
    duration: 1260,
    tokens: 5920,
    cost: 0.059,
    steps: 8,
    environment: "Production",
  },
  {
    id: "trace-e11f7",
    name: "Browser Research Task",
    agent: "Browser Agent",
    status: "Success",
    startedAt: "31 min ago",
    duration: 4860,
    tokens: 18240,
    cost: 0.182,
    steps: 24,
    environment: "Production",
  },
  {
    id: "trace-2ac44",
    name: "Invoice Data Extraction",
    agent: "Finance Agent",
    status: "Success",
    startedAt: "42 min ago",
    duration: 1630,
    tokens: 6740,
    cost: 0.067,
    steps: 10,
    environment: "Production",
  },
  {
    id: "trace-5dd82",
    name: "Email Draft Generation",
    agent: "Communication Agent",
    status: "Success",
    startedAt: "51 min ago",
    duration: 980,
    tokens: 4280,
    cost: 0.043,
    steps: 6,
    environment: "Development",
  },
];

const traceSteps = [
  {
    type: "Trigger",
    title: "Workflow triggered",
    description: "Customer request received from API",
    duration: 42,
    icon: Play,
  },
  {
    type: "Agent",
    title: "Agent planning",
    description: "Support Agent generated execution plan",
    duration: 284,
    icon: GitBranch,
  },
  {
    type: "Model",
    title: "Model inference",
    description: "GPT-5.6 generated reasoning output",
    duration: 684,
    icon: Zap,
  },
  {
    type: "Tool",
    title: "Knowledge retrieval",
    description: "Retrieved 8 relevant knowledge chunks",
    duration: 312,
    icon: Database,
  },
  {
    type: "Tool",
    title: "CRM lookup",
    description: "Customer account information retrieved",
    duration: 196,
    icon: Server,
  },
  {
    type: "Agent",
    title: "Response generation",
    description: "Agent composed final response",
    duration: 238,
    icon: Activity,
  },
  {
    type: "Output",
    title: "Workflow completed",
    description: "Response returned successfully",
    duration: 84,
    icon: CheckCircle2,
  },
];

export default function ExecutionTracesPage() {
  const [traces, setTraces] = useState(initialTraces);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TraceStatus>("All");
  const [environment, setEnvironment] = useState("All");
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(
    initialTraces[0]
  );
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredTraces = useMemo(() => {
    return traces.filter((trace) => {
      const matchesSearch =
        trace.name.toLowerCase().includes(search.toLowerCase()) ||
        trace.agent.toLowerCase().includes(search.toLowerCase()) ||
        trace.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || trace.status === statusFilter;

      const matchesEnvironment =
        environment === "All" || trace.environment === environment;

      return matchesSearch && matchesStatus && matchesEnvironment;
    });
  }, [traces, search, statusFilter, environment]);

  const successCount = traces.filter(
    (trace) => trace.status === "Success"
  ).length;

  const failedCount = traces.filter(
    (trace) => trace.status === "Failed"
  ).length;

  const runningCount = traces.filter(
    (trace) => trace.status === "Running"
  ).length;

  const totalCost = traces.reduce((sum, trace) => sum + trace.cost, 0);

  const avgDuration =
    traces.reduce((sum, trace) => sum + trace.duration, 0) /
    Math.max(traces.length, 1);

  const refreshTraces = () => {
    setTraces((current) => [...current]);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <div className="border-b border-[#e5e7eb] bg-white">
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
                <Activity size={20} className="text-[#2563eb]" />
                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Execution Traces
                </h1>
              </div>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Inspect every agent execution, workflow step, model call, and
                tool interaction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshTraces}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-medium text-[#475569] hover:bg-[#f8fafc]"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              onClick={() => setAutoRefresh((value) => !value)}
              className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium ${
                autoRefresh
                  ? "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]"
                  : "border-[#e5e7eb] bg-white text-[#64748b]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  autoRefresh ? "bg-[#22c55e]" : "bg-[#94a3b8]"
                }`}
              />
              Live
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-8 py-7">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total Traces"
            value={traces.length.toString()}
            subtitle="Last 24 hours"
            icon={<Activity size={18} />}
          />

          <MetricCard
            title="Success Rate"
            value={`${Math.round(
              (successCount / Math.max(traces.length, 1)) * 100
            )}%`}
            subtitle={`${successCount} successful executions`}
            icon={<CheckCircle2 size={18} />}
            positive
          />

          <MetricCard
            title="Average Latency"
            value={`${(avgDuration / 1000).toFixed(2)}s`}
            subtitle="Across all executions"
            icon={<Gauge size={18} />}
          />

          <MetricCard
            title="Trace Cost"
            value={`$${totalCost.toFixed(3)}`}
            subtitle={`${failedCount} failed · ${runningCount} running`}
            icon={<TrendingDown size={18} />}
          />
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Recent executions
                  </h2>
                  <p className="mt-1 text-[12px] text-[#94a3b8]">
                    Select a trace to inspect the complete execution path.
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
                      placeholder="Search traces..."
                      className="h-9 w-[210px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-[12px] outline-none focus:border-[#93c5fd]"
                    />
                  </div>

                  <FilterSelect
                    value={statusFilter}
                    onChange={(value) =>
                      setStatusFilter(value as "All" | TraceStatus)
                    }
                    options={["All", "Success", "Running", "Failed"]}
                  />

                  <FilterSelect
                    value={environment}
                    onChange={setEnvironment}
                    options={["All", "Production", "Staging", "Development"]}
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {filteredTraces.map((trace) => (
                <button
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  className={`w-full px-5 py-4 text-left transition ${
                    selectedTrace?.id === trace.id
                      ? "bg-[#f8fbff]"
                      : "hover:bg-[#fafafa]"
                  }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_120px_90px_80px] items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusDot status={trace.status} />
                        <span className="truncate text-[13px] font-semibold text-[#1e293b]">
                          {trace.name}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-[11px] text-[#94a3b8]">
                        <span>{trace.id}</span>
                        <span>•</span>
                        <span>{trace.agent}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#94a3b8]">Started</p>
                      <p className="mt-0.5 text-[12px] font-medium text-[#475569]">
                        {trace.startedAt}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#94a3b8]">Latency</p>
                      <p className="mt-0.5 text-[12px] font-medium text-[#475569]">
                        {(trace.duration / 1000).toFixed(2)}s
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-[#94a3b8]">Cost</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-[#475569]">
                        ${trace.cost.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {filteredTraces.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <Search
                    size={24}
                    className="mx-auto text-[#cbd5e1]"
                  />
                  <p className="mt-3 text-[13px] font-medium text-[#64748b]">
                    No traces found
                  </p>
                  <p className="mt-1 text-[12px] text-[#94a3b8]">
                    Try changing your search or filters.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Trace details
                  </h2>
                  <p className="mt-1 text-[12px] text-[#94a3b8]">
                    {selectedTrace?.id ?? "No trace selected"}
                  </p>
                </div>

                {selectedTrace && (
                  <StatusBadge status={selectedTrace.status} />
                )}
              </div>
            </div>

            {selectedTrace ? (
              <div>
                <div className="grid grid-cols-2 gap-3 border-b border-[#e5e7eb] p-5">
                  <SmallMetric
                    label="Duration"
                    value={`${(selectedTrace.duration / 1000).toFixed(2)}s`}
                    icon={<Clock3 size={14} />}
                  />
                  <SmallMetric
                    label="Tokens"
                    value={selectedTrace.tokens.toLocaleString()}
                    icon={<Zap size={14} />}
                  />
                  <SmallMetric
                    label="Steps"
                    value={selectedTrace.steps.toString()}
                    icon={<GitBranch size={14} />}
                  />
                  <SmallMetric
                    label="Cost"
                    value={`$${selectedTrace.cost.toFixed(3)}`}
                    icon={<TrendingDown size={14} />}
                  />
                </div>

                <div className="px-5 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold">
                      Execution timeline
                    </h3>
                    <span className="text-[11px] text-[#94a3b8]">
                      {selectedTrace.steps} steps
                    </span>
                  </div>

                  <div className="space-y-0">
                    {traceSteps.map((step, index) => (
                      <TraceStep
                        key={`${step.title}-${index}`}
                        step={step}
                        last={index === traceSteps.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-16 text-center text-[12px] text-[#94a3b8]">
                Select a trace to inspect it.
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InsightCard
            icon={<TrendingDown size={17} />}
            title="Latency optimization"
            description="Several traces spend significant time waiting on external tools. Consider parallel tool execution where dependencies allow it."
            metric="18%"
            metricLabel="potential latency reduction"
          />

          <InsightCard
            icon={<Zap size={17} />}
            title="Token optimization"
            description="Long context windows are increasing token usage in research and browser workflows."
            metric="24%"
            metricLabel="potential token reduction"
          />

          <InsightCard
            icon={<ShieldCheck size={17} />}
            title="Reliability"
            description="Failed executions can be inspected here to identify model, tool, workflow, and data-level failures."
            metric={`${Math.round(
              (failedCount / Math.max(traces.length, 1)) * 100
            )}%`}
            metricLabel="current failure rate"
          />
        </div>

        <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Trace capabilities
              </h2>
              <p className="mt-1 text-[12px] text-[#94a3b8]">
                Execution Traces provides the foundation for debugging and
                observability across agents and workflows.
              </p>
            </div>

            <Link
              href="/agent-builder/observability/ai-optimization"
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#2563eb]"
            >
              AI optimization
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            <Capability
              icon={<Terminal size={17} />}
              title="Step-level traces"
              description="Inspect every agent, model, tool, and workflow operation."
            />

            <Capability
              icon={<Globe size={17} />}
              title="Distributed tracing"
              description="Follow execution across APIs, services, agents, and tools."
            />

            <Capability
              icon={<Layers3 size={17} />}
              title="Context inspection"
              description="Review prompts, retrieved knowledge, outputs, and metadata."
            />

            <Capability
              icon={<ShieldCheck size={17} />}
              title="Secure observability"
              description="Apply governance and access controls to execution data."
            />
          </div>
        </div>
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
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#16a34a]">
            <TrendingUp size={13} />
            Healthy
          </div>
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

function StatusDot({ status }: { status: TraceStatus }) {
  const styles = {
    Success: "bg-[#22c55e]",
    Running: "bg-[#f59e0b]",
    Failed: "bg-[#ef4444]",
  };

  return (
    <span className={`h-2 w-2 rounded-full ${styles[status]}`} />
  );
}

function StatusBadge({ status }: { status: TraceStatus }) {
  const styles = {
    Success: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
    Running: "bg-[#fffbeb] text-[#d97706] border-[#fde68a]",
    Failed: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
  };

  const Icon =
    status === "Success"
      ? CheckCircle2
      : status === "Failed"
        ? XCircle
        : Clock3;

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

function SmallMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#eef2f7] bg-[#fafafa] p-3">
      <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8]">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-[13px] font-semibold text-[#334155]">
        {value}
      </p>
    </div>
  );
}

function TraceStep({
  step,
  last,
}: {
  step: {
    type: string;
    title: string;
    description: string;
    duration: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  };
  last: boolean;
}) {
  const Icon = step.icon;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
          <Icon size={15} />
        </div>

        {!last && <div className="mt-1 h-10 w-px bg-[#e5e7eb]" />}
      </div>

      <div className="min-w-0 flex-1 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-[#334155]">
              {step.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-[#94a3b8]">
              {step.description}
            </p>
          </div>

          <span className="whitespace-nowrap text-[10px] text-[#94a3b8]">
            {step.duration}ms
          </span>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  metric,
  metricLabel,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#475569]">
          {icon}
        </div>

        <div className="text-right">
          <p className="text-[18px] font-semibold text-[#334155]">
            {metric}
          </p>
          <p className="text-[10px] text-[#94a3b8]">{metricLabel}</p>
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