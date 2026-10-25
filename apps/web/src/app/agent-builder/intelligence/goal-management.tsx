"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  Sparkles,
  Brain,
  ListChecks,
  BarChart3,
  Settings2,
  ChevronDown,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Zap,
} from "lucide-react";

type GoalStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Blocked";

type GoalPriority = "High" | "Medium" | "Low";

type Goal = {
  id: number;
  title: string;
  description: string;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number;
  dueDate: string;
  tasks: number;
  completedTasks: number;
};

type GoalRule = {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
};

export default function GoalManagementPage() {
  const [agentGoal, setAgentGoal] = useState(
    "Resolve customer requests accurately and efficiently"
  );

  const [goalMode, setGoalMode] = useState<
    "Autonomous" | "Supervised" | "Human Approval"
  >("Autonomous");

  const [autoPrioritize, setAutoPrioritize] = useState(true);
  const [goalDecomposition, setGoalDecomposition] = useState(true);
  const [progressTracking, setProgressTracking] = useState(true);
  const [goalRecovery, setGoalRecovery] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "Understand User Request",
      description:
        "Identify the user's intent, required information and expected outcome.",
      priority: "High",
      status: "Completed",
      progress: 100,
      dueDate: "Immediate",
      tasks: 3,
      completedTasks: 3,
    },
    {
      id: 2,
      title: "Find Relevant Information",
      description:
        "Search connected knowledge sources and retrieve useful context.",
      priority: "High",
      status: "In Progress",
      progress: 68,
      dueDate: "Today",
      tasks: 5,
      completedTasks: 3,
    },
    {
      id: 3,
      title: "Generate Solution",
      description:
        "Create an accurate response using the retrieved information.",
      priority: "Medium",
      status: "In Progress",
      progress: 42,
      dueDate: "Today",
      tasks: 4,
      completedTasks: 2,
    },
    {
      id: 4,
      title: "Validate Response",
      description:
        "Check accuracy, policy compliance and completeness before delivery.",
      priority: "Medium",
      status: "Not Started",
      progress: 0,
      dueDate: "Today",
      tasks: 3,
      completedTasks: 0,
    },
  ]);

  const [rules, setRules] = useState<GoalRule[]>([
    {
      id: 1,
      title: "Automatic Goal Decomposition",
      description:
        "Break complex objectives into smaller executable tasks.",
      enabled: true,
    },
    {
      id: 2,
      title: "Dynamic Prioritization",
      description:
        "Automatically reorder goals based on urgency and importance.",
      enabled: true,
    },
    {
      id: 3,
      title: "Progress Tracking",
      description:
        "Track task completion and overall goal progress.",
      enabled: true,
    },
    {
      id: 4,
      title: "Goal Recovery",
      description:
        "Create an alternative plan when a goal becomes blocked.",
      enabled: true,
    },
  ]);

  const completedGoals = goals.filter(
    (goal) => goal.status === "Completed"
  ).length;

  const activeGoals = goals.filter(
    (goal) => goal.status === "In Progress"
  ).length;

  const blockedGoals = goals.filter(
    (goal) => goal.status === "Blocked"
  ).length;

  const overallProgress =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce(
            (total, goal) => total + goal.progress,
            0
          ) / goals.length
        );

  const toggleRule = (id: number) => {
    setRules((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  };

  const deleteGoal = (id: number) => {
    setGoals((items) =>
      items.filter((goal) => goal.id !== id)
    );
  };

  const updateGoalProgress = (
    id: number,
    amount: number
  ) => {
    setGoals((items) =>
      items.map((goal) => {
        if (goal.id !== id) {
          return goal;
        }

        const progress = Math.max(
          0,
          Math.min(100, goal.progress + amount)
        );

        let status: GoalStatus = "In Progress";

        if (progress === 0) {
          status = "Not Started";
        }

        if (progress >= 100) {
          status = "Completed";
        }

        const completedTasks =
          goal.tasks === 0
            ? 0
            : Math.min(
                goal.tasks,
                Math.round(
                  (goal.tasks * progress) / 100
                )
              );

        return {
          ...goal,
          progress,
          status,
          completedTasks,
        };
      })
    );
  };

  const addGoal = () => {
    const nextId =
      goals.length > 0
        ? Math.max(...goals.map((goal) => goal.id)) + 1
        : 1;

    const newGoal: Goal = {
      id: nextId,
      title: "New Agent Goal",
      description:
        "Define the objective that the agent should accomplish.",
      priority: "Medium",
      status: "Not Started",
      progress: 0,
      dueDate: "Today",
      tasks: 0,
      completedTasks: 0,
    };

    setGoals((items) => [...items, newGoal]);
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
              <Target size={23} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  Goal Management
                </h1>

                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Define, prioritize and track the goals your AI
                agent needs to accomplish.
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
            icon={<Target size={18} />}
            title="Overall Progress"
            value={`${overallProgress}%`}
            description="Across active goals"
          />

          <MetricCard
            icon={<Clock3 size={18} />}
            title="Active Goals"
            value={`${activeGoals}`}
            description="Currently executing"
          />

          <MetricCard
            icon={<CheckCircle2 size={18} />}
            title="Completed"
            value={`${completedGoals}`}
            description="Goals completed"
          />

          <MetricCard
            icon={<Flag size={18} />}
            title="Blocked"
            value={`${blockedGoals}`}
            description="Need attention"
          />
        </section>

        <div className="grid gap-7 xl:grid-cols-[1fr_380px]">
          <div className="space-y-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Primary Agent Objective
                  </h2>

                  <p className="text-sm text-gray-500">
                    The main outcome the agent should work toward.
                  </p>
                </div>
              </div>

              <textarea
                value={agentGoal}
                onChange={(event) =>
                  setAgentGoal(event.target.value)
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 outline-none focus:border-gray-400"
              />

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <ModeButton
                  active={goalMode === "Autonomous"}
                  title="Autonomous"
                  description="Agent manages goals independently."
                  onClick={() =>
                    setGoalMode("Autonomous")
                  }
                />

                <ModeButton
                  active={goalMode === "Supervised"}
                  title="Supervised"
                  description="Agent asks when decisions are uncertain."
                  onClick={() =>
                    setGoalMode("Supervised")
                  }
                />

                <ModeButton
                  active={goalMode === "Human Approval"}
                  title="Human Approval"
                  description="Important goals require approval."
                  onClick={() =>
                    setGoalMode("Human Approval")
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Active Goal Hierarchy
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage the objectives and tasks used by the
                    agent.
                  </p>
                </div>

                <button
                  onClick={addGoal}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add Goal
                </button>
              </div>

              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    index={index}
                    onDelete={() =>
                      deleteGoal(goal.id)
                    }
                    onIncrease={() =>
                      updateGoalProgress(goal.id, 10)
                    }
                    onDecrease={() =>
                      updateGoalProgress(goal.id, -10)
                    }
                  />
                ))}

                {goals.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                    <Target
                      size={28}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium">
                      No goals configured
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Add a goal to start managing the agent
                      objectives.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Brain size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Goal Intelligence
                  </h2>

                  <p className="text-sm text-gray-500">
                    Configure how the agent creates and manages
                    goals.
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
                      Advanced Goal Settings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Configure goal limits, priorities and
                      recovery.
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
                    title="Automatic Prioritization"
                    description="Automatically reorder goals according to urgency and importance."
                    enabled={autoPrioritize}
                    onToggle={() =>
                      setAutoPrioritize(
                        !autoPrioritize
                      )
                    }
                  />

                  <SettingToggle
                    title="Goal Decomposition"
                    description="Break large objectives into smaller executable tasks."
                    enabled={goalDecomposition}
                    onToggle={() =>
                      setGoalDecomposition(
                        !goalDecomposition
                      )
                    }
                  />

                  <SettingToggle
                    title="Progress Tracking"
                    description="Continuously evaluate progress toward each goal."
                    enabled={progressTracking}
                    onToggle={() =>
                      setProgressTracking(
                        !progressTracking
                      )
                    }
                  />

                  <SettingToggle
                    title="Goal Recovery"
                    description="Generate alternative strategies when a goal is blocked."
                    enabled={goalRecovery}
                    onToggle={() =>
                      setGoalRecovery(
                        !goalRecovery
                      )
                    }
                  />
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Goal Engine
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Current agent behavior
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Zap size={17} />
                </div>
              </div>

              <div className="space-y-4">
                <StatusRow
                  label="Goal Mode"
                  value={goalMode}
                />

                <StatusRow
                  label="Prioritization"
                  value={
                    autoPrioritize
                      ? "Automatic"
                      : "Manual"
                  }
                />

                <StatusRow
                  label="Decomposition"
                  value={
                    goalDecomposition
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusRow
                  label="Progress Tracking"
                  value={
                    progressTracking
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusRow
                  label="Recovery"
                  value={
                    goalRecovery
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">
                Goal Progress
              </h2>

              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold">
                    {overallProgress}%
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Overall completion
                  </p>
                </div>

                <BarChart3
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniStat
                  value={`${completedGoals}`}
                  label="Done"
                />

                <MiniStat
                  value={`${activeGoals}`}
                  label="Active"
                />

                <MiniStat
                  value={`${blockedGoals}`}
                  label="Blocked"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">
                Priority Distribution
              </h2>

              <PriorityRow
                label="High"
                count={
                  goals.filter(
                    (goal) =>
                      goal.priority === "High"
                  ).length
                }
                icon={<ArrowUp size={15} />}
                className="text-red-600"
              />

              <PriorityRow
                label="Medium"
                count={
                  goals.filter(
                    (goal) =>
                      goal.priority === "Medium"
                  ).length
                }
                icon={<Flag size={15} />}
                className="text-orange-500"
              />

              <PriorityRow
                label="Low"
                count={
                  goals.filter(
                    (goal) =>
                      goal.priority === "Low"
                  ).length
                }
                icon={<ArrowDown size={15} />}
                className="text-green-600"
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-semibold">
                Quick Actions
              </h2>

              <div className="space-y-2">
                <QuickAction
                  icon={<Plus size={16} />}
                  title="Create Goal"
                  onClick={addGoal}
                />

                <QuickAction
                  icon={<ListChecks size={16} />}
                  title="View Tasks"
                />

                <QuickAction
                  icon={<Brain size={16} />}
                  title="Open Planner"
                />

                <QuickAction
                  icon={<BarChart3 size={16} />}
                  title="View Goal Analytics"
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
  title,
  description,
  onClick,
}: {
  active: boolean;
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
      <div className="flex items-center gap-2">
        {active ? (
          <CheckCircle2
            size={16}
            className="text-black"
          />
        ) : (
          <Circle
            size={16}
            className="text-gray-300"
          />
        )}

        <span className="text-sm font-semibold">
          {title}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </button>
  );
}

function GoalCard({
  goal,
  index,
  onDelete,
  onIncrease,
  onDecrease,
}: {
  goal: Goal;
  index: number;
  onDelete: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const statusClass =
    goal.status === "Completed"
      ? "bg-green-50 text-green-700"
      : goal.status === "In Progress"
        ? "bg-blue-50 text-blue-700"
        : goal.status === "Blocked"
          ? "bg-red-50 text-red-700"
          : "bg-gray-100 text-gray-600";

  const priorityClass =
    goal.priority === "High"
      ? "text-red-600"
      : goal.priority === "Medium"
        ? "text-orange-500"
        : "text-green-600";

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              {goal.title}
            </h3>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusClass}`}
            >
              {goal.status}
            </span>

            <span
              className={`text-[10px] font-semibold ${priorityClass}`}
            >
              {goal.priority} Priority
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            {goal.description}
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Progress
              </span>

              <span className="text-[11px] font-semibold">
                {goal.progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-black transition-all"
                style={{
                  width: `${goal.progress}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <ListChecks size={14} />
              {goal.completedTasks}/{goal.tasks} tasks
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 size={14} />
              {goal.dueDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onDecrease}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Decrease progress"
          >
            <ArrowDown size={15} />
          </button>

          <button
            onClick={onIncrease}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Increase progress"
          >
            <ArrowUp size={15} />
          </button>

          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Edit goal"
          >
            <Edit3 size={15} />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete goal"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RuleRow({
  rule,
  onToggle,
}: {
  rule: GoalRule;
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
            {rule.title}
          </p>

          <p className="mt-1 max-w-[650px] text-xs leading-5 text-gray-500">
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

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-lg font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-gray-500">
        {label}
      </p>
    </div>
  );
}

function PriorityRow({
  label,
  count,
  icon,
  className,
}: {
  label: string;
  count: number;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 p-3 last:mb-0">
      <div
        className={`flex items-center gap-2 ${className}`}
      >
        {icon}

        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold">
        {count}
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