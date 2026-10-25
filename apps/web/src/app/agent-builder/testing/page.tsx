"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  ShieldCheck,
  Target,
  TestTube2,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

type EvaluationItem = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const evaluationItems: EvaluationItem[] = [
  {
    title: "Playground",
    description:
      "Test prompts, models, agents, tools, and responses interactively.",
    href: "/agent-builder/testing/playground",
    icon: <TestTube2 size={20} />,
  },
  {
    title: "Test Cases",
    description:
      "Create reusable test cases for functional and regression testing.",
    href: "/agent-builder/testing/test-cases",
    icon: <Target size={20} />,
  },
  {
    title: "Evaluation Datasets",
    description:
      "Build benchmark datasets for quality, safety, RAG, agents, and performance.",
    href: "/agent-builder/testing/evaluation-datasets",
    icon: <Database size={20} />,
  },
  {
    title: "Trace Viewer",
    description:
      "Inspect execution traces, model calls, tools, latency, and failures.",
    href: "/agent-builder/testing/trace-viewer",
    icon: <Activity size={20} />,
  },
  {
    title: "Quality Evaluation",
    description:
      "Measure correctness, relevance, instruction following, and response quality.",
    href: "/agent-builder/testing/quality-evaluation",
    icon: <BarChart3 size={20} />,
  },
  {
    title: "Regression Testing",
    description:
      "Compare releases and detect quality regressions before production.",
    href: "/agent-builder/testing/regression-testing",
    icon: <GitBranch size={20} />,
  },
];

const recentRuns = [
  {
    name: "General Assistant Quality",
    model: "GPT-5",
    cases: 1250,
    passRate: 94.8,
    latency: "1.42s",
    status: "Passed",
    time: "12 min ago",
  },
  {
    name: "RAG Grounding Benchmark",
    model: "Claude Sonnet",
    cases: 840,
    passRate: 91.6,
    latency: "1.86s",
    status: "Running",
    time: "24 min ago",
  },
  {
    name: "Agent Tool Use",
    model: "Gemini",
    cases: 620,
    passRate: 89.4,
    latency: "2.14s",
    status: "Passed",
    time: "1 hr ago",
  },
  {
    name: "Prompt Injection Safety",
    model: "GPT-5",
    cases: 980,
    passRate: 97.2,
    latency: "1.18s",
    status: "Passed",
    time: "3 hrs ago",
  },
  {
    name: "Production Failure Cases",
    model: "Claude Sonnet",
    cases: 315,
    passRate: 78.6,
    latency: "2.43s",
    status: "Failed",
    time: "2 days ago",
  },
];

export default function TestingEvaluationPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "runs" | "metrics"
  >("overview");

  const [selectedRange, setSelectedRange] = useState("Last 7 days");

  const metrics = useMemo(
    () => ({
      totalRuns: 1842,
      testCases: 12480,
      averagePassRate: 93.4,
      averageLatency: 1.72,
      regressions: 7,
      successfulRuns: 1715,
    }),
    []
  );

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

              <span className="text-[#172033]">
                Testing & Evaluation
              </span>
            </div>

            <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.6px]">
              Testing & Evaluation
            </h1>

            <p className="mt-1.5 max-w-[720px] text-sm leading-6 text-[#667085]">
              Validate models, agents, workflows, RAG systems, and
              production changes before they reach users.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRange}
              onChange={(event) =>
                setSelectedRange(event.target.value)
              }
              className="h-9 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467] outline-none"
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>

            <Link
              href="/agent-builder/testing/playground"
              className="flex items-center gap-2 rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
            >
              <TestTube2 size={16} />
              Open Playground
            </Link>
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
            Evaluation Runs
          </TabButton>

          <TabButton
            active={activeTab === "metrics"}
            onClick={() => setActiveTab("metrics")}
          >
            Metrics
          </TabButton>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="mb-5 grid grid-cols-6 gap-3">
              <MetricCard
                label="Evaluation runs"
                value={metrics.totalRuns.toLocaleString()}
                helper={selectedRange}
                icon={<Activity size={17} />}
              />

              <MetricCard
                label="Test cases"
                value={metrics.testCases.toLocaleString()}
                helper="Executed"
                icon={<Database size={17} />}
              />

              <MetricCard
                label="Average pass rate"
                value={`${metrics.averagePassRate}%`}
                helper="Across evaluations"
                icon={<CheckCircle2 size={17} />}
              />

              <MetricCard
                label="Average latency"
                value={`${metrics.averageLatency}s`}
                helper="Per evaluation"
                icon={<Clock3 size={17} />}
              />

              <MetricCard
                label="Regressions"
                value={metrics.regressions.toString()}
                helper="Detected"
                icon={<TrendingUp size={17} />}
              />

              <MetricCard
                label="Successful runs"
                value={metrics.successfulRuns.toLocaleString()}
                helper="Completed successfully"
                icon={<ShieldCheck size={17} />}
              />
            </section>

            <section className="mb-5 grid grid-cols-3 gap-4">
              {evaluationItems.map((item) => (
                <EvaluationCard
                  key={item.title}
                  item={item}
                />
              ))}
            </section>

            <section className="mb-5 grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-xl border border-[#e1e5eb] bg-white">
                <div className="flex items-center justify-between border-b border-[#edf0f3] px-5 py-4">
                  <div>
                    <h2 className="text-[16px] font-semibold">
                      Evaluation Performance
                    </h2>

                    <p className="mt-1 text-xs text-[#667085]">
                      Quality and execution trend for {selectedRange.toLowerCase()}.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#667085]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#12b76a]" />
                      Pass rate
                    </span>

                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#98a2b3]" />
                      Latency
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex h-[270px] items-end gap-5 border-b border-l border-[#eaecf0] px-5 pb-5">
                    {[72, 78, 74, 86, 82, 91, 88, 94, 90, 96, 93, 97].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex h-full flex-1 items-end justify-center"
                        >
                          <div
                            className="w-full max-w-[34px] rounded-t-md bg-[#d0d5dd]"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-12 text-center text-[10px] text-[#98a2b3]">
                    {[
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                    ].map((day, index) => (
                      <span key={`${day}-${index}`}>{day}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e1e5eb] bg-white">
                <div className="border-b border-[#edf0f3] px-5 py-4">
                  <h2 className="text-[16px] font-semibold">
                    Evaluation Health
                  </h2>

                  <p className="mt-1 text-xs text-[#667085]">
                    Current testing system status.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <HealthRow
                    label="Evaluation Engine"
                    status="Operational"
                    value="99.98%"
                  />

                  <HealthRow
                    label="Dataset Service"
                    status="Operational"
                    value="99.99%"
                  />

                  <HealthRow
                    label="Trace Collection"
                    status="Operational"
                    value="99.97%"
                  />

                  <HealthRow
                    label="Scoring Engine"
                    status="Operational"
                    value="99.99%"
                  />

                  <HealthRow
                    label="Regression Service"
                    status="Warning"
                    value="98.72%"
                  />

                  <div className="rounded-lg bg-[#f8f9fb] p-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Zap size={14} />
                      Automated evaluation
                    </div>

                    <p className="mt-1.5 text-[11px] leading-5 text-[#667085]">
                      Production changes can automatically trigger
                      benchmark and regression datasets before release.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "runs" && (
          <section className="rounded-xl border border-[#e1e5eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#edf0f3] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Recent Evaluation Runs
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  Latest model and agent evaluation activity.
                </p>
              </div>

              <Link
                href="/agent-builder/testing/evaluation-datasets"
                className="flex items-center gap-1.5 text-xs font-medium text-[#344054]"
              >
                Manage datasets
                <ArrowRight size={14} />
              </Link>
            </div>

            <RunTable />
          </section>
        )}

        {activeTab === "metrics" && (
          <section className="grid grid-cols-3 gap-4">
            <MetricPanel
              title="Quality"
              value="93.4%"
              description="Average evaluation pass rate across active datasets."
              icon={<Target size={19} />}
            />

            <MetricPanel
              title="Latency"
              value="1.72s"
              description="Average evaluation response latency."
              icon={<Clock3 size={19} />}
            />

            <MetricPanel
              title="Regression"
              value="7"
              description="Regression issues detected in recent evaluation runs."
              icon={<XCircle size={19} />}
            />

            <MetricPanel
              title="Test Coverage"
              value="86.2%"
              description="Coverage across configured evaluation scenarios."
              icon={<BarChart3 size={19} />}
            />

            <MetricPanel
              title="Safety"
              value="97.2%"
              description="Average safety benchmark score."
              icon={<ShieldCheck size={19} />}
            />

            <MetricPanel
              title="Execution"
              value="99.1%"
              description="Successful completion rate for evaluation jobs."
              icon={<Activity size={19} />}
            />
          </section>
        )}

        <section className="mt-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <h2 className="text-[16px] font-semibold">
              Recent Evaluation Activity
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              Recent benchmark executions and their results.
            </p>
          </div>

          <RunTable />
        </section>
      </div>
    </main>
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

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#667085]">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-[23px] font-semibold">
        {value}
      </div>

      <div className="mt-1 text-[10px] text-[#98a2b3]">
        {helper}
      </div>
    </div>
  );
}

function EvaluationCard({
  item,
}: {
  item: EvaluationItem;
}) {
  return (
    <Link
      href={item.href}
      className="group rounded-xl border border-[#e1e5eb] bg-white p-5 transition hover:border-[#c8cdd4] hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {item.icon}
        </div>

        <ArrowRight
          size={17}
          className="text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:text-[#344054]"
        />
      </div>

      <h3 className="mt-4 text-[15px] font-semibold">
        {item.title}
      </h3>

      <p className="mt-1.5 min-h-[42px] text-xs leading-5 text-[#667085]">
        {item.description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-[#475467]">
        Open
        <ArrowRight size={13} />
      </div>
    </Link>
  );
}

function HealthRow({
  label,
  status,
  value,
}: {
  label: string;
  status: "Operational" | "Warning";
  value: string;
}) {
  const operational = status === "Operational";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {operational ? (
          <CheckCircle2
            size={15}
            className="text-[#12b76a]"
          />
        ) : (
          <Clock3
            size={15}
            className="text-[#f79009]"
          />
        )}

        <div>
          <div className="text-xs font-medium">
            {label}
          </div>

          <div
            className={`text-[10px] ${
              operational
                ? "text-[#027a48]"
                : "text-[#b54708]"
            }`}
          >
            {status}
          </div>
        </div>
      </div>

      <span className="text-xs font-semibold text-[#475467]">
        {value}
      </span>
    </div>
  );
}

function RunTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="bg-[#fafbfc] text-left text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
            <th className="px-5 py-3">Dataset</th>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3">Cases</th>
            <th className="px-4 py-3">Pass Rate</th>
            <th className="px-4 py-3">Latency</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-5 py-3">Time</th>
          </tr>
        </thead>

        <tbody>
          {recentRuns.map((run) => (
            <tr
              key={`${run.name}-${run.model}`}
              className="border-t border-[#edf0f3]"
            >
              <td className="px-5 py-4">
                <div className="text-sm font-medium">
                  {run.name}
                </div>
              </td>

              <td className="px-4 py-4 text-xs text-[#475467]">
                {run.model}
              </td>

              <td className="px-4 py-4 text-xs text-[#475467]">
                {run.cases.toLocaleString()}
              </td>

              <td className="px-4 py-4">
                <span
                  className={`text-xs font-semibold ${
                    run.passRate >= 95
                      ? "text-[#027a48]"
                      : run.passRate >= 85
                        ? "text-[#b54708]"
                        : "text-[#d92d20]"
                  }`}
                >
                  {run.passRate}%
                </span>
              </td>

              <td className="px-4 py-4 text-xs text-[#475467]">
                {run.latency}
              </td>

              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    run.status === "Passed"
                      ? "bg-[#ecfdf3] text-[#027a48]"
                      : run.status === "Running"
                        ? "bg-[#eff8ff] text-[#175cd3]"
                        : "bg-[#fef3f2] text-[#b42318]"
                  }`}
                >
                  {run.status}
                </span>
              </td>

              <td className="px-5 py-4 text-xs text-[#98a2b3]">
                {run.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricPanel({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>

        <span className="text-[10px] font-medium text-[#98a2b3]">
          Evaluation
        </span>
      </div>

      <div className="mt-5 text-[26px] font-semibold">
        {value}
      </div>

      <h3 className="mt-1 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  );
}