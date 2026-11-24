
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Download,
  Gauge,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  XCircle,
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

type Period = "7 days" | "30 days" | "90 days";

const qualityTrend = [
  { date: "Oct 18", accuracy: 88, reliability: 91, safety: 94 },
  { date: "Oct 19", accuracy: 90, reliability: 92, safety: 95 },
  { date: "Oct 20", accuracy: 89, reliability: 91, safety: 96 },
  { date: "Oct 21", accuracy: 92, reliability: 94, safety: 95 },
  { date: "Oct 22", accuracy: 91, reliability: 93, safety: 97 },
  { date: "Oct 23", accuracy: 94, reliability: 95, safety: 97 },
  { date: "Oct 24", accuracy: 95, reliability: 96, safety: 98 },
];

const benchmarks = [
  { name: "GPT-5", accuracy: 95, reliability: 96, safety: 98, latency: 420 },
  { name: "Claude", accuracy: 93, reliability: 95, safety: 97, latency: 510 },
  { name: "Gemini", accuracy: 91, reliability: 94, safety: 96, latency: 380 },
  { name: "Llama", accuracy: 87, reliability: 90, safety: 93, latency: 310 },
];

const initialRuns = [
  {
    id: "EVAL-1042",
    model: "GPT-5",
    suite: "General reasoning",
    tests: 1200,
    passed: 1140,
    score: 95,
    status: "Passed",
    time: "2 min ago",
  },
  {
    id: "EVAL-1041",
    model: "Claude",
    suite: "RAG faithfulness",
    tests: 850,
    passed: 799,
    score: 94,
    status: "Passed",
    time: "12 min ago",
  },
  {
    id: "EVAL-1040",
    model: "Gemini",
    suite: "Instruction following",
    tests: 950,
    passed: 817,
    score: 86,
    status: "Review",
    time: "28 min ago",
  },
  {
    id: "EVAL-1039",
    model: "Llama",
    suite: "Safety guardrails",
    tests: 700,
    passed: 665,
    score: 95,
    status: "Passed",
    time: "46 min ago",
  },
  {
    id: "EVAL-1038",
    model: "GPT-5",
    suite: "Hallucination checks",
    tests: 1000,
    passed: 910,
    score: 91,
    status: "Review",
    time: "1 hr ago",
  },
  {
    id: "EVAL-1037",
    model: "Claude",
    suite: "Toxicity detection",
    tests: 600,
    passed: 594,
    score: 99,
    status: "Passed",
    time: "2 hrs ago",
  },
];

const scoreDistribution = [
  { name: "Passed", value: 84, color: "#34d399" },
  { name: "Needs review", value: 12, color: "#fbbf24" },
  { name: "Failed", value: 4, color: "#fb7185" },
];

const panel =
  "rounded-2xl border border-white/[0.08] bg-[#11151e] p-5";

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
    <div className={panel}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
          <Icon size={18} className="text-indigo-300" />
        </div>
      </div>

      <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
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
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {change}
        </span>
        <span className="text-slate-500">{detail}</span>
      </div>
    </div>
  );
}

export default function EvaluationPage() {
  const [period, setPeriod] = useState<Period>("7 days");
  const [modelFilter, setModelFilter] = useState("All models");
  const [statusFilter, setStatusFilter] = useState("All results");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState("");

  const trendData = useMemo(() => {
    if (period === "7 days") return qualityTrend;

    if (period === "30 days") {
      return [
        { date: "Week 1", accuracy: 87, reliability: 90, safety: 93 },
        { date: "Week 2", accuracy: 89, reliability: 92, safety: 94 },
        { date: "Week 3", accuracy: 92, reliability: 94, safety: 96 },
        { date: "Week 4", accuracy: 95, reliability: 96, safety: 98 },
      ];
    }

    return [
      { date: "Aug", accuracy: 84, reliability: 88, safety: 91 },
      { date: "Sep", accuracy: 89, reliability: 92, safety: 95 },
      { date: "Oct", accuracy: 95, reliability: 96, safety: 98 },
    ];
  }, [period]);

  const filteredRuns = useMemo(() => {
    return initialRuns.filter((run) => {
      const matchesQuery = [
        run.id,
        run.model,
        run.suite,
      ].some((value) => value.toLowerCase().includes(query.toLowerCase()));

      const matchesModel =
        modelFilter === "All models" || run.model === modelFilter;

      const matchesStatus =
        statusFilter === "All results" || run.status === statusFilter;

      return matchesQuery && matchesModel && matchesStatus;
    });
  }, [query, modelFilter, statusFilter]);

  function exportRuns() {
    const header = [
      "Evaluation ID",
      "Model",
      "Test suite",
      "Total tests",
      "Passed tests",
      "Score",
      "Status",
      "Time",
    ];

    const rows = filteredRuns.map((run) => [
      run.id,
      run.model,
      run.suite,
      run.tests,
      run.passed,
      `${run.score}%`,
      run.status,
      run.time,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-evaluation-runs.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function startEvaluation() {
    setRunning(true);
    setRunMessage(
      "Demo only: connect your evaluation API to execute real test suites.",
    );
    window.setTimeout(() => setRunning(false), 700);
  }

  return (
    <main className="min-h-screen bg-[#0b0e14] text-slate-100">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-indigo-300">
              <ClipboardCheck size={16} />
              ModelNow / AI Quality
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Evaluation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Evaluate model accuracy, reliability, safety, hallucinations,
              and task performance using consistent benchmark suites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportRuns}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm transition hover:bg-white/[0.08]"
            >
              <Download size={16} />
              Export results
            </button>

            <button
              onClick={startEvaluation}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              <Sparkles size={16} />
              {running ? "Starting..." : "Run evaluation"}
            </button>
          </div>
        </header>

        {runMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/[0.06] p-4 text-sm text-indigo-200">
            <CircleHelp size={17} className="mt-0.5 shrink-0" />
            <span>{runMessage}</span>
            <button
              onClick={() => setRunMessage("")}
              className="ml-auto text-indigo-300 hover:text-white"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-xl border border-white/[0.08] bg-[#11151e] p-1">
            {(["7 days", "30 days", "90 days"] as Period[]).map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  period === item
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <span className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Example evaluation data
          </span>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Overall quality score"
            value="94.2%"
            change="+3.8%"
            detail="vs. previous period"
            icon={Target}
          />
          <MetricCard
            title="Evaluation runs"
            value="1,284"
            change="+12.6%"
            detail="test runs completed"
            icon={Activity}
          />
          <MetricCard
            title="Test pass rate"
            value="96.4%"
            change="+2.1%"
            detail="across test suites"
            icon={CheckCircle2}
          />
          <MetricCard
            title="Hallucination rate"
            value="3.2%"
            change="-1.4%"
            detail="lower is better"
            icon={AlertTriangle}
            positive
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className={`${panel} xl:col-span-2`}>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">
                  Quality trends
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Accuracy, reliability, and safety scores over time
                </p>
              </div>
              <span className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400">
                Score (%)
              </span>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff0c" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    domain={[70, 100]}
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`]}
                    contentStyle={{
                      background: "#171c28",
                      border: "1px solid #ffffff18",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fill="url(#accuracyFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="reliability"
                    name="Reliability"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="safety"
                    name="Safety"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="transparent"
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={panel}>
            <h2 className="font-semibold text-white">Evaluation outcomes</h2>
            <p className="mt-1 text-xs text-slate-500">
              Distribution of recent test results
            </p>

            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {scoreDistribution.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`]}
                    contentStyle={{
                      background: "#171c28",
                      border: "1px solid #ffffff18",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {scoreDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span className="text-slate-400">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${panel}`}>
          <div className="mb-5">
            <h2 className="font-semibold text-white">Model benchmark comparison</h2>
            <p className="mt-1 text-xs text-slate-500">
              Compare quality, reliability, safety, and latency across models
            </p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks} barGap={6}>
                <CartesianGrid stroke="#ffffff0c" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "latency" ? `${value} ms` : `${value}%`,
                    name,
                  ]}
                  contentStyle={{
                    background: "#171c28",
                    border: "1px solid #ffffff18",
                    borderRadius: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="accuracy" name="Accuracy" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reliability" name="Reliability" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safety" name="Safety" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {benchmarks.map((model) => (
              <div
                key={model.name}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">{model.name}</span>
                  <span className="rounded-md bg-indigo-400/10 px-2 py-1 text-xs text-indigo-300">
                    {model.accuracy}% accuracy
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Reliability {model.reliability}%</span>
                  <span>{model.latency} ms</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={panel}>
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-white">Evaluation runs</h2>
              <p className="mt-1 text-xs text-slate-500">
                Test suite execution history and quality results
              </p>
            </div>
            <button
              onClick={() => setShowAll((value) => !value)}
              className="self-start rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05]"
            >
              {showAll ? "Show fewer" : "View all runs"}
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
                placeholder="Search evaluation runs..."
                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/60"
              />
            </div>

            <div className="relative">
              <select
                value={modelFilter}
                onChange={(event) => setModelFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 pr-9 text-sm text-slate-300 outline-none focus:border-indigo-400/60"
              >
                <option>All models</option>
                {benchmarks.map((model) => (
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
                <option>All results</option>
                <option>Passed</option>
                <option>Review</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Run ID</th>
                  <th className="pb-3 pr-4 font-medium">Model</th>
                  <th className="pb-3 pr-4 font-medium">Test suite</th>
                  <th className="pb-3 pr-4 font-medium">Tests</th>
                  <th className="pb-3 pr-4 font-medium">Score</th>
                  <th className="pb-3 pr-4 font-medium">Result</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? filteredRuns : filteredRuns.slice(0, 5)).map(
                  (run) => (
                    <tr
                      key={run.id}
                      className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-4 pr-4 font-mono text-xs text-indigo-300">
                        {run.id}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{run.model}</td>
                      <td className="py-4 pr-4 text-slate-300">{run.suite}</td>
                      <td className="py-4 pr-4 text-slate-400">
                        {run.passed.toLocaleString()} / {run.tests.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`font-semibold ${
                            run.score >= 90
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }`}
                        >
                          {run.score}%
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                            run.status === "Passed"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {run.status === "Passed" ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}
                          {run.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">{run.time}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {filteredRuns.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                No evaluation runs match your filters.
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${panel} flex items-center gap-4`}>
            <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Safety checks passed</p>
              <p className="mt-1 text-xl font-semibold">98.1%</p>
              <p className="mt-1 text-xs text-slate-500">Example benchmark result</p>
            </div>
          </div>

          <div className={`${panel} flex items-center gap-4`}>
            <div className="rounded-xl bg-indigo-400/10 p-3 text-indigo-300">
              <Gauge size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Average evaluation score</p>
              <p className="mt-1 text-xl font-semibold">94.2%</p>
              <p className="mt-1 text-xs text-slate-500">Across sample test suites</p>
            </div>
          </div>

          <div className={`${panel} flex items-center gap-4`}>
            <div className="rounded-xl bg-sky-400/10 p-3 text-sky-300">
              <Timer size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Average run duration</p>
              <p className="mt-1 text-xl font-semibold">38.4 sec</p>
              <p className="mt-1 text-xs text-slate-500">Example run duration</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-4 text-xs leading-5 text-slate-600">
          ModelNow Evaluation · Demonstration metrics only. The Run Evaluation
          button is a UI placeholder until connected to a real evaluation
          service. Benchmark scores are not live model measurements.
        </footer>
      </div>
    </main>
  );
}
