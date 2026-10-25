"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GitBranch,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const initialAgents = [
  {
    id: "research",
    name: "Research Agent",
    role: "Research & Discovery",
    description:
      "Finds information, gathers evidence, and prepares research context.",
    status: "Active",
    model: "GPT-5",
    tasks: 1842,
    success: 97,
    latency: 1.8,
    icon: Search,
  },
  {
    id: "analysis",
    name: "Analysis Agent",
    role: "Analysis & Reasoning",
    description:
      "Analyzes research output and produces structured conclusions.",
    status: "Active",
    model: "Claude Sonnet",
    tasks: 1294,
    success: 95,
    latency: 2.1,
    icon: Target,
  },
  {
    id: "content",
    name: "Content Agent",
    role: "Content Generation",
    description:
      "Transforms structured findings into user-facing responses.",
    status: "Active",
    model: "Gemini Pro",
    tasks: 2310,
    success: 96,
    latency: 1.5,
    icon: Layers,
  },
  {
    id: "review",
    name: "Review Agent",
    role: "Quality Review",
    description:
      "Checks responses for quality, safety, consistency, and policy compliance.",
    status: "Active",
    model: "GPT-5",
    tasks: 1098,
    success: 99,
    latency: 1.2,
    icon: ShieldCheck,
  },
  {
    id: "browser",
    name: "Browser Agent",
    role: "Browser Automation",
    description:
      "Executes browser-based tasks and retrieves web information.",
    status: "Active",
    model: "GPT-5",
    tasks: 742,
    success: 93,
    latency: 3.2,
    icon: Zap,
  },
  {
    id: "database",
    name: "Database Agent",
    role: "Data Operations",
    description:
      "Queries approved databases and returns structured business data.",
    status: "Active",
    model: "Claude Sonnet",
    tasks: 528,
    success: 98,
    latency: 1.7,
    icon: Activity,
  },
];

const initialPatterns = [
  {
    id: "sequential",
    name: "Sequential Delegation",
    description:
      "Each agent completes its step before the next agent starts.",
    steps: ["Research", "Analysis", "Content", "Review"],
    color: "bg-slate-900",
  },
  {
    id: "parallel",
    name: "Parallel Delegation",
    description:
      "Multiple specialist agents work simultaneously before aggregation.",
    steps: ["Research", "Browser", "Database", "Analysis"],
    color: "bg-blue-600",
  },
  {
    id: "review-loop",
    name: "Review Loop",
    description:
      "A reviewer evaluates output and sends failed results back for refinement.",
    steps: ["Content", "Review", "Refine", "Review"],
    color: "bg-emerald-600",
  },
  {
    id: "specialist",
    name: "Specialist Team",
    description:
      "A coordinator delegates work to specialized agents and combines results.",
    steps: ["Coordinator", "Research", "Analysis", "Review"],
    color: "bg-indigo-600",
  },
];

const initialExecutions = [
  {
    id: "EXE-9821",
    workflow: "Enterprise Research",
    lead: "Research Agent",
    agents: 4,
    completed: 4,
    duration: "4m 18s",
    success: true,
    time: "3 min ago",
  },
  {
    id: "EXE-9820",
    workflow: "Customer Intelligence",
    lead: "Analysis Agent",
    agents: 5,
    completed: 5,
    duration: "3m 41s",
    success: true,
    time: "11 min ago",
  },
  {
    id: "EXE-9819",
    workflow: "Web Research",
    lead: "Browser Agent",
    agents: 3,
    completed: 2,
    duration: "2m 14s",
    success: false,
    time: "19 min ago",
  },
  {
    id: "EXE-9818",
    workflow: "Document Analysis",
    lead: "Database Agent",
    agents: 4,
    completed: 4,
    duration: "3m 03s",
    success: true,
    time: "28 min ago",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Running: "border-blue-200 bg-blue-50 text-blue-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
    Disabled: "border-slate-200 bg-slate-50 text-slate-500",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
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

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-slate-400"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
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

function AgentCard({ agent, selected, onSelect }) {
  const Icon = agent.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(agent.id)}
      className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${
        selected
          ? "border-slate-900 bg-slate-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
            <Icon size={18} className="text-white" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">
              {agent.name}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {agent.role}
            </div>
          </div>
        </div>

        <StatusBadge status={agent.status} />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {agent.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="text-[10px] text-slate-500">Tasks</div>
          <div className="mt-1 text-sm font-semibold">{agent.tasks}</div>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="text-[10px] text-slate-500">Success</div>
          <div className="mt-1 text-sm font-semibold">
            {agent.success}%
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5">
          <div className="text-[10px] text-slate-500">Latency</div>
          <div className="mt-1 text-sm font-semibold">
            {agent.latency}s
          </div>
        </div>
      </div>
    </button>
  );
}

function ConnectionArrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <ArrowRight size={18} className="text-slate-400" />
    </div>
  );
}

function AgentNode({ name, role, active, icon: Icon }) {
  return (
    <div
      className={`min-w-[145px] rounded-xl border p-3 text-center ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg ${
          active ? "bg-white/10" : "bg-slate-100"
        }`}
      >
        <Icon
          size={17}
          className={active ? "text-white" : "text-slate-700"}
        />
      </div>

      <div className="mt-2 text-xs font-semibold">{name}</div>

      <div
        className={`mt-1 text-[10px] ${
          active ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {role}
      </div>
    </div>
  );
}

function ExecutionBadge({ success }) {
  return success ? (
    <CheckCircle2 size={16} className="text-emerald-600" />
  ) : (
    <XCircle size={16} className="text-red-600" />
  );
}

export default function MultiAgentOrchestrator() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState(
    initialAgents[0].id,
  );
  const [patterns] = useState(initialPatterns);
  const [executions, setExecutions] =
    useState(initialExecutions);

  const [enabled, setEnabled] = useState(true);
  const [maxAgents, setMaxAgents] = useState("5");
  const [executionMode, setExecutionMode] =
    useState("Sequential");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [running, setRunning] = useState(false);
  const [selectedPattern, setSelectedPattern] =
    useState("specialist");

  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId) ||
    agents[0];

  const selectedPatternData =
    patterns.find((pattern) => pattern.id === selectedPattern) ||
    patterns[0];

  const roles = useMemo(() => {
    return ["All", ...new Set(agents.map((agent) => agent.role))];
  }, [agents]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        query === "" ||
        agent.name.toLowerCase().includes(query) ||
        agent.role.toLowerCase().includes(query) ||
        agent.model.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" || agent.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [agents, search, roleFilter]);

  const activeAgentCount = agents.filter(
    (agent) => agent.status === "Active",
  ).length;

  const successRate = Math.round(
    agents.reduce((sum, agent) => sum + agent.success, 0) /
      agents.length,
  );

  const runOrchestration = () => {
    if (running) return;

    setRunning(true);

    const nextExecution = {
      id: `EXE-${9822 + executions.length}`,
      workflow: "Multi-Agent Orchestration",
      lead: selectedAgent.name,
      agents:
        selectedPatternData.steps.length > Number(maxAgents)
          ? Number(maxAgents)
          : selectedPatternData.steps.length,
      completed: 0,
      duration: "Running",
      success: true,
      time: "Just now",
    };

    setExecutions((current) => [
      nextExecution,
      ...current,
    ]);

    window.setTimeout(() => {
      setExecutions((current) =>
        current.map((execution) =>
          execution.id === nextExecution.id
            ? {
                ...execution,
                completed: execution.agents,
                duration: "2m 36s",
              }
            : execution,
        ),
      );

      setRunning(false);
    }, 1600);
  };

  const updateAgentModel = (modelName) => {
    setAgents((current) =>
      current.map((agent) =>
        agent.id === selectedAgentId
          ? { ...agent, model: modelName }
          : agent,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Users size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Multi-Agent Orchestrator
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Coordinate multiple specialized agents, manage delegation,
                  and monitor collaborative execution.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setEnabled((current) => !current)
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
              >
                <Toggle
                  enabled={enabled}
                  onChange={() =>
                    setEnabled((current) => !current)
                  }
                />
                {enabled ? "Orchestrator On" : "Orchestrator Off"}
              </button>

              <button
                type="button"
                onClick={runOrchestration}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {running ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}
                {running ? "Running..." : "Run Workflow"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Active Agents"
            value={activeAgentCount}
            detail={`${agents.length} registered agents`}
            icon={Users}
          />

          <MetricCard
            label="Success Rate"
            value={`${successRate}%`}
            detail="+2.4% this month"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Active Workflows"
            value="18"
            detail="Across all environments"
            icon={GitBranch}
          />

          <MetricCard
            label="Avg Latency"
            value="2.14s"
            detail="-14.8% vs baseline"
            icon={Clock3}
          />

          <MetricCard
            label="Cost Efficiency"
            value="34.7%"
            detail="$6.2K saved this month"
            icon={Zap}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "agents", "patterns", "executions"].map(
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
            ),
          )}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Agent Collaboration"
                  description="Current multi-agent execution pattern."
                  action={
                    <StatusBadge
                      status={enabled ? "Active" : "Disabled"}
                    />
                  }
                />

                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {selectedPatternData.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {selectedPatternData.description}
                      </div>
                    </div>

                    <SelectField
                      value={selectedPattern}
                      onChange={(event) =>
                        setSelectedPattern(event.target.value)
                      }
                    >
                      {patterns.map((pattern) => (
                        <option
                          key={pattern.id}
                          value={pattern.id}
                        >
                          {pattern.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {selectedPatternData.steps.map(
                      (step, index) => (
                        <div
                          key={`${step}-${index}`}
                          className="flex items-center gap-3"
                        >
                          <AgentNode
                            name={step}
                            role={
                              index === 0
                                ? "Coordinator"
                                : "Specialist"
                            }
                            active={index === 0}
                            icon={
                              index === 0
                                ? Bot
                                : index === 1
                                  ? Search
                                  : index === 2
                                    ? Target
                                    : ShieldCheck
                            }
                          />

                          {index <
                            selectedPatternData.steps.length - 1 && (
                            <ConnectionArrow />
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Orchestration Settings"
                  description="Runtime controls for collaborative agents."
                />

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Execution Mode
                    </label>

                    <SelectField
                      value={executionMode}
                      onChange={(event) =>
                        setExecutionMode(event.target.value)
                      }
                    >
                      <option>Sequential</option>
                      <option>Parallel</option>
                      <option>Hybrid</option>
                    </SelectField>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Maximum Active Agents
                    </label>

                    <SelectField
                      value={maxAgents}
                      onChange={(event) =>
                        setMaxAgents(event.target.value)
                      }
                    >
                      <option value="2">2 Agents</option>
                      <option value="3">3 Agents</option>
                      <option value="4">4 Agents</option>
                      <option value="5">5 Agents</option>
                      <option value="6">6 Agents</option>
                    </SelectField>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <div className="text-sm font-medium">
                        Automatic Delegation
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Let the coordinator select the best specialist.
                      </div>
                    </div>

                    <Toggle
                      enabled={enabled}
                      onChange={() =>
                        setEnabled((current) => !current)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <div className="text-sm font-medium">
                        Failure Recovery
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Retry or delegate failed tasks automatically.
                      </div>
                    </div>

                    <Toggle
                      enabled={true}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Agent Registry"
                description="Specialized agents available for delegation."
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab("agents")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Manage agents
                    <ArrowRight
                      size={13}
                      className="ml-1 inline"
                    />
                  </button>
                }
              />

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {agents.slice(0, 6).map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    selected={agent.id === selectedAgentId}
                    onSelect={setSelectedAgentId}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Recent Executions"
                description="Latest multi-agent workflow activity."
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab("executions")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    View all
                    <ArrowRight
                      size={13}
                      className="ml-1 inline"
                    />
                  </button>
                }
              />

              <div className="mt-5 space-y-3">
                {executions.slice(0, 4).map((execution) => (
                  <div
                    key={execution.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <ExecutionBadge
                        success={execution.success}
                      />

                      <div>
                        <div className="text-sm font-medium">
                          {execution.workflow}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {execution.id} · Lead: {execution.lead} ·{" "}
                          {execution.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        {execution.completed}/
                        {execution.agents} agents
                      </span>

                      <span>{execution.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "agents" && (
          <section className="mt-6">
            <SectionTitle
              title="Agent Registry"
              description="Configure agents that can participate in orchestration."
              action={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  Add Agent
                </button>
              }
            />

            <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_210px]">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search agents..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none"
                    />
                  </div>

                  <SelectField
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(event.target.value)
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role === "All" ? "All roles" : role}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    selected={agent.id === selectedAgentId}
                    onSelect={setSelectedAgentId}
                  />
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Agent Configuration"
                  description="Selected agent runtime configuration."
                />

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                      <Bot size={18} className="text-white" />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        {selectedAgent.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {selectedAgent.role}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Model
                    </label>

                    <SelectField
                      value={selectedAgent.model}
                      onChange={(event) =>
                        updateAgentModel(event.target.value)
                      }
                    >
                      <option>GPT-5</option>
                      <option>Claude Sonnet</option>
                      <option>Gemini Pro</option>
                      <option>DeepSeek V3</option>
                    </SelectField>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Status
                    </label>

                    <div className="flex h-[42px] items-center rounded-lg border border-slate-200 px-3">
                      <StatusBadge status={selectedAgent.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">
                      Tasks
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {selectedAgent.tasks}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">
                      Success
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {selectedAgent.success}%
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">
                      Latency
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {selectedAgent.latency}s
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    "Agent can receive delegated tasks",
                    "Agent can delegate subtasks",
                    "Agent can access shared context",
                    "Agent participates in recovery",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                    >
                      <span className="text-xs text-slate-600">
                        {item}
                      </span>

                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "patterns" && (
          <section className="mt-6">
            <SectionTitle
              title="Collaboration Patterns"
              description="Reusable orchestration strategies for multi-agent workflows."
            />

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setSelectedPattern(pattern.id)}
                  className={`rounded-2xl border p-5 text-left shadow-sm ${
                    selectedPattern === pattern.id
                      ? "border-slate-900 bg-white"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${pattern.color}`}
                    >
                      <GitBranch
                        size={18}
                        className="text-white"
                      />
                    </div>

                    {selectedPattern === pattern.id && (
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />
                    )}
                  </div>

                  <div className="mt-4 text-sm font-semibold">
                    {pattern.name}
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {pattern.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {pattern.steps.map((step, index) => (
                      <div
                        key={`${pattern.id}-${step}-${index}`}
                        className="flex items-center gap-2"
                      >
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium">
                          {step}
                        </span>

                        {index < pattern.steps.length - 1 && (
                          <ArrowRight
                            size={13}
                            className="text-slate-400"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Selected Pattern Preview"
                description={selectedPatternData.description}
              />

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-50 p-6">
                {selectedPatternData.steps.map(
                  (step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="flex items-center gap-3"
                    >
                      <AgentNode
                        name={step}
                        role={
                          index === 0
                            ? "Coordinator"
                            : "Specialist"
                        }
                        active={index === 0}
                        icon={
                          index === 0
                            ? Bot
                            : index === 1
                              ? Search
                              : index === 2
                                ? Target
                                : ShieldCheck
                        }
                      />

                      {index <
                        selectedPatternData.steps.length - 1 && (
                        <ConnectionArrow />
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "executions" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Execution History"
              description="Track multi-agent workflow executions and results."
            />

            <div className="mt-5 space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <ExecutionBadge
                      success={execution.success}
                    />

                    <div>
                      <div className="text-sm font-semibold">
                        {execution.workflow}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {execution.id} · Lead: {execution.lead} ·{" "}
                        {execution.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>
                      {execution.completed}/{execution.agents} agents
                    </span>

                    <span>{execution.duration}</span>

                    {execution.success ? (
                      <StatusBadge status="Healthy" />
                    ) : (
                      <StatusBadge status="Failed" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <MetricCard
                label="Total Runs"
                value="8,241"
                detail="This month"
                icon={GitBranch}
              />

              <MetricCard
                label="Success Rate"
                value="96.8%"
                detail="+2.1%"
                icon={CheckCircle2}
              />

              <MetricCard
                label="Avg Duration"
                value="2m 42s"
                detail="-16.4%"
                icon={Clock3}
              />

              <MetricCard
                label="Recovered"
                value="184"
                detail="Automatic recovery"
                icon={RefreshCw}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}