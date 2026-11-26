
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Gauge,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

type SlaStatus = "On track" | "At risk" | "Breached" | "Monitoring";
type ServiceCategory =
  | "AI Gateway"
  | "Agent Service"
  | "RAG Service"
  | "Platform API"
  | "Infrastructure";

type SlaRecord = {
  id: string;
  service: string;
  category: ServiceCategory;
  description: string;
  availabilityTarget: number;
  availabilityActual: number;
  latencyTarget: number;
  latencyActual: number;
  errorRateTarget: number;
  errorRateActual: number;
  errorBudgetRemaining: number;
  status: SlaStatus;
  incidents: number;
  owner: string;
  measurementWindow: string;
  lastUpdated: string;
  notes: string;
};

const initialRecords: SlaRecord[] = [
  {
    id: "SLA-001",
    service: "AI Gateway",
    category: "AI Gateway",
    description: "Primary API gateway responsible for routing model requests and provider traffic.",
    availabilityTarget: 99.9,
    availabilityActual: 99.96,
    latencyTarget: 500,
    latencyActual: 342,
    errorRateTarget: 1,
    errorRateActual: 0.42,
    errorBudgetRemaining: 82,
    status: "On track",
    incidents: 1,
    owner: "Platform Engineering",
    measurementWindow: "30 days",
    lastUpdated: "2026-11-17 12:30",
    notes: "Availability and latency targets are illustrative. Production evaluation requires verified telemetry and an agreed measurement methodology.",
  },
  {
    id: "SLA-002",
    service: "Agent Service",
    category: "Agent Service",
    description: "Execution and orchestration service for AI agents and multi-step workflows.",
    availabilityTarget: 99.9,
    availabilityActual: 99.91,
    latencyTarget: 1200,
    latencyActual: 980,
    errorRateTarget: 1,
    errorRateActual: 0.75,
    errorBudgetRemaining: 68,
    status: "On track",
    incidents: 2,
    owner: "AI Engineering",
    measurementWindow: "30 days",
    lastUpdated: "2026-11-17 12:25",
    notes: "Agent execution time should be measured separately from model provider response time.",
  },
  {
    id: "SLA-003",
    service: "RAG Service",
    category: "RAG Service",
    description: "Document ingestion, retrieval, embeddings, and contextual search services.",
    availabilityTarget: 99.9,
    availabilityActual: 99.72,
    latencyTarget: 800,
    latencyActual: 910,
    errorRateTarget: 1,
    errorRateActual: 1.18,
    errorBudgetRemaining: 34,
    status: "At risk",
    incidents: 4,
    owner: "Knowledge Platform Team",
    measurementWindow: "30 days",
    lastUpdated: "2026-11-17 12:20",
    notes: "Retrieval latency and ingestion latency should be tracked as separate service-level indicators.",
  },
  {
    id: "SLA-004",
    service: "Platform API",
    category: "Platform API",
    description: "Public and internal API endpoints used by the ModelNow platform.",
    availabilityTarget: 99.95,
    availabilityActual: 99.82,
    latencyTarget: 300,
    latencyActual: 410,
    errorRateTarget: 0.5,
    errorRateActual: 0.68,
    errorBudgetRemaining: 18,
    status: "Breached",
    incidents: 5,
    owner: "API Engineering",
    measurementWindow: "30 days",
    lastUpdated: "2026-11-17 12:15",
    notes: "Illustrative breach state. Actual breach determination requires an approved SLI definition and verified measurement window.",
  },
  {
    id: "SLA-005",
    service: "Infrastructure",
    category: "Infrastructure",
    description: "Core compute, network, and supporting infrastructure services.",
    availabilityTarget: 99.95,
    availabilityActual: 99.98,
    latencyTarget: 200,
    latencyActual: 145,
    errorRateTarget: 0.5,
    errorRateActual: 0.12,
    errorBudgetRemaining: 91,
    status: "On track",
    incidents: 0,
    owner: "Infrastructure Team",
    measurementWindow: "30 days",
    lastUpdated: "2026-11-17 12:10",
    notes: "Infrastructure availability should use defined dependency and maintenance exclusions.",
  },
  {
    id: "SLA-006",
    service: "Model Provider Routing",
    category: "AI Gateway",
    description: "Provider selection, routing fallback, and request failover.",
    availabilityTarget: 99.9,
    availabilityActual: 99.88,
    latencyTarget: 700,
    latencyActual: 670,
    errorRateTarget: 1,
    errorRateActual: 0.91,
    errorBudgetRemaining: 48,
    status: "Monitoring",
    incidents: 3,
    owner: "AI Infrastructure Team",
    measurementWindow: "30 days",
    lastUpdated: "2026-11-17 12:05",
    notes: "Provider-level and platform-level availability should not be conflated.",
  },
];

const statusOptions = [
  "All statuses",
  "On track",
  "At risk",
  "Breached",
  "Monitoring",
];

const serviceOptions = [
  "All services",
  "AI Gateway",
  "Agent Service",
  "RAG Service",
  "Platform API",
  "Infrastructure",
];

function StatusBadge({ status }: { status: SlaStatus }) {
  const styles: Record<SlaStatus, string> = {
    "On track": "border-emerald-200 bg-emerald-50 text-emerald-700",
    "At risk": "border-amber-200 bg-amber-50 text-amber-700",
    Breached: "border-red-200 bg-red-50 text-red-700",
    Monitoring: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const icons = {
    "On track": CheckCircle2,
    "At risk": AlertCircle,
    Breached: XCircle,
    Monitoring: Activity,
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <Icon size={13} />
      {status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="rounded-lg bg-gray-50 p-2 text-gray-600">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </article>
  );
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default function SlaPage() {
  const [records] = useState<SlaRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [serviceFilter, setServiceFilter] = useState("All services");
  const [period, setPeriod] = useState("30 days");
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">("ascending");
  const [selectedRecord, setSelectedRecord] = useState<SlaRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const matchesSearch =
          !query ||
          [
            record.id,
            record.service,
            record.category,
            record.owner,
            record.description,
          ].some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "All statuses" || record.status === statusFilter;

        const matchesService =
          serviceFilter === "All services" || record.category === serviceFilter;

        return matchesSearch && matchesStatus && matchesService;
      })
      .sort((a, b) =>
        sortOrder === "ascending"
          ? a.service.localeCompare(b.service)
          : b.service.localeCompare(a.service)
      );
  }, [records, search, statusFilter, serviceFilter, sortOrder]);

  const onTrack = records.filter((record) => record.status === "On track").length;
  const atRisk = records.filter((record) => record.status === "At risk").length;
  const breached = records.filter((record) => record.status === "Breached").length;
  const monitoring = records.filter((record) => record.status === "Monitoring").length;
  const totalIncidents = records.reduce((sum, record) => sum + record.incidents, 0);

  const averageAvailability =
    records.reduce((sum, record) => sum + record.availabilityActual, 0) / records.length;

  const averageBudget =
    records.reduce((sum, record) => sum + record.errorBudgetRemaining, 0) / records.length;

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const visibleRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setServiceFilter("All services");
    setPage(1);
  }

  function refreshData() {
    setRefreshing(true);
    setNotice("");

    window.setTimeout(() => {
      setRefreshing(false);
      setNotice(
        "Demonstration SLA data refreshed. Connect verified telemetry to load live service measurements."
      );
    }, 500);
  }

  function exportCSV() {
    const headers = [
      "SLA ID",
      "Service",
      "Category",
      "Owner",
      "Availability Target",
      "Availability Actual",
      "Latency Target (ms)",
      "Latency Actual (ms)",
      "Error Rate Target",
      "Error Rate Actual",
      "Error Budget Remaining",
      "Status",
      "Incidents",
      "Measurement Window",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.service,
      record.category,
      record.owner,
      String(record.availabilityTarget),
      String(record.availabilityActual),
      String(record.latencyTarget),
      String(record.latencyActual),
      String(record.errorRateTarget),
      String(record.errorRateActual),
      String(record.errorBudgetRemaining),
      record.status,
      String(record.incidents),
      record.measurementWindow,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `modelnow-sla-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setNotice(`${filteredRecords.length} illustrative SLA records exported.`);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-7 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Enterprise / Reliability / SLA
            </p>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-2.5">
                <Gauge size={23} className="text-gray-700" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
                Service Level Agreements
              </h1>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
              Define service objectives, monitor reliability indicators, track error budgets, and review service-level performance across ModelNow.
            </p>

            <Link
              href="/enterprise"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
            >
              <ArrowLeft size={16} />
              Enterprise overview
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4" role="note">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Live telemetry integration required
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                All measurements on this page are illustrative. Targets are not measured results. Connect verified monitoring data and an approved SLA calculation service before presenting contractual performance or breach status.
              </p>
            </div>
          </div>
        </section>

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Average availability"
            value={formatPercent(averageAvailability)}
            detail="Illustrative service average"
            icon={Activity}
          />
          <MetricCard
            label="Services on track"
            value={`${onTrack}/${records.length}`}
            detail="Within illustrative objectives"
            icon={CheckCircle2}
          />
          <MetricCard
            label="Services at risk"
            value={String(atRisk + breached)}
            detail={`${breached} illustrative breaches`}
            icon={AlertCircle}
          />
          <MetricCard
            label="Error budget remaining"
            value={`${averageBudget.toFixed(0)}%`}
            detail="Average illustrative budget"
            icon={Gauge}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-semibold text-gray-950">
                  Service reliability overview
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Distribution of illustrative SLA statuses
                </p>
              </div>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-gray-400"
              >
                {["24 hours", "7 days", "30 days", "90 days"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["On track", onTrack, "bg-emerald-500"],
                ["At risk", atRisk, "bg-amber-500"],
                ["Breached", breached, "bg-red-500"],
                ["Monitoring", monitoring, "bg-blue-500"],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="rounded-lg border border-gray-100 p-3">
                  <span className={`mb-3 block h-2 w-2 rounded-full ${color}`} />
                  <p className="text-2xl font-semibold text-gray-950">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-emerald-500" style={{ width: `${(onTrack / records.length) * 100}%` }} />
              <div className="bg-amber-500" style={{ width: `${(atRisk / records.length) * 100}%` }} />
              <div className="bg-red-500" style={{ width: `${(breached / records.length) * 100}%` }} />
              <div className="bg-blue-500" style={{ width: `${(monitoring / records.length) * 100}%` }} />
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Selected period: {period}. Historical time-series data is not connected.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-950">Incident summary</h2>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">
              {totalIncidents}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Illustrative incidents across services
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Services at risk</span>
                <span className="font-semibold text-amber-700">{atRisk}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Breached objectives</span>
                <span className="font-semibold text-red-700">{breached}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Under monitoring</span>
                <span className="font-semibold text-blue-700">{monitoring}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-950">Service objectives</h2>
              <p className="mt-1 text-xs text-gray-500">
                Review availability, latency, reliability, and error budgets by service
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${
                  showFilters
                    ? "border-gray-400 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={15} />
                Filters
                <ChevronDown size={14} />
              </button>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "ascending" ? "descending" : "ascending")
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowUpDown size={15} />
                Sort
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 p-5">
            <div className="relative max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search service, owner, SLA ID..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Service
                  </label>
                  <select
                    value={serviceFilter}
                    onChange={(e) => {
                      setServiceFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    {serviceOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {(search ||
              serviceFilter !== "All services" ||
              statusFilter !== "All statuses") && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs font-semibold text-gray-600 underline underline-offset-4 hover:text-gray-950"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-gray-50">
                <tr className="border-y border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5">Latency</th>
                  <th className="px-5 py-3.5">Error rate</th>
                  <th className="px-5 py-3.5">Error budget</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-500">{record.id}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{record.service}</p>
                      <p className="mt-1 text-xs text-gray-500">{record.owner}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {formatPercent(record.availabilityActual)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Target: {formatPercent(record.availabilityTarget)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">{record.latencyActual} ms</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Target: {record.latencyTarget} ms
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {record.errorRateActual.toFixed(2)}%
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Target: {record.errorRateTarget}%
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className={`text-sm font-semibold ${
                          record.errorBudgetRemaining < 25
                            ? "text-red-700"
                            : record.errorBudgetRemaining < 50
                              ? "text-amber-700"
                              : "text-emerald-700"
                        }`}
                      >
                        {record.errorBudgetRemaining}%
                      </p>
                      <div className="mt-2 w-24">
                        <ProgressBar
                          value={record.errorBudgetRemaining}
                          color={
                            record.errorBudgetRemaining < 25
                              ? "bg-red-500"
                              : record.errorBudgetRemaining < 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }
                        />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={record.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Search size={25} className="mx-auto text-gray-300" />
                      <p className="mt-3 text-sm font-semibold text-gray-700">
                        No matching services
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Change your search or filters and try again.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-xs font-semibold text-gray-700 underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">
              Showing{" "}
              {filteredRecords.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}
              –{Math.min(safePage * pageSize, filteredRecords.length)} of{" "}
              {filteredRecords.length} services
            </p>

            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600"
              >
                {[5, 10, 20].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  aria-label="Previous page"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>

                <span className="min-w-16 text-center text-xs text-gray-600">
                  Page {safePage} of {totalPages}
                </span>

                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                  aria-label="Next page"
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                SLA measurement requirements
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              {[
                ["Availability", "Define eligible requests, exclusions, downtime windows, and calculation methodology."],
                ["Latency", "Specify endpoint scope, percentile measurements, sampling, and time windows."],
                ["Error rate", "Define failed request classes and exclude client-side errors where appropriate."],
                ["Error budget", "Calculate remaining budget using validated SLO measurements and approved policies."],
              ].map(([title, description]) => (
                <div key={title} className="flex gap-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                Related enterprise areas
              </h2>
            </div>

            <nav className="mt-4 space-y-1">
              {[
                ["Audit Trail", "/enterprise/audit"],
                ["Security Controls", "/enterprise/security"],
                ["AI Governance", "/enterprise/governance"],
                ["Compliance Controls", "/enterprise/compliance"],
                ["Role-Based Access", "/enterprise/rbac"],
                ["Single Sign-On", "/enterprise/sso"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-950"
                >
                  {label}
                  <ExternalLink size={14} className="text-gray-400" />
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <p className="text-xs leading-5 text-gray-500">
          ModelNow Service Level Management · Demonstration records only.
          Contractual SLA reporting requires an agreed service definition,
          verified telemetry, documented exclusions, measurement windows, and
          auditable calculations.
        </p>
      </div>

      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRecord(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sla-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Service objective · {selectedRecord.id}
                </p>
                <h2 id="sla-detail-title" className="mt-2 text-lg font-semibold text-gray-950">
                  {selectedRecord.service}
                </h2>
                <p className="mt-1 text-xs text-gray-500">{selectedRecord.category}</p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedRecord.status} />
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  {selectedRecord.measurementWindow}
                </span>
              </div>

              <p className="text-sm leading-6 text-gray-600">
                {selectedRecord.description}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Availability target", formatPercent(selectedRecord.availabilityTarget)],
                  ["Illustrative availability", formatPercent(selectedRecord.availabilityActual)],
                  ["Latency target", `${selectedRecord.latencyTarget} ms`],
                  ["Illustrative latency", `${selectedRecord.latencyActual} ms`],
                  ["Error rate target", `${selectedRecord.errorRateTarget}%`],
                  ["Illustrative error rate", `${selectedRecord.errorRateActual}%`],
                  ["Error budget remaining", `${selectedRecord.errorBudgetRemaining}%`],
                  ["Incidents", String(selectedRecord.incidents)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-xs text-gray-500">Service owner</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {selectedRecord.owner}
                  </p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {selectedRecord.lastUpdated}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">Measurement notes</p>
                <p className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-600">
                  {selectedRecord.notes}
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex gap-2">
                  <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
                  <p className="text-xs leading-5 text-amber-800">
                    This record is illustrative. It must not be used as evidence
                    of actual service availability or contractual SLA performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
