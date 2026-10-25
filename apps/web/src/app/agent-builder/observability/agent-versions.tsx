"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GitBranch,
  History,
  MoreHorizontal,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Tag,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";

type VersionStatus = "Production" | "Draft" | "Archived";

type AgentVersion = {
  id: string;
  version: string;
  status: VersionStatus;
  createdAt: string;
  createdBy: string;
  model: string;
  description: string;
  successRate: number;
  latency: number;
  cost: number;
  runs: number;
  prompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  changes: string[];
};

const initialVersions: AgentVersion[] = [
  {
    id: "v12",
    version: "v1.2.0",
    status: "Production",
    createdAt: "Sep 19, 2026",
    createdBy: "Pujitha",
    model: "GPT-5.6",
    description: "Improved reasoning and response quality for production workflows.",
    successRate: 98.4,
    latency: 1.42,
    cost: 0.018,
    runs: 12480,
    prompt: "You are an enterprise AI agent. Complete the user's task accurately and safely.",
    temperature: 0.2,
    maxTokens: 4096,
    tools: ["Knowledge Search", "REST API", "Browser Automation"],
    changes: [
      "Improved reasoning instructions",
      "Added browser automation fallback",
      "Reduced unnecessary tool calls",
    ],
  },
  {
    id: "v11",
    version: "v1.1.0",
    status: "Archived",
    createdAt: "Sep 12, 2026",
    createdBy: "Pujitha",
    model: "GPT-5.6",
    description: "Added knowledge retrieval and improved tool execution.",
    successRate: 96.9,
    latency: 1.67,
    cost: 0.021,
    runs: 8420,
    prompt: "You are an AI assistant with access to enterprise knowledge.",
    temperature: 0.25,
    maxTokens: 4096,
    tools: ["Knowledge Search", "REST API"],
    changes: [
      "Added RAG integration",
      "Improved tool routing",
      "Added retry handling",
    ],
  },
  {
    id: "v10",
    version: "v1.0.0",
    status: "Archived",
    createdAt: "Sep 04, 2026",
    createdBy: "Pujitha",
    model: "GPT-5.6",
    description: "Initial production release of the enterprise agent.",
    successRate: 94.8,
    latency: 1.91,
    cost: 0.025,
    runs: 5120,
    prompt: "You are a helpful enterprise AI assistant.",
    temperature: 0.3,
    maxTokens: 4096,
    tools: ["REST API"],
    changes: [
      "Initial production agent",
      "Added API tool",
      "Added basic safety policies",
    ],
  },
  {
    id: "v09",
    version: "v0.9.0",
    status: "Archived",
    createdAt: "Aug 28, 2026",
    createdBy: "Pujitha",
    model: "GPT-5.6",
    description: "Beta version used for internal testing.",
    successRate: 91.7,
    latency: 2.14,
    cost: 0.029,
    runs: 2380,
    prompt: "You are an AI assistant helping users complete tasks.",
    temperature: 0.35,
    maxTokens: 3072,
    tools: ["REST API"],
    changes: [
      "Initial workflow testing",
      "Added evaluation traces",
      "Added basic metrics",
    ],
  },
];

export default function AgentVersionsPage() {
  const [versions, setVersions] = useState<AgentVersion[]>(initialVersions);
  const [selectedId, setSelectedId] = useState("v12");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | VersionStatus>("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);

  const [newDescription, setNewDescription] = useState("");
  const [newModel, setNewModel] = useState("GPT-5.6");
  const [newTemperature, setNewTemperature] = useState("0.2");

  const filteredVersions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return versions.filter((version) => {
      const matchesSearch =
        !query ||
        version.version.toLowerCase().includes(query) ||
        version.description.toLowerCase().includes(query) ||
        version.createdBy.toLowerCase().includes(query) ||
        version.model.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || version.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [versions, search, statusFilter]);

  const selectedVersion =
    versions.find((version) => version.id === selectedId) ?? versions[0];

  const productionVersion =
    versions.find((version) => version.status === "Production") ?? versions[0];

  const createVersion = () => {
    const latestNumber =
      Math.max(
        ...versions.map((version) => {
          const match = version.version.match(/v1\.(\d+)\.0/);
          return match ? Number(match[1]) : 0;
        }),
      ) + 1;

    const newVersion: AgentVersion = {
      id: `v${latestNumber}`,
      version: `v1.${latestNumber}.0`,
      status: "Draft",
      createdAt: "Sep 20, 2026",
      createdBy: "Pujitha",
      model: newModel,
      description:
        newDescription.trim() ||
        "New agent version created from the current production configuration.",
      successRate: 0,
      latency: 0,
      cost: 0,
      runs: 0,
      prompt:
        "You are an enterprise AI agent. Complete the user's task accurately and safely.",
      temperature: Number(newTemperature) || 0.2,
      maxTokens: 4096,
      tools: ["Knowledge Search", "REST API"],
      changes: [
        "Created from current configuration",
        "Ready for evaluation",
        "Not deployed to production",
      ],
    };

    setVersions((current) => [newVersion, ...current]);
    setSelectedId(newVersion.id);
    setShowCreate(false);
    setNewDescription("");
    setNewModel("GPT-5.6");
    setNewTemperature("0.2");
  };

  const deployVersion = (id: string) => {
    setVersions((current) =>
      current.map((version) => {
        if (version.id === id) {
          return {
            ...version,
            status: "Production",
          };
        }

        if (version.status === "Production") {
          return {
            ...version,
            status: "Archived",
          };
        }

        return version;
      }),
    );

    setSelectedId(id);
    setShowActions(null);
  };

  const archiveVersion = (id: string) => {
    setVersions((current) =>
      current.map((version) =>
        version.id === id
          ? {
              ...version,
              status: "Archived",
            }
          : version,
      ),
    );

    setShowActions(null);
  };

  const restoreVersion = (id: string) => {
    setVersions((current) =>
      current.map((version) =>
        version.id === id
          ? {
              ...version,
              status: "Draft",
            }
          : version,
      ),
    );

    setSelectedId(id);
    setShowActions(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/observability"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#f3f4f6]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span>Observability</span>
                <span>/</span>
                <span className="text-[#111827]">Agent Versions</span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.02em]">
                Agent Versions
              </h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track, compare, test, and manage every version of your agent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb]"
            >
              <History size={16} />
              Change history
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937]"
            >
              <GitBranch size={16} />
              Create version
            </button>
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[#6b7280]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Production
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-[22px] font-semibold">
                  {productionVersion.version}
                </h2>

                <StatusBadge status="Production" />
              </div>

              <p className="mt-1 text-sm text-[#6b7280]">
                {productionVersion.description}
              </p>
            </div>

            <div className="flex items-center gap-7">
              <DetailMetric
                label="Success rate"
                value={`${productionVersion.successRate}%`}
              />

              <DetailMetric
                label="Latency"
                value={`${productionVersion.latency}s`}
              />

              <DetailMetric
                label="Cost / run"
                value={`$${productionVersion.cost.toFixed(3)}`}
              />

              <DetailMetric
                label="Runs"
                value={productionVersion.runs.toLocaleString()}
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[390px_minmax(0,1fr)] gap-5">
          <section className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#eef0f3] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Version history</h2>

                <span className="rounded-full bg-[#f3f4f6] px-2 py-1 text-[11px] font-medium text-[#6b7280]">
                  {filteredVersions.length} versions
                </span>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search versions..."
                  className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-sm outline-none transition focus:border-[#c7ccd4] focus:bg-white"
                />
              </div>

              <div className="mt-3 flex gap-2">
                {(["All", "Production", "Draft", "Archived"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                        statusFilter === filter
                          ? "bg-[#111827] text-white"
                          : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
                      }`}
                    >
                      {filter}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="divide-y divide-[#f0f1f3]">
              {filteredVersions.map((version) => (
                <VersionRow
                  key={version.id}
                  version={version}
                  selected={selectedId === version.id}
                  menuOpen={showActions === version.id}
                  onClick={() => {
                    setSelectedId(version.id);
                    setShowActions(null);
                  }}
                  onMenu={() =>
                    setShowActions(
                      showActions === version.id ? null : version.id,
                    )
                  }
                  onDeploy={() => deployVersion(version.id)}
                  onArchive={() => archiveVersion(version.id)}
                  onRestore={() => restoreVersion(version.id)}
                />
              ))}

              {filteredVersions.length === 0 && (
                <div className="p-8 text-center text-sm text-[#6b7280]">
                  No versions found.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="flex items-start justify-between border-b border-[#eef0f3] p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-semibold">
                    {selectedVersion.version}
                  </h2>

                  <StatusBadge status={selectedVersion.status} />
                </div>

                <p className="mt-1 text-sm text-[#6b7280]">
                  {selectedVersion.description}
                </p>

                <div className="mt-3 flex items-center gap-4 text-xs text-[#9ca3af]">
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {selectedVersion.createdAt}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <UserRound size={13} />
                    {selectedVersion.createdBy}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <GitBranch size={13} />
                    {selectedVersion.model}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedVersion.status !== "Production" && (
                  <button
                    onClick={() => deployVersion(selectedVersion.id)}
                    className="flex h-9 items-center gap-2 rounded-lg bg-[#111827] px-3 text-xs font-medium text-white"
                  >
                    <Play size={14} />
                    Deploy
                  </button>
                )}

                <Link
                  href="/agent-builder/observability"
                  className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 text-xs font-medium text-[#374151]"
                >
                  Open traces
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 p-5">
              <MetricCard
                label="Success rate"
                value={
                  selectedVersion.successRate
                    ? `${selectedVersion.successRate}%`
                    : "—"
                }
                icon={<CheckCircle2 size={16} />}
              />

              <MetricCard
                label="Avg latency"
                value={
                  selectedVersion.latency
                    ? `${selectedVersion.latency}s`
                    : "—"
                }
                icon={<Clock3 size={16} />}
              />

              <MetricCard
                label="Cost / run"
                value={
                  selectedVersion.cost
                    ? `$${selectedVersion.cost.toFixed(3)}`
                    : "—"
                }
                icon={<Zap size={16} />}
              />

              <MetricCard
                label="Total runs"
                value={
                  selectedVersion.runs
                    ? selectedVersion.runs.toLocaleString()
                    : "—"
                }
                icon={<Activity size={16} />}
              />
            </div>

            <div className="grid grid-cols-2 gap-5 px-5 pb-5">
              <section className="rounded-xl border border-[#e5e7eb]">
                <div className="border-b border-[#eef0f3] px-4 py-3">
                  <h3 className="text-sm font-semibold">Configuration</h3>
                </div>

                <div className="space-y-4 p-4">
                  <InfoRow
                    label="Model"
                    value={selectedVersion.model}
                  />

                  <InfoRow
                    label="Temperature"
                    value={selectedVersion.temperature.toString()}
                  />

                  <InfoRow
                    label="Max tokens"
                    value={selectedVersion.maxTokens.toLocaleString()}
                  />

                  <div>
                    <p className="mb-2 text-xs font-medium text-[#6b7280]">
                      Tools
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-md bg-[#f3f4f6] px-2.5 py-1.5 text-xs font-medium text-[#374151]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#e5e7eb]">
                <div className="border-b border-[#eef0f3] px-4 py-3">
                  <h3 className="text-sm font-semibold">Version health</h3>
                </div>

                <div className="space-y-4 p-4">
                  <HealthRow
                    label="Production readiness"
                    value={
                      selectedVersion.status === "Production"
                        ? "Live"
                        : "Not deployed"
                    }
                    good={selectedVersion.status === "Production"}
                  />

                  <HealthRow
                    label="Success rate"
                    value={
                      selectedVersion.successRate
                        ? `${selectedVersion.successRate}%`
                        : "No data"
                    }
                    good={selectedVersion.successRate >= 95}
                  />

                  <HealthRow
                    label="Latency"
                    value={
                      selectedVersion.latency
                        ? `${selectedVersion.latency}s average`
                        : "No data"
                    }
                    good={
                      selectedVersion.latency > 0 &&
                      selectedVersion.latency <= 2
                    }
                  />

                  <HealthRow
                    label="Safety checks"
                    value="Passed"
                    good
                  />
                </div>
              </section>
            </div>

            <div className="grid grid-cols-2 gap-5 px-5 pb-5">
              <section className="rounded-xl border border-[#e5e7eb]">
                <div className="border-b border-[#eef0f3] px-4 py-3">
                  <h3 className="text-sm font-semibold">
                    Prompt configuration
                  </h3>
                </div>

                <div className="p-4">
                  <div className="rounded-lg border border-[#eef0f3] bg-[#fafafa] p-3">
                    <p className="text-xs leading-5 text-[#4b5563]">
                      {selectedVersion.prompt}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#e5e7eb]">
                <div className="border-b border-[#eef0f3] px-4 py-3">
                  <h3 className="text-sm font-semibold">Changes</h3>
                </div>

                <div className="space-y-3 p-4">
                  {selectedVersion.changes.map((change) => (
                    <div
                      key={change}
                      className="flex items-start gap-2 text-sm text-[#4b5563]"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="border-t border-[#eef0f3] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                  <ShieldCheck size={15} />
                  Version configuration is protected by agent governance
                  policies.
                </div>

                <button
                  onClick={() => setShowHistory(true)}
                  className="text-xs font-medium text-[#374151] hover:underline"
                >
                  View audit history
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showCreate && (
        <Modal
          title="Create agent version"
          onClose={() => setShowCreate(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#374151]">
                Model
              </label>

              <div className="relative">
                <select
                  value={newModel}
                  onChange={(event) => setNewModel(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-sm outline-none"
                >
                  <option>GPT-5.6</option>
                  <option>GPT-5.6-mini</option>
                  <option>Claude Sonnet</option>
                  <option>Gemini Pro</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#374151]">
                Temperature
              </label>

              <input
                value={newTemperature}
                onChange={(event) => setNewTemperature(event.target.value)}
                type="number"
                min="0"
                max="2"
                step="0.1"
                className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#374151]">
                Version description
              </label>

              <textarea
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Describe what changed in this version..."
                rows={4}
                className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none"
              />
            </div>

            <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3 text-xs leading-5 text-[#6b7280]">
              The new version will be created as a draft. Run evaluation and
              testing before deploying it to production.
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="h-9 rounded-lg border border-[#e5e7eb] px-4 text-sm font-medium text-[#374151]"
              >
                Cancel
              </button>

              <button
                onClick={createVersion}
                className="h-9 rounded-lg bg-[#111827] px-4 text-sm font-medium text-white"
              >
                Create version
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showHistory && (
        <Modal
          title="Change history"
          onClose={() => setShowHistory(false)}
        >
          <div className="space-y-4">
            <HistoryItem
              version="v1.2.0"
              action="Deployed to production"
              user="Pujitha"
              time="Sep 19, 2026 · 16:42"
            />

            <HistoryItem
              version="v1.2.0"
              action="Created from v1.1.0"
              user="Pujitha"
              time="Sep 19, 2026 · 15:18"
            />

            <HistoryItem
              version="v1.1.0"
              action="Archived"
              user="Pujitha"
              time="Sep 19, 2026 · Sep 12"
            />

            <HistoryItem
              version="v1.1.0"
              action="Deployed to production"
              user="Pujitha"
              time="Sep 12, 2026 · 11:30"
            />

            <HistoryItem
              version="v1.0.0"
              action="Created"
              user="Pujitha"
              time="Sep 04, 2026 · 09:45"
            />
          </div>
        </Modal>
      )}
    </main>
  );
}

function VersionRow({
  version,
  selected,
  menuOpen,
  onClick,
  onMenu,
  onDeploy,
  onArchive,
  onRestore,
}: {
  version: AgentVersion;
  selected: boolean;
  menuOpen: boolean;
  onClick: () => void;
  onMenu: () => void;
  onDeploy: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer px-4 py-4 transition ${
        selected ? "bg-[#f8fafc]" : "hover:bg-[#fafafa]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              version.status === "Production"
                ? "bg-emerald-50 text-emerald-600"
                : version.status === "Draft"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            <GitBranch size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {version.version}
              </span>

              <StatusBadge status={version.status} small />
            </div>

            <p className="mt-1 truncate text-xs text-[#6b7280]">
              {version.description}
            </p>

            <div className="mt-2 flex items-center gap-3 text-[11px] text-[#9ca3af]">
              <span>{version.createdAt}</span>
              <span>•</span>
              <span>{version.model}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onMenu();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151]"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {menuOpen && (
        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute right-4 top-12 z-20 w-36 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          {version.status !== "Production" && (
            <button
              onClick={onDeploy}
              className="block w-full px-3 py-2 text-left text-xs text-[#374151] hover:bg-[#f9fafb]"
            >
              Deploy
            </button>
          )}

          {version.status === "Archived" ? (
            <button
              onClick={onRestore}
              className="block w-full px-3 py-2 text-left text-xs text-[#374151] hover:bg-[#f9fafb]"
            >
              Restore
            </button>
          ) : (
            <button
              onClick={onArchive}
              className="block w-full px-3 py-2 text-left text-xs text-[#374151] hover:bg-[#f9fafb]"
            >
              Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  small = false,
}: {
  status: VersionStatus;
  small?: boolean;
}) {
  const styles = {
    Production: "bg-emerald-50 text-emerald-700",
    Draft: "bg-blue-50 text-blue-700",
    Archived: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } ${styles[status]}`}
    >
      <span
        className={`rounded-full ${
          small ? "h-1.5 w-1.5" : "h-1.5 w-1.5"
        } ${
          status === "Production"
            ? "bg-emerald-500"
            : status === "Draft"
              ? "bg-blue-500"
              : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
      <div className="mb-3 flex items-center gap-2 text-[#9ca3af]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function HealthRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#6b7280]">{label}</span>

      <span
        className={`flex items-center gap-1.5 text-xs font-medium ${
          good ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {good ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        {value}
      </span>
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
      <span className="text-xs text-[#6b7280]">{label}</span>
      <span className="text-xs font-medium text-[#111827]">{value}</span>
    </div>
  );
}

function HistoryItem({
  version,
  action,
  user,
  time,
}: {
  version: string;
  action: string;
  user: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6]">
        <History size={13} className="text-[#6b7280]" />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{version}</span>
          <span className="text-sm text-[#4b5563]">{action}</span>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs text-[#9ca3af]">
          <span className="flex items-center gap-1">
            <UserRound size={12} />
            {user}
          </span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}