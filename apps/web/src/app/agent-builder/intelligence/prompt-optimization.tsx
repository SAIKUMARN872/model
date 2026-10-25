"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  FlaskConical,
  Gauge,
  Lightbulb,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Target,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react";

type PromptVersion = {
  id: number;
  name: string;
  prompt: string;
  score: number;
  tokens: number;
  latency: number;
  status: "Active" | "Draft" | "Archived";
};

type OptimizationRule = {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
};

const initialVersions: PromptVersion[] = [
  {
    id: 1,
    name: "Production Prompt",
    prompt:
      "You are an enterprise AI assistant. Understand the user's objective, reason carefully, use available tools when required, and provide a concise and accurate answer.",
    score: 91,
    tokens: 142,
    latency: 1.8,
    status: "Active",
  },
  {
    id: 2,
    name: "Detailed Reasoning",
    prompt:
      "You are an expert enterprise AI assistant. Analyze the user's objective, identify constraints, break the problem into logical steps, verify the result, and provide a reliable response.",
    score: 94,
    tokens: 186,
    latency: 2.2,
    status: "Draft",
  },
];

const initialRules: OptimizationRule[] = [
  {
    id: 1,
    title: "Remove redundant instructions",
    description:
      "Detect repeated or unnecessary instructions and reduce prompt size.",
    enabled: true,
  },
  {
    id: 2,
    title: "Improve instruction clarity",
    description:
      "Rewrite ambiguous instructions into clearer and more deterministic language.",
    enabled: true,
  },
  {
    id: 3,
    title: "Optimize context ordering",
    description:
      "Place important context and constraints in a more effective order.",
    enabled: true,
  },
  {
    id: 4,
    title: "Reduce token usage",
    description:
      "Optimize prompt wording while preserving the intended behavior.",
    enabled: true,
  },
  {
    id: 5,
    title: "Preserve output format",
    description:
      "Keep required response structures and formatting constraints unchanged.",
    enabled: true,
  },
];

export default function PromptOptimizationPage() {
  const [prompt, setPrompt] = useState(initialVersions[0].prompt);

  const [versions, setVersions] =
    useState<PromptVersion[]>(initialVersions);

  const [rules, setRules] =
    useState<OptimizationRule[]>(initialRules);

  const [selectedVersion, setSelectedVersion] = useState(1);

  const [temperature, setTemperature] = useState(0.2);

  const [maxTokens, setMaxTokens] = useState(512);

  const [optimizationLevel, setOptimizationLevel] =
    useState("Balanced");

  const [autoOptimize, setAutoOptimize] = useState(true);

  const [preserveBehavior, setPreserveBehavior] =
    useState(true);

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [testing, setTesting] = useState(false);

  const [saved, setSaved] = useState(false);

  const [optimized, setOptimized] = useState(false);

  const activeVersion = useMemo(
    () =>
      versions.find(
        (version) => version.id === selectedVersion
      ),
    [versions, selectedVersion]
  );

  const toggleRule = (id: number) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              enabled: !rule.enabled,
            }
          : rule
      )
    );

    setSaved(false);
  };

  const optimizePrompt = () => {
    setTesting(false);
    setOptimized(true);

    const optimizedText =
      "You are an enterprise AI assistant. Understand the user's objective, follow the provided constraints, use available tools when necessary, verify important results, and return a clear, accurate response.";

    setPrompt(optimizedText);

    setVersions((current) =>
      current.map((version) =>
        version.id === 1
          ? {
              ...version,
              prompt: optimizedText,
              score: 95,
              tokens: 128,
              latency: 1.6,
            }
          : version
      )
    );

    setSaved(false);
  };

  const runEvaluation = () => {
    setTesting(true);

    window.setTimeout(() => {
      setTesting(false);
    }, 1500);
  };

  const savePrompt = () => {
    setSaved(true);
    setOptimized(false);
  };

  const createVersion = () => {
    const nextId =
      versions.length > 0
        ? Math.max(
            ...versions.map((version) => version.id)
          ) + 1
        : 1;

    const newVersion: PromptVersion = {
      id: nextId,
      name: `Prompt Version ${nextId}`,
      prompt,
      score: 0,
      tokens: 0,
      latency: 0,
      status: "Draft",
    };

    setVersions((current) => [
      ...current,
      newVersion,
    ]);

    setSelectedVersion(nextId);
    setSaved(false);
  };

  const deleteVersion = (id: number) => {
    if (versions.length <= 1) return;

    const remaining = versions.filter(
      (version) => version.id !== id
    );

    setVersions(remaining);

    if (selectedVersion === id) {
      setSelectedVersion(remaining[0].id);
      setPrompt(remaining[0].prompt);
    }

    setSaved(false);
  };

  const selectVersion = (version: PromptVersion) => {
    setSelectedVersion(version.id);
    setPrompt(version.prompt);
    setOptimized(false);
    setSaved(false);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/intelligence"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            >
              <ChevronRight
                size={18}
                className="rotate-180"
              />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">
                  Prompt Optimization
                </h1>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Improve prompt quality, reduce token usage and
                optimize agent performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <CheckCircle2 size={15} />
                Saved
              </span>
            )}

            <button
              onClick={savePrompt}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Save size={15} />
              Save Prompt
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Wand2 size={22} />
              </div>

              <h2 className="text-2xl font-semibold">
                AI-powered prompt optimization
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Automatically improve prompts for clarity, quality,
                consistency, latency and token efficiency while
                preserving the intended agent behavior.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <Metric
                  label="Quality score"
                  value={`${activeVersion?.score ?? 0}`}
                />

                <Metric
                  label="Prompt tokens"
                  value={`${activeVersion?.tokens ?? 0}`}
                />

                <Metric
                  label="Latency"
                  value={`${activeVersion?.latency ?? 0}s`}
                />

                <Metric
                  label="Optimization"
                  value={optimizationLevel}
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#111827] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Activity size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Optimization Engine
                  </p>

                  <p className="text-xs text-gray-400">
                    Prompt intelligence runtime
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <EngineStatus
                  label="Instruction analysis"
                  enabled={true}
                />

                <EngineStatus
                  label="Token optimization"
                  enabled={true}
                />

                <EngineStatus
                  label="Behavior preservation"
                  enabled={preserveBehavior}
                />

                <EngineStatus
                  label="Automatic optimization"
                  enabled={autoOptimize}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Prompt Editor */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Prompt Editor
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Write or edit the instructions used by your agent.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyPrompt}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                  >
                    <Copy size={14} />
                    Copy
                  </button>

                  <button
                    onClick={optimizePrompt}
                    className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    <Wand2 size={14} />
                    Optimize
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-600">
                    System Prompt
                  </span>

                  <span className="text-[10px] text-gray-400">
                    {prompt.length} characters
                  </span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setSaved(false);
                    setOptimized(false);
                  }}
                  className="min-h-[280px] w-full resize-y bg-white p-5 font-mono text-sm leading-6 text-gray-800 outline-none"
                  placeholder="Write your agent system prompt..."
                />
              </div>

              {optimized && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                  <CheckCircle2 size={15} />
                  Prompt optimized successfully. Review the changes
                  before saving.
                </div>
              )}
            </section>

            {/* Strategy */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Optimization Strategy
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how aggressively the optimization engine
                  should modify the prompt.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    title: "Conservative",
                    description:
                      "Small changes focused on clarity and safety.",
                  },
                  {
                    title: "Balanced",
                    description:
                      "Balances quality, token efficiency and behavior.",
                  },
                  {
                    title: "Aggressive",
                    description:
                      "Maximizes efficiency and rewrites unnecessary prompt content.",
                  },
                ].map((item) => {
                  const selected =
                    optimizationLevel === item.title;

                  return (
                    <button
                      key={item.title}
                      onClick={() => {
                        setOptimizationLevel(item.title);
                        setSaved(false);
                      }}
                      className={`rounded-xl border p-4 text-left ${
                        selected
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          {item.title}
                        </h3>

                        {selected && (
                          <CheckCircle2
                            size={16}
                            className="text-green-600"
                          />
                        )}
                      </div>

                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Rules */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Optimization Rules
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select the transformations the optimization engine
                  is allowed to perform.
                </p>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onChange={toggleRule}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  const nextId =
                    rules.length > 0
                      ? Math.max(
                          ...rules.map(
                            (rule) => rule.id
                          )
                        ) + 1
                      : 1;

                  setRules((current) => [
                    ...current,
                    {
                      id: nextId,
                      title: `Custom optimization rule ${nextId}`,
                      description:
                        "Configure an additional prompt optimization behavior.",
                      enabled: true,
                    },
                  ]);

                  setSaved(false);
                }}
                className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <Plus size={14} />
                Add Optimization Rule
              </button>
            </section>

            {/* Evaluation */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Prompt Evaluation
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Test the prompt against evaluation cases before
                    deploying it.
                  </p>
                </div>

                <button
                  onClick={runEvaluation}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  {testing ? (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Play size={14} />
                  )}

                  {testing
                    ? "Running..."
                    : "Run Evaluation"}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <EvaluationMetric
                  icon={<Target size={17} />}
                  label="Instruction following"
                  value="96%"
                />

                <EvaluationMetric
                  icon={<Gauge size={17} />}
                  label="Efficiency"
                  value="91%"
                />

                <EvaluationMetric
                  icon={<FlaskConical size={17} />}
                  label="Consistency"
                  value="94%"
                />
              </div>
            </section>

            {/* Advanced */}
            <section className="rounded-2xl border border-gray-200 bg-white">
              <button
                onClick={() =>
                  setAdvancedOpen(!advancedOpen)
                }
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Settings2 size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      Advanced Optimization Settings
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Fine-tune how optimization is applied.
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    advancedOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {advancedOpen && (
                <div className="border-t border-gray-100 p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <SettingCard
                      title="Semantic similarity threshold"
                      value="0.90"
                      description="Minimum semantic similarity required when rewriting instructions."
                    />

                    <SettingCard
                      title="Token reduction target"
                      value="20%"
                      description="Target reduction in prompt token consumption."
                    />

                    <SettingCard
                      title="Quality regression limit"
                      value="3%"
                      description="Maximum acceptable quality reduction during optimization."
                    />

                    <SettingCard
                      title="Optimization retries"
                      value="3"
                      description="Number of optimization attempts before returning the original prompt."
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Versions */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    Prompt Versions
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Manage prompt iterations.
                  </p>
                </div>

                <button
                  onClick={createVersion}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  title="Create version"
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="mt-5 space-y-2">
                {versions.map((version) => {
                  const selected =
                    selectedVersion === version.id;

                  return (
                    <button
                      key={version.id}
                      onClick={() =>
                        selectVersion(version)
                      }
                      className={`w-full rounded-xl border p-3 text-left ${
                        selected
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold">
                            {version.name}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            Score {version.score} ·{" "}
                            {version.tokens} tokens
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-medium ${
                            version.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : version.status === "Draft"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {version.status}
                        </span>
                      </div>

                      {versions.length > 1 && (
                        <div className="mt-3 flex justify-end">
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteVersion(version.id);
                            }}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Performance */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Gauge size={17} />
                <h2 className="text-sm font-semibold">
                  Performance Impact
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <PerformanceRow
                  label="Quality"
                  value="95"
                  suffix="/100"
                />

                <PerformanceRow
                  label="Token usage"
                  value="-18"
                  suffix="%"
                />

                <PerformanceRow
                  label="Latency"
                  value="-11"
                  suffix="%"
                />

                <PerformanceRow
                  label="Consistency"
                  value="+7"
                  suffix="%"
                />
              </div>
            </section>

            {/* Configuration */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">
                Configuration
              </h2>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Temperature"
                  value={temperature.toFixed(1)}
                />

                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Temperature
                    </span>

                    <span className="text-xs font-medium">
                      {temperature.toFixed(1)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(event) => {
                      setTemperature(
                        Number(event.target.value)
                      );
                      setSaved(false);
                    }}
                    className="mt-3 w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Max output tokens
                    </span>

                    <span className="text-xs font-medium">
                      {maxTokens}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="128"
                    max="2048"
                    step="128"
                    value={maxTokens}
                    onChange={(event) => {
                      setMaxTokens(
                        Number(event.target.value)
                      );
                      setSaved(false);
                    }}
                    className="mt-3 w-full"
                  />
                </div>

                <ToggleMini
                  label="Auto optimize"
                  enabled={autoOptimize}
                  onChange={(value) => {
                    setAutoOptimize(value);
                    setSaved(false);
                  }}
                />

                <ToggleMini
                  label="Preserve behavior"
                  enabled={preserveBehavior}
                  onChange={(value) => {
                    setPreserveBehavior(value);
                    setSaved(false);
                  }}
                />
              </div>
            </section>

            {/* Optimization Coach */}
            <section className="rounded-2xl border border-gray-200 bg-[#111827] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Lightbulb size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Optimization Coach
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Get AI recommendations for this prompt.
                  </p>
                </div>
              </div>

              <button
                onClick={optimizePrompt}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-100"
              >
                <Wand2 size={14} />
                Optimize with AI
                <ArrowRight size={14} />
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-lg font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>
    </div>
  );
}

function EngineStatus({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">
        {label}
      </span>

      <span
        className={`h-2 w-2 rounded-full ${
          enabled
            ? "bg-green-400"
            : "bg-gray-600"
        }`}
      />
    </div>
  );
}

function RuleRow({
  rule,
  onChange,
}: {
  rule: OptimizationRule;
  onChange: (id: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-500">
          <Target size={17} />
        </div>

        <div>
          <p className="text-sm font-medium">
            {rule.title}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {rule.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => onChange(rule.id)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          rule.enabled
            ? "bg-black"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            rule.enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function EvaluationMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function SettingCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">
          {title}
        </h3>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium">
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function PerformanceRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-green-600">
        {value}
        {suffix}
      </span>
    </div>
  );
}

function ToggleMini({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {label}
      </span>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-5 w-9 rounded-full transition ${
          enabled
            ? "bg-black"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-4"
              : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-right text-xs font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}