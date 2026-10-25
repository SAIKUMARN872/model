"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Database,
  DollarSign,
  FileText,
  GitBranch,
  Layers,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Terminal,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type TraceStatus =
  | "Success"
  | "Failed"
  | "Running"
  | "Warning";

type TraceType =
  | "Agent"
  | "RAG"
  | "Workflow"
  | "Browser"
  | "Computer Use"
  | "Model";

type TraceStep = {
  id: string;
  name: string;
  type: string;
  status: TraceStatus;
  duration: number;
  tokens: number;
  cost: number;
  timestamp: string;
  detail: string;
};

type Trace = {
  id: string;
  name: string;
  type: TraceType;
  model: string;
  status: TraceStatus;
  duration: number;
  tokens: number;
  cost: number;
  startedAt: string;
  user: string;
  steps: TraceStep[];
};

const initialTraces: Trace[] = [
  {
    id: "tr_982341",
    name: "Customer Support Agent",
    type: "Agent",
    model: "GPT-5",
    status: "Success",
    duration: 2.84,
    tokens: 4280,
    cost: 0.0214,
    startedAt: "2 min ago",
    user: "support@acme.com",
    steps: [
      {
        id: "step_1",
        name: "Request received",
        type: "Input",
        status: "Success",
        duration: 0.03,
        tokens: 120,
        cost: 0.0001,
        timestamp: "14:22:01",
        detail:
          "Customer requested an explanation of an invoice discrepancy.",
      },
      {
        id: "step_2",
        name: "Intent classification",
        type: "Model",
        status: "Success",
        duration: 0.42,
        tokens: 640,
        cost: 0.0032,
        timestamp: "14:22:01",
        detail:
          "Classified request as billing and invoice investigation.",
      },
      {
        id: "step_3",
        name: "Knowledge retrieval",
        type: "RAG",
        status: "Success",
        duration: 0.31,
        tokens: 780,
        cost: 0.0027,
        timestamp: "14:22:02",
        detail:
          "Retrieved 5 relevant documents from the billing knowledge base.",
      },
      {
        id: "step_4",
        name: "Reasoning",
        type: "Agent",
        status: "Success",
        duration: 1.12,
        tokens: 1720,
        cost: 0.0098,
        timestamp: "14:22:02",
        detail:
          "Compared invoice records against the retrieved billing policy.",
      },
      {
        id: "step_5",
        name: "Response generation",
        type: "Model",
        status: "Success",
        duration: 0.72,
        tokens: 1020,
        cost: 0.0056,
        timestamp: "14:22:03",
        detail:
          "Generated a grounded response with supporting evidence.",
      },
      {
        id: "step_6",
        name: "Safety validation",
        type: "Guardrail",
        status: "Success",
        duration: 0.24,
        tokens: 0,
        cost: 0,
        timestamp: "14:22:04",
        detail:
          "PII and policy checks passed successfully.",
      },
    ],
  },
  {
    id: "tr_982340",
    name: "RAG Knowledge Query",
    type: "RAG",
    model: "Claude Sonnet",
    status: "Warning",
    duration: 3.42,
    tokens: 6120,
    cost: 0.0321,
    startedAt: "8 min ago",
    user: "analyst@acme.com",
    steps: [
      {
        id: "step_1",
        name: "Query analysis",
        type: "Model",
        status: "Success",
        duration: 0.51,
        tokens: 720,
        cost: 0.0041,
        timestamp: "14:16:22",
        detail:
          "Expanded the query into searchable concepts.",
      },
      {
        id: "step_2",
        name: "Vector search",
        type: "RAG",
        status: "Success",
        duration: 0.74,
        tokens: 1200,
        cost: 0.0032,
        timestamp: "14:16:23",
        detail:
          "Retrieved 12 documents from the enterprise vector index.",
      },
      {
        id: "step_3",
        name: "Reranking",
        type: "RAG",
        status: "Warning",
        duration: 0.82,
        tokens: 1400,
        cost: 0.0054,
        timestamp: "14:16:24",
        detail:
          "Three retrieved documents had lower-than-normal relevance scores.",
      },
      {
        id: "step_4",
        name: "Answer generation",
        type: "Model",
        status: "Success",
        duration: 1.35,
        tokens: 2800,
        cost: 0.0194,
        timestamp: "14:16:25",
        detail:
          "Generated response using the highest-ranked sources.",
      },
    ],
  },
  {
    id: "tr_982339",
    name: "Browser Research Agent",
    type: "Browser",
    model: "GPT-5",
    status: "Failed",
    duration: 5.82,
    tokens: 7340,
    cost: 0.0418,
    startedAt: "15 min ago",
    user: "research@acme.com",
    steps: [
      {
        id: "step_1",
        name: "Open browser",
        type: "Browser",
        status: "Success",
        duration: 0.81,
        tokens: 340,
        cost: 0.0012,
        timestamp: "14:08:11",
        detail:
          "Browser session created successfully.",
      },
      {
        id: "step_2",
        name: "Navigate to target",
        type: "Browser",
        status: "Success",
        duration: 1.24,
        tokens: 640,
        cost: 0.0027,
        timestamp: "14:08:12",
        detail:
          "Target website loaded successfully.",
      },
      {
        id: "step_3",
        name: "Extract content",
        type: "Browser",
        status: "Warning",
        duration: 1.71,
        tokens: 2200,
        cost: 0.0114,
        timestamp: "14:08:13",
        detail:
          "Some dynamic content was not available in the page snapshot.",
      },
      {
        id: "step_4",
        name: "Reasoning",
        type: "Agent",
        status: "Success",
        duration: 1.14,
        tokens: 3120,
        cost: 0.0198,
        timestamp: "14:08:15",
        detail:
          "Agent attempted to reconstruct missing information.",
      },
      {
        id: "step_5",
        name: "Final validation",
        type: "Guardrail",
        status: "Failed",
        duration: 0.92,
        tokens: 1040,
        cost: 0.0067,
        timestamp: "14:08:16",
        detail:
          "Required source evidence was incomplete. Trace marked as failed.",
      },
    ],
  },
  {
    id: "tr_982338",
    name: "Document Processing Workflow",
    type: "Workflow",
    model: "Gemini",
    status: "Success",
    duration: 4.18,
    tokens: 8640,
    cost: 0.0276,
    startedAt: "23 min ago",
    user: "ops@acme.com",
    steps: [
      {
        id: "step_1",
        name: "Document upload",
        type: "Input",
        status: "Success",
        duration: 0.12,
        tokens: 0,
        cost: 0,
        timestamp: "14:00:01",
        detail:
          "PDF document received successfully.",
      },
      {
        id: "step_2",
        name: "Document extraction",
        type: "Multimodal",
        status: "Success",
        duration: 1.14,
        tokens: 2600,
        cost: 0.0072,
        timestamp: "14:00:02",
        detail:
          "Text, tables, and visual metadata extracted.",
      },
      {
        id: "step_3",
        name: "Classification",
        type: "Model",
        status: "Success",
        duration: 0.62,
        tokens: 980,
        cost: 0.0037,
        timestamp: "14:00:03",
        detail:
          "Document classified as financial report.",
      },
      {
        id: "step_4",
        name: "Data validation",
        type: "Workflow",
        status: "Success",
        duration: 0.91,
        tokens: 1320,
        cost: 0.0044,
        timestamp: "14:00:04",
        detail:
          "Extracted values validated against configured rules.",
      },
      {
        id: "step_5",
        name: "Final response",
        type: "Model",
        status: "Success",
        duration: 1.39,
        tokens: 3740,
        cost: 0.0123,
        timestamp: "14:00:05",
        detail:
          "Structured financial summary generated.",
      },
    ],
  },
  {
    id: "tr_982337",
    name: "Computer Use Workflow",
    type: "Computer Use",
    model: "GPT-5",
    status: "Running",
    duration: 1.91,
    tokens: 3860,
    cost: 0.0184,
    startedAt: "Running now",
    user: "automation@acme.com",
    steps: [
      {
        id: "step_1",
        name: "Start desktop session",
        type: "Computer Use",
        status: "Success",
        duration: 0.41,
        tokens: 320,
        cost: 0.0012,
        timestamp: "14:24:01",
        detail:
          "Remote computer session initialized.",
      },
      {
        id: "step_2",
        name: "Open application",
        type: "Computer Use",
        status: "Success",
        duration: 0.67,
        tokens: 640,
        cost: 0.0027,
        timestamp: "14:24:02",
        detail:
          "Target application launched successfully.",
      },
      {
        id: "step_3",
        name: "Perform task",
        type: "Computer Use",
        status: "Running",
        duration: 0.83,
        tokens: 2900,
        cost: 0.0145,
        timestamp: "14:24:03",
        detail:
          "Agent is currently interacting with the desktop application.",
      },
    ],
  },
];

export default function TraceViewerPage() {
  const [traces, setTraces] =
    useState<Trace[]>(initialTraces);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("All Types");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [selectedTrace, setSelectedTrace] =
    useState<Trace | null>(null);

  const [selectedStep, setSelectedStep] =
    useState<TraceStep | null>(null);

  const [activeTab, setActiveTab] = useState<
    "traces" | "analytics"
  >("traces");

  const filteredTraces = useMemo(() => {
    return traces.filter((trace) => {
      const searchMatch =
        `${trace.name} ${trace.id} ${trace.model} ${trace.user}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All Types" ||
        trace.type === typeFilter;

      const statusMatch =
        statusFilter === "All Status" ||
        trace.status === statusFilter;

      return searchMatch && typeMatch && statusMatch;
    });
  }, [traces, search, typeFilter, statusFilter]);

  const totalTokens = traces.reduce(
    (sum, trace) => sum + trace.tokens,
    0
  );

  const totalCost = traces.reduce(
    (sum, trace) => sum + trace.cost,
    0
  );

  const failedTraces = traces.filter(
    (trace) => trace.status === "Failed"
  ).length;

  const successfulTraces = traces.filter(
    (trace) => trace.status === "Success"
  ).length;

  const refreshTraces = () => {
    setTraces((current) =>
      current.map((trace) =>
        trace.status === "Running"
          ? {
              ...trace,
              duration: Number(
                (trace.duration + 0.42).toFixed(2)
              ),
            }
          : trace
      )
    );
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
                Trace Viewer
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-[27px] font-semibold tracking-[-0.6px]">
                Trace Viewer
              </h1>

              <span className="flex items-center gap-1.5 rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[10px] font-medium text-[#027a48]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#12b76a]" />
                Live
              </span>
            </div>

            <p className="mt-1.5 max-w-[850px] text-sm leading-6 text-[#667085]">
              Inspect agent executions, model calls, RAG retrieval,
              tool usage, latency, tokens, cost, errors, and
              complete execution paths.
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
              onClick={refreshTraces}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-5 gap-3">
          <MetricCard
            label="Total traces"
            value={String(traces.length)}
            helper="Recent executions"
            icon={<Activity size={17} />}
          />

          <MetricCard
            label="Successful"
            value={String(successfulTraces)}
            helper="Completed successfully"
            icon={<CheckCircle2 size={17} />}
          />

          <MetricCard
            label="Failed"
            value={String(failedTraces)}
            helper="Requires investigation"
            icon={<XCircle size={17} />}
            danger
          />

          <MetricCard
            label="Tokens"
            value={formatNumber(totalTokens)}
            helper="Across visible traces"
            icon={<Zap size={17} />}
          />

          <MetricCard
            label="Total cost"
            value={`$${totalCost.toFixed(4)}`}
            helper="Execution cost"
            icon={<DollarSign size={17} />}
          />
        </section>

        <section className="mb-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0f3] px-5 py-3">
            <div className="flex items-center gap-1">
              <TabButton
                active={activeTab === "traces"}
                onClick={() => setActiveTab("traces")}
              >
                Trace Explorer
              </TabButton>

              <TabButton
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
              >
                Trace Analytics
              </TabButton>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#98a2b3]">
              <Clock3 size={13} />
              Live execution monitoring
            </div>
          </div>

          {activeTab === "traces" && (
            <FilterBar
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          )}
        </section>

        {activeTab === "traces" ? (
          <TraceTable
            traces={filteredTraces}
            onSelect={setSelectedTrace}
          />
        ) : (
          <TraceAnalytics traces={traces} />
        )}

        <section className="mt-5 grid grid-cols-3 gap-4">
          <InfoCard
            icon={<BarChart3 size={17} />}
            title="Cost Analytics"
            description="Understand model and agent execution costs across traces."
            href="/agent-builder/observability/cost-analytics"
          />

          <InfoCard
            icon={<Target size={17} />}
            title="Quality Evaluation"
            description="Connect execution traces with evaluation scores and quality signals."
            href="/agent-builder/testing/quality-evaluation"
          />

          <InfoCard
            icon={<GitBranch size={17} />}
            title="Regression Testing"
            description="Use traces to investigate failures and detect behavior regressions."
            href="/agent-builder/testing/regression-testing"
          />
        </section>
      </div>

      {selectedTrace && (
        <TraceDetailModal
          trace={selectedTrace}
          selectedStep={selectedStep}
          onSelectStep={setSelectedStep}
          onClose={() => {
            setSelectedTrace(null);
            setSelectedStep(null);
          }}
        />
      )}
    </main>
  );
}

function TraceTable({
  traces,
  onSelect,
}: {
  traces: Trace[];
  onSelect: (trace: Trace) => void;
}) {
  return (
    <section className="rounded-xl border border-[#e1e5eb] bg-white">
      <div className="flex items-center justify-between border-b border-[#edf0f3] px-5 py-4">
        <div>
          <h2 className="text-[16px] font-semibold">
            Recent Traces
          </h2>

          <p className="mt-1 text-xs text-[#667085]">
            Select a trace to inspect the complete execution tree.
          </p>
        </div>

        <span className="text-[10px] text-[#98a2b3]">
          {traces.length} traces
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="bg-[#fafbfc] text-left text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
              <th className="px-5 py-3">Trace</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-5 py-3">Started</th>
            </tr>
          </thead>

          <tbody>
            {traces.map((trace) => (
              <tr
                key={trace.id}
                className="border-t border-[#edf0f3] hover:bg-[#fafbfc]"
              >
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(trace)}
                    className="text-left"
                  >
                    <div className="text-xs font-semibold hover:underline">
                      {trace.name}
                    </div>

                    <div className="mt-1 font-mono text-[9px] text-[#98a2b3]">
                      {trace.id}
                    </div>
                  </button>
                </td>

                <td className="px-4 py-4">
                  <TraceTypeBadge type={trace.type} />
                </td>

                <td className="px-4 py-4 text-xs text-[#475467]">
                  {trace.model}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={trace.status} />
                </td>

                <td className="px-4 py-4 text-xs">
                  {trace.duration.toFixed(2)}s
                </td>

                <td className="px-4 py-4 text-xs">
                  {formatNumber(trace.tokens)}
                </td>

                <td className="px-4 py-4 text-xs">
                  ${trace.cost.toFixed(4)}
                </td>

                <td className="px-5 py-4 text-[10px] text-[#98a2b3]">
                  {trace.startedAt}
                </td>
              </tr>
            ))}

            {traces.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-xs text-[#98a2b3]"
                >
                  No traces found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TraceDetailModal({
  trace,
  selectedStep,
  onSelectStep,
  onClose,
}: {
  trace: Trace;
  selectedStep: TraceStep | null;
  onSelectStep: (step: TraceStep) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="flex max-h-[92vh] w-full max-w-[1250px] flex-col overflow-hidden rounded-xl border border-[#e1e5eb] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#edf0f3] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-semibold">
                {trace.name}
              </h2>

              <StatusBadge status={trace.status} />
            </div>

            <div className="mt-1 flex items-center gap-3 text-[10px] text-[#98a2b3]">
              <span className="font-mono">
                {trace.id}
              </span>

              <span>•</span>

              <span>{trace.model}</span>

              <span>•</span>

              <span>{trace.user}</span>
            </div>
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

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_330px]">
          <div className="min-h-0 overflow-y-auto border-r border-[#edf0f3]">
            <div className="grid grid-cols-4 gap-3 border-b border-[#edf0f3] p-4">
              <DetailMetric
                label="Duration"
                value={`${trace.duration.toFixed(2)}s`}
                icon={<Clock3 size={15} />}
              />

              <DetailMetric
                label="Tokens"
                value={formatNumber(trace.tokens)}
                icon={<Zap size={15} />}
              />

              <DetailMetric
                label="Cost"
                value={`$${trace.cost.toFixed(4)}`}
                icon={<DollarSign size={15} />}
              />

              <DetailMetric
                label="Steps"
                value={String(trace.steps.length)}
                icon={<Layers size={15} />}
              />
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Execution Trace
                  </h3>

                  <p className="mt-1 text-[10px] text-[#98a2b3]">
                    Click any step to inspect its execution details.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-[#98a2b3]">
                  <span className="h-2 w-2 rounded-full bg-[#12b76a]" />
                  Success

                  <span className="ml-2 h-2 w-2 rounded-full bg-[#f04438]" />
                  Failed
                </div>
              </div>

              <div className="relative">
                <div className="absolute bottom-5 left-[19px] top-5 w-px bg-[#dfe3e8]" />

                <div className="space-y-2">
                  {trace.steps.map((step, index) => (
                    <TraceStepRow
                      key={step.id}
                      step={step}
                      index={index}
                      selected={selectedStep?.id === step.id}
                      onClick={() => onSelectStep(step)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="min-h-0 overflow-y-auto bg-[#fafbfc]">
            {selectedStep ? (
              <StepDetails step={selectedStep} />
            ) : (
              <EmptyStepDetails />
            )}
          </aside>
        </div>

        <div className="flex items-center justify-between border-t border-[#edf0f3] px-5 py-3">
          <div className="flex items-center gap-2 text-[10px] text-[#98a2b3]">
            <ShieldCheck size={13} />
            Trace data is available for debugging and evaluation.
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/observability/cost-analytics"
              className="flex items-center gap-1.5 rounded-lg border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#475467]"
            >
              <BarChart3 size={13} />
              Cost Analytics
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#171a21] px-3 py-2 text-xs font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TraceStepRow({
  step,
  index,
  selected,
  onClick,
}: {
  step: TraceStep;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-[#cfd4dc] bg-[#f8f9fb]"
          : "border-[#edf0f3] bg-white hover:border-[#dfe3e8]"
      }`}
    >
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfe3e8] bg-white">
        {step.status === "Success" ? (
          <CheckCircle2
            size={14}
            className="text-[#12b76a]"
          />
        ) : step.status === "Failed" ? (
          <XCircle
            size={14}
            className="text-[#f04438]"
          />
        ) : step.status === "Warning" ? (
          <AlertTriangle
            size={14}
            className="text-[#f79009]"
          />
        ) : (
          <Activity
            size={14}
            className="animate-pulse text-[#175cd3]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold">
            {index + 1}. {step.name}
          </div>

          <span className="shrink-0 text-[9px] text-[#98a2b3]">
            {step.duration.toFixed(2)}s
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-md bg-[#f2f4f7] px-1.5 py-0.5 text-[9px] font-medium text-[#667085]">
            {step.type}
          </span>

          {step.tokens > 0 && (
            <span className="text-[9px] text-[#98a2b3]">
              {formatNumber(step.tokens)} tokens
            </span>
          )}

          {step.cost > 0 && (
            <span className="text-[9px] text-[#98a2b3]">
              ${step.cost.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function StepDetails({
  step,
}: {
  step: TraceStep;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7]">
          <Terminal size={16} />
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            {step.name}
          </h3>

          <p className="text-[10px] text-[#98a2b3]">
            {step.type}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <SmallMetric
          label="Status"
          value={step.status}
        />

        <SmallMetric
          label="Duration"
          value={`${step.duration.toFixed(2)}s`}
        />

        <SmallMetric
          label="Tokens"
          value={formatNumber(step.tokens)}
        />

        <SmallMetric
          label="Cost"
          value={`$${step.cost.toFixed(4)}`}
        />
      </div>

      <div className="mt-5">
        <div className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
          Execution details
        </div>

        <div className="mt-2 rounded-lg border border-[#e1e5eb] bg-white p-3">
          <p className="text-xs leading-5 text-[#475467]">
            {step.detail}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
          Timestamp
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#e1e5eb] bg-white p-3 text-xs">
          <Clock3 size={14} />
          {step.timestamp}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
          Runtime metadata
        </div>

        <div className="mt-2 space-y-1.5">
          <RuntimeRow
            label="Execution ID"
            value={step.id}
          />

          <RuntimeRow
            label="Step type"
            value={step.type}
          />

          <RuntimeRow
            label="Token usage"
            value={formatNumber(step.tokens)}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyStepDetails() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2f4f7]">
        <Target size={19} />
      </div>

      <h3 className="mt-3 text-sm font-semibold">
        Select a trace step
      </h3>

      <p className="mt-1 max-w-[230px] text-xs leading-5 text-[#98a2b3]">
        Select an execution step to inspect its duration,
        tokens, cost, status, and details.
      </p>
    </div>
  );
}

function TraceAnalytics({
  traces,
}: {
  traces: Trace[];
}) {
  const averageDuration =
    traces.reduce(
      (sum, trace) => sum + trace.duration,
      0
    ) / traces.length;

  const averageTokens =
    traces.reduce(
      (sum, trace) => sum + trace.tokens,
      0
    ) / traces.length;

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <AnalyticsCard
          title="Average duration"
          value={`${averageDuration.toFixed(2)}s`}
          change="-8.4%"
          positive
          icon={<Clock3 size={17} />}
        />

        <AnalyticsCard
          title="Average tokens"
          value={formatNumber(
            Math.round(averageTokens)
          )}
          change="-4.2%"
          positive
          icon={<Zap size={17} />}
        />

        <AnalyticsCard
          title="Trace success rate"
          value="80%"
          change="+5.8%"
          positive
          icon={<CheckCircle2 size={17} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnalyticsPanel title="Trace types">
          <AnalyticsBar
            label="Agent"
            value={42}
          />

          <AnalyticsBar
            label="RAG"
            value={27}
          />

          <AnalyticsBar
            label="Workflow"
            value={18}
          />

          <AnalyticsBar
            label="Browser"
            value={8}
          />

          <AnalyticsBar
            label="Computer Use"
            value={5}
          />
        </AnalyticsPanel>

        <AnalyticsPanel title="Execution health">
          <HealthRow
            label="Successful traces"
            value="80%"
            change="+5.8%"
            positive
          />

          <HealthRow
            label="Warning traces"
            value="10%"
            change="-2.4%"
            positive
          />

          <HealthRow
            label="Failed traces"
            value="10%"
            change="-3.4%"
            positive
          />

          <HealthRow
            label="Active traces"
            value="1"
            change="Live"
            positive
          />
        </AnalyticsPanel>
      </div>
    </section>
  );
}

function AnalyticsCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#667085]">
          {title}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7]">
          {icon}
        </div>
      </div>

      <div className="mt-4 text-[24px] font-semibold">
        {value}
      </div>

      <div
        className={`mt-1 text-[10px] font-medium ${
          positive
            ? "text-[#027a48]"
            : "text-[#d92d20]"
        }`}
      >
        {change} from previous period
      </div>
    </div>
  );
}

function AnalyticsPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white">
      <div className="border-b border-[#edf0f3] px-5 py-4">
        <h2 className="text-[15px] font-semibold">
          {title}
        </h2>
      </div>

      <div className="space-y-4 p-5">
        {children}
      </div>
    </div>
  );
}

function AnalyticsBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-[#475467]">
          {label}
        </span>

        <span className="text-[10px] font-semibold">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className="h-full rounded-full bg-[#475467]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function FilterBar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-4">
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
          placeholder="Search traces, IDs, models, or users..."
          className="h-9 w-full rounded-lg border border-[#dfe3e8] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#98a2b3]"
        />
      </div>

      <SelectFilter
        value={typeFilter}
        onChange={setTypeFilter}
        options={[
          "All Types",
          "Agent",
          "RAG",
          "Workflow",
          "Browser",
          "Computer Use",
          "Model",
        ]}
      />

      <SelectFilter
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          "All Status",
          "Success",
          "Failed",
          "Running",
          "Warning",
        ]}
      />

      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467]"
      >
        <Settings2 size={14} />
        Filters
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
    <div className="rounded-lg border border-[#edf0f3] bg-white p-3">
      <div className="flex items-center gap-2 text-[#667085]">
        {icon}

        <span className="text-[9px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div className="mt-2 text-sm font-semibold">
        {value}
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
    <div className="rounded-lg border border-[#e1e5eb] bg-white p-3">
      <div className="text-[9px] uppercase tracking-wide text-[#98a2b3]">
        {label}
      </div>

      <div className="mt-1.5 truncate text-xs font-semibold">
        {value}
      </div>
    </div>
  );
}

function RuntimeRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#edf0f3] bg-white px-3 py-2">
      <span className="text-[10px] text-[#98a2b3]">
        {label}
      </span>

      <span className="max-w-[150px] truncate font-mono text-[10px] text-[#475467]">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TraceStatus;
}) {
  const styles: Record<TraceStatus, string> = {
    Success: "bg-[#ecfdf3] text-[#027a48]",
    Failed: "bg-[#fef3f2] text-[#b42318]",
    Running: "bg-[#eff8ff] text-[#175cd3]",
    Warning: "bg-[#fffaeb] text-[#b54708]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TraceTypeBadge({
  type,
}: {
  type: TraceType;
}) {
  return (
    <span className="flex w-fit items-center gap-1.5 rounded-md bg-[#f2f4f7] px-2 py-1 text-[9px] font-medium text-[#667085]">
      {type === "Agent" ? (
        <Bot size={11} />
      ) : type === "RAG" ? (
        <Database size={11} />
      ) : type === "Workflow" ? (
        <GitBranch size={11} />
      ) : type === "Browser" ? (
        <Search size={11} />
      ) : type === "Computer Use" ? (
        <Terminal size={11} />
      ) : (
        <Zap size={11} />
      )}

      {type}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  description,
  href,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#e1e5eb] bg-white p-4 transition hover:border-[#cfd4dc]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7]">
        {icon}
      </div>

      <div className="mt-3 text-xs font-semibold">
        {title}
      </div>

      <p className="mt-1.5 text-[10px] leading-5 text-[#667085]">
        {description}
      </p>

      <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#475467]">
        Open
        <ArrowRight size={12} />
      </div>
    </Link>
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
      className={`rounded-lg px-3 py-2 text-xs font-medium ${
        active
          ? "bg-[#171a21] text-white"
          : "text-[#667085] hover:bg-[#f8f9fb]"
      }`}
    >
      {children}
    </button>
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
        className={`w-[80px] text-right text-[10px] font-medium ${
          positive ? "text-[#027a48]" : "text-[#d92d20]"
        }`}
      >
        {change}
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}