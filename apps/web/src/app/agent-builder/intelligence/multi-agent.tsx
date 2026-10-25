"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Users,
  Plus,
  CheckCircle2,
  Circle,
  Settings2,
  GitBranch,
  Zap,
  Clock3,
  DollarSign,
  BarChart3,
  Activity,
  ChevronDown,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Network,
  Bot,
  Play,
  Pause,
  Layers,
  MessageSquare,
} from "lucide-react";

type AgentStatus = "Active" | "Standby" | "Paused";

type AgentRole =
  | "Planner"
  | "Researcher"
  | "Executor"
  | "Reviewer"
  | "Specialist";

type CollaborationMode =
  | "Automatic"
  | "Sequential"
  | "Parallel"
  | "Hierarchical";

type Agent = {
  id: number;
  name: string;
  role: AgentRole;
  model: string;
  purpose: string;
  status: AgentStatus;
  quality: number;
  latency: number;
  cost: number;
  priority: number;
};

type CollaborationRule = {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
};

export default function MultiAgentPage() {
  const [collaborationMode, setCollaborationMode] =
    useState<CollaborationMode>("Automatic");

  const [maxAgents, setMaxAgents] = useState(5);
  const [sharedMemory, setSharedMemory] = useState(true);
  const [agentHandoff, setAgentHandoff] = useState(true);
  const [parallelExecution, setParallelExecution] =
    useState(true);
  const [humanApproval, setHumanApproval] = useState(false);
  const [failureRecovery, setFailureRecovery] =
    useState(true);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: "Planner Agent",
      role: "Planner",
      model: "GPT-5.6",
      purpose:
        "Break complex objectives into executable tasks.",
      status: "Active",
      quality: 96,
      latency: 740,
      cost: 0.18,
      priority: 1,
    },
    {
      id: 2,
      name: "Research Agent",
      role: "Researcher",
      model: "Claude Sonnet",
      purpose:
        "Research documents, knowledge sources and web data.",
      status: "Active",
      quality: 93,
      latency: 810,
      cost: 0.21,
      priority: 2,
    },
    {
      id: 3,
      name: "Execution Agent",
      role: "Executor",
      model: "Gemini Pro",
      purpose:
        "Execute tools, APIs and operational workflows.",
      status: "Active",
      quality: 91,
      latency: 620,
      cost: 0.14,
      priority: 3,
    },
    {
      id: 4,
      name: "Review Agent",
      role: "Reviewer",
      model: "GPT-5.6",
      purpose:
        "Validate results and identify errors.",
      status: "Standby",
      quality: 95,
      latency: 680,
      cost: 0.16,
      priority: 4,
    },
  ]);

  const [rules, setRules] = useState<CollaborationRule[]>([
    {
      id: 1,
      name: "Shared Context",
      description:
        "Allow agents to access relevant context produced by other agents.",
      enabled: true,
    },
    {
      id: 2,
      name: "Automatic Handoff",
      description:
        "Transfer tasks to the next specialized agent automatically.",
      enabled: true,
    },
    {
      id: 3,
      name: "Parallel Execution",
      description:
        "Allow independent agents to execute tasks simultaneously.",
      enabled: true,
    },
    {
      id: 4,
      name: "Failure Recovery",
      description:
        "Automatically retry or delegate failed tasks.",
      enabled: true,
    },
    {
      id: 5,
      name: "Quality Review",
      description:
        "Send important outputs to a reviewer before completion.",
      enabled: true,
    },
  ]);

  const activeAgents = agents.filter(
    (agent) => agent.status === "Active"
  ).length;

  const standbyAgents = agents.filter(
    (agent) => agent.status === "Standby"
  ).length;

  const averageQuality = useMemo(() => {
    if (agents.length === 0) return 0;

    return Math.round(
      agents.reduce(
        (total, agent) => total + agent.quality,
        0
      ) / agents.length
    );
  }, [agents]);

  const averageLatency = useMemo(() => {
    if (agents.length === 0) return 0;

    return Math.round(
      agents.reduce(
        (total, agent) => total + agent.latency,
        0
      ) / agents.length
    );
  }, [agents]);

  const averageCost = useMemo(() => {
    if (agents.length === 0) return "0.00";

    return (
      agents.reduce(
        (total, agent) => total + agent.cost,
        0
      ) / agents.length
    ).toFixed(2);
  }, [agents]);

  const toggleRule = (id: number) => {
    setRules((items) =>
      items.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              enabled: !rule.enabled,
            }
          : rule
      )
    );
  };

  const toggleAgentStatus = (id: number) => {
    setAgents((items) =>
      items.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status:
                agent.status === "Active"
                  ? "Paused"
                  : "Active",
            }
          : agent
      )
    );
  };

  const deleteAgent = (id: number) => {
    setAgents((items) =>
      items.filter((agent) => agent.id !== id)
    );
  };

  const addAgent = () => {
    const nextId =
      agents.length > 0
        ? Math.max(...agents.map((agent) => agent.id)) + 1
        : 1;

    setAgents((items) => [
      ...items,
      {
        id: nextId,
        name: `Specialist Agent ${nextId}`,
        role: "Specialist",
        model: "ModelNow Auto",
        purpose:
          "Handle a specialized part of the workflow.",
        status: "Standby",
        quality: 82,
        latency: 900,
        cost: 0.11,
        priority: nextId,
      },
    ]);
  };

  const movePriority = (
    id: number,
    direction: "up" | "down"
  ) => {
    setAgents((items) => {
      const sorted = [...items].sort(
        (a, b) => a.priority - b.priority
      );

      const index = sorted.findIndex(
        (agent) => agent.id === id
      );

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= sorted.length
      ) {
        return items;
      }

      const current = sorted[index];
      const target = sorted[targetIndex];

      const currentPriority = current.priority;

      current.priority = target.priority;
      target.priority = currentPriority;

      return sorted;
    });
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <Users size={23} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  Multi-Agent Collaboration
                </h1>

                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Coordinate multiple specialized AI agents to
                solve complex tasks collaboratively.
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
        <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Bot size={18} />}
            title="Active Agents"
            value={`${activeAgents}`}
            description={`${standbyAgents} agents on standby`}
          />

          <MetricCard
            icon={<BarChart3 size={18} />}
            title="Average Quality"
            value={`${averageQuality}%`}
            description="Across agent pool"
          />

          <MetricCard
            icon={<Clock3 size={18} />}
            title="Average Latency"
            value={`${averageLatency}ms`}
            description="Average execution time"
          />

          <MetricCard
            icon={<DollarSign size={18} />}
            title="Average Cost"
            value={`$${averageCost}`}
            description="Estimated cost per agent task"
          />
        </section>

        <div className="grid gap-7 xl:grid-cols-[1fr_380px]">
          <div className="space-y-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Network size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Collaboration Strategy
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose how agents communicate and coordinate
                    tasks.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <ModeButton
                  active={
                    collaborationMode === "Automatic"
                  }
                  icon={<Zap size={18} />}
                  title="Automatic"
                  description="AI decides how agents should collaborate."
                  onClick={() =>
                    setCollaborationMode("Automatic")
                  }
                />

                <ModeButton
                  active={
                    collaborationMode === "Sequential"
                  }
                  icon={<ArrowUp size={18} />}
                  title="Sequential"
                  description="Agents execute tasks one after another."
                  onClick={() =>
                    setCollaborationMode("Sequential")
                  }
                />

                <ModeButton
                  active={
                    collaborationMode === "Parallel"
                  }
                  icon={<GitBranch size={18} />}
                  title="Parallel"
                  description="Independent agents work simultaneously."
                  onClick={() =>
                    setCollaborationMode("Parallel")
                  }
                />

                <ModeButton
                  active={
                    collaborationMode === "Hierarchical"
                  }
                  icon={<Layers size={18} />}
                  title="Hierarchical"
                  description="A lead agent coordinates specialized agents."
                  onClick={() =>
                    setCollaborationMode("Hierarchical")
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Agent Team
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure the agents that can participate in
                    workflows.
                  </p>
                </div>

                <button
                  onClick={addAgent}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add Agent
                </button>
              </div>

              <div className="space-y-3">
                {[...agents]
                  .sort(
                    (a, b) =>
                      a.priority - b.priority
                  )
                  .map((agent, index) => (
                    <AgentRow
                      key={agent.id}
                      agent={agent}
                      index={index}
                      onToggle={() =>
                        toggleAgentStatus(agent.id)
                      }
                      onDelete={() =>
                        deleteAgent(agent.id)
                      }
                      onMoveUp={() =>
                        movePriority(
                          agent.id,
                          "up"
                        )
                      }
                      onMoveDown={() =>
                        movePriority(
                          agent.id,
                          "down"
                        )
                      }
                    />
                  ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <MessageSquare size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Collaboration Rules
                  </h2>

                  <p className="text-sm text-gray-500">
                    Control how agents share information and
                    hand off work.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onToggle={() =>
                      toggleRule(rule.id)
                    }
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <button
                onClick={() =>
                  setShowAdvanced(!showAdvanced)
                }
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <Settings2 size={19} />
                  </div>

                  <div className="text-left">
                    <h2 className="font-semibold">
                      Advanced Collaboration Settings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Configure memory, approvals and execution
                      limits.
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
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                  <SettingToggle
                    title="Shared Memory"
                    description="Allow participating agents to read shared workflow context."
                    enabled={sharedMemory}
                    onToggle={() =>
                      setSharedMemory(!sharedMemory)
                    }
                  />

                  <SettingToggle
                    title="Automatic Agent Handoff"
                    description="Automatically transfer tasks between specialized agents."
                    enabled={agentHandoff}
                    onToggle={() =>
                      setAgentHandoff(!agentHandoff)
                    }
                  />

                  <SettingToggle
                    title="Parallel Execution"
                    description="Allow independent agents to execute simultaneously."
                    enabled={parallelExecution}
                    onToggle={() =>
                      setParallelExecution(
                        !parallelExecution
                      )
                    }
                  />

                  <SettingToggle
                    title="Human Approval"
                    description="Require human approval before sensitive actions."
                    enabled={humanApproval}
                    onToggle={() =>
                      setHumanApproval(!humanApproval)
                    }
                  />

                  <SettingToggle
                    title="Failure Recovery"
                    description="Retry or delegate tasks when an agent fails."
                    enabled={failureRecovery}
                    onToggle={() =>
                      setFailureRecovery(
                        !failureRecovery
                      )
                    }
                  />

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Maximum Agents Per Workflow
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Limits the number of agents that can
                          participate.
                        </p>
                      </div>

                      <span className="text-sm font-semibold">
                        {maxAgents}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={maxAgents}
                      onChange={(event) =>
                        setMaxAgents(
                          Number(event.target.value)
                        )
                      }
                      className="w-full accent-black"
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Team Status
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Current multi-agent configuration
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Activity size={17} />
                </div>
              </div>

              <div className="space-y-4">
                <StatusRow
                  label="Collaboration"
                  value={collaborationMode}
                />

                <StatusRow
                  label="Active Agents"
                  value={`${activeAgents}`}
                />

                <StatusRow
                  label="Shared Memory"
                  value={
                    sharedMemory
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusRow
                  label="Handoff"
                  value={
                    agentHandoff
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusRow
                  label="Parallel Execution"
                  value={
                    parallelExecution
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">
                Team Performance
              </h2>

              <PerformanceMetric
                icon={<BarChart3 size={17} />}
                label="Quality"
                value={`${averageQuality}%`}
                progress={averageQuality}
              />

              <PerformanceMetric
                icon={<Clock3 size={17} />}
                label="Latency Efficiency"
                value={`${Math.max(
                  0,
                  100 -
                    Math.round(
                      averageLatency / 30
                    )
                )}%`}
                progress={Math.max(
                  0,
                  100 -
                    Math.round(
                      averageLatency / 30
                    )
                )}
              />

              <PerformanceMetric
                icon={<DollarSign size={17} />}
                label="Cost Efficiency"
                value={`$${averageCost}`}
                progress={Math.max(
                  10,
                  Math.min(
                    100,
                    100 -
                      Math.round(
                        Number(averageCost) * 100
                      )
                  )
                )}
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck
                  size={20}
                  className="text-gray-500"
                />

                <div>
                  <h2 className="font-semibold">
                    Governance
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Multi-agent safety controls
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <GovernanceRow
                  label="Human Approval"
                  enabled={humanApproval}
                />

                <GovernanceRow
                  label="Failure Recovery"
                  enabled={failureRecovery}
                />

                <GovernanceRow
                  label="Shared Memory"
                  enabled={sharedMemory}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-semibold">
                Quick Actions
              </h2>

              <div className="space-y-2">
                <QuickAction
                  icon={<Plus size={16} />}
                  title="Add Agent"
                  onClick={addAgent}
                />

                <QuickAction
                  icon={<Play size={16} />}
                  title="Test Collaboration"
                />

                <QuickAction
                  icon={<Network size={16} />}
                  title="View Agent Graph"
                />

                <QuickAction
                  icon={<BarChart3 size={16} />}
                  title="Collaboration Analytics"
                />

                <QuickAction
                  icon={<Settings2 size={16} />}
                  title="Advanced Settings"
                  onClick={() =>
                    setShowAdvanced(true)
                  }
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
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </div>

      <p className="text-xs font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-black bg-gray-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            active
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {title}
            </span>

            {active && (
              <CheckCircle2
                size={14}
                className="text-green-600"
              />
            )}
          </div>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function AgentRow({
  agent,
  index,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  agent: Agent;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const statusClass =
    agent.status === "Active"
      ? "bg-green-50 text-green-700"
      : agent.status === "Standby"
        ? "bg-yellow-50 text-yellow-700"
        : "bg-gray-100 text-gray-500";

  const roleClass =
    agent.role === "Planner"
      ? "bg-blue-50 text-blue-700"
      : agent.role === "Researcher"
        ? "bg-purple-50 text-purple-700"
        : agent.role === "Executor"
          ? "bg-orange-50 text-orange-700"
          : agent.role === "Reviewer"
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-600";

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              {agent.name}
            </h3>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${roleClass}`}
            >
              {agent.role}
            </span>

            <span className="text-[10px] text-gray-400">
              {agent.model}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusClass}`}
            >
              {agent.status}
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {agent.purpose}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SmallMetric
              label="Quality"
              value={`${agent.quality}%`}
            />

            <SmallMetric
              label="Latency"
              value={`${agent.latency}ms`}
            />

            <SmallMetric
              label="Cost"
              value={`$${agent.cost}`}
            />

            <SmallMetric
              label="Priority"
              value={`#${agent.priority}`}
            />
          </div>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            onClick={onMoveUp}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Move up"
          >
            <ArrowUp size={14} />
          </button>

          <button
            onClick={onMoveDown}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Move down"
          >
            <ArrowDown size={14} />
          </button>

          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Toggle agent"
          >
            {agent.status === "Active" ? (
              <Pause size={15} />
            ) : (
              <Play size={15} />
            )}
          </button>

          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Edit agent"
          >
            <Edit3 size={15} />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete agent"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-semibold text-gray-700">
        {value}
      </p>
    </div>
  );
}

function RuleRow({
  rule,
  onToggle,
}: {
  rule: CollaborationRule;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {rule.enabled ? (
          <CheckCircle2
            size={18}
            className="mt-0.5 text-green-500"
          />
        ) : (
          <Circle
            size={18}
            className="mt-0.5 text-gray-300"
          />
        )}

        <div>
          <p className="text-sm font-medium">
            {rule.name}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {rule.description}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          rule.enabled ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            rule.enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingToggle({
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
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
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

function PerformanceMetric({
  icon,
  label,
  value,
  progress,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            {icon}
          </span>

          <span className="text-xs font-medium text-gray-600">
            {label}
          </span>
        </div>

        <span className="text-xs font-semibold">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, progress)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function GovernanceRow({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <span className="text-xs font-medium text-gray-700">
        {label}
      </span>

      <span
        className={`flex items-center gap-1.5 text-[11px] font-medium ${
          enabled
            ? "text-green-600"
            : "text-gray-400"
        }`}
      >
        {enabled ? (
          <CheckCircle2 size={14} />
        ) : (
          <Circle size={14} />
        )}

        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-xs font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50"
    >
      <span className="text-gray-500">
        {icon}
      </span>

      <span className="font-medium">
        {title}
      </span>
    </button>
  );
}