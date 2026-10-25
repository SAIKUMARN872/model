"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const testCategories = [
  {
    id: "functional",
    name: "Functional Testing",
    description:
      "Verify that agents produce correct outputs for expected inputs.",
    status: "Active",
    coverage: 94,
    icon: TestTube2,
  },
  {
    id: "quality",
    name: "Quality Evaluation",
    description:
      "Measure correctness, relevance, groundedness, and consistency.",
    status: "Active",
    coverage: 91,
    icon: Target,
  },
  {
    id: "security",
    name: "Security Testing",
    description:
      "Validate prompt injection, sensitive data, and policy protections.",
    status: "Active",
    coverage: 98,
    icon: ShieldCheck,
  },
  {
    id: "regression",
    name: "Regression Testing",
    description:
      "Detect quality or behavior changes across agent versions.",
    status: "Active",
    coverage: 89,
    icon: GitBranch,
  },
  {
    id: "performance",
    name: "Performance Testing",
    description:
      "Measure latency, throughput, tokens, failures, and cost.",
    status: "Active",
    coverage: 86,
    icon: Activity,
  },
  {
    id: "human",
    name: "Human Evaluation",
    description:
      "Collect reviewer feedback and human quality assessments.",
    status: "Active",
    coverage: 78,
    icon: Users,
  },
];

const initialSuites = [
  {
    id: "TS-001",
    name: "Customer Support Regression",
    description:
      "Core customer support conversations across common intents.",
    tests: 120,
    passed: 116,
    failed: 4,
    status: "Healthy",
    lastRun: "8 min ago",
  },
  {
    id: "TS-002",
    name: "RAG Grounding Benchmark",
    description:
      "Checks answer quality against enterprise knowledge sources.",
    tests: 85,
    passed: 80,
    failed: 5,
    status: "Warning",
    lastRun: "21 min ago",
  },
  {
    id: "TS-003",
    name: "Agent Tool Use",
    description:
      "Validates tool selection and correct execution behavior.",
    tests: 64,
    passed: 63,
    failed: 1,
    status: "Healthy",
    lastRun: "32 min ago",
  },
  {
    id: "TS-004",
    name: "Prompt Injection Safety",
    description:
      "Adversarial prompts designed to test security guardrails.",
    tests: 140,
    passed: 138,
    failed: 2,
    status: "Healthy",
    lastRun: "45 min ago",
  },
];

const initialRuns = [
  {
    id: "RUN-2048",
    suite: "Customer Support Regression",
    agent: "Support Agent",
    tests: 120,
    passed: 116,
    failed: 4,
    duration: "4m 18s",
    status: "Completed",
    time: "8 min ago",
  },
  {
    id: "RUN-2047",
    suite: "RAG Grounding Benchmark",
    agent: "Knowledge Agent",
    tests: 85,
    passed: 80,
    failed: 5,
    duration: "3m 42s",
    status: "Completed",
    time: "21 min ago",
  },
  {
    id: "RUN-2046",
    suite: "Agent Tool Use",
    agent: "Research Agent",
    tests: 64,
    passed: 63,
    failed: 1,
    duration: "2m 55s",
    status: "Completed",
    time: "32 min ago",
  },
  {
    id: "RUN-2045",
    suite: "Prompt Injection Safety",
    agent: "Security Agent",
    tests: 140,
    passed: 138,
    failed: 2,
    duration: "5m 12s",
    status: "Completed",
    time: "45 min ago",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
    Running: "border-blue-200 bg-blue-50 text-blue-700",
    Disabled: "border-slate-200 bg-slate-50 text-slate-500",
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

function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-slate-900 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-slate-400"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function SuiteCard({ suite, onRun, onOpen }) {
  const passRate =
    suite.tests > 0
      ? Math.round((suite.passed / suite.tests) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {suite.name}
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {suite.description}
          </p>
        </div>

        <StatusBadge status={suite.status} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-[11px] text-slate-500">Tests</div>
          <div className="mt-1 text-sm font-semibold">
            {suite.tests}
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-[11px] text-emerald-700">Passed</div>
          <div className="mt-1 text-sm font-semibold text-emerald-800">
            {suite.passed}
          </div>
        </div>

        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-[11px] text-red-700">Failed</div>
          <div className="mt-1 text-sm font-semibold text-red-800">
            {suite.failed}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">Pass rate</span>
          <span className="font-semibold text-slate-700">
            {passRate}%
          </span>
        </div>

        <ProgressBar value={passRate} />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
        <span>Last run {suite.lastRun}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen(suite)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onRun(suite)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Play size={13} />
            Run
          </button>
        </div>
      </div>
    </div>
  );
}

function RunStatusIcon({ status }) {
  if (status === "Failed") {
    return <XCircle size={16} className="text-red-600" />;
  }

  if (status === "Running") {
    return <RefreshCw size={16} className="animate-spin text-blue-600" />;
  }

  return <CheckCircle2 size={16} className="text-emerald-600" />;
}

export default function AgentTesting() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [suiteFilter, setSuiteFilter] = useState("All");
  const [suites, setSuites] = useState(initialSuites);
  const [runs, setRuns] = useState(initialRuns);
  const [runningSuite, setRunningSuite] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [newSuiteDescription, setNewSuiteDescription] =
    useState("");

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return runs.filter((run) => {
      const matchesSearch =
        query === "" ||
        run.id.toLowerCase().includes(query) ||
        run.suite.toLowerCase().includes(query) ||
        run.agent.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        run.status === statusFilter;

      const matchesSuite =
        suiteFilter === "All" ||
        run.suite === suiteFilter;

      return matchesSearch && matchesStatus && matchesSuite;
    });
  }, [runs, search, statusFilter, suiteFilter]);

  const overallPassRate = useMemo(() => {
    const totalTests = runs.reduce((sum, run) => sum + run.tests, 0);
    const totalPassed = runs.reduce(
      (sum, run) => sum + run.passed,
      0,
    );

    if (!totalTests) return 0;

    return Math.round((totalPassed / totalTests) * 100);
  }, [runs]);

  const runSuite = (suite) => {
    setRunningSuite(suite.id);

    const nextRun = {
      id: `RUN-${2049 + runs.length}`,
      suite: suite.name,
      agent: suite.name.replace(/\s+Regression$|Benchmark$|Safety$/, ""),
      tests: suite.tests,
      passed: suite.passed,
      failed: suite.failed,
      duration: "Running",
      status: "Running",
      time: "Just now",
    };

    setRuns((current) => [nextRun, ...current]);

    window.setTimeout(() => {
      setRuns((current) =>
        current.map((run) =>
          run.id === nextRun.id
            ? {
                ...run,
                status: "Completed",
                duration: "2m 31s",
                time: "Just now",
              }
            : run,
        ),
      );

      setRunningSuite(null);
    }, 1800);
  };

  const createSuite = () => {
    if (!newSuiteName.trim()) return;

    const newSuite = {
      id: `TS-${String(suites.length + 5).padStart(3, "0")}`,
      name: newSuiteName.trim(),
      description:
        newSuiteDescription.trim() ||
        "New evaluation suite for agent testing.",
      tests: 0,
      passed: 0,
      failed: 0,
      status: "Healthy",
      lastRun: "Never",
    };

    setSuites((current) => [newSuite, ...current]);
    setNewSuiteName("");
    setNewSuiteDescription("");
    setShowCreateModal(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <TestTube2
                  size={19}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Agent Testing
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Test, evaluate, benchmark, and validate agent behavior.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/agent-builder/testing/playground"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Playground
              </a>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={15} />
                New Test Suite
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Pass Rate"
            value={`${overallPassRate}%`}
            detail="Across recent test runs"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Test Suites"
            value={suites.length}
            detail="Configured suites"
            icon={TestTube2}
          />

          <MetricCard
            label="Tests Executed"
            value="2,846"
            detail="Last 7 days"
            icon={Activity}
          />

          <MetricCard
            label="Avg Latency"
            value="1.84s"
            detail="-12.4% vs baseline"
            icon={Clock3}
          />

          <MetricCard
            label="Quality Score"
            value="92.6"
            detail="+4.8% this month"
            icon={BarChart3}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "test-suites", "test-runs", "evaluation"].map(
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
                {tab.replace("-", " ")}
              </button>
            ),
          )}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Testing Capabilities"
                description="Core testing layers available in the Agent Builder."
              />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {testCategories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <div
                      key={category.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Icon size={17} />
                        </div>

                        <StatusBadge status={category.status} />
                      </div>

                      <div className="mt-4 text-sm font-semibold">
                        {category.name}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {category.description}
                      </p>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Coverage
                          </span>

                          <span className="font-semibold">
                            {category.coverage}%
                          </span>
                        </div>

                        <ProgressBar value={category.coverage} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Recent Test Runs"
                  description="Latest agent validation activity."
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveTab("test-runs")}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      View all
                      <ArrowRight
                        size={13}
                        className="ml-1 inline"
                      />
                    </button>
                  }
                />

                <div className="mt-5 space-y-3">
                  {runs.slice(0, 4).map((run) => (
                    <div
                      key={run.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <RunStatusIcon status={run.status} />

                        <div>
                          <div className="text-sm font-medium">
                            {run.suite}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {run.id} · {run.agent} · {run.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-emerald-600">
                          {run.passed} passed
                        </span>

                        <span className="text-red-600">
                          {run.failed} failed
                        </span>

                        <StatusBadge status={run.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Testing Pipeline"
                  description="Recommended agent validation flow."
                />

                <div className="mt-5 space-y-3">
                  {[
                    [
                      "01",
                      "Create Test Cases",
                      "Define expected inputs and outputs.",
                    ],
                    [
                      "02",
                      "Run Playground",
                      "Manually validate agent behavior.",
                    ],
                    [
                      "03",
                      "Evaluate Quality",
                      "Measure correctness and relevance.",
                    ],
                    [
                      "04",
                      "Run Regression",
                      "Compare behavior across versions.",
                    ],
                    [
                      "05",
                      "Review Traces",
                      "Inspect failed and slow executions.",
                    ],
                  ].map(([number, title, description]) => (
                    <div
                      key={number}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                        {number}
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {title}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "test-suites" && (
          <section className="mt-6">
            <SectionTitle
              title="Test Suites"
              description="Reusable collections of test cases for your agents."
              action={
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  Create Suite
                </button>
              }
            />

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {suites.map((suite) => (
                <SuiteCard
                  key={suite.id}
                  suite={suite}
                  onRun={runSuite}
                  onOpen={setSelectedSuite}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "test-runs" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Test Runs"
              description="Execution history across your testing suites."
            />

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_230px]">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search test runs..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <SelectField
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All statuses</option>
                <option value="Completed">Completed</option>
                <option value="Running">Running</option>
                <option value="Failed">Failed</option>
              </SelectField>

              <SelectField
                value={suiteFilter}
                onChange={(event) =>
                  setSuiteFilter(event.target.value)
                }
              >
                <option value="All">All suites</option>

                {suites.map((suite) => (
                  <option key={suite.id} value={suite.name}>
                    {suite.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-3 py-3 font-medium">Run</th>
                    <th className="px-3 py-3 font-medium">Suite</th>
                    <th className="px-3 py-3 font-medium">Agent</th>
                    <th className="px-3 py-3 font-medium">Tests</th>
                    <th className="px-3 py-3 font-medium">Result</th>
                    <th className="px-3 py-3 font-medium">Duration</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRuns.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <RunStatusIcon
                            status={run.status}
                          />
                          <span className="text-sm font-medium">
                            {run.id}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-700">
                        {run.suite}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {run.agent}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {run.tests}
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex gap-3 text-xs">
                          <span className="text-emerald-600">
                            {run.passed} passed
                          </span>
                          <span className="text-red-600">
                            {run.failed} failed
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {run.duration}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge status={run.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRuns.length === 0 && (
                <div className="p-10 text-center">
                  <Search
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <div className="mt-3 text-sm font-semibold">
                    No test runs found
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Change the filters and try again.
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "evaluation" && (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Evaluation Metrics"
                description="Monitor the quality of your agent outputs."
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Correctness", "94%"],
                  ["Relevance", "92%"],
                  ["Groundedness", "91%"],
                  ["Safety", "98%"],
                  ["Consistency", "89%"],
                  ["Instruction Following", "95%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="text-xs text-slate-500">
                      {label}
                    </div>

                    <div className="mt-1 text-xl font-semibold">
                      {value}
                    </div>

                    <div className="mt-3">
                      <ProgressBar
                        value={Number(value.replace("%", ""))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Evaluation Resources"
                description="Open specialized testing tools."
              />

              <div className="mt-5 space-y-3">
                {[
                  {
                    href: "/agent-builder/testing/playground",
                    title: "Playground",
                    description:
                      "Interactively test prompts and agent behavior.",
                    icon: Play,
                  },
                  {
                    href: "/agent-builder/testing/evaluation-datasets",
                    title: "Evaluation Datasets",
                    description:
                      "Create reusable benchmark datasets.",
                    icon: Database,
                  },
                  {
                    href: "/agent-builder/testing/quality-evaluation",
                    title: "Quality Evaluation",
                    description:
                      "Measure quality dimensions across runs.",
                    icon: BarChart3,
                  },
                  {
                    href: "/agent-builder/testing/regression-testing",
                    title: "Regression Testing",
                    description:
                      "Compare results across versions.",
                    icon: GitBranch,
                  },
                  {
                    href: "/agent-builder/testing/trace-viewer",
                    title: "Trace Viewer",
                    description:
                      "Inspect detailed agent execution traces.",
                    icon: Activity,
                  },
                ].map((resource) => {
                  const Icon = resource.icon;

                  return (
                    <a
                      key={resource.title}
                      href={resource.href}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Icon size={17} />
                        </div>

                        <div>
                          <div className="text-sm font-semibold">
                            {resource.title}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {resource.description}
                          </div>
                        </div>
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-slate-400"
                      />
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>

      {selectedSuite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    {selectedSuite.name}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {selectedSuite.description}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSuite(null)}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
              <MetricCard
                label="Tests"
                value={selectedSuite.tests}
                detail="Configured"
                icon={TestTube2}
              />

              <MetricCard
                label="Passed"
                value={selectedSuite.passed}
                detail="Successful"
                icon={CheckCircle2}
              />

              <MetricCard
                label="Failed"
                value={selectedSuite.failed}
                detail="Need review"
                icon={XCircle}
              />

              <MetricCard
                label="Status"
                value={selectedSuite.status}
                detail={selectedSuite.lastRun}
                icon={Activity}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setSelectedSuite(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  runSuite(selectedSuite);
                  setSelectedSuite(null);
                }}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                <Play size={14} />
                Run Suite
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    Create Test Suite
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Create a reusable suite for your agent evaluations.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Suite Name
                </label>

                <input
                  value={newSuiteName}
                  onChange={(event) =>
                    setNewSuiteName(event.target.value)
                  }
                  placeholder="Example: Production Regression"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  value={newSuiteDescription}
                  onChange={(event) =>
                    setNewSuiteDescription(event.target.value)
                  }
                  rows={4}
                  placeholder="Describe what this suite validates..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createSuite}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}