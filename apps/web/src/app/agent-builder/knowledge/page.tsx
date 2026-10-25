"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Database,
  FileText,
  Lightbulb,
  MemoryStick,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type Category =
  | "Preference"
  | "Fact"
  | "Goal"
  | "Profile"
  | "Interaction";

type Memory = {
  id: number;
  title: string;
  content: string;
  category: Category;
  confidence: number;
  importance: "High" | "Medium" | "Low";
  source: string;
  active: boolean;
};

const initialMemories: Memory[] = [
  {
    id: 1,
    title: "User prefers practical answers",
    content:
      "Provide clear, practical and step-by-step guidance.",
    category: "Preference",
    confidence: 96,
    importance: "High",
    source: "Conversation",
    active: true,
  },
  {
    id: 2,
    title: "Primary technology stack",
    content:
      "User frequently works with React, Next.js, TypeScript and Tailwind CSS.",
    category: "Fact",
    confidence: 94,
    importance: "High",
    source: "Conversation",
    active: true,
  },
  {
    id: 3,
    title: "Current product context",
    content:
      "User is working on an AI platform involving agents, knowledge and automation.",
    category: "Profile",
    confidence: 92,
    importance: "High",
    source: "Agent",
    active: true,
  },
  {
    id: 4,
    title: "Career development goal",
    content:
      "User wants to improve practical software development skills.",
    category: "Goal",
    confidence: 89,
    importance: "Medium",
    source: "Conversation",
    active: true,
  },
];

const categoryOptions: Array<"All" | Category> = [
  "All",
  "Preference",
  "Fact",
  "Goal",
  "Profile",
  "Interaction",
];

export default function Page() {
  const [memories, setMemories] =
    useState<Memory[]>(initialMemories);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState<"All" | Category>("All");

  const [memoryEnabled, setMemoryEnabled] =
    useState(true);

  const [autoExtraction, setAutoExtraction] =
    useState(true);

  const [semanticRetrieval, setSemanticRetrieval] =
    useState(true);

  const [showAdd, setShowAdd] =
    useState(false);

  const [selected, setSelected] =
    useState<Memory | null>(null);

  const [title, setTitle] = useState("");

  const [content, setContent] =
    useState("");

  const [newCategory, setNewCategory] =
    useState<Category>("Preference");

  const filteredMemories = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return memories.filter((memory) => {
      const matchesSearch =
        query.length === 0 ||
        memory.title
          .toLowerCase()
          .includes(query) ||
        memory.content
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All" ||
        memory.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [memories, search, category]);

  const activeCount = memories.filter(
    (memory) => memory.active
  ).length;

  const averageConfidence =
    activeCount === 0
      ? 0
      : Math.round(
          memories
            .filter((memory) => memory.active)
            .reduce(
              (sum, memory) =>
                sum + memory.confidence,
              0
            ) / activeCount
        );

  const addMemory = () => {
    if (
      title.trim() === "" ||
      content.trim() === ""
    ) {
      return;
    }

    const nextId =
      memories.length === 0
        ? 1
        : Math.max(
            ...memories.map(
              (memory) => memory.id
            )
          ) + 1;

    const newMemory: Memory = {
      id: nextId,
      title: title.trim(),
      content: content.trim(),
      category: newCategory,
      confidence: 100,
      importance: "Medium",
      source: "User",
      active: true,
    };

    setMemories((current) => [
      newMemory,
      ...current,
    ]);

    setTitle("");
    setContent("");
    setNewCategory("Preference");
    setShowAdd(false);
  };

  const deleteMemory = (id: number) => {
    setMemories((current) =>
      current.filter(
        (memory) => memory.id !== id
      )
    );

    setSelected(null);
  };

  const archiveMemory = (id: number) => {
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              active: false,
            }
          : memory
      )
    );

    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/knowledge"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">
                  Long-Term Memory
                </h1>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-semibold text-purple-700">
                  Knowledge & Memory
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Persistent memory for your AI agents.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            <Plus size={14} />
            Add Memory
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Brain size={21} />
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                Persistent AI memory
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Store useful facts, preferences, goals and
                conversation context so agents can use them
                across multiple sessions.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric
                  title="Active memories"
                  value={activeCount.toString()}
                  icon={<MemoryStick size={15} />}
                />

                <Metric
                  title="Confidence"
                  value={`${averageConfidence}%`}
                  icon={<CheckCircle2 size={15} />}
                />

                <Metric
                  title="Memory usage"
                  value={`${activeCount}%`}
                  icon={<Database size={15} />}
                />

                <Metric
                  title="Retrieval"
                  value="98%"
                  icon={<Search size={15} />}
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <MemoryStick size={19} />

                <div>
                  <p className="text-sm font-semibold">
                    Memory Engine
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Persistent knowledge runtime
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <EngineStatus
                  label="Memory system"
                  enabled={memoryEnabled}
                />

                <EngineStatus
                  label="Auto extraction"
                  enabled={autoExtraction}
                />

                <EngineStatus
                  label="Semantic retrieval"
                  enabled={semanticRetrieval}
                />

                <EngineStatus
                  label="Duplicate detection"
                  enabled={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="space-y-6">
            {/* Memory list */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Stored Memories
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Information available to your agent.
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {filteredMemories.length} memories
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3">
                  <Search
                    size={14}
                    className="text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search memories..."
                    className="w-full bg-transparent py-3 text-xs outline-none"
                  />
                </div>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as "All" | Category
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none"
                >
                  {categoryOptions.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                {filteredMemories.map(
                  (memory) => (
                    <MemoryItem
                      key={memory.id}
                      memory={memory}
                      onClick={() =>
                        setSelected(memory)
                      }
                      onArchive={() =>
                        archiveMemory(
                          memory.id
                        )
                      }
                      onDelete={() =>
                        deleteMemory(
                          memory.id
                        )
                      }
                    />
                  )
                )}

                {filteredMemories.length ===
                  0 && (
                  <div className="py-16 text-center">
                    <Search
                      size={24}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium">
                      No memories found
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Selected memory */}
            {selected && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <MemoryStick size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        {selected.title}
                      </h2>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {selected.category} ·{" "}
                        {selected.source}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelected(null)
                    }
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-5">
                  <p className="text-sm leading-6 text-gray-700">
                    {selected.content}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <InfoCard
                    title="Confidence"
                    value={`${selected.confidence}%`}
                  />

                  <InfoCard
                    title="Importance"
                    value={selected.importance}
                  />

                  <InfoCard
                    title="Status"
                    value={
                      selected.active
                        ? "Active"
                        : "Archived"
                    }
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() =>
                      archiveMemory(
                        selected.id
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs hover:bg-gray-50"
                  >
                    <Archive size={13} />
                    Archive
                  </button>

                  <button
                    onClick={() =>
                      deleteMemory(
                        selected.id
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </section>
            )}

            {/* Lifecycle */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold">
                Memory Lifecycle
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                How information moves through the memory engine.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-5">
                <Lifecycle
                  number="01"
                  title="Extract"
                  text="Detect useful information"
                  icon={<Search size={16} />}
                />

                <Lifecycle
                  number="02"
                  title="Validate"
                  text="Check confidence"
                  icon={<ShieldCheck size={16} />}
                />

                <Lifecycle
                  number="03"
                  title="Store"
                  text="Persist memory"
                  icon={<Database size={16} />}
                />

                <Lifecycle
                  number="04"
                  title="Retrieve"
                  text="Find useful context"
                  icon={<Zap size={16} />}
                />

                <Lifecycle
                  number="05"
                  title="Update"
                  text="Keep memory current"
                  icon={<Activity size={16} />}
                />
              </div>
            </section>

            {/* Intelligence */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Lightbulb size={17} />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    Memory Intelligence
                  </h2>

                  <p className="text-xs text-gray-500">
                    AI-powered memory quality controls.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <Intelligence
                  title="Importance scoring"
                  value="92%"
                  text="Ranks memories by future usefulness."
                />

                <Intelligence
                  title="Conflict detection"
                  value="88%"
                  text="Detects conflicting information."
                />

                <Intelligence
                  title="Context relevance"
                  value="95%"
                  text="Retrieves relevant memories."
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 size={16} />
                <h2 className="text-sm font-semibold">
                  Configuration
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <Switch
                  label="Memory enabled"
                  enabled={memoryEnabled}
                  onClick={() =>
                    setMemoryEnabled(
                      !memoryEnabled
                    )
                  }
                />

                <Switch
                  label="Auto extraction"
                  enabled={autoExtraction}
                  onClick={() =>
                    setAutoExtraction(
                      !autoExtraction
                    )
                  }
                />

                <Switch
                  label="Semantic retrieval"
                  enabled={semanticRetrieval}
                  onClick={() =>
                    setSemanticRetrieval(
                      !semanticRetrieval
                    )
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <h2 className="text-sm font-semibold">
                  Quality
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <Progress
                  label="High confidence"
                  value={82}
                />

                <Progress
                  label="Medium confidence"
                  value={14}
                />

                <Progress
                  label="Low confidence"
                  value={4}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Search size={16} />
                <h2 className="text-sm font-semibold">
                  Retrieval
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Mode"
                  value="Semantic"
                />

                <InfoRow
                  label="Top K"
                  value="8"
                />

                <InfoRow
                  label="Threshold"
                  value="0.72"
                />

                <InfoRow
                  label="Context budget"
                  value="12K"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-green-600"
                />

                <h2 className="text-sm font-semibold">
                  Security
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <Security label="Access control" />
                <Security label="Sensitive data filtering" />
                <Security label="Memory isolation" />
                <Security label="Audit logging" />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">
                Related
              </h2>

              <div className="mt-4 space-y-2">
                <Related
                  href="/agent-builder/knowledge/documents"
                  label="Documents"
                  icon={<FileText size={14} />}
                />

                <Related
                  href="/agent-builder/knowledge/context-management"
                  label="Context Management"
                  icon={<Brain size={14} />}
                />

                <Related
                  href="/agent-builder/knowledge"
                  label="Knowledge Base"
                  icon={<Database size={14} />}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Add Memory */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Memory
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Create persistent information for the agent.
                </p>
              </div>

              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Memory title"
                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
              />

              <select
                value={newCategory}
                onChange={(event) =>
                  setNewCategory(
                    event.target.value as Category
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
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

                <option value="Profile">
                  Profile
                </option>

                <option value="Interaction">
                  Interaction
                </option>
              </select>

              <textarea
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder="What should the agent remember?"
                className="min-h-[130px] w-full resize-none rounded-lg border border-gray-200 p-3 text-xs outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs"
              >
                Cancel
              </button>

              <button
                onClick={addMemory}
                disabled={
                  title.trim() === "" ||
                  content.trim() === ""
                }
                className="rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white disabled:opacity-40"
              >
                Create Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-[10px]">
          {title}
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

function MemoryItem({
  memory,
  onClick,
  onArchive,
  onDelete,
}: {
  memory: Memory;
  onClick: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 p-4 last:border-0 hover:bg-gray-50">
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <MemoryStick size={16} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {memory.title}
          </p>

          <p className="mt-1 truncate text-[10px] text-gray-400">
            {memory.content}
          </p>
        </div>
      </button>

      <span className="hidden rounded-full bg-gray-100 px-2 py-1 text-[9px] md:block">
        {memory.category}
      </span>

      <span className="text-xs font-semibold text-green-600">
        {memory.confidence}%
      </span>

      <button
        onClick={onArchive}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
      >
        <Archive size={14} />
      </button>

      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={14} />
      </button>

      <button
        onClick={onClick}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
      >
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-[10px] text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function Lifecycle({
  number,
  title,
  text,
  icon,
}: {
  number: string;
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400">
          {number}
        </span>

        <span className="text-gray-500">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-gray-500">
        {text}
      </p>
    </div>
  );
}

function Intelligence({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">
          {title}
        </p>

        <span className="text-xs font-bold text-green-600">
          {value}
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-5 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function Switch({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {label}
      </span>

      <button
        onClick={onClick}
        className={`relative h-5 w-9 rounded-full ${
          enabled ? "bg-black" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${
            enabled ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Progress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">
          {label}
        </span>

        <span className="text-xs font-semibold">
          {value}%
        </span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
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
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-xs font-semibold">
        {value}
      </span>
    </div>
  );
}

function Security({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {label}
      </span>

      <span className="flex items-center gap-1 text-[10px] text-green-600">
        <CheckCircle2 size={12} />
        Protected
      </span>
    </div>
  );
}

function Related({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 hover:bg-gray-50"
    >
      <span className="flex items-center gap-2 text-xs">
        {icon}
        {label}
      </span>

      <ArrowRight
        size={13}
        className="text-gray-400"
      />
    </Link>
  );
}