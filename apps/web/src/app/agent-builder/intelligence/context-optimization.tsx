"use client";

import { useState } from "react";
import {
  Brain,
  Database,
  FileText,
  Globe,
  MessageSquare,
  Search,
  Sparkles,
  Zap,
  Settings2,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  Activity,
} from "lucide-react";

type ContextSource = {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
  priority: string;
};

type OptimizationRule = {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
};

export default function ContextOptimizationPage() {
  const [contextWindow, setContextWindow] = useState(32768);
  const [maxRetrievedChunks, setMaxRetrievedChunks] = useState(8);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.72);
  const [compression, setCompression] = useState(true);
  const [reranking, setReranking] = useState(true);
  const [deduplication, setDeduplication] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [queryExpansion, setQueryExpansion] = useState(false);

  const [sources, setSources] = useState<ContextSource[]>([
    {
      id: 1,
      name: "Conversation History",
      type: "Conversation",
      enabled: true,
      priority: "High",
    },
    {
      id: 2,
      name: "Knowledge Base",
      type: "RAG",
      enabled: true,
      priority: "High",
    },
    {
      id: 3,
      name: "User Profile",
      type: "Memory",
      enabled: true,
      priority: "Medium",
    },
    {
      id: 4,
      name: "Uploaded Documents",
      type: "Documents",
      enabled: false,
      priority: "Medium",
    },
  ]);

  const [rules, setRules] = useState<OptimizationRule[]>([
    {
      id: 1,
      name: "Remove Duplicate Context",
      description:
        "Remove repeated information before sending context to the model.",
      enabled: true,
    },
    {
      id: 2,
      name: "Prioritize Relevant Information",
      description:
        "Rank context based on relevance to the current user request.",
      enabled: true,
    },
    {
      id: 3,
      name: "Compress Long Context",
      description:
        "Summarize low-priority information when the context becomes large.",
      enabled: true,
    },
    {
      id: 4,
      name: "Preserve Critical Instructions",
      description:
        "Keep system instructions and important constraints intact.",
      enabled: true,
    },
  ]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSource = (id: number) => {
    setSources((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const deleteSource = (id: number) => {
    setSources((items) => items.filter((item) => item.id !== id));
  };

  const toggleRule = (id: number) => {
    setRules((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const enabledSources = sources.filter((source) => source.enabled).length;
  const enabledRules = rules.filter((rule) => rule.enabled).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <Brain size={23} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  Context Optimization
                </h1>

                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Optimize the context sent to your AI agent for better quality,
                lower latency and lower token cost.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle2 size={16} />
                Configuration saved
              </span>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <CheckCircle2 size={16} />
              Save Configuration
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview metrics */}
        <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Database size={18} />}
            title="Context Window"
            value="32K"
            description="Maximum tokens"
          />

          <MetricCard
            icon={<Search size={18} />}
            title="Retrieved Context"
            value={`${maxRetrievedChunks}`}
            description="Chunks per request"
          />

          <MetricCard
            icon={<Zap size={18} />}
            title="Optimization"
            value={autoOptimize ? "Active" : "Manual"}
            description="Optimization mode"
          />

          <MetricCard
            icon={<Sparkles size={18} />}
            title="Active Sources"
            value={`${enabledSources}`}
            description="Context sources"
          />
        </section>

        <div className="grid gap-7 xl:grid-cols-[1fr_380px]">
          {/* Main */}
          <div className="space-y-7">
            {/* Context pipeline */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold">Context Pipeline</h2>
                    <p className="text-sm text-gray-500">
                      Information is processed before it reaches the model.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <PipelineStep
                  number="01"
                  icon={<MessageSquare size={18} />}
                  title="Collect"
                  description="Gather context"
                />

                <PipelineArrow />

                <PipelineStep
                  number="02"
                  icon={<Search size={18} />}
                  title="Retrieve"
                  description="Find relevant data"
                />

                <PipelineArrow />

                <PipelineStep
                  number="03"
                  icon={<SlidersHorizontal size={18} />}
                  title="Optimize"
                  description="Rank & compress"
                />

                <PipelineArrow />

                <PipelineStep
                  number="04"
                  icon={<Brain size={18} />}
                  title="Reason"
                  description="Prepare model input"
                />

                <PipelineArrow />

                <PipelineStep
                  number="05"
                  icon={<Zap size={18} />}
                  title="Generate"
                  description="Produce response"
                />
              </div>
            </section>

            {/* Context sources */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Context Sources</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose which information can be included in the agent
                    context.
                  </p>
                </div>

                <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50">
                  <Plus size={14} />
                  Add Source
                </button>
              </div>

              <div className="space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                      {source.type === "Conversation" && (
                        <MessageSquare size={18} />
                      )}

                      {source.type === "RAG" && <Database size={18} />}

                      {source.type === "Memory" && <Brain size={18} />}

                      {source.type === "Documents" && <FileText size={18} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {source.name}
                        </h3>

                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {source.type}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Priority: {source.priority}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSource(source.id)}
                      className={`relative h-6 w-11 shrink-0 rounded-full ${
                        source.enabled ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          source.enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => deleteSource(source.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Optimization rules */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Settings2 size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold">Optimization Rules</h2>
                    <p className="text-sm text-gray-500">
                      Automatically control the quality and size of context.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {rule.enabled ? (
                          <CheckCircle2
                            size={18}
                            className="text-green-500"
                          />
                        ) : (
                          <AlertCircle
                            size={18}
                            className="text-gray-300"
                          />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium">{rule.name}</p>

                        <p className="mt-1 max-w-[650px] text-xs leading-5 text-gray-500">
                          {rule.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative h-6 w-11 rounded-full ${
                        rule.enabled ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white ${
                          rule.enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Advanced controls */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <SlidersHorizontal size={19} />
                  </div>

                  <div className="text-left">
                    <h2 className="font-semibold">
                      Advanced Optimization
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Fine-tune retrieval, compression and context behavior.
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvanced && (
                <div className="mt-6 space-y-6 border-t border-gray-100 pt-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Context Window
                      </label>

                      <select
                        value={contextWindow}
                        onChange={(e) =>
                          setContextWindow(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none"
                      >
                        <option value={8192}>8K tokens</option>
                        <option value={16384}>16K tokens</option>
                        <option value={32768}>32K tokens</option>
                        <option value={65536}>64K tokens</option>
                        <option value={131072}>128K tokens</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Maximum Retrieved Chunks
                      </label>

                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={maxRetrievedChunks}
                        onChange={(e) =>
                          setMaxRetrievedChunks(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between">
                      <label className="text-sm font-medium">
                        Similarity Threshold
                      </label>

                      <span className="text-sm font-semibold">
                        {similarityThreshold.toFixed(2)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={similarityThreshold}
                      onChange={(e) =>
                        setSimilarityThreshold(Number(e.target.value))
                      }
                      className="w-full accent-black"
                    />

                    <div className="mt-1 flex justify-between text-xs text-gray-400">
                      <span>Broad retrieval</span>
                      <span>Highly relevant</span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <ToggleRow
                      title="Context Compression"
                      description="Compress long context before inference."
                      enabled={compression}
                      onToggle={() => setCompression(!compression)}
                    />

                    <ToggleRow
                      title="Semantic Reranking"
                      description="Re-rank retrieved results by relevance."
                      enabled={reranking}
                      onToggle={() => setReranking(!reranking)}
                    />

                    <ToggleRow
                      title="Deduplication"
                      description="Remove repeated context fragments."
                      enabled={deduplication}
                      onToggle={() => setDeduplication(!deduplication)}
                    />

                    <ToggleRow
                      title="Query Expansion"
                      description="Generate related search queries."
                      enabled={queryExpansion}
                      onToggle={() =>
                        setQueryExpansion(!queryExpansion)
                      }
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right */}
          <aside className="space-y-7">
            {/* Optimization mode */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Optimization Mode</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Control how context is optimized.
                  </p>
                </div>

                <Sparkles size={18} className="text-purple-500" />
              </div>

              <div className="space-y-3">
                <ModeCard
                  active={autoOptimize}
                  title="Automatic"
                  description="Model automatically selects the best context strategy."
                  onClick={() => setAutoOptimize(true)}
                />

                <ModeCard
                  active={!autoOptimize}
                  title="Manual"
                  description="Use your configured retrieval and optimization rules."
                  onClick={() => setAutoOptimize(false)}
                />
              </div>
            </section>

            {/* Context budget */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">Context Budget</h2>

              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold">
                    {contextWindow.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    maximum tokens
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  Optimized
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-[64%] rounded-full bg-black" />
              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-400">
                <span>20.5K used</span>
                <span>{contextWindow.toLocaleString()} max</span>
              </div>
            </section>

            {/* Token savings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Zap size={17} />
                </div>

                <div>
                  <h2 className="font-semibold">Optimization Impact</h2>
                  <p className="text-xs text-gray-500">
                    Estimated runtime benefits
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ImpactCard value="32%" label="Token Reduction" />
                <ImpactCard value="18%" label="Lower Cost" />
                <ImpactCard value="24%" label="Faster Context" />
                <ImpactCard value="91%" label="Relevance" />
              </div>
            </section>

            {/* Active settings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">Active Configuration</h2>

              <div className="space-y-3">
                <SettingRow
                  label="Sources"
                  value={`${enabledSources} active`}
                />

                <SettingRow
                  label="Optimization Rules"
                  value={`${enabledRules} active`}
                />

                <SettingRow
                  label="Compression"
                  value={compression ? "Enabled" : "Disabled"}
                />

                <SettingRow
                  label="Reranking"
                  value={reranking ? "Enabled" : "Disabled"}
                />

                <SettingRow
                  label="Deduplication"
                  value={deduplication ? "Enabled" : "Disabled"}
                />

                <SettingRow
                  label="Query Expansion"
                  value={queryExpansion ? "Enabled" : "Disabled"}
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
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </div>

        <Activity size={16} className="text-gray-300" />
      </div>

      <p className="text-xs font-medium text-gray-500">{title}</p>

      <p className="mt-1 text-2xl font-semibold">{value}</p>

      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function PipelineStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400">
          {number}
        </span>

        <div className="text-gray-600">{icon}</div>
      </div>

      <p className="text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <div className="h-px w-full border-t border-dashed border-gray-300" />
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>

      <button
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          enabled ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ModeCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition ${
        active
          ? "border-black bg-gray-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
            active ? "border-black bg-black" : "border-gray-300"
          }`}
        />

        <div>
          <p className="text-sm font-semibold">{title}</p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function ImpactCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xl font-semibold">{value}</p>

      <p className="mt-1 text-[11px] leading-4 text-gray-500">{label}</p>
    </div>
  );
}

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">{label}</span>

      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  );
}