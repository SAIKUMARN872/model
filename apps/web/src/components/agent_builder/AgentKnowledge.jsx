"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  FolderOpen,
  Globe,
  Layers,
  Link2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Upload,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const knowledgeSources = [
  {
    id: "documents",
    name: "Documents",
    description: "PDFs, DOCX, TXT and other uploaded files.",
    count: 248,
    status: "Connected",
    icon: FileText,
  },
  {
    id: "websites",
    name: "Websites",
    description: "Web pages and website content used for retrieval.",
    count: 84,
    status: "Connected",
    icon: Globe,
  },
  {
    id: "database",
    name: "Database",
    description: "Structured information from connected databases.",
    count: 12,
    status: "Connected",
    icon: Database,
  },
  {
    id: "api",
    name: "API Sources",
    description: "External services providing live knowledge.",
    count: 9,
    status: "Connected",
    icon: Link2,
  },
];

const knowledgeBases = [
  {
    id: "kb-1",
    name: "Product Documentation",
    description: "Product features, guides, FAQs and internal documentation.",
    documents: 128,
    chunks: "18.4K",
    status: "Healthy",
    updated: "Today, 10:42 AM",
  },
  {
    id: "kb-2",
    name: "Company Knowledge",
    description: "Policies, procedures, employee and organizational knowledge.",
    documents: 86,
    chunks: "12.7K",
    status: "Healthy",
    updated: "Today, 09:18 AM",
  },
  {
    id: "kb-3",
    name: "Customer Support",
    description: "Support tickets, troubleshooting guides and resolutions.",
    documents: 214,
    chunks: "34.2K",
    status: "Syncing",
    updated: "Running",
  },
];

const retrievalModes = [
  {
    id: "hybrid",
    name: "Hybrid Search",
    description: "Combines semantic and keyword retrieval.",
  },
  {
    id: "semantic",
    name: "Semantic Search",
    description: "Uses vector similarity to find relevant knowledge.",
  },
  {
    id: "keyword",
    name: "Keyword Search",
    description: "Matches exact terms and phrases.",
  },
];

const memoryOptions = [
  {
    id: "conversation",
    title: "Conversation Memory",
    description: "Use recent conversation history while answering.",
  },
  {
    id: "working",
    title: "Working Memory",
    description: "Keep temporary task information during execution.",
  },
  {
    id: "longTerm",
    title: "Long-Term Memory",
    description: "Persist useful information across sessions.",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Syncing: "border-blue-200 bg-blue-50 text-blue-700",
    Error: "border-red-200 bg-red-50 text-red-700",
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

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action}
    </div>
  );
}

export default function AgentKnowledge() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("documents");
  const [selectedMode, setSelectedMode] = useState("hybrid");
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] =
    useState("kb-1");

  const [memory, setMemory] = useState({
    conversation: true,
    working: true,
    longTerm: false,
  });

  const [autoSync, setAutoSync] = useState(true);
  const [reranking, setReranking] = useState(true);
  const [citations, setCitations] = useState(true);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filteredKnowledgeBases = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return knowledgeBases;
    }

    return knowledgeBases.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [search]);

  const selectedSourceData = useMemo(() => {
    return (
      knowledgeSources.find((item) => item.id === selectedSource) ||
      knowledgeSources[0]
    );
  }, [selectedSource]);

  const selectedKnowledgeData = useMemo(() => {
    return (
      knowledgeBases.find(
        (item) => item.id === selectedKnowledgeBase
      ) || knowledgeBases[0]
    );
  }, [selectedKnowledgeBase]);

  const selectedRetrievalMode = useMemo(() => {
    return (
      retrievalModes.find((item) => item.id === selectedMode) ||
      retrievalModes[0]
    );
  }, [selectedMode]);

  const simulateUpload = () => {
    setUploading(true);

    setTimeout(() => {
      setUploading(false);
    }, 1500);
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
                <BookOpen size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Agent Knowledge
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Connect knowledge sources, manage RAG, and configure agent
                  memory.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={simulateUpload}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {uploading ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Upload size={15} />
                )}

                {uploading ? "Indexing..." : "Add Knowledge"}
              </button>

              <a
                href="/agent-builder/knowledge/rag"
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                RAG Settings
                <span className="text-sm">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Knowledge sources"
            value="353"
            detail="Across documents and services"
            icon={Database}
          />

          <MetricCard
            label="Indexed chunks"
            value="65.3K"
            detail="Ready for retrieval"
            icon={Layers}
          />

          <MetricCard
            label="Retrieval accuracy"
            value="94.2%"
            detail="+5.1% after reranking"
            icon={Target}
          />

          <MetricCard
            label="Grounded responses"
            value="91%"
            detail="Production evaluation"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Knowledge health"
            value="Healthy"
            detail="All primary sources connected"
            icon={Activity}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "sources", "knowledge-bases", "memory", "settings"].map(
            (tab) => (
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
            )
          )}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Knowledge Retrieval"
                  description="Configure how the agent finds relevant information."
                  action={
                    <StatusBadge status="Healthy" />
                  }
                />

                <div className="relative mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowModeMenu((value) => !value)
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-semibold">
                        {selectedRetrievalMode.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {selectedRetrievalMode.description}
                      </div>
                    </div>

                    <ChevronDown
                      size={17}
                      className="text-slate-400"
                    />
                  </button>

                  {showModeMenu && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {retrievalModes.map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setSelectedMode(mode.id);
                            setShowModeMenu(false);
                          }}
                          className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-50"
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {mode.name}
                            </div>

                            <div className="text-xs text-slate-500">
                              {mode.description}
                            </div>
                          </div>

                          {selectedMode === mode.id && (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-600"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-[11px] text-slate-400">
                      Top K
                    </div>

                    <div className="mt-1 text-xl font-semibold">
                      8
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Retrieved chunks
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-[11px] text-slate-400">
                      Similarity
                    </div>

                    <div className="mt-1 text-xl font-semibold">
                      0.82
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Minimum threshold
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-[11px] text-slate-400">
                      Reranking
                    </div>

                    <div className="mt-1 text-xl font-semibold">
                      {reranking ? "On" : "Off"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Result optimization
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw
                        size={17}
                        className="text-slate-700"
                      />

                      <div>
                        <div className="text-sm font-medium">
                          Automatic Indexing
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Automatically update indexes when data changes.
                        </div>
                      </div>
                    </div>

                    <Toggle
                      enabled={autoSync}
                      onChange={() =>
                        setAutoSync((value) => !value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <Zap size={17} className="text-slate-700" />

                      <div>
                        <div className="text-sm font-medium">
                          Reranking
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Reorder retrieved chunks using a reranker model.
                        </div>
                      </div>
                    </div>

                    <Toggle
                      enabled={reranking}
                      onChange={() =>
                        setReranking((value) => !value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <FileText
                        size={17}
                        className="text-slate-700"
                      />

                      <div>
                        <div className="text-sm font-medium">
                          Source Citations
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Include document references in agent responses.
                        </div>
                      </div>
                    </div>

                    <Toggle
                      enabled={citations}
                      onChange={() =>
                        setCitations((value) => !value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Selected Knowledge Base"
                  description="The primary knowledge store used by the agent."
                />

                <div className="mt-5 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <BookOpen size={18} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          {selectedKnowledgeData.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {selectedKnowledgeData.description}
                        </div>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        selectedKnowledgeData.status === "Healthy"
                          ? "Healthy"
                          : "Syncing"
                      }
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Documents
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {selectedKnowledgeData.documents}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Chunks
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {selectedKnowledgeData.chunks}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Updated
                      </div>

                      <div className="mt-1 truncate text-xs font-semibold">
                        {selectedKnowledgeData.updated}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-600"
                    />

                    <span className="text-sm font-semibold">
                      Knowledge protection
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Access control</span>
                      <span className="text-emerald-600">
                        Enabled
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Source validation</span>
                      <span className="text-emerald-600">
                        Enabled
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>PII filtering</span>
                      <span className="text-emerald-600">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Knowledge Sources"
                description="Connected sources available to the agent."
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab("sources")}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Sources
                    <ArrowRight size={14} />
                  </button>
                }
              />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {knowledgeSources.map((source) => {
                  const Icon = source.icon;
                  const selected = source.id === selectedSource;

                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setSelectedSource(source.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Icon size={17} />
                        </div>

                        {selected && (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-600"
                          />
                        )}
                      </div>

                      <div className="mt-3 text-sm font-semibold">
                        {source.name}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {source.description}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {source.count}
                        </span>

                        <StatusBadge status={source.status} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === "sources" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Knowledge Sources"
              description="Connect and manage the external sources used by your agent."
              action={
                <button
                  type="button"
                  onClick={simulateUpload}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  {uploading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Add Source
                </button>
              }
            />

            <div className="mt-5 space-y-3">
              {knowledgeSources.map((source) => {
                const Icon = source.icon;

                return (
                  <div
                    key={source.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Icon size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          {source.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {source.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {source.count}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          sources
                        </div>
                      </div>

                      <StatusBadge status={source.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "knowledge-bases" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Knowledge Bases"
              description="Organize documents and indexed knowledge into reusable stores."
              action={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  Create Knowledge Base
                </button>
              }
            />

            <div className="relative mt-5">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search knowledge bases..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredKnowledgeBases.map((knowledgeBase) => (
                <button
                  key={knowledgeBase.id}
                  type="button"
                  onClick={() =>
                    setSelectedKnowledgeBase(knowledgeBase.id)
                  }
                  className={`rounded-xl border p-4 text-left ${
                    selectedKnowledgeBase === knowledgeBase.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <FolderOpen size={18} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          {knowledgeBase.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {knowledgeBase.description}
                        </div>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        knowledgeBase.status === "Healthy"
                          ? "Healthy"
                          : "Syncing"
                      }
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Documents
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {knowledgeBase.documents}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Chunks
                      </div>

                      <div className="mt-1 text-sm font-semibold">
                        {knowledgeBase.chunks}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[10px] text-slate-400">
                        Updated
                      </div>

                      <div className="mt-1 truncate text-xs font-semibold">
                        {knowledgeBase.updated}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === "memory" && (
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Agent Memory"
                description="Control which memory layers are available to the agent."
              />

              <div className="mt-5 space-y-3">
                {memoryOptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <Brain size={16} />
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {item.title}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <Toggle
                      enabled={Boolean(memory[item.id])}
                      onChange={() =>
                        setMemory((current) => ({
                          ...current,
                          [item.id]: !current[item.id],
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Memory Health"
                description="Current state of the memory system."
              />

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600"
                    />
                    <span className="text-sm font-semibold">
                      Memory service healthy
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Conversation memory</span>
                      <span className="text-emerald-600">
                        {memory.conversation ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Working memory</span>
                      <span className="text-emerald-600">
                        {memory.working ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Long-term memory</span>
                      <span className="text-emerald-600">
                        {memory.longTerm ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-slate-700" />
                    <span className="text-sm font-semibold">
                      Retrieval usage
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[68%] rounded-full bg-slate-900" />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                    <span>68% utilized</span>
                    <span>2.4 GB</span>
                  </div>
                </div>
              </div>
            </section>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Retrieval Settings"
                description="Fine-tune how knowledge is retrieved."
              />

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Top K Results
                    </span>
                    <span className="text-sm font-semibold">8</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="20"
                    defaultValue="8"
                    className="mt-3 w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Similarity Threshold
                    </span>
                    <span className="text-sm font-semibold">0.82</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="0.82"
                    className="mt-3 w-full accent-slate-900"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Knowledge Security"
                description="Protect connected knowledge and retrieved content."
              />

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={17} />
                    <span className="text-sm font-medium">
                      Source validation
                    </span>
                  </div>

                  <StatusBadge status="Healthy" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Database size={17} />
                    <span className="text-sm font-medium">
                      Data isolation
                    </span>
                  </div>

                  <StatusBadge status="Healthy" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Zap size={17} />
                    <span className="text-sm font-medium">
                      PII filtering
                    </span>
                  </div>

                  <StatusBadge status="Healthy" />
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}