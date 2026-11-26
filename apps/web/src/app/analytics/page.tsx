
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Download,
  RefreshCw,
  Search,
  Target,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Period = "Daily" | "Weekly" | "Monthly";

const dailyData = [
  { label: "Mon", requests: 18400, tokens: 420000, successful: 97.8, p50: 120, p95: 280, p99: 420 },
  { label: "Tue", requests: 22100, tokens: 510000, successful: 98.2, p50: 115, p95: 250, p99: 390 },
  { label: "Wed", requests: 19800, tokens: 470000, successful: 97.5, p50: 145, p95: 320, p99: 510 },
  { label: "Thu", requests: 26700, tokens: 640000, successful: 98.5, p50: 135, p95: 300, p99: 460 },
  { label: "Fri", requests: 24800, tokens: 590000, successful: 98.1, p50: 110, p95: 250, p99: 380 },
  { label: "Sat", requests: 30200, tokens: 710000, successful: 99.0, p50: 100, p95: 220, p99: 340 },
  { label: "Sun", requests: 32600, tokens: 780000, successful: 98.7, p50: 105, p95: 230, p99: 350 },
];

const weeklyData = [
  { label: "Week 1", requests: 105000, tokens: 2450000, successful: 97.6, p50: 135, p95: 315, p99: 480 },
  { label: "Week 2", requests: 118000, tokens: 2780000, successful: 98.0, p50: 125, p95: 290, p99: 440 },
  { label: "Week 3", requests: 132000, tokens: 3100000, successful: 98.4, p50: 115, p95: 260, p99: 400 },
  { label: "Week 4", requests: 149000, tokens: 3520000, successful: 98.7, p50: 105, p95: 235, p99: 360 },
];

const monthlyData = [
  { label: "Jan", requests: 320000, tokens: 7600000, successful: 97.1, p50: 145, p95: 330, p99: 510 },
  { label: "Feb", requests: 365000, tokens: 8400000, successful: 97.6, p50: 135, p95: 305, p99: 470 },
  { label: "Mar", requests: 398000, tokens: 9300000, successful: 98.0, p50: 125, p95: 280, p99: 430 },
  { label: "Apr", requests: 425000, tokens: 10100000, successful: 98.3, p50: 115, p95: 260, p99: 395 },
  { label: "May", requests: 468000, tokens: 11200000, successful: 98.5, p50: 110, p95: 245, p99: 375 },
  { label: "Jun", requests: 512000, tokens: 12400000, successful: 98.7, p50: 105, p95: 230, p99: 350 },
];

const modelData = [
  { name: "GPT-5", requests: 32, latency: 210, quality: 94, tokens: 1250000 },
  { name: "Claude", requests: 27, latency: 245, quality: 96, tokens: 1080000 },
  { name: "Gemini", requests: 22, latency: 190, quality: 91, tokens: 940000 },
  { name: "Llama", requests: 19, latency: 165, quality: 87, tokens: 760000 },
];

const featureData = [
  { name: "Chat", requests: 32, tokens: 25 },
  { name: "Agents", requests: 21, tokens: 23 },
  { name: "Knowledge Hub", requests: 18, tokens: 19 },
  { name: "Browser", requests: 12, tokens: 13 },
  { name: "Computer Use", requests: 9, tokens: 11 },
  { name: "Fine-tuning", requests: 8, tokens: 9 },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function MetricCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: typeof Activity;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {positive ? (
          <ArrowUpRight size={14} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={14} className="text-rose-600" />
        )}
        <span className={positive ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>
          {change}
        </span>
        <span className="text-slate-400">vs previous period</span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{description}</p>
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
          {subtitle && <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProgressMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <span className="text-sm font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("Daily");
  const [modelSearch, setModelSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const data = period === "Daily"
    ? dailyData
    : period === "Weekly"
      ? weeklyData
      : monthlyData;

  const filteredModels = useMemo(
    () =>
      modelData.filter((model) =>
        model.name.toLowerCase().includes(modelSearch.toLowerCase()),
      ),
    [modelSearch, refreshKey],
  );

  const totalRequests = data.reduce((sum, item) => sum + item.requests, 0);
  const totalTokens = data.reduce((sum, item) => sum + item.tokens, 0);
  const averageSuccess =
    data.reduce((sum, item) => sum + item.successful, 0) / data.length;
  const averageP95 =
    data.reduce((sum, item) => sum + item.p95, 0) / data.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div>
          <p className="text-xs text-slate-400">ModelNow / Intelligence</p>
          <div className="mt-1 flex items-center gap-2">
            <BarChart3 size={19} className="text-indigo-600" />
            <h1 className="text-sm font-semibold">Analytics & Performance</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Clock3 size={15} className="text-slate-500" />
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="bg-transparent text-xs font-medium outline-none"
              aria-label="Analytics period"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <button
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50"
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Analytics workspace
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Understand your AI platform
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Analyze request trends, model efficiency, latency percentiles, token consumption,
              resource utilization, and successful task completion.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Illustrative sample data · {period.toLowerCase()} view
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            title="Total requests"
            value={formatNumber(totalRequests)}
            change="+12.8%"
            icon={Activity}
            description={`Requests in selected ${period.toLowerCase()} dataset`}
          />
          <MetricCard
            title="Tokens processed"
            value={formatNumber(totalTokens)}
            change="+16.3%"
            icon={Zap}
            description="Combined illustrative token volume"
          />
          <MetricCard
            title="Average P95 latency"
            value={`${Math.round(averageP95)} ms`}
            change="-8.4%"
            icon={Clock3}
            description="Lower latency is generally better"
          />
          <MetricCard
            title="Task success rate"
            value={`${averageSuccess.toFixed(1)}%`}
            change="+1.2%"
            icon={CheckCircle2}
            description="Successful requests in the sample dataset"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-3">
          <div className="2xl:col-span-2">
            <Panel
              title="Requests and token consumption"
              subtitle={`Platform workload trends · ${period.toLowerCase()} aggregation`}
              action={
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                  {period}
                </span>
              }
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="requestsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tokensFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={formatNumber} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" strokeWidth={2.5} fill="url(#requestsFill)" />
                    <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#38bdf8" strokeWidth={2} fill="url(#tokensFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <Panel
            title="Platform feature performance"
            subtitle="Illustrative usage share across ModelNow's six features"
          >
            <div className="space-y-5">
              {featureData.map((feature) => (
                <div key={feature.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-600">{feature.name}</span>
                    <span className="text-xs font-semibold text-slate-900">{feature.requests}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${feature.requests}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-700">
              Compare feature activity to understand adoption and where to optimize model
              routing and infrastructure capacity.
            </p>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Panel
            title="Latency percentiles"
            subtitle="P50, P95, and P99 response times in milliseconds"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="p50" name="P50" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="p95" name="P95" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="p99" name="P99" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Successful task completion"
            subtitle="Completion rate by selected reporting period"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="successFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e9edf5" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis domain={[90, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip formatter={(value) => [`${value}%`, "Success rate"]} />
                  <Area type="monotone" dataKey="successful" name="Success rate" stroke="#10b981" strokeWidth={2.5} fill="url(#successFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel
          title="Model comparison"
          subtitle="Compare request share, latency, quality, and token consumption"
          action={
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Search size={14} className="text-slate-400" />
              <input
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
                placeholder="Search models"
                className="w-28 text-xs outline-none sm:w-36"
              />
            </label>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-3 py-3 font-medium">Model</th>
                  <th className="px-3 py-3 font-medium">Request share</th>
                  <th className="px-3 py-3 font-medium">Avg. latency</th>
                  <th className="px-3 py-3 font-medium">Quality score</th>
                  <th className="px-3 py-3 font-medium">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-4 font-medium text-slate-800">{model.name}</td>
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
                    <td className="px-3 py-4 text-slate-600">{formatNumber(model.tokens)}</td>
                  </tr>
                ))}
                {filteredModels.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                      No models match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Panel title="Resource utilization" subtitle="Illustrative infrastructure efficiency">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ProgressMetric label="CPU" value={62} detail="Compute utilization" />
              <ProgressMetric label="Memory" value={74} detail="Memory utilization" />
              <ProgressMetric label="GPU" value={48} detail="Accelerator utilization" />
            </div>
          </Panel>

          <Panel title="Analytics insights" subtitle="Example areas to investigate">
            <div className="space-y-3">
              <div className="flex gap-3 rounded-lg bg-emerald-50 p-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">Task completion remains high</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    Review successful-task trends alongside latency before changing routing policies.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-sky-50 p-3">
                <Database size={18} className="mt-0.5 shrink-0 text-sky-600" />
                <div>
                  <p className="text-sm font-medium text-sky-900">Monitor token growth</p>
                  <p className="mt-1 text-xs leading-5 text-sky-800">
                    Compare token consumption per feature and model to identify optimization opportunities.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-amber-50 p-3">
                <Target size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Track tail latency</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    P95 and P99 trends help reveal slow requests hidden by average latency.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row">
          <span>ModelNow Analytics · Frontend preview</span>
          <span>Sample data only · Backend integration required for live analytics</span>
        </footer>
      </div>
    </main>
  );
}
