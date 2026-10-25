"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  Gauge,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const evaluationSets = [
  {
    id: "eval-1",
    name: "General Agent Quality",
    description: "Measures overall response quality and task completion.",
    cases: 248,
    score: 94,
    status: "Completed",
    lastRun: "Today, 11:20 AM",
  },
  {
    id: "eval-2",
    name: "RAG Grounding",
    description: "Checks whether responses are grounded in retrieved knowledge.",
    cases: 180,
    score: 91,
    status: "Completed",
    lastRun: "Today, 10:45 AM",
  },
  {
    id: "eval-3",
    name: "Tool Usage Benchmark",
    description: "Evaluates tool selection, execution, and recovery.",
    cases: 126,
    score: 88,
    status: "Running",
    lastRun: "Running now",
  },
  {
    id: "eval-4",
    name: "Safety Evaluation",
    description: "Tests guardrails, policy handling, and harmful requests.",
    cases: 210,
    score: 97,
    status: "Completed",
    lastRun: "Yesterday",
  },
];

const dimensions = [
  {
    name: "Task Success",
    score: 95,
    target: 90,
    icon: Target,
  },
  {
    name: "Correctness",
    score: 93,
    target: 90,
    icon: CheckCircle2,
  },
  {
    name: "Relevance",
    score: 94,
    target: 88,
    icon: Gauge,
  },
  {
    name: "Groundedness",
    score: 91,
    target: 90,
    icon: Database,
  },
  {
    name: "Safety",
    score: 97,
    target: 95,
    icon: ShieldCheck,
  },
  {
    name: "Tool Accuracy",
    score: 88,
    target: 90,
    icon: Zap,
  },
];

const recentRuns = [
  {
    id: "run-001",
    dataset: "General Agent Quality",
    model: "GPT-5",
    score: 94,
    passed: 232,
    failed: 16,
    latency: "1.28s",
    status: "Completed",
  },
  {
    id: "run-002",
    dataset: "RAG Grounding",
    model: "GPT-5",
    score: 91,
    passed: 164,
    failed: 16,
    latency: "1.54s",
    status: "Completed",
  },
  {
    id: "run-003",
    dataset: "Tool Usage Benchmark",
    model: "Claude Sonnet",
    score: 88,
    passed: 108,
    failed: 18,
    latency: "1.71s",
    status: "Running",
  },
  {
    id: "run-004",
    dataset: "Safety Evaluation",
    model: "GPT-5",
    score: 97,
    passed: 204,
    failed: 6,
    latency: "1.08s",
    status: "Completed",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Running: "border-blue-200 bg-blue-50 text-blue-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
    Draft: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

function ScoreBadge({ score }) {
  let className = "bg-red-50 text-red-700 border-red-200";

  if (score >= 95) {
    className = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (score >= 90) {
    className = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (score >= 80) {
    className = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <span
      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${className}`}
    >
      {score}%
    </span>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={16} className="text-slate-700" />
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function DimensionCard({ item }) {
  const Icon = item.icon;
  const percentage = Math.min(item.score, 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Icon size={15} className="text-slate-700" />
          </div>

          <span className="text-sm font-medium text-slate-900">
            {item.name}
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-900">
          {item.score}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Target: {item.target}%</span>

        <span>
          {item.score >= item.target ? "Above target" : "Below target"}
        </span>
      </div>
    </div>
  );
}

export default function AgentEvaluator() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [datasetFilter, setDatasetFilter] = useState("All");
  const [modelFilter, setModelFilter] = useState("All");
  const [running, setRunning] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState("eval-1");
  const [selectedModel, setSelectedModel] = useState("GPT-5");
  const [threshold, setThreshold] = useState(90);

  const filteredSets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return evaluationSets.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesDataset =
        datasetFilter === "All" || item.status === datasetFilter;

      return matchesSearch && matchesDataset;
    });
  }, [search, datasetFilter]);

  const filteredRuns = useMemo(() => {
    return recentRuns.filter((run) => {
      const matchesModel =
        modelFilter === "All" || run.model === modelFilter;

      const matchesSearch =
        !search ||
        run.dataset.toLowerCase().includes(search.toLowerCase()) ||
        run.model.toLowerCase().includes(search.toLowerCase());

      return matchesModel && matchesSearch;
    });
  }, [modelFilter, search]);

  const runEvaluation = () => {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                ←
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <TestTube2 size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Agent Evaluator
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Measure agent quality, correctness, safety, groundedness,
                  and runtime performance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/agent-builder/testing/playground"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Playground
                <ArrowRight size={15} />
              </a>

              <button
                type="button"
                onClick={runEvaluation}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {running ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}

                {running ? "Running..." : "Run Evaluation"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Overall score"
            value="93.6%"
            detail="+4.2% vs previous run"
            icon={Gauge}
          />

          <MetricCard
            label="Task success"
            value="95%"
            detail="1,248 test cases"
            icon={Target}
          />

          <MetricCard
            label="Safety"
            value="97%"
            detail="Above 95% target"
            icon={ShieldCheck}
          />

          <MetricCard
            label="Avg latency"
            value="1.42s"
            detail="-12% optimized"
            icon={Clock3}
          />

          <MetricCard
            label="Evaluations"
            value="4,862"
            detail="Across all datasets"
            icon={BarChart3}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "datasets", "runs", "dimensions"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Quality Dimensions"
                description="Current quality across the core evaluation dimensions."
                action={
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                    <Activity size={14} />
                    Live evaluation metrics
                  </div>
                }
              />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {dimensions.map((item) => (
                  <DimensionCard key={item.name} item={item} />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Evaluation Performance"
                  description="Recent evaluation score movement."
                />

                <div className="mt-6 flex h-56 items-end gap-4 border-b border-l border-slate-200 px-4 pb-0">
                  {[82, 86, 84, 89, 88, 92, 91, 94].map(
                    (score, index) => (
                      <div
                        key={index}
                        className="flex flex-1 flex-col items-center justify-end gap-2"
                      >
                        <span className="text-[10px] text-slate-400">
                          {score}
                        </span>

                        <div
                          className="w-full max-w-[42px] rounded-t-lg bg-slate-900"
                          style={{
                            height: `${score * 1.7}px`,
                          }}
                        />

                        <span className="text-[10px] text-slate-400">
                          R{index + 1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Evaluation Health"
                  description="System status for the evaluation pipeline."
                />

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-medium">
                        Evaluation Engine
                      </span>
                    </div>

                    <StatusBadge status="Completed" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <Database
                        size={17}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-medium">
                        Dataset Store
                      </span>
                    </div>

                    <StatusBadge status="Completed" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck
                        size={17}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-medium">
                        Safety Evaluator
                      </span>
                    </div>

                    <StatusBadge status="Completed" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={17}
                        className="text-amber-500"
                      />

                      <span className="text-sm font-medium">
                        Tool Accuracy
                      </span>
                    </div>

                    <StatusBadge status="Running" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "datasets" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Evaluation Datasets"
              description="Select datasets used to benchmark the agent."
              action={
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  Create Dataset
                </button>
              }
            />

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredSets.map((dataset) => (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => setSelectedDataset(dataset.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedDataset === dataset.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {dataset.name}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {dataset.description}
                      </div>
                    </div>

                    <ScoreBadge score={dataset.score} />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Cases
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {dataset.cases}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Status
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={dataset.status} />
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Last Run
                      </div>
                      <div className="mt-1 truncate text-xs font-medium">
                        {dataset.lastRun}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === "runs" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Evaluation Runs"
              description="Review previous benchmark runs and model performance."
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search runs..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <select
                value={modelFilter}
                onChange={(event) =>
                  setModelFilter(event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              >
                <option value="All">All models</option>
                <option value="GPT-5">GPT-5</option>
                <option value="Claude Sonnet">Claude Sonnet</option>
              </select>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-3 py-3 font-medium">Dataset</th>
                    <th className="px-3 py-3 font-medium">Model</th>
                    <th className="px-3 py-3 font-medium">Score</th>
                    <th className="px-3 py-3 font-medium">Passed</th>
                    <th className="px-3 py-3 font-medium">Failed</th>
                    <th className="px-3 py-3 font-medium">Latency</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRuns.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4 text-sm font-medium">
                        {run.dataset}
                      </td>

                      <td className="px-3 py-4 text-xs text-slate-500">
                        {run.model}
                      </td>

                      <td className="px-3 py-4">
                        <ScoreBadge score={run.score} />
                      </td>

                      <td className="px-3 py-4 text-sm text-emerald-600">
                        {run.passed}
                      </td>

                      <td className="px-3 py-4 text-sm text-red-600">
                        {run.failed}
                      </td>

                      <td className="px-3 py-4 text-sm">
                        {run.latency}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge status={run.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "dimensions" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Quality Dimensions"
              description="Configure pass thresholds for individual evaluation dimensions."
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dimensions.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <item.icon size={16} className="text-slate-700" />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        {item.name}
                      </div>

                      <div className="text-xs text-slate-500">
                        Current score {item.score}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Pass threshold
                      </span>

                      <span className="font-semibold">
                        {threshold}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="1"
                      value={threshold}
                      onChange={(event) =>
                        setThreshold(Number(event.target.value))
                      }
                      className="mt-3 w-full accent-slate-900"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-500">
                      Evaluation result
                    </span>

                    {item.score >= threshold ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 size={13} />
                        Passing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <XCircle size={13} />
                        Failing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Create Evaluation Dataset
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Create a new benchmark dataset for your agent.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Dataset name
                </label>

                <input
                  placeholder="Example: Customer Support Benchmark"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  rows={3}
                  placeholder="Describe what this dataset evaluates..."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[11px] text-slate-400">
                    Dataset type
                  </div>

                  <div className="mt-1 text-sm font-medium">
                    Evaluation
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[11px] text-slate-400">
                    Initial status
                  </div>

                  <div className="mt-1 text-sm font-medium">
                    Draft
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}