
"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  LockKeyhole,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";

type Risk = "Critical" | "High" | "Medium" | "Low";
type Status = "Approved" | "Under review" | "Pending" | "Restricted";

type Asset = {
  id: string;
  name: string;
  type: string;
  owner: string;
  team: string;
  risk: Risk;
  status: Status;
  environment: string;
  lastReviewed: string;
  nextReview: string;
  description: string;
  policy: string;
};

const initialAssets: Asset[] = [
  {
    id: "AST-001",
    name: "ModelNow Chat",
    type: "Language model",
    owner: "AI Platform Team",
    team: "Engineering",
    risk: "High",
    status: "Approved",
    environment: "Production",
    lastReviewed: "2026-10-28",
    nextReview: "2026-12-01",
    description: "Primary conversational AI model used by the ModelNow platform.",
    policy: "POL-AI-001",
  },
  {
    id: "AST-002",
    name: "Customer Support Agent",
    type: "AI Agent",
    owner: "Customer Experience",
    team: "Operations",
    risk: "Medium",
    status: "Under review",
    environment: "Production",
    lastReviewed: "2026-10-20",
    nextReview: "2026-11-25",
    description: "Automates customer support workflows and response suggestions.",
    policy: "POL-AI-002",
  },
  {
    id: "AST-003",
    name: "Document Intelligence",
    type: "RAG workflow",
    owner: "Knowledge Team",
    team: "Engineering",
    risk: "High",
    status: "Pending",
    environment: "Staging",
    lastReviewed: "2026-10-15",
    nextReview: "2026-11-20",
    description: "Retrieves and summarizes information from enterprise documents.",
    policy: "POL-AI-003",
  },
  {
    id: "AST-004",
    name: "Internal Classification",
    type: "ML Model",
    owner: "Data Science",
    team: "Research",
    risk: "Low",
    status: "Approved",
    environment: "Production",
    lastReviewed: "2026-10-30",
    nextReview: "2027-01-15",
    description: "Classifies internal operational data for reporting workflows.",
    policy: "POL-AI-004",
  },
  {
    id: "AST-005",
    name: "Automated Decision Engine",
    type: "AI Agent",
    owner: "Risk Management",
    team: "Security",
    risk: "Critical",
    status: "Restricted",
    environment: "Restricted",
    lastReviewed: "2026-11-02",
    nextReview: "2026-11-21",
    description: "High-impact decision workflow requiring additional human oversight.",
    policy: "POL-AI-005",
  },
];

const reviews = [
  {
    id: "REV-1042",
    asset: "ModelNow Chat",
    reviewer: "AI Governance Team",
    date: "2026-11-15",
    result: "Completed",
  },
  {
    id: "REV-1041",
    asset: "Customer Support Agent",
    reviewer: "Security Team",
    date: "2026-11-13",
    result: "In progress",
  },
  {
    id: "REV-1040",
    asset: "Document Intelligence",
    reviewer: "Compliance Team",
    date: "2026-11-11",
    result: "Pending",
  },
];

const policies = [
  {
    id: "POL-AI-001",
    name: "AI Acceptable Use Policy",
    owner: "Governance",
    version: "2.1",
    status: "Active",
    updated: "2026-10-28",
  },
  {
    id: "POL-AI-002",
    name: "Human Oversight Policy",
    owner: "Risk Management",
    version: "1.4",
    status: "Active",
    updated: "2026-10-20",
  },
  {
    id: "POL-AI-003",
    name: "Model Evaluation Standard",
    owner: "AI Platform",
    version: "1.2",
    status: "Review required",
    updated: "2026-09-18",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Under review": "bg-blue-50 text-blue-700 ring-blue-200",
    "In progress": "bg-blue-50 text-blue-700 ring-blue-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    "Review required": "bg-amber-50 text-amber-700 ring-amber-200",
    Restricted: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
      styles[value] || "bg-gray-100 text-gray-600 ring-gray-200"
    )}>
      {value}
    </span>
  );
}

function RiskBadge({ value }: { value: Risk }) {
  const styles: Record<Risk, string> = {
    Critical: "bg-red-50 text-red-700",
    High: "bg-orange-50 text-orange-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", styles[value])}>
      {value}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={cn("rounded-lg p-2", accent)}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export default function GovernancePage() {
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Assets");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return assets
      .filter((asset) => {
        const matchesSearch =
          !query ||
          [
            asset.name,
            asset.id,
            asset.owner,
            asset.type,
            asset.team,
            asset.policy,
          ].some((value) => value.toLowerCase().includes(query));

        const matchesRisk = riskFilter === "All" || asset.risk === riskFilter;
        const matchesStatus = statusFilter === "All" || asset.status === statusFilter;

        return matchesSearch && matchesRisk && matchesStatus;
      })
      .sort((a, b) =>
        sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
  }, [assets, search, riskFilter, statusFilter, sortDirection]);

  const approved = assets.filter((asset) => asset.status === "Approved").length;
  const pending = assets.filter(
    (asset) => asset.status === "Pending" || asset.status === "Under review"
  ).length;
  const critical = assets.filter((asset) => asset.risk === "Critical").length;
  const restricted = assets.filter((asset) => asset.status === "Restricted").length;

  function refreshData() {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setNotice("Demo data refreshed. Connect the governance API for live records.");
    }, 500);
  }

  function exportCsv() {
    const headers = [
      "Asset ID",
      "Asset name",
      "Type",
      "Owner",
      "Team",
      "Risk",
      "Status",
      "Environment",
      "Policy",
      "Last reviewed",
      "Next review",
    ];

    const rows = filteredAssets.map((asset) => [
      asset.id,
      asset.name,
      asset.type,
      asset.owner,
      asset.team,
      asset.risk,
      asset.status,
      asset.environment,
      asset.policy,
      asset.lastReviewed,
      asset.nextReview,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-governance-assets.csv";
    link.click();

    URL.revokeObjectURL(url);
    setNotice("Governance inventory CSV exported.");
  }

  function updateAssetStatus(assetId: string, status: Status) {
    setAssets((current) =>
      current.map((asset) =>
        asset.id === assetId ? { ...asset, status } : asset
      )
    );

    setSelectedAsset((current) =>
      current?.id === assetId ? { ...current, status } : current
    );

    setNotice(`Demo status updated to ${status}. This change is not saved to a backend.`);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-7 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Link href="/enterprise" className="hover:text-gray-900">Enterprise</Link>
              <ChevronRight size={13} />
              <span>Governance</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              AI Governance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Govern AI assets, manage approvals, monitor policy compliance,
              and maintain accountability across your enterprise AI platform.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
              <Activity size={14} />
              Demonstration data · Backend integration required
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={exportCsv}
             className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              <Download size={15} />
              Export inventory
            </button>
          </div>
        </header>

        {notice && (
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notice">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Governed AI assets"
            value={String(assets.length)}
            detail="Registered models and workflows"
            icon={ShieldCheck}
            accent="bg-blue-50 text-blue-700"
          />
          <MetricCard
            label="Approved assets"
            value={String(approved)}
            detail="Approved for their listed scope"
            icon={CheckCircle2}
            accent="bg-emerald-50 text-emerald-700"
          />
          <MetricCard
            label="Pending reviews"
            value={String(pending)}
            detail="Awaiting governance action"
            icon={Clock3}
            accent="bg-amber-50 text-amber-700"
          />
          <MetricCard
            label="Critical risk assets"
            value={String(critical)}
            detail={`${restricted} currently restricted`}
            icon={ShieldAlert}
            accent="bg-red-50 text-red-700"
          />
        </section>

        {/* Risk and governance overview */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Risk distribution</h2>
                <p className="mt-1 text-xs text-gray-500">Registered AI assets by risk level</p>
              </div>
              <Shield size={19} className="text-gray-400" />
            </div>

            <div className="mt-6 space-y-5">
              {(["Critical", "High", "Medium", "Low"] as Risk[]).map((risk) => {
                const count = assets.filter((asset) => asset.risk === risk).length;
                const percentage = assets.length ? (count / assets.length) * 100 : 0;

                const barColors: Record<Risk, string> = {
                  Critical: "bg-red-500",
                  High: "bg-orange-500",
                  Medium: "bg-amber-400",
                  Low: "bg-emerald-500",
                };

                return (
                  <div key={risk}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{risk} risk</span>
                      <span className="text-gray-500">{count} assets · {Math.round(percentage)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full transition-all", barColors[risk])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Governance posture</h2>
            <p className="mt-1 text-xs text-gray-500">Current inventory status</p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Approved
                </span>
                <strong className="text-sm">{approved}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Under review
                </span>
                <strong className="text-sm">
                  {assets.filter((a) => a.status === "Under review").length}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Pending
                </span>
                <strong className="text-sm">
                  {assets.filter((a) => a.status === "Pending").length}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Restricted
                </span>
                <strong className="text-sm">{restricted}</strong>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="flex items-center gap-2 text-xs leading-5 text-gray-500">
                <LockKeyhole size={14} />
                Production approvals require authorized backend workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5">
            <div className="flex flex-wrap gap-6">
              {["Assets", "Policies", "Reviews", "Exceptions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  )}
                >
                  {tab}
                  {tab === "Assets" && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                      {assets.length}
                    </span>
                  )}
                  {tab === "Reviews" && (
                    <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      {pending}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Assets */}
          {activeTab === "Assets" && (
            <>
              <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">AI asset inventory</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Ownership, risk, deployment status, and review schedules
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-[200px] flex-1 lg:flex-none">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search assets..."
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
                    />
                  </div>

                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                    aria-label="Filter by risk"
                  >
                    <option value="All">All risks</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                    aria-label="Filter by status"
                  >
                    <option value="All">All statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Under review">Under review</option>
                    <option value="Pending">Pending</option>
                    <option value="Restricted">Restricted</option>
                  </select>

                  <button
                    onClick={() => setSortDirection((current) => current === "asc" ? "desc" : "asc")}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <ArrowUpDown size={14} />
                    Sort
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Asset</th>
                      <th className="px-5 py-3 font-semibold">Owner</th>
                      <th className="px-5 py-3 font-semibold">Risk</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Environment</th>
                      <th className="px-5 py-3 font-semibold">Next review</th>
                      <th className="px-5 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{asset.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{asset.id} · {asset.type}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{asset.owner}</p>
                          <p className="mt-1 text-xs text-gray-500">{asset.team}</p>
                        </td>
                        <td className="px-5 py-4"><RiskBadge value={asset.risk} /></td>
                        <td className="px-5 py-4"><StatusBadge value={asset.status} /></td>
                        <td className="px-5 py-4 text-gray-600">{asset.environment}</td>
                        <td className="px-5 py-4 text-gray-600">{asset.nextReview}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedAsset(asset)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredAssets.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-14 text-center">
                          <Search className="mx-auto mb-3 text-gray-300" size={24} />
                          <p className="font-medium text-gray-700">No matching assets</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Change your search or filter criteria.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Showing {filteredAssets.length} of {assets.length} assets</span>
                <span>Inventory records are demonstration data</span>
              </div>
            </>
          )}

          {/* Policies */}
          {activeTab === "Policies" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold">Governance policies</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Policy ownership, versioning, and review status
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Policy</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3">Last updated</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {policies.map((policy) => (
                      <tr key={policy.id}>
                        <td className="px-4 py-4">
                          <p className="font-medium">{policy.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{policy.id}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{policy.owner}</td>
                        <td className="px-4 py-4 text-gray-600">{policy.version}</td>
                        <td className="px-4 py-4 text-gray-600">{policy.updated}</td>
                        <td className="px-4 py-4"><StatusBadge value={policy.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === "Reviews" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold">Governance reviews</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review history and outstanding assessment activity
                </p>
              </div>

              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col justify-between gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-gray-100 p-2 text-gray-600">
                        <FileCheck2 size={18} />
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{review.asset}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {review.id} · {review.reviewer} · {review.date}
                        </p>
                      </div>
                    </div>
                    <StatusBadge value={review.result} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions */}
          {activeTab === "Exceptions" && (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 text-amber-500" size={28} />
              <h2 className="font-semibold text-gray-900">Policy exceptions</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                No exception records are available in this demonstration view.
                A production implementation should retrieve exception requests,
                approval history, expiry dates, and accountable owners from the backend.
              </p>
            </div>
          )}
        </section>

        {/* Related pages */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Related enterprise controls</h2>
          <p className="mt-1 text-xs text-gray-500">
            Navigate to connected governance and security areas.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Audit Trail", "/audit"],
              ["Compliance", "/compliance"],
              ["Security", "/security"],
              ["Role-Based Access Control", "/rbac"],
              ["Single Sign-On", "/sso"],
              ["Service Level Agreements", "/sla"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              >
                {label}
                <ExternalLink size={12} />
              </Link>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>ModelNow · AI Governance</span>
          <span>Governance status shown here is illustrative and is not evidence of regulatory compliance.</span>
        </footer>
      </div>

      {/* Asset detail modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAsset(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-modal-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-gray-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  AI asset details · {selectedAsset.id}
                </p>
                <h2 id="asset-modal-title" className="mt-2 text-xl font-semibold">
                  {selectedAsset.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{selectedAsset.type}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close asset details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              <p className="text-sm leading-6 text-gray-600">
                {selectedAsset.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Owner", selectedAsset.owner],
                  ["Team", selectedAsset.team],
                  ["Environment", selectedAsset.environment],
                  ["Policy", selectedAsset.policy],
                  ["Last reviewed", selectedAsset.lastReviewed],
                  ["Next review", selectedAsset.nextReview],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="mb-2 text-xs text-gray-500">Risk classification</p>
                  <RiskBadge value={selectedAsset.risk} />
                </div>
                <div>
                  <p className="mb-2 text-xs text-gray-500">Current status</p>
                  <StatusBadge value={selectedAsset.status} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-sm font-semibold">Demonstration status controls</p>
                <div className="flex flex-wrap gap-2">
                  {(["Approved", "Under review", "Pending", "Restricted"] as Status[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateAssetStatus(selectedAsset.id, status)}
                      disabled={selectedAsset.status === status}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-amber-700">
                  These controls update local demonstration state only.
                  A real approval requires backend authorization, validation, and audit logging.
                </p>
              </div>
            </div>

            <footer className="flex justify-end border-t border-gray-100 p-4">
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
