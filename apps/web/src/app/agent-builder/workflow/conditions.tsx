"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code,
  Database,
  GitBranch,
  Layers,
  Plus,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Terminal,
  TestTube2,
  XCircle,
  Zap,
} from "lucide-react";

type ConditionStatus = "active" | "draft" | "warning";

type ConditionRule = {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: string;
  value: string;
  action: string;
  status: ConditionStatus;
  executions: number;
  matches: number;
  lastRun: string;
};

const initialRules: ConditionRule[] = [
  {
    id: "condition-001",
    name: "High Confidence Response",
    description: "Continue when the AI confidence score is high enough.",
    field: "confidence",
    operator: "greater than or equal",
    value: "0.85",
    action: "Return response",
    status: "active",
    executions: 18420,
    matches: 16120,
    lastRun: "12 sec ago",
  },
  {
    id: "condition-002",
    name: "Knowledge Required",
    description: "Send the request to RAG when additional knowledge is required.",
    field: "knowledge_required",
    operator: "equals",
    value: "true",
    action: "Run Knowledge Search",
    status: "active",
    executions: 14280,
    matches: 8240,
    lastRun: "28 sec ago",
  },
  {
    id: "condition-003",
    name: "Human Approval",
    description: "Require approval before executing sensitive actions.",
    field: "risk_level",
    operator: "equals",
    value: "high",
    action: "Human Approval",
    status: "active",
    executions: 3980,
    matches: 420,
    lastRun: "1 min ago",
  },
  {
    id: "condition-004",
    name: "Retry Failed Tool",
    description: "Retry a tool when the execution result is unsuccessful.",
    field: "tool_status",
    operator: "equals",
    value: "failed",
    action: "Retry Tool",
    status: "warning",
    executions: 2180,
    matches: 164,
    lastRun: "3 min ago",
  },
  {
    id: "condition-005",
    name: "Low Token Budget",
    description: "Switch to a lower-cost model when the token budget is exceeded.",
    field: "token_usage",
    operator: "greater than",
    value: "12000",
    action: "Switch Model",
    status: "draft",
    executions: 0,
    matches: 0,
    lastRun: "Never",
  },
];

const operators = [
  "equals",
  "not equals",
  "greater than",
  "greater than or equal",
  "less than",
  "less than or equal",
  "contains",
  "does not contain",
  "is true",
  "is false",
];

export default function ConditionsPage() {
  const [rules, setRules] = useState<ConditionRule[]>(initialRules);
  const [selectedId, setSelectedId] = useState("condition-001");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [running, setRunning] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const selectedRule =
    rules.find((rule) => rule.id === selectedId) ?? rules[0];

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.name.toLowerCase().includes(search.toLowerCase()) ||
        rule.description.toLowerCase().includes(search.toLowerCase()) ||
        rule.field.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" ||
        rule.status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rules, search, statusFilter]);

  const activeCount = rules.filter(
    (rule) => rule.status === "active"
  ).length;

  const totalExecutions = rules.reduce(
    (sum, rule) => sum + rule.executions,
    0
  );

  const totalMatches = rules.reduce(
    (sum, rule) => sum + rule.matches,
    0
  );

  const matchRate =
    totalExecutions > 0
      ? ((totalMatches / totalExecutions) * 100).toFixed(1)
      : "0.0";

  const runConditions = () => {
    setRunning(true);

    window.setTimeout(() => {
      setRunning(false);
    }, 1600);
  };

  const updateSelectedRule = (
    key: keyof ConditionRule,
    value: string
  ) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === selectedId
          ? {
              ...rule,
              [key]: value,
            }
          : rule
      )
    );
  };

  const createCondition = () => {
    const newRule: ConditionRule = {
      id: `condition-${Date.now()}`,
      name: "New Condition",
      description: "Configure a new workflow condition.",
      field: "field",
      operator: "equals",
      value: "value",
      action: "Continue",
      status: "draft",
      executions: 0,
      matches: 0,
      lastRun: "Never",
    };

    setRules((current) => [...current, newRule]);
    setSelectedId(newRule.id);
    setShowCreate(false);
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <header className="flex h-[62px] items-center justify-between border-b border-white/[0.08] bg-[#0b0c10] px-5">
        <div className="flex items-center gap-3">
          <Link
            href="/agent-builder/workflow"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold">
                Workflow Conditions
              </h1>

              <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[9px] text-violet-400">
                Agent Builder
              </span>
            </div>

            <p className="mt-0.5 text-[10px] text-gray-600">
              Build decision logic for your agent workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runConditions}
            disabled={running}
            className="flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-[11px] font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {running ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}

            {running ? "Testing..." : "Test Conditions"}
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] text-gray-300 hover:bg-white/[0.07]"
          >
            <Plus size={14} />
            New Condition
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-62px)]">
        <aside className="w-[255px] shrink-0 border-r border-white/[0.08] bg-[#0b0c10]">
          <div className="border-b border-white/[0.08] p-4">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-600">
              Condition Engine
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
                  <GitBranch size={17} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold">
                    Decision Engine
                  </p>
                  <p className="text-[9px] text-gray-600">
                    {activeCount} active rules
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/[0.08] p-3">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conditions..."
                className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-8 pr-3 text-[10px] text-gray-300 outline-none placeholder:text-gray-600 focus:border-violet-500/40"
              />
            </div>

            <div className="relative mt-2">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-8 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#101116] px-3 pr-8 text-[10px] text-gray-400 outline-none"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Warning</option>
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
          </div>

          <div className="p-3">
            <p className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-600">
              Rules
            </p>

            <div className="space-y-1">
              {filteredRules.map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => setSelectedId(rule.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedId === rule.id
                      ? "border-violet-500/30 bg-violet-500/[0.08]"
                      : "border-transparent hover:bg-white/[0.035]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-yellow-400">
                      <GitBranch size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[10px] font-medium text-gray-300">
                          {rule.name}
                        </p>

                        <StatusBadge status={rule.status} />
                      </div>

                      <p className="mt-1 line-clamp-2 text-[8px] leading-4 text-gray-600">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto bg-[#08090d]">
          <div className="mx-auto max-w-[1100px] p-6">
            <div className="grid grid-cols-4 gap-3">
              <MetricCard
                label="Active Conditions"
                value={String(activeCount)}
                icon={<GitBranch size={15} />}
              />

              <MetricCard
                label="Executions"
                value={formatNumber(totalExecutions)}
                icon={<Activity size={15} />}
              />

              <MetricCard
                label="Matched Rules"
                value={formatNumber(totalMatches)}
                icon={<Target size={15} />}
              />

              <MetricCard
                label="Match Rate"
                value={`${matchRate}%`}
                icon={<CheckCircle2 size={15} />}
              />
            </div>

            <div className="mt-5 grid grid-cols-[1fr_310px] gap-5">
              <div className="space-y-5">
                <section className="rounded-xl border border-white/[0.08] bg-[#0b0c10]">
                  <div className="border-b border-white/[0.08] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[13px] font-semibold">
                          Condition Builder
                        </h2>

                        <p className="mt-1 text-[9px] text-gray-600">
                          Define the logic that controls your workflow path.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Runtime Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedRule && (
                    <div className="p-5">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                          <GitBranch size={18} />
                        </div>

                        <div>
                          <p className="text-[13px] font-semibold">
                            {selectedRule.name}
                          </p>

                          <p className="text-[9px] text-gray-600">
                            {selectedRule.id}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-gray-300">
                            IF
                          </span>

                          <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[9px] text-violet-400">
                            Condition
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <Field
                            label="Field"
                            value={selectedRule.field}
                            onChange={(value) =>
                              updateSelectedRule("field", value)
                            }
                          />

                          <SelectField
                            label="Operator"
                            value={selectedRule.operator}
                            options={operators}
                            onChange={(value) =>
                              updateSelectedRule("operator", value)
                            }
                          />

                          <Field
                            label="Value"
                            value={selectedRule.value}
                            onChange={(value) =>
                              updateSelectedRule("value", value)
                            }
                          />
                        </div>

                        <div className="my-4 flex items-center gap-3">
                          <div className="h-px flex-1 bg-white/[0.07]" />
                          <span className="text-[9px] font-semibold text-gray-600">
                            THEN
                          </span>
                          <div className="h-px flex-1 bg-white/[0.07]" />
                        </div>

                        <Field
                          label="Action"
                          value={selectedRule.action}
                          onChange={(value) =>
                            updateSelectedRule("action", value)
                          }
                        />
                      </div>

                      <div className="mt-4 rounded-lg border border-blue-500/15 bg-blue-500/[0.04] p-3">
                        <div className="flex gap-2">
                          <AlertTriangle
                            size={14}
                            className="mt-0.5 text-blue-400"
                          />

                          <div>
                            <p className="text-[9px] font-semibold text-blue-300">
                              Execution logic
                            </p>

                            <p className="mt-1 text-[9px] leading-4 text-gray-600">
                              This condition is evaluated during workflow
                              execution. If the rule matches, the configured
                              action will be executed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-xl border border-white/[0.08] bg-[#0b0c10]">
                  <div className="border-b border-white/[0.08] p-4">
                    <h2 className="text-[12px] font-semibold">
                      Condition Flow
                    </h2>

                    <p className="mt-1 text-[9px] text-gray-600">
                      How the rule participates in the workflow.
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <FlowStep
                        icon={<Bot size={16} />}
                        title="AI Agent"
                        description="Generates result"
                      />

                      <ArrowRight
                        size={16}
                        className="text-gray-700"
                      />

                      <FlowStep
                        icon={<GitBranch size={16} />}
                        title="Condition"
                        description="Evaluates rule"
                        active
                      />

                      <ArrowRight
                        size={16}
                        className="text-gray-700"
                      />

                      <FlowStep
                        icon={<Zap size={16} />}
                        title="Action"
                        description="Continue path"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-white/[0.08] bg-[#0b0c10]">
                  <div className="border-b border-white/[0.08] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[12px] font-semibold">
                          Recent Evaluations
                        </h2>

                        <p className="mt-1 text-[9px] text-gray-600">
                          Latest condition executions.
                        </p>
                      </div>

                      <button className="text-[9px] text-violet-400 hover:text-violet-300">
                        View all
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-white/[0.06]">
                    <EvaluationRow
                      request="Customer asks about refund policy"
                      result="Matched"
                      value="0.94"
                      time="12 sec ago"
                    />

                    <EvaluationRow
                      request="User asks for account deletion"
                      result="Matched"
                      value="high"
                      time="28 sec ago"
                    />

                    <EvaluationRow
                      request="General product question"
                      result="Not matched"
                      value="0.41"
                      time="1 min ago"
                    />

                    <EvaluationRow
                      request="Payment failed during checkout"
                      result="Matched"
                      value="failed"
                      time="3 min ago"
                    />
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-xl border border-white/[0.08] bg-[#0b0c10] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity size={15} className="text-violet-400" />

                    <h2 className="text-[11px] font-semibold">
                      Runtime Health
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <HealthRow
                      label="Condition engine"
                      value="Operational"
                      healthy
                    />

                    <HealthRow
                      label="Evaluation latency"
                      value="18 ms"
                      healthy
                    />

                    <HealthRow
                      label="Rule errors"
                      value="2"
                      healthy={false}
                    />

                    <HealthRow
                      label="Workflow impact"
                      value="Low"
                      healthy
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-white/[0.08] bg-[#0b0c10] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Layers size={15} className="text-cyan-400" />

                    <h2 className="text-[11px] font-semibold">
                      Available Inputs
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <InputItem
                      icon={<Bot size={13} />}
                      name="confidence"
                    />

                    <InputItem
                      icon={<Database size={13} />}
                      name="knowledge_required"
                    />

                    <InputItem
                      icon={<Terminal size={13} />}
                      name="tool_status"
                    />

                    <InputItem
                      icon={<Zap size={13} />}
                      name="token_usage"
                    />

                    <InputItem
                      icon={<ShieldCheck size={13} />}
                      name="risk_level"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-white/[0.08] bg-[#0b0c10] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-400" />

                    <h2 className="text-[11px] font-semibold">
                      Safety Controls
                    </h2>
                  </div>

                  <SafetyRow
                    label="Sensitive actions"
                    value="Approval required"
                  />

                  <SafetyRow
                    label="Tool failures"
                    value="Automatic retry"
                  />

                  <SafetyRow
                    label="High-risk output"
                    value="Blocked"
                  />
                </section>

                <section className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
                  <div className="flex gap-3">
                    <TestTube2
                      size={16}
                      className="mt-0.5 shrink-0 text-violet-400"
                    />

                    <div>
                      <p className="text-[10px] font-semibold text-violet-300">
                        Test your conditions
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-gray-600">
                        Validate decision logic against real test cases before
                        deploying the workflow.
                      </p>

                      <Link
                        href="/agent-builder/testing/playground"
                        className="mt-3 inline-flex items-center gap-1 text-[9px] font-medium text-violet-400 hover:text-violet-300"
                      >
                        Open Playground
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-[460px] rounded-2xl border border-white/[0.1] bg-[#101116] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
              <div>
                <h2 className="text-[13px] font-semibold">
                  Create Condition
                </h2>

                <p className="mt-1 text-[9px] text-gray-600">
                  Add a new decision rule to the workflow.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="text-[20px] leading-none text-gray-600 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
                <div className="flex gap-3">
                  <GitBranch
                    size={17}
                    className="mt-0.5 text-violet-400"
                  />

                  <div>
                    <p className="text-[10px] font-semibold text-violet-300">
                      Conditional workflow logic
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-gray-600">
                      Conditions let the agent choose different workflow paths
                      based on runtime data.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[9px] text-gray-500">
                  Condition Name
                </label>

                <input
                  defaultValue="New Condition"
                  className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[10px] text-gray-300 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[9px] text-gray-500">
                  Field
                </label>

                <input
                  defaultValue="confidence"
                  className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[10px] text-gray-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[9px] text-gray-500">
                    Operator
                  </label>

                  <select className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#15161b] px-3 text-[10px] text-gray-400 outline-none">
                    {operators.map((operator) => (
                      <option key={operator}>{operator}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] text-gray-500">
                    Value
                  </label>

                  <input
                    defaultValue="0.85"
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[10px] text-gray-300 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.08] p-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-[10px] text-gray-400 hover:bg-white/[0.05]"
              >
                Cancel
              </button>

              <button
                onClick={createCondition}
                className="rounded-lg bg-white px-4 py-2 text-[10px] font-semibold text-black hover:bg-gray-200"
              >
                Create Condition
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0b0c10] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-gray-600">{label}</span>

        <span className="text-gray-600">{icon}</span>
      </div>

      <p className="mt-2 text-[20px] font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] text-gray-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#101116] px-3 text-[10px] text-gray-300 outline-none focus:border-violet-500/40"
      />
    </div>
  );
}

function SelectField({
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
      <label className="mb-1.5 block text-[9px] text-gray-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#101116] px-3 pr-7 text-[10px] text-gray-300 outline-none focus:border-violet-500/40"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown
          size={11}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600"
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ConditionStatus;
}) {
  const config = {
    active: {
      text: "Active",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    draft: {
      text: "Draft",
      className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
    },
    warning: {
      text: "Warning",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    },
  }[status];

  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[7px] ${config.className}`}
    >
      {config.text}
    </span>
  );
}

function FlowStep({
  icon,
  title,
  description,
  active = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`w-[125px] rounded-xl border p-3 ${
        active
          ? "border-violet-500/30 bg-violet-500/[0.06]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${
          active
            ? "bg-violet-500/10 text-violet-400"
            : "bg-white/[0.05] text-gray-500"
        }`}
      >
        {icon}
      </div>

      <p className="text-[9px] font-semibold text-gray-300">
        {title}
      </p>

      <p className="mt-1 text-[8px] text-gray-600">
        {description}
      </p>
    </div>
  );
}

function EvaluationRow({
  request,
  result,
  value,
  time,
}: {
  request: string;
  result: "Matched" | "Not matched";
  value: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-gray-500">
        <GitBranch size={13} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] text-gray-300">
          {request}
        </p>

        <p className="mt-1 text-[8px] text-gray-600">
          {time}
        </p>
      </div>

      <span
        className={`rounded-md border px-2 py-1 text-[8px] ${
          result === "Matched"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "border-gray-500/20 bg-gray-500/10 text-gray-500"
        }`}
      >
        {result}
      </span>

      <span className="w-12 text-right font-mono text-[9px] text-gray-500">
        {value}
      </span>
    </div>
  );
}

function HealthRow({
  label,
  value,
  healthy,
}: {
  label: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {healthy ? (
          <CheckCircle2 size={13} className="text-emerald-400" />
        ) : (
          <XCircle size={13} className="text-yellow-400" />
        )}

        <span className="text-[9px] text-gray-500">
          {label}
        </span>
      </div>

      <span
        className={`text-[9px] ${
          healthy ? "text-emerald-400" : "text-yellow-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InputItem({
  icon,
  name,
}: {
  icon: ReactNode;
  name: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="text-gray-600">{icon}</span>

      <span className="font-mono text-[9px] text-gray-400">
        {name}
      </span>
    </div>
  );
}

function SafetyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-2.5 last:border-0">
      <span className="text-[9px] text-gray-600">{label}</span>

      <span className="text-[9px] text-gray-400">{value}</span>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}