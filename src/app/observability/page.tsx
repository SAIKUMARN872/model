
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Download,
  Gauge,
  Layers3,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Section =
  | "Overview"
  | "Metrics"
  | "Traces"
  | "Logs"
  | "Model Performance"
  | "Token Usage"
  | "Errors & Alerts"
  | "Analytics"
  | "Usage"
  | "Evaluation"
  | "Security & Governance";

const navigation: {
  group: string;
  items: { label: Section; icon: typeof Activity }[];
}[] = [
  {
    group: "OBSERVABILITY",
    items: [
      { label: "Overview", icon: Activity },
      { label: "Metrics", icon: Gauge },
      { label: "Traces", icon: Layers3 },
      { label: "Logs", icon: Database },
      { label: "Model Performance", icon: Bot },
      { label: "Token Usage", icon: Zap },
      { label: "Errors & Alerts", icon: Bell },
    ],
  },
  {
    group: "INTELLIGENCE",
    items: [
      { label: "Analytics", icon: BarChart3 },
      { label: "Usage", icon: Activity },
      { label: "Evaluation", icon: CheckCircle2 },
    ],
  },
  {
    group: "CONTROL",
    items: [
      { label: "Security & Governance", icon: ShieldCheck },
    ],
  },
];

const dailyData = [
  { day: "Mon", requests: 18400, tokens: 420000, latency: 320 },
  { day: "Tue", requests: 22100, tokens: 510000, latency: 290 },
  { day: "Wed", requests: 19800, tokens: 470000, latency: 350 },
  { day: "Thu", requests: 26700, tokens: 640000, latency: 270 },
  { day: "Fri", requests: 24800, tokens: 590000, latency: 300 },
  { day: "Sat", requests: 30200, tokens: 710000, latency: 245 },
  { day: "Sun", requests: 32600, tokens: 780000, latency: 225 },
];

const latencyData = [
  { time: "00:00", p50: 120, p95: 280, p99: 420 },
  { time: "04:00", p50: 115, p95: 250, p99: 390 },
  { time: "08:00", p50: 145, p95: 320, p99: 510 },
  { time: "12:00", p50: 135, p95: 300, p99: 460 },
  { time: "16:00", p50: 110, p95: 250, p99: 380 },
  { time: "20:00", p50: 100, p95: 220, p99: 340 },
  { time: "23:00", p50: 105, p95: 230, p99: 350 },
];

const modelData = [
  { name: "GPT-5", requests: 32, latency: 210, quality: 94 },
  { name: "Claude", requests: 27, latency: 245, quality: 96 },
  { name: "Gemini", requests: 22, latency: 190, quality: 91 },
  { name: "Llama", requests: 19, latency: 165, quality: 87 },
];

const featureData = [
  { name: "Chat", value: 32, color: "#818cf8" },
  { name: "Agents", value: 21, color: "#38bdf8" },
  { name: "Knowledge Hub", value: 18, color: "#34d399" },
  { name: "Browser", value: 12, color: "#fbbf24" },
  { name: "Computer Use", value: 9, color: "#c084fc" },
  { name: "Fine-tuning", value: 8, color: "#fb7185" },
];

const logData = [
  {
    time: "10:42:18.321",
    level: "INFO",
    service: "AI Gateway",
    message: "Request completed successfully",
    status: "200",
  },
  {
    time: "10:41:52.104",
    level: "WARN",
    service: "Model Router",
    message: "Fallback model selected after latency threshold",
    status: "200",
  },
  {
    time: "10:40:39.882",
    level: "ERROR",
    service: "Agent Service",
    message: "Upstream model request timed out",
    status: "504",
  },
  {
    time: "10:39:21.015",
    level: "INFO",
    service: "Knowledge Hub",
    message: "Retrieval completed successfully",
    status: "200",
  },
  {
    time: "10:38:07.640",
    level: "INFO",
    service: "Evaluation",
    message: "Evaluation batch completed",
    status: "200",
  },
];

const securityEvents = [
  {
    title: "Unusual request pattern",
    detail: "AI Gateway · Review request volume and source",
    severity: "Medium",
    time: "12 min ago",
  },
  {
    title: "Policy validation required",
    detail: "Model Governance · Pending policy review",
    severity: "Low",
    time: "38 min ago",
  },
  {
    title: "Rate limit threshold approached",
    detail: "API Security · Request rate above 80% of limit",
    severity: "Medium",
    time: "1 hour ago",
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

function MetricCard({
  title,
  value,
  unit,
  change,
  positive = true,
  icon: Icon,
}: {
  title: string;
  value: string;
  unit?: string;
  change: string;
  positive?: boolean;
  icon: typeof Activity;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {positive ? (
          <ArrowUpRight size={14} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={14} className="text-rose-600" />
        )}
        <span
          className={
            positive ? "font-medium text-emerald-700" : "font-medium text-rose-700"
          }
        >
          {change}
        </span>
        <span className="text-slate-400">vs previous period</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    INFO: "bg-sky-50 text-sky-700",
    WARN: "bg-amber-50 text-amber-700",
    ERROR: "bg-rose-50 text-rose-700",
    Healthy: "bg-emerald-50 text-emerald-700",
    Degraded: "bg-amber-50 text-amber-700",
    Critical: "bg-rose-50 text-rose-700",
    Low: "bg-sky-50 text-sky-700",
    Medium: "bg-amber-50 text-amber-700",
    High: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function ObservabilityPage() {
  const [activeSection, setActiveSection] = useState<Section>("Overview");
  const [range, setRange] = useState("7 days");
  const [search, setSearch] = useState("");
  const [logLevel, setLogLevel] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredLogs = useMemo(
    () =>
      logData.filter((log) => {
        const matchesSearch =
          `${log.service} ${log.message} ${log.level}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesLevel = logLevel === "All" || log.level === logLevel;
        return matchesSearch && matchesLevel;
      }),
    [search, logLevel, refreshKey],
  );

  const pageTitle: Record<Section, string> = {
    Overview: "Observability overview",
    Metrics: "Metrics explorer",
    Traces: "Distributed traces",
    Logs: "Logs explorer",
    "Model Performance": "Model performance",
    "Token Usage": "Token usage",
    "Errors & Alerts": "Errors & alerts",
    Analytics: "AI analytics",
    Usage: "Usage analytics",
    Evaluation: "Model evaluation",
    "Security & Governance": "Security & governance",
  };

  const pageDescription: Record<Section, string> = {
    Overview: "Monitor the health, reliability, and performance of your AI platform.",
    Metrics: "Explore service-level metrics and resource utilization.",
    Traces: "Inspect request flows and distributed execution paths.",
    Logs: "Search application logs and investigate operational events.",
    "Model Performance": "Compare model latency, throughput, and quality.",
    "Token Usage": "Understand token consumption and model efficiency.",
    "Errors & Alerts": "Review errors, incidents, and operational signals.",
    Analytics: "Analyze daily, weekly, and monthly AI workload trends.",
    Usage: "Understand how your AI services and platform features are being used.",
    Evaluation: "Track evaluation results and compare model quality.",
    "Security & Governance": "Monitor security events, vulnerabilities, and governance controls.",
  };

  const selectedRangeLabel = range === "24 hours" ? "Today" : range === "30 days" ? "Last 30 days" : "Last 7 days";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">ModelNow</p>
              <p className="text-[11px] text-slate-500">Observability</p>
            </div>
          </div>

          <div className="border-b border-slate-100 px-4 py-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Workspace
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Production</span>
                <ChevronDown size={15} className="text-slate-400" />
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
            {navigation.map((group) => (
              <div key={group.group}>
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.13em] text-slate-400">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setActiveSection(label)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        activeSection === label
                          ? "bg-indigo-50 font-semibold text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <Icon size={17} />
                      <span className="flex-1">{label}</span>
                      {label === "Errors & Alerts" && (
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                MN
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">ModelNow Workspace</p>
                <p className="text-xs text-slate-500">Platform monitoring</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 lg:hidden">
                <Activity size={19} />
              </div>
              <div>
                <p className="text-xs text-slate-400">ModelNow / Platform</p>
                <p className="text-sm font-semibold">Observability & Intelligence</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <Clock3 size={15} className="text-slate-500" />
                <select
                  value={range}
                  onChange={(event) => setRange(event.target.value)}
                  className="max-w-28 bg-transparent text-xs font-medium outline-none"
                  aria-label="Time range"
                >
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                </select>
              </label>
              <button
                onClick={() => setRefreshKey((value) => value + 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1700px] space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status="Healthy" />
                  <span className="text-xs text-slate-400">
                    Demo monitoring data · {selectedRangeLabel}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {pageTitle[activeSection]}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {pageDescription[activeSection]}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Services operational
                </span>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                  Updated just now
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard
                title="Total requests"
                value={formatNumber(184620)}
                change="+12.8%"
                icon={Activity}
              />
              <MetricCard
                title="P95 latency"
                value="280"
                unit="ms"
                change="-8.4%"
                icon={Gauge}
              />
              <MetricCard
                title="Task success rate"
                value="98.7%"
                change="+1.2%"
                icon={CheckCircle2}
              />
              <MetricCard
                title="Tokens processed"
                value="4.82M"
                change="+16.3%"
                icon={Zap}
              />
            </div>

            {(activeSection === "Overview" ||
              activeSection === "Analytics" ||
              activeSection === "Metrics" ||
              activeSection === "Usage") && (
              <>
                <div className="grid grid-cols-1 gap-5 2xl:grid-cols-3">
                  <div className="2xl:col-span-2">
                    <Panel
                      title="Request volume & token usage"
                      subtitle="Daily workload trends across the platform"
                      action={
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                          {selectedRangeLabel}
                        </span>
                      }
                    >
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dailyData}>
                            <defs>
                              <linearGradient id="requestFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.23} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={formatNumber} />
                            <Tooltip />
                            <Area type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" strokeWidth={2.5} fill="url(#requestFill)" />
                            <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#38bdf8" strokeWidth={2} fill="url(#tokenFill)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-5 text-xs text-slate-500">
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />Requests</span>
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400" />Tokens</span>
                      </div>
                    </Panel>
                  </div>

                  <Panel
                    title="Platform feature usage"
                    subtitle="Share of activity by ModelNow feature"
                  >
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={featureData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3}>
                            {featureData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, "Usage share"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {featureData.map((feature) => (
                        <div key={feature.name} className="flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-2 text-slate-600">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: feature.color }} />
                            {feature.name}
                          </span>
                          <span className="font-semibold text-slate-800">{feature.value}%</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <Panel
                    title="Latency percentiles"
                    subtitle="Compare P50, P95, and P99 response latency in milliseconds"
                  >
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={latencyData}>
                          <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="p50" name="P50" stroke="#10b981" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="p95" name="P95" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="p99" name="P99" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="text-emerald-600">● P50</span>
                      <span className="text-indigo-600">● P95</span>
                      <span className="text-amber-600">● P99</span>
                    </div>
                  </Panel>

                  <Panel
                    title="Model performance comparison"
                    subtitle="Relative request distribution across model providers"
                  >
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelData} layout="vertical" margin={{ left: 8, right: 10 }}>
                          <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <YAxis type="category" dataKey="name" width={70} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                          <Tooltip />
                          <Bar dataKey="requests" name="Request share" fill="#6366f1" radius={[0, 5, 5, 0]} barSize={22} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {modelData.map((model) => (
                        <div key={model.name} className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">{model.name}</p>
                          <p className="mt-1 text-sm font-semibold">{model.quality}% quality</p>
                          <p className="mt-1 text-xs text-slate-400">{model.latency} ms avg. latency</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </>
            )}

            {(activeSection === "Overview" ||
              activeSection === "Model Performance" ||
              activeSection === "Evaluation") && (
              <Panel
                title="Model health & efficiency"
                subtitle="Compare latency, quality, and operational status"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400">
                        <th className="px-3 py-3 font-medium">Model</th>
                        <th className="px-3 py-3 font-medium">Requests</th>
                        <th className="px-3 py-3 font-medium">Latency</th>
                        <th className="px-3 py-3 font-medium">Quality</th>
                        <th className="px-3 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelData.map((model, index) => (
                        <tr key={model.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                          <td className="px-3 py-4 font-medium">{model.name}</td>
                          <td className="px-3 py-4 text-slate-600">{model.requests}%</td>
                          <td className="px-3 py-4 text-slate-600">{model.latency} ms</td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${model.quality}%` }} />
                              </div>
                              <span className="text-xs text-slate-600">{model.quality}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <StatusBadge status={index === 1 ? "Healthy" : index === 2 ? "Degraded" : "Healthy"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {(activeSection === "Overview" ||
              activeSection === "Errors & Alerts" ||
              activeSection === "Logs" ||
              activeSection === "Traces") && (
              <Panel
                title={activeSection === "Traces" ? "Recent traces" : activeSection === "Errors & Alerts" ? "Recent errors & alerts" : "Recent logs"}
                subtitle="Search and filter recent platform events"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={logLevel}
                      onChange={(event) => setLogLevel(event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none"
                      aria-label="Filter log level"
                    >
                      <option>All</option>
                      <option>INFO</option>
                      <option>WARN</option>
                      <option>ERROR</option>
                    </select>
                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2">
                      <Search size={14} className="text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search logs"
                        className="w-24 text-xs outline-none sm:w-32"
                      />
                    </label>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="px-3 py-3 font-medium">Timestamp</th>
                        <th className="px-3 py-3 font-medium">Level</th>
                        <th className="px-3 py-3 font-medium">Service</th>
                        <th className="px-3 py-3 font-medium">Message</th>
                        <th className="px-3 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={`${log.time}-${log.service}`} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                          <td className="whitespace-nowrap px-3 py-4 font-mono text-slate-400">{log.time}</td>
                          <td className="px-3 py-4"><StatusBadge status={log.level} /></td>
                          <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-700">{log.service}</td>
                          <td className="px-3 py-4 text-slate-600">{log.message}</td>
                          <td className="px-3 py-4 font-mono text-slate-500">{log.status}</td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                            No events match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {activeSection === "Token Usage" && (
              <Panel title="Token consumption" subtitle="Daily token volume across the platform">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={formatNumber} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            )}

            {activeSection === "Security & Governance" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricCard title="Security events" value="12" change="+2" positive={false} icon={ShieldCheck} />
                  <MetricCard title="Policy compliance" value="98.2%" change="+0.8%" icon={CheckCircle2} />
                  <MetricCard title="Open reviews" value="3" change="1 new" positive={false} icon={LockKeyhole} />
                </div>
                <Panel title="Security events & governance reviews" subtitle="Illustrative events requiring monitoring or review">
                  <div className="space-y-3">
                    {securityEvents.map((event) => (
                      <div key={event.title} className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center">
                        <div className="flex gap-3">
                          <span className="mt-0.5 rounded-lg bg-amber-50 p-2 text-amber-700">
                            <AlertTriangle size={17} />
                          </span>
                          <div>
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{event.detail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-12 sm:pl-0">
                          <StatusBadge status={event.severity} />
                          <span className="whitespace-nowrap text-xs text-slate-400">{event.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}

            {activeSection === "Metrics" && (
              <Panel title="Resource utilization" subtitle="Illustrative compute and service capacity">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {[
                    { name: "CPU utilization", value: 62 },
                    { name: "Memory utilization", value: 74 },
                    { name: "GPU utilization", value: 48 },
                  ].map((item) => (
                    <div key={item.name} className="rounded-xl border border-slate-100 p-4">
                      <p className="text-sm text-slate-500">{item.name}</p>
                      <p className="mt-3 text-2xl font-semibold">{item.value}%</p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {activeSection === "Traces" && (
              <Panel title="Trace execution flow" subtitle="Example distributed request path">
                <div className="space-y-3">
                  {[
                    { name: "API Gateway", duration: "18 ms", width: "12%" },
                    { name: "Model Router", duration: "34 ms", width: "24%" },
                    { name: "Model Inference", duration: "162 ms", width: "72%" },
                    { name: "Response Processing", duration: "21 ms", width: "18%" },
                  ].map((span, index) => (
                    <div key={span.name} className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr_70px] sm:items-center">
                      <span className="text-xs text-slate-600">{span.name}</span>
                      <div className="h-7 rounded-md bg-slate-100">
                        <div className="flex h-full items-center rounded-md bg-indigo-500 px-2 text-[10px] text-white" style={{ width: span.width }}>
                          {index + 1}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{span.duration}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {activeSection === "Logs" && (
              <Panel title="Log explorer" subtitle="Filter by level and search the service message, name, or event type">
                <div className="flex flex-wrap gap-2">
                  {["All", "INFO", "WARN", "ERROR"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setLogLevel(level)}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        logLevel === level
                          ? "border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  {filteredLogs.length} matching events
                </p>
              </Panel>
            )}

            {activeSection === "Evaluation" && (
              <Panel title="Evaluation quality signals" subtitle="Illustrative evaluation results">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Answer relevance", score: 96 },
                    { label: "Task completion", score: 94 },
                    { label: "Grounded responses", score: 91 },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-100 p-4">
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-3 text-3xl font-semibold">{item.score}%</p>
                      <div className="mt-4 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row">
              <span>ModelNow Observability · Frontend preview</span>
              <span>Charts currently use sample data, not live production telemetry.</span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
