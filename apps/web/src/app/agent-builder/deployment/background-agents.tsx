"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  Copy,
  Database,
  Globe,
  History,
  Lock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Webhook,
  X,
  Zap,
} from "lucide-react";

type AgentStatus =
  | "Running"
  | "Paused"
  | "Scheduled"
  | "Failed"
  | "Completed";

type TriggerType =
  | "Schedule"
  | "Webhook"
  | "Event"
  | "Queue"
  | "Manual";

type Agent = {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  trigger: TriggerType;
  schedule: string;
  model: string;
  executions: number;
  successRate: string;
  avgLatency: string;
  lastRun: string;
};

type LogItem = {
  id: string;
  agent: string;
  status: "Success" | "Running" | "Failed";
  time: string;
  duration: string;
};

const initialAgents: Agent[] = [
  {
    id: "research-agent",
    name: "Research Agent",
    description:
      "Continuously researches market information and produces structured reports.",
    status: "Running",
    trigger: "Schedule",
    schedule: "Every 6 hours",
    model: "ModelNow Auto",
    executions: 1284,
    successRate: "98.7%",
    avgLatency: "4.2s",
    lastRun: "2 min ago",
  },
  {
    id: "lead-agent",
    name: "Lead Enrichment Agent",
    description:
      "Enriches new leads, validates company information and updates CRM records.",
    status: "Scheduled",
    trigger: "Event",
    schedule: "On new lead",
    model: "ModelNow Auto",
    executions: 842,
    successRate: "99.1%",
    avgLatency: "2.8s",
    lastRun: "18 min ago",
  },
  {
    id: "support-agent",
    name: "Support Intelligence Agent",
    description:
      "Analyzes support conversations and creates summaries and action items.",
    status: "Paused",
    trigger: "Queue",
    schedule: "Every 15 min",
    model: "ModelNow Fast",
    executions: 421,
    successRate: "97.8%",
    avgLatency: "3.6s",
    lastRun: "1 hr ago",
  },
];

const initialLogs: LogItem[] = [
  {
    id: "log-1",
    agent: "Research Agent",
    status: "Success",
    time: "2 min ago",
    duration: "3.8s",
  },
  {
    id: "log-2",
    agent: "Lead Enrichment Agent",
    status: "Running",
    time: "18 min ago",
    duration: "2.1s",
  },
  {
    id: "log-3",
    agent: "Support Intelligence Agent",
    status: "Success",
    time: "1 hr ago",
    duration: "4.4s",
  },
];

const triggerOptions: TriggerType[] = [
  "Schedule",
  "Webhook",
  "Event",
  "Queue",
  "Manual",
];

const statusClasses: Record<AgentStatus, string> = {
  Running:
    "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300",
  Paused:
    "border-amber-500/20 bg-amber-500/[0.07] text-amber-300",
  Scheduled:
    "border-blue-500/20 bg-blue-500/[0.07] text-blue-300",
  Failed:
    "border-red-500/20 bg-red-500/[0.07] text-red-300",
  Completed:
    "border-violet-500/20 bg-violet-500/[0.07] text-violet-300",
};

export default function BackgroundAgentsPage() {
  const router = useRouter();

  const [agents, setAgents] =
    useState<Agent[]>(initialAgents);

  const [logs, setLogs] =
    useState<LogItem[]>(initialLogs);

  const [selectedAgentId, setSelectedAgentId] =
    useState("research-agent");

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [agentName, setAgentName] =
    useState("New Background Agent");

  const [agentDescription, setAgentDescription] =
    useState(
      "Autonomous background agent powered by ModelNow.",
    );

  const [trigger, setTrigger] =
    useState<TriggerType>("Schedule");

  const [schedule, setSchedule] =
    useState("Every 6 hours");

  const [model, setModel] =
    useState("ModelNow Auto");

  const [temperature, setTemperature] =
    useState("0.2");

  const [maxExecutions, setMaxExecutions] =
    useState("1000");

  const [humanApproval, setHumanApproval] =
    useState(false);

  const [memoryEnabled, setMemoryEnabled] =
    useState(true);

  const [notifications, setNotifications] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [runtime, setRuntime] =
    useState("Production");

  const selectedAgent = useMemo(
    () =>
      agents.find(
        (agent) => agent.id === selectedAgentId,
      ) ?? agents[0],
    [agents, selectedAgentId],
  );

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return agents;
    }

    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description
          .toLowerCase()
          .includes(query) ||
        agent.trigger
          .toLowerCase()
          .includes(query),
    );
  }, [agents, search]);

  const runningCount = agents.filter(
    (agent) => agent.status === "Running",
  ).length;

  const totalExecutions = agents.reduce(
    (total, agent) => total + agent.executions,
    0,
  );

  const handleToggleAgent = (id: string) => {
    setAgents((current) =>
      current.map((agent) => {
        if (agent.id !== id) {
          return agent;
        }

        return {
          ...agent,
          status:
            agent.status === "Running"
              ? "Paused"
              : "Running",
        };
      }),
    );
  };

  const handleRunAgent = (id: string) => {
    setAgents((current) =>
      current.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: "Running",
              lastRun: "Just now",
              executions: agent.executions + 1,
            }
          : agent,
      ),
    );

    const agent = agents.find(
      (item) => item.id === id,
    );

    if (agent) {
      setLogs((current) => [
        {
          id: `log-${Date.now()}`,
          agent: agent.name,
          status: "Running",
          time: "Just now",
          duration: "0.0s",
        },
        ...current,
      ]);
    }
  };

  const handleDeleteAgent = (id: string) => {
    if (agents.length <= 1) {
      return;
    }

    const remaining = agents.filter(
      (agent) => agent.id !== id,
    );

    setAgents(remaining);

    if (selectedAgentId === id) {
      setSelectedAgentId(
        remaining[0]?.id ?? "",
      );
    }
  };

  const handleCreateAgent = async () => {
    setSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 700),
    );

    const id = `agent-${Date.now()}`;

    const newAgent: Agent = {
      id,
      name: agentName,
      description: agentDescription,
      status:
        trigger === "Manual"
          ? "Paused"
          : "Scheduled",
      trigger,
      schedule,
      model,
      executions: 0,
      successRate: "100%",
      avgLatency: "0s",
      lastRun: "Never",
    };

    setAgents((current) => [
      newAgent,
      ...current,
    ]);

    setSelectedAgentId(id);
    setSaving(false);
    setShowCreate(false);

    setAgentName("New Background Agent");
    setAgentDescription(
      "Autonomous background agent powered by ModelNow.",
    );
    setTrigger("Schedule");
    setSchedule("Every 6 hours");
    setModel("ModelNow Auto");
  };

  const copyAgentEndpoint = async () => {
    const endpoint =
      `https://api.modelnow.ai/v1/agents/background/${selectedAgent?.id ?? "agent"}`;

    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col">

        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#09090d] px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold">
                  Background Agents
                </h1>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2 py-0.5 text-[8px] text-emerald-300">
                  {runningCount} RUNNING
                </span>
              </div>

              <p className="text-[10px] text-white/25">
                Autonomous agents that run continuously in the background
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setShowSettings((value) => !value)
              }
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Settings
            </button>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-[10px] font-semibold text-white transition hover:bg-violet-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Agent
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="flex min-h-0 flex-1">

          {/* SIDEBAR */}
          <aside className="hidden w-[270px] shrink-0 overflow-y-auto border-r border-white/[0.08] bg-[#09090d] lg:block">
            <div className="border-b border-white/[0.06] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Agents
                </span>

                <span className="text-[9px] text-white/20">
                  {agents.length}
                </span>
              </div>

              <div className="mt-3">
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search agents..."
                  className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[9px] text-white/60 outline-none placeholder:text-white/20 focus:border-violet-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5 p-3">
              {filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() =>
                    setSelectedAgentId(agent.id)
                  }
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedAgentId === agent.id
                      ? "border-violet-500/20 bg-violet-500/[0.06]"
                      : "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        agent.status === "Running"
                          ? "bg-emerald-500/10"
                          : "bg-white/[0.04]"
                      }`}
                    >
                      <Bot
                        className={`h-3.5 w-3.5 ${
                          agent.status === "Running"
                            ? "text-emerald-300"
                            : "text-white/30"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-white/65">
                        {agent.name}
                      </p>

                      <p className="mt-1 truncate text-[8px] text-white/20">
                        {agent.trigger} · {agent.schedule}
                      </p>
                    </div>

                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        agent.status === "Running"
                          ? "bg-emerald-400"
                          : agent.status === "Failed"
                            ? "bg-red-400"
                            : "bg-white/15"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-white/[0.06] p-3">
              <SidebarLink
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Execution History"
              />

              <SidebarLink
                icon={<Clock3 className="h-3.5 w-3.5" />}
                label="Schedules"
              />

              <SidebarLink
                icon={<Webhook className="h-3.5 w-3.5" />}
                label="Triggers"
              />

              <SidebarLink
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Agent Policies"
              />

              <SidebarLink
                icon={<Cloud className="h-3.5 w-3.5" />}
                label="Runtime"
              />
            </div>
          </aside>

          {/* MAIN */}
          <section className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1150px] p-5 lg:p-7">

              {/* METRICS */}
              <section className="grid gap-3 md:grid-cols-4">
                <Metric
                  icon={<Bot className="h-4 w-4" />}
                  label="Active Agents"
                  value={`${runningCount}`}
                />

                <Metric
                  icon={<Activity className="h-4 w-4" />}
                  label="Executions"
                  value={totalExecutions.toLocaleString()}
                />

                <Metric
                  icon={<Zap className="h-4 w-4" />}
                  label="Avg Success"
                  value="98.5%"
                  valueClass="text-emerald-300"
                />

                <Metric
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Avg Latency"
                  value="3.5s"
                />
              </section>

              {/* SELECTED AGENT */}
              {selectedAgent && (
                <>
                  <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                    <div className="border-b border-white/[0.06] p-5">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                            <Bot className="h-5 w-5 text-violet-300" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-sm font-semibold">
                                {selectedAgent.name}
                              </h2>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[8px] ${statusClasses[selectedAgent.status]}`}
                              >
                                {selectedAgent.status}
                              </span>
                            </div>

                            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-white/30">
                              {selectedAgent.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleRunAgent(selectedAgent.id)
                            }
                            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[9px] text-white/45 hover:bg-white/[0.07] hover:text-white"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Run Now
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleAgent(selectedAgent.id)
                            }
                            className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-[9px] font-semibold text-white hover:bg-violet-500"
                          >
                            {selectedAgent.status === "Running" ? (
                              <>
                                <Pause className="h-3.5 w-3.5" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" />
                                Start
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 p-5 md:grid-cols-4">
                      <InfoCard
                        label="Trigger"
                        value={selectedAgent.trigger}
                      />

                      <InfoCard
                        label="Schedule"
                        value={selectedAgent.schedule}
                      />

                      <InfoCard
                        label="Model"
                        value={selectedAgent.model}
                      />

                      <InfoCard
                        label="Last Run"
                        value={selectedAgent.lastRun}
                      />
                    </div>
                  </section>

                  {/* PERFORMANCE */}
                  <section className="mt-5 grid gap-5 md:grid-cols-3">
                    <PerformanceCard
                      label="Executions"
                      value={selectedAgent.executions.toLocaleString()}
                      icon={<Activity className="h-4 w-4" />}
                    />

                    <PerformanceCard
                      label="Success Rate"
                      value={selectedAgent.successRate}
                      valueClass="text-emerald-300"
                      icon={<Check className="h-4 w-4" />}
                    />

                    <PerformanceCard
                      label="Avg Latency"
                      value={selectedAgent.avgLatency}
                      icon={<Clock3 className="h-4 w-4" />}
                    />
                  </section>

                  {/* RUNTIME */}
                  <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                    <div className="border-b border-white/[0.06] p-5">
                      <h2 className="text-xs font-semibold">
                        Agent Runtime
                      </h2>

                      <p className="mt-1 text-[9px] text-white/25">
                        Background execution configuration for this agent.
                      </p>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-2">
                      <ConfigRow
                        label="Execution Environment"
                        value={runtime}
                        options={[
                          "Development",
                          "Staging",
                          "Production",
                        ]}
                        onChange={setRuntime}
                      />

                      <ConfigRow
                        label="Trigger Type"
                        value={selectedAgent.trigger}
                        options={triggerOptions}
                        onChange={(value) =>
                          setAgents((current) =>
                            current.map((agent) =>
                              agent.id === selectedAgent.id
                                ? {
                                    ...agent,
                                    trigger:
                                      value as TriggerType,
                                  }
                                : agent,
                            ),
                          )
                        }
                      />

                      <div>
                        <label className="mb-1.5 block text-[9px] text-white/35">
                          Schedule
                        </label>

                        <input
                          value={selectedAgent.schedule}
                          onChange={(event) =>
                            setAgents((current) =>
                              current.map((agent) =>
                                agent.id === selectedAgent.id
                                  ? {
                                      ...agent,
                                      schedule:
                                        event.target.value,
                                    }
                                  : agent,
                              ),
                            )
                          }
                          className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/60 outline-none focus:border-violet-500/40"
                        />
                      </div>

                      <ConfigRow
                        label="Model"
                        value={selectedAgent.model}
                        options={[
                          "ModelNow Auto",
                          "ModelNow Fast",
                          "ModelNow Reasoning",
                        ]}
                        onChange={(value) =>
                          setAgents((current) =>
                            current.map((agent) =>
                              agent.id === selectedAgent.id
                                ? {
                                    ...agent,
                                    model: value,
                                  }
                                : agent,
                            ),
                          )
                        }
                      />
                    </div>
                  </section>

                  {/* CAPABILITIES */}
                  <section className="mt-5 grid gap-3 md:grid-cols-2">
                    <Capability
                      icon={<Database className="h-4 w-4" />}
                      title="Persistent Memory"
                      description="Maintain context across background executions."
                      enabled={memoryEnabled}
                      onChange={() =>
                        setMemoryEnabled(
                          (value) => !value,
                        )
                      }
                    />

                    <Capability
                      icon={<ShieldCheck className="h-4 w-4" />}
                      title="Human Approval"
                      description="Pause sensitive actions until an authorized user approves them."
                      enabled={humanApproval}
                      onChange={() =>
                        setHumanApproval(
                          (value) => !value,
                        )
                      }
                    />

                    <Capability
                      icon={<Webhook className="h-4 w-4" />}
                      title="Event Triggers"
                      description="Start agents automatically from application events and webhooks."
                      enabled
                      onChange={() => {}}
                    />

                    <Capability
                      icon={<Sparkles className="h-4 w-4" />}
                      title="AI Optimization"
                      description="Automatically optimize model selection, latency and execution cost."
                      enabled
                      onChange={() => {}}
                    />
                  </section>

                  {/* ENDPOINT */}
                  <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h2 className="text-xs font-semibold">
                          Background Agent Endpoint
                        </h2>

                        <p className="mt-1 text-[9px] text-white/25">
                          Trigger this agent from external services,
                          workflows or applications.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={copyAgentEndpoint}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[9px] text-white/40 hover:bg-white/[0.07] hover:text-white"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}

                        {copied
                          ? "Copied"
                          : "Copy Endpoint"}
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/30 px-4 py-3">
                      <Webhook className="h-4 w-4 shrink-0 text-violet-300" />

                      <code className="min-w-0 truncate text-[9px] text-white/40">
                        https://api.modelnow.ai/v1/agents/background/
                        {selectedAgent.id}
                      </code>
                    </div>
                  </section>
                </>
              )}

              {/* EXECUTION HISTORY */}
              <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                  <div>
                    <h2 className="text-xs font-semibold">
                      Recent Executions
                    </h2>

                    <p className="mt-1 text-[9px] text-white/25">
                      Live activity from your background agents.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[9px] text-violet-300/70 hover:text-violet-300"
                  >
                    View History
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            log.status === "Success"
                              ? "bg-emerald-500/10"
                              : log.status === "Running"
                                ? "bg-blue-500/10"
                                : "bg-red-500/10"
                          }`}
                        >
                          {log.status === "Success" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                          ) : log.status === "Running" ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-300" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-red-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-medium text-white/55">
                            {log.agent}
                          </p>

                          <p className="mt-1 text-[8px] text-white/20">
                            {log.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <span
                          className={`text-[8px] ${
                            log.status === "Success"
                              ? "text-emerald-300"
                              : log.status === "Running"
                                ? "text-blue-300"
                                : "text-red-300"
                          }`}
                        >
                          {log.status}
                        </span>

                        <span className="font-mono text-[8px] text-white/20">
                          {log.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECURITY */}
              <section className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.025] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  </div>

                  <div>
                    <h2 className="text-xs font-semibold">
                      Enterprise Background Execution
                    </h2>

                    <p className="mt-1 max-w-3xl text-[9px] leading-5 text-white/25">
                      Background agents can operate continuously while
                      ModelNow enforces tool permissions, guardrails,
                      human approvals, execution limits, audit logging,
                      and environment policies.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">

                      <SecurityBadge
                        icon={
                          <ShieldCheck className="h-3 w-3" />
                        }
                        label="Guardrails"
                      />

                      <SecurityBadge
                        icon={
                          <Lock className="h-3 w-3" />
                        }
                        label="Tool Policies"
                      />

                      <SecurityBadge
                        icon={
                          <History className="h-3 w-3" />
                        }
                        label="Audit Logs"
                      />

                      <SecurityBadge
                        icon={
                          <Activity className="h-3 w-3" />
                        }
                        label="Observability"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* DELETE */}
              {selectedAgent && agents.length > 1 && (
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteAgent(
                        selectedAgent.id,
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-red-500/15 bg-red-500/[0.03] px-3 py-2 text-[9px] text-red-300/60 transition hover:bg-red-500/[0.08] hover:text-red-300"
                  >
                    <X className="h-3.5 w-3.5" />
                    Delete Agent
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-white/[0.07] bg-[#08080b] px-4">
          <div className="flex items-center gap-4 text-[8px] text-white/20">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Background Runtime Operational
            </span>

            <span>
              {agents.length} agents
            </span>

            <span>
              {totalExecutions.toLocaleString()} executions
            </span>
          </div>

          <span className="text-[8px] text-white/20">
            ModelNow
          </span>
        </footer>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-[620px] rounded-2xl border border-white/[0.09] bg-[#0b0b10] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-300" />

                  <h2 className="text-sm font-semibold">
                    Create Background Agent
                  </h2>
                </div>

                <p className="mt-1 text-[9px] text-white/25">
                  Configure an autonomous agent that runs continuously.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[9px] text-white/35">
                  Agent Name
                </label>

                <input
                  value={agentName}
                  onChange={(event) =>
                    setAgentName(event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/65 outline-none focus:border-violet-500/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[9px] text-white/35">
                  Description
                </label>

                <textarea
                  value={agentDescription}
                  onChange={(event) =>
                    setAgentDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-[10px] leading-5 text-white/65 outline-none focus:border-violet-500/40"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ModalSelect
                  label="Trigger"
                  value={trigger}
                  options={triggerOptions}
                  onChange={(value) =>
                    setTrigger(
                      value as TriggerType,
                    )
                  }
                />

                <ModalSelect
                  label="Model"
                  value={model}
                  options={[
                    "ModelNow Auto",
                    "ModelNow Fast",
                    "ModelNow Reasoning",
                  ]}
                  onChange={setModel}
                />

                <div>
                  <label className="mb-1.5 block text-[9px] text-white/35">
                    Schedule
                  </label>

                  <input
                    value={schedule}
                    onChange={(event) =>
                      setSchedule(
                        event.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[9px] text-white/60 outline-none focus:border-violet-500/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] text-white/35">
                    Temperature
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(event) =>
                      setTemperature(
                        event.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[9px] text-white/60 outline-none focus:border-violet-500/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] text-white/35">
                    Maximum Executions
                  </label>

                  <input
                    value={maxExecutions}
                    onChange={(event) =>
                      setMaxExecutions(
                        event.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[9px] text-white/60 outline-none focus:border-violet-500/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] text-white/35">
                    Runtime
                  </label>

                  <select
                    value={runtime}
                    onChange={(event) =>
                      setRuntime(
                        event.target.value,
                      )
                    }
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[9px] text-white/60 outline-none"
                  >
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <ModalToggle
                  title="Memory"
                  enabled={memoryEnabled}
                  onChange={() =>
                    setMemoryEnabled(
                      (value) => !value,
                    )
                  }
                />

                <ModalToggle
                  title="Human Approval"
                  enabled={humanApproval}
                  onChange={() =>
                    setHumanApproval(
                      (value) => !value,
                    )
                  }
                />

                <ModalToggle
                  title="Notifications"
                  enabled={notifications}
                  onChange={() =>
                    setNotifications(
                      (value) => !value,
                    )
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] p-5">
              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-[9px] text-white/40 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateAgent}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-[9px] font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}

                {saving ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {showSettings && (
        <div className="fixed right-5 top-[76px] z-40 w-[330px] rounded-2xl border border-white/[0.09] bg-[#0b0b10] p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold">
                Runtime Settings
              </h3>

              <p className="mt-1 text-[8px] text-white/25">
                Global background agent configuration.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowSettings(false)
              }
              className="text-white/25 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <SettingRow
              icon={<Server className="h-3.5 w-3.5" />}
              title="Runtime"
              value={runtime}
            />

            <SettingRow
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              title="Security"
              value="Enforced"
            />

            <SettingRow
              icon={<Database className="h-3.5 w-3.5" />}
              title="Memory"
              value={
                memoryEnabled
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <SettingRow
              icon={<Webhook className="h-3.5 w-3.5" />}
              title="Notifications"
              value={
                notifications
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </div>
        </div>
      )}
    </main>
  );
}

function SidebarLink({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[9px] text-white/30 transition hover:bg-white/[0.05] hover:text-white/65"
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({
  icon,
  label,
  value,
  valueClass = "text-white/70",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0f] p-4">
      <div className="flex items-center gap-2 text-white/25">
        {icon}

        <span className="text-[8px] uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p
        className={`mt-3 text-sm font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <p className="text-[8px] uppercase tracking-[0.1em] text-white/20">
        {label}
      </p>

      <p className="mt-2 truncate text-[10px] font-medium text-white/55">
        {value}
      </p>
    </div>
  );
}

function PerformanceCard({
  label,
  value,
  icon,
  valueClass = "text-white/70",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.1em] text-white/20">
          {label}
        </span>

        <span className="text-white/25">
          {icon}
        </span>
      </div>

      <p
        className={`mt-3 text-lg font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function ConfigRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] text-white/35">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/20 px-3 pr-8 text-[9px] text-white/60 outline-none focus:border-violet-500/40"
        >
          {options.map((option) => (
            <option key={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20" />
      </div>
    </div>
  );
}

function Capability({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-2xl border p-4 text-left transition ${
        enabled
          ? "border-violet-500/15 bg-violet-500/[0.035]"
          : "border-white/[0.08] bg-[#0a0a0f]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            enabled
              ? "bg-violet-500/10 text-violet-300"
              : "bg-white/[0.04] text-white/25"
          }`}
        >
          {icon}
        </div>

        <div
          className={`relative h-4 w-7 rounded-full ${
            enabled
              ? "bg-violet-600"
              : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
              enabled
                ? "left-3.5"
                : "left-0.5"
            }`}
          />
        </div>
      </div>

      <p className="mt-3 text-[10px] font-medium text-white/55">
        {title}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-white/25">
        {description}
      </p>
    </button>
  );
}

function SecurityBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/15 bg-emerald-500/[0.04] px-2 py-1.5 text-[8px] text-emerald-300/70">
      {icon}
      {label}
    </span>
  );
}

function ModalSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] text-white/35">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/20 px-3 pr-8 text-[9px] text-white/60 outline-none"
        >
          {options.map((option) => (
            <option key={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20" />
      </div>
    </div>
  );
}

function ModalToggle({
  title,
  enabled,
  onChange,
}: {
  title: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-xl border p-3 text-left transition ${
        enabled
          ? "border-violet-500/20 bg-violet-500/[0.05]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/45">
          {title}
        </span>

        <span
          className={`relative h-4 w-7 rounded-full ${
            enabled
              ? "bg-violet-600"
              : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${
              enabled
                ? "left-3.5"
                : "left-0.5"
            }`}
          />
        </span>
      </div>
    </button>
  );
}

function SettingRow({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <span className="text-white/25">
          {icon}
        </span>

        <span className="text-[9px] text-white/45">
          {title}
        </span>
      </div>

      <span className="text-[8px] text-emerald-300/70">
        {value}
      </span>
    </div>
  );
}