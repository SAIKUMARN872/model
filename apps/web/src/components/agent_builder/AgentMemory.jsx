"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  History,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

const memoryLayers = [
  {
    id: "conversation",
    name: "Conversation Memory",
    description: "Recent messages and active conversation context.",
    icon: Brain,
    size: "24 KB",
    items: 42,
    status: "Active",
  },
  {
    id: "working",
    name: "Working Memory",
    description: "Temporary information used during the current task.",
    icon: Zap,
    size: "18 KB",
    items: 18,
    status: "Active",
  },
  {
    id: "long-term",
    name: "Long-Term Memory",
    description: "Persistent facts and information retained across sessions.",
    icon: Database,
    size: "142 MB",
    items: 1284,
    status: "Connected",
  },
  {
    id: "semantic",
    name: "Semantic Memory",
    description: "Structured knowledge used for retrieval and reasoning.",
    icon: Layers,
    size: "2.4 GB",
    items: 65320,
    status: "Connected",
  },
];

const initialMemories = [
  {
    id: "mem-001",
    type: "User Preference",
    title: "Preferred communication style",
    content: "User prefers concise answers with practical examples.",
    source: "Conversation",
    layer: "Conversation Memory",
    updated: "2 minutes ago",
    confidence: 98,
  },
  {
    id: "mem-002",
    type: "Project Context",
    title: "Current project",
    content: "User is working on an AI agent platform with a visual workflow builder.",
    source: "Project",
    layer: "Long-Term Memory",
    updated: "18 minutes ago",
    confidence: 96,
  },
  {
    id: "mem-003",
    type: "Knowledge",
    title: "Agent architecture",
    content: "Agent workflows include planning, tools, memory, evaluation, and deployment.",
    source: "Knowledge Base",
    layer: "Semantic Memory",
    updated: "1 hour ago",
    confidence: 94,
  },
  {
    id: "mem-004",
    type: "Task Context",
    title: "Current workflow",
    content: "Research agent is using browser search followed by quality validation.",
    source: "Execution",
    layer: "Working Memory",
    updated: "3 hours ago",
    confidence: 91,
  },
];

function StatusBadge({ status }) {
  const styles = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Connected: "border-blue-200 bg-blue-50 text-blue-700",
    Disabled: "border-slate-200 bg-slate-50 text-slate-500",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.Disabled
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

      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-slate-900" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function AgentMemory() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLayer, setSelectedLayer] = useState("conversation");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [settings, setSettings] = useState({
    conversation: true,
    working: true,
    longTerm: true,
    semantic: true,
    autoExtract: true,
    deduplication: true,
    retention: true,
    encryption: true,
  });

  const [memories, setMemories] = useState(initialMemories);

  const filteredMemories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return memories.filter((memory) => {
      const matchesSearch =
        !query ||
        memory.title.toLowerCase().includes(query) ||
        memory.content.toLowerCase().includes(query) ||
        memory.type.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All" || memory.type === typeFilter;

      const matchesLayer =
        activeTab === "overview" ||
        activeTab === "memories"
          ? true
          : memory.layer.toLowerCase().replaceAll(" ", "-") ===
            selectedLayer;

      return matchesSearch && matchesType && matchesLayer;
    });
  }, [activeTab, memories, search, selectedLayer, typeFilter]);

  const selectedLayerData =
    memoryLayers.find((layer) => layer.id === selectedLayer) ||
    memoryLayers[0];

  const syncMemory = () => {
    setSyncing(true);

    setTimeout(() => {
      setSyncing(false);
    }, 1400);
  };

  const clearWorkingMemory = () => {
    setMemories((current) =>
      current.filter((item) => item.layer !== "Working Memory")
    );
  };

  const addMemory = () => {
    const newMemory = {
      id: `mem-${Date.now()}`,
      type: "Manual",
      title: "New agent memory",
      content: "Memory added manually from the Agent Memory panel.",
      source: "Manual",
      layer: "Long-Term Memory",
      updated: "Just now",
      confidence: 100,
    };

    setMemories((current) => [newMemory, ...current]);
    setShowAddModal(false);
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
                <span className="text-lg leading-none">←</span>
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Brain size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">Agent Memory</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage conversation memory, working memory, long-term
                  memory, and semantic knowledge.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={syncMemory}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw
                  size={15}
                  className={syncing ? "animate-spin" : ""}
                />
                {syncing ? "Syncing..." : "Sync Memory"}
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={15} />
                Add Memory
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Memory items"
            value="66.6K"
            detail="Across all memory layers"
            icon={Database}
          />

          <MetricCard
            label="Conversation memory"
            value="42"
            detail="Recent context items"
            icon={Brain}
          />

          <MetricCard
            label="Long-term memory"
            value="1,284"
            detail="Persistent memories"
            icon={Layers}
          />

          <MetricCard
            label="Memory accuracy"
            value="94.6%"
            detail="Evaluation benchmark"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Memory health"
            value="Healthy"
            detail="All memory services connected"
            icon={Activity}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "memories", "settings", "history"].map((tab) => (
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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Memory Architecture
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Information flows through different memory layers based
                    on task requirements.
                  </p>
                </div>

                <StatusBadge status="Active" />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {memoryLayers.map((layer) => {
                  const Icon = layer.icon;
                  const selected = layer.id === selectedLayer;

                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          <Icon size={18} />
                        </div>

                        {selected && (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                          />
                        )}
                      </div>

                      <div className="mt-4 text-sm font-semibold">
                        {layer.name}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {layer.description}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">
                            {layer.items.toLocaleString()}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            Items
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {layer.size}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            Storage
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Selected Memory Layer"
                  description="Current configuration for the active memory layer."
                  action={
                    <StatusBadge status={selectedLayerData.status} />
                  }
                />

                <div className="mt-5 rounded-xl bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <selectedLayerData.icon
                        size={19}
                        className="text-slate-700"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        {selectedLayerData.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {selectedLayerData.description}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-[10px] text-slate-400">
                        Items
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {selectedLayerData.items.toLocaleString()}
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <div className="text-[10px] text-slate-400">
                        Storage
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {selectedLayerData.size}
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <div className="text-[10px] text-slate-400">
                        Accuracy
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        94.6%
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <div className="text-[10px] text-slate-400">
                        Status
                      </div>

                      <div className="mt-1 text-sm font-semibold text-emerald-600">
                        Healthy
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Memory Health"
                  description="Live status of the memory system."
                />

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-medium">
                        Memory Service
                      </span>
                    </div>

                    <StatusBadge status="Healthy" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <Database
                        size={17}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-medium">
                        Storage
                      </span>
                    </div>

                    <StatusBadge status="Connected" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck
                        size={17}
                        className="text-emerald-600"
                      />

                      <span className="text-sm font-medium">
                        Encryption
                      </span>
                    </div>

                    <StatusBadge status="Active" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <Activity
                        size={17}
                        className="text-blue-600"
                      />

                      <span className="text-sm font-medium">
                        Retrieval
                      </span>
                    </div>

                    <StatusBadge status="Connected" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "memories" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Memory Entries"
              description="Search, inspect, and manage stored agent memories."
              action={
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  Add Memory
                </button>
              }
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
                  placeholder="Search memories..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              >
                <option value="All">All types</option>
                <option value="User Preference">User Preference</option>
                <option value="Project Context">Project Context</option>
                <option value="Knowledge">Knowledge</option>
                <option value="Task Context">Task Context</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {filteredMemories.length > 0 ? (
                filteredMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                            {memory.type}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            {memory.layer}
                          </span>
                        </div>

                        <div className="mt-3 text-sm font-semibold">
                          {memory.title}
                        </div>

                        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                          {memory.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700">
                          {memory.confidence}% confidence
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setMemories((current) =>
                              current.filter(
                                (item) => item.id !== memory.id
                              )
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                      <span>Source: {memory.source}</span>
                      <span>Updated: {memory.updated}</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Validated
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
                  <Brain
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <div className="mt-3 text-sm font-semibold">
                    No memories found
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Try changing your search or filter.
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Memory Settings"
                description="Configure how memory is created and maintained."
              />

              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Automatic Memory Extraction",
                    key: "autoExtraction",
                    value: true,
                    description:
                      "Automatically identify useful facts from conversations.",
                  },
                  {
                    label: "Duplicate Detection",
                    key: "dedupe",
                    value: true,
                    description:
                      "Prevent similar memories from being stored multiple times.",
                  },
                  {
                    label: "Encryption",
                    key: "encryption",
                    value: settings.encryption,
                    description:
                      "Encrypt stored memory data at rest.",
                  },
                  {
                    label: "Retention Policy",
                    key: "retention",
                    value: settings.retention,
                    description:
                      "Automatically manage old and expired memories.",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {item.label}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </div>
                    </div>

                    <Toggle
                      enabled={item.value}
                      onChange={() =>
                        setSettings((current) => ({
                          ...current,
                          [item.key]:
                            !Boolean(current[item.key]),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Memory Limits"
                description="Control storage and context limits."
              />

              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Working Memory
                    </span>

                    <span className="text-sm font-semibold">
                      64 KB
                    </span>
                  </div>

                  <input
                    type="range"
                    min="16"
                    max="256"
                    defaultValue="64"
                    className="mt-3 w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Conversation History
                    </span>

                    <span className="text-sm font-semibold">
                      20 turns
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="100"
                    defaultValue="20"
                    className="mt-3 w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Long-Term Storage
                    </span>

                    <span className="text-sm font-semibold">
                      10 GB
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="50"
                    defaultValue="10"
                    className="mt-3 w-full accent-slate-900"
                  />
                </div>
              </div>
            </section>
          </section>
        )}

        {activeTab === "history" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Memory History"
              description="Recent memory creation and modification events."
            />

            <div className="mt-5 space-y-3">
              {[
                {
                  action: "Memory created",
                  title: "Preferred communication style",
                  time: "2 minutes ago",
                  color: "emerald",
                },
                {
                  action: "Memory updated",
                  title: "Current project context",
                  time: "18 minutes ago",
                  color: "blue",
                },
                {
                  action: "Knowledge indexed",
                  title: "Product Documentation",
                  time: "42 minutes ago",
                  color: "violet",
                },
                {
                  action: "Memory removed",
                  title: "Temporary research context",
                  time: "1 hour ago",
                  color: "red",
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <History size={16} />
                    </div>

                    <div>
                      <div className="text-sm font-medium">
                        {event.action}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {event.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 size={13} />
                    {event.time}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Add Memory
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add a persistent memory to the agent.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Memory title
                </label>

                <input
                  placeholder="Example: User prefers concise responses"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Memory content
                </label>

                <textarea
                  rows={4}
                  placeholder="Enter the information the agent should remember..."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                This memory will be stored in Long-Term Memory and may be
                retrieved in future agent sessions.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
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