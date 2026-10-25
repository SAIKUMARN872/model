"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  GitBranch,
  Lightbulb,
  ListChecks,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Zap,
} from "lucide-react";

type PlanStep = {
  id: number;
  title: string;
  description: string;
  type: "reasoning" | "tool" | "condition" | "action" | "approval";
  enabled: boolean;
};

type Strategy = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const strategies: Strategy[] = [
  {
    id: "adaptive",
    title: "Adaptive Planning",
    description:
      "Automatically creates and adjusts the execution plan based on the current task.",
    icon: Brain,
  },
  {
    id: "goal",
    title: "Goal Driven",
    description:
      "Breaks the main objective into smaller goals and completes them in sequence.",
    icon: Target,
  },
  {
    id: "reactive",
    title: "Reactive Planning",
    description:
      "Plans the next action dynamically after observing the result of the previous action.",
    icon: Zap,
  },
  {
    id: "structured",
    title: "Structured Planning",
    description:
      "Uses a predefined execution structure with controlled decision points.",
    icon: ListChecks,
  },
];

const initialSteps: PlanStep[] = [
  {
    id: 1,
    title: "Understand user objective",
    description:
      "Analyze the request, identify the expected outcome and extract important constraints.",
    type: "reasoning",
    enabled: true,
  },
  {
    id: 2,
    title: "Break objective into tasks",
    description:
      "Convert the main objective into smaller executable tasks.",
    type: "reasoning",
    enabled: true,
  },
  {
    id: 3,
    title: "Select required tools",
    description:
      "Identify APIs, knowledge sources, browser actions or other tools required for execution.",
    type: "tool",
    enabled: true,
  },
  {
    id: 4,
    title: "Evaluate conditions",
    description:
      "Check whether the current state satisfies the requirements for the next action.",
    type: "condition",
    enabled: true,
  },
  {
    id: 5,
    title: "Execute action",
    description:
      "Run the selected action and capture its result.",
    type: "action",
    enabled: true,
  },
  {
    id: 6,
    title: "Validate result",
    description:
      "Evaluate the result and determine whether the goal has been completed successfully.",
    type: "reasoning",
    enabled: true,
  },
  {
    id: 7,
    title: "Human approval",
    description:
      "Request human approval before executing sensitive or irreversible actions.",
    type: "approval",
    enabled: false,
  },
];

export default function PlanningPage() {
  const [strategy, setStrategy] = useState("adaptive");
  const [steps, setSteps] = useState<PlanStep[]>(initialSteps);
  const [maxSteps, setMaxSteps] = useState(12);
  const [maxIterations, setMaxIterations] = useState(5);
  const [planningDepth, setPlanningDepth] = useState(3);
  const [autoReplan, setAutoReplan] = useState(true);
  const [parallelPlanning, setParallelPlanning] = useState(true);
  const [validatePlan, setValidatePlan] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const enabledSteps = useMemo(
    () => steps.filter((step) => step.enabled),
    [steps]
  );

  const toggleStep = (id: number) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === id
          ? { ...step, enabled: !step.enabled }
          : step
      )
    );
    setSaved(false);
  };

  const deleteStep = (id: number) => {
    setSteps((current) =>
      current.filter((step) => step.id !== id)
    );
    setSaved(false);
  };

  const addStep = () => {
    const nextId =
      steps.length > 0
        ? Math.max(...steps.map((step) => step.id)) + 1
        : 1;

    setSteps((current) => [
      ...current,
      {
        id: nextId,
        title: `Custom planning step ${nextId}`,
        description:
          "Define a custom reasoning or execution step for this planning strategy.",
        type: "action",
        enabled: true,
      },
    ]);

    setSaved(false);
  };

  const moveStep = (
    id: number,
    direction: "up" | "down"
  ) => {
    setSteps((current) => {
      const index = current.findIndex(
        (step) => step.id === id
      );

      if (index === -1) return current;

      const newIndex =
        direction === "up" ? index - 1 : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= current.length
      ) {
        return current;
      }

      const updated = [...current];
      const [item] = updated.splice(index, 1);
      updated.splice(newIndex, 0, item);

      return updated;
    });

    setSaved(false);
  };

  const saveConfiguration = () => {
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/intelligence"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            >
              <ChevronRight
                size={18}
                className="rotate-180"
              />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">
                  Planning & Reasoning
                </h1>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Configure how your agent thinks, plans and executes
                complex tasks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <CheckCircle2 size={15} />
                Saved
              </span>
            )}

            <button
              onClick={saveConfiguration}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                <Brain size={22} />
              </div>

              <h2 className="text-2xl font-semibold">
                Intelligent task planning
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                The planning engine determines what the agent needs
                to do, breaks complex objectives into executable
                tasks, selects tools and continuously evaluates
                whether the current plan is still valid.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <Metric
                  label="Active steps"
                  value={String(enabledSteps.length)}
                />

                <Metric
                  label="Planning depth"
                  value={String(planningDepth)}
                />

                <Metric
                  label="Max iterations"
                  value={String(maxIterations)}
                />

                <Metric
                  label="Auto re-plan"
                  value={autoReplan ? "ON" : "OFF"}
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#111827] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Lightbulb size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Planning Engine
                  </p>

                  <p className="text-xs text-gray-400">
                    Dynamic execution intelligence
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <StatusLine
                  label="Goal decomposition"
                  enabled
                />
                <StatusLine
                  label="Tool selection"
                  enabled
                />
                <StatusLine
                  label="Plan validation"
                  enabled={validatePlan}
                />
                <StatusLine
                  label="Dynamic re-planning"
                  enabled={autoReplan}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Strategy */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Planning Strategy
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how the agent should generate and adapt
                  its execution plan.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {strategies.map((item) => {
                  const Icon = item.icon;
                  const selected =
                    strategy === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setStrategy(item.id);
                        setSaved(false);
                      }}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">
                              {item.title}
                            </h3>

                            {selected && (
                              <CheckCircle2
                                size={17}
                                className="text-green-600"
                              />
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Plan Steps */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    Execution Plan
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Define the sequence used by the planning engine.
                  </p>
                </div>

                <button
                  onClick={addStep}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                >
                  <Plus size={15} />
                  Add Step
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <PlanStepRow
                    key={step.id}
                    step={step}
                    index={index}
                    total={steps.length}
                    onToggle={toggleStep}
                    onDelete={deleteStep}
                    onMove={moveStep}
                  />
                ))}
              </div>
            </section>

            {/* Planning Settings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Planning Controls
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Control the depth, iteration limits and adaptive
                  behavior of the planner.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <NumberSetting
                  label="Maximum plan steps"
                  value={maxSteps}
                  min={1}
                  max={50}
                  onChange={(value) => {
                    setMaxSteps(value);
                    setSaved(false);
                  }}
                />

                <NumberSetting
                  label="Maximum iterations"
                  value={maxIterations}
                  min={1}
                  max={20}
                  onChange={(value) => {
                    setMaxIterations(value);
                    setSaved(false);
                  }}
                />

                <NumberSetting
                  label="Planning depth"
                  value={planningDepth}
                  min={1}
                  max={10}
                  onChange={(value) => {
                    setPlanningDepth(value);
                    setSaved(false);
                  }}
                />
              </div>

              <div className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
                <ToggleRow
                  icon={<Zap size={17} />}
                  title="Automatic re-planning"
                  description="Rebuild the plan when the current strategy is no longer valid."
                  enabled={autoReplan}
                  onChange={(value) => {
                    setAutoReplan(value);
                    setSaved(false);
                  }}
                />

                <ToggleRow
                  icon={<GitBranch size={17} />}
                  title="Parallel planning"
                  description="Allow independent tasks to be planned in parallel."
                  enabled={parallelPlanning}
                  onChange={(value) => {
                    setParallelPlanning(value);
                    setSaved(false);
                  }}
                />

                <ToggleRow
                  icon={<CheckCircle2 size={17} />}
                  title="Validate generated plans"
                  description="Check generated plans before execution begins."
                  enabled={validatePlan}
                  onChange={(value) => {
                    setValidatePlan(value);
                    setSaved(false);
                  }}
                />

                <ToggleRow
                  icon={<ShieldCheck size={17} />}
                  title="Require human approval"
                  description="Pause sensitive plans until an authorized person approves them."
                  enabled={requireApproval}
                  onChange={(value) => {
                    setRequireApproval(value);
                    setSaved(false);
                  }}
                />
              </div>
            </section>

            {/* Advanced */}
            <section className="rounded-2xl border border-gray-200 bg-white">
              <button
                onClick={() =>
                  setAdvancedOpen(!advancedOpen)
                }
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Settings2 size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      Advanced Planning Settings
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Fine-tune planner behavior for production workloads.
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    advancedOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {advancedOpen && (
                <div className="border-t border-gray-100 p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <AdvancedOption
                      title="Planning temperature"
                      value="0.2"
                      description="Lower values produce more deterministic planning."
                    />

                    <AdvancedOption
                      title="Plan confidence threshold"
                      value="85%"
                      description="Minimum confidence required before execution."
                    />

                    <AdvancedOption
                      title="Reasoning budget"
                      value="High"
                      description="Maximum reasoning capacity allocated to planning."
                    />

                    <AdvancedOption
                      title="Fallback planner"
                      value="Enabled"
                      description="Uses a secondary planning strategy when the primary planner fails."
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Current configuration */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold">
                Current Configuration
              </h2>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Strategy"
                  value={
                    strategies.find(
                      (item) => item.id === strategy
                    )?.title ?? "Adaptive Planning"
                  }
                />

                <InfoRow
                  label="Active steps"
                  value={`${enabledSteps.length}/${steps.length}`}
                />

                <InfoRow
                  label="Max steps"
                  value={String(maxSteps)}
                />

                <InfoRow
                  label="Iterations"
                  value={String(maxIterations)}
                />

                <InfoRow
                  label="Depth"
                  value={String(planningDepth)}
                />

                <InfoRow
                  label="Parallel"
                  value={
                    parallelPlanning
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </div>
            </section>

            {/* Plan preview */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Plan Preview
                </h2>

                <span className="flex items-center gap-1 text-xs text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Ready
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {enabledSteps.slice(0, 5).map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                      {index + 1}
                    </div>

                    <div className="pt-1">
                      <p className="text-xs font-medium">
                        {step.title}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {step.type}
                      </p>
                    </div>
                  </div>
                ))}

                {enabledSteps.length > 5 && (
                  <p className="pt-2 text-xs text-gray-400">
                    +{enabledSteps.length - 5} additional steps
                  </p>
                )}
              </div>
            </section>

            {/* Runtime behavior */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock3 size={17} />
                <h2 className="text-sm font-semibold">
                  Runtime Behavior
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <RuntimeRow
                  label="Dynamic re-plan"
                  enabled={autoReplan}
                />

                <RuntimeRow
                  label="Parallel tasks"
                  enabled={parallelPlanning}
                />

                <RuntimeRow
                  label="Plan validation"
                  enabled={validatePlan}
                />

                <RuntimeRow
                  label="Human approval"
                  enabled={requireApproval}
                />
              </div>
            </section>

            {/* Test */}
            <section className="rounded-2xl border border-gray-200 bg-[#111827] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Play size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Test Planning
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">
                    Test how your planner handles a real task.
                  </p>
                </div>
              </div>

              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-gray-100">
                <Play size={14} />
                Open Planning Playground
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function StatusLine({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-300">
        {label}
      </span>

      <span
        className={`h-2 w-2 rounded-full ${
          enabled ? "bg-green-400" : "bg-gray-600"
        }`}
      />
    </div>
  );
}

function PlanStepRow({
  step,
  index,
  total,
  onToggle,
  onDelete,
  onMove,
}: {
  step: PlanStep;
  index: number;
  total: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onMove: (
    id: number,
    direction: "up" | "down"
  ) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        step.enabled
          ? "border-gray-200 bg-white"
          : "border-gray-100 bg-gray-50 opacity-60"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              {step.title}
            </h3>

            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium capitalize text-gray-500">
              {step.type}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {step.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onMove(step.id, "up")}
            disabled={index === 0}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move up"
          >
            <ChevronRight
              size={15}
              className="-rotate-90"
            />
          </button>

          <button
            onClick={() => onMove(step.id, "down")}
            disabled={index === total - 1}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
            title="Move down"
          >
            <ChevronRight
              size={15}
              className="rotate-90"
            />
          </button>

          <button
            onClick={() => onToggle(step.id)}
            className={`rounded-md px-2 py-1.5 text-[10px] font-medium ${
              step.enabled
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {step.enabled ? "Active" : "Disabled"}
          </button>

          <button
            onClick={() => onDelete(step.id)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Delete step"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NumberSetting({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">
        {label}
      </span>

      <div className="mt-2 flex items-center rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() =>
            onChange(Math.max(min, value - 1))
          }
          className="px-3 py-2 text-gray-500 hover:bg-gray-50"
        >
          −
        </button>

        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(event) => {
            const next = Number(event.target.value);

            if (Number.isNaN(next)) return;

            onChange(
              Math.min(max, Math.max(min, next))
            );
          }}
          className="w-full border-x border-gray-200 px-2 py-2 text-center text-sm outline-none"
        />

        <button
          onClick={() =>
            onChange(Math.min(max, value + 1))
          }
          className="px-3 py-2 text-gray-500 hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </label>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-500">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-black" : "bg-gray-200"
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

function AdvancedOption({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {title}
        </h3>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium">
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {description}
      </p>
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="max-w-[180px] text-right text-xs font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}

function RuntimeRow({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">
        {label}
      </span>

      <span
        className={`rounded-full px-2 py-1 text-[10px] font-medium ${
          enabled
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}