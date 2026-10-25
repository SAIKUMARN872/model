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
  Database,
  FileText,
  Globe,
  Layers,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Upload,
  X,
  Zap,
} from "lucide-react";

type SourceType =
  | "Document"
  | "Website"
  | "Database"
  | "API";

type SourceStatus =
  | "Connected"
  | "Indexing"
  | "Error";

type KnowledgeSource = {
  id: number;
  name: string;
  type: SourceType;
  status: SourceStatus;
  chunks: number;
  updated: string;
  size: string;
};

const initialSources: KnowledgeSource[] = [
  {
    id: 1,
    name: "Product Documentation",
    type: "Document",
    status: "Connected",
    chunks: 1248,
    updated: "Today",
    size: "18.4 MB",
  },
  {
    id: 2,
    name: "Company Website",
    type: "Website",
    status: "Connected",
    chunks: 864,
    updated: "Today",
    size: "9.7 MB",
  },
  {
    id: 3,
    name: "Customer Knowledge Base",
    type: "Database",
    status: "Indexing",
    chunks: 2431,
    updated: "Yesterday",
    size: "42.1 MB",
  },
  {
    id: 4,
    name: "Internal API Knowledge",
    type: "API",
    status: "Connected",
    chunks: 672,
    updated: "2 days ago",
    size: "6.2 MB",
  },
];

export default function RAGPage() {
  const [sources, setSources] =
    useState<KnowledgeSource[]>(initialSources);

  const [search, setSearch] = useState("");

  const [showAddSource, setShowAddSource] =
    useState(false);

  const [retrievalMode, setRetrievalMode] =
    useState("Hybrid");

  const [topK, setTopK] = useState(8);

  const [similarityThreshold, setSimilarityThreshold] =
    useState(0.72);

  const [reranking, setReranking] =
    useState(true);

  const [queryExpansion, setQueryExpansion] =
    useState(true);

  const [selectedSource, setSelectedSource] =
    useState<KnowledgeSource | null>(null);

  const [sourceName, setSourceName] =
    useState("");

  const [sourceType, setSourceType] =
    useState<SourceType>("Document");

  const filteredSources = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return sources;
    }

    return sources.filter((source) =>
      `${source.name} ${source.type} ${source.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [sources, search]);

  const totalChunks = sources.reduce(
    (sum, source) => sum + source.chunks,
    0
  );

  const connectedSources = sources.filter(
    (source) => source.status === "Connected"
  ).length;

  const addSource = () => {
    if (!sourceName.trim()) {
      return;
    }

    const nextId =
      sources.length === 0
        ? 1
        : Math.max(
            ...sources.map((source) => source.id)
          ) + 1;

    const newSource: KnowledgeSource = {
      id: nextId,
      name: sourceName.trim(),
      type: sourceType,
      status: "Indexing",
      chunks: 0,
      updated: "Just now",
      size: "Processing",
    };

    setSources((current) => [
      newSource,
      ...current,
    ]);

    setSourceName("");
    setSourceType("Document");
    setShowAddSource(false);
  };

  const deleteSource = (id: number) => {
    setSources((current) =>
      current.filter((source) => source.id !== id)
    );

    setSelectedSource(null);
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
                  RAG
                </h1>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                  Knowledge Retrieval
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Retrieval-Augmented Generation for agent knowledge.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddSource(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white hover:bg-gray-800"
          >
            <Plus size={14} />
            Add Knowledge Source
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Brain size={21} />
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                Retrieval-Augmented Generation
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Connect documents, websites, databases and APIs
                to your agent. RAG retrieves relevant knowledge
                before generating an answer.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard
                  title="Sources"
                  value={sources.length.toString()}
                  icon={<Database size={15} />}
                />

                <MetricCard
                  title="Connected"
                  value={connectedSources.toString()}
                  icon={<CheckCircle2 size={15} />}
                />

                <MetricCard
                  title="Total chunks"
                  value={totalChunks.toLocaleString()}
                  icon={<Layers size={15} />}
                />

                <MetricCard
                  title="Retrieval quality"
                  value="94%"
                  icon={<Activity size={15} />}
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Zap size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    RAG Engine
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Retrieval pipeline
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <PipelineRow
                  label="Query understanding"
                  status="Ready"
                />

                <PipelineRow
                  label="Hybrid retrieval"
                  status="Active"
                />

                <PipelineRow
                  label="Semantic reranking"
                  status={
                    reranking ? "Active" : "Disabled"
                  }
                />

                <PipelineRow
                  label="Context assembly"
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
                    Knowledge Sources
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Sources indexed by the RAG pipeline.
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {filteredSources.length} sources
                </span>
              </div>

              <div className="mt-5 flex items-center gap-3">
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
                    placeholder="Search knowledge sources..."
                    className="w-full bg-transparent py-3 text-xs outline-none"
                  />
                </div>

                <button
                  onClick={() => setShowAddSource(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                <div className="hidden grid-cols-[1fr_100px_100px_90px_90px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-400 md:grid">
                  <span>Source</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span>Chunks</span>
                  <span>Updated</span>
                </div>

                {filteredSources.map((source) => (
                  <SourceRow
                    key={source.id}
                    source={source}
                    onSelect={() =>
                      setSelectedSource(source)
                    }
                    onDelete={() =>
                      deleteSource(source.id)
                    }
                  />
                ))}

                {filteredSources.length === 0 && (
                  <div className="py-16 text-center">
                    <Search
                      size={24}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium">
                      No sources found
                    </p>
                  </div>
                )}
              </div>
            </section>

            {selectedSource && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <SourceIcon
                        type={selectedSource.type}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        {selectedSource.name}
                      </h2>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {selectedSource.type} ·{" "}
                        {selectedSource.updated}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedSource(null)
                    }
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <InfoCard
                    title="Status"
                    value={selectedSource.status}
                  />

                  <InfoCard
                    title="Chunks"
                    value={selectedSource.chunks.toLocaleString()}
                  />

                  <InfoCard
                    title="Size"
                    value={selectedSource.size}
                  />

                  <InfoCard
                    title="Updated"
                    value={selectedSource.updated}
                  />
                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />

                    <div>
                      <p className="text-xs font-semibold">
                        Source connected to RAG
                      </p>

                      <p className="mt-1 text-[10px] text-gray-500">
                        The source is available for retrieval
                        and context generation.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-semibold">
                Retrieval Pipeline
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Configure how the agent searches and prepares knowledge.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-5">
                <PipelineCard
                  number="01"
                  title="Query"
                  text="Understand user request"
                  icon={<Search size={16} />}
                />

                <PipelineCard
                  number="02"
                  title="Retrieve"
                  text="Search knowledge"
                  icon={<Database size={16} />}
                />

                <PipelineCard
                  number="03"
                  title="Rerank"
                  text="Score relevant chunks"
                  icon={<Activity size={16} />}
                />

                <PipelineCard
                  number="04"
                  title="Context"
                  text="Build context window"
                  icon={<Layers size={16} />}
                />

                <PipelineCard
                  number="05"
                  title="Generate"
                  text="Produce grounded answer"
                  icon={<Brain size={16} />}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Target size={17} />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    RAG Capabilities
                  </h2>

                  <p className="text-xs text-gray-500">
                    Retrieval features available to the agent.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <Capability
                  title="Hybrid Search"
                  value="Active"
                  text="Combines semantic and keyword retrieval."
                />

                <Capability
                  title="Reranking"
                  value={reranking ? "Active" : "Disabled"}
                  text="Ranks retrieved chunks by relevance."
                />

                <Capability
                  title="Query Expansion"
                  value={
                    queryExpansion ? "Active" : "Disabled"
                  }
                  text="Creates additional search variations."
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 size={16} />

                <h2 className="text-sm font-semibold">
                  Retrieval Settings
                </h2>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Retrieval mode
                  </label>

                  <select
                    value={retrievalMode}
                    onChange={(event) =>
                      setRetrievalMode(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="Hybrid">
                      Hybrid
                    </option>

                    <option value="Semantic">
                      Semantic
                    </option>

                    <option value="Keyword">
                      Keyword
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Top K
                    </label>

                    <span className="text-xs font-semibold">
                      {topK}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={topK}
                    onChange={(event) =>
                      setTopK(Number(event.target.value))
                    }
                    className="mt-3 w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Similarity threshold
                    </label>

                    <span className="text-xs font-semibold">
                      {similarityThreshold.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.4"
                    max="1"
                    step="0.01"
                    value={similarityThreshold}
                    onChange={(event) =>
                      setSimilarityThreshold(
                        Number(event.target.value)
                      )
                    }
                    className="mt-3 w-full"
                  />
                </div>

                <Toggle
                  label="Reranking"
                  enabled={reranking}
                  onToggle={() =>
                    setReranking(!reranking)
                  }
                />

                <Toggle
                  label="Query expansion"
                  enabled={queryExpansion}
                  onToggle={() =>
                    setQueryExpansion(!queryExpansion)
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Upload size={16} />

                <h2 className="text-sm font-semibold">
                  Indexing
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Chunk size"
                  value="800 tokens"
                />

                <InfoRow
                  label="Chunk overlap"
                  value="120 tokens"
                />

                <InfoRow
                  label="Embedding"
                  value="Active"
                />

                <InfoRow
                  label="Vector store"
                  value="Connected"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Activity size={16} />

                <h2 className="text-sm font-semibold">
                  RAG Performance
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <ProgressRow
                  label="Retrieval relevance"
                  value={94}
                />

                <ProgressRow
                  label="Grounded responses"
                  value={96}
                />

                <ProgressRow
                  label="Context efficiency"
                  value={89}
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
                  Knowledge Security
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <SecurityRow label="Source access control" />
                <SecurityRow label="Data isolation" />
                <SecurityRow label="Sensitive data filtering" />
                <SecurityRow label="Audit logging" />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">
                Related Knowledge
              </h2>

              <div className="mt-4 space-y-2">
                <RelatedLink
                  href="/agent-builder/knowledge/documents"
                  label="Documents"
                  icon={<FileText size={14} />}
                />

                <RelatedLink
                  href="/agent-builder/knowledge/context-management"
                  label="Context Management"
                  icon={<Brain size={14} />}
                />

                <RelatedLink
                  href="/agent-builder/knowledge/long-term-memory"
                  label="Long-Term Memory"
                  icon={<Database size={14} />}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showAddSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Knowledge Source
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Connect a source to the RAG pipeline.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAddSource(false)
                }
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Source name
                </label>

                <input
                  value={sourceName}
                  onChange={(event) =>
                    setSourceName(event.target.value)
                  }
                  placeholder="Example: Product Documentation"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Source type
                </label>

                <select
                  value={sourceType}
                  onChange={(event) =>
                    setSourceType(
                      event.target.value as SourceType
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none"
                >
                  <option value="Document">
                    Document
                  </option>

                  <option value="Website">
                    Website
                  </option>

                  <option value="Database">
                    Database
                  </option>

                  <option value="API">
                    API
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowAddSource(false)
                }
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                onClick={addSource}
                disabled={sourceName.trim() === ""}
                className="rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white disabled:opacity-40"
              >
                Connect Source
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

function PipelineRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">
        {label}
      </span>

      <span className="flex items-center gap-2 text-[10px] text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        {status}
      </span>
    </div>
  );
}

function SourceRow({
  source,
  onSelect,
  onDelete,
}: {
  source: KnowledgeSource;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-b border-gray-100 p-4 last:border-0 hover:bg-gray-50">
      <div className="grid gap-4 md:grid-cols-[1fr_100px_100px_90px_90px] md:items-center">
        <button
          onClick={onSelect}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <SourceIcon type={source.type} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {source.name}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              {source.size}
            </p>
          </div>
        </button>

        <span className="text-xs text-gray-500">
          {source.type}
        </span>

        <span
          className={`flex items-center gap-1 text-[10px] font-medium ${
            source.status === "Connected"
              ? "text-green-600"
              : source.status === "Indexing"
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {source.status}
        </span>

        <span className="text-xs font-semibold">
          {source.chunks.toLocaleString()}
        </span>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-gray-400">
            {source.updated}
          </span>

          <button
            onClick={onDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceIcon({
  type,
}: {
  type: SourceType;
}) {
  if (type === "Website") {
    return <Globe size={17} />;
  }

  if (type === "Database") {
    return <Database size={17} />;
  }

  if (type === "API") {
    return <Zap size={17} />;
  }

  return <FileText size={17} />;
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

function PipelineCard({
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

      <p className="mt-1 text-[10px] leading-4 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function Capability({
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

        <span className="text-[10px] font-semibold text-green-600">
          {value}
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-5 text-gray-500">
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

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
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