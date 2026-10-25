"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  GitBranch,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  Upload,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type DatasetStatus = "Ready" | "Running" | "Draft" | "Failed";

type EvaluationDataset = {
  id: string;
  name: string;
  description: string;
  type: string;
  cases: number;
  models: number;
  status: DatasetStatus;
  passRate: number;
  lastRun: string;
  updated: string;
};

const initialDatasets: EvaluationDataset[] = [
  {
    id: "EVAL-1001",
    name: "General Assistant Quality",
    description:
      "Core evaluation dataset for response quality, relevance, and instruction following.",
    type: "Quality",
    cases: 1250,
    models: 6,
    status: "Ready",
    passRate: 94.8,
    lastRun: "12 min ago",
    updated: "Today",
  },
  {
    id: "EVAL-1002",
    name: "RAG Grounding Benchmark",
    description:
      "Tests retrieval accuracy, citation grounding, and context relevance.",
    type: "RAG",
    cases: 840,
    models: 5,
    status: "Running",
    passRate: 91.6,
    lastRun: "Running",
    updated: "Today",
  },
  {
    id: "EVAL-1003",
    name: "Agent Tool Use",
    description:
      "Measures tool selection, parameter accuracy, execution, and recovery.",
    type: "Agents",
    cases: 620,
    models: 4,
    status: "Ready",
    passRate: 89.4,
    lastRun: "1 hr ago",
    updated: "Today",
  },
  {
    id: "EVAL-1004",
    name: "Prompt Injection Safety",
    description:
      "Security evaluation for prompt injection and malicious instruction handling.",
    type: "Safety",
    cases: 980,
    models: 7,
    status: "Ready",
    passRate: 97.2,
    lastRun: "3 hrs ago",
    updated: "Yesterday",
  },
  {
    id: "EVAL-1005",
    name: "Customer Support Regression",
    description:
      "Regression dataset covering common customer support workflows.",
    type: "Regression",
    cases: 2100,
    models: 8,
    status: "Ready",
    passRate: 95.1,
    lastRun: "5 hrs ago",
    updated: "Yesterday",
  },
  {
    id: "EVAL-1006",
    name: "Multimodal Understanding",
    description:
      "Evaluates image, document, chart, and text understanding capabilities.",
    type: "Multimodal",
    cases: 560,
    models: 5,
    status: "Draft",
    passRate: 0,
    lastRun: "Not run",
    updated: "2 days ago",
  },
  {
    id: "EVAL-1007",
    name: "Latency & Cost Benchmark",
    description:
      "Measures latency, token consumption, and estimated cost across models.",
    type: "Performance",
    cases: 430,
    models: 9,
    status: "Ready",
    passRate: 92.3,
    lastRun: "1 day ago",
    updated: "2 days ago",
  },
  {
    id: "EVAL-1008",
    name: "Production Failure Cases",
    description:
      "Known production failures used for regression and release validation.",
    type: "Regression",
    cases: 315,
    models: 6,
    status: "Failed",
    passRate: 78.6,
    lastRun: "2 days ago",
    updated: "3 days ago",
  },
];

const statusOptions = ["All", "Ready", "Running", "Draft", "Failed"];

const typeOptions = [
  "All",
  "Quality",
  "RAG",
  "Agents",
  "Safety",
  "Regression",
  "Multimodal",
  "Performance",
];

export default function EvaluationDatasetsPage() {
  const [datasets, setDatasets] =
    useState<EvaluationDataset[]>(initialDatasets);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] =
    useState<EvaluationDataset | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filteredDatasets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return datasets.filter((dataset) => {
      const matchesSearch =
        !query ||
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        dataset.type.toLowerCase().includes(query) ||
        dataset.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        dataset.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        dataset.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [datasets, search, statusFilter, typeFilter]);

  const readyCount = datasets.filter(
    (dataset) => dataset.status === "Ready"
  ).length;

  const runningCount = datasets.filter(
    (dataset) => dataset.status === "Running"
  ).length;

  const draftCount = datasets.filter(
    (dataset) => dataset.status === "Draft"
  ).length;

  const failedCount = datasets.filter(
    (dataset) => dataset.status === "Failed"
  ).length;

  const totalCases = datasets.reduce(
    (total, dataset) => total + dataset.cases,
    0
  );

  const allVisibleSelected =
    filteredDatasets.length > 0 &&
    filteredDatasets.every((dataset) =>
      selectedIds.includes(dataset.id)
    );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredDatasets.map(
      (dataset) => dataset.id
    );

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...visibleIds]))
      );
    }
  }

  function updateStatus(
    id: string,
    status: DatasetStatus
  ) {
    setDatasets((current) =>
      current.map((dataset) =>
        dataset.id === id
          ? {
              ...dataset,
              status,
              lastRun:
                status === "Running"
                  ? "Running"
                  : dataset.lastRun,
              updated: "Just now",
            }
          : dataset
      )
    );

    setSelectedDataset((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            lastRun:
              status === "Running"
                ? "Running"
                : current.lastRun,
            updated: "Just now",
          }
        : current
    );

    setSelectedIds((current) =>
      current.filter((item) => item !== id)
    );
  }

  function runDataset(id: string) {
    updateStatus(id, "Running");

    window.setTimeout(() => {
      setDatasets((current) =>
        current.map((dataset) =>
          dataset.id === id
            ? {
                ...dataset,
                status: "Ready",
                lastRun: "Just now",
                updated: "Just now",
              }
            : dataset
        )
      );

      setSelectedDataset((current) =>
        current?.id === id
          ? {
              ...current,
              status: "Ready",
              lastRun: "Just now",
              updated: "Just now",
            }
          : current
      );
    }, 1400);
  }

  function bulkRun() {
    if (selectedIds.length === 0) return;

    setDatasets((current) =>
      current.map((dataset) =>
        selectedIds.includes(dataset.id)
          ? {
              ...dataset,
              status: "Running",
              lastRun: "Running",
              updated: "Just now",
            }
          : dataset
      )
    );

    setSelectedIds([]);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1550px] px-6 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/testing"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e5eb] bg-white text-[#667085] hover:bg-[#f4f5f7]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#667085]">
                <span>Agent Builder</span>
                <span>/</span>
                <span>Testing & Evaluation</span>
                <span>/</span>
                <span className="text-[#172033]">
                  Evaluation Datasets
                </span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.5px]">
                Evaluation Datasets
              </h1>

              <p className="mt-1 text-sm text-[#667085]">
                Build and manage datasets used to benchmark models,
                agents, RAG systems, safety, quality, and regression.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/testing/playground"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <TestTube2 size={16} />
              Playground
            </Link>

            <Link
              href="/agent-builder/testing/test-cases"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <FileText size={16} />
              Test Cases
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
            >
              <Plus size={16} />
              Create Dataset
            </button>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-5 gap-4">
          <MetricCard
            label="Ready datasets"
            value={readyCount.toString()}
            helper="Available for evaluation"
            icon={<CheckCircle2 size={18} />}
          />

          <MetricCard
            label="Running"
            value={runningCount.toString()}
            helper="Evaluations in progress"
            icon={<Activity size={18} />}
          />

          <MetricCard
            label="Draft"
            value={draftCount.toString()}
            helper="Not yet evaluated"
            icon={<FileText size={18} />}
          />

          <MetricCard
            label="Failed"
            value={failedCount.toString()}
            helper="Need investigation"
            icon={<XCircle size={18} />}
          />

          <MetricCard
            label="Total test cases"
            value={totalCases.toLocaleString()}
            helper="Across all datasets"
            icon={<Database size={18} />}
          />
        </section>

        <section className="mb-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Evaluation Datasets
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  Select datasets and run them against one or more
                  models.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#eff8ff] px-2.5 py-1 text-[11px] font-medium text-[#175cd3]">
                  {datasets.length} datasets
                </span>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]">
                  <Settings2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#edf0f3] px-5 py-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search datasets, descriptions, types..."
                className="h-9 w-full rounded-lg border border-[#dfe3e8] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#98a2b3]"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            <FilterSelect
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fafbfc] px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2
                  size={16}
                  className="text-[#12b76a]"
                />
                {selectedIds.length} dataset
                {selectedIds.length !== 1 ? "s" : ""} selected
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={bulkRun}
                  className="flex items-center gap-1.5 rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white"
                >
                  <Zap size={13} />
                  Run Evaluation
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg border border-[#dfe3e8] bg-white px-3 py-1.5 text-xs font-medium text-[#344054]"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px] border-collapse">
              <thead>
                <tr className="bg-[#fafbfc] text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                  <th className="w-[45px] px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-[#d0d5dd]"
                    />
                  </th>

                  <th className="px-2 py-3">Dataset</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Cases</th>
                  <th className="px-4 py-3">Models</th>
                  <th className="px-4 py-3">Pass Rate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Run</th>
                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDatasets.map((dataset) => (
                  <tr
                    key={dataset.id}
                    className="border-t border-[#edf0f3] hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(dataset.id)}
                        onChange={() =>
                          toggleSelection(dataset.id)
                        }
                        className="h-4 w-4 rounded border-[#d0d5dd]"
                      />
                    </td>

                    <td className="px-2 py-4">
                      <button
                        onClick={() =>
                          setSelectedDataset(dataset)
                        }
                        className="text-left"
                      >
                        <div className="text-sm font-semibold text-[#172033] hover:underline">
                          {dataset.name}
                        </div>

                        <div className="mt-1 max-w-[380px] text-[11px] leading-4 text-[#98a2b3]">
                          {dataset.description}
                        </div>

                        <div className="mt-1 text-[10px] text-[#98a2b3]">
                          {dataset.id}
                        </div>
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md border border-[#e1e5eb] bg-[#fafbfc] px-2 py-1 text-[11px] font-medium text-[#475467]">
                        {dataset.type}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold">
                        {dataset.cases.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <GitBranch
                          size={14}
                          className="text-[#98a2b3]"
                        />
                        {dataset.models}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <PassRate value={dataset.passRate} />
                    </td>

                    <td className="px-4 py-4">
                      <DatasetStatusBadge
                        status={dataset.status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-[#475467]">
                        <Clock3 size={14} />
                        {dataset.lastRun}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setSelectedDataset(dataset)
                          }
                          className="rounded-lg border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8f9fb]"
                        >
                          View
                        </button>

                        <button
                          disabled={
                            dataset.status === "Running"
                          }
                          onClick={() => runDataset(dataset.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Zap size={13} />
                          Run
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDatasets.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085]">
                        <Search size={18} />
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        No evaluation datasets found
                      </p>

                      <p className="mt-1 text-xs text-[#98a2b3]">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4">
          <InfoCard
            icon={<Target size={18} />}
            title="Quality evaluation"
            description="Measure response quality across standardized test cases."
            items={[
              "Correctness",
              "Relevance",
              "Instruction following",
              "Response quality",
            ]}
          />

          <InfoCard
            icon={<Database size={18} />}
            title="Dataset management"
            description="Create reusable evaluation datasets for models and agents."
            items={[
              "Manual test cases",
              "CSV / JSON import",
              "Production failure cases",
              "Versioned datasets",
            ]}
          />

          <InfoCard
            icon={<BarChart3 size={18} />}
            title="Benchmarking"
            description="Compare model quality, latency, cost, and safety."
            items={[
              "Model comparison",
              "Regression detection",
              "Quality trends",
              "Release validation",
            ]}
          />
        </section>

        <section className="mt-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <h2 className="text-[16px] font-semibold">
              Evaluation Pipeline
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              Evaluation datasets flow through test execution,
              scoring, comparison, and regression analysis.
            </p>
          </div>

          <div className="grid grid-cols-5 divide-x divide-[#edf0f3]">
            <PipelineStep
              number="01"
              title="Dataset"
              description="Load evaluation cases and expected outputs."
              icon={<Database size={17} />}
            />

            <PipelineStep
              number="02"
              title="Models"
              description="Select one or more models or agent versions."
              icon={<GitBranch size={17} />}
            />

            <PipelineStep
              number="03"
              title="Evaluation"
              description="Execute test cases against selected systems."
              icon={<TestTube2 size={17} />}
            />

            <PipelineStep
              number="04"
              title="Scoring"
              description="Calculate quality, safety, latency, and cost metrics."
              icon={<BarChart3 size={17} />}
            />

            <PipelineStep
              number="05"
              title="Regression"
              description="Compare results with previous benchmark runs."
              icon={<ShieldCheck size={17} />}
            />
          </div>
        </section>
      </div>

      {selectedDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[720px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <div className="text-[11px] font-medium text-[#98a2b3]">
                  {selectedDataset.id}
                </div>

                <h2 className="mt-1 text-lg font-semibold">
                  {selectedDataset.name}
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  {selectedDataset.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedDataset(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-5">
              <DetailItem
                label="Dataset Type"
                value={selectedDataset.type}
              />

              <DetailItem
                label="Status"
                value={selectedDataset.status}
              />

              <DetailItem
                label="Test Cases"
                value={selectedDataset.cases.toLocaleString()}
              />

              <DetailItem
                label="Models"
                value={selectedDataset.models.toString()}
              />

              <DetailItem
                label="Pass Rate"
                value={`${selectedDataset.passRate}%`}
              />

              <DetailItem
                label="Last Run"
                value={selectedDataset.lastRun}
              />

              <DetailItem
                label="Updated"
                value={selectedDataset.updated}
              />

              <DetailItem
                label="Dataset ID"
                value={selectedDataset.id}
              />
            </div>

            <div className="border-t border-[#edf0f3] px-6 py-4">
              <div className="mb-3 rounded-lg bg-[#f8f9fb] p-3 text-xs leading-5 text-[#667085]">
                This dataset can be used to benchmark models,
                compare agent versions, detect regressions, and
                validate releases before production deployment.
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
                >
                  Close
                </button>

                <button
                  disabled={selectedDataset.status === "Running"}
                  onClick={() =>
                    runDataset(selectedDataset.id)
                  }
                  className="flex items-center gap-2 rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Zap size={15} />
                  Run Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[650px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Evaluation Dataset
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Create a reusable dataset for model and agent
                  evaluation.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <FormField label="Dataset name">
                <input
                  placeholder="Example: Customer Support Regression"
                  className="h-10 w-full rounded-lg border border-[#dfe3e8] px-3 text-sm outline-none focus:border-[#98a2b3]"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  placeholder="Describe what this dataset evaluates..."
                  className="min-h-[90px] w-full resize-none rounded-lg border border-[#dfe3e8] px-3 py-2 text-sm outline-none focus:border-[#98a2b3]"
                />
              </FormField>

              <FormField label="Dataset type">
                <SelectField
                  options={[
                    "Quality",
                    "RAG",
                    "Agents",
                    "Safety",
                    "Regression",
                    "Multimodal",
                    "Performance",
                  ]}
                />
              </FormField>

              <FormField label="Import source">
                <SelectField
                  options={[
                    "Create manually",
                    "Upload JSON",
                    "Upload CSV",
                    "Import production failures",
                    "Duplicate existing dataset",
                  ]}
                />
              </FormField>

              <div className="rounded-lg border border-dashed border-[#d0d5dd] bg-[#fafbfc] p-5 text-center">
                <Upload
                  size={20}
                  className="mx-auto text-[#667085]"
                />

                <div className="mt-2 text-sm font-medium">
                  Upload evaluation data
                </div>

                <div className="mt-1 text-xs text-[#98a2b3]">
                  JSON or CSV files can be imported into the
                  evaluation dataset.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0f3] px-6 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
              >
                Create Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
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
        <div className="text-xs font-medium text-[#667085]">
          {label}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-[25px] font-semibold tracking-[-0.5px]">
        {value}
      </div>

      <div className="mt-1 text-[11px] text-[#98a2b3]">
        {helper}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[135px] appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-8 text-xs font-medium text-[#475467] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085]"
      />
    </div>
  );
}

function SelectField({
  options,
}: {
  options: string[];
}) {
  return (
    <div className="relative">
      <select className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-sm outline-none focus:border-[#98a2b3]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
      />
    </div>
  );
}

function PassRate({
  value,
}: {
  value: number;
}) {
  if (value === 0) {
    return (
      <span className="text-xs font-medium text-[#98a2b3]">
        Not evaluated
      </span>
    );
  }

  const text =
    value >= 95
      ? "text-[#027a48]"
      : value >= 85
        ? "text-[#b54708]"
        : "text-[#d92d20]";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[70px] overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className="h-full rounded-full bg-[#12b76a]"
          style={{
            width: `${Math.min(value, 100)}%`,
          }}
        />
      </div>

      <span className={`text-sm font-semibold ${text}`}>
        {value}%
      </span>
    </div>
  );
}

function DatasetStatusBadge({
  status,
}: {
  status: DatasetStatus;
}) {
  const styles: Record<DatasetStatus, string> = {
    Ready: "bg-[#ecfdf3] text-[#027a48]",
    Running: "bg-[#eff8ff] text-[#175cd3]",
    Draft: "bg-[#f2f4f7] text-[#475467]",
    Failed: "bg-[#fef3f2] text-[#b42318]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  description,
  items,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-[#475467]"
          >
            <CheckCircle2
              size={13}
              className="text-[#12b76a]"
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#98a2b3]">
          {number}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#edf0f3] bg-[#fafbfc] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-[#344054]">
        {value}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#344054]">
        {label}
      </label>

      {children}
    </div>
  );
}