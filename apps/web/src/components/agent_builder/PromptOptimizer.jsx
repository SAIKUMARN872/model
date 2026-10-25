"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  FileText,
  Gauge,
  Layers,
  Lightbulb,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
  XCircle,
  Zap,
} from "lucide-react";

const initialExperiments = [
  {
    id: "EXP-001",
    name: "Customer Support Prompt",
    model: "GPT-5",
    baseline: 82,
    optimized: 94,
    improvement: 14.6,
    status: "Completed",
    runs: 120,
    created: "12 min ago",
  },
  {
    id: "EXP-002",
    name: "RAG Grounding Prompt",
    model: "Claude Sonnet",
    baseline: 79,
    optimized: 91,
    improvement: 15.2,
    status: "Completed",
    runs: 85,
    created: "34 min ago",
  },
  {
    id: "EXP-003",
    name: "Research Agent Prompt",
    model: "GPT-5",
    baseline: 86,
    optimized: 96,
    improvement: 11.6,
    status: "Running",
    runs: 64,
    created: "51 min ago",
  },
  {
    id: "EXP-004",
    name: "Document Extraction",
    model: "Gemini Pro",
    baseline: 74,
    optimized: 88,
    improvement: 18.9,
    status: "Completed",
    runs: 90,
    created: "1 hr ago",
  },
];

const suggestions = [
  {
    id: "clarity",
    title: "Improve instruction clarity",
    description:
      "Make the desired behavior and expected output explicit.",
    impact: "+8.4% quality",
    icon: Target,
  },
  {
    id: "structure",
    title: "Add structured output",
    description:
      "Define a consistent response schema for the model.",
    impact: "+6.2% consistency",
    icon: Layers,
  },
  {
    id: "context",
    title: "Optimize context placement",
    description:
      "Move important information closer to the task instruction.",
    impact: "+5.8% groundedness",
    icon: FileText,
  },
  {
    id: "examples",
    title: "Add few-shot examples",
    description:
      "Provide representative examples for complex behaviors.",
    impact: "+7.1% accuracy",
    icon: Lightbulb,
  },
];

const initialVersions = [
  {
    id: "v1",
    name: "Baseline",
    score: 82,
    tokens: 412,
    latency: "1.62s",
    status: "Baseline",
  },
  {
    id: "v2",
    name: "Optimized",
    score: 91,
    tokens: 438,
    latency: "1.58s",
    status: "Recommended",
  },
  {
    id: "v3",
    name: "Compact",
    score: 89,
    tokens: 312,
    latency: "1.21s",
    status: "Candidate",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Running: "border-blue-200 bg-blue-50 text-blue-700",
    Recommended:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Baseline: "border-slate-200 bg-slate-50 text-slate-600",
    Candidate:
      "border-amber-200 bg-amber-50 text-amber-700",
    Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Error: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
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

      <div className="mt-1 text-xs text-slate-500">
        {detail}
      </div>
    </div>
  );
}

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function ScoreBar({ value, compact = false }) {
  return (
    <div
      className={`overflow-hidden rounded-full bg-slate-100 ${
        compact ? "h-1.5" : "h-2"
      }`}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
        }}
      />
    </div>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-slate-400"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

export default function PromptOptimizer() {
  const [activeTab, setActiveTab] = useState("optimizer");
  const [model, setModel] = useState("GPT-5");
  const [temperature, setTemperature] = useState(0.2);
  const [prompt, setPrompt] = useState(
    `You are a helpful enterprise AI assistant.

Answer the user's question accurately and clearly.
Use the provided context when available.
Do not invent information.
Keep the response concise and professional.`,
  );

  const [optimizedPrompt, setOptimizedPrompt] =
    useState(
      `You are an enterprise AI assistant focused on accuracy, clarity, and grounded responses.

Instructions:
1. Understand the user's request before responding.
2. Use only information supported by the provided context.
3. Never invent facts, sources, or tool results.
4. When information is missing, clearly state what is unavailable.
5. Return a concise, structured response.
6. Follow the requested output format exactly.
7. Prioritize correctness over unnecessary verbosity.`,
    );

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(
    null,
  );

  const [experiments, setExperiments] =
    useState(initialExperiments);

  const [versions, setVersions] =
    useState(initialVersions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const filteredExperiments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experiments.filter((experiment) => {
      const matchesSearch =
        query === "" ||
        experiment.name.toLowerCase().includes(query) ||
        experiment.model.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        experiment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [experiments, search, statusFilter]);

  const optimizePrompt = () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    setActiveTab("optimizer");

    window.setTimeout(() => {
      setOptimizedPrompt(
        `You are an enterprise AI assistant optimized for accuracy, relevance, safety, and consistency.

ROLE
Provide precise, useful answers based only on reliable available information.

INSTRUCTIONS
1. Identify the user's primary objective.
2. Use provided context as the primary source of truth.
3. Never fabricate facts, citations, tool results, or unavailable information.
4. Separate known information from assumptions.
5. Keep responses concise unless additional detail improves the answer.
6. Use structured formatting when it improves readability.
7. Follow explicit output requirements exactly.
8. Before finalizing, verify that every important instruction has been satisfied.

QUALITY CHECK
- Correct
- Relevant
- Grounded
- Consistent
- Safe`,
      );

      setIsOptimizing(false);
    }, 1300);
  };

  const runTest = () => {
    if (isTesting) return;

    setIsTesting(true);
    setTestResult(null);

    window.setTimeout(() => {
      const baseline = 82;
      const optimized = 94;

      setTestResult({
        baseline,
        optimized,
        improvement: (
          ((optimized - baseline) / baseline) *
          100
        ).toFixed(1),
        latency: "1.46s",
        tokens: 428,
      });

      setIsTesting(false);
    }, 1500);
  };

  const saveVersion = () => {
    const nextVersion = {
      id: `v${versions.length + 1}`,
      name: `Version ${versions.length + 1}`,
      score: testResult?.optimized || 90,
      tokens: testResult?.tokens || 420,
      latency: testResult?.latency || "1.50s",
      status: "Candidate",
    };

    setVersions((current) => [
      ...current,
      nextVersion,
    ]);
  };

  const applyOptimization = () => {
    setPrompt(optimizedPrompt);
  };

  const createExperiment = () => {
    const experiment = {
      id: `EXP-${String(
        experiments.length + 1,
      ).padStart(3, "0")}`,
      name: "New Prompt Experiment",
      model,
      baseline: 82,
      optimized: 92,
      improvement: 12.2,
      status: "Running",
      runs: 0,
      created: "Just now",
    };

    setExperiments((current) => [
      experiment,
      ...current,
    ]);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Wand2
                  size={19}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Prompt Optimizer
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Automatically improve prompts for quality, cost, latency,
                  and consistency.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runTest}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isTesting ? (
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={15} />
                )}
                {isTesting ? "Testing..." : "Run Test"}
              </button>

              <button
                type="button"
                onClick={optimizePrompt}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {isOptimizing ? (
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Wand2 size={15} />
                )}
                {isOptimizing
                  ? "Optimizing..."
                  : "Optimize Prompt"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Quality Improvement"
            value="+14.6%"
            detail="Average optimized score"
            icon={TrendingUp}
          />

          <MetricCard
            label="Optimized Prompts"
            value="1,284"
            detail="This month"
            icon={Wand2}
          />

          <MetricCard
            label="Token Reduction"
            value="18.2%"
            detail="Average per request"
            icon={Layers}
          />

          <MetricCard
            label="Latency Gain"
            value="12.7%"
            detail="Average improvement"
            icon={Clock3}
          />

          <MetricCard
            label="Experiments"
            value={experiments.length}
            detail="Active and completed"
            icon={BarChart3}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {[
            ["optimizer", "Optimizer"],
            ["experiments", "Experiments"],
            ["versions", "Versions"],
            ["analytics", "Analytics"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "optimizer" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Original Prompt"
                  description="Write or paste the prompt you want to optimize."
                  action={
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          prompt,
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  }
                />

                <div className="mt-5">
                  <textarea
                    value={prompt}
                    onChange={(event) =>
                      setPrompt(event.target.value)
                    }
                    rows={15}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-xs leading-6 outline-none focus:border-slate-400"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Model
                    </span>

                    <SelectField
                      value={model}
                      onChange={(event) =>
                        setModel(event.target.value)
                      }
                    >
                      <option>GPT-5</option>
                      <option>Claude Sonnet</option>
                      <option>Gemini Pro</option>
                      <option>DeepSeek V3</option>
                    </SelectField>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Temperature
                    </span>

                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(event) =>
                        setTemperature(
                          Number(event.target.value),
                        )
                      }
                      className="w-20 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Optimized Prompt"
                  description="AI-generated version focused on higher quality and consistency."
                  action={
                    <button
                      type="button"
                      onClick={applyOptimization}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                    >
                      Apply
                    </button>
                  }
                />

                <textarea
                  value={optimizedPrompt}
                  onChange={(event) =>
                    setOptimizedPrompt(event.target.value)
                  }
                  rows={15}
                  className="mt-5 w-full resize-none rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-4 font-mono text-xs leading-6 outline-none focus:border-emerald-400"
                />

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-500">
                      Quality
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      94
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-500">
                      Tokens
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      428
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-500">
                      Latency
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      1.46s
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {testResult && (
              <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Optimization Test Result"
                  description="Comparison between the original and optimized prompt."
                  action={
                    <StatusBadge status="Completed" />
                  }
                />

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <MetricCard
                    label="Baseline"
                    value={testResult.baseline}
                    detail="Original quality"
                    icon={Gauge}
                  />

                  <MetricCard
                    label="Optimized"
                    value={testResult.optimized}
                    detail="Optimized quality"
                    icon={TrendingUp}
                  />

                  <MetricCard
                    label="Improvement"
                    value={`+${testResult.improvement}%`}
                    detail="Relative gain"
                    icon={Zap}
                  />

                  <MetricCard
                    label="Tokens"
                    value={testResult.tokens}
                    detail="Optimized prompt"
                    icon={Layers}
                  />
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Optimized quality
                    </span>
                    <span className="font-semibold">
                      {testResult.optimized}%
                    </span>
                  </div>

                  <ScoreBar value={testResult.optimized} />
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Optimization Suggestions"
                description="Recommended prompt improvements based on model behavior."
              />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;

                  return (
                    <div
                      key={suggestion.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <Icon size={17} />
                      </div>

                      <div className="mt-3 text-sm font-semibold">
                        {suggestion.title}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {suggestion.description}
                      </p>

                      <div className="mt-3 text-xs font-semibold text-emerald-600">
                        {suggestion.impact}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === "experiments" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Prompt Experiments"
              description="Compare prompt versions and measure optimization impact."
              action={
                <button
                  type="button"
                  onClick={createExperiment}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  New Experiment
                </button>
              }
            />

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search experiments..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <SelectField
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option>All</option>
                <option>Completed</option>
                <option>Running</option>
              </SelectField>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-3 py-3 font-medium">
                      Experiment
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Model
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Baseline
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Optimized
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Improvement
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Runs
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExperiments.map(
                    (experiment) => (
                      <tr
                        key={experiment.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-4">
                          <div className="text-sm font-medium">
                            {experiment.name}
                          </div>

                          <div className="mt-1 text-[11px] text-slate-400">
                            {experiment.created}
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {experiment.model}
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {experiment.baseline}
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-emerald-700">
                          {experiment.optimized}
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-emerald-600">
                          +{experiment.improvement}%
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {experiment.runs}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge
                            status={experiment.status}
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "versions" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Prompt Versions"
              description="Compare saved prompt versions before promoting them."
              action={
                <button
                  type="button"
                  onClick={saveVersion}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Save size={14} />
                  Save Version
                </button>
              }
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`rounded-xl border p-4 ${
                    version.status === "Recommended"
                      ? "border-emerald-300 bg-emerald-50/40"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {version.name}
                    </div>

                    <StatusBadge status={version.status} />
                  </div>

                  <div className="mt-5 text-3xl font-semibold">
                    {version.score}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Quality score
                  </div>

                  <div className="mt-5 space-y-3">
                    <div>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500">
                          Quality
                        </span>
                        <span className="font-semibold">
                          {version.score}
                        </span>
                      </div>

                      <ScoreBar value={version.score} />
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Tokens
                      </span>
                      <span className="font-medium">
                        {version.tokens}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Latency
                      </span>
                      <span className="font-medium">
                        {version.latency}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "analytics" && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Optimization Impact"
                description="Average impact after prompt optimization."
              />

              <div className="mt-5 space-y-5">
                {[
                  ["Quality", 94, "+14.6%"],
                  ["Relevance", 92, "+11.4%"],
                  ["Groundedness", 91, "+13.1%"],
                  ["Consistency", 89, "+9.7%"],
                  ["Safety", 97, "+4.8%"],
                ].map(([name, score, change]) => (
                  <div key={name}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-medium">{name}</span>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {score}
                        </span>

                        <span className="text-emerald-600">
                          {change}
                        </span>
                      </div>
                    </div>

                    <ScoreBar value={score} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Prompt Runtime"
                description="Runtime characteristics before and after optimization."
              />

              <div className="mt-5 grid grid-cols-2 gap-4">
                <MetricCard
                  label="Baseline Tokens"
                  value="524"
                  detail="Average prompt"
                  icon={Layers}
                />

                <MetricCard
                  label="Optimized Tokens"
                  value="428"
                  detail="-18.3%"
                  icon={TrendingUp}
                />

                <MetricCard
                  label="Baseline Latency"
                  value="1.72s"
                  detail="Average"
                  icon={Clock3}
                />

                <MetricCard
                  label="Optimized Latency"
                  value="1.46s"
                  detail="-15.1%"
                  icon={Zap}
                />
              </div>

              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600"
                  />

                  <span className="text-sm font-semibold text-emerald-900">
                    Optimization is improving efficiency
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-emerald-800">
                  The optimized prompts improve response quality while
                  reducing average token and latency usage.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}