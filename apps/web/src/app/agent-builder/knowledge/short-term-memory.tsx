"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Lightbulb,
  MemoryStick,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type MemoryItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  source: string;
  created: string;
  lastUsed: string;
  importance: "High" | "Medium" | "Low";
  status: "Active" | "Archived";
};

const initialMemories: MemoryItem[] = [
  {
    id: 1,
    title: "User Preferences",
    content:
      "User prefers concise responses and step-by-step explanations when working with technical tasks.",
    category: "Preferences",
    source: "Conversation",
    created: "Today",
    lastUsed: "2 min ago",
    importance: "High",
    status: "Active",
  },
  {
    id: 2,
    title: "Project Context",
    content:
      "ModelNow Agent Builder is being developed as an enterprise AI platform with agents, workflows, tools, RAG and observability.",
    category: "Project",
    source: "Workspace",
    created: "Yesterday",
    lastUsed: "18 min ago",
    importance: "High",
    status: "Active",
  },
  {
    id: 3,
    title: "Technical Preference",
    content:
      "The user prefers TypeScript and Next.js for frontend application development.",
    category: "Technical",
    source: "Conversation",
    created: "2 days ago",
    lastUsed: "1 hour ago",
    importance: "Medium",
    status: "Active",
  },
  {
    id: 4,
    title: "Previous Decision",
    content:
      "RAG should support documents, websites, databases and APIs as knowledge sources.",
    category: "Decision",
    source: "Agent Builder",
    created: "3 days ago",
    lastUsed: "Yesterday",
    importance: "Medium",
    status: "Active",
  },
];

export default function ShortTermMemoryPage() {
  const [memories, setMemories] =
    useState<MemoryItem[]>(initialMemories);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [showAdd, setShowAdd] = useState(false);

  const [memoryTitle, setMemoryTitle] =
    useState("");

  const [memoryContent, setMemoryContent] =
    useState("");

  const [memoryCategory, setMemoryCategory] =
    useState("Conversation");

  const [autoCapture, setAutoCapture] =
    useState(true);

  const [contextWindow, setContextWindow] =
    useState(true);

  const [compression, setCompression] =
    useState(true);

  const filteredMemories = useMemo(() => {
    const query = search.toLowerCase().trim();

    return memories.filter((memory) => {
      const matchesSearch =
        !query ||
        `${memory.title} ${memory.content} ${memory.category} ${memory.source}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All" ||
        memory.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [memories, search, category]);

  const activeCount = memories.filter(
    (memory) => memory.status === "Active"
  ).length;

  const highImportanceCount = memories.filter(
    (memory) =>
      memory.importance === "High" &&
      memory.status === "Active"
  ).length;

  const addMemory = () => {
    if (!memoryTitle.trim() || !memoryContent.trim()) {
      return;
    }

    const nextId =
      memories.length === 0
        ? 1
        : Math.max(...memories.map((memory) => memory.id)) + 1;

    const newMemory: MemoryItem = {
      id: nextId,
      title: memoryTitle.trim(),
      content: memoryContent.trim(),
      category: memoryCategory,
      source: "Manual",
      created: "Just now",
      lastUsed: "Never",
      importance: "Medium",
      status: "Active",
    };

    setMemories((current) => [
      newMemory,
      ...current,
    ]);

    setMemoryTitle("");
    setMemoryContent("");
    setMemoryCategory("Conversation");
    setShowAdd(false);
  };

  const deleteMemory = (id: number) => {
    setMemories((current) =>
      current.filter((memory) => memory.id !== id)
    );
  };

  const archiveMemory = (id: number) => {
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              status:
                memory.status === "Active"
                  ? "Archived"
                  : "Active",
            }
          : memory
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-gray-900">
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
                  Short-Term Memory
                </h1>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                  Agent Memory
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Maintain recent context and conversation memory for agents.
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
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MemoryStick size={21} />
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                Short-Term Memory
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Keep recent conversations, user preferences and
                task context available during agent execution.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard
                  title="Active memories"
                  value={activeCount.toString()}
                  icon={<Database size={15} />}
                />

                <MetricCard
                  title="High priority"
                  value={highImportanceCount.toString()}
                  icon={<Zap size={15} />}
                />

                <MetricCard
                  title="Context window"
                  value="32K"
                  icon={<FileText size={15} />}
                />

                <MetricCard
                  title="Memory quality"
                  value="96%"
                  icon={<Activity size={15} />}
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Brain size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Memory Engine
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Context management runtime
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <EngineStatus
                  label="Memory capture"
                  status={autoCapture ? "Active" : "Disabled"}
                />

                <EngineStatus
                  label="Context window"
                  status={contextWindow ? "Active" : "Disabled"}
                />

                <EngineStatus
                  label="Memory compression"
                  status={compression ? "Active" : "Disabled"}
                />

                <EngineStatus
                  label="Context retrieval"
                  status="Ready"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Memory Store
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Recent memories available to the agent.
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {filteredMemories.length} memories
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
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
                    setCategory(event.target.value)
                  }
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none"
                >
                  <option value="All">All categories</option>
                  <option value="Preferences">
                    Preferences
                  </option>
                  <option value="Project">
                    Project
                  </option>
                  <option value="Technical">
                    Technical
                  </option>
                  <option value="Decision">
                    Decision
                  </option>
                  <option value="Conversation">
                    Conversation
                  </option>
                </select>
              </div>

              <div className="mt-5 space-y-3">
                {filteredMemories.map((memory) => (
                  <MemoryRow
                    key={memory.id}
                    memory={memory}
                    onArchive={() =>
                      archiveMemory(memory.id)
                    }
                    onDelete={() =>
                      deleteMemory(memory.id)
                    }
                  />
                ))}

                {filteredMemories.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                    <Search
                      size={24}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium">
                      No memories found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try another search or add a new memory.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Lightbulb size={17} />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    Memory Intelligence
                  </h2>

                  <p className="text-xs text-gray-500">
                    How the agent decides what recent context to retain.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <InfoCard
                  title="Importance scoring"
                  value="Enabled"
                  description="Prioritizes information that is useful for future turns."
                />

                <InfoCard
                  title="Context compression"
                  value={compression ? "Active" : "Disabled"}
                  description="Compresses older context when the window becomes full."
                />

                <InfoCard
                  title="Relevance filtering"
                  value="Active"
                  description="Removes low-value information from the active context."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold">
                Memory Lifecycle
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Short-term memory moves through the following lifecycle.
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <LifecycleCard
                  number="01"
                  title="Capture"
                  text="Collect relevant conversation context."
                  icon={<Plus size={16} />}
                />

                <LifecycleCard
                  number="02"
                  title="Score"
                  text="Evaluate importance and relevance."
                  icon={<Activity size={16} />}
                />

                <LifecycleCard
                  number="03"
                  title="Use"
                  text="Inject useful context into the agent."
                  icon={<Brain size={16} />}
                />

                <LifecycleCard
                  number="04"
                  title="Compress"
                  text="Reduce older context when required."
                  icon={<Database size={16} />}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 size={16} />

                <h2 className="text-sm font-semibold">
                  Memory Settings
                </h2>
              </div>

              <div className="mt-5 space-y-5">
                <Toggle
                  label="Automatic capture"
                  enabled={autoCapture}
                  onToggle={() =>
                    setAutoCapture(!autoCapture)
                  }
                />

                <Toggle
                  label="Context window"
                  enabled={contextWindow}
                  onToggle={() =>
                    setContextWindow(!contextWindow)
                  }
                />

                <Toggle
                  label="Memory compression"
                  enabled={compression}
                  onToggle={() =>
                    setCompression(!compression)
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock3 size={16} />

                <h2 className="text-sm font-semibold">
                  Context Window
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Maximum tokens"
                  value="32,000"
                />

                <InfoRow
                  label="Reserved output"
                  value="4,000"
                />

                <InfoRow
                  label="Memory allocation"
                  value="8,000"
                />

                <InfoRow
                  label="Active context"
                  value="4,820"
                />
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    Context usage
                  </span>

                  <span className="font-semibold">
                    60%
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-full w-[60%] rounded-full bg-black"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-green-600"
                />

                <h2 className="text-sm font-semibold">
                  Memory Security
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <SecurityRow label="Memory isolation" />
                <SecurityRow label="Sensitive data filtering" />
                <SecurityRow label="Access control" />
                <SecurityRow label="Audit logging" />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">
                Related Knowledge
              </h2>

              <div className="mt-4 space-y-2">
                <RelatedLink
                  href="/agent-builder/knowledge/rag"
                  label="RAG"
                  icon={<Database size={14} />}
                />

                <RelatedLink
                  href="/agent-builder/knowledge/documents"
                  label="Documents"
                  icon={<FileText size={14} />}
                />

                <RelatedLink
                  href="/agent-builder/knowledge/long-term-memory"
                  label="Long-Term Memory"
                  icon={<MemoryStick size={14} />}
                />

                <RelatedLink
                  href="/agent-builder/knowledge/context-management"
                  label="Context Management"
                  icon={<Brain size={14} />}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Short-Term Memory
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add information that the agent should remember during recent interactions.
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
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Memory title
                </label>

                <input
                  value={memoryTitle}
                  onChange={(event) =>
                    setMemoryTitle(event.target.value)
                  }
                  placeholder="Example: User preference"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Memory content
                </label>

                <textarea
                  value={memoryContent}
                  onChange={(event) =>
                    setMemoryContent(event.target.value)
                  }
                  placeholder="Enter the information the agent should remember..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Category
                </label>

                <select
                  value={memoryCategory}
                  onChange={(event) =>
                    setMemoryCategory(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
                >
                  <option value="Conversation">
                    Conversation
                  </option>

                  <option value="Preferences">
                    Preferences
                  </option>

                  <option value="Project">
                    Project
                  </option>

                  <option value="Technical">
                    Technical
                  </option>

                  <option value="Decision">
                    Decision
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                onClick={addMemory}
                disabled={
                  memoryTitle.trim() === "" ||
                  memoryContent.trim() === ""
                }
                className="rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white disabled:opacity-40"
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
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
  status,
}: {
  label: string;
  status: string;
}) {
  const active =
    status === "Active" || status === "Ready";

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">
        {label}
      </span>

      <span
        className={`flex items-center gap-2 text-[10px] ${
          active
            ? "text-green-400"
            : "text-gray-500"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-green-400"
              : "bg-gray-500"
          }`}
        />

        {status}
      </span>
    </div>
  );
}

function MemoryRow({
  memory,
  onArchive,
  onDelete,
}: {
  memory: MemoryItem;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {memory.category === "Preferences" ? (
            <UserRound size={16} />
          ) : memory.category === "Project" ? (
            <Database size={16} />
          ) : (
            <MemoryStick size={16} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold">
              {memory.title}
            </h3>

            <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-500">
              {memory.category}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[9px] font-medium ${
                memory.status === "Active"
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {memory.status}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            {memory.content}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-gray-400">
            <span>
              Source: {memory.source}
            </span>

            <span>
              Created: {memory.created}
            </span>

            <span>
              Last used: {memory.lastUsed}
            </span>

            <span>
              Importance: {memory.importance}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onArchive}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Archive"
          >
            <Clock3 size={14} />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
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
      <p className="text-xs font-semibold">
        {title}
      </p>

      <p className="mt-2 text-[10px] font-semibold text-green-600">
        {value}
      </p>

      <p className="mt-2 text-[10px] leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function LifecycleCard({
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

      <p className="mt-1 text-[10px] leading-5 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function Toggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {label}
      </span>

      <button
        onClick={onToggle}
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

function SecurityRow({
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
        <ShieldCheck size={12} />
        Protected
      </span>
    </div>
  );
}

function RelatedLink({
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