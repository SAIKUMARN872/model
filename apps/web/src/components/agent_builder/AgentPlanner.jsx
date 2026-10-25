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
  GitBranch,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Terminal,
  TestTube2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const planningStrategies = [
  {
    id: "reactive",
    name: "Reactive Planning",
    description:
      "Plan the next action based on the current state and latest result.",
    bestFor: "Simple tasks",
    icon: Activity,
  },
  {
    id: "stepwise",
    name: "Step-by-Step Planning",
    description:
      "Create a structured sequence before executing the task.",
    bestFor: "Multi-step tasks",
    icon: GitBranch,
  },
  {
    id: "adaptive",
    name: "Adaptive Planning",
    description:
      "Adjust the plan dynamically as new information becomes available.",
    bestFor: "Dynamic tasks",
    icon: Brain,
  },
  {
    id: "multi-agent",
    name: "Multi-Agent Planning",
    description:
      "Delegate parts of a complex objective to specialist agents.",
    bestFor: "Complex workflows",
    icon: Users,
  },
];

const planSteps = [
  {
    id: 1,
    title: "Understand Objective",
    description: "Analyze the user's request and identify the desired outcome.",
    icon: Target,
    status: "Complete",
  },
  {
    id: 2,
    title: "Decompose Task",
    description: "Break the objective into smaller executable tasks.",
    icon: Layers,
    status: "Complete",
  },
  {
    id: 3,
    title: "Select Resources",
    description: "Choose models, tools, memory, and knowledge sources.",
    icon: Settings2,
    status: "Active",
  },
  {
    id: 4,
    title: "Build Execution Plan",
    description: "Create the optimal sequence of actions.",
    icon: GitBranch,
    status: "Pending",
  },
  {
    id: 5,
    title: "Validate Plan",
    description: "Check safety, dependencies, and expected outcomes.",
    icon: ShieldCheck,
    status: "Pending",
  },
];

const sampleTasks = [
  {
    id: "task-1",
    title: "Research product competitors",
    complexity: "High",
    steps: 7,
    duration: "3.8s",
    success: "96%",
  },
  {
    id: "task-2",
    title: "Analyze customer feedback",
    complexity: "Medium",
    steps: 4,
    duration: "2.1s",
    success: "98%",
  },
  {
    id: "task-3",
    title: "Generate weekly report",
    complexity: "Medium",
    steps: 5,
    duration: "2.6s",
    success: "97%",
  },
  {
    id: "task-4",
    title: "Update knowledge base",
    complexity: "High",
    steps: 8,
    duration: "4.4s",
    success: "94%",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Active: "border-blue-200 bg-blue-50 text-blue-700",
    Pending: "border-slate-200 bg-slate-50 text-slate-500",
    High: "border-red-200 bg-red-50 text-red-700",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
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

export default function AgentPlanner() {
  const [strategy, setStrategy] = useState("adaptive");
  const [showStrategyMenu, setShowStrategyMenu] = useState(false);
  const [autoDecompose, setAutoDecompose] = useState(true);
  const [dynamicReplanning, setDynamicReplanning] = useState(true);
  const [planValidation, setPlanValidation] = useState(true);
  const [dependencyCheck, setDependencyCheck] = useState(true);
  const [maxSteps, setMaxSteps] = useState(12);
  const [planningBudget, setPlanningBudget] = useState(30);
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");

  const selectedStrategy = useMemo(() => {
    return (
      planningStrategies.find((item) => item.id === strategy) ||
      planningStrategies[0]
    );
  }, [strategy]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sampleTasks;
    }

    return sampleTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.complexity.toLowerCase().includes(query)
    );
  }, [search]);

  const runPlanner = () => {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <span className="text-lg leading-none">←</span>
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Brain size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Agent Planner
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Configure how your agent decomposes goals, creates plans,
                  and adapts during execution.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runPlanner}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {running ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}

                {running ? "Planning..." : "Test Planner"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Plan accuracy"
            value="94.8%"
            detail="+5.4% from previous version"
            icon={Target}
          />

          <MetricCard
            label="Task success"
            value="96.2%"
            detail="Across 2,481 tasks"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Avg planning time"
            value="420ms"
            detail="-16% after optimization"
            icon={Clock3}
          />

          <MetricCard
            label="Planning health"
            value="Healthy"
            detail="All planner services operational"
            icon={Activity}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["planner", "strategy", "execution", "history"].map(
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
            )
          )}
        </div>

        {activeTab === "planner" && (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Planning Pipeline"
                description="The sequence used by the agent to create and validate an execution plan."
                action={
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={14} />
                    Planner healthy
                  </div>
                }
              />

              <div className="mt-6 space-y-3">
                {planSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.id}
                      className="relative flex gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      {index < planSteps.length - 1 && (
                        <div className="absolute left-[28px] top-[58px] h-7 w-px bg-slate-200" />
                      )}

                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Icon size={17} className="text-slate-700" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-400">
                              STEP {String(step.id).padStart(2, "0")}
                            </div>

                            <div className="mt-1 text-sm font-semibold">
                              {step.title}
                            </div>
                          </div>

                          <StatusBadge status={step.status} />
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Planner Configuration"
                description="Configure core planning behavior."
              />

              <div className="mt-5 space-y-4">
                <div className="relative">
                  <label className="text-xs font-medium text-slate-600">
                    Planning Strategy
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setShowStrategyMenu(
                        (value) => !value
                      )
                    }
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <selectedStrategy.icon
                          size={17}
                          className="text-slate-700"
                        />
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          {selectedStrategy.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {selectedStrategy.description}
                        </div>
                      </div>
                    </div>

                    <ChevronDown
                      size={17}
                      className="text-slate-400"
                    />
                  </button>

                  {showStrategyMenu && (
                    <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {planningStrategies.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setStrategy(item.id);
                              setShowStrategyMenu(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-slate-50"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <Icon size={15} />
                            </div>

                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {item.name}
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                {item.bestFor}
                              </div>
                            </div>

                            {strategy === item.id && (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <div className="text-sm font-medium">
                      Automatic Decomposition
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Break complex goals into smaller tasks automatically.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAutoDecompose((value) => !value)
                    }
                    className={`relative h-6 w-11 rounded-full ${
                      autoDecompose
                        ? "bg-slate-900"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        autoDecompose ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <div className="text-sm font-medium">
                      Dynamic Replanning
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Update the plan when execution results change.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDynamicReplanning(
                        (value) => !value
                      )
                    }
                    className={`relative h-6 w-11 rounded-full ${
                      dynamicReplanning
                        ? "bg-slate-900"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        dynamicReplanning
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <div className="text-sm font-medium">
                      Plan Validation
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Validate dependencies and safety before execution.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPlanValidation(
                        (value) => !value
                      )
                    }
                    className={`relative h-6 w-11 rounded-full ${
                      planValidation
                        ? "bg-slate-900"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        planValidation ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <div className="text-sm font-medium">
                      Dependency Checking
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Detect missing resources before execution.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDependencyCheck(
                        (value) => !value
                      )
                    }
                    className={`relative h-6 w-11 rounded-full ${
                      dependencyCheck
                        ? "bg-slate-900"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        dependencyCheck
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "strategy" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Planning Strategies"
              description="Choose the planning approach that best fits your agent."
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {planningStrategies.map((item) => {
                const Icon = item.icon;
                const selected = strategy === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStrategy(item.id)}
                    className={`rounded-xl border p-5 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <Icon size={18} />
                      </div>

                      {selected && (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-600"
                        />
                      )}
                    </div>

                    <div className="mt-4 text-sm font-semibold">
                      {item.name}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-4 text-[11px] font-medium text-slate-400">
                      Best for: {item.bestFor}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "execution" && (
          <section className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Execution Limits"
                description="Control how many steps and resources the planner can use."
              />

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        Maximum Plan Steps
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Maximum actions allowed in a generated plan.
                      </div>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold">
                      {maxSteps}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="50"
                    value={maxSteps}
                    onChange={(event) =>
                      setMaxSteps(Number(event.target.value))
                    }
                    className="mt-4 w-full accent-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        Planning Budget
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Maximum planning time before execution begins.
                      </div>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold">
                      {planningBudget}s
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="120"
                    value={planningBudget}
                    onChange={(event) =>
                      setPlanningBudget(
                        Number(event.target.value)
                      )
                    }
                    className="mt-4 w-full accent-slate-900"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Execution Safety"
                description="Safety checks performed before the plan is executed."
              />

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <ShieldCheck
                    size={18}
                    className="text-emerald-600"
                  />

                  <div className="mt-3 text-sm font-semibold text-emerald-900">
                    Dependency validation
                  </div>

                  <div className="mt-1 text-xs text-emerald-700">
                    Required resources are checked.
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600"
                  />

                  <div className="mt-3 text-sm font-semibold text-emerald-900">
                    Goal validation
                  </div>

                  <div className="mt-1 text-xs text-emerald-700">
                    Plan aligns with requested objective.
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <Target
                    size={18}
                    className="text-emerald-600"
                  />

                  <div className="mt-3 text-sm font-semibold text-emerald-900">
                    Success criteria
                  </div>

                  <div className="mt-1 text-xs text-emerald-700">
                    Expected output is clearly defined.
                  </div>
                </div>
              </div>
            </section>
          </section>
        )}

        {activeTab === "history" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Planning History"
              description="Recent tasks planned by the agent."
            />

            <div className="relative mt-5">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search planned tasks..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-3 py-3 font-medium">
                      Task
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Complexity
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Steps
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Duration
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Success
                    </th>
                    <th className="px-3 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sampleTasks
                    .filter((task) => {
                      const query = search
                        .toLowerCase()
                        .trim();

                      return (
                        !query ||
                        task.title
                          .toLowerCase()
                          .includes(query)
                      );
                    })
                    .map((task) => (
                      <tr
                        key={task.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-4">
                          <div className="text-sm font-medium">
                            {task.title}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={task.complexity} />
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {task.steps}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {task.duration}
                        </td>

                        <td className="px-3 py-4 text-sm text-emerald-600">
                          {task.success}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status="Complete" />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}