"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Gauge,
  Layers3,
  Lightbulb,
  MemoryStick,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Zap,
} from "lucide-react";

type ContextItem = {
  id: number;
  title: string;
  type: string;
  tokens: number;
  relevance: number;
  priority: "High" | "Medium" | "Low";
  enabled: boolean;
};

type ContextRule = {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
};

const initialContextItems: ContextItem[] = [
  {
    id: 1,
    title: "System Instructions",
    type: "System",
    tokens: 820,
    relevance: 100,
    priority: "High",
    enabled: true,
  },
  {
    id: 2,
    title: "User Conversation",
    type: "Conversation",
    tokens: 1460,
    relevance: 96,
    priority: "High",
    enabled: true,
  },
  {
    id: 3,
    title: "Retrieved Knowledge",
    type: "RAG",
    tokens: 1180,
    relevance: 91,
    priority: "High",
    enabled: true,
  },
  {
    id: 4,
    title: "Previous Tool Results",
    type: "Tools",
    tokens: 720,
    relevance: 78,
    priority: "Medium",
    enabled: true,
  },
  {
    id: 5,
    title: "Long-Term Memory",
    type: "Memory",
    tokens: 540,
    relevance: 71,
    priority: "Medium",
    enabled: true,
  },
];

const initialRules: ContextRule[] = [
  {
    id: 1,
    title: "Prioritize relevant context",
    description:
      "Rank context based on semantic relevance before sending it to the model.",
    enabled: true,
  },
  {
    id: 2,
    title: "Remove duplicate context",
    description:
      "Detect repeated information and remove unnecessary copies.",
    enabled: true,
  },
  {
    id: 3,
    title: "Compress long conversations",
    description:
      "Summarize older conversation history when the context becomes large.",
    enabled: true,
  },
  {
    id: 4,
    title: "Preserve important instructions",
    description:
      "Protect system instructions and high-priority constraints from compression.",
    enabled: true,
  },
  {
    id: 5,
    title: "Optimize token budget",
    description:
      "Automatically balance context quality against available token limits.",
    enabled: true,
  },
];

export default function ContextManagementPage() {
  const [contextItems, setContextItems] =
    useState<ContextItem[]>(initialContextItems);

  const [rules, setRules] =
    useState<ContextRule[]>(initialRules);

  const [searchQuery, setSearchQuery] = useState("");

  const [contextWindow, setContextWindow] =
    useState(8192);

  const [targetTokens, setTargetTokens] =
    useState(5000);

  const [compressionLevel, setCompressionLevel] =
    useState("Balanced");

  const [retrievalDepth, setRetrievalDepth] =
    useState("Top 5");

  const [autoCompression, setAutoCompression] =
    useState(true);

  const [smartRetrieval, setSmartRetrieval] =
    useState(true);

  const [preserveInstructions, setPreserveInstructions] =
    useState(true);

  const [advancedOpen, setAdvancedOpen] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [optimizing, setOptimizing] =
    useState(false);

  const [optimized, setOptimized] =
    useState(false);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return contextItems;
    }

    return contextItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
  }, [contextItems, searchQuery]);

  const activeItems = contextItems.filter(
    (item) => item.enabled
  );

  const totalTokens = activeItems.reduce(
    (total, item) => total + item.tokens,
    0
  );

  const averageRelevance =
    activeItems.length > 0
      ? Math.round(
          activeItems.reduce(
            (total, item) => total + item.relevance,
            0
          ) / activeItems.length
        )
      : 0;

  const contextUsage = Math.min(
    100,
    Math.round(
      (totalTokens / contextWindow) * 100
    )
  );

  const toggleContextItem = (id: number) => {
    setContextItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              enabled: !item.enabled,
            }
          : item
      )
    );

    setSaved(false);
  };

  const moveItem = (
    id: number,
    direction: "up" | "down"
  ) => {
    setContextItems((current) => {
      const index = current.findIndex(
        (item) => item.id === id
      );

      if (index === -1) {
        return current;
      }

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= current.length
      ) {
        return current;
      }

      const updated = [...current];

      const temp = updated[index];

      updated[index] = updated[newIndex];

      updated[newIndex] = temp;

      return updated;
    });

    setSaved(false);
  };

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

  const addContextSource = () => {
    const nextId =
      contextItems.length > 0
        ? Math.max(
            ...contextItems.map(
              (item) => item.id
            )
          ) + 1
        : 1;

    setContextItems((current) => [
      ...current,
      {
        id: nextId,
        title: `Context Source ${nextId}`,
        type: "Custom",
        tokens: 450,
        relevance: 75,
        priority: "Medium",
        enabled: true,
      },
    ]);

    setSaved(false);
  };

  const removeContextItem = (id: number) => {
    setContextItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    setSaved(false);
  };

  const optimizeContext = () => {
    setOptimizing(true);
    setOptimized(false);

    window.setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);

      setContextItems((current) =>
        current.map((item) => {
          if (item.type === "Tools") {
            return {
              ...item,
              tokens: Math.max(
                300,
                Math.round(item.tokens * 0.75)
              ),
            };
          }

          if (item.type === "Memory") {
            return {
              ...item,
              tokens: Math.max(
                250,
                Math.round(item.tokens * 0.7)
              ),
            };
          }

          return item;
        })
      );

      setSaved(false);
    }, 1400);
  };

  const saveConfiguration = () => {
    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/knowledge"
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
                  Context Management
                </h1>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Knowledge & Memory
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Control, prioritize and optimize the context
                provided to your AI agent.
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
              onClick={saveConfiguration}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Save size={15} />
              )}

              {saving
                ? "Saving..."
                : "Save Configuration"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Layers3 size={22} />
              </div>

              <h2 className="text-2xl font-semibold">
                Intelligent context orchestration
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                ModelNow dynamically selects, ranks, compresses
                and manages information before sending context to
                the model. This helps reduce token usage while
                keeping the most important information available.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <MetricCard
                  label="Context tokens"
                  value={totalTokens.toLocaleString()}
                />

                <MetricCard
                  label="Context usage"
                  value={`${contextUsage}%`}
                />

                <MetricCard
                  label="Avg. relevance"
                  value={`${averageRelevance}%`}
                />

                <MetricCard
                  label="Sources"
                  value={`${activeItems.length}`}
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#111827] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <MemoryStick size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Context Engine
                  </p>

                  <p className="text-xs text-gray-400">
                    Real-time context optimization
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <EngineStatus
                  label="Smart retrieval"
                  enabled={smartRetrieval}
                />

                <EngineStatus
                  label="Auto compression"
                  enabled={autoCompression}
                />

                <EngineStatus
                  label="Instruction protection"
                  enabled={preserveInstructions}
                />

                <EngineStatus
                  label="Context ranking"
                  enabled={true}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Context Sources */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">
                    Context Sources
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Control which information sources are included
                    in the agent context.
                  </p>
                </div>

                <button
                  onClick={addContextSource}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add Source
                </button>
              </div>

              {/* Search */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <Search
                  size={15}
                  className="text-gray-400"
                />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search context sources..."
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="grid grid-cols-[1fr_100px_90px_100px_100px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <span>Context</span>
                  <span>Tokens</span>
                  <span>Relevance</span>
                  <span>Priority</span>
                  <span>Actions</span>
                </div>

                {filteredItems.map((item, index) => (
                  <ContextSourceRow
                    key={item.id}
                    item={item}
                    isFirst={index === 0}
                    isLast={
                      index ===
                      filteredItems.length - 1
                    }
                    onToggle={toggleContextItem}
                    onMove={moveItem}
                    onRemove={
                      removeContextItem
                    }
                  />
                ))}

                {filteredItems.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-400">
                    No context sources found.
                  </div>
                )}
              </div>
            </section>

            {/* Context Pipeline */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6">
                <h2 className="text-base font-semibold">
                  Context Processing Pipeline
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Information passes through these stages before
                  reaching the model.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <PipelineCard
                  number="01"
                  title="Collect"
                  description="Gather relevant context"
                  icon={<Database size={18} />}
                />

                <PipelineCard
                  number="02"
                  title="Retrieve"
                  description="Find useful information"
                  icon={<Search size={18} />}
                />

                <PipelineCard
                  number="03"
                  title="Rank"
                  description="Prioritize relevance"
                  icon={<ArrowUp size={18} />}
                />

                <PipelineCard
                  number="04"
                  title="Compress"
                  description="Reduce unnecessary tokens"
                  icon={<Zap size={18} />}
                />

                <PipelineCard
                  number="05"
                  title="Assemble"
                  description="Build final context"
                  icon={<Layers3 size={18} />}
                />
              </div>
            </section>

            {/* Compression */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Context Compression
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Automatically reduce context size while preserving
                  important information.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    title: "Minimal",
                    description:
                      "Maximum token reduction with aggressive summarization.",
                  },
                  {
                    title: "Balanced",
                    description:
                      "Balance context quality and token efficiency.",
                  },
                  {
                    title: "Preserve",
                    description:
                      "Keep more original context with minimal compression.",
                  },
                ].map((option) => {
                  const selected =
                    compressionLevel === option.title;

                  return (
                    <button
                      key={option.title}
                      onClick={() => {
                        setCompressionLevel(
                          option.title
                        );
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
                          {option.title}
                        </h3>

                        {selected && (
                          <CheckCircle2
                            size={16}
                            className="text-green-600"
                          />
                        )}
                      </div>

                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb
                    size={17}
                    className="mt-0.5 text-blue-600"
                  />

                  <div>
                    <p className="text-xs font-semibold text-blue-900">
                      Recommended configuration
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Balanced compression is suitable for most
                      enterprise agents because it reduces token
                      usage while preserving important context.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Rules */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Context Management Rules
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure how the context engine should process
                  information.
                </p>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onToggle={toggleRule}
                  />
                ))}
              </div>
            </section>

            {/* Optimize */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                    <Zap size={20} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold">
                      Optimize Context
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                      Run the AI context optimizer to identify
                      redundant information, reduce token usage and
                      improve context relevance.
                    </p>
                  </div>
                </div>

                <button
                  onClick={optimizeContext}
                  disabled={optimizing}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {optimizing ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Optimize Now
                    </>
                  )}
                </button>
              </div>

              {optimized && (
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                  <CheckCircle2 size={15} />
                  Context optimization completed successfully.
                </div>
              )}
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
                      Advanced Context Settings
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Configure advanced retrieval and memory behavior.
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    advancedOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {advancedOpen && (
                <div className="border-t border-gray-100 p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <SettingCard
                      title="Context overlap"
                      value="15%"
                      description="Allow overlapping information between retrieved context chunks."
                    />

                    <SettingCard
                      title="Minimum relevance"
                      value="70%"
                      description="Ignore context sources below this relevance threshold."
                    />

                    <SettingCard
                      title="Memory retention"
                      value="30 days"
                      description="Default retention period for contextual memory."
                    />

                    <SettingCard
                      title="Deduplication"
                      value="Semantic"
                      description="Use semantic similarity to identify repeated information."
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Context Budget */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Gauge size={17} />
                <h2 className="text-sm font-semibold">
                  Context Budget
                </h2>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">
                      {totalTokens.toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      of {contextWindow.toLocaleString()} tokens
                    </p>
                  </div>

                  <span className="text-sm font-semibold">
                    {contextUsage}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      contextUsage >= 85
                        ? "bg-red-500"
                        : contextUsage >= 65
                        ? "bg-yellow-500"
                        : "bg-black"
                    }`}
                    style={{
                      width: `${contextUsage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    Target tokens
                  </span>

                  <span className="text-xs font-medium">
                    {targetTokens.toLocaleString()}
                  </span>
                </div>

                <input
                  type="range"
                  min="1000"
                  max={contextWindow}
                  step="250"
                  value={targetTokens}
                  onChange={(event) => {
                    setTargetTokens(
                      Number(event.target.value)
                    );
                    setSaved(false);
                  }}
                  className="mt-3 w-full"
                />
              </div>
            </section>

            {/* Retrieval */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <SearchIcon />
                <h2 className="text-sm font-semibold">
                  Retrieval Settings
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Retrieval depth"
                  value={retrievalDepth}
                />

                <div className="grid grid-cols-3 gap-2">
                  {["Top 3", "Top 5", "Top 10"].map(
                    (option) => {
                      const selected =
                        retrievalDepth === option;

                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setRetrievalDepth(
                              option
                            );
                            setSaved(false);
                          }}
                          className={`rounded-lg border px-2 py-2 text-[10px] font-medium ${
                            selected
                              ? "border-black bg-black text-white"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    }
                  )}
                </div>

                <ToggleMini
                  label="Smart retrieval"
                  enabled={smartRetrieval}
                  onChange={(value) => {
                    setSmartRetrieval(value);
                    setSaved(false);
                  }}
                />
              </div>
            </section>

            {/* Memory */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <MemoryStick size={17} />
                <h2 className="text-sm font-semibold">
                  Memory Configuration
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Short-term memory"
                  value="Enabled"
                />

                <InfoRow
                  label="Long-term memory"
                  value="Enabled"
                />

                <InfoRow
                  label="Memory ranking"
                  value="Semantic"
                />

                <InfoRow
                  label="Retention"
                  value="30 days"
                />
              </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-green-600"
                />

                <h2 className="text-sm font-semibold">
                  Context Protection
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <SecurityRow
                  label="System instructions"
                  enabled={preserveInstructions}
                />

                <SecurityRow
                  label="Sensitive data filtering"
                  enabled={true}
                />

                <SecurityRow
                  label="Prompt injection protection"
                  enabled={true}
                />

                <SecurityRow
                  label="Context isolation"
                  enabled={true}
                />
              </div>
            </section>

            {/* Insights */}
            <section className="rounded-2xl border border-gray-200 bg-[#111827] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Lightbulb size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Context Insights
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    AI recommendations
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Insight
                  text="Retrieved knowledge has high relevance."
                />

                <Insight
                  text="Tool results can be compressed to reduce tokens."
                />

                <Insight
                  text="Long-term memory is using a small context budget."
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
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

function ContextSourceRow({
  item,
  isFirst,
  isLast,
  onToggle,
  onMove,
  onRemove,
}: {
  item: ContextItem;
  isFirst: boolean;
  isLast: boolean;
  onToggle: (id: number) => void;
  onMove: (
    id: number,
    direction: "up" | "down"
  ) => void;
  onRemove: (id: number) => void;
}) {
  const icon =
    item.type === "System" ? (
      <Settings2 size={16} />
    ) : item.type === "Conversation" ? (
      <FileText size={16} />
    ) : item.type === "RAG" ? (
      <Database size={16} />
    ) : item.type === "Memory" ? (
      <MemoryStick size={16} />
    ) : (
      <Zap size={16} />
    );

  return (
    <div
      className={`grid grid-cols-[1fr_100px_90px_100px_100px] items-center px-4 py-4 ${
        item.enabled
          ? "bg-white"
          : "bg-gray-50 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(item.id)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            item.enabled
              ? "bg-gray-100 text-gray-700"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {icon}
        </button>

        <div>
          <p className="text-xs font-semibold">
            {item.title}
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            {item.type}
          </p>
        </div>
      </div>

      <span className="text-xs font-medium text-gray-700">
        {item.tokens.toLocaleString()}
      </span>

      <div>
        <span
          className={`text-xs font-semibold ${
            item.relevance >= 90
              ? "text-green-600"
              : item.relevance >= 75
              ? "text-yellow-600"
              : "text-gray-500"
          }`}
        >
          {item.relevance}%
        </span>
      </div>

      <div>
        <span
          className={`rounded-full px-2 py-1 text-[9px] font-medium ${
            item.priority === "High"
              ? "bg-red-50 text-red-600"
              : item.priority === "Medium"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.priority}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            onMove(item.id, "up")
          }
          disabled={isFirst}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          title="Move up"
        >
          <ArrowUp size={13} />
        </button>

        <button
          onClick={() =>
            onMove(item.id, "down")
          }
          disabled={isLast}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          title="Move down"
        >
          <ArrowDown size={13} />
        </button>

        <button
          onClick={() => onRemove(item.id)}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Remove"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function PipelineCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400">
          {number}
        </span>

        <div className="text-gray-600">
          {icon}
        </div>
      </div>

      <h3 className="mt-4 text-xs font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-4 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function RuleRow({
  rule,
  onToggle,
}: {
  rule: ContextRule;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-4">
      <div>
        <p className="text-sm font-medium">
          {rule.title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {rule.description}
        </p>
      </div>

      <button
        onClick={() => onToggle(rule.id)}
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

function SearchIcon() {
  return (
    <Search
      size={17}
      className="text-gray-600"
    />
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

function SecurityRow({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-600">
        <CheckCircle2 size={13} />
        {enabled ? "Protected" : "Disabled"}
      </span>
    </div>
  );
}

function Insight({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2
        size={14}
        className="mt-0.5 shrink-0 text-green-400"
      />

      <p className="text-xs leading-5 text-gray-300">
        {text}
      </p>
    </div>
  );
}