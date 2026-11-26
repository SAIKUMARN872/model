
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Filter,
  Gauge,
  Layers3,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Period = "Daily" | "Weekly" | "Monthly";

const dailyData = [
  { label: "00:00", requests: 320, input: 42000, output: 18000 },
  { label: "04:00", requests: 260, input: 35000, output: 14000 },
  { label: "08:00", requests: 680, input: 82000, output: 38000 },
  { label: "12:00", requests: 940, input: 125000, output: 52000 },
  { label: "16:00", requests: 810, input: 108000, output: 46000 },
  { label: "20:00", requests: 620, input: 76000, output: 31000 },
  { label: "23:00", requests: 410, input: 54000, output: 22000 },
];

const weeklyData = [
  { label: "Mon", requests: 4200, input: 520000, output: 210000 },
  { label: "Tue", requests: 5100, input: 610000, output: 260000 },
  { label: "Wed", requests: 4800, input: 580000, output: 240000 },
  { label: "Thu", requests: 6300, input: 740000, output: 310000 },
  { label: "Fri", requests: 7200, input: 860000, output: 370000 },
  { label: "Sat", requests: 3900, input: 460000, output: 190000 },
  { label: "Sun", requests: 3400, input: 390000, output: 160000 },
];

const monthlyData = [
  { label: "Week 1", requests: 24000, input: 2800000, output: 1200000 },
  { label: "Week 2", requests: 28500, input: 3300000, output: 1450000 },
  { label: "Week 3", requests: 31200, input: 3700000, output: 1620000 },
  { label: "Week 4", requests: 35400, input: 4200000, output: 1840000 },
];

const models = [
  { name: "GPT-5", requests: 12480, tokens: "2.84M", cost: "$42.80", share: 36, color: "#818cf8" },
  { name: "Claude", requests: 9680, tokens: "2.16M", cost: "$31.40", share: 28, color: "#34d399" },
  { name: "Gemini", requests: 7420, tokens: "1.62M", cost: "$18.60", share: 21, color: "#38bdf8" },
  { name: "Llama", requests: 5160, tokens: "980K", cost: "$8.20", share: 15, color: "#fbbf24" },
];

const features = [
  { name: "Chat", requests: 14820, percentage: 32, color: "#818cf8" },
  { name: "Agents", requests: 9320, percentage: 20, color: "#34d399" },
  { name: "Knowledge Hub", requests: 7640, percentage: 17, color: "#38bdf8" },
  { name: "Browser", requests: 5980, percentage: 13, color: "#fbbf24" },
  { name: "Computer Use", requests: 4280, percentage: 10, color: "#f472b6" },
  { name: "Fine-tuning", requests: 3620, percentage: 8, color: "#a78bfa" },
];

const activities = [
  { id: "REQ-10482", feature: "Chat", model: "GPT-5", tokens: "2,840", cost: "$0.042", status: "Success", time: "Just now" },
  { id: "REQ-10481", feature: "Knowledge Hub", model: "Claude", tokens: "5,120", cost: "$0.068", status: "Success", time: "1 min ago" },
  { id: "REQ-10480", feature: "Agents", model: "Gemini", tokens: "3,460", cost: "$0.031", status: "Success", time: "2 min ago" },
  { id: "REQ-10479", feature: "Browser", model: "GPT-5", tokens: "1,920", cost: "$0.026", status: "Failed", time: "3 min ago" },
  { id: "REQ-10478", feature: "Computer Use", model: "Llama", tokens: "4,280", cost: "$0.019", status: "Success", time: "4 min ago" },
  { id: "REQ-10477", feature: "Chat", model: "Claude", tokens: "2,180", cost: "$0.038", status: "Success", time: "5 min ago" },
];

const panel =
  "rounded-2xl border border-white/[0.08] bg-[#11151e] p-5";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function MetricCard({
  title,
  value,
  change,
  detail,
  icon: Icon,
  positive = true,
}: {
  title: string;
  value: string;
  change: string;
  detail: string;
  icon: typeof Activity;
  positive?: boolean;
}) {
  return (
    <div className={`${panel} min-w-0`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-slate-400">{title}</div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
          <Icon size={18} className="text-indigo-300" />
        </div>
      </div>

      <div className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {value}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ${
            positive
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {change}
        </span>
        <span className="text-slate-500">{detail}</span>
      </div>
    </div>
  );
}

export default function UsagePage() {
  const [period, setPeriod] = useState<Period>("Weekly");
  const [query, setQuery] = useState("");
  const [modelFilter, setModelFilter] = useState("All models");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showAll, setShowAll] = useState(false);

  const chartData =
    period === "Daily"
      ? dailyData
      : period === "Monthly"
        ? monthlyData
        : weeklyData;

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = [
        activity.id,
        activity.feature,
        activity.model,
      ].some((item) => item.toLowerCase().includes(query.toLowerCase()));

      const matchesModel =
        modelFilter === "All models" || activity.model === modelFilter;

      const matchesStatus =
        statusFilter === "All statuses" || activity.status === statusFilter;

      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [query, modelFilter, statusFilter]);

  function exportUsage() {
    const header = [
      "Request ID",
      "Feature",
      "Model",
      "Tokens",
      "Cost",
      "Status",
      "Time",
    ];

    const rows = filteredActivities.map((activity) => [
      activity.id,
      activity.feature,
      activity.model,
      activity.tokens,
      activity.cost,
      activity.status,
      activity.time,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `modelnow-usage-${period.toLowerCase()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#0b0e14] text-slate-100">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-indigo-300">
              <Layers3 size={16} />
              ModelNow / Platform
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Usage
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor API requests, token consumption, model usage, feature
              activity, and estimated AI spending in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#11151e] px-3 py-2.5 text-sm text-slate-300">
              <CalendarDays size={16} className="text-slate-400" />
              <span>Last {period === "Daily" ? "24 hours" : period === "Weekly" ? "7 days" : "30 days"}</span>
            </div>

            <button
              onClick={exportUsage}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.08]"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl border border-white/[0.08] bg-[#11151e] p-1">
            {(["Daily", "Weekly", "Monthly"] as Period[]).map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  period === item
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Frontend demonstration data
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total requests"
            value={period === "Daily" ? "4,040" : period === "Weekly" ? "34,900" : "119,100"}
            change="+18.6%"
            detail="vs. previous period"
            icon={Activity}
          />
          <MetricCard
            title="Tokens consumed"
            value={period === "Daily" ? "1.08M" : period === "Weekly" ? "5.93M" : "18.2M"}
            change="+12.4%"
            detail="input + output"
            icon={Zap}
          />
          <MetricCard
            title="Estimated cost"
            value={period === "Daily" ? "$14.82" : period === "Weekly" ? "$101.00" : "$328.40"}
            change="-8.2%"
            detail="cost per request improved"
            icon={CircleDollarSign}
            positive
          />
          <MetricCard
            title="Successful requests"
            value="98.7%"
            change="+1.3%"
            detail="success rate"
            icon={CheckCircle2}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className={`${panel} xl:col-span-2`}>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Request volume</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Total AI requests over the selected period
                </p>
              </div>
              <span className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400">
                Requests
              </span>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff0c" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${value / 1000}k` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#171c28",
                      border: "1px solid #ffffff18",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fill="url(#requestGradient)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={panel}>
            <h2 className="font-semibold text-white">Token consumption</h2>
            <p className="mt-1 text-xs text-slate-500">
              Input tokens compared with generated output
            </p>

            <div className="mt-5 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid stroke="#ffffff0c" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#171c28",
                      border: "1px solid #ffffff18",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="input" name="Input tokens" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="output" name="Output tokens" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className={panel}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Usage by model</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Request distribution and estimated spend
                </p>
              </div>
              <BarChart3 size={19} className="text-indigo-300" />
            </div>

            <div className="space-y-5">
              {models.map((model) => (
                <div key={model.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="font-medium text-slate-200">
                        {model.name}
                      </span>
                    </div>
                    <span className="text-slate-400">{model.share}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${model.share}%`,
                        backgroundColor: model.color,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                    <span>{formatNumber(model.requests)} requests</span>
                    <span>{model.tokens} tokens</span>
                    <span>{model.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={panel}>
            <div className="mb-2">
              <h2 className="font-semibold text-white">Usage by feature</h2>
              <p className="mt-1 text-xs text-slate-500">
                Activity across the six ModelNow features
              </p>
            </div>

            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
              <div className="h-[260px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={features}
                      dataKey="requests"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {features.map((feature) => (
                        <Cell key={feature.name} fill={feature.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#171c28",
                        border: "1px solid #ffffff18",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: feature.color }}
                      />
                      <span className="truncate text-sm text-slate-300">
                        {feature.name}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {feature.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={panel}>
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-white">Recent usage activity</h2>
              <p className="mt-1 text-xs text-slate-500">
                Review individual requests, model selection, token counts, and costs
              </p>
            </div>

            <button
              onClick={() => setShowAll((current) => !current)}
              className="self-start rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05]"
            >
              {showAll ? "Show fewer" : "View all activity"}
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search requests, features..."
                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <select
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0e14] py-2.5 pl-9 pr-9 text-sm text-slate-300 outline-none focus:border-indigo-400/60"
              >
                <option>All models</option>
                {models.map((model) => (
                  <option key={model.name}>{model.name}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 pr-9 text-sm text-slate-300 outline-none focus:border-indigo-400/60"
              >
                <option>All statuses</option>
                <option>Success</option>
                <option>Failed</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Request ID</th>
                  <th className="pb-3 pr-4 font-medium">Feature</th>
                  <th className="pb-3 pr-4 font-medium">Model</th>
                  <th className="pb-3 pr-4 font-medium">Tokens</th>
                  <th className="pb-3 pr-4 font-medium">Est. cost</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>

              <tbody>
                {(showAll ? filteredActivities : filteredActivities.slice(0, 5)).map(
                  (activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-4 pr-4 font-mono text-xs text-indigo-300">
                        {activity.id}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">
                        {activity.feature}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">
                        {activity.model}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">
                        {activity.tokens}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">
                        {activity.cost}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                            activity.status === "Success"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-rose-400/10 text-rose-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              activity.status === "Success"
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {activity.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">
                        {activity.time}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {filteredActivities.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                No usage activity matches your filters.
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${panel} flex items-center gap-4`}>
            <div className="rounded-xl bg-indigo-400/10 p-3 text-indigo-300">
              <Gauge size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Average latency</p>
              <p className="mt-1 text-xl font-semibold">428 ms</p>
              <p className="mt-1 text-xs text-emerald-300">↓ 6.4% vs. previous period</p>
            </div>
          </div>

          <div className={`${panel} flex items-center gap-4`}>
            <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
              <Sparkles size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tokens per request</p>
              <p className="mt-1 text-xl font-semibold">1,702</p>
              <p className="mt-1 text-xs text-slate-500">Average across models</p>
            </div>
          </div>

          <div className={`${panel} flex items-center gap-4`}>
            <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
              <Clock3 size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Peak usage window</p>
              <p className="mt-1 text-xl font-semibold">12 PM – 4 PM</p>
              <p className="mt-1 text-xs text-slate-500">Based on example activity</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-4 text-xs leading-5 text-slate-600">
          ModelNow Usage · Example metrics for UI demonstration. Connect the
          usage API and billing data source before using these values for
          operational or financial decisions.
        </footer>
      </div>
    </main>
  );
}
