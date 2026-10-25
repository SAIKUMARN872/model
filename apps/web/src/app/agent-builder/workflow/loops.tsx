"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  History,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TimerReset,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";

type LoopStatus = "Active" | "Draft" | "Disabled";

type LoopMode = "For Each" | "While" | "Until";

type LoopConfig = {
  id: string;
  name: string;
  description: string;
  status: LoopStatus;
  mode: LoopMode;
  collection: string;
  maxIterations: number;
  concurrency: number;
  timeout: number;
  onError: string;
  completedRuns: number;
  successRate: number;
  lastRun: string;
};

const initialLoops: LoopConfig[] = [
  {
    id: "loop-001",
    name: "Process Customer Records",
    description:
      "Iterates through customer records and runs the customer enrichment workflow.",
    status: "Active",
    mode: "For Each",
    collection: "customer_records",
    maxIterations: 500,
    concurrency: 5,
    timeout: 60,
    onError: "Continue",
    completedRuns: 12842,
    successRate: 98.7,
    lastRun: "2 minutes ago",
  },
  {
    id: "loop-002",
    name: "Research Result Pagination",
    description:
      "Continues requesting search pages until the required number of results is collected.",
    status: "Active",
    mode: "Until",
    collection: "search_results",
    maxIterations: 20,
    concurrency: 1,
    timeout: 45,
    onError: "Retry",
    completedRuns: 6384,
    successRate: 97.9,
    lastRun: "7 minutes ago",
  },
  {
    id: "loop-003",
    name: "Document Processing Queue",
    description:
      "Processes documents from a queue while pending documents remain.",
    status: "Active",
    mode: "While",
    collection: "document_queue",
    maxIterations: 1000,
    concurrency: 10,
    timeout: 120,
    onError: "Stop",
    completedRuns: 4218,
    successRate: 99.2,
    lastRun: "14 minutes ago",
  },
  {
    id: "loop-004",
    name: "Browser Link Scanner",
    description:
      "Scans links discovered during browser automation and validates each URL.",
    status: "Draft",
    mode: "For Each",
    collection: "discovered_links",
    maxIterations: 200,
    concurrency: 3,
    timeout: 90,
    onError: "Continue",
    completedRuns: 0,
    successRate: 0,
    lastRun: "Never",
  },
];

const loopModes: LoopMode[] = ["For Each", "While", "Until"];

const errorStrategies = ["Continue", "Retry", "Stop"];

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
          <span className="text-xs font-medium text-emerald-600">
            {change}
          </span>
        )}
      </div>

      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LoopStatus }) {
  const styles: Record<LoopStatus, string> = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Draft: "border-amber-200 bg-amber-50 text-amber-700",
    Disabled: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${styles[status]}`}
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
        min={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
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
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
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
      className={`min-w-[165px] rounded-xl border p-4 ${
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

function EventRow({
  time,
  workflow,
  iteration,
  duration,
  result,
}: {
  time: string;
  workflow: string;
  iteration: string;
  duration: string;
  result: string;
}) {
  const success = result === "Completed";

  return (
    <div className="grid grid-cols-[90px_1.4fr_110px_100px_110px] items-center gap-4 border-b border-slate-100 py-3 text-sm last:border-b-0">
      <span className="font-mono text-[11px] text-slate-500">{time}</span>

      <span className="font-medium text-slate-800">{workflow}</span>

      <span className="text-xs text-slate-600">{iteration}</span>

      <span className="text-xs text-slate-600">{duration}</span>

      <span
        className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
          success
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {result}
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

export default function LoopsPage() {
  const [loops, setLoops] = useState(initialLoops);
  const [selectedId, setSelectedId] = useState(initialLoops[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [running, setRunning] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMode, setNewMode] = useState<LoopMode>("For Each");
  const [newCollection, setNewCollection] = useState("");
  const [newIterations, setNewIterations] = useState(100);
  const [newConcurrency, setNewConcurrency] = useState(1);
  const [newTimeout, setNewTimeout] = useState(60);
  const [newErrorStrategy, setNewErrorStrategy] =
    useState("Continue");

  const selectedLoop =
    loops.find((loop) => loop.id === selectedId) ?? loops[0];

  const filteredLoops = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loops.filter((loop) => {
      const matchesSearch =
        !query ||
        loop.name.toLowerCase().includes(query) ||
        loop.description.toLowerCase().includes(query) ||
        loop.collection.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || loop.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loops, search, statusFilter]);

  const activeLoops = loops.filter(
    (loop) => loop.status === "Active",
  ).length;

  const totalRuns = loops.reduce(
    (sum, loop) => sum + loop.completedRuns,
    0,
  );

  const averageSuccess =
    loops.length > 0
      ? loops.reduce((sum, loop) => sum + loop.successRate, 0) /
        loops.length
      : 0;

  const updateSelectedLoop = (
    updates: Partial<LoopConfig>,
  ) => {
    if (!selectedLoop) return;

    setLoops((current) =>
      current.map((loop) =>
        loop.id === selectedLoop.id
          ? { ...loop, ...updates }
          : loop,
      ),
    );
  };

  const toggleLoop = () => {
    if (!selectedLoop) return;

    updateSelectedLoop({
      status:
        selectedLoop.status === "Active" ? "Disabled" : "Active",
    });
  };

  const runLoopTest = () => {
    setRunning(true);

    window.setTimeout(() => {
      setRunning(false);

      if (selectedLoop) {
        updateSelectedLoop({
          completedRuns: selectedLoop.completedRuns + 1,
          lastRun: "Just now",
        });
      }
    }, 1300);
  };

  const createLoop = () => {
    if (!newName.trim()) return;

    const newLoop: LoopConfig = {
      id: `loop-${String(loops.length + 1).padStart(3, "0")}`,
      name: newName.trim(),
      description:
        newDescription.trim() ||
        "Custom workflow loop created from Agent Builder.",
      status: "Draft",
      mode: newMode,
      collection: newCollection.trim() || "workflow_items",
      maxIterations: newIterations,
      concurrency: newConcurrency,
      timeout: newTimeout,
      onError: newErrorStrategy,
      completedRuns: 0,
      successRate: 0,
      lastRun: "Never",
    };

    setLoops((current) => [...current, newLoop]);
    setSelectedId(newLoop.id);
    setShowCreate(false);

    setNewName("");
    setNewDescription("");
    setNewMode("For Each");
    setNewCollection("");
    setNewIterations(100);
    setNewConcurrency(1);
    setNewTimeout(60);
    setNewErrorStrategy("Continue");
  };

  const deleteSelectedLoop = () => {
    if (!selectedLoop || loops.length <= 1) return;

    const remaining = loops.filter(
      (loop) => loop.id !== selectedLoop.id,
    );

    setLoops(remaining);
    setSelectedId(remaining[0].id);
  };

  if (!selectedLoop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/workflow"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold">Loops</h1>

                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Workflow Orchestration
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Repeat agent actions across collections and conditions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/workflow"
              className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <GitBranch size={15} />
              Workflow Canvas
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus size={15} />
              Create Loop
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-[280px] shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Loop Nodes
              </div>

              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                {loops.length}
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
                placeholder="Search loops..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="mb-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
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
            </div>

            <div className="space-y-1.5">
              {filteredLoops.map((loop) => (
                <button
                  key={loop.id}
                  onClick={() => setSelectedId(loop.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedLoop.id === loop.id
                      ? "border-slate-300 bg-slate-50"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {loop.name}
                      </div>

                      <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                        {loop.description}
                      </div>
                    </div>

                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        loop.status === "Active"
                          ? "bg-emerald-500"
                          : loop.status === "Draft"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
                      {loop.mode}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {loop.maxIterations} max
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-slate-700" />

                <span className="text-xs font-semibold text-slate-800">
                  Loop Runtime
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Control iteration limits, concurrency, timeouts and
                failure behavior for repeating workflows.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-7">
          <div className="mx-auto max-w-[1450px]">
            <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard
                icon={<RefreshCw size={18} />}
                label="Active loops"
                value={String(activeLoops)}
                change="+1 this week"
              />

              <MetricCard
                icon={<Activity size={18} />}
                label="Completed iterations"
                value={new Intl.NumberFormat("en-US").format(
                  totalRuns,
                )}
                change="+14.8%"
              />

              <MetricCard
                icon={<CheckCircle2 size={18} />}
                label="Average success"
                value={`${averageSuccess.toFixed(1)}%`}
                change="+1.7%"
              />

              <MetricCard
                icon={<TimerReset size={18} />}
                label="Average loop latency"
                value="2.7s"
                change="-11.4%"
              />
            </div>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedLoop.name}
                    </h2>

                    <StatusBadge status={selectedLoop.status} />
                  </div>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {selectedLoop.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runLoopTest}
                    disabled={running}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {running ? (
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Play size={14} />
                    )}

                    {running ? "Running..." : "Test Loop"}
                  </button>

                  <button
                    onClick={toggleLoop}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    {selectedLoop.status === "Active"
                      ? "Disable"
                      : "Enable"}
                  </button>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  label="Loop mode"
                  value={selectedLoop.mode}
                  options={loopModes}
                  onChange={(value) =>
                    updateSelectedLoop({
                      mode: value as LoopMode,
                    })
                  }
                />

                <Field
                  label="Collection / input"
                  value={selectedLoop.collection}
                  onChange={(value) =>
                    updateSelectedLoop({
                      collection: value,
                    })
                  }
                  placeholder="customer_records"
                />

                <NumberField
                  label="Maximum iterations"
                  value={selectedLoop.maxIterations}
                  onChange={(value) =>
                    updateSelectedLoop({
                      maxIterations: value,
                    })
                  }
                />

                <NumberField
                  label="Concurrency"
                  value={selectedLoop.concurrency}
                  onChange={(value) =>
                    updateSelectedLoop({
                      concurrency: value,
                    })
                  }
                />
              </div>
            </section>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Loop Execution Flow
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Runtime sequence for the selected loop.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Mode:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedLoop.mode}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 xl:flex-row xl:items-center">
                <FlowStep
                  icon={<Database size={17} />}
                  title="Input"
                  description={selectedLoop.collection}
                  active
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<Layers size={17} />}
                  title="Get Item"
                  description="Select next item"
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<Zap size={17} />}
                  title="Execute"
                  description="Run child workflow"
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
                  description="Check loop condition"
                />

                <div className="hidden text-slate-300 xl:block">
                  <ArrowRight size={20} />
                </div>

                <div className="block text-center text-slate-300 xl:hidden">
                  ↓
                </div>

                <FlowStep
                  icon={<CheckCircle2 size={17} />}
                  title="Complete"
                  description="Exit loop"
                />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Loop Configuration
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Fine-tune runtime behavior for repeated execution.
                    </p>
                  </div>

                  <Settings2
                    size={17}
                    className="text-slate-400"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <NumberField
                    label="Execution timeout (seconds)"
                    value={selectedLoop.timeout}
                    onChange={(value) =>
                      updateSelectedLoop({
                        timeout: value,
                      })
                    }
                  />

                  <SelectField
                    label="On iteration error"
                    value={selectedLoop.onError}
                    options={errorStrategies}
                    onChange={(value) =>
                      updateSelectedLoop({
                        onError: value,
                      })
                    }
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={16}
                        className="text-slate-700"
                      />

                      <span className="text-xs font-semibold text-slate-800">
                        Safety limit
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      The loop stops automatically after{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedLoop.maxIterations}
                      </span>{" "}
                      iterations.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Zap
                        size={16}
                        className="text-slate-700"
                      />

                      <span className="text-xs font-semibold text-slate-800">
                        Parallel execution
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      Up to{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedLoop.concurrency}
                      </span>{" "}
                      items can execute concurrently.
                    </p>
                  </div>
                </div>
              </section>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Runtime Health
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Loop engine and workflow dependencies.
                    </p>
                  </div>

                  <HealthRow
                    name="Loop Runtime"
                    value="99.99% uptime"
                    status="Healthy"
                  />

                  <HealthRow
                    name="Workflow Engine"
                    value="Healthy"
                    status="Healthy"
                  />

                  <HealthRow
                    name="Queue Service"
                    value="Healthy"
                    status="Healthy"
                  />

                  <HealthRow
                    name="Worker Capacity"
                    value="82%"
                    status="Warning"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Loop Metrics
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniMetric
                      label="Completed runs"
                      value={new Intl.NumberFormat("en-US").format(
                        selectedLoop.completedRuns,
                      )}
                    />

                    <MiniMetric
                      label="Success rate"
                      value={
                        selectedLoop.successRate
                          ? `${selectedLoop.successRate}%`
                          : "N/A"
                      }
                    />

                    <MiniMetric
                      label="Max iterations"
                      value={String(selectedLoop.maxIterations)}
                    />

                    <MiniMetric
                      label="Concurrency"
                      value={String(selectedLoop.concurrency)}
                    />
                  </div>
                </section>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Recent Loop Executions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest executions from the workflow runtime.
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
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[90px_1.4fr_110px_100px_110px] gap-4 border-b border-slate-100 pb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>Time</span>
                    <span>Workflow</span>
                    <span>Iterations</span>
                    <span>Duration</span>
                    <span>Result</span>
                  </div>

                  <EventRow
                    time="10:42:18"
                    workflow={selectedLoop.name}
                    iteration="120 / 120"
                    duration="3.2s"
                    result="Completed"
                  />

                  <EventRow
                    time="10:38:44"
                    workflow={selectedLoop.name}
                    iteration="98 / 98"
                    duration="2.8s"
                    result="Completed"
                  />

                  <EventRow
                    time="10:31:07"
                    workflow={selectedLoop.name}
                    iteration="76 / 76"
                    duration="2.4s"
                    result="Completed"
                  />

                  <EventRow
                    time="10:26:51"
                    workflow={selectedLoop.name}
                    iteration="63 / 65"
                    duration="4.1s"
                    result="Stopped"
                  />
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Continue building your workflow
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Combine loops with conditions, parallel execution,
                    sub-agents and error recovery.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/agent-builder/workflow/conditions"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Conditions
                  </Link>

                  <Link
                    href="/agent-builder/workflow/parallel-execution"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Parallel Execution
                  </Link>

                  <Link
                    href="/agent-builder/workflow/error-recovery"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Error Recovery
                  </Link>

                  <Link
                    href="/agent-builder/workflow"
                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Workflow Canvas
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </section>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <div className="text-xs font-semibold text-red-900">
                    Danger zone
                  </div>

                  <div className="mt-0.5 text-[11px] text-red-700">
                    Remove the selected loop from this agent workflow.
                  </div>
                </div>
              </div>

              <button
                onClick={deleteSelectedLoop}
                disabled={loops.length <= 1}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} />
                Delete Loop
              </button>
            </div>
          </div>
        </main>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Create Loop
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Configure a reusable workflow loop.
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
                  label="Loop name"
                  value={newName}
                  onChange={setNewName}
                  placeholder="Example: Process customer records"
                />
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Description"
                  value={newDescription}
                  onChange={setNewDescription}
                  placeholder="Describe what should repeat."
                />
              </div>

              <SelectField
                label="Loop mode"
                value={newMode}
                options={loopModes}
                onChange={(value) =>
                  setNewMode(value as LoopMode)
                }
              />

              <Field
                label="Collection / input"
                value={newCollection}
                onChange={setNewCollection}
                placeholder="customer_records"
              />

              <NumberField
                label="Maximum iterations"
                value={newIterations}
                onChange={setNewIterations}
              />

              <NumberField
                label="Concurrency"
                value={newConcurrency}
                onChange={setNewConcurrency}
              />

              <NumberField
                label="Timeout seconds"
                value={newTimeout}
                onChange={setNewTimeout}
              />

              <SelectField
                label="On iteration error"
                value={newErrorStrategy}
                options={errorStrategies}
                onChange={setNewErrorStrategy}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createLoop}
                disabled={!newName.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Loop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}