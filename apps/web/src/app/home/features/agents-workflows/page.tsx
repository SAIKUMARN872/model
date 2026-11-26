"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Database,
  FileText,
  Globe,
  GripVertical,
  Pause,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
  X,
  Zap,
} from "lucide-react";

type WorkflowStep = {
  id: number;
  title: string;
  description: string;
  tool: string;
  status: "pending" | "running" | "completed";
};

const initialSteps: WorkflowStep[] = [
  {
    id: 1,
    title: "Understand request",
    description: "Analyze the user's intent, context and required outcome.",
    tool: "AI Planner",
    status: "pending",
  },
  {
    id: 2,
    title: "Retrieve information",
    description: "Search connected business knowledge and relevant data.",
    tool: "Knowledge Search",
    status: "pending",
  },
  {
    id: 3,
    title: "Execute task",
    description: "Use the selected tools and services to perform the task.",
    tool: "Browser / API",
    status: "pending",
  },
  {
    id: 4,
    title: "Validate result",
    description: "Check the output against the requested requirements.",
    tool: "AI Evaluator",
    status: "pending",
  },
  {
    id: 5,
    title: "Return result",
    description: "Present the completed result to the user.",
    tool: "ModelNow Chat",
    status: "pending",
  },
];

export default function AgentWorkflowsPage() {
  const [agent, setAgent] = useState("Customer Support Agent");
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

  const agents = [
    {
      name: "Customer Support Agent",
      description: "Handles customer questions and support workflows.",
      icon: Users,
    },
    {
      name: "CRM Agent",
      description: "Works with customer records and CRM workflows.",
      icon: Database,
    },
    {
      name: "HR Agent",
      description: "Automates employee and HR processes.",
      icon: Users,
    },
    {
      name: "Sales Agent",
      description: "Supports leads, sales research and follow-ups.",
      icon: Zap,
    },
    {
      name: "Finance Agent",
      description: "Assists with finance analysis and workflows.",
      icon: Database,
    },
    {
      name: "Research Agent",
      description: "Researches websites, documents and knowledge sources.",
      icon: Globe,
    },
  ];

  const generateWorkflow = () => {
    if (!task.trim()) {
      setTask(
        "Research a customer issue, check the CRM record, prepare a response and update the support workflow."
      );
    }

    setSteps(
      initialSteps.map((step) => ({
        ...step,
        status: "pending",
      }))
    );

    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
  };

  const startWorkflow = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);

    setSteps(
      initialSteps.map((step, index) => ({
        ...step,
        status: index === 0 ? "running" : "pending",
      }))
    );
  };

  const pauseWorkflow = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeWorkflow = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const stopWorkflow = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);

    setSteps(
      initialSteps.map((step) => ({
        ...step,
        status: "pending",
      }))
    );
  };

  const nextStep = () => {
    if (!isRunning) return;

    if (currentStep === 2) {
      setIsRunning(false);
      setShowApproval(true);
      return;
    }

    setSteps((previous) =>
      previous.map((step, index) => {
        if (index <= currentStep) {
          return {
            ...step,
            status: "completed",
          };
        }

        if (index === currentStep + 1) {
          return {
            ...step,
            status: "running",
          };
        }

        return step;
      })
    );

    if (currentStep < steps.length - 1) {
      setCurrentStep((value) => value + 1);
    } else {
      setIsRunning(false);
    }
  };

  const approveAction = () => {
    setShowApproval(false);
    setIsRunning(true);

    setSteps((previous) =>
      previous.map((step, index) => {
        if (index <= 2) {
          return {
            ...step,
            status: "completed",
          };
        }

        if (index === 3) {
          return {
            ...step,
            status: "running",
          };
        }

        return step;
      })
    );

    setCurrentStep(3);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: steps.length + 1,
      title: "New workflow action",
      description: "Configure an additional action for this agent.",
      tool: "Select Tool",
      status: "pending",
    };

    setSteps((previous) => [...previous, newStep]);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <a
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </a>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Bot size={19} />
              </div>

              <div>
                <h1 className="text-lg font-semibold">Agent Workflows</h1>
                <p className="text-xs text-slate-500">
                  Build intelligent multi-step AI agents
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            Create agent
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <section className="space-y-6">
          {/* Agent selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Select AI Agent</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Choose the agent responsible for this workflow.
                </p>
              </div>

              <Sparkles size={20} className="text-purple-500" />
            </div>

            <div className="relative">
              <select
                value={agent}
                onChange={(event) => setAgent(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-blue-400 focus:bg-white"
              >
                {agents.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {agents.slice(0, 3).map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => setAgent(item.name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      agent === item.name
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        agent === item.name
                          ? "text-blue-600"
                          : "text-slate-500"
                      }
                    />

                    <p className="mt-3 text-xs font-semibold">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Brain size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Agent Objective</h2>
                <p className="text-xs text-slate-500">
                  Describe what the agent should accomplish.
                </p>
              </div>
            </div>

            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="Example: Research a customer issue, check the CRM, prepare a response and update the support workflow..."
              className="min-h-[130px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                onClick={generateWorkflow}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Sparkles size={16} />
                Generate workflow
              </button>
            </div>
          </div>

          {/* Workflow builder */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-6">
              <div>
                <h2 className="font-semibold">Workflow Builder</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {agent} execution workflow
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isRunning && !isPaused && (
                  <button
                    onClick={startWorkflow}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Play size={14} />
                    Run workflow
                  </button>
                )}

                {isRunning && (
                  <>
                    <button
                      onClick={pauseWorkflow}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                    >
                      <Pause size={14} />
                      Pause
                    </button>

                    <button
                      onClick={stopWorkflow}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Square size={13} />
                      Stop
                    </button>
                  </>
                )}

                {isPaused && (
                  <button
                    onClick={resumeWorkflow}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Play size={14} />
                    Resume
                  </button>
                )}

                <button
                  onClick={addStep}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                >
                  <Plus size={14} />
                  Add step
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id}>
                    <div
                      className={`group flex items-center gap-4 rounded-xl border p-4 transition ${
                        step.status === "running"
                          ? "border-blue-300 bg-blue-50"
                          : step.status === "completed"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <GripVertical
                        size={17}
                        className="shrink-0 text-slate-300"
                      />

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          step.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : step.status === "running"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          step.id
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {step.title}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                            {step.tool}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {step.description}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                          step.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : step.status === "running"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="ml-[66px] h-3 border-l border-dashed border-slate-300" />
                    )}
                  </div>
                ))}
              </div>

              {isRunning && (
                <button
                  onClick={nextStep}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Simulate next execution step
                </button>
              )}

              {!isRunning &&
                !isPaused &&
                currentStep === steps.length && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={17} />
                    Workflow completed successfully.
                  </div>
                )}
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold">Available Agent Tools</h2>
              <p className="mt-1 text-xs text-slate-500">
                Tools the agent can use during execution.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  name: "Browser Automation",
                  description: "Navigate and interact with websites.",
                  icon: Globe,
                },
                {
                  name: "Knowledge Search",
                  description: "Search enterprise knowledge.",
                  icon: FileText,
                },
                {
                  name: "CRM",
                  description: "Read and update customer records.",
                  icon: Database,
                },
                {
                  name: "API Connector",
                  description: "Connect external business APIs.",
                  icon: Zap,
                },
                {
                  name: "AI Model Router",
                  description: "Select the optimal AI model.",
                  icon: Brain,
                },
                {
                  name: "Evaluator",
                  description: "Validate generated results.",
                  icon: CheckCircle2,
                },
              ].map((tool) => {
                const Icon = tool.icon;

                return (
                  <div
                    key={tool.name}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <Icon size={18} className="text-blue-600" />

                    <h3 className="mt-3 text-xs font-semibold">
                      {tool.name}
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {tool.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Agent status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Bot size={21} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">{agent}</h2>
                <p className="text-xs text-slate-500">
                  AI workflow agent
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <StatusRow label="Planning Engine" status="Ready" />
              <StatusRow label="Tool Runtime" status="Ready" />
              <StatusRow label="Memory" status="Connected" />
              <StatusRow label="Safety Layer" status="Active" />
            </div>
          </div>

          {/* Workflow stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Workflow Stats</h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard value={steps.length.toString()} label="Steps" />
              <StatCard value="6" label="Tools" />
              <StatCard value="3" label="Models" />
              <StatCard value="1" label="Approval" />
            </div>
          </div>

          {/* Execution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 size={17} className="text-slate-600" />
              <h2 className="text-sm font-semibold">Execution Settings</h2>
            </div>

            <div className="space-y-4">
              <SettingRow label="Model routing" value="Automatic" />
              <SettingRow label="Memory mode" value="Contextual" />
              <SettingRow label="Tool access" value="Allowed" />
              <SettingRow label="Human approval" value="Required" />
            </div>
          </div>

          {/* Safety */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Human-in-the-loop
                </h2>

                <p className="mt-2 text-xs leading-5 text-amber-800">
                  Actions involving purchases, account changes, submissions or
                  other irreversible operations should require explicit user
                  approval.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Create Agent Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bot size={21} />
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  Create AI agent
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create a specialized agent that can use ModelNow tools and
                  workflows.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <input
                placeholder="Agent name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />

              <textarea
                placeholder="Describe what this agent should do..."
                className="min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CircleAlert size={21} />
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  Approval required
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The agent is ready to perform an action that may modify
                  external business data.
                </p>
              </div>

              <button
                onClick={() => setShowApproval(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold">Proposed action</p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Execute the configured workflow action and continue with
                validation.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproval(false);
                  stopWorkflow();
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Reject
              </button>

              <button
                onClick={approveAction}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Approve & continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusRow({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>

      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
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
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-lg font-bold">{value}</p>
      <p className="mt-1 text-[10px] text-slate-500">{label}</p>
    </div>
  );
}