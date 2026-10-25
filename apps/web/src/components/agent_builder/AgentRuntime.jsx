"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  GitBranch,
  Layers,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const runtimeServices = [
  {
    id: "orchestrator",
    name: "Agent Orchestrator",
    description: "Controls agent execution and task coordination.",
    status: "Healthy",
    uptime: "99.98%",
    latency: "210ms",
    requests: "18.4K",
    icon: Bot,
  },
  {
    id: "workflow",
    name: "Workflow Engine",
    description: "Runs workflow nodes and execution dependencies.",
    status: "Healthy",
    uptime: "99.96%",
    latency: "340ms",
    requests: "11.8K",
    icon: GitBranch,
  },
  {
    id: "model",
    name: "Model Runtime",
    description: "Manages model calls, routing and fallbacks.",
    status: "Healthy",
    uptime: "99.94%",
    latency: "1.18s",
    requests: "42.6K",
    icon: Zap,
  },
  {
    id: "tools",
    name: "Tool Runtime",
    description: "Executes browser, API, database and custom tools.",
    status: "Warning",
    uptime: "99.72%",
    latency: "1.74s",
    requests: "8.2K",
    icon: Terminal,
  },
  {
    id: "memory",
    name: "Memory Runtime",
    description: "Handles conversation, working and long-term memory.",
    status: "Healthy",
    uptime: "99.99%",
    latency: "180ms",
    requests: "14.9K",
    icon: Database,
  },
  {
    id: "security",
    name: "Security Runtime",
    description: "Applies guardrails, permissions and validation.",
    status: "Healthy",
    uptime: "100%",
    latency: "90ms",
    requests: "62.8K",
    icon: ShieldCheck,
  },
];

const activeExecutions = [
  {
    id: "EX-2026-10482",
    agent: "Customer Support Agent",
    task: "Resolve customer refund request",
    status: "Running",
    duration: "1.24s",
    steps: 4,
    progress: 72,
  },
  {
    id: "EX-2026-10481",
    agent: "Research Agent",
    task: "Compare competitor pricing",
    status: "Running",
    duration: "3.18s",
    steps: 7,
    progress: 54,
  },
  {
    id: "EX-2026-10480",
    agent: "Data Agent",
    task: "Generate weekly analytics report",
    status: "Waiting",
    duration: "2.42s",
    steps: 5,
    progress: 38,
  },
  {
    id: "EX-2026-10479",
    agent: "Knowledge Agent",
    task: "Answer documentation question",
    status: "Running",
    duration: "840ms",
    steps: 3,
    progress: 86,
  },
];

const executionHistory = [
  {
    id: "RUN-8821",
    agent: "Browser Research Agent",
    task: "Market research",
    status: "Success",
    duration: "4.82s",
    cost: "$0.042",
    time: "2 min ago",
  },
  {
    id: "RUN-8820",
    agent: "Customer Support Agent",
    task: "Ticket resolution",
    status: "Success",
    duration: "1.24s",
    cost: "$0.018",
    time: "5 min ago",
  },
  {
    id: "RUN-8819",
    agent: "Database Agent",
    task: "Generate SQL analytics",
    status: "Failed",
    duration: "1.97s",
    cost: "$0.016",
    time: "8 min ago",
  },
  {
    id: "RUN-8818",
    agent: "Document Agent",
    task: "Extract contract information",
    status: "Success",
    duration: "2.18s",
    cost: "$0.024",
    time: "12 min ago",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Critical: "border-red-200 bg-red-50 text-red-700",
    Running: "border-blue-200 bg-blue-50 text-blue-700",
    Waiting: "border-amber-200 bg-amber-50 text-amber-700",
    Success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
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
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action}
    </div>
  );
}

export default function AgentRuntime() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);
  const [autoScale, setAutoScale] = useState(true);
  const [parallelExecution, setParallelExecution] = useState(true);
  const [runtimeLogging, setRuntimeLogging] = useState(true);
  const [strictTimeouts, setStrictTimeouts] = useState(true);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return executionHistory;
    }

    return executionHistory.filter(
      (item) =>
        item.agent.toLowerCase().includes(query) ||
        item.task.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }, [search]);

  const testRuntime = () => {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1550px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Server size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">Agent Runtime</h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor agent execution, runtime workers, services,
                  scaling, and execution health.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/agent-builder/observability"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Observability
                <ArrowRight size={15} />
              </a>

              <button
                type="button"
                onClick={testRuntime}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {running ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Activity size={15} />
                )}

                {running ? "Testing..." : "Test Runtime"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1550px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Active Executions"
            value="24"
            detail="Currently running"
            icon={Activity}
          />

          <MetricCard
            label="Success Rate"
            value="98.7%"
            detail="Last 24 hours"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Average Latency"
            value="1.28s"
            detail="-11% after optimization"
            icon={Clock3}
          />

          <MetricCard
            label="Runtime Workers"
            value="12"
            detail="10 active, 2 standby"
            icon={Server}
          />

          <MetricCard
            label="Runtime Health"
            value="Healthy"
            detail="All core services operational"
            icon={ShieldCheck}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "executions", "services", "settings"].map(
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
            ),
          )}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Runtime Execution"
                  description="Live execution activity across the agent platform."
                  action={<StatusBadge status="Healthy" />}
                />

                <div className="mt-5 space-y-3">
                  {activeExecutions.map((execution) => (
                    <div
                      key={execution.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {execution.agent}
                            </span>

                            <StatusBadge status={execution.status} />
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {execution.task}
                          </div>
                        </div>

                        <span className="text-xs font-medium text-slate-400">
                          {execution.id}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            Step {Math.max(1, Math.round(execution.steps * execution.progress / 100))}{" "}
                            of {execution.steps}
                          </span>

                          <span>{execution.progress}%</span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-all"
                            style={{
                              width: `${execution.progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock3 size={13} />
                          {execution.duration}
                        </span>

                        <span className="flex items-center gap-1">
                          <Layers size={13} />
                          {execution.steps} steps
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Runtime Configuration"
                  description="Core settings controlling execution behavior."
                />

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <Zap size={17} className="text-slate-700" />

                      <div>
                        <div className="text-sm font-medium">
                          Auto Scaling
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Scale runtime workers based on traffic.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setAutoScale((value) => !value)
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        autoScale ? "bg-slate-900" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          autoScale ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <Layers size={17} className="text-slate-700" />

                      <div>
                        <div className="text-sm font-medium">
                          Parallel Execution
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Allow independent workflow steps to run together.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setParallelExecution(
                          (value) => !value,
                        )
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        parallelExecution
                          ? "bg-slate-900"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          parallelExecution
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <Database size={17} className="text-slate-700" />

                      <div>
                        <div className="text-sm font-medium">
                          Runtime Logging
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Store runtime events and execution logs.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setRuntimeLogging((value) => !value)
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        runtimeLogging
                          ? "bg-slate-900"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          runtimeLogging ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck
                        size={17}
                        className="text-slate-700"
                      />

                      <div>
                        <div className="text-sm font-medium">
                          Strict Timeouts
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Stop stalled executions automatically.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setStrictTimeouts((value) => !value)
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        strictTimeouts
                          ? "bg-slate-900"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          strictTimeouts ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Runtime Pipeline"
                description="Core services involved in every agent execution."
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                {services.map((service, index) => {
                  const Icon = service.icon;

                  return (
                    <div key={service.id} className="relative">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Icon size={17} />
                        </div>

                        <div className="mt-3 text-sm font-semibold">
                          {service.name}
                        </div>

                        <div className="mt-2">
                          <StatusBadge status={service.status} />
                        </div>

                        <div className="mt-3 text-[11px] text-slate-500">
                          {service.latency}
                        </div>
                      </div>

                      {index < services.length - 1 && (
                        <span className="absolute -right-3 top-1/2 z-10 hidden text-slate-300 xl:block">
                          →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === "executions" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Execution History"
              description="Search and inspect completed agent executions."
            />

            <div className="mt-5 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search executions..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-3 py-3 font-medium">Execution</th>
                    <th className="px-3 py-3 font-medium">Agent</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Duration</th>
                    <th className="px-3 py-3 font-medium">Steps</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {activeExecutions
                    .filter((item) => {
                      const query = search.toLowerCase().trim();

                      return (
                        !query ||
                        item.id.toLowerCase().includes(query) ||
                        item.agent.toLowerCase().includes(query) ||
                        item.task.toLowerCase().includes(query)
                      );
                    })
                    .map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-4 text-sm font-medium">
                          {item.id}
                        </td>

                        <td className="px-3 py-4">
                          <div className="text-sm font-medium">
                            {item.agent}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {item.task}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {item.duration}
                        </td>

                        <td className="px-3 py-4 text-sm">
                          {item.steps}
                        </td>

                        <td className="px-3 py-4">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "services" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Runtime Services"
              description="Detailed health and performance information."
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <Icon size={18} />
                      </div>

                      <StatusBadge status={service.status} />
                    </div>

                    <div className="mt-4 text-sm font-semibold">
                      {service.name}
                    </div>

                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {service.description}
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-slate-400">
                          Requests
                        </div>
                        <div className="mt-1 text-xs font-semibold">
                          {service.requests}
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-slate-400">
                          Latency
                        </div>
                        <div className="mt-1 text-xs font-semibold">
                          {service.latency}
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-slate-400">
                          Error Rate
                        </div>
                        <div className="mt-1 text-xs font-semibold">
                          {service.errorRate}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Runtime Settings"
                description="Configure production execution behavior."
              />

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Activity size={16} />
                    <span className="text-sm font-semibold">
                      Runtime Workers
                    </span>
                  </div>

                  <div className="mt-3 text-2xl font-semibold">
                    12
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    10 active workers and 2 standby workers.
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} />
                    <span className="text-sm font-semibold">
                      Default Timeout
                    </span>
                  </div>

                  <div className="mt-3 text-2xl font-semibold">
                    60s
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Strict timeout mode is{" "}
                    {strictTimeouts ? "enabled" : "disabled"}.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Runtime Protection"
                description="Production safety and observability controls."
              />

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={17} />
                    <span className="text-sm font-medium">
                      Guardrails
                    </span>
                  </div>

                  <StatusBadge status="Healthy" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Database size={17} />
                    <span className="text-sm font-medium">
                      Memory Isolation
                    </span>
                  </div>

                  <StatusBadge status="Healthy" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Terminal size={17} />
                    <span className="text-sm font-medium">
                      Tool Permissions
                    </span>
                  </div>

                  <StatusBadge status="Healthy" />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "analytics" && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Cost Analytics"
                description="Runtime cost distribution."
              />

              <div className="mt-6 space-y-5">
                {[
                  ["Model Tokens", 68, "$291.40"],
                  ["Tool Calls", 18, "$77.20"],
                  ["RAG", 8, "$34.30"],
                  ["Memory", 4, "$17.10"],
                  ["Other", 2, "$8.60"],
                ].map((item) => {
                  const name = String(item[0]);
                  const percentage = Number(item[1]);
                  const value = String(item[2]);

                  return (
                    <div key={name}>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{name}</span>
                        <span className="text-slate-500">{value}</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Reliability Analytics"
                description="Execution reliability for the runtime."
              />

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600"
                  />

                  <div className="mt-3 text-2xl font-semibold text-emerald-800">
                    61.4K
                  </div>

                  <div className="mt-1 text-xs text-emerald-700">
                    Successful executions
                  </div>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <XCircle size={18} className="text-red-600" />

                  <div className="mt-3 text-2xl font-semibold text-red-800">
                    1.4K
                  </div>

                  <div className="mt-1 text-xs text-red-700">
                    Failed executions
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <AlertTriangle
                    size={18}
                    className="text-amber-600"
                  />

                  <div className="mt-3 text-2xl font-semibold text-amber-800">
                    640
                  </div>

                  <div className="mt-1 text-xs text-amber-700">
                    Warning executions
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <TrendingUp
                    size={18}
                    className="text-blue-600"
                  />

                  <div className="mt-3 text-2xl font-semibold text-blue-800">
                    +8.4%
                  </div>

                  <div className="mt-1 text-xs text-blue-700">
                    Reliability improvement
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}