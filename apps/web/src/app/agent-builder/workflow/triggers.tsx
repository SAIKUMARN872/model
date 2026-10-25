"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GitBranch,
  History,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Webhook,
  XCircle,
  Zap,
  Layers,
} from "lucide-react";

type TriggerStatus = "Active" | "Draft" | "Paused";

type TriggerType =
  | "Schedule"
  | "Webhook"
  | "Event"
  | "Manual"
  | "API"
  | "File Upload";

type Trigger = {
  id: string;
  name: string;
  type: TriggerType;
  description: string;
  status: TriggerStatus;
  workflow: string;
  executions: number;
  successRate: number;
  lastTriggered: string;
  nextRun: string;
};

const initialTriggers: Trigger[] = [
  {
    id: "trg-001",
    name: "Daily Research Sync",
    type: "Schedule",
    description:
      "Runs the research workflow every morning and refreshes knowledge sources.",
    status: "Active",
    workflow: "Research & Analysis",
    executions: 482,
    successRate: 99.2,
    lastTriggered: "Today, 09:00",
    nextRun: "Tomorrow, 09:00",
  },
  {
    id: "trg-002",
    name: "Customer Webhook",
    type: "Webhook",
    description:
      "Starts the customer intelligence workflow when a new event is received.",
    status: "Active",
    workflow: "Customer Intelligence",
    executions: 1248,
    successRate: 98.7,
    lastTriggered: "3 min ago",
    nextRun: "On event",
  },
  {
    id: "trg-003",
    name: "Document Uploaded",
    type: "File Upload",
    description:
      "Automatically processes newly uploaded documents through the RAG pipeline.",
    status: "Active",
    workflow: "Document Processing",
    executions: 763,
    successRate: 97.9,
    lastTriggered: "8 min ago",
    nextRun: "On upload",
  },
  {
    id: "trg-004",
    name: "Weekly Content Generation",
    type: "Schedule",
    description:
      "Starts the content generation workflow every Monday morning.",
    status: "Draft",
    workflow: "Content Generation",
    executions: 0,
    successRate: 0,
    lastTriggered: "Never",
    nextRun: "Not scheduled",
  },
  {
    id: "trg-005",
    name: "Risk Assessment API",
    type: "API",
    description:
      "Allows external applications to start the risk assessment workflow.",
    status: "Active",
    workflow: "Risk Assessment",
    executions: 531,
    successRate: 96.8,
    lastTriggered: "22 min ago",
    nextRun: "On API request",
  },
  {
    id: "trg-006",
    name: "Manual Review",
    type: "Manual",
    description:
      "Allows an authorized operator to manually start a workflow.",
    status: "Paused",
    workflow: "Review Agent",
    executions: 218,
    successRate: 99.5,
    lastTriggered: "Yesterday",
    nextRun: "Manual",
  },
];

const triggerTypes: {
  type: TriggerType;
  description: string;
  icon: typeof CalendarClock;
}[] = [
  {
    type: "Schedule",
    description: "Run workflows at a specific time or interval.",
    icon: CalendarClock,
  },
  {
    type: "Webhook",
    description: "Start a workflow when an external webhook arrives.",
    icon: Webhook,
  },
  {
    type: "Event",
    description: "React to application and platform events.",
    icon: Zap,
  },
  {
    type: "Manual",
    description: "Allow authorized users to start workflows.",
    icon: Play,
  },
  {
    type: "API",
    description: "Trigger workflows through an API endpoint.",
    icon: GitBranch,
  },
  {
    type: "File Upload",
    description: "Start workflows when new files are uploaded.",
    icon: RefreshCw,
  },
];

function StatusBadge({ status }: { status: TriggerStatus }) {
  const config = {
    Active: {
      icon: CheckCircle2,
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    Draft: {
      icon: Clock3,
      className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    Paused: {
      icon: AlertTriangle,
      className: "border-red-500/20 bg-red-500/10 text-red-400",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: TriggerType }) {
  const icons: Record<TriggerType, typeof CalendarClock> = {
    Schedule: CalendarClock,
    Webhook,
    Event: Zap,
    Manual: Play,
    API: GitBranch,
    "File Upload": RefreshCw,
  };

  const Icon = icons[type];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-[11px] text-white/55">
      <Icon size={12} />
      {type}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          <Icon size={18} />
        </div>

        <span className="text-xs text-white/30">Live</span>
      </div>

      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
      <div className="mt-2 text-xs text-white/35">{detail}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-white/40">{label}</span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 pr-9 text-sm text-white outline-none focus:border-white/20"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#111113]">
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35"
        />
      </div>
    </label>
  );
}

function TriggerCard({
  trigger,
  selected,
  onSelect,
}: {
  trigger: Trigger;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-white">
              {trigger.name}
            </div>

            <StatusBadge status={trigger.status} />
          </div>

          <div className="mt-2">
            <TypeBadge type={trigger.type} />
          </div>

          <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">
            {trigger.description}
          </p>
        </div>

        <ArrowRight
          size={16}
          className={`mt-1 shrink-0 ${
            selected ? "text-white/60" : "text-white/20"
          }`}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/30">
            Workflow
          </div>
          <div className="mt-1 truncate text-xs text-white/55">
            {trigger.workflow}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/30">
            Runs
          </div>
          <div className="mt-1 text-xs text-white/55">
            {trigger.executions.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wide text-white/30">
            Success
          </div>
          <div className="mt-1 text-xs text-white/55">
            {trigger.executions === 0 ? "—" : `${trigger.successRate}%`}
          </div>
        </div>
      </div>
    </button>
  );
}

function ConfigRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] py-3 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-white/35" />
        <span className="text-xs text-white/50">{label}</span>
      </div>

      <span className="max-w-[55%] truncate text-xs text-white/65">
        {value}
      </span>
    </div>
  );
}

export default function TriggersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("trg-001");
  const [running, setRunning] = useState(false);

  const selectedTrigger = useMemo(
    () =>
      initialTriggers.find((trigger) => trigger.id === selectedId) ??
      initialTriggers[0],
    [selectedId],
  );

  const filteredTriggers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialTriggers.filter((trigger) => {
      const matchesSearch =
        !query ||
        trigger.name.toLowerCase().includes(query) ||
        trigger.description.toLowerCase().includes(query) ||
        trigger.workflow.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || trigger.status === statusFilter;

      const matchesType =
        typeFilter === "All" || trigger.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const activeCount = initialTriggers.filter(
    (trigger) => trigger.status === "Active",
  ).length;

  const totalExecutions = initialTriggers.reduce(
    (sum, trigger) => sum + trigger.executions,
    0,
  );

  const productionTriggers = initialTriggers.filter(
    (trigger) => trigger.executions > 0,
  );

  const averageSuccess =
    productionTriggers.length > 0
      ? productionTriggers.reduce(
          (sum, trigger) => sum + trigger.successRate,
          0,
        ) / productionTriggers.length
      : 0;

  const runTrigger = () => {
    setRunning(true);

    window.setTimeout(() => {
      setRunning(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1550px] px-5 py-6 md:px-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/workflow"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/30">
                Workflow Orchestration
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Triggers
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/agent-builder/workflow/canvas"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.06]"
            >
              <GitBranch size={15} />
              Workflow Canvas
            </Link>

            <button
              type="button"
              onClick={runTrigger}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90"
            >
              {running ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Play size={15} />
              )}
              {running ? "Running..." : "Test Trigger"}
            </button>
          </div>
        </header>

        <section className="mt-7 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-transparent p-7 md:p-9">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50">
              <Zap size={13} />
              Workflow Automation
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              Start workflows from events, schedules, APIs, and user actions.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/45">
              Configure reliable workflow triggers that connect schedules,
              webhooks, application events, file uploads, APIs, and manual
              actions to your AI workflows.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Zap}
            label="Active triggers"
            value={String(activeCount)}
            detail="Triggers currently enabled"
          />

          <MetricCard
            icon={Activity}
            label="Total executions"
            value={totalExecutions.toLocaleString()}
            detail="Workflow executions initiated"
          />

          <MetricCard
            icon={CheckCircle2}
            label="Average success rate"
            value={`${averageSuccess.toFixed(1)}%`}
            detail="Across production triggers"
          />

          <MetricCard
            icon={Clock3}
            label="Trigger types"
            value="6"
            detail="Schedule, webhook, event, API and more"
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Trigger registry</h3>
                <p className="mt-1 text-xs text-white/35">
                  Select a trigger to configure.
                </p>
              </div>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.07] hover:text-white"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search triggers..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-white/20"
              />
            </div>

            <div className="grid gap-3">
              <SelectField
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={["All", "Active", "Draft", "Paused"]}
              />

              <SelectField
                label="Trigger type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  "All",
                  "Schedule",
                  "Webhook",
                  "Event",
                  "Manual",
                  "API",
                  "File Upload",
                ]}
              />
            </div>

            <div className="mt-4 space-y-3">
              {filteredTriggers.map((trigger) => (
                <TriggerCard
                  key={trigger.id}
                  trigger={trigger}
                  selected={trigger.id === selectedId}
                  onSelect={() => setSelectedId(trigger.id)}
                />
              ))}

              {filteredTriggers.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 text-center">
                  <Search size={22} className="mx-auto text-white/25" />

                  <div className="mt-3 text-xs text-white/50">
                    No triggers found.
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Zap size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">
                        {selectedTrigger.name}
                      </h3>

                      <StatusBadge status={selectedTrigger.status} />
                    </div>

                    <p className="mt-1 text-xs text-white/35">
                      {selectedTrigger.workflow} · {selectedTrigger.type}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white"
                >
                  <Settings2 size={14} />
                  Trigger settings
                </button>
              </div>

              <div className="p-5">
                <p className="text-sm leading-6 text-white/50">
                  {selectedTrigger.description}
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Executions
                    </div>

                    <div className="mt-2 text-xl font-semibold">
                      {selectedTrigger.executions.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Success rate
                    </div>

                    <div className="mt-2 text-xl font-semibold">
                      {selectedTrigger.executions === 0
                        ? "—"
                        : `${selectedTrigger.successRate}%`}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="text-[10px] uppercase tracking-wide text-white/30">
                      Last triggered
                    </div>

                    <div className="mt-2 text-sm font-medium">
                      {selectedTrigger.lastTriggered}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-5">
                  <div className="text-xs font-medium text-white">
                    Trigger configuration
                  </div>

                  <div className="mt-3">
                    <ConfigRow
                      label="Trigger type"
                      value={selectedTrigger.type}
                      icon={Zap}
                    />

                    <ConfigRow
                      label="Target workflow"
                      value={selectedTrigger.workflow}
                      icon={GitBranch}
                    />

                    <ConfigRow
                      label="Last triggered"
                      value={selectedTrigger.lastTriggered}
                      icon={History}
                    />

                    <ConfigRow
                      label="Next run"
                      value={selectedTrigger.nextRun}
                      icon={CalendarClock}
                    />

                    <ConfigRow
                      label="Security"
                      value="Authentication required"
                      icon={ShieldCheck}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Trigger execution flow
                    </h3>

                    <p className="mt-1 text-xs text-white/35">
                      Event → validation → workflow execution
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-400">
                    <Activity size={12} />
                    Runtime ready
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto p-6">
                <div className="flex min-w-[760px] items-center justify-center gap-4">
                  <div className="min-w-[170px] rounded-xl border border-white/10 bg-[#101012] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                        <Zap size={16} />
                      </div>

                      <div>
                        <div className="text-xs font-medium">
                          {selectedTrigger.type}
                        </div>
                        <div className="mt-1 text-[10px] text-white/35">
                          Trigger event
                        </div>
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={18} className="text-white/20" />

                  <div className="min-w-[170px] rounded-xl border border-white/10 bg-[#101012] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                        <ShieldCheck size={16} />
                      </div>

                      <div>
                        <div className="text-xs font-medium">Validate</div>
                        <div className="mt-1 text-[10px] text-white/35">
                          Auth & policy
                        </div>
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={18} className="text-white/20" />

                  <div className="min-w-[170px] rounded-xl border border-white/10 bg-[#101012] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                        <GitBranch size={16} />
                      </div>

                      <div>
                        <div className="truncate text-xs font-medium">
                          {selectedTrigger.workflow}
                        </div>
                        <div className="mt-1 text-[10px] text-white/35">
                          Target workflow
                        </div>
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={18} className="text-white/20" />

                  <div className="min-w-[170px] rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 size={16} />
                      </div>

                      <div>
                        <div className="text-xs font-medium">Execute</div>
                        <div className="mt-1 text-[10px] text-white/35">
                          Workflow started
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Trigger runtime health
                  </h3>

                  <p className="mt-1 text-xs text-white/35">
                    Trigger infrastructure status
                  </p>
                </div>

                <div className="mt-2">
                  <ConfigRow
                    label="Event listener"
                    value="Healthy"
                    icon={Activity}
                  />

                  <ConfigRow
                    label="Scheduler"
                    value="Healthy"
                    icon={CalendarClock}
                  />

                  <ConfigRow
                    label="Webhook receiver"
                    value="Healthy"
                    icon={Webhook}
                  />

                  <ConfigRow
                    label="Authentication"
                    value="Healthy"
                    icon={ShieldCheck}
                  />

                  <ConfigRow
                    label="Workflow router"
                    value="Healthy"
                    icon={GitBranch}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Recent trigger activity
                  </h3>

                  <p className="mt-1 text-xs text-white/35">
                    Latest workflow starts
                  </p>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-3 border-b border-white/[0.06] py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">
                        Customer Webhook
                      </div>
                      <div className="mt-1 text-[10px] text-white/35">
                        Customer Intelligence
                      </div>
                    </div>

                    <span className="text-[10px] text-white/30">3m</span>
                  </div>

                  <div className="flex items-center gap-3 border-b border-white/[0.06] py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">
                        Document Uploaded
                      </div>
                      <div className="mt-1 text-[10px] text-white/35">
                        Document Processing
                      </div>
                    </div>

                    <span className="text-[10px] text-white/30">8m</span>
                  </div>

                  <div className="flex items-center gap-3 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                      <XCircle size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">
                        Risk Assessment API
                      </div>
                      <div className="mt-1 text-[10px] text-white/35">
                        Request validation failed
                      </div>
                    </div>

                    <span className="text-[10px] text-white/30">22m</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Trigger types</h3>

            <p className="mt-1 text-sm text-white/40">
              Common ways to start ModelNow workflows.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {triggerTypes.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.type}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Icon size={18} />
                  </div>

                  <div className="mt-4 text-sm font-semibold">
                    {item.type}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                Build reliable event-driven workflows
              </h3>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">
                Combine triggers with conditions, parallel execution, human
                approvals, error recovery, and observability for production
                automation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/agent-builder/workflow/conditions"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <GitBranch size={13} />
                Conditions
              </Link>

              <Link
                href="/agent-builder/workflow/parallel"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <Layers size={13} />
                Parallel
              </Link>

              <Link
                href="/agent-builder/workflow/human-approvals"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <ShieldCheck size={13} />
                Approvals
              </Link>

              <Link
                href="/agent-builder/workflow/error-recovery"
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/[0.05] hover:text-white"
              >
                <RefreshCw size={13} />
                Recovery
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}