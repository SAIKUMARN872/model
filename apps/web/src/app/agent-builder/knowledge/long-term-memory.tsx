"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  Archive,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  Download,
  Filter,
  History,
  Lightbulb,
  MemoryStick,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type MemoryItem = {
  id: number;
  title: string;
  content: string;
  category: "Preference" | "Fact" | "Goal" | "Interaction" | "Profile";
  source: "Conversation" | "Agent" | "User";
  confidence: number;
  importance: "High" | "Medium" | "Low";
  created: string;
  updated: string;
  status: "Active" | "Archived";
};

type MemoryRule = {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
};

const initialMemories: MemoryItem[] = [
  {
    id: 1,
    title: "User prefers concise answers",
    content:
      "The user prefers practical answers with clear steps and minimal unnecessary explanation.",
    category: "Preference",
    source: "Conversation",
    confidence: 96,
    importance: "High",
    created: "Sep 12, 2026",
    updated: "Today",
    status: "Active",
  },
  {
    id: 2,
    title: "Primary development stack",
    content:
      "User frequently works with React, Next.js, TypeScript and Tailwind CSS.",
    category: "Fact",
    source: "Conversation",
    confidence: 94,
    importance: "High",
    created: "Sep 10, 2026",
    updated: "Today",
    status: "Active",
  },
  {
    id: 3,
    title: "Startup project context",
    content:
      "User is working on an AI platform involving agents, knowledge, automation and enterprise AI capabilities.",
    category: "Profile",
    source: "Agent",
    confidence: 91,
    importance: "High",
    created: "Sep 8, 2026",
    updated: "Yesterday",
    status: "Active",
  },
  {
    id: 4,
    title: "Career objective",
    content:
      "User wants to build practical IT development skills and work on real-world software products.",
    category: "Goal",
    source: "Conversation",
    confidence: 89,
    importance: "Medium",
    created: "Sep 5, 2026",
    updated: "2 days ago",
    status: "Active",
  },
  {
    id: 5,
    title: "Previous project discussion",
    content:
      "The user previously discussed AI interview and career intelligence features.",
    category: "Interaction",
    source: "Conversation",
    confidence: 84,
    importance: "Medium",
    created: "Sep 2, 2026",
    updated: "4 days ago",
    status: "Active",
  },
];

const initialRules: MemoryRule[] = [
  {
    id: 1,
    title: "Automatically create memories",
    description:
      "Detect useful long-term information from conversations and create memory entries.",
    enabled: true,
  },
  {
    id: 2,
    title: "Prioritize important memories",
    description:
      "Give higher priority to memories that affect future agent responses.",
    enabled: true,
  },
  {
    id: 3,
    title: "Avoid duplicate memories",
    description:
      "Compare new memories with existing entries before storing them.",
    enabled: true,
  },
  {
    id: 4,
    title: "Allow memory updates",
    description:
      "Update an existing memory when newer information is more reliable.",
    enabled: true,
  },
  {
    id: 5,
    title: "Archive stale memories",
    description:
      "Automatically archive memories that are no longer relevant.",
    enabled: false,
  },
];

export default function LongTermMemoryPage() {
  const [memories, setMemories] =
    useState<MemoryItem[]>(initialMemories);

  const [rules, setRules] =
    useState<MemoryRule[]>(initialRules);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedImportance, setSelectedImportance] =
    useState("All");

  const [selectedMemory, setSelectedMemory] =
    useState<number | null>(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const [showCreate, setShowCreate] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);

  const [memoryEnabled, setMemoryEnabled] =
    useState(true);

  const [autoExtraction, setAutoExtraction] =
    useState(true);

  const [semanticSearch, setSemanticSearch] =
    useState(true);

  const [retentionDays, setRetentionDays] =
    useState(90);

  const [maxMemories, setMaxMemories] =
    useState(1000);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [optimizing, setOptimizing] =
    useState(false);

  const [optimized, setOptimized] =
    useState(false);

  const filteredMemories = useMemo(() => {
    const query = searchQuery
      .toLowerCase()
      .trim();

    return memories.filter((memory) => {
      const matchesSearch =
        !query ||
        memory.title
          .toLowerCase()
          .includes(query) ||
        memory.content
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        memory.category === selectedCategory;

      const matchesImportance =
        selectedImportance === "All" ||
        memory.importance === selectedImportance;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesImportance
      );
    });
  }, [
    memories,
    searchQuery,
    selectedCategory,
    selectedImportance,
  ]);

  const activeMemories = memories.filter(
    (memory) => memory.status === "Active"
  );

  const highImportance = memories.filter(
    (memory) =>
      memory.importance === "High" &&
      memory.status === "Active"
  ).length;

  const averageConfidence =
    activeMemories.length > 0
      ? Math.round(
          activeMemories.reduce(
            (total, memory) =>
              total + memory.confidence,
            0
          ) / activeMemories.length
        )
      : 0;

  const memoryUsage = Math.min(
    100,
    Math.round(
      (activeMemories.length / maxMemories) *
        100
    )
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

  const deleteMemory = (id: number) => {
    setMemories((current) =>
      current.filter(
        (memory) => memory.id !== id
      )
    );

    if (selectedMemory === id) {
      setSelectedMemory(null);
    }

    setSaved(false);
  };

  const archiveMemory = (id: number) => {
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              status: "Archived",
              updated: "Just now",
            }
          : memory
      )
    );

    setSelectedMemory(null);
    setSaved(false);
  };

  const restoreMemory = (id: number) => {
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              status: "Active",
              updated: "Just now",
            }
          : memory
      )
    );

    setSaved(false);
  };

  const createMemory = (
    title: string,
    content: string,
    category: MemoryItem["category"]
  ) => {
    const nextId =
      memories.length > 0
        ? Math.max(
            ...memories.map(
              (memory) => memory.id
            )
          ) + 1
        : 1;

    const newMemory: MemoryItem = {
      id: nextId,
      title,
      content,
      category,
      source: "User",
      confidence: 100,
      importance: "Medium",
      created: "Just now",
      updated: "Just now",
      status: "Active",
    };

    setMemories((current) => [
      newMemory,
      ...current,
    ]);

    setShowCreate(false);
    setSaved(false);
  };

  const optimizeMemory = () => {
    setOptimizing(true);
    setOptimized(false);

    window.setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);

      setMemories((current) =>
        current.map((memory) => ({
          ...memory,
          confidence: Math.min(
            100,
            memory.confidence + 2
          ),
        }))
      );
    }, 1400);
  };

  const saveSettings = () => {
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
                  Long-Term Memory
                </h1>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Knowledge & Memory
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Store, manage and retrieve persistent information
                across conversations and agent sessions.
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
              onClick={() =>
                setShowSettings(!showSettings)
              }
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              <Settings2 size={15} />
              Settings
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus size={15} />
              Add Memory
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <Brain size={22} />
              </div>

              <h2 className="text-2xl font-semibold">
                Persistent AI memory
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Long-term memory allows agents to retain useful
                information across sessions, personalize future
                interactions and maintain continuity without
                sending the entire conversation history every time.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <MetricCard
                  label="Active Memories"
                  value={activeMemories.length.toString()}
                  icon={<MemoryStick size={17} />}
                />

                <MetricCard
                  label="High Importance"
                  value={highImportance.toString()}
                  icon={<Zap size={17} />}
                />

                <MetricCard
                  label="Avg. Confidence"
                  value={`${averageConfidence}%`}
                  icon={<CheckCircle2 size={17} />}
                />

                <MetricCard
                  label="Memory Usage"
                  value={`${memoryUsage}%`}
                  icon={<Database size={17} />}
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
                    Memory Engine
                  </p>

                  <p className="text-xs text-gray-400">
                    Persistent knowledge runtime
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <EngineStatus
                  label="Memory system"
                  enabled={memoryEnabled}
                />

                <EngineStatus
                  label="Automatic extraction"
                  enabled={autoExtraction}
                />

                <EngineStatus
                  label="Semantic retrieval"
                  enabled={semanticSearch}
                />

                <EngineStatus
                  label="Duplicate detection"
                  enabled={true}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Memory List */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">
                    Stored Memories
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review and manage information retained for future
                    conversations.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedImportance("All");
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
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
                    placeholder="Search memories..."
                    className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium ${
                    showFilters
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={14} />
                  Filters
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <FilterSelect
                    label="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={[
                      "All",
                      "Preference",
                      "Fact",
                      "Goal",
                      "Interaction",
                      "Profile",
                    ]}
                  />

                  <FilterSelect
                    label="Importance"
                    value={selectedImportance}
                    onChange={setSelectedImportance}
                    options={[
                      "All",
                      "High",
                      "Medium",
                      "Low",
                    ]}
                  />
                </div>
              )}

              <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                <div className="grid grid-cols-[1fr_100px_90px_100px_45px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <span>Memory</span>
                  <span>Category</span>
                  <span>Confidence</span>
                  <span>Importance</span>
                  <span />
                </div>

                {filteredMemories.map((memory) => (
                  <MemoryRow
                    key={memory.id}
                    memory={memory}
                    selected={
                      selectedMemory ===
                      memory.id
                    }
                    onSelect={() =>
                      setSelectedMemory(
                        memory.id
                      )
                    }
                    onDelete={deleteMemory}
                    onArchive={archiveMemory}
                    onRestore={restoreMemory}
                  />
                ))}

                {filteredMemories.length ===
                  0 && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
                    <Search
                      size={24}
                      className="text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium">
                      No memories found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try a different search or filter.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Selected Memory */}
            {selectedMemory !== null && (
              <MemoryDetail
                memory={
                  memories.find(
                    (memory) =>
                      memory.id ===
                      selectedMemory
                  ) ?? null
                }
                onClose={() =>
                  setSelectedMemory(null)
                }
                onDelete={deleteMemory}
                onArchive={archiveMemory}
                onRestore={restoreMemory}
              />
            )}

            {/* Memory Lifecycle */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6">
                <h2 className="text-base font-semibold">
                  Memory Lifecycle
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  How information moves through the long-term memory
                  system.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <LifecycleCard
                  number="01"
                  title="Extract"
                  description="Detect useful information"
                  icon={<Search size={18} />}
                />

                <LifecycleCard
                  number="02"
                  title="Validate"
                  description="Check confidence"
                  icon={<ShieldCheck size={18} />}
                />

                <LifecycleCard
                  number="03"
                  title="Store"
                  description="Persist memory"
                  icon={<Database size={18} />}
                />

                <LifecycleCard
                  number="04"
                  title="Retrieve"
                  description="Find relevant memories"
                  icon={<Zap size={18} />}
                />

                <LifecycleCard
                  number="05"
                  title="Update"
                  description="Keep information current"
                  icon={<RefreshCw size={18} />}
                />
              </div>
            </section>

            {/* Memory Rules */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Memory Rules
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure how the agent creates and maintains
                  persistent memories.
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
                      Optimize Memory
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                      Analyze stored memories for duplicates, stale
                      information and low-confidence entries.
                    </p>
                  </div>
                </div>

                <button
                  onClick={optimizeMemory}
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
                      Optimize
                    </>
                  )}
                </button>
              </div>

              {optimized && (
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                  <CheckCircle2 size={15} />
                  Memory optimization completed successfully.
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Memory Capacity */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Database size={17} />

                <h2 className="text-sm font-semibold">
                  Memory Capacity
                </h2>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">
                      {activeMemories.length}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      of {maxMemories} memories
                    </p>
                  </div>

                  <span className="text-sm font-semibold">
                    {memoryUsage}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{
                      width: `${memoryUsage}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Memory Settings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 size={17} />

                <h2 className="text-sm font-semibold">
                  Memory Settings
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <ToggleMini
                  label="Memory enabled"
                  enabled={memoryEnabled}
                  onChange={(value) => {
                    setMemoryEnabled(value);
                    setSaved(false);
                  }}
                />

                <ToggleMini
                  label="Auto extraction"
                  enabled={autoExtraction}
                  onChange={(value) => {
                    setAutoExtraction(value);
                    setSaved(false);
                  }}
                />

                <ToggleMini
                  label="Semantic search"
                  enabled={semanticSearch}
                  onChange={(value) => {
                    setSemanticSearch(value);
                    setSaved(false);
                  }}
                />

                <ToggleMini
                  label="Protect important memory"
                  enabled={true}
                  onChange={() => {
                    setSaved(false);
                  }}
                />
              </div>
            </section>

            {/* Retention */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock3 size={17} />

                <h2 className="text-sm font-semibold">
                  Retention Policy
                </h2>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Retention period
                  </span>

                  <span className="text-xs font-semibold">
                    {retentionDays} days
                  </span>
                </div>

                <input
                  type="range"
                  min="7"
                  max="365"
                  step="7"
                  value={retentionDays}
                  onChange={(event) => {
                    setRetentionDays(
                      Number(event.target.value)
                    );
                    setSaved(false);
                  }}
                  className="mt-3 w-full"
                />

                <p className="mt-2 text-[10px] leading-4 text-gray-400">
                  Memories older than this period may be archived
                  when stale-memory management is enabled.
                </p>
              </div>
            </section>

            {/* Confidence */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Activity size={17} />

                <h2 className="text-sm font-semibold">
                  Memory Quality
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <QualityRow
                  label="High confidence"
                  value="82%"
                />

                <QualityRow
                  label="Medium confidence"
                  value="14%"
                />

                <QualityRow
                  label="Low confidence"
                  value="4%"
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
                  Memory Protection
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <SecurityRow
                  label="Access control"
                  enabled={true}
                />

                <SecurityRow
                  label="Sensitive information filter"
                  enabled={true}
                />

                <SecurityRow
                  label="Memory isolation"
                  enabled={true}
                />

                <SecurityRow
                  label="Audit logging"
                  enabled={true}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Create Memory Modal */}
      {showCreate && (
        <CreateMemoryModal
          onClose={() => setShowCreate(false)}
          onCreate={createMemory}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <MemorySettingsModal
          memoryEnabled={memoryEnabled}
          autoExtraction={autoExtraction}
          semanticSearch={semanticSearch}
          retentionDays={retentionDays}
          maxMemories={maxMemories}
          onMemoryEnabled={setMemoryEnabled}
          onAutoExtraction={setAutoExtraction}
          onSemanticSearch={setSemanticSearch}
          onRetentionDays={setRetentionDays}
          onMaxMemories={setMaxMemories}
          onSave={() => {
            saveSettings();
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
          saving={saving}
        />
      )}
    </main>
  );
}

function MetricCard({
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

function MemoryRow({
  memory,
  selected,
  onSelect,
  onDelete,
  onArchive,
  onRestore,
}: {
  memory: MemoryItem;
  selected: boolean;
  onSelect: () => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_100px_90px_100px_45px] items-center border-b border-gray-100 px-4 py-4 last:border-b-0 ${
        selected
          ? "bg-gray-50"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <button
        onClick={onSelect}
        className="min-w-0 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <MemoryStick size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {memory.title}
            </p>

            <p className="mt-1 truncate text-[10px] text-gray-400">
              {memory.content}
            </p>
          </div>
        </div>
      </button>

      <span className="w-fit rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-600">
        {memory.category}
      </span>

      <span
        className={`text-xs font-semibold ${
          memory.confidence >= 90
            ? "text-green-600"
            : memory.confidence >= 75
            ? "text-yellow-600"
            : "text-gray-500"
        }`}
      >
        {memory.confidence}%
      </span>

      <span
        className={`w-fit rounded-full px-2 py-1 text-[9px] font-medium ${
          memory.importance === "High"
            ? "bg-red-50 text-red-600"
            : memory.importance === "Medium"
            ? "bg-yellow-50 text-yellow-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {memory.importance}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={onSelect}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          title="View"
        >
          <MoreHorizontal size={14} />
        </button>

        <button
          onClick={() =>
            memory.status === "Active"
              ? onArchive(memory.id)
              : onRestore(memory.id)
          }
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          title={
            memory.status === "Active"
              ? "Archive"
              : "Restore"
          }
        >
          <Archive size={13} />
        </button>

        <button
          onClick={() =>
            onDelete(memory.id)
          }
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function MemoryDetail({
  memory,
  onClose,
  onDelete,
  onArchive,
  onRestore,
}: {
  memory: MemoryItem | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  if (!memory) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <MemoryStick size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">
                {memory.title}
              </h2>

              <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-600">
                {memory.category}
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Created {memory.created} · Updated{" "}
              {memory.updated}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-6 rounded-xl bg-gray-50 p-5">
        <p className="text-sm leading-7 text-gray-700">
          {memory.content}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <InfoBox
          label="Confidence"
          value={`${memory.confidence}%`}
        />

        <InfoBox
          label="Importance"
          value={memory.importance}
        />

        <InfoBox
          label="Source"
          value={memory.source}
        />

        <InfoBox
          label="Status"
          value={memory.status}
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() =>
            memory.status === "Active"
              ? onArchive(memory.id)
              : onRestore(memory.id)
          }
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
        >
          <Archive size={13} />
          {memory.status === "Active"
            ? "Archive"
            : "Restore"}
        </button>

        <button
          onClick={() => {
            onDelete(memory.id);
            onClose();
          }}
          className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </section>
  );
}

function LifecycleCard({
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

        <span className="text-gray-600">
          {icon}
        </span>
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
  rule: MemoryRule;
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

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-[10px] text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function QualityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {label}
        </span>

        <span className="text-xs font-semibold">
          {value}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black"
          style={{
            width: value,
          }}
        />
      </div>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-3 py-2.5">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="bg-transparent text-xs font-medium outline-none"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CreateMemoryModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    title: string,
    content: string,
    category: MemoryItem["category"]
  ) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] =
    useState("");
  const [category, setCategory] =
    useState<MemoryItem["category"]>(
      "Preference"
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Add Memory
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Create a persistent memory for the agent.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <InputField
            label="Memory title"
            value={title}
            onChange={setTitle}
            placeholder="Example: User prefers concise answers"
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as MemoryItem["category"]
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none"
            >
              <option value="Preference">
                Preference
              </option>

              <option value="Fact">
                Fact
              </option>

              <option value="Goal">
                Goal
              </option>

              <option value="Interaction">
                Interaction
              </option>

              <option value="Profile">
                Profile
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Memory content
            </label>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              placeholder="Enter the information that should be remembered..."
              className="min-h-[130px] w-full resize-none rounded-lg border border-gray-200 p-3 text-xs leading-5 outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={
              !title.trim() ||
              !content.trim()
            }
            onClick={() =>
              onCreate(
                title.trim(),
                content.trim(),
                category
              )
            }
            className="rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Create Memory
          </button>
        </div>
      </div>
    </div>
  );
}

function MemorySettingsModal({
  memoryEnabled,
  autoExtraction,
  semanticSearch,
  retentionDays,
  maxMemories,
  onMemoryEnabled,
  onAutoExtraction,
  onSemanticSearch,
  onRetentionDays,
  onMaxMemories,
  onSave,
  onClose,
  saving,
}: {
  memoryEnabled: boolean;
  autoExtraction: boolean;
  semanticSearch: boolean;
  retentionDays: number;
  maxMemories: number;
  onMemoryEnabled: (value: boolean) => void;
  onAutoExtraction: (value: boolean) => void;
  onSemanticSearch: (value: boolean) => void;
  onRetentionDays: (value: number) => void;
  onMaxMemories: (value: number) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Memory Settings
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Configure persistent memory behavior.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <ToggleSetting
            title="Memory system"
            description="Allow the agent to use persistent long-term memory."
            enabled={memoryEnabled}
            onChange={onMemoryEnabled}
          />

          <ToggleSetting
            title="Automatic extraction"
            description="Automatically detect useful memories from conversations."
            enabled={autoExtraction}
            onChange={onAutoExtraction}
          />

          <ToggleSetting
            title="Semantic retrieval"
            description="Use semantic similarity when searching memories."
            enabled={semanticSearch}
            onChange={onSemanticSearch}
          />

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Retention period
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {retentionDays} days
                </p>
              </div>
            </div>

            <input
              type="range"
              min="7"
              max="365"
              step="7"
              value={retentionDays}
              onChange={(event) =>
                onRetentionDays(
                  Number(event.target.value)
                )
              }
              className="mt-4 w-full"
            />
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Maximum memories
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {maxMemories.toLocaleString()} memories
                </p>
              </div>
            </div>

            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={maxMemories}
              onChange={(event) =>
                onMaxMemories(
                  Number(event.target.value)
                )
              }
              className="mt-4 w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {saving && (
              <RefreshCw
                size={13}
                className="animate-spin"
              />
            )}

            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-gray-200 p-4">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          enabled
            ? "bg-black"
            : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-gray-400"
      />
    </div>
  );
}