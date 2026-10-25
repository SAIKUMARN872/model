"use client";

import Link from "next/link";
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

type AgentStatus = "Active" | "Draft" | "Paused";

type SubAgent = {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  status: AgentStatus;
  executions: number;
  successRate: number;
  avgLatency: number;
  tools: number;
};

const initialAgents: SubAgent[] = [
  {
    id: "research",
    name: "Research Agent",
    role: "Information Research",
    description:
      "Finds, validates, and summarizes information from connected sources.",
    model: "GPT-5",
    status: "Active",
    executions: 1842,
    successRate: 98.6,
    avgLatency: 6.8,
    tools: 5,
  },
  {
    id: "analysis",
    name: "Analysis Agent",
    role: "Data Analysis",
    description:
      "Analyzes research outputs and identifies important patterns and insights.",
    model: "Claude Sonnet",
    status: "Active",
    executions: 1264,
    successRate: 97.9,
    avgLatency: 8.4,
    tools: 4,
  },
  {
    id: "writer",
    name: "Content Agent",
    role: "Content Generation",
    description:
      "Transforms validated information into structured user-facing content.",
    model: "GPT-5",
    status: "Active",
    executions: 2167,
    successRate: 99.1,
    avgLatency: 5.7,
    tools: 3,
  },
  {
    id: "reviewer",
    name: "Review Agent",
    role: "Quality Control",
    description:
      "Reviews outputs for correctness, safety, and instruction compliance.",
    model: "Gemini",
    status: "Active",
    executions: 984,
    successRate: 98.8,
    avgLatency: 4.9,
    tools: 4,
  },
  {
    id: "browser",
    name: "Browser Agent",
    role: "Web Automation",
    description:
      "Performs browser research and web-based actions when required.",
    model: "GPT-5",
    status: "Paused",
    executions: 531,
    successRate: 95.8,
    avgLatency: 12.6,
    tools: 7,
  },
  {
    id: "sql",
    name: "Database Agent",
    role: "Database Operations",
    description:
      "Queries approved databases and returns structured information.",
    model: "Claude Sonnet",
    status: "Draft",
    executions: 0,
    successRate: 0,
    avgLatency: 0,
    tools: 3,
  },
];

const collaborationPatterns = [
  {
    name: "Sequential Delegation",
    description:
      "The main agent delegates one task at a time and passes the result to the next agent.",
    icon: GitBranch,
  },
  {
    name: "Parallel Delegation",
    description:
      "Multiple sub-agents work independently and the parent agent combines their results.",
    icon: Layers,
  },
  {
    name: "Specialist Team",
    description:
      "Each sub-agent owns a specialized responsibility inside a larger workflow.",
    icon: Users,
  },
  {
    name: "Review Loop",
    description:
      "A worker agent produces an output and a reviewer agent validates it before completion.",
    icon: RefreshCw,
  },
];

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = {
    Active: {
      icon: CheckCircle2,
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    Draft: {
      icon: Clock3,
      className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    Paused: {
      icon: AlertTriangle,
      className: "border-red-500/20 bg-red-500/10 text-red-400",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          <Icon size={18} />
        </div>
        <span className="text-xs text-white/30">Live</span>
      </div>

      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}

function SelectField({
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
    <label className="block">
      <span className="mb-2 block text-xs text-white/40">{label}</span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 pr-9 text-sm text-white outline-none focus:border-white/20"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#111113]">
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35"
        />
      </div>
    </label>
  );
}

function AgentCard({
  agent,
  selected,
  onSelect,
}: {
  agent: SubAgent;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
            <Bot size={18} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {agent.name}
            </div>

            <div className="mt-1 text-[11px] text-white/35">
              {agent.role}
            </div>

            <div className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">
              {agent.description}
            </div>
          </div>
        </div>

        <StatusBadge status={agent.status} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/30">
            Model
          </div>
          <div className="mt-1 truncate text-xs text-white/60">
            {agent.model}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/30">
            Success
          </div>
          <div className="mt-1 text-xs text-white/60">
            {agent.status === "Draft" ? "—" : `${agent.successRate}%`}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/30">
            Tools
          </div>
          <div className="mt-1 text-xs text-white/60">
            {agent.tools}
          </div>
        </div>
      </div>
    </button>
  );
}

function ConnectionLine() {
  return (
    <div className="hidden h-px w-10 bg-white/10 md:block">
      <div className="h-full w-1/2 bg-white/30" />
    </div>
  );
}

function TeamNode({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof Bot;
}) {
  return (
    <div className="min-w-[155px] rounded-xl border border-white/10 bg-[#101012] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-white">
            {title}
          </div>
          <div className="mt-1 truncate text-[10px] text-white/35">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  name,
  value,
  healthy,
}: {
  name: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0">
      <div className="flex items-center gap-2.5">
        <span
          className={`h-2 w-2 rounded-full ${
            healthy ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span className="text-xs text-white/55">{name}</span>
      </div>

      <span className="text-xs text-white/35">{value}</span>
    </div>
  );
}

function ExecutionRow({
  agent,
  task,
  status,
  time,
}: {
  agent: string;
  task: string;
  status: "Success" | "Failed";
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] py-4 last:border-0">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          status === "Success"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {status === "Success" ? (
          <CheckCircle2 size={15} />
        ) : (
          <XCircle size={15} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-white">
          {agent}
        </div>
        <div className="mt-1 truncate text-[10px] text-white/35">
          {task}
        </div>
      </div>

      <span className="text-[10px] text-white/30">{time}</span>
    </div>
  );
}

export default function SubAgentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("research");
  const [running, setRunning] = useState(false);

  const selectedAgent = useMemo(
    () =>
      initialAgents.find((agent) => agent.id === selectedId) ??
      initialAgents[0],
    [selectedId],
  );

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialAgents.filter((agent) => {
      const matchesSearch =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.role.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const activeAgents = initialAgents.filter(
    (agent) => agent.status === "Active",
  ).length;

  const totalExecutions = initialAgents.reduce(
    (sum, agent) => sum + agent.executions,
    0,
  );

  const productionAgents = initialAgents.filter(
    (agent) => agent.executions > 0,
  );

  const averageSuccess =
    productionAgents.reduce((sum, agent) => sum + agent.successRate, 0) /
    productionAgents.length;

  const averageLatency =
    productionAgents.reduce((sum, agent) => sum + agent.avgLatency, 0) /
    productionAgents.length;

  const runTeam = () => {
    setRunning(true);

    window.setTimeout(() => {
      setRunning(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1550px] px-5 py-6 md:px-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/workflow"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/30">
                Workflow Orchestration
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Sub-Agents
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/agent-builder/intelligence/multi-agent-collaboration"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06]"
            >
              <Users size={15} />
              Collaboration
            </Link>

            <button
              type="button"
              onClick={runTeam}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90"
            >
              {running ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Play size={15} />
              )}
              {running ? "Running..." : "Run Agent Team"}
            </button>
          </div>
        </header>

        <section className="mt-7 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-transparent p-7 md:p-9">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50">
              <Users size={13} />
              Multi-Agent Orchestration
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              Delegate complex tasks to specialized AI agents.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/45">
              Sub-agents allow a parent agent to delegate focused tasks to
              specialized agents, coordinate their work, review their results,
              and combine everything into one final response.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Specialized agents",
                "Parallel execution",
                "Sequential delegation",
                "Result aggregation",
                "Agent-to-agent communication",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/45"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Bot}
            label="Active sub-agents"
            value={String(activeAgents)}
            detail="Specialized agents available for delegation"
          />

          <MetricCard
            icon={Activity}
            label="Total executions"
            value={totalExecutions.toLocaleString()}
            detail="Completed sub-agent executions"
          />

          <MetricCard
            icon={CheckCircle2}
            label="Average success rate"
            value={`${averageSuccess.toFixed(1)}%`}
            detail="Across production agents"
          />

          <MetricCard
            icon={Clock3}
            label="Average latency"
            value={`${averageLatency.toFixed(1)}s`}
            detail="Average sub-agent response time"
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Sub-agent registry</h3>
                <p className="mt-1 text-xs text-white/35">
                  Select an agent to configure.
                </p>
              </div>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.07] hover:text-white"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sub-agents..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-white/20"
              />
            </div>

            <SelectField
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", "Active", "Draft", "Paused"]}
            />

            <div className="mt-4 space-y-3">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  selected={agent.id === selectedId}
                  onSelect={() => setSelectedId(agent.id)}
                />
              ))}

              {filteredAgents.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 text-center">
                  <Search
                    size={22}
                    className="mx-auto text-white/25"
                  />

                  <div className="mt-3 text-xs text-white/50">
                    No sub-agents found.
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Bot size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">
                        {selectedAgent.name}
                      </h3>

                      <StatusBadge status={selectedAgent.status} />
                    </div>

                    <p className="mt-1 text-xs text-white/35">
                      {selectedAgent.role} · {selectedAgent.model}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white"
                >
                  <Settings2 size={14} />
                  Agent settings
                </button>
              </div>

              <div className="p-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Model
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {selectedAgent.model}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Executions
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {selectedAgent.executions.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Success rate
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {selectedAgent.executions === 0
                        ? "—"
                        : `${selectedAgent.successRate}%`}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Tools
                    </div>
                    <div className="mt-2 text-sm text-white">
                      {selectedAgent.tools}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-5">
                  <div className="text-xs font-medium text-white">
                    Delegation policy
                  </div>

                  <p className="mt-2 max-w-3xl text-xs leading-6 text-white/40">
                    This sub-agent can be invoked by the parent agent when a
                    task matches its specialization. The parent agent can pass
                    context, receive structured results, and decide whether
                    another agent should continue the workflow.
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2">
                        <Target size={14} />
                        <span className="text-xs font-medium">
                          Trigger
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-white/35">
                        Task matches agent role
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2">
                        <Layers size={14} />
                        <span className="text-xs font-medium">
                          Execution
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-white/35">
                        Sequential or parallel
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        <span className="text-xs font-medium">
                          Output
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-white/35">
                        Structured result returned
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Multi-agent execution
                    </h3>

                    <p className="mt-1 text-xs text-white/35">
                      Parent agent coordinating specialized sub-agents
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-400">
                    <Activity size={12} />
                    Runtime ready
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto p-6">
                <div className="flex min-w-[850px] items-center justify-center">
                  <TeamNode
                    title="Parent Agent"
                    subtitle="Orchestrator"
                    icon={Bot}
                  />

                  <ConnectionLine />

                  <div className="grid grid-cols-2 gap-3">
                    <TeamNode
                      title="Research"
                      subtitle="Information"
                      icon={Search}
                    />

                    <TeamNode
                      title="Analysis"
                      subtitle="Reasoning"
                      icon={Target}
                    />

                    <TeamNode
                      title="Content"
                      subtitle="Generation"
                      icon={Layers}
                    />

                    <TeamNode
                      title="Review"
                      subtitle="Quality"
                      icon={ShieldCheck}
                    />
                  </div>

                  <ConnectionLine />

                  <TeamNode
                    title="Aggregator"
                    subtitle="Final response"
                    icon={CheckCircle2}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Agent runtime health
                  </h3>
                  <p className="mt-1 text-xs text-white/35">
                    Multi-agent infrastructure status
                  </p>
                </div>

                <div className="mt-4">
                  <HealthRow
                    name="Agent registry"
                    value="Healthy"
                    healthy
                  />
                  <HealthRow
                    name="Task router"
                    value="Healthy"
                    healthy
                  />
                  <HealthRow
                    name="Context transfer"
                    value="Healthy"
                    healthy
                  />
                  <HealthRow
                    name="Agent communication"
                    value="Healthy"
                    healthy
                  />
                  <HealthRow
                    name="Result aggregator"
                    value="Healthy"
                    healthy
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Recent agent executions
                  </h3>
                  <p className="mt-1 text-xs text-white/35">
                    Latest delegation activity
                  </p>
                </div>

                <div className="mt-2">
                  <ExecutionRow
                    agent="Research Agent"
                    task="Research customer support solutions"
                    status="Success"
                    time="2m"
                  />
                  <ExecutionRow
                    agent="Analysis Agent"
                    task="Analyze retrieved research"
                    status="Success"
                    time="4m"
                  />
                  <ExecutionRow
                    agent="Review Agent"
                    task="Validate generated response"
                    status="Success"
                    time="7m"
                  />
                  <ExecutionRow
                    agent="Browser Agent"
                    task="Collect public documentation"
                    status="Failed"
                    time="14m"
                  />
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Multi-agent collaboration patterns
            </h3>

            <p className="mt-1 text-sm text-white/40">
              Choose an orchestration pattern based on the complexity of the
              agent task.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {collaborationPatterns.map((pattern) => {
              const Icon = pattern.icon;

              return (
                <div
                  key={pattern.name}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Icon size={18} />
                  </div>

                  <div className="mt-4 text-sm font-semibold">
                    {pattern.name}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    {pattern.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                Optimize your agent team
              </h3>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">
                Monitor traces, evaluate agent quality, manage costs, and
                configure error recovery for reliable multi-agent execution.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/agent-builder/testing/trace-viewer"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <Activity size={13} />
                Traces
              </Link>

              <Link
                href="/agent-builder/testing/quality-evaluation"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <Target size={13} />
                Evaluation
              </Link>

              <Link
                href="/agent-builder/observability/cost-analytics"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <Zap size={13} />
                Cost
              </Link>

              <Link
                href="/agent-builder/workflow/error-recovery"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <ShieldCheck size={13} />
                Recovery
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}