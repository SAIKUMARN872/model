"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
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
  GitBranch,
  History,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

type RegressionStatus =
  | "Passed"
  | "Regression Detected"
  | "Improved"
  | "Needs Review";

type RegressionRun = {
  id: number;
  testSuite: string;
  model: string;
  previousScore: number;
  currentScore: number;
  change: number;
  previousLatency: number;
  currentLatency: number;
  failedTests: number;
  totalTests: number;
  status: RegressionStatus;
  executedAt: string;
};

type TestCase = {
  id: number;
  name: string;
  category: string;
  baseline: number;
  current: number;
  change: number;
  status: "Passed" | "Failed" | "Improved";
};

const initialRuns: RegressionRun[] = [
  {
    id: 1,
    testSuite: "Production Quality Suite",
    model: "GPT-5",
    previousScore: 94.8,
    currentScore: 94.8,
    change: 0,
    previousLatency: 1.42,
    currentLatency: 1.41,
    failedTests: 2,
    totalTests: 250,
    status: "Passed",
    executedAt: "12 min ago",
  },
  {
    id: 2,
    testSuite: "RAG Grounding Regression",
    model: "Claude Sonnet",
    previousScore: 93.4,
    currentScore: 89.7,
    change: -3.7,
    previousLatency: 1.76,
    currentLatency: 1.94,
    failedTests: 18,
    totalTests: 180,
    status: "Regression Detected",
    executedAt: "42 min ago",
  },
  {
    id: 3,
    testSuite: "Agent Tool Calling",
    model: "Gemini",
    previousScore: 86.2,
    currentScore: 89.4,
    change: 3.2,
    previousLatency: 2.28,
    currentLatency: 2.14,
    failedTests: 7,
    totalTests: 150,
    status: "Improved",
    executedAt: "1 hr ago",
  },
  {
    id: 4,
    testSuite: "Safety Benchmark",
    model: "GPT-5",
    previousScore: 96.4,
    currentScore: 97.2,
    change: 0.8,
    previousLatency: 1.25,
    currentLatency: 1.18,
    failedTests: 1,
    totalTests: 300,
    status: "Improved",
    executedAt: "3 hrs ago",
  },
  {
    id: 5,
    testSuite: "Failure Recovery Suite",
    model: "Claude Sonnet",
    previousScore: 91.2,
    currentScore: 82.6,
    change: -8.6,
    previousLatency: 2.11,
    currentLatency: 2.43,
    failedTests: 31,
    totalTests: 120,
    status: "Regression Detected",
    executedAt: "Yesterday",
  },
];

const initialTestCases: TestCase[] = [
  {
    id: 1,
    name: "Correct answer from knowledge base",
    category: "RAG",
    baseline: 98,
    current: 97,
    change: -1,
    status: "Passed",
  },
  {
    id: 2,
    name: "Citation grounding",
    category: "RAG",
    baseline: 96,
    current: 88,
    change: -8,
    status: "Failed",
  },
  {
    id: 3,
    name: "Tool selection",
    category: "Agents",
    baseline: 89,
    current: 93,
    change: 4,
    status: "Improved",
  },
  {
    id: 4,
    name: "Prompt injection defense",
    category: "Security",
    baseline: 97,
    current: 98,
    change: 1,
    status: "Improved",
  },
  {
    id: 5,
    name: "Structured JSON response",
    category: "Output",
    baseline: 99,
    current: 99,
    change: 0,
    status: "Passed",
  },
  {
    id: 6,
    name: "Long context reasoning",
    category: "Reasoning",
    baseline: 92,
    current: 86,
    change: -6,
    status: "Failed",
  },
];

export default function RegressionTestingPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "runs" | "tests"
  >("overview");

  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("All Models");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [isRunning, setIsRunning] = useState(false);
  const [selectedRun, setSelectedRun] =
    useState<RegressionRun | null>(null);

  const [runs, setRuns] =
    useState<RegressionRun[]>(initialRuns);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const searchMatch =
        run.testSuite
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        run.model
          .toLowerCase()
          .includes(search.toLowerCase());

      const modelMatch =
        modelFilter === "All Models" ||
        run.model === modelFilter;

      const statusMatch =
        statusFilter === "All Status" ||
        run.status === statusFilter;

      return searchMatch && modelMatch && statusMatch;
    });
  }, [runs, search, modelFilter, statusFilter]);

  const regressionCount = runs.filter(
    (run) => run.status === "Regression Detected"
  ).length;

  const improvedCount = runs.filter(
    (run) => run.status === "Improved"
  ).length;

  const averageCurrentScore = useMemo(() => {
    const total = runs.reduce(
      (sum, run) => sum + run.currentScore,
      0
    );

    return (total / runs.length).toFixed(1);
  }, [runs]);

  const totalFailedTests = runs.reduce(
    (sum, run) => sum + run.failedTests,
    0
  );

  const runRegressionSuite = () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);

    window.setTimeout(() => {
      const newRun: RegressionRun = {
        id: Date.now(),
        testSuite: "Full Regression Suite",
        model: "GPT-5",
        previousScore: 94.8,
        currentScore: 95.1,
        change: 0.3,
        previousLatency: 1.42,
        currentLatency: 1.39,
        failedTests: 2,
        totalTests: 320,
        status: "Improved",
        executedAt: "Just now",
      };

      setRuns((current) => [newRun, ...current]);
      setIsRunning(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1550px] px-6 py-6">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <Link
                href="/agent-builder"
                className="hover:text-[#172033]"
              >
                Agent Builder
              </Link>

              <span>/</span>

              <Link
                href="/agent-builder/testing"
                className="hover:text-[#172033]"
              >
                Testing & Evaluation
              </Link>

              <span>/</span>

              <span className="text-[#172033]">
                Regression Testing
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-[27px] font-semibold tracking-[-0.6px]">
                Regression Testing
              </h1>

              <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[10px] font-medium text-[#027a48]">
                Continuous Testing
              </span>
            </div>

            <p className="mt-1.5 max-w-[800px] text-sm leading-6 text-[#667085]">
              Detect quality, safety, latency, and behavior regressions
              before model or agent changes reach production.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/testing"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467]"
            >
              <ArrowLeft size={15} />
              Back
            </Link>

            <button
              type="button"
              onClick={runRegressionSuite}
              disabled={isRunning}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#171a21] px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Play size={15} />
              )}

              {isRunning ? "Running..." : "Run Regression"}
            </button>
          </div>
        </header>

        <div className="mb-5 flex items-center gap-1 rounded-xl border border-[#e1e5eb] bg-white p-1">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </TabButton>

          <TabButton
            active={activeTab === "runs"}
            onClick={() => setActiveTab("runs")}
          >
            Regression Runs
          </TabButton>

          <TabButton
            active={activeTab === "tests"}
            onClick={() => setActiveTab("tests")}
          >
            Test Cases
          </TabButton>
        </div>

        {activeTab === "overview" && (
          <Overview
            regressionCount={regressionCount}
            improvedCount={improvedCount}
            averageCurrentScore={averageCurrentScore}
            totalFailedTests={totalFailedTests}
            onRun={runRegressionSuite}
            isRunning={isRunning}
          />
        )}

        {activeTab === "runs" && (
          <RunsPanel
            search={search}
            setSearch={setSearch}
            modelFilter={modelFilter}
            setModelFilter={setModelFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            runs={filteredRuns}
            onSelect={setSelectedRun}
          />
        )}

        {activeTab === "tests" && (
          <TestsPanel />
        )}

        {selectedRun && (
          <RunModal
            run={selectedRun}
            onClose={() => setSelectedRun(null)}
          />
        )}
      </div>
    </main>
  );
}

function Overview({
  regressionCount,
  improvedCount,
  averageCurrentScore,
  totalFailedTests,
  onRun,
  isRunning,
}: {
  regressionCount: number;
  improvedCount: number;
  averageCurrentScore: string;
  totalFailedTests: number;
  onRun: () => void;
  isRunning: boolean;
}) {
  return (
    <>
      <section className="mb-5 grid grid-cols-5 gap-3">
        <MetricCard
          label="Regression alerts"
          value={String(regressionCount)}
          helper="Requires review"
          icon={<AlertTriangle size={17} />}
          danger
        />

        <MetricCard
          label="Improved suites"
          value={String(improvedCount)}
          helper="Positive changes"
          icon={<TrendingUp size={17} />}
        />

        <MetricCard
          label="Avg quality"
          value={`${averageCurrentScore}%`}
          helper="Current baseline"
          icon={<BarChart3 size={17} />}
        />

        <MetricCard
          label="Failed tests"
          value={String(totalFailedTests)}
          helper="Across recent runs"
          icon={<XCircle size={17} />}
          danger
        />

        <MetricCard
          label="Test coverage"
          value="94.2%"
          helper="Production scenarios"
          icon={<Target size={17} />}
        />
      </section>

      <section className="mb-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Regression Health
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  Current quality compared with established baselines.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7]">
                <Activity size={17} />
              </div>
            </div>
          </div>

          <div className="p-5">
            <HealthRow
              label="Quality score"
              value="93.8%"
              change="+0.6%"
              positive
            />

            <HealthRow
              label="Groundedness"
              value="91.4%"
              change="-1.8%"
              positive={false}
            />

            <HealthRow
              label="Safety"
              value="98.2%"
              change="+0.4%"
              positive
            />

            <HealthRow
              label="Instruction following"
              value="94.7%"
              change="+1.2%"
              positive
            />

            <HealthRow
              label="Average latency"
              value="1.61s"
              change="-0.12s"
              positive
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <h2 className="text-[16px] font-semibold">
              Regression Workflow
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              Automated checks performed on every important model change.
            </p>
          </div>

          <div className="space-y-3 p-5">
            <WorkflowStep
              number="01"
              title="Capture baseline"
              description="Store the approved quality and performance baseline."
              status="Complete"
            />

            <WorkflowStep
              number="02"
              title="Execute test suite"
              description="Run the same evaluation cases against the new version."
              status="Complete"
            />

            <WorkflowStep
              number="03"
              title="Compare results"
              description="Compare quality, latency, safety, tokens, and behavior."
              status="Complete"
            />

            <WorkflowStep
              number="04"
              title="Detect regressions"
              description="Identify changes beyond configured thresholds."
              status="Active"
            />

            <WorkflowStep
              number="05"
              title="Review and approve"
              description="Send important regressions to human review before deployment."
              status="Pending"
            />
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-xl border border-[#e1e5eb] bg-white">
        <div className="border-b border-[#edf0f3] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold">
                Latest Regression Runs
              </h2>

              <p className="mt-1 text-xs text-[#667085]">
                Recent automated regression activity.
              </p>
            </div>

            <button
              type="button"
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#475467]"
            >
              <RefreshCw
                size={13}
                className={isRunning ? "animate-spin" : ""}
              />
              Run again
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#edf0f3]">
          {initialRuns.slice(0, 4).map((run) => (
            <div
              key={run.id}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7]">
                {run.status === "Regression Detected" ? (
                  <AlertTriangle
                    size={16}
                    className="text-[#b54708]"
                  />
                ) : (
                  <CheckCircle2
                    size={16}
                    className="text-[#027a48]"
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="text-xs font-semibold">
                  {run.testSuite}
                </div>

                <div className="mt-1 text-[10px] text-[#98a2b3]">
                  {run.model} · {run.executedAt}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold">
                  {run.currentScore}%
                </div>

                <div
                  className={`mt-1 text-[10px] font-medium ${
                    run.change < 0
                      ? "text-[#d92d20]"
                      : "text-[#027a48]"
                  }`}
                >
                  {run.change > 0 ? "+" : ""}
                  {run.change}%
                </div>
              </div>

              <StatusBadge status={run.status} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function RunsPanel({
  search,
  setSearch,
  modelFilter,
  setModelFilter,
  statusFilter,
  setStatusFilter,
  runs,
  onSelect,
}: {
  search: string;
  setSearch: (value: string) => void;
  modelFilter: string;
  setModelFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  runs: RegressionRun[];
  onSelect: (run: RegressionRun) => void;
}) {
  return (
    <section className="rounded-xl border border-[#e1e5eb] bg-white">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold">
              Regression Runs
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              Compare current model behavior against approved baselines.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#98a2b3]">
            <History size={13} />
            Historical comparisons enabled
          </div>
        </div>
      </div>

      <FilterBar
        search={search}
        setSearch={setSearch}
        modelFilter={modelFilter}
        setModelFilter={setModelFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="bg-[#fafbfc] text-left text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
              <th className="px-5 py-3">Test suite</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Baseline</th>
              <th className="px-4 py-3">Current</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">Failures</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3">Executed</th>
            </tr>
          </thead>

          <tbody>
            {runs.map((run) => (
              <tr
                key={run.id}
                className="border-t border-[#edf0f3] hover:bg-[#fafbfc]"
              >
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(run)}
                    className="text-left text-xs font-semibold hover:underline"
                  >
                    {run.testSuite}
                  </button>
                </td>

                <td className="px-4 py-4 text-xs text-[#475467]">
                  {run.model}
                </td>

                <td className="px-4 py-4 text-xs">
                  {run.previousScore}%
                </td>

                <td className="px-4 py-4 text-xs font-semibold">
                  {run.currentScore}%
                </td>

                <td className="px-4 py-4">
                  <ChangeValue value={run.change} />
                </td>

                <td className="px-4 py-4 text-xs text-[#475467]">
                  {run.currentLatency.toFixed(2)}s
                </td>

                <td className="px-4 py-4 text-xs">
                  {run.failedTests} / {run.totalTests}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={run.status} />
                </td>

                <td className="px-5 py-4 text-[10px] text-[#98a2b3]">
                  {run.executedAt}
                </td>
              </tr>
            ))}

            {runs.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-12 text-center text-xs text-[#98a2b3]"
                >
                  No regression runs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TestsPanel() {
  const [search, setSearch] = useState("");

  const filtered = initialTestCases.filter((test) =>
    `${test.name} ${test.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="rounded-xl border border-[#e1e5eb] bg-white">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold">
              Regression Test Cases
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              Test cases used to identify behavioral changes.
            </p>
          </div>

          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-3 text-[#98a2b3]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search tests..."
              className="h-9 w-[230px] rounded-lg border border-[#dfe3e8] pl-8 pr-3 text-xs outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        {filtered.map((test) => (
          <TestCaseCard
            key={test.id}
            test={test}
          />
        ))}
      </div>
    </section>
  );
}

function TestCaseCard({
  test,
}: {
  test: TestCase;
}) {
  const failed = test.status === "Failed";
  const improved = test.status === "Improved";

  return (
    <div className="rounded-xl border border-[#e1e5eb] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold">
            {test.name}
          </div>

          <div className="mt-1 text-[10px] text-[#98a2b3]">
            {test.category}
          </div>
        </div>

        {failed ? (
          <XCircle
            size={17}
            className="text-[#d92d20]"
          />
        ) : improved ? (
          <TrendingUp
            size={17}
            className="text-[#027a48]"
          />
        ) : (
          <CheckCircle2
            size={17}
            className="text-[#027a48]"
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <TestValue
          label="Baseline"
          value={`${test.baseline}%`}
        />

        <TestValue
          label="Current"
          value={`${test.current}%`}
        />

        <TestValue
          label="Change"
          value={`${test.change > 0 ? "+" : ""}${test.change}%`}
          danger={test.change < 0}
          positive={test.change > 0}
        />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className={`h-full rounded-full ${
            failed
              ? "bg-[#f04438]"
              : improved
                ? "bg-[#12b76a]"
                : "bg-[#667085]"
          }`}
          style={{
            width: `${test.current}%`,
          }}
        />
      </div>
    </div>
  );
}

function TestValue({
  label,
  value,
  danger,
  positive,
}: {
  label: string;
  value: string;
  danger?: boolean;
  positive?: boolean;
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-[#98a2b3]">
        {label}
      </div>

      <div
        className={`mt-1 text-sm font-semibold ${
          danger
            ? "text-[#d92d20]"
            : positive
              ? "text-[#027a48]"
              : "text-[#172033]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  danger,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#667085]">
          {label}
        </span>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            danger ? "bg-[#fef3f2]" : "bg-[#f2f4f7]"
          }`}
        >
          {icon}
        </div>
      </div>

      <div
        className={`mt-3 text-[23px] font-semibold ${
          danger ? "text-[#b42318]" : ""
        }`}
      >
        {value}
      </div>

      <div className="mt-1 text-[10px] text-[#98a2b3]">
        {helper}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#edf0f3] py-3 last:border-b-0">
      <div className="flex-1 text-xs font-medium">
        {label}
      </div>

      <div className="text-xs font-semibold">
        {value}
      </div>

      <div
        className={`flex w-[70px] items-center justify-end gap-1 text-[10px] font-medium ${
          positive ? "text-[#027a48]" : "text-[#d92d20]"
        }`}
      >
        {positive ? (
          <TrendingUp size={12} />
        ) : (
          <TrendingDown size={12} />
        )}

        {change}
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  status,
}: {
  number: string;
  title: string;
  description: string;
  status: "Complete" | "Active" | "Pending";
}) {
  const statusStyles =
    status === "Complete"
      ? "bg-[#ecfdf3] text-[#027a48]"
      : status === "Active"
        ? "bg-[#eff8ff] text-[#175cd3]"
        : "bg-[#f2f4f7] text-[#667085]";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#edf0f3] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f4f7] text-[10px] font-semibold">
        {number}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold">
            {title}
          </h3>

          <span
            className={`rounded-full px-2 py-1 text-[9px] font-medium ${statusStyles}`}
          >
            {status}
          </span>
        </div>

        <p className="mt-1 text-[10px] leading-4 text-[#667085]">
          {description}
        </p>
      </div>
    </div>
  );
}

function ChangeValue({
  value,
}: {
  value: number;
}) {
  if (value === 0) {
    return (
      <span className="text-xs font-medium text-[#667085]">
        0%
      </span>
    );
  }

  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold ${
        value < 0
          ? "text-[#d92d20]"
          : "text-[#027a48]"
      }`}
    >
      {value < 0 ? (
        <TrendingDown size={13} />
      ) : (
        <TrendingUp size={13} />
      )}

      {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: RegressionStatus;
}) {
  const styles: Record<RegressionStatus, string> = {
    Passed: "bg-[#ecfdf3] text-[#027a48]",
    "Regression Detected":
      "bg-[#fef3f2] text-[#b42318]",
    Improved: "bg-[#eff8ff] text-[#175cd3]",
    "Needs Review": "bg-[#fffaeb] text-[#b54708]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-xs font-medium ${
        active
          ? "bg-[#171a21] text-white"
          : "text-[#667085] hover:bg-[#f8f9fb]"
      }`}
    >
      {children}
    </button>
  );
}

function FilterBar({
  search,
  setSearch,
  modelFilter,
  setModelFilter,
  statusFilter,
  setStatusFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  modelFilter: string;
  setModelFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#edf0f3] p-4">
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-3 text-[#98a2b3]"
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search test suites or models..."
          className="h-9 w-full rounded-lg border border-[#dfe3e8] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#98a2b3]"
        />
      </div>

      <SelectFilter
        value={modelFilter}
        onChange={setModelFilter}
        options={[
          "All Models",
          "GPT-5",
          "Claude Sonnet",
          "Gemini",
        ]}
      />

      <SelectFilter
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          "All Status",
          "Passed",
          "Regression Detected",
          "Improved",
          "Needs Review",
        ]}
      />

      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467]"
      >
        <Settings2 size={14} />
        Thresholds
      </button>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-9 appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-8 text-xs font-medium text-[#475467] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-3 text-[#98a2b3]"
      />
    </div>
  );
}

function RunModal({
  run,
  onClose,
}: {
  run: RegressionRun;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[720px] rounded-xl border border-[#e1e5eb] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#edf0f3] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold">
                {run.testSuite}
              </h2>

              <StatusBadge status={run.status} />
            </div>

            <p className="mt-1 text-xs text-[#667085]">
              {run.model} · executed {run.executedAt}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#f2f4f7]"
            aria-label="Close"
          >
            <span className="text-[20px] leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5">
          <ComparisonCard
            title="Quality score"
            baseline={run.previousScore}
            current={run.currentScore}
          />

          <ComparisonCard
            title="Latency"
            baseline={run.previousLatency}
            current={run.currentLatency}
            suffix="s"
          />

          <DetailMetric
            label="Failed tests"
            value={`${run.failedTests} / ${run.totalTests}`}
            icon={<XCircle size={16} />}
          />

          <DetailMetric
            label="Regression status"
            value={run.status}
            icon={<ShieldCheck size={16} />}
          />
        </div>

        <div className="border-t border-[#edf0f3] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold">
                Regression actions
              </div>

              <div className="mt-1 text-[10px] text-[#98a2b3]">
                Inspect failed tests or compare this run with its baseline.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/agent-builder/testing/trace-viewer"
                className="flex items-center gap-1.5 rounded-lg border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#475467]"
              >
                <Activity size={13} />
                Trace
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-[#171a21] px-3 py-2 text-xs font-medium text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  baseline,
  current,
  suffix = "%",
}: {
  title: string;
  baseline: number;
  current: number;
  suffix?: string;
}) {
  const change = current - baseline;

  return (
    <div className="rounded-lg border border-[#edf0f3] p-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
        {title}
      </div>

      <div className="mt-3 grid grid-cols-3 items-end gap-3">
        <div>
          <div className="text-[9px] text-[#98a2b3]">
            Baseline
          </div>

          <div className="mt-1 text-lg font-semibold">
            {baseline}
            {suffix}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-[#98a2b3]">
            Current
          </div>

          <div className="mt-1 text-lg font-semibold">
            {current}
            {suffix}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] text-[#98a2b3]">
            Change
          </div>

          <div
            className={`mt-1 text-sm font-semibold ${
              change < 0
                ? "text-[#d92d20]"
                : "text-[#027a48]"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}
            {suffix === "%" ? "%" : "s"}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#edf0f3] p-4">
      <div className="flex items-center gap-2 text-[#667085]">
        {icon}

        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div className="mt-3 text-sm font-semibold">
        {value}
      </div>
    </div>
  );
}