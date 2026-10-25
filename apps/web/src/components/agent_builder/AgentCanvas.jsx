"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  History,
  Layers,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings2,
  Shield,
  TestTube2,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const initialSteps = [
  {
    id: "goal",
    title: "Understand goal",
    description: "Read the user request and identify the expected business outcome.",
    type: "Reasoning",
    status: "Ready",
    icon: Brain,
  },
  {
    id: "research",
    title: "Research customer",
    description: "Search CRM and knowledge sources for relevant customer context.",
    type: "Knowledge",
    status: "Ready",
    icon: Search,
  },
  {
    id: "route",
    title: "Choose tools",
    description: "Select the safest and lowest-cost tools for this task.",
    type: "Decision",
    status: "Ready",
    icon: GitBranch,
  },
  {
    id: "approval",
    title: "Check approval",
    description: "Request human approval when an action requires elevated access.",
    type: "Control",
    status: "Ready",
    icon: Shield,
  },
  {
    id: "execute",
    title: "Execute action",
    description: "Run approved tools and collect the resulting outputs.",
    type: "Execution",
    status: "Ready",
    icon: Zap,
  },
  {
    id: "memory",
    title: "Store memory",
    description: "Save useful context for future agent interactions.",
    type: "Memory",
    status: "Ready",
    icon: Database,
  },
];

const capabilityGroups = [
  {
    title: "Knowledge",
    items: [
      {
        name: "Customer RAG",
        description: "Search customer documents",
        icon: Search,
      },
      {
        name: "Long-term Memory",
        description: "Remember important context",
        icon: History,
      },
      {
        name: "Web Research",
        description: "External research",
        icon: Layers,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        name: "CRM API",
        description: "Customer records",
        icon: Server,
      },
      {
        name: "Database",
        description: "Query operational data",
        icon: Database,
      },
      {
        name: "Browser",
        description: "Complete web actions",
        icon: Search,
      },
    ],
  },
  {
    title: "Agents",
    items: [
      {
        name: "Research Agent",
        description: "Deep information gathering",
        icon: Bot,
      },
      {
        name: "Sales Agent",
        description: "Lead qualification",
        icon: UserRound,
      },
      {
        name: "Support Agent",
        description: "Customer support tasks",
        icon: Users,
      },
    ],
  },
  {
    title: "Controls",
    items: [
      {
        name: "Human Approval",
        description: "Require human review",
        icon: Shield,
      },
      {
        name: "Guardrails",
        description: "Policy enforcement",
        icon: Lock,
      },
      {
        name: "Budget Limit",
        description: "Control agent spend",
        icon: Settings2,
      },
    ],
  },
];

const executionEvents = [
  {
    time: "00:00.084",
    title: "Goal received",
    detail: "New lead requires qualification and follow-up.",
    status: "Success",
    meta: "18 tokens",
  },
  {
    time: "00:00.412",
    title: "Agent brain planned task",
    detail: "Generated 5-step adaptive execution plan.",
    status: "Success",
    meta: "GPT-5 · 0.4s",
  },
  {
    time: "00:01.102",
    title: "Customer RAG searched",
    detail: "Found 12 relevant documents.",
    status: "Success",
    meta: "2,840 tokens",
  },
  {
    time: "00:01.884",
    title: "Research Agent delegated",
    detail: "Sub-agent assigned to gather account signals.",
    status: "Success",
    meta: "Claude · 0.8s",
  },
  {
    time: "00:02.330",
    title: "Risk detected",
    detail: "Outbound action requires approval.",
    status: "Warning",
    meta: "Policy rule 14",
  },
  {
    time: "00:02.614",
    title: "Human approval",
    detail: "Approval requested from Sales Operations.",
    status: "Pending",
    meta: "Waiting",
  },
];

const metrics = [
  {
    label: "Success rate",
    value: "98.7%",
    detail: "+2.4% this week",
  },
  {
    label: "Avg. latency",
    value: "2.8s",
    detail: "-18% this week",
  },
  {
    label: "Avg. cost",
    value: "$0.018",
    detail: "-11% this week",
  },
  {
    label: "Quality score",
    value: "94",
    detail: "+7 points",
  },
];

function IconBox({ icon: Icon, className = "" }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 ${className}`}
    >
      <Icon size={17} />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Warning: "bg-amber-50 text-amber-700 border-amber-200",
    Pending: "bg-gray-100 text-gray-600 border-gray-200",
    Ready: "bg-blue-50 text-blue-700 border-blue-200",
    Running: "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[10px] font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <IconBox icon={Icon} />

      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function CapabilityCard({ item, selected, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-gray-900 bg-gray-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-400"
      }`}
    >
      <div className="flex items-start gap-3">
        <IconBox icon={Icon} className={selected ? "bg-gray-900 text-white" : ""} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-xs font-semibold text-gray-900">
              {item.name}
            </div>
            {selected && <CheckCircle2 size={14} className="shrink-0 text-gray-700" />}
          </div>

          <div className="mt-1 text-[11px] leading-4 text-gray-500">
            {item.description}
          </div>
        </div>
      </div>
    </button>
  );
}

function PlanStep({ step, index, active, onClick }) {
  const Icon = step.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-xl border p-4 text-left transition ${
        active
          ? "border-gray-900 bg-white shadow-md"
          : "border-gray-200 bg-gray-50 hover:bg-white"
      }`}
    >
      {index < initialSteps.length - 1 && (
        <div className="absolute left-[26px] top-[70px] h-8 w-px bg-gray-200" />
      )}

      <div className="relative flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            active ? "bg-gray-900 text-white" : "bg-white text-gray-600"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Step {index + 1}
              </div>

              <div className="mt-1 text-xs font-semibold text-gray-900">
                {step.title}
              </div>
            </div>

            <StatusBadge status={step.status} />
          </div>

          <p className="mt-2 text-[11px] leading-5 text-gray-500">
            {step.description}
          </p>

          <div className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-500">
            {step.type}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AgentCanvas({ initialAgentName = "Sales Lead Agent" }) {
  const [agentName, setAgentName] = useState(initialAgentName);
  const [agentGoal, setAgentGoal] = useState(
    "Qualify new sales leads, research account context, and prepare the safest next action."
  );

  const [selectedCapability, setSelectedCapability] = useState("Customer RAG");
  const [selectedStep, setSelectedStep] = useState("goal");
  const [selectedModel, setSelectedModel] = useState("Adaptive routing");
  const [temperature, setTemperature] = useState("0.2");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [approvalEnabled, setApprovalEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState("Builder");
  const [isRunning, setIsRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const [testInput, setTestInput] = useState(
    "New lead received from john@techcorp.com. Company: TechCorp. Interested in your AI solution."
  );

  const [testOutput, setTestOutput] = useState(
    "Ready to test this agent. The agent will reason over the goal, inspect available context, choose capabilities, and generate an execution plan."
  );

  const allCapabilities = useMemo(
    () => capabilityGroups.flatMap((group) => group.items),
    []
  );

  const selectedCapabilityData =
    allCapabilities.find((item) => item.name === selectedCapability) ||
    allCapabilities[0];

  const selectedStepData =
    initialSteps.find((step) => step.id === selectedStep) || initialSteps[0];

  const runAgent = () => {
    setIsRunning(true);
    setRunCount((value) => value + 1);

    setTimeout(() => {
      setIsRunning(false);

      setTestOutput(
        [
          "Agent completed successfully.",
          "",
          `Goal: ${agentGoal}`,
          `Selected capability: ${selectedCapabilityData.name}`,
          `Model policy: ${selectedModel}`,
          `Memory: ${memoryEnabled ? "Enabled" : "Disabled"}`,
          `Human approval: ${approvalEnabled ? "Enabled" : "Disabled"}`,
          "",
          "Generated plan:",
          "1. Understand the lead request",
          "2. Search customer context",
          "3. Evaluate lead quality",
          "4. Generate recommended next action",
          approvalEnabled
            ? "5. Request approval before external action"
            : "5. Execute allowed action",
        ].join("\n")
      );
    }, 900);
  };

  const resetTest = () => {
    setTestInput(
      "New lead received from john@techcorp.com. Company: TechCorp. Interested in your AI solution."
    );

    setTestOutput(
      "Ready to test this agent. The agent will reason over the goal, inspect available context, choose capabilities, and generate an execution plan."
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-gray-900">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
                <Bot size={18} />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  ModelNow Agent Builder
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span>AI-native orchestration workspace</span>
                  <span className="text-gray-300">•</span>
                  <span>Agent v1.4</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("Builder")}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  activeTab === "Builder"
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                Builder
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("Runtime")}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  activeTab === "Runtime"
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                Runtime
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("Test")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  activeTab === "Test"
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                <TestTube2 size={14} />
                Test
              </button>

              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Deploy
              </button>
            </div>
          </div>
        </header>

        <div className="border-b border-gray-200 bg-white">
          <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.2fr_2fr_1fr]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Agent
              </div>

              <input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="mt-1 w-full border-0 bg-transparent p-0 text-lg font-semibold outline-none"
              />

              <div className="mt-1 text-xs text-gray-500">
                Adaptive agent with reasoning, memory, tools and approvals.
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Agent goal
              </div>

              <textarea
                value={agentGoal}
                onChange={(e) => setAgentGoal(e.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-5 outline-none focus:border-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  Runs
                </div>
                <div className="mt-1 text-lg font-semibold">{runCount}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  Status
                </div>
                <div className="mt-1">
                  <StatusBadge status={isRunning ? "Running" : "Ready"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "Builder" && (
          <div className="grid min-h-0 flex-1 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
            <aside className="border-r border-gray-200 bg-white p-4">
              <SectionTitle
                icon={Layers}
                title="AI capability library"
                description="Choose the capabilities the agent can reason over."
              />

              <div className="space-y-5">
                {capabilityGroups.map((group) => (
                  <div key={group.title}>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {group.title}
                    </div>

                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <CapabilityCard
                          key={item.name}
                          item={item}
                          selected={selectedCapability === item.name}
                          onClick={() => setSelectedCapability(item.name)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section className="min-w-0 bg-[#f6f7fb] p-5">
              <div className="mx-auto max-w-5xl space-y-5">
                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <SectionTitle
                      icon={Brain}
                      title="Agent Brain"
                      description="The agent decides what to do next instead of relying on a fixed trigger-to-node chain."
                    />

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                        Goal
                      </div>

                      <div className="mt-2 text-sm font-semibold">
                        {agentGoal}
                      </div>

                      <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <IconBox
                            icon={Brain}
                            className="bg-gray-900 text-white"
                          />

                          <div>
                            <div className="text-xs font-semibold">
                              Adaptive reasoning
                            </div>

                            <div className="mt-1 text-[11px] text-gray-500">
                              Goal → reasoning → decision → execution
                            </div>
                          </div>
                        </div>

                        <ChevronDown size={15} className="text-gray-400" />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Bot size={15} />
                          Model router
                        </div>

                        <div className="mt-2 text-[11px] leading-5 text-gray-500">
                          Chooses the most suitable model based on quality,
                          latency and cost.
                        </div>

                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none"
                        >
                          <option>Adaptive routing</option>
                          <option>Quality first</option>
                          <option>Lowest cost</option>
                          <option>Lowest latency</option>
                        </select>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Clock3 size={15} />
                          Reasoning controls
                        </div>

                        <div className="mt-2 text-[11px] leading-5 text-gray-500">
                          Adjust how aggressively the agent reasons before acting.
                        </div>

                        <select
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none"
                        >
                          <option value="0.1">Focused · 0.1</option>
                          <option value="0.2">Balanced · 0.2</option>
                          <option value="0.4">Creative · 0.4</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <SectionTitle
                      icon={Zap}
                      title="Selected capability"
                      description="Inspect and configure the active intelligence layer."
                    />

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start gap-3">
                        <IconBox icon={selectedCapabilityData.icon} />

                        <div className="min-w-0">
                          <div className="text-sm font-semibold">
                            {selectedCapabilityData.name}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {selectedCapabilityData.description}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <span className="text-xs text-gray-600">
                            Capability status
                          </span>
                          <StatusBadge status="Ready" />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <span className="text-xs text-gray-600">
                            Access policy
                          </span>
                          <span className="text-xs font-medium">Approved</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                          <span className="text-xs text-gray-600">
                            Max latency
                          </span>
                          <span className="text-xs font-medium">3.0s</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-gray-200 p-3"
                        >
                          <div className="text-[10px] uppercase tracking-wide text-gray-400">
                            {metric.label}
                          </div>
                          <div className="mt-1 text-lg font-semibold">
                            {metric.value}
                          </div>
                          <div className="mt-1 text-[10px] text-gray-500">
                            {metric.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    icon={GitBranch}
                    title="Adaptive execution plan"
                    description="This plan can change at runtime depending on data, tool results, policies and model confidence."
                  />

                  <div className="space-y-3">
                    {initialSteps.map((step, index) => (
                      <PlanStep
                        key={step.id}
                        step={step}
                        index={index}
                        active={selectedStep === step.id}
                        onClick={() => setSelectedStep(step.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <SectionTitle
                      icon={Settings2}
                      title="Runtime policies"
                      description="Control memory, approvals and execution boundaries."
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                        <div>
                          <div className="text-xs font-semibold">Long-term memory</div>
                          <div className="mt-1 text-[11px] text-gray-500">
                            Persist useful user and account context.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMemoryEnabled((value) => !value)}
                          className={`relative h-6 w-11 rounded-full transition ${
                            memoryEnabled ? "bg-gray-900" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              memoryEnabled ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                        <div>
                          <div className="text-xs font-semibold">Human approval</div>
                          <div className="mt-1 text-[11px] text-gray-500">
                            Pause before external or sensitive actions.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setApprovalEnabled((value) => !value)}
                          className={`relative h-6 w-11 rounded-full transition ${
                            approvalEnabled ? "bg-gray-900" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              approvalEnabled ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <SectionTitle
                      icon={Activity}
                      title="Current reasoning state"
                      description="The selected plan step is reflected in the live agent state."
                    />

                    <div className="rounded-xl bg-gray-900 p-5 text-white">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-gray-400">
                        Active step
                      </div>

                      <div className="mt-2 text-sm font-semibold">
                        {selectedStepData.title}
                      </div>

                      <div className="mt-2 text-xs leading-5 text-gray-300">
                        {selectedStepData.description}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-200">
                          {selectedStepData.type}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-200">
                          Model: {selectedModel}
                        </span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-200">
                          Memory: {memoryEnabled ? "on" : "off"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>
                      <div className="text-xs font-semibold">
                        Agent configuration looks valid
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500">
                        Goal, capabilities, model policy and controls are configured.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("Test")}
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-black"
                  >
                    <TestTube2 size={14} />
                    Open test workspace
                  </button>
                </div>
              </div>
            </section>

            <aside className="border-l border-gray-200 bg-white p-4">
              <SectionTitle
                icon={Bot}
                title="AI Copilot"
                description="Ask the builder to improve the agent automatically."
              />

              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Suggestion
                  </div>

                  <div className="mt-2 text-xs font-semibold">
                    Add an approval checkpoint before sending external emails.
                  </div>

                  <div className="mt-2 text-[11px] leading-5 text-gray-500">
                    This reduces accidental outbound actions and makes the agent
                    safer for enterprise workflows.
                  </div>

                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-medium text-white"
                  >
                    Apply suggestion
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-semibold">Quick actions</div>

                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-[11px]"
                    >
                      Optimize cost
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-[11px]"
                    >
                      Improve quality
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-[11px]"
                    >
                      Add guardrails
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-[11px]"
                    >
                      Reduce latency
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold">Agent health</div>
                    <Activity size={14} className="text-emerald-600" />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Quality</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 w-[94%] rounded-full bg-gray-900" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Reliability</span>
                        <span className="font-medium">98%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 w-[98%] rounded-full bg-gray-900" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Safety</span>
                        <span className="font-medium">97%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 w-[97%] rounded-full bg-gray-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === "Runtime" && (
          <section className="flex-1 bg-[#f6f7fb] p-5">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    icon={Activity}
                    title="Live execution trace"
                    description="Observe the agent's reasoning, tools, decisions, approvals and outcomes."
                  />

                  <div className="space-y-3">
                    {executionEvents.map((event) => (
                      <div
                        key={`${event.time}-${event.title}`}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                event.status === "Warning"
                                  ? "bg-amber-50 text-amber-700"
                                  : event.status === "Pending"
                                  ? "bg-gray-100 text-gray-500"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {event.status === "Warning" ? (
                                <Shield size={14} />
                              ) : event.status === "Pending" ? (
                                <Clock3 size={14} />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-semibold">
                                {event.title}
                              </div>

                              <div className="mt-1 text-[11px] leading-5 text-gray-500">
                                {event.detail}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="font-mono text-[10px] text-gray-400">
                              {event.time}
                            </div>
                            <div className="mt-1 text-[10px] text-gray-500">
                              {event.meta}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <SectionTitle
                      icon={Server}
                      title="Runtime health"
                      description="Current agent runtime status."
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <span className="text-xs text-gray-600">Status</span>
                        <StatusBadge status="Running" />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <span className="text-xs text-gray-600">Active tools</span>
                        <span className="text-xs font-medium">4</span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <span className="text-xs text-gray-600">Sub-agents</span>
                        <span className="text-xs font-medium">2</span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                        <span className="text-xs text-gray-600">Open approvals</span>
                        <span className="text-xs font-medium">1</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <SectionTitle
                      icon={Zap}
                      title="Optimization"
                      description="Live suggestions from the optimization engine."
                    />

                    <div className="space-y-3">
                      <div className="rounded-xl bg-gray-900 p-4 text-white">
                        <div className="text-xs font-semibold">
                          Use smaller model for classification
                        </div>
                        <div className="mt-1 text-[11px] leading-5 text-gray-300">
                          Estimated 31% cost reduction with no expected quality loss.
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <div className="text-xs font-semibold">
                          Cache customer context
                        </div>
                        <div className="mt-1 text-[11px] leading-5 text-gray-500">
                          Estimated latency reduction: 420ms.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Test" && (
          <section className="flex-1 bg-[#f6f7fb] p-5">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <SectionTitle
                      icon={TestTube2}
                      title="Agent test workspace"
                      description="Run realistic inputs against the current agent configuration."
                    />

                    <button
                      type="button"
                      onClick={resetTest}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-medium text-gray-600"
                    >
                      <RefreshCw size={13} />
                      Reset
                    </button>
                  </div>

                  <label className="block">
                    <div className="mb-2 text-xs font-semibold">Test input</div>

                    <textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      rows={11}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-5 outline-none focus:border-gray-400"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={runAgent}
                    disabled={isRunning}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play size={14} />
                    {isRunning ? "Running agent..." : "Run agent"}
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <SectionTitle
                    icon={Bot}
                    title="Agent result"
                    description="Latest output from the test execution."
                  />

                  <div className="rounded-xl border border-gray-200 bg-gray-950 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">
                        runtime output
                      </div>

                      <StatusBadge status={isRunning ? "Running" : "Success"} />
                    </div>

                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-6 text-gray-200">
                      {testOutput}
                    </pre>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">
                        Model
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {selectedModel}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">
                        Capability
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {selectedCapabilityData.name}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">
                        Memory
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {memoryEnabled ? "Enabled" : "Disabled"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">
                        Approval
                      </div>
                      <div className="mt-1 text-xs font-semibold">
                        {approvalEnabled ? "Required" : "Automatic"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="border-t border-gray-200 bg-white">
          <div className="grid grid-cols-2 divide-x divide-gray-200 md:grid-cols-6">
            <div className="p-3">
              <div className="text-[9px] uppercase tracking-wide text-gray-400">
                Execution
              </div>
              <div className="mt-1 text-xs font-semibold">Adaptive</div>
            </div>

            <div className="p-3">
              <div className="text-[9px] uppercase tracking-wide text-gray-400">
                Model
              </div>
              <div className="mt-1 text-xs font-semibold">{selectedModel}</div>
            </div>

            <div className="p-3">
              <div className="text-[9px] uppercase tracking-wide text-gray-400">
                Tokens
              </div>
              <div className="mt-1 text-xs font-semibold">4,812</div>
            </div>

            <div className="p-3">
              <div className="text-[9px] uppercase tracking-wide text-gray-400">
                Cost
              </div>
              <div className="mt-1 text-xs font-semibold">$0.018</div>
            </div>

            <div className="p-3">
              <div className="text-[9px] uppercase tracking-wide text-gray-400">
                Latency
              </div>
              <div className="mt-1 text-xs font-semibold">2.8s</div>
            </div>

            <div className="p-3">
              <div className="text-[9px] uppercase tracking-wide text-gray-400">
                Quality
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold">
                <CheckCircle2 size={13} className="text-emerald-600" />
                94%
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}