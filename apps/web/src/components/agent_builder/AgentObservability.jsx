"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Layers,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Terminal,
  Users,
  Zap,
} from "lucide-react";

const capabilityGroups = [
  {
    id: "reasoning",
    title: "Reasoning",
    items: [
      {
        id: "brain",
        title: "Agent Brain",
        subtitle: "Plan + reason",
        icon: Brain,
      },
      {
        id: "planner",
        title: "Planner",
        subtitle: "Generate execution plan",
        icon: GitBranch,
      },
      {
        id: "router",
        title: "Model Router",
        subtitle: "Choose best model",
        icon: Layers,
      },
    ],
  },
  {
    id: "knowledge",
    title: "Knowledge",
    items: [
      {
        id: "rag",
        title: "Enterprise RAG",
        subtitle: "Search company knowledge",
        icon: Database,
      },
      {
        id: "documents",
        title: "Documents",
        subtitle: "Read business files",
        icon: FileText,
      },
      {
        id: "memory",
        title: "Long-Term Memory",
        subtitle: "Remember useful context",
        icon: Brain,
      },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    items: [
      {
        id: "api",
        title: "API",
        subtitle: "Call external services",
        icon: Settings2,
      },
      {
        id: "database",
        title: "Database",
        subtitle: "Read structured data",
        icon: Database,
      },
      {
        id: "code",
        title: "Code Runtime",
        subtitle: "Execute code",
        icon: Terminal,
      },
      {
        id: "browser",
        title: "Browser",
        subtitle: "Use web interfaces",
        icon: Search,
      },
    ],
  },
  {
    id: "agents",
    title: "Specialists",
    items: [
      {
        id: "research",
        title: "Research Agent",
        subtitle: "Research information",
        icon: Search,
      },
      {
        id: "analysis",
        title: "Analysis Agent",
        subtitle: "Analyze results",
        icon: Target,
      },
      {
        id: "review",
        title: "Review Agent",
        subtitle: "Validate output",
        icon: ShieldCheck,
      },
      {
        id: "delegate",
        title: "Sub-Agent",
        subtitle: "Delegate work",
        icon: Users,
      },
    ],
  },
];

const initialExecutionSteps = [
  {
    id: "goal",
    title: "Understand Goal",
    subtitle: "Interpret user objective",
    type: "reasoning",
    status: "complete",
    time: "0.4s",
    icon: Target,
  },
  {
    id: "plan",
    title: "Generate Plan",
    subtitle: "Create adaptive execution strategy",
    type: "reasoning",
    status: "complete",
    time: "0.8s",
    icon: Brain,
  },
  {
    id: "knowledge",
    title: "Retrieve Knowledge",
    subtitle: "Search enterprise context",
    type: "knowledge",
    status: "complete",
    time: "1.4s",
    icon: Database,
  },
  {
    id: "research",
    title: "Research Company",
    subtitle: "Research Agent",
    type: "agent",
    status: "running",
    time: "2.3s",
    icon: Search,
  },
  {
    id: "analysis",
    title: "Analyze Findings",
    subtitle: "Determine lead quality",
    type: "reasoning",
    status: "pending",
    time: "--",
    icon: Target,
  },
  {
    id: "approval",
    title: "Human Approval",
    subtitle: "Approve sensitive action",
    type: "governance",
    status: "pending",
    time: "--",
    icon: Users,
  },
];

const recentActivity = [
  {
    time: "10:24:15",
    title: "Goal accepted",
    detail: "Sales lead qualification",
    status: "complete",
  },
  {
    time: "10:24:17",
    title: "Planner generated execution strategy",
    detail: "6 steps",
    status: "complete",
  },
  {
    time: "10:24:20",
    title: "RAG retrieved context",
    detail: "12 relevant records",
    status: "complete",
  },
  {
    time: "10:24:28",
    title: "Research Agent executing",
    detail: "Company research",
    status: "running",
  },
];

function StatusPill({ status }) {
  if (status === "running") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        Running
      </span>
    );
  }

  if (status === "complete") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
        <CheckCircle2 size={11} />
        Complete
      </span>
    );
  }

  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
      Pending
    </span>
  );
}

function CapabilityItem({ item, onAdd }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/x-modelnow-capability",
          JSON.stringify({ id: item.id }),
        );
      }}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50/60"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-violet-100">
        <Icon
          size={14}
          className="text-slate-600 group-hover:text-violet-700"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-semibold text-slate-800">
          {item.title}
        </div>

        <div className="mt-0.5 truncate text-[9px] text-slate-400">
          {item.subtitle}
        </div>
      </div>

      <Plus
        size={12}
        className="text-slate-300 group-hover:text-violet-600"
      />
    </button>
  );
}

function ExecutionStep({
  step,
  selected,
  onSelect,
}) {
  const Icon = step.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(step.id)}
      className={`group relative w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-violet-300 bg-violet-50/70 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            step.status === "complete"
              ? "bg-emerald-100 text-emerald-700"
              : step.status === "running"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">
              {step.title}
            </span>

            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-slate-500">
              {step.type}
            </span>
          </div>

          <div className="mt-1 text-[10px] text-slate-500">
            {step.subtitle}
          </div>
        </div>

        <div className="text-right">
          <StatusPill
            status={step.status}
          />

          <div className="mt-1 text-[9px] text-slate-400">
            {step.time}
          </div>
        </div>
      </div>

      {step.status === "running" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-2/3 animate-pulse bg-blue-500" />
        </div>
      )}
    </button>
  );
}

export default function AgentCanvas({
  initialAgentName = "Sales Lead Agent",
}) {
  const [agentName, setAgentName] =
    useState(initialAgentName);

  const [goal, setGoal] = useState(
    "Qualify incoming sales leads, research their company, determine whether they are a strong fit, and prepare a personalized response for approval.",
  );

  const [model, setModel] = useState("GPT-5");

  const [temperature, setTemperature] =
    useState("0.2");

  const [search, setSearch] = useState("");

  const [openGroups, setOpenGroups] =
    useState(
      Object.fromEntries(
        capabilityGroups.map((group) => [
          group.id,
          true,
        ]),
      ),
    );

  const [selectedStepId, setSelectedStepId] =
    useState("research");

  const [executionSteps, setExecutionSteps] =
    useState(initialExecutionSteps);

  const [capabilities, setCapabilities] =
    useState([
      "Enterprise RAG",
      "Research Agent",
      "Model Router",
      "Human Approval",
    ]);

  const [running, setRunning] = useState(false);

  const [activeRightTab, setActiveRightTab] =
    useState("config");

  const [activeBottomTab, setActiveBottomTab] =
    useState("execution");

  const [zoom, setZoom] = useState(100);

  const [memoryEnabled, setMemoryEnabled] =
    useState(true);

  const [guardrailsEnabled, setGuardrailsEnabled] =
    useState(true);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return capabilityGroups;

    return capabilityGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title
              .toLowerCase()
              .includes(query) ||
            item.subtitle
              .toLowerCase()
              .includes(query),
        ),
      }))
      .filter(
        (group) => group.items.length > 0,
      );
  }, [search]);

  const selectedStep =
    executionSteps.find(
      (step) =>
        step.id === selectedStepId,
    ) || executionSteps[0];

  const addCapability = (item) => {
    if (capabilities.includes(item.title)) {
      return;
    }

    setCapabilities((current) => [
      ...current,
      item.title,
    ]);

    if (item.title === "Research Agent") {
      setExecutionSteps((current) =>
        current.map((step) =>
          step.id === "research"
            ? {
                ...step,
                subtitle:
                  "Research Agent connected",
              }
            : step,
        ),
      );
    }
  };

  const runAgent = () => {
    if (running) return;

    setRunning(true);
    setActiveBottomTab("execution");

    setExecutionSteps((current) =>
      current.map((step, index) => ({
        ...step,
        status:
          index < 3
            ? "complete"
            : index === 3
              ? "running"
              : "pending",
      })),
    );
  };

  const finishExecution = () => {
    setExecutionSteps((current) =>
      current.map((step) => ({
        ...step,
        status: "complete",
      })),
    );

    setRunning(false);
  };

  if (running) {
    window.setTimeout(
      finishExecution,
      1800,
    );
  }

  return (
    <div className="flex h-screen min-h-[820px] flex-col overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* Header */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex items-center gap-4">
          <a
            href="/agent-builder"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
          </a>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
            <Brain
              size={18}
              className="text-violet-700"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                value={agentName}
                onChange={(event) =>
                  setAgentName(
                    event.target.value,
                  )
                }
                className="w-56 bg-transparent text-sm font-semibold outline-none"
              />

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
                Draft
              </span>
            </div>

            <div className="mt-1 text-[10px] text-slate-400">
              Goal-driven agent workspace
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={runAgent}
            className="flex items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            <Play size={13} />
            Test Agent
          </button>

          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700"
          >
            Deploy
          </button>
        </div>
      </header>

      {/* Navigation */}

      <nav className="flex h-11 shrink-0 items-end gap-6 border-b border-slate-200 bg-white px-6">
        {[
          "Build",
          "Configure",
          "Knowledge",
          "Tools",
          "Memory",
          "Test",
          "Evaluate",
          "Deploy",
          "Monitor",
        ].map((item) => (
          <button
            type="button"
            key={item}
            className={`h-full border-b-2 px-1 text-[10px] font-medium ${
              item === "Build"
                ? "border-violet-600 text-violet-700"
                : "border-transparent text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Main */}

      <div className="grid min-h-0 flex-1 grid-cols-[250px_minmax(0,1fr)_310px]">
        {/* Capability Library */}

        <aside className="min-h-0 border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="text-sm font-semibold">
              AI Capability Library
            </div>

            <div className="mt-1 text-[10px] leading-4 text-slate-500">
              Add intelligence to the agent instead of manually wiring every
              step.
            </div>

            <div className="relative mt-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search capabilities..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-170px)] overflow-y-auto p-3">
            <div className="space-y-4">
              {filteredGroups.map((group) => {
                const Icon = group.icon;

                return (
                  <section key={group.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups(
                          (current) => ({
                            ...current,
                            [group.id]:
                              !current[
                                group.id
                              ],
                          }),
                        )
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left"
                    >
                      <Icon
                        size={14}
                        className="text-slate-500"
                      />

                      <span className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {group.title}
                      </span>

                      <ChevronDown
                        size={12}
                        className={`text-slate-400 transition ${
                          openGroups[group.id]
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {openGroups[group.id] && (
                      <div className="space-y-1">
                        {group.items.map(
                          (item) => (
                            <CapabilityItem
                              key={item.id}
                              item={item}
                              onAdd={
                                addCapability
                              }
                            />
                          ),
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER */}

        <main className="relative min-h-0 overflow-hidden bg-[#f8f9fc]">
          <div className="absolute inset-0 bg-[radial-gradient(#d9dee8_1px,transparent_1px)] bg-[size:22px_22px]" />

          <div className="relative h-full overflow-y-auto p-6">
            <div className="mx-auto max-w-[1050px] space-y-5">
              {/* Goal */}

              <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600">
                    <Target
                      size={19}
                      className="text-white"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-600">
                          Agent Goal
                        </div>

                        <h2 className="mt-1 text-sm font-semibold">
                          What should this agent accomplish?
                        </h2>
                      </div>

                      <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-medium text-violet-700">
                        AI interprets this goal
                      </span>
                    </div>

                    <textarea
                      value={goal}
                      onChange={(event) =>
                        setGoal(
                          event.target
                            .value,
                        )
                      }
                      rows={3}
                      className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 outline-none focus:border-violet-400 focus:bg-white"
                    />
                  </div>
                </div>
              </section>

              {/* Intelligence Layer */}

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
                      <Brain
                        size={18}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold">
                        Agent Brain
                      </div>

                      <div className="mt-1 text-[9px] text-slate-500">
                        Reason · plan · decide
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/80 p-2">
                      <div className="text-[8px] text-slate-400">
                        Goal
                      </div>
                      <div className="mt-1 text-[10px] font-semibold">
                        Clear
                      </div>
                    </div>

                    <div className="rounded-lg bg-white/80 p-2">
                      <div className="text-[8px] text-slate-400">
                        Plan
                      </div>
                      <div className="mt-1 text-[10px] font-semibold">
                        Adaptive
                      </div>
                    </div>

                    <div className="rounded-lg bg-white/80 p-2">
                      <div className="text-[8px] text-slate-400">
                        Reasoning
                      </div>
                      <div className="mt-1 text-[10px] font-semibold">
                        Active
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                      <Bot
                        size={18}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold">
                        Model Router
                      </div>

                      <div className="mt-1 text-[9px] text-slate-500">
                        Dynamic model selection
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
                    <div>
                      <div className="text-[8px] uppercase tracking-wide text-slate-400">
                        Current model
                      </div>

                      <div className="mt-1 text-xs font-semibold">
                        {model}
                      </div>
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-slate-400"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                      <Database
                        size={18}
                        className="text-emerald-700"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold">
                        Context Engine
                      </div>

                      <div className="mt-1 text-[9px] text-slate-500">
                        Knowledge + memory
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-[8px] text-slate-400">
                        RAG
                      </div>
                      <div className="mt-1 text-[10px] font-semibold text-emerald-600">
                        Enabled
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <div className="text-[8px] text-slate-400">
                        Memory
                      </div>
                      <div className="mt-1 text-[10px] font-semibold text-emerald-600">
                        Enabled
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Plan */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <GitBranch
                        size={15}
                        className="text-violet-600"
                      />

                      <h2 className="text-sm font-semibold">
                        AI Execution Plan
                      </h2>
                    </div>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Generated from the goal — the agent can adapt this plan
                      during execution.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {running && (
                      <span className="flex items-center gap-1.5 text-[9px] text-blue-600">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                        Agent executing
                      </span>
                    )}

                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-medium text-violet-700">
                      Adaptive plan
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {executionSteps.map((step) => (
                    <ExecutionStep
                      key={step.id}
                      step={step}
                      selected={
                        selectedStepId === step.id
                      }
                      onSelect={
                        setSelectedStepId
                      }
                    />
                  ))}
                </div>
              </section>

              {/* Capability Map */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">
                      Capability Graph
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-500">
                      The agent decides when and how to use each capability.
                    </p>
                  </div>

                  <div className="text-[9px] text-slate-400">
                    {capabilities.length} capabilities
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="rounded-xl border-2 border-violet-300 bg-violet-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Brain
                        size={15}
                        className="text-violet-700"
                      />
                      <span className="text-xs font-semibold text-violet-800">
                        Agent Brain
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-slate-300"
                  />

                  {capabilities.map(
                    (capability, index) => (
                      <div
                        key={capability}
                        className="flex items-center gap-2"
                      >
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {index === 0 ? (
                              <Database
                                size={13}
                                className="text-emerald-600"
                              />
                            ) : index === 1 ? (
                              <Search
                                size={13}
                                className="text-blue-600"
                              />
                            ) : index === 2 ? (
                              <GitBranch
                                size={13}
                                className="text-violet-600"
                              />
                            ) : (
                              <Users
                                size={13}
                                className="text-orange-600"
                              />
                            )}

                            <span className="text-[10px] font-medium">
                              {capability}
                            </span>
                          </div>
                        </div>

                        {index <
                          capabilities.length - 1 && (
                          <ArrowRight
                            size={12}
                            className="text-slate-300"
                          />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* RIGHT INSPECTOR */}

        <aside className="min-h-0 border-l border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                <Brain
                  size={16}
                  className="text-violet-700"
                />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  Agent Intelligence
                </div>

                <div className="mt-1 text-[9px] text-slate-500">
                  Configure how the agent thinks and acts.
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              {[
                ["config", "Configuration"],
                ["advanced", "Advanced"],
                ["tools", "Capabilities"],
              ].map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() =>
                    setActiveRightTab(id)
                  }
                  className={`border-b-2 pb-2 text-[9px] font-medium ${
                    activeRightTab === id
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-170px)] overflow-y-auto p-4">
            {activeRightTab === "config" && (
              <div className="space-y-5">
                <section>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold">
                      Agent Settings
                    </h3>

                    <ChevronDown
                      size={13}
                      className="text-slate-400"
                    />
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                        Agent Name
                      </label>

                      <input
                        value={agentName}
                        onChange={(event) =>
                          setAgentName(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-violet-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                        Model
                      </label>

                      <select
                        value={model}
                        onChange={(event) =>
                          setModel(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs"
                      >
                        <option>GPT-5</option>
                        <option>Claude Sonnet</option>
                        <option>Gemini Pro</option>
                        <option>DeepSeek V3</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                        Temperature
                      </label>

                      <input
                        value={temperature}
                        onChange={(event) =>
                          setTemperature(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs"
                      />
                    </div>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-5">
                  <h3 className="text-xs font-semibold">
                    Goal Summary
                  </h3>

                  <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
                    <div className="flex items-center gap-2">
                      <Target
                        size={14}
                        className="text-violet-600"
                      />

                      <span className="text-[10px] font-semibold text-violet-900">
                        Goal interpreted successfully
                      </span>
                    </div>

                    <p className="mt-2 text-[9px] leading-4 text-violet-700">
                      The planner will dynamically select knowledge, tools,
                      models, and specialist agents.
                    </p>
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-5">
                  <h3 className="text-xs font-semibold">
                    Runtime Safety
                  </h3>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <span className="text-[10px]">
                        Guardrails
                      </span>

                      <CheckCircle2
                        size={14}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <span className="text-[10px]">
                        Approval policy
                      </span>

                      <CheckCircle2
                        size={14}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <span className="text-[10px]">
                        Tool permissions
                      </span>

                      <CheckCircle2
                        size={14}
                        className="text-emerald-600"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeRightTab === "advanced" && (
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Planning Mode
                  </label>

                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs">
                    <option>Adaptive Planning</option>
                    <option>Fixed Plan</option>
                    <option>Replanning Allowed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Confidence Threshold
                  </label>

                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs">
                    <option>0.90</option>
                    <option>0.85</option>
                    <option>0.80</option>
                    <option>0.75</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium text-slate-600">
                    Failure Strategy
                  </label>

                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs">
                    <option>Retry + Replan</option>
                    <option>Fallback Model</option>
                    <option>Delegate to Agent</option>
                    <option>Human Approval</option>
                  </select>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] font-semibold">
                    Optimization Engine
                  </div>

                  <div className="mt-3 space-y-2">
                    {[
                      "Prompt optimization",
                      "Context optimization",
                      "Model routing",
                      "Cost optimization",
                      "Latency optimization",
                    ].map(
                      (label) => (
                        <div
                          key={label}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <span className="text-slate-500">
                            {label}
                          </span>

                          <CheckCircle2
                            size={13}
                            className="text-emerald-600"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === "tools" && (
              <div className="space-y-3">
                <div className="text-[10px] text-slate-500">
                  Capabilities dynamically available to the agent.
                </div>

                {capabilities.map(
                  (capability) => (
                    <div
                      key={capability}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Layers
                          size={14}
                          className="text-violet-600"
                        />

                        <span className="text-[10px] font-medium">
                          {capability}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-[9px] text-emerald-600">
                        <CheckCircle2 size={11} />
                        Enabled
                      </span>
                    </div>
                  ),
                )}

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-[10px] font-medium text-violet-700"
                >
                  <Plus size={12} />
                  Add Capability
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={runAgent}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-violet-700"
            >
              <Play size={13} />
              {running
                ? "Agent Running..."
                : "Test Agent"}
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom AI Runtime */}

      <footer className="shrink-0 border-t border-slate-200 bg-white">
        <div className="flex h-10 items-center gap-6 border-b border-slate-200 px-5">
          {[
            "execution",
            "trace",
            "quality",
            "cost",
            "logs",
          ].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() =>
                setActiveBottomTab(
                  tab,
                )
              }
              className={`h-full border-b-2 text-[10px] font-medium capitalize ${
                activeBottomTab === tab
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              {tab === "execution"
                ? "Live Execution"
                : tab}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5 text-[9px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Runtime healthy
          </div>
        </div>

        <div className="min-h-[150px]">
          {activeBottomTab ===
            "execution" && (
            <div className="grid grid-cols-3 divide-x divide-slate-200">
              <div className="p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Goal
                </div>

                <p className="mt-2 line-clamp-4 text-[10px] leading-4 text-slate-600">
                  {goal}
                </p>

                <button
                  type="button"
                  onClick={runAgent}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-medium text-white"
                >
                  <Play size={12} />
                  Run Test
                </button>
              </div>

              <div className="p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Execution
                </div>

                <div className="mt-3 space-y-2">
                  {executionSteps
                    .slice(0, 5)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2"
                      >
                        <StatusDot
                          type={
                            step.status ===
                            "running"
                              ? "active"
                              : step.status ===
                                  "complete"
                                ? "success"
                                : "pending"
                          }
                        />

                        <span className="text-[9px] text-slate-600">
                          {step.title}
                        </span>

                        <span className="ml-auto text-[8px] text-slate-400">
                          {step.time}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Runtime Metrics
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <div className="text-[8px] text-slate-400">
                      Duration
                    </div>
                    <div className="mt-1 text-xs font-semibold">
                      42.6s
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <div className="text-[8px] text-slate-400">
                      Tokens
                    </div>
                    <div className="mt-1 text-xs font-semibold">
                      3,842
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <div className="text-[8px] text-slate-400">
                      Cost
                    </div>
                    <div className="mt-1 text-xs font-semibold">
                      $0.84
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-2.5">
                  <Brain
                    size={13}
                    className="text-violet-600"
                  />

                  <span className="text-[9px] font-medium text-violet-800">
                    Agent decides the next action dynamically.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeBottomTab ===
            "trace" && (
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Execution Trace
                </div>

                <div className="mt-3 space-y-2">
                  {recentActivity.map(
                    (item) => (
                      <div
                        key={`${item.time}-${item.title}`}
                        className="flex items-center gap-2"
                      >
                        <StatusDot
                          type={
                            item.status ===
                            "running"
                              ? "active"
                              : "success"
                          }
                        />

                        <span className="font-mono text-[8px] text-slate-400">
                          {item.time}
                        </span>

                        <span className="text-[9px] text-slate-600">
                          {item.title}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 font-mono text-[9px] text-slate-300">
                <div className="text-violet-400">
                  agent.plan()
                </div>

                <div className="mt-2 text-slate-500">
                  → retrieve_context()
                </div>

                <div className="text-slate-500">
                  → delegate(research_agent)
                </div>

                <div className="text-slate-500">
                  → analyze()
                </div>

                <div className="text-slate-500">
                  → validate()
                </div>
              </div>
            </div>
          )}

          {activeBottomTab ===
            "quality" && (
            <div className="grid grid-cols-4 gap-3 p-4">
              {[
                ["Correctness", "96"],
                ["Relevance", "94"],
                ["Groundedness", "92"],
                ["Safety", "99"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="text-[9px] text-slate-400">
                    {label}
                  </div>

                  <div className="mt-1 text-xl font-semibold">
                    {value}
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{
                        width: `${value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeBottomTab ===
            "cost" && (
            <div className="grid grid-cols-4 gap-3 p-4">
              {[
                ["Model Cost", "$0.52"],
                ["Tool Cost", "$0.18"],
                ["RAG Cost", "$0.08"],
                ["Total", "$0.78"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="text-[9px] text-slate-400">
                    {label}
                  </div>

                  <div className="mt-1 text-xl font-semibold">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeBottomTab ===
            "logs" && (
            <div className="bg-slate-950 p-4 font-mono text-[9px] text-slate-300">
              <div>10:24:15 goal.accepted</div>
              <div>10:24:17 planner.generated</div>
              <div>10:24:20 context.retrieved</div>
              <div>10:24:28 research_agent.started</div>
              <div>10:24:41 reasoning.completed</div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}