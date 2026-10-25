"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  DollarSign,
  Gauge,
  GitBranch,
  Globe,
  Layers3,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type Metric = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: ReactNode;
};

type Service = {
  name: string;
  type: string;
  requests: string;
  latency: string;
  success: string;
  status: "Healthy" | "Warning";
};

const navigation: NavItem[] = [
  {
    label: "Overview",
    href: "/agent-builder/observability",
    icon: <Activity size={16} />,
  },
  {
    label: "Execution Traces",
    href: "/agent-builder/observability/execution-traces",
    icon: <GitBranch size={16} />,
  },
  {
    label: "Latency Analytics",
    href: "/agent-builder/observability/latency-analytics",
    icon: <Gauge size={16} />,
  },
  {
    label: "Token Usage",
    href: "/agent-builder/observability/token-usage",
    icon: <Zap size={16} />,
  },
  {
    label: "Cost Analytics",
    href: "/agent-builder/observability/cost-analytics",
    icon: <DollarSign size={16} />,
  },
  {
    label: "Success Rate",
    href: "/agent-builder/observability/success-rate",
    icon: <CheckCircle2 size={16} />,
  },
  {
    label: "Agent Versions",
    href: "/agent-builder/observability/agent-versions",
    icon: <Layers3 size={16} />,
  },
  {
    label: "AI Optimization",
    href: "/agent-builder/observability/ai-optimization",
    icon: <Target size={16} />,
  },
];

const services: Service[] = [
  {
    name: "Agent Runtime",
    type: "Agent execution",
    requests: "18.4K",
    latency: "842ms",
    success: "99.2%",
    status: "Healthy",
  },
  {
    name: "Model Gateway",
    type: "Model routing",
    requests: "31.8K",
    latency: "1.24s",
    success: "98.8%",
    status: "Healthy",
  },
  {
    name: "Knowledge / RAG",
    type: "Retrieval",
    requests: "22.6K",
    latency: "410ms",
    success: "99.7%",
    status: "Healthy",
  },
  {
    name: "Browser Runtime",
    type: "Browser automation",
    requests: "5.2K",
    latency: "3.86s",
    success: "96.8%",
    status: "Warning",
  },
];

const activity = [
  {
    title: "Customer Support Agent completed",
    detail: "Trace trace-8f31a · 12 steps · 1.84s",
    time: "2 min ago",
    icon: <CheckCircle2 size={15} />,
  },
  {
    title: "Research Agent completed",
    detail: "Trace trace-4b92c · 18 steps · 3.24s",
    time: "8 min ago",
    icon: <CheckCircle2 size={15} />,
  },
  {
    title: "Browser Agent latency increased",
    detail: "P95 latency crossed 6 seconds",
    time: "12 min ago",
    icon: <TrendingUp size={15} />,
  },
  {
    title: "Document Agent execution started",
    detail: "Trace trace-91de2 · Production",
    time: "14 min ago",
    icon: <Play size={15} />,
  },
  {
    title: "Optimization recommendation generated",
    detail: "Potential 18% latency reduction",
    time: "21 min ago",
    icon: <Target size={15} />,
  },
];

const chartData = [
  { label: "09:00", value: 820 },
  { label: "10:00", value: 910 },
  { label: "11:00", value: 860 },
  { label: "12:00", value: 1040 },
  { label: "13:00", value: 980 },
  { label: "14:00", value: 1120 },
  { label: "15:00", value: 1010 },
  { label: "16:00", value: 940 },
  { label: "17:00", value: 870 },
  { label: "18:00", value: 920 },
  { label: "19:00", value: 840 },
  { label: "20:00", value: 790 },
];

export default function ObservabilityPage() {
  const [range, setRange] = useState("Last 24 hours");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const refreshDashboard = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={21} className="text-[#2563eb]" />
              <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                Observability
              </h1>
            </div>

            <p className="mt-1 text-[13px] text-[#64748b]">
              Monitor agents, models, workflows, tools, latency, cost, and
              execution health.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RangeSelect value={range} onChange={setRange} />

            <button
              onClick={refreshDashboard}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] font-medium text-[#475569] hover:bg-[#f8fafc]"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-8 py-7">
        <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-6">
          <aside className="h-fit rounded-xl border border-[#e5e7eb] bg-white p-3">
            <div className="px-3 pb-3 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                Observability
              </p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = item.label === "Overview";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition ${
                      active
                        ? "bg-[#eff6ff] text-[#2563eb]"
                        : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#334155]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="my-4 border-t border-[#eef2f7]" />

            <div className="rounded-lg bg-[#fafafa] p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#16a34a]" />
                <span className="text-[11px] font-semibold text-[#334155]">
                  Production
                </span>
              </div>

              <p className="mt-1.5 text-[10px] leading-4 text-[#94a3b8]">
                Monitoring is active across production AI services.
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#16a34a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                All systems operational
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                label="Total Requests"
                value="128.4K"
                change="+12.8%"
                positive
                icon={<Activity size={18} />}
              />

              <MetricCard
                label="Average Latency"
                value="842ms"
                change="-8.4%"
                positive
                icon={<Gauge size={18} />}
              />

              <MetricCard
                label="Total Cost"
                value="$184.72"
                change="-6.2%"
                positive
                icon={<DollarSign size={18} />}
              />

              <MetricCard
                label="Success Rate"
                value="99.1%"
                change="+1.8%"
                positive
                icon={<CheckCircle2 size={18} />}
              />
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_320px] gap-5">
              <section className="rounded-xl border border-[#e5e7eb] bg-white">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
                  <div>
                    <h2 className="text-[15px] font-semibold">
                      Platform latency
                    </h2>

                    <p className="mt-1 text-[11px] text-[#94a3b8]">
                      Average response latency over {range.toLowerCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
                    <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                    Latency
                  </div>
                </div>

                <div className="p-5">
                  <LatencyChart data={chartData} />
                </div>
              </section>

              <section className="rounded-xl border border-[#e5e7eb] bg-white">
                <div className="border-b border-[#e5e7eb] px-5 py-4">
                  <h2 className="text-[15px] font-semibold">
                    System health
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Current production service status
                  </p>
                </div>

                <div className="space-y-1 px-5 py-3">
                  <HealthRow
                    label="Agent Runtime"
                    value="99.9%"
                    status="Healthy"
                  />
                  <HealthRow
                    label="Model Gateway"
                    value="99.8%"
                    status="Healthy"
                  />
                  <HealthRow
                    label="Knowledge / RAG"
                    value="99.7%"
                    status="Healthy"
                  />
                  <HealthRow
                    label="Browser Runtime"
                    value="96.8%"
                    status="Warning"
                  />
                  <HealthRow
                    label="MCP / Tools"
                    value="99.5%"
                    status="Healthy"
                  />
                </div>

                <div className="border-t border-[#eef2f7] px-5 py-4">
                  <Link
                    href="/agent-builder/observability/execution-traces"
                    className="flex items-center justify-between text-[11px] font-medium text-[#2563eb]"
                  >
                    View execution traces
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </section>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <SummaryCard
                icon={<GitBranch size={17} />}
                title="Active Agents"
                value="24"
                detail="8 currently executing"
              />

              <SummaryCard
                icon={<Server size={17} />}
                title="Models"
                value="18"
                detail="5 model providers"
              />

              <SummaryCard
                icon={<Zap size={17} />}
                title="Running Workflows"
                value="41"
                detail="7 parallel executions"
              />
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_360px] gap-5">
              <section className="rounded-xl border border-[#e5e7eb] bg-white">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
                  <div>
                    <h2 className="text-[15px] font-semibold">
                      Services & workloads
                    </h2>

                    <p className="mt-1 text-[11px] text-[#94a3b8]">
                      Monitor the main components powering agent execution.
                    </p>
                  </div>

                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search services..."
                      className="h-8 w-[190px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-8 pr-3 text-[11px] outline-none focus:border-[#93c5fd]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_90px_90px] gap-4 bg-[#fafafa] px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                  <span>Service</span>
                  <span>Requests</span>
                  <span>Latency</span>
                  <span>Success</span>
                  <span>Status</span>
                </div>

                <div className="divide-y divide-[#f1f5f9]">
                  {filteredServices.map((service) => (
                    <div
                      key={service.name}
                      className="grid grid-cols-[minmax(0,1fr)_90px_90px_90px_90px] items-center gap-4 px-5 py-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <ServiceIcon name={service.name} />
                          <span className="text-[12px] font-semibold text-[#334155]">
                            {service.name}
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] text-[#94a3b8]">
                          {service.type}
                        </p>
                      </div>

                      <span className="text-[11px] font-medium text-[#475569]">
                        {service.requests}
                      </span>

                      <span className="text-[11px] font-medium text-[#475569]">
                        {service.latency}
                      </span>

                      <span className="text-[11px] font-medium text-[#475569]">
                        {service.success}
                      </span>

                      <HealthBadge status={service.status} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-[#e5e7eb] bg-white">
                <div className="border-b border-[#e5e7eb] px-5 py-4">
                  <h2 className="text-[15px] font-semibold">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Latest observability events
                  </p>
                </div>

                <div className="divide-y divide-[#f1f5f9]">
                  {activity.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="p-4">
                      <div className="flex gap-3">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            item.title.includes("increased")
                              ? "bg-[#fff7ed] text-[#ea580c]"
                              : "bg-[#eff6ff] text-[#2563eb]"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[#334155]">
                            {item.title}
                          </p>

                          <p className="mt-1 text-[10px] leading-4 text-[#94a3b8]">
                            {item.detail}
                          </p>

                          <p className="mt-1.5 text-[9px] text-[#cbd5e1]">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#eef2f7] px-5 py-4">
                  <Link
                    href="/agent-builder/observability/execution-traces"
                    className="flex items-center justify-between text-[11px] font-medium text-[#2563eb]"
                  >
                    Explore all traces
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </section>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <OptimizationCard
                icon={<TrendingDown size={17} />}
                title="Latency optimization"
                value="18%"
                label="potential reduction"
                description="Parallel tool execution and smaller context windows could reduce response latency."
              />

              <OptimizationCard
                icon={<DollarSign size={17} />}
                title="Cost optimization"
                value="$42.8"
                label="estimated monthly savings"
                description="Model routing can shift low-complexity requests to lower-cost models."
              />

              <OptimizationCard
                icon={<Target size={17} />}
                title="Quality monitoring"
                value="99.1%"
                label="overall success"
                description="Track quality and reliability together with latency and cost metrics."
              />
            </div>

            <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Observability capabilities
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Complete visibility across the ModelNow AI agent platform.
                  </p>
                </div>

                <Link
                  href="/agent-builder/observability/ai-optimization"
                  className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563eb]"
                >
                  Open AI optimization
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
                <Capability
                  icon={<GitBranch size={17} />}
                  title="Execution traces"
                  description="Inspect every agent, workflow, model, and tool step."
                />

                <Capability
                  icon={<Gauge size={17} />}
                  title="Latency analytics"
                  description="Track P50, P95, P99, bottlenecks, and latency trends."
                />

                <Capability
                  icon={<BarChart3 size={17} />}
                  title="Usage analytics"
                  description="Understand model usage, tokens, cost, and workload behavior."
                />

                <Capability
                  icon={<ShieldCheck size={17} />}
                  title="Governance"
                  description="Control observability data access, policies, and audit visibility."
                />
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  change,
  positive,
  icon,
}: Metric) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
          {icon}
        </div>

        <div
          className={`flex items-center gap-1 text-[10px] font-medium ${
            positive ? "text-[#16a34a]" : "text-[#dc2626]"
          }`}
        >
          {positive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          {change}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#64748b]">{label}</p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">
        Compared with previous period
      </p>
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

function LatencyChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((item) => item.value));
  const min = Math.min(...data.map((item) => item.value));
  const range = Math.max(max - min, 1);

  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 90 - ((item.value - min) / range) * 68;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="relative h-[300px] rounded-lg border border-[#eef2f7] bg-[#fafbfc]">
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
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
            className="text-[#2563eb]"
          />

          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = 90 - ((item.value - min) / range) * 68;

            return (
              <circle
                key={`${item.label}-${item.value}`}
                cx={x}
                cy={y}
                r="1.4"
                className="fill-[#2563eb]"
              />
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] text-[#94a3b8]">
          {data.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#94a3b8]">Minimum</p>
          <p className="text-[13px] font-semibold">{min}ms</p>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#94a3b8]">Average</p>
          <p className="text-[13px] font-semibold">
            {Math.round(
              data.reduce((sum, item) => sum + item.value, 0) /
                data.length
            )}
            ms
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-[#94a3b8]">Peak</p>
          <p className="text-[13px] font-semibold">{max}ms</p>
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "Healthy" | "Warning";
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "Healthy" ? "bg-[#22c55e]" : "bg-[#f59e0b]"
          }`}
        />

        <span className="text-[11px] font-medium text-[#475569]">
          {label}
        </span>
      </div>

      <span
        className={`text-[10px] font-semibold ${
          status === "Healthy" ? "text-[#16a34a]" : "text-[#d97706]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  detail,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
          {icon}
        </div>

        <span className="text-[12px] font-medium text-[#64748b]">
          {title}
        </span>
      </div>

      <p className="mt-4 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">{detail}</p>
    </div>
  );
}

function ServiceIcon({ name }: { name: string }) {
  if (name.includes("Knowledge")) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f0fdf4] text-[#16a34a]">
        <Database size={14} />
      </div>
    );
  }

  if (name.includes("Browser")) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#fff7ed] text-[#ea580c]">
        <Globe size={14} />
      </div>
    );
  }

  if (name.includes("Model")) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f5f3ff] text-[#7c3aed]">
        <Bot size={14} />
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eff6ff] text-[#2563eb]">
      <Server size={14} />
    </div>
  );
}

function HealthBadge({
  status,
}: {
  status: "Healthy" | "Warning";
}) {
  return (
    <span
      className={`w-fit rounded-full border px-2 py-1 text-[9px] font-medium ${
        status === "Healthy"
          ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]"
          : "border-[#fde68a] bg-[#fffbeb] text-[#d97706]"
      }`}
    >
      {status}
    </span>
  );
}

function OptimizationCard({
  icon,
  title,
  value,
  label,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
          {icon}
        </div>

        <div className="text-right">
          <p className="text-[18px] font-semibold text-[#334155]">
            {value}
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