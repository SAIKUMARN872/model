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
  Database,
  GitBranch,
  History,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Terminal,
  TestTube2,
  TimerReset,
  XCircle,
  Zap,
} from "lucide-react";

type RecoveryStatus = "Active" | "Draft" | "Disabled";

type RecoveryPolicy = {
  id: string;
  name: string;
  description: string;
  status: RecoveryStatus;
  trigger: string;
  strategy: string;
  retries: number;
  timeout: number;
  fallback: string;
  successRate: number;
  recoveries: number;
  lastTriggered: string;
};

const initialPolicies: RecoveryPolicy[] = [
  {
    id: "tool-failure",
    name: "Tool Failure Recovery",
    description: "Automatically retries failed tool calls and switches to fallback tools.",
    status: "Active",
    trigger: "Tool execution failure",
    strategy: "Retry → Fallback Tool",
    retries: 3,
    timeout: 30,
    fallback: "Alternative Tool",
    successRate: 97.8,
    recoveries: 1248,
    lastTriggered: "2 minutes ago",
  },
  {
    id: "model-timeout",
    name: "Model Timeout Recovery",
    description: "Handles model timeout events by retrying with optimized runtime settings.",
    status: "Active",
    trigger: "Model timeout",
    strategy: "Retry → Model Fallback",
    retries: 2,
    timeout: 45,
    fallback: "GPT-5 Mini",
    successRate: 96.4,
    recoveries: 842,
    lastTriggered: "8 minutes ago",
  },
  {
    id: "rag-recovery",
    name: "RAG Retrieval Recovery",
    description: "Retries failed retrieval and falls back to a secondary knowledge source.",
    status: "Active",
    trigger: "Retrieval failure",
    strategy: "Retry → Secondary Index",
    retries: 2,
    timeout: 20,
    fallback: "Backup Vector DB",
    successRate: 98.6,
    recoveries: 631,
    lastTriggered: "13 minutes ago",
  },
  {
    id: "browser-recovery",
    name: "Browser Recovery",
    description: "Recovers browser automation sessions when navigation or interaction fails.",
    status: "Draft",
    trigger: "Browser action failure",
    strategy: "Retry → Refresh → Reopen",
    retries: 3,
    timeout: 60,
    fallback: "Restart Session",
    successRate: 94.1,
    recoveries: 318,
    lastTriggered: "34 minutes ago",
  },
  {
    id: "critical-workflow",
    name: "Critical Workflow Recovery",
    description: "Protects important workflows with retry, checkpoint and human escalation.",
    status: "Active",
    trigger: "Critical workflow failure",
    strategy: "Checkpoint → Retry → Human Approval",
    retries: 2,
    timeout: 90,
    fallback: "Human Approval",
    successRate: 99.1,
    recoveries: 174,
    lastTriggered: "1 hour ago",
  },
];

const recoveryEvents = [
  {
    time: "10:42:18",
    workflow: "Customer Support Agent",
    error: "Tool timeout",
    action: "Retried tool",
    result: "Recovered",
  },
  {
    time: "10:39:52",
    workflow: "Research Agent",
    error: "Model timeout",
    action: "Switched model",
    result: "Recovered",
  },
  {
    time: "10:34:21",
    workflow: "Knowledge Assistant",
    error: "Vector DB unavailable",
    action: "Used backup index",
    result: "Recovered",
  },
  {
    time: "10:27:09",
    workflow: "Browser Agent",
    error: "Navigation failed",
    action: "Restarted session",
    result: "Recovered",
  },
  {
    time: "10:21:47",
    workflow: "Invoice Workflow",
    error: "Validation error",
    action: "Human approval",
    result: "Escalated",
  },
];

function MetricCard({
  icon,
  label,
  value,
  change,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>
        {change && (
          <span className="text-xs font-medium text-emerald-600">{change}</span>
        )}
      </div>

      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-3 text-slate-400"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RecoveryStatus }) {
  const styles =
    status === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Draft"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${styles}`}
    >
      {status === "Active" ? (
        <CheckCircle2 size={12} />
      ) : status === "Draft" ? (
        <Clock3 size={12} />
      ) : (
        <XCircle size={12} />
      )}
      {status}
    </span>
  );
}

function FlowStep({
  icon,
  title,
  description,
  active,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`min-w-[170px] rounded-xl border p-4 ${
        active
          ? "border-slate-300 bg-slate-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
        {icon}
      </div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </div>
    </div>
  );
}

function RecoveryEvent({
  event,
}: {
  event: {
    time: string;
    workflow: string;
    error: string;
    action: string;
    result: string;
  };
}) {
  const recovered = event.result === "Recovered";

  return (
    <div className="grid grid-cols-[85px_1.2fr_1fr_1fr_100px] items-center gap-4 border-b border-slate-100 py-3 text-sm last:border-b-0">
      <span className="font-mono text-xs text-slate-500">{event.time}</span>

      <span className="font-medium text-slate-800">{event.workflow}</span>

      <span className="text-slate-600">{event.error}</span>

      <span className="text-slate-600">{event.action}</span>

      <span
        className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
          recovered
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {recovered ? (
          <CheckCircle2 size={12} />
        ) : (
          <AlertTriangle size={12} />
        )}
        {event.result}
      </span>
    </div>
  );
}

function HealthRow({
  name,
  value,
  status,
}: {
  name: string;
  value: string;
  status: "Healthy" | "Warning";
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <div
          className={`h-2 w-2 rounded-full ${
            status === "Healthy" ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="text-sm text-slate-700">{name}</span>
      </div>

      <div className="text-right">
        <div className="text-sm font-medium text-slate-900">{value}</div>
        <div
          className={`text-[11px] ${
            status === "Healthy" ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {status}
        </div>
      </div>
    </div>
  );
}

function ActionItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300 hover:bg-slate-50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div>
        <div className="text-sm font-medium text-slate-800">{title}</div>
        <div className="mt-0.5 text-xs text-slate-500">{description}</div>
      </div>
    </button>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function ErrorRecoveryPage() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [selectedId, setSelectedId] = useState(initialPolicies[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [running, setRunning] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftTrigger, setDraftTrigger] = useState("Tool execution failure");
  const [draftStrategy, setDraftStrategy] = useState("Retry → Fallback Tool");
  const [draftRetries, setDraftRetries] = useState(3);
  const [draftTimeout, setDraftTimeout] = useState(30);
  const [draftFallback, setDraftFallback] = useState("Alternative Tool");

  const selectedPolicy =
    policies.find((policy) => policy.id === selectedId) ?? policies[0];

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        policy.name.toLowerCase().includes(query) ||
        policy.description.toLowerCase().includes(query) ||
        policy.trigger.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || policy.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [policies, search, statusFilter]);

  const activePolicies = policies.filter(
    (policy) => policy.status === "Active",
  ).length;

  const totalRecoveries = policies.reduce(
    (sum, policy) => sum + policy.recoveries,
    0,
  );

  const averageSuccess =
    policies.length > 0
      ? policies.reduce((sum, policy) => sum + policy.successRate, 0) /
        policies.length
      : 0;

  const togglePolicy = () => {
    if (!selectedPolicy) return;

    setPolicies((current) =>
      current.map((policy) =>
        policy.id === selectedPolicy.id
          ? {
              ...policy,
              status: policy.status === "Active" ? "Disabled" : "Active",
            }
          : policy,
      ),
    );
  };

  const runRecoveryTest = () => {
    setRunning(true);

    window.setTimeout(() => {
      setRunning(false);
    }, 1400);
  };

  const createPolicy = () => {
    if (!draftName.trim()) return;

    const newPolicy: RecoveryPolicy = {
      id: `${Date.now()}`,
      name: draftName.trim(),
      description:
        draftDescription.trim() ||
        "Custom error recovery policy for automated workflows.",
      status: "Draft",
      trigger: draftTrigger,
      strategy: draftStrategy,
      retries: draftRetries,
      timeout: draftTimeout,
      fallback: draftFallback,
      successRate: 0,
      recoveries: 0,
      lastTriggered: "Never",
    };

    setPolicies((current) => [...current, newPolicy]);
    setSelectedId(newPolicy.id);
    setShowCreate(false);

    setDraftName("");
    setDraftDescription("");
    setDraftTrigger("Tool execution failure");
    setDraftStrategy("Retry → Fallback Tool");
    setDraftRetries(3);
    setDraftTimeout(30);
    setDraftFallback("Alternative Tool");
  };

  if (!selectedPolicy) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold">Error Recovery</h1>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Agent Runtime
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Automatically recover failed agent and workflow executions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/observability"
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <Activity size={15} />
              Observability
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus size={15} />
              Create Policy
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-[280px] shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Recovery Policies
              </div>

              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                {policies.length}
              </span>
            </div>

            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search policies..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="relative mb-4">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none"
              >
                <option>All</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Disabled</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-3 text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              {filteredPolicies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedId(policy.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedPolicy.id === policy.id
                      ? "border-slate-300 bg-slate-50"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {policy.name}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                        {policy.description}
                      </div>
                    </div>

                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        policy.status === "Active"
                          ? "bg-emerald-500"
                          : policy.status === "Draft"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {policy.recoveries} recoveries
                    </span>

                    <span className="text-[10px] font-medium text-slate-600">
                      {policy.successRate
                        ? `${policy.successRate}%`
                        : "Not tested"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {filteredPolicies.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                <Search className="mx-auto mb-2 text-slate-300" size={20} />
                <p className="text-xs text-slate-500">
                  No recovery policies found.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-slate-700" />
                <span className="text-xs font-semibold text-slate-800">
                  Runtime Protection
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Recovery policies protect agents from transient failures,
                unavailable tools and model errors.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-7">
          <div className="mx-auto max-w-[1450px]">
            <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard
                icon={<ShieldCheck size={18} />}
                label="Active recovery policies"
                value={String(activePolicies)}
                change="+1 this week"
              />

              <MetricCard
                icon={<RotateCcw size={18} />}
                label="Successful recoveries"
                value={formatNumber(totalRecoveries)}
                change="+12.4%"
              />

              <MetricCard
                icon={<CheckCircle2 size={18} />}
                label="Average recovery success"
                value={`${averageSuccess.toFixed(1)}%`}
                change="+2.1%"
              />

              <MetricCard
                icon={<TimerReset size={18} />}
                label="Average recovery time"
                value="3.8s"
                change="-18.2%"
              />
            </div>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedPolicy.name}
                    </h2>
                    <StatusBadge status={selectedPolicy.status} />
                  </div>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {selectedPolicy.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runRecoveryTest}
                    disabled={running}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {running ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Play size={14} />
                    )}
                    {running ? "Testing..." : "Test Recovery"}
                  </button>

                  <button
                    onClick={togglePolicy}
                    className={`rounded-lg px-3 py-2 text-xs font-medium ${
                      selectedPolicy.status === "Active"
                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {selectedPolicy.status === "Active"
                      ? "Disable"
                      : "Enable"}
                  </button>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  label="Trigger"
                  value={selectedPolicy.trigger}
                  options={[
                    "Tool execution failure",
                    "Model timeout",
                    "Retrieval failure",
                    "Browser action failure",
                    "Critical workflow failure",
                  ]}
                  onChange={(value) => {
                    setPolicies((current) =>
                      current.map((policy) =>
                        policy.id === selectedPolicy.id
                          ? { ...policy, trigger: value }
                          : policy,
                      ),
                    );
                  }}
                />

                <SelectField
                  label="Recovery strategy"
                  value={selectedPolicy.strategy}
                  options={[
                    "Retry → Fallback Tool",
                    "Retry → Model Fallback",
                    "Retry → Secondary Index",
                    "Retry → Refresh → Reopen",
                    "Checkpoint → Retry → Human Approval",
                  ]}
                  onChange={(value) => {
                    setPolicies((current) =>
                      current.map((policy) =>
                        policy.id === selectedPolicy.id
                          ? { ...policy, strategy: value }
                          : policy,
                      ),
                    );
                  }}
                />

                <NumberField
                  label="Maximum retries"
                  value={selectedPolicy.retries}
                  onChange={(value) => {
                    setPolicies((current) =>
                      current.map((policy) =>
                        policy.id === selectedPolicy.id
                          ? { ...policy, retries: value }
                          : policy,
                      ),
                    );
                  }}
                />

                <NumberField
                  label="Timeout seconds"
                  value={selectedPolicy.timeout}
                  onChange={(value) => {
                    setPolicies((current) =>
                      current.map((policy) =>
                        policy.id === selectedPolicy.id
                          ? { ...policy, timeout: value }
                          : policy,
                      ),
                    );
                  }}
                />
              </div>
            </section>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recovery Flow
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Execution path used when this policy is triggered.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Fallback:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedPolicy.fallback}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 xl:flex-row xl:items-center">
                <FlowStep
                  icon={<AlertTriangle size={17} />}
                  title="Failure detected"
                  description={selectedPolicy.trigger}
                  active
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<RefreshCw size={17} />}
                  title="Retry"
                  description={`${selectedPolicy.retries} retry attempts`}
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<GitBranch size={17} />}
                  title="Evaluate"
                  description="Check recovery conditions"
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<Zap size={17} />}
                  title="Fallback"
                  description={selectedPolicy.fallback}
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<CheckCircle2 size={17} />}
                  title="Recovered"
                  description="Resume workflow execution"
                />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Recent Recovery Events
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Latest runtime recovery actions across agents.
                    </p>
                  </div>

                  <Link
                    href="/agent-builder/observability"
                    className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    View traces
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[780px]">
                    <div className="grid grid-cols-[85px_1.2fr_1fr_1fr_100px] gap-4 border-b border-slate-100 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      <span>Time</span>
                      <span>Workflow</span>
                      <span>Error</span>
                      <span>Recovery action</span>
                      <span>Result</span>
                    </div>

                    {recoveryEvents.map((event) => (
                      <RecoveryEvent
                        key={`${event.time}-${event.workflow}`}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Runtime Health
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Recovery dependencies and runtime status.
                    </p>
                  </div>

                  <HealthRow
                    name="Recovery Runtime"
                    value="99.99% uptime"
                    status="Healthy"
                  />

                  <HealthRow
                    name="Fallback Models"
                    value="5 available"
                    status="Healthy"
                  />

                  <HealthRow
                    name="Tool Registry"
                    value="98.8% healthy"
                    status="Healthy"
                  />

                  <HealthRow
                    name="Approval Queue"
                    value="3 pending"
                    status="Warning"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Recovery Actions
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Tools for debugging and runtime validation.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <ActionItem
                      icon={<TestTube2 size={16} />}
                      title="Run recovery test"
                      description="Simulate a controlled runtime failure."
                    />

                    <ActionItem
                      icon={<History size={16} />}
                      title="Recovery history"
                      description="Review previous recovery attempts."
                    />

                    <ActionItem
                      icon={<Terminal size={16} />}
                      title="Inspect runtime logs"
                      description="Open detailed execution logs."
                    />

                    <ActionItem
                      icon={<Bot size={16} />}
                      title="Agent runtime"
                      description="Inspect agent execution state."
                    />

                    <ActionItem
                      icon={<Database size={16} />}
                      title="Recovery datastore"
                      description="Inspect checkpoints and recovery state."
                    />
                  </div>
                </section>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recovery Metrics
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Runtime performance for the selected recovery policy.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity size={14} />
                  Last 24 hours
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniMetric
                  label="Recovery attempts"
                  value={formatNumber(selectedPolicy.recoveries + 86)}
                />

                <MiniMetric
                  label="Successful"
                  value={`${selectedPolicy.successRate}%`}
                />

                <MiniMetric label="Avg. recovery" value="3.8s" />

                <MiniMetric label="Escalations" value="14" />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Continue building your agent
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Connect error recovery with testing, observability and
                    deployment controls.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/agent-builder/testing"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Testing
                  </Link>

                  <Link
                    href="/agent-builder/testing/trace-viewer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Trace Viewer
                  </Link>

                  <Link
                    href="/agent-builder/deployment"
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Deployment
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Create Recovery Policy
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Configure automatic recovery behavior for your agents.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Policy name"
                  value={draftName}
                  onChange={setDraftName}
                  placeholder="Example: API Failure Recovery"
                />
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Description"
                  value={draftDescription}
                  onChange={setDraftDescription}
                  placeholder="Describe when and how this policy should recover failures."
                />
              </div>

              <SelectField
                label="Trigger"
                value={draftTrigger}
                options={[
                  "Tool execution failure",
                  "Model timeout",
                  "Retrieval failure",
                  "Browser action failure",
                  "Critical workflow failure",
                ]}
                onChange={setDraftTrigger}
              />

              <SelectField
                label="Strategy"
                value={draftStrategy}
                options={[
                  "Retry → Fallback Tool",
                  "Retry → Model Fallback",
                  "Retry → Secondary Index",
                  "Retry → Refresh → Reopen",
                  "Checkpoint → Retry → Human Approval",
                ]}
                onChange={setDraftStrategy}
              />

              <NumberField
                label="Maximum retries"
                value={draftRetries}
                onChange={setDraftRetries}
              />

              <NumberField
                label="Timeout seconds"
                value={draftTimeout}
                onChange={setDraftTimeout}
              />

              <div className="md:col-span-2">
                <Field
                  label="Fallback action"
                  value={draftFallback}
                  onChange={setDraftFallback}
                  placeholder="Example: Backup model"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createPolicy}
                disabled={!draftName.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}