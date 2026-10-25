"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  Gauge,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type EvaluationStatus =
  | "Excellent"
  | "Good"
  | "Needs Review"
  | "Failed";

type EvaluationResult = {
  id: number;
  dataset: string;
  model: string;
  quality: number;
  relevance: number;
  groundedness: number;
  instructionFollowing: number;
  safety: number;
  latency: string;
  status: EvaluationStatus;
  evaluatedAt: string;
};

type Dimension = {
  name: string;
  score: number;
  description: string;
  icon: ReactNode;
};

const evaluationResults: EvaluationResult[] = [
  {
    id: 1,
    dataset: "General Assistant Quality",
    model: "GPT-5",
    quality: 94.8,
    relevance: 96.1,
    groundedness: 93.2,
    instructionFollowing: 95.4,
    safety: 98.4,
    latency: "1.42s",
    status: "Excellent",
    evaluatedAt: "12 min ago",
  },
  {
    id: 2,
    dataset: "RAG Grounding Benchmark",
    model: "Claude Sonnet",
    quality: 91.6,
    relevance: 93.8,
    groundedness: 89.4,
    instructionFollowing: 92.7,
    safety: 97.8,
    latency: "1.86s",
    status: "Good",
    evaluatedAt: "24 min ago",
  },
  {
    id: 3,
    dataset: "Agent Tool Use",
    model: "Gemini",
    quality: 89.4,
    relevance: 91.2,
    groundedness: 86.8,
    instructionFollowing: 90.5,
    safety: 96.9,
    latency: "2.14s",
    status: "Good",
    evaluatedAt: "1 hr ago",
  },
  {
    id: 4,
    dataset: "Prompt Injection Safety",
    model: "GPT-5",
    quality: 97.2,
    relevance: 96.8,
    groundedness: 95.1,
    instructionFollowing: 97.6,
    safety: 99.2,
    latency: "1.18s",
    status: "Excellent",
    evaluatedAt: "3 hrs ago",
  },
  {
    id: 5,
    dataset: "Production Failure Cases",
    model: "Claude Sonnet",
    quality: 78.6,
    relevance: 81.2,
    groundedness: 74.8,
    instructionFollowing: 79.4,
    safety: 91.7,
    latency: "2.43s",
    status: "Failed",
    evaluatedAt: "2 days ago",
  },
];

const dimensions: Dimension[] = [
  {
    name: "Correctness",
    score: 94.2,
    description:
      "Measures whether the generated response contains accurate information and reaches the expected result.",
    icon: <CheckCircle2 size={18} />,
  },
  {
    name: "Relevance",
    score: 95.4,
    description:
      "Measures how directly the response addresses the user's request without unnecessary information.",
    icon: <Target size={18} />,
  },
  {
    name: "Groundedness",
    score: 91.8,
    description:
      "Measures whether generated claims are supported by the available context or retrieved knowledge.",
    icon: <Database size={18} />,
  },
  {
    name: "Instruction Following",
    score: 94.6,
    description:
      "Measures whether the model follows system instructions, user requirements, and requested formats.",
    icon: <FileText size={18} />,
  },
  {
    name: "Safety",
    score: 98.1,
    description:
      "Measures adherence to configured safety, policy, and guardrail requirements.",
    icon: <ShieldCheck size={18} />,
  },
  {
    name: "Consistency",
    score: 92.7,
    description:
      "Measures whether similar inputs produce stable and predictable outputs.",
    icon: <Activity size={18} />,
  },
];

export default function QualityEvaluationPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "results" | "dimensions"
  >("overview");

  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("All Models");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedResult, setSelectedResult] =
    useState<EvaluationResult | null>(null);

  const filteredResults = useMemo(() => {
    return evaluationResults.filter((result) => {
      const matchesSearch =
        result.dataset
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        result.model
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesModel =
        modelFilter === "All Models" ||
        result.model === modelFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        result.status === statusFilter;

      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [search, modelFilter, statusFilter]);

  const averageQuality = useMemo(() => {
    const total = evaluationResults.reduce(
      (sum, item) => sum + item.quality,
      0
    );

    return (total / evaluationResults.length).toFixed(1);
  }, []);

  const averageRelevance = useMemo(() => {
    const total = evaluationResults.reduce(
      (sum, item) => sum + item.relevance,
      0
    );

    return (total / evaluationResults.length).toFixed(1);
  }, []);

  const averageGroundedness = useMemo(() => {
    const total = evaluationResults.reduce(
      (sum, item) => sum + item.groundedness,
      0
    );

    return (total / evaluationResults.length).toFixed(1);
  }, []);

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
                Quality Evaluation
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-[27px] font-semibold tracking-[-0.6px]">
                Quality Evaluation
              </h1>

              <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[10px] font-medium text-[#027a48]">
                Evaluation Engine Ready
              </span>
            </div>

            <p className="mt-1.5 max-w-[760px] text-sm leading-6 text-[#667085]">
              Evaluate AI responses across correctness, relevance,
              groundedness, instruction following, safety, and
              consistency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/testing"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467] hover:bg-[#f8f9fb]"
            >
              <ArrowLeft size={15} />
              Back
            </Link>

            <Link
              href="/agent-builder/testing/playground"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467] hover:bg-[#f8f9fb]"
            >
              <TestTube2 size={15} />
              Playground
            </Link>

            <Link
              href="/agent-builder/testing/evaluation-datasets"
              className="flex h-9 items-center gap-2 rounded-lg bg-[#171a21] px-3 text-xs font-medium text-white hover:bg-[#282c35]"
            >
              <Database size={15} />
              Datasets
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
            active={activeTab === "results"}
            onClick={() => setActiveTab("results")}
          >
            Evaluation Results
          </TabButton>

          <TabButton
            active={activeTab === "dimensions"}
            onClick={() => setActiveTab("dimensions")}
          >
            Quality Dimensions
          </TabButton>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="mb-5 grid grid-cols-6 gap-3">
              <MetricCard
                label="Overall quality"
                value={`${averageQuality}%`}
                helper="Across evaluations"
                icon={<BarChart3 size={17} />}
              />

              <MetricCard
                label="Relevance"
                value={`${averageRelevance}%`}
                helper="Response relevance"
                icon={<Target size={17} />}
              />

              <MetricCard
                label="Groundedness"
                value={`${averageGroundedness}%`}
                helper="Context support"
                icon={<Database size={17} />}
              />

              <MetricCard
                label="Safety"
                value="98.1%"
                helper="Safety benchmark"
                icon={<ShieldCheck size={17} />}
              />

              <MetricCard
                label="Avg latency"
                value="1.81s"
                helper="Evaluation runtime"
                icon={<Clock3 size={17} />}
              />

              <MetricCard
                label="Evaluations"
                value="1,842"
                helper="Recent runs"
                icon={<Activity size={17} />}
              />
            </section>

            <section className="mb-5 grid grid-cols-3 gap-4">
              <SummaryCard
                title="Quality Score"
                value="93.4"
                suffix="%"
                description="Average response quality across configured evaluation datasets."
                icon={<Gauge size={20} />}
              />

              <SummaryCard
                title="Evaluation Coverage"
                value="86.2"
                suffix="%"
                description="Percentage of configured scenarios currently covered by evaluation tests."
                icon={<Target size={20} />}
              />

              <SummaryCard
                title="Regression Detection"
                value="7"
                suffix=""
                description="Potential quality regressions identified in recent evaluation runs."
                icon={<TrendingUp size={20} />}
              />
            </section>

            <section className="mb-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#e1e5eb] bg-white">
                <div className="border-b border-[#edf0f3] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[16px] font-semibold">
                        Quality Dimensions
                      </h2>

                      <p className="mt-1 text-xs text-[#667085]">
                        Current performance across evaluation dimensions.
                      </p>
                    </div>

                    <Link
                      href="/agent-builder/testing/evaluation-datasets"
                      className="flex items-center gap-1 text-[11px] font-medium text-[#475467]"
                    >
                      Configure
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {dimensions.slice(0, 5).map((dimension) => (
                    <DimensionRow
                      key={dimension.name}
                      dimension={dimension}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#e1e5eb] bg-white">
                <div className="border-b border-[#edf0f3] px-5 py-4">
                  <h2 className="text-[16px] font-semibold">
                    Evaluation Pipeline
                  </h2>

                  <p className="mt-1 text-xs text-[#667085]">
                    How responses are evaluated.
                  </p>
                </div>

                <div className="space-y-3 p-5">
                  <PipelineStep
                    number="01"
                    title="Response Collection"
                    description="Collect model or agent responses from evaluation datasets."
                    status="Completed"
                  />

                  <PipelineStep
                    number="02"
                    title="Rule Evaluation"
                    description="Check deterministic rules, expected outputs, and formatting."
                    status="Completed"
                  />

                  <PipelineStep
                    number="03"
                    title="AI Evaluation"
                    description="Evaluate relevance, correctness, groundedness, and quality."
                    status="Completed"
                  />

                  <PipelineStep
                    number="04"
                    title="Safety Evaluation"
                    description="Run configured safety and guardrail checks."
                    status="Completed"
                  />

                  <PipelineStep
                    number="05"
                    title="Score Aggregation"
                    description="Combine dimension scores into an overall evaluation result."
                    status="Active"
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "results" && (
          <section className="rounded-xl border border-[#e1e5eb] bg-white">
            <div className="border-b border-[#edf0f3] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold">
                    Evaluation Results
                  </h2>

                  <p className="mt-1 text-xs text-[#667085]">
                    Review quality scores from recent evaluations.
                  </p>
                </div>

                <Link
                  href="/agent-builder/testing/evaluation-datasets"
                  className="flex items-center gap-1.5 rounded-lg bg-[#171a21] px-3 py-2 text-xs font-medium text-white"
                >
                  Manage datasets
                  <ArrowRight size={14} />
                </Link>
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

            <ResultsTable
              results={filteredResults}
              onSelect={setSelectedResult}
            />
          </section>
        )}

        {activeTab === "dimensions" && (
          <section>
            <div className="mb-4 grid grid-cols-3 gap-4">
              {dimensions.map((dimension) => (
                <DimensionCard
                  key={dimension.name}
                  dimension={dimension}
                />
              ))}
            </div>

            <div className="rounded-xl border border-[#e1e5eb] bg-white">
              <div className="border-b border-[#edf0f3] px-5 py-4">
                <h2 className="text-[16px] font-semibold">
                  Quality Scoring Method
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#667085]">
                  The evaluation engine combines deterministic checks,
                  model-based evaluation, safety checks, and configured
                  scoring rules.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 p-5">
                <MethodCard
                  number="01"
                  title="Rules"
                  description="Exact-match, structured-output, format, and threshold checks."
                />

                <MethodCard
                  number="02"
                  title="AI Judge"
                  description="Model-based evaluation of semantic quality and instruction following."
                />

                <MethodCard
                  number="03"
                  title="Safety"
                  description="Guardrails, policy checks, injection detection, and risk analysis."
                />

                <MethodCard
                  number="04"
                  title="Aggregation"
                  description="Combine evaluation dimensions into a final quality score."
                />
              </div>
            </div>
          </section>
        )}

        {selectedResult && (
          <ResultModal
            result={selectedResult}
            onClose={() => setSelectedResult(null)}
          />
        )}
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

function SummaryCard({
  title,
  value,
  suffix,
  description,
  icon,
}: {
  title: string;
  value: string;
  suffix: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>

        <span className="text-[10px] font-medium text-[#98a2b3]">
          Quality
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-[28px] font-semibold">
          {value}
        </span>

        <span className="text-sm font-medium text-[#667085]">
          {suffix}
        </span>
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

function DimensionRow({
  dimension,
}: {
  dimension: Dimension;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#475467]">
            {dimension.icon}
          </span>

          <span className="text-xs font-medium">
            {dimension.name}
          </span>
        </div>

        <span className="text-xs font-semibold">
          {dimension.score}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className="h-full rounded-full bg-[#12b76a]"
          style={{
            width: `${dimension.score}%`,
          }}
        />
      </div>
    </div>
  );
}

function DimensionCard({
  dimension,
}: {
  dimension: Dimension;
}) {
  const scoreColor =
    dimension.score >= 95
      ? "text-[#027a48]"
      : dimension.score >= 85
        ? "text-[#b54708]"
        : "text-[#d92d20]";

  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {dimension.icon}
        </div>

        <span
          className={`text-[22px] font-semibold ${scoreColor}`}
        >
          {dimension.score}%
        </span>
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        {dimension.name}
      </h3>

      <p className="mt-1.5 min-h-[60px] text-xs leading-5 text-[#667085]">
        {dimension.description}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className="h-full rounded-full bg-[#12b76a]"
          style={{
            width: `${dimension.score}%`,
          }}
        />
      </div>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  status,
}: {
  number: string;
  title: string;
  description: string;
  status: "Completed" | "Active";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#edf0f3] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f4f7] text-[10px] font-semibold text-[#475467]">
        {number}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold">
            {title}
          </h3>

          <span
            className={`rounded-full px-2 py-1 text-[9px] font-medium ${
              status === "Completed"
                ? "bg-[#ecfdf3] text-[#027a48]"
                : "bg-[#eff8ff] text-[#175cd3]"
            }`}
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
          placeholder="Search datasets or models..."
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
          "Excellent",
          "Good",
          "Needs Review",
          "Failed",
        ]}
      />

      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467]"
      >
        <Settings2 size={14} />
        Configure
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

function ResultsTable({
  results,
  onSelect,
}: {
  results: EvaluationResult[];
  onSelect: (result: EvaluationResult) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse">
        <thead>
          <tr className="bg-[#fafbfc] text-left text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
            <th className="px-5 py-3">Dataset</th>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3">Quality</th>
            <th className="px-4 py-3">Relevance</th>
            <th className="px-4 py-3">Grounded</th>
            <th className="px-4 py-3">Instructions</th>
            <th className="px-4 py-3">Safety</th>
            <th className="px-4 py-3">Latency</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-5 py-3">Time</th>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr
              key={result.id}
              className="border-t border-[#edf0f3] transition hover:bg-[#fafbfc]"
            >
              <td className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => onSelect(result)}
                  className="text-left text-xs font-semibold hover:underline"
                >
                  {result.dataset}
                </button>
              </td>

              <td className="px-4 py-4 text-xs text-[#475467]">
                {result.model}
              </td>

              <ScoreCell value={result.quality} />
              <ScoreCell value={result.relevance} />
              <ScoreCell value={result.groundedness} />
              <ScoreCell
                value={result.instructionFollowing}
              />
              <ScoreCell value={result.safety} />

              <td className="px-4 py-4 text-xs text-[#475467]">
                {result.latency}
              </td>

              <td className="px-4 py-4">
                <StatusBadge status={result.status} />
              </td>

              <td className="px-5 py-4 text-[10px] text-[#98a2b3]">
                {result.evaluatedAt}
              </td>
            </tr>
          ))}

          {results.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="px-5 py-12 text-center text-xs text-[#98a2b3]"
              >
                No evaluation results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ScoreCell({
  value,
}: {
  value: number;
}) {
  const className =
    value >= 95
      ? "text-[#027a48]"
      : value >= 85
        ? "text-[#b54708]"
        : "text-[#d92d20]";

  return (
    <td className="px-4 py-4">
      <span className={`text-xs font-semibold ${className}`}>
        {value}%
      </span>
    </td>
  );
}

function StatusBadge({
  status,
}: {
  status: EvaluationStatus;
}) {
  const styles: Record<EvaluationStatus, string> = {
    Excellent: "bg-[#ecfdf3] text-[#027a48]",
    Good: "bg-[#eff8ff] text-[#175cd3]",
    "Needs Review": "bg-[#fffaeb] text-[#b54708]",
    Failed: "bg-[#fef3f2] text-[#b42318]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function MethodCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#edf0f3] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[10px] font-semibold text-[#475467]">
        {number}
      </div>

      <h3 className="mt-3 text-xs font-semibold">
        {title}
      </h3>

      <p className="mt-1.5 text-[10px] leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  );
}

function ResultModal({
  result,
  onClose,
}: {
  result: EvaluationResult;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[700px] rounded-xl border border-[#e1e5eb] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#edf0f3] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold">
                {result.dataset}
              </h2>

              <StatusBadge status={result.status} />
            </div>

            <p className="mt-1 text-xs text-[#667085]">
              {result.model} · evaluated {result.evaluatedAt}
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
          <DetailScore
            label="Overall Quality"
            value={result.quality}
          />

          <DetailScore
            label="Relevance"
            value={result.relevance}
          />

          <DetailScore
            label="Groundedness"
            value={result.groundedness}
          />

          <DetailScore
            label="Instruction Following"
            value={result.instructionFollowing}
          />

          <DetailScore
            label="Safety"
            value={result.safety}
          />

          <div className="rounded-lg border border-[#edf0f3] p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
              Latency
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Clock3
                size={16}
                className="text-[#475467]"
              />

              <span className="text-xl font-semibold">
                {result.latency}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#edf0f3] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold">
                Evaluation actions
              </div>

              <div className="mt-1 text-[10px] text-[#98a2b3]">
                Review the trace or compare this result with another run.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/agent-builder/testing/trace-viewer"
                className="flex items-center gap-1.5 rounded-lg border border-[#dfe3e8] px-3 py-2 text-xs font-medium text-[#475467]"
              >
                <Activity size={13} />
                View Trace
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

function DetailScore({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 95
      ? "text-[#027a48]"
      : value >= 85
        ? "text-[#b54708]"
        : "text-[#d92d20]";

  return (
    <div className="rounded-lg border border-[#edf0f3] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
          {label}
        </span>

        <span className={`text-lg font-semibold ${color}`}>
          {value}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className="h-full rounded-full bg-[#12b76a]"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}