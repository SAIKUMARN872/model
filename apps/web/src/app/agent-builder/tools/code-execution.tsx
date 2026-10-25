"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  Database,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Terminal,
  UserRound,
  XCircle,
} from "lucide-react";

type ExecutionStatus = "Completed" | "Running" | "Failed" | "Queued";

type Execution = {
  id: string;
  name: string;
  language: string;
  runtime: string;
  status: ExecutionStatus;
  duration: string;
  startedAt: string;
  triggeredBy: string;
  output: string;
  memory: string;
};

const executions: Execution[] = [
  {
    id: "exec-001",
    name: "Extract product prices",
    language: "JavaScript",
    runtime: "Browser Runtime",
    status: "Completed",
    duration: "1.84s",
    startedAt: "2 min ago",
    triggeredBy: "Research Agent",
    output: "42 products extracted successfully.",
    memory: "128 MB",
  },
  {
    id: "exec-002",
    name: "Normalize browser response",
    language: "JavaScript",
    runtime: "Node.js",
    status: "Completed",
    duration: "0.92s",
    startedAt: "8 min ago",
    triggeredBy: "RAG Workflow",
    output: "JSON normalized successfully.",
    memory: "86 MB",
  },
  {
    id: "exec-003",
    name: "Generate report data",
    language: "Python",
    runtime: "Python 3.12",
    status: "Running",
    duration: "4.27s",
    startedAt: "Running now",
    triggeredBy: "Analytics Agent",
    output: "Processing 18,421 records...",
    memory: "214 MB",
  },
  {
    id: "exec-004",
    name: "Browser page parser",
    language: "JavaScript",
    runtime: "Browser Runtime",
    status: "Failed",
    duration: "2.11s",
    startedAt: "21 min ago",
    triggeredBy: "Browser Agent",
    output: "Execution failed: selector not found.",
    memory: "112 MB",
  },
  {
    id: "exec-005",
    name: "Customer data validation",
    language: "Python",
    runtime: "Python 3.12",
    status: "Queued",
    duration: "-",
    startedAt: "Waiting",
    triggeredBy: "Support Agent",
    output: "Waiting for execution slot.",
    memory: "-",
  },
];

const templates = [
  {
    name: "Browser DOM Parser",
    language: "JavaScript",
    description: "Read and transform data from the current browser page.",
  },
  {
    name: "Data Transformer",
    language: "Python",
    description: "Clean, transform, and normalize structured data.",
  },
  {
    name: "API Response Parser",
    language: "JavaScript",
    description: "Convert API responses into agent-ready structured data.",
  },
];

export default function CodeExecutionPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [language, setLanguage] = useState("All");
  const [selectedExecution, setSelectedExecution] =
    useState<Execution | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Executions" | "Runtime" | "Security"
  >("Executions");

  const filteredExecutions = useMemo(() => {
    return executions.filter((execution) => {
      const matchesSearch =
        execution.name.toLowerCase().includes(search.toLowerCase()) ||
        execution.triggeredBy.toLowerCase().includes(search.toLowerCase()) ||
        execution.output.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || execution.status === status;

      const matchesLanguage =
        language === "All" || execution.language === language;

      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [search, status, language]);

  const completed = executions.filter(
    (item) => item.status === "Completed"
  ).length;

  const failed = executions.filter(
    (item) => item.status === "Failed"
  ).length;

  const running = executions.filter(
    (item) => item.status === "Running"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181c]">
      <div className="mx-auto max-w-[1500px] px-6 py-7">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <Link
              href="/browser-automation/tools"
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#69707d] hover:text-[#17181c]"
            >
              <ArrowLeft size={16} />
              Browser Automation Tools
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17181c] text-white">
                <Code2 size={21} />
              </div>

              <div>
                <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                  Code Execution
                </h1>

                <p className="mt-1 text-sm text-[#69707d]">
                  Run controlled JavaScript and Python code inside AI
                  automation workflows.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17181c] px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            <Plus size={17} />
            New Execution
          </button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            icon={<Terminal size={18} />}
            label="Total Executions"
            value="12,842"
          />

          <MetricCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value="12,164"
          />

          <MetricCard
            icon={<XCircle size={18} />}
            label="Failed"
            value="184"
          />

          <MetricCard
            icon={<Clock3 size={18} />}
            label="Avg Runtime"
            value="1.42s"
          />
        </section>

        <section className="mb-6 flex gap-1 rounded-xl border border-[#e5e7eb] bg-white p-1">
          {(["Executions", "Runtime", "Security"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#17181c] text-white"
                  : "text-[#68707b] hover:bg-[#f4f5f6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </section>

        {activeTab === "Executions" && (
          <>
            <section className="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a909b]"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search executions..."
                    className="h-10 w-full rounded-xl border border-[#e2e5e9] bg-[#fafbfc] pl-10 pr-4 text-sm outline-none focus:border-[#a9afb8]"
                  />
                </div>

                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    "All",
                    "Completed",
                    "Running",
                    "Failed",
                    "Queued",
                  ]}
                />

                <FilterSelect
                  value={language}
                  onChange={setLanguage}
                  options={["All", "JavaScript", "Python"]}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#edf0f2] px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">
                    Recent executions
                  </h2>
                  <p className="mt-1 text-xs text-[#7c838e]">
                    Runtime activity from browser and agent workflows.
                  </p>
                </div>

                <button className="inline-flex items-center gap-2 rounded-lg border border-[#e0e3e7] px-3 py-2 text-xs font-medium">
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-[#edf0f2] text-left">
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Execution
                      </th>
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Language
                      </th>
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Status
                      </th>
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Runtime
                      </th>
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Triggered by
                      </th>
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Started
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredExecutions.map((execution) => (
                      <tr
                        key={execution.id}
                        className="border-b border-[#f0f1f3] last:border-b-0 hover:bg-[#fafbfc]"
                      >
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setSelectedExecution(execution)
                            }
                            className="text-left"
                          >
                            <p className="text-sm font-medium hover:underline">
                              {execution.name}
                            </p>

                            <p className="mt-1 text-xs text-[#858c96]">
                              {execution.id}
                            </p>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-[#f1f3f5] px-2.5 py-1 text-xs font-medium">
                            {execution.language}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={execution.status} />
                        </td>

                        <td className="px-5 py-4 text-sm text-[#5e6570]">
                          {execution.duration}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#5e6570]">
                            <UserRound size={15} />
                            {execution.triggeredBy}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#6f7681]">
                          {execution.startedAt}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setSelectedExecution(execution)
                            }
                            className="rounded-lg border border-[#e0e3e7] px-3 py-1.5 text-xs font-medium hover:bg-[#f4f5f6]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <InfoCard
                icon={<ShieldCheck size={18} />}
                title="Sandboxed runtime"
                description="Code runs inside controlled environments with resource and permission limits."
              />

              <InfoCard
                icon={<Activity size={18} />}
                title="Trace every execution"
                description="Execution steps, output, duration, tokens, and failures can be observed."
              />

              <InfoCard
                icon={<Database size={18} />}
                title="Agent compatible"
                description="Attach code execution as a tool inside Agent Builder workflows."
              />
            </section>
          </>
        )}

        {activeTab === "Runtime" && (
          <RuntimePanel
            completed={completed}
            failed={failed}
            running={running}
          />
        )}

        {activeTab === "Security" && <SecurityPanel />}
      </div>

      {selectedExecution && (
        <ExecutionModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}

      {showCreate && (
        <CreateExecutionModal onClose={() => setShowCreate(false)} />
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#4f5661]">
          {icon}
        </div>

        <Activity size={15} className="text-[#b0b5bd]" />
      </div>

      <p className="text-xs text-[#777e89]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative min-w-[170px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-[#e2e5e9] bg-[#fafbfc] px-3 pr-9 text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b818c]"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const config = {
    Completed: {
      icon: <CheckCircle2 size={13} />,
      className: "bg-[#ecfdf3] text-[#15803d]",
    },
    Running: {
      icon: <RefreshCw size={13} />,
      className: "bg-[#eff6ff] text-[#2563eb]",
    },
    Failed: {
      icon: <XCircle size={13} />,
      className: "bg-[#fef2f2] text-[#dc2626]",
    },
    Queued: {
      icon: <Clock3 size={13} />,
      className: "bg-[#f3f4f6] text-[#6b7280]",
    },
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${config[status].className}`}
    >
      {config[status].icon}
      {status}
    </span>
  );
}

function RuntimePanel({
  completed,
  failed,
  running,
}: {
  completed: number;
  failed: number;
  running: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RuntimeCard
          icon={<Code2 size={18} />}
          title="JavaScript Runtime"
          value="Node.js 22"
          detail="512 MB memory"
        />

        <RuntimeCard
          icon={<Terminal size={18} />}
          title="Python Runtime"
          value="Python 3.12"
          detail="1 GB memory"
        />

        <RuntimeCard
          icon={<Activity size={18} />}
          title="Browser Runtime"
          value="Chromium"
          detail="Isolated session"
        />
      </div>

      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Runtime health</h2>

            <p className="mt-1 text-xs text-[#7b818c]">
              Current code execution infrastructure status.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[11px] font-medium text-[#15803d]">
            <CheckCircle2 size={13} />
            Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <HealthRow label="Completed" value={String(completed)} />
          <HealthRow label="Running" value={String(running)} />
          <HealthRow label="Failed" value={String(failed)} />
          <HealthRow label="Queue depth" value="3" />
        </div>
      </section>

      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-sm font-semibold">Resource limits</h2>

        <div className="mt-4 space-y-4">
          <ResourceBar label="CPU" value="31%" />
          <ResourceBar label="Memory" value="46%" />
          <ResourceBar label="Execution slots" value="58%" />
        </div>
      </section>
    </div>
  );
}

function RuntimeCard({
  icon,
  title,
  value,
  detail,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f3f5]">
        {icon}
      </div>

      <p className="text-xs text-[#7c838e]">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[#858c96]">{detail}</p>
    </div>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-4">
      <p className="text-xs text-[#858c96]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function ResourceBar({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-[#777e89]">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-[#edf0f2]">
        <div
          className="h-2 rounded-full bg-[#17181c]"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

function SecurityPanel() {
  const policies = [
    {
      title: "Network access",
      description:
        "Outbound network access is controlled by tool policy.",
      status: "Protected",
    },
    {
      title: "File system",
      description:
        "Execution environments use isolated temporary storage.",
      status: "Protected",
    },
    {
      title: "Secrets",
      description:
        "Environment secrets are masked from execution output.",
      status: "Protected",
    },
    {
      title: "Execution timeout",
      description:
        "Long-running executions are automatically terminated.",
      status: "Enabled",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecfdf3] text-[#15803d]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="text-base font-semibold">
              Code execution security
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#707782]">
              Code execution is isolated from the main application and can be
              controlled through runtime permissions, resource limits,
              network policies, and audit traces.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {policies.map((policy) => (
          <div
            key={policy.title}
            className="rounded-2xl border border-[#e5e7eb] bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">{policy.title}</h3>

                <p className="mt-1 text-xs leading-5 text-[#777e89]">
                  {policy.description}
                </p>
              </div>

              <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[11px] font-medium text-[#15803d]">
                {policy.status}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-[#c2410c]" />

          <div>
            <h2 className="text-sm font-semibold">Production policy</h2>

            <p className="mt-1 text-xs text-[#777e89]">
              Production executions should only expose the minimum required
              tools and permissions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ExecutionModal({
  execution,
  onClose,
}: {
  execution: Execution;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[720px] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{execution.name}</h2>
              <StatusBadge status={execution.status} />
            </div>

            <p className="mt-1 text-xs text-[#7b818c]">
              {execution.id} · {execution.runtime}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#717781] hover:bg-[#f1f3f5]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SmallMetric label="Language" value={execution.language} />
            <SmallMetric label="Duration" value={execution.duration} />
            <SmallMetric label="Memory" value={execution.memory} />
            <SmallMetric
              label="Triggered by"
              value={execution.triggeredBy}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-[#616873]">
                Execution output
              </p>

              <button className="inline-flex items-center gap-1.5 text-xs text-[#68707b]">
                <Copy size={13} />
                Copy
              </button>
            </div>

            <pre className="overflow-auto rounded-xl bg-[#15171a] p-4 text-xs leading-6 text-[#d8dce2]">
              {execution.output}
              {"\n\n"}
              {`status: ${execution.status}`}
              {"\n"}
              {`runtime: ${execution.runtime}`}
              {"\n"}
              {`duration: ${execution.duration}`}
              {"\n"}
              {`memory: ${execution.memory}`}
            </pre>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] p-4">
            <div className="flex items-center gap-3">
              <Activity size={17} />

              <div>
                <p className="text-sm font-medium">Execution trace</p>

                <p className="mt-1 text-xs text-[#7b818c]">
                  Open the Observability trace viewer to inspect every
                  execution step.
                </p>
              </div>

              <Link
                href="/agent-builder/observability/execution-traces"
                className="ml-auto text-xs font-medium underline"
              >
                View trace
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#edf0f2] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#17181c] px-4 py-2 text-sm font-medium text-white"
          >
            Close
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
    <div className="rounded-xl bg-[#f8f9fa] p-3">
      <p className="text-[11px] text-[#858c96]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function CreateExecutionModal({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useState("JavaScript");
  const [name, setName] = useState("");
  const [code, setCode] = useState(
    `const result = await browser.extractText({
  selector: "main"
});

return result;`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[900px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">New Code Execution</h2>

            <p className="mt-1 text-xs text-[#7b818c]">
              Create a controlled code execution task.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#717781] hover:bg-[#f1f3f5]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-4">
            <Field
              label="Execution name"
              value={name}
              onChange={setName}
              placeholder="Example: Extract page content"
            />

            <div>
              <label className="text-xs font-medium text-[#616873]">
                Language
              </label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-[#e1e4e8] bg-white px-3 text-sm outline-none"
              >
                <option>JavaScript</option>
                <option>Python</option>
              </select>
            </div>

            <div className="rounded-xl bg-[#f7f8fa] p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 text-[#4f5661]"
                />

                <div>
                  <p className="text-sm font-medium">
                    Sandboxed execution
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#777e89]">
                    Resource limits and security policies will be applied
                    automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] p-4">
              <p className="text-xs font-medium">Templates</p>

              <div className="mt-3 space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      setLanguage(template.language);
                      setName(template.name);
                    }}
                    className="w-full rounded-xl border border-[#edf0f2] p-3 text-left hover:bg-[#f8f9fa]"
                  >
                    <p className="text-xs font-medium">
                      {template.name}
                    </p>

                    <p className="mt-1 text-[11px] text-[#7b818c]">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-[#616873]">
                Code
              </label>

              <span className="rounded-lg bg-[#f1f3f5] px-2 py-1 text-[11px]">
                {language}
              </span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-[390px] w-full resize-none rounded-xl bg-[#15171a] p-5 font-mono text-[13px] leading-6 text-[#d8dce2] outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#edf0f2] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#dfe3e7] px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17181c] px-4 py-2 text-sm font-medium text-white"
          >
            <Play size={15} />
            Run Code
          </button>
        </div>
      </div>
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
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#616873]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-xl border border-[#e1e4e8] px-3 text-sm outline-none focus:border-[#9ca3af]"
      />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#4d545e]">
        {icon}
      </div>

      <h3 className="text-sm font-semibold">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#747b86]">
        {description}
      </p>
    </div>
  );
}