
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileClock,
  FileText,
  Filter,
  FolderCheck,
  LockKeyhole,
  Search,
  ShieldCheck,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

type ControlStatus = "Implemented" | "In review" | "Needs attention" | "Not started";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type EvidenceStatus = "Current" | "Expiring" | "Missing";

type ComplianceControl = {
  id: string;
  title: string;
  description: string;
  framework: string;
  category: string;
  owner: string;
  status: ControlStatus;
  risk: RiskLevel;
  evidence: EvidenceStatus;
  evidenceCount: number;
  lastReviewed: string;
  nextReview: string;
  dueDate: string;
  notes: string;
};

const initialControls: ComplianceControl[] = [
  {
    id: "CC-001",
    title: "Access Control Management",
    description: "Ensure access to systems and sensitive resources is limited to authorized users.",
    framework: "SOC 2",
    category: "Access Management",
    owner: "Security Team",
    status: "Implemented",
    risk: "Low",
    evidence: "Current",
    evidenceCount: 8,
    lastReviewed: "2026-11-12",
    nextReview: "2026-12-12",
    dueDate: "2026-12-12",
    notes: "Access control evidence should include role assignments, approval records, and periodic access reviews.",
  },
  {
    id: "CC-002",
    title: "Multi-Factor Authentication",
    description: "Require additional authentication for privileged and sensitive access.",
    framework: "SOC 2",
    category: "Authentication",
    owner: "Identity Team",
    status: "Implemented",
    risk: "Low",
    evidence: "Current",
    evidenceCount: 6,
    lastReviewed: "2026-11-10",
    nextReview: "2026-12-10",
    dueDate: "2026-12-10",
    notes: "Review MFA enforcement, authentication policies, and exception records.",
  },
  {
    id: "CC-003",
    title: "Audit Logging and Monitoring",
    description: "Maintain records of relevant system and administrative activity.",
    framework: "ISO 27001",
    category: "Logging",
    owner: "Platform Team",
    status: "In review",
    risk: "Medium",
    evidence: "Current",
    evidenceCount: 4,
    lastReviewed: "2026-11-08",
    nextReview: "2026-11-25",
    dueDate: "2026-11-25",
    notes: "Verify audit event coverage, retention, integrity, and monitoring procedures.",
  },
  {
    id: "CC-004",
    title: "Data Encryption at Rest",
    description: "Protect stored data using approved encryption mechanisms.",
    framework: "ISO 27001",
    category: "Data Protection",
    owner: "Infrastructure Team",
    status: "Implemented",
    risk: "Low",
    evidence: "Current",
    evidenceCount: 5,
    lastReviewed: "2026-11-11",
    nextReview: "2026-12-11",
    dueDate: "2026-12-11",
    notes: "Collect configuration evidence and key-management references.",
  },
  {
    id: "CC-005",
    title: "Data Retention and Deletion",
    description: "Apply approved data retention periods and secure deletion procedures.",
    framework: "GDPR",
    category: "Data Protection",
    owner: "Privacy Team",
    status: "Needs attention",
    risk: "High",
    evidence: "Expiring",
    evidenceCount: 2,
    lastReviewed: "2026-10-15",
    nextReview: "2026-11-20",
    dueDate: "2026-11-20",
    notes: "Updated retention evidence and deletion verification are required.",
  },
  {
    id: "CC-006",
    title: "Incident Response Plan",
    description: "Maintain documented procedures for detecting and responding to security incidents.",
    framework: "SOC 2",
    category: "Incident Management",
    owner: "Security Team",
    status: "In review",
    risk: "Medium",
    evidence: "Current",
    evidenceCount: 3,
    lastReviewed: "2026-11-05",
    nextReview: "2026-11-28",
    dueDate: "2026-11-28",
    notes: "Review incident response procedures, escalation paths, and exercise records.",
  },
  {
    id: "CC-007",
    title: "Vendor Risk Assessment",
    description: "Evaluate third-party service providers and document associated risks.",
    framework: "ISO 27001",
    category: "Vendor Management",
    owner: "Compliance Team",
    status: "Not started",
    risk: "Critical",
    evidence: "Missing",
    evidenceCount: 0,
    lastReviewed: "Not reviewed",
    nextReview: "2026-11-22",
    dueDate: "2026-11-22",
    notes: "Vendor inventory and risk assessment evidence have not yet been recorded.",
  },
  {
    id: "CC-008",
    title: "Privacy Request Management",
    description: "Track and process data subject requests according to applicable requirements.",
    framework: "GDPR",
    category: "Privacy",
    owner: "Privacy Team",
    status: "Implemented",
    risk: "Low",
    evidence: "Current",
    evidenceCount: 7,
    lastReviewed: "2026-11-09",
    nextReview: "2026-12-09",
    dueDate: "2026-12-09",
    notes: "Review request handling records, verification, and response timelines.",
  },
  {
    id: "CC-009",
    title: "Backup and Recovery Testing",
    description: "Validate backup integrity and disaster recovery procedures.",
    framework: "SOC 2",
    category: "Business Continuity",
    owner: "Infrastructure Team",
    status: "Needs attention",
    risk: "High",
    evidence: "Missing",
    evidenceCount: 1,
    lastReviewed: "2026-10-20",
    nextReview: "2026-11-24",
    dueDate: "2026-11-24",
    notes: "Recovery test evidence and restoration verification need to be collected.",
  },
  {
    id: "CC-010",
    title: "Workforce Security Awareness",
    description: "Maintain awareness and training records for relevant personnel.",
    framework: "ISO 27001",
    category: "People Security",
    owner: "HR Team",
    status: "Implemented",
    risk: "Low",
    evidence: "Current",
    evidenceCount: 4,
    lastReviewed: "2026-11-13",
    nextReview: "2026-12-13",
    dueDate: "2026-12-13",
    notes: "Keep training completion and policy acknowledgement records current.",
  },
];

const frameworks = ["All frameworks", "SOC 2", "ISO 27001", "GDPR", "HIPAA"];
const statusOptions = ["All statuses", "Implemented", "In review", "Needs attention", "Not started"];
const riskOptions = ["All risk levels", "Low", "Medium", "High", "Critical"];

function StatusBadge({ status }: { status: ControlStatus }) {
  const styles: Record<ControlStatus, string> = {
    Implemented: "border-emerald-200 bg-emerald-50 text-emerald-700",
    "In review": "border-blue-200 bg-blue-50 text-blue-700",
    "Needs attention": "border-amber-200 bg-amber-50 text-amber-700",
    "Not started": "border-gray-200 bg-gray-100 text-gray-600",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Low: "bg-emerald-50 text-emerald-700",
    Medium: "bg-blue-50 text-blue-700",
    High: "bg-amber-50 text-amber-700",
    Critical: "bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${styles[risk]}`}>
      {risk}
    </span>
  );
}

function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  const styles: Record<EvidenceStatus, string> = {
    Current: "text-emerald-700",
    Expiring: "text-amber-700",
    Missing: "text-red-700",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${styles[status]}`}>
      {status === "Current" ? <CheckCircle2 size={13} /> : status === "Expiring" ? <Clock3 size={13} /> : <AlertCircle size={13} />}
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
  icon: typeof ShieldCheck;
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

function daysUntil(value: string) {
  if (value === "Not reviewed") return null;
  const date = new Date(`${value}T00:00:00`);
  return Math.ceil((date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
}

export default function CompliancePage() {
  const [controls, setControls] = useState(initialControls);
  const [activeFramework, setActiveFramework] = useState("All frameworks");
  const [activeTab, setActiveTab] = useState<"controls" | "evidence" | "reviews" | "exceptions">("controls");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [riskFilter, setRiskFilter] = useState("All risk levels");
  const [selectedControl, setSelectedControl] = useState<ComplianceControl | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<"ascending" | "descending">("ascending");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredControls = useMemo(() => {
    const query = search.trim().toLowerCase();

    return controls
      .filter((control) => {
        const matchesSearch =
          !query ||
          [control.id, control.title, control.description, control.owner, control.category]
            .some((value) => value.toLowerCase().includes(query));

        const matchesFramework =
          activeFramework === "All frameworks" || control.framework === activeFramework;

        const matchesStatus =
          statusFilter === "All statuses" || control.status === statusFilter;

        const matchesRisk =
          riskFilter === "All risk levels" || control.risk === riskFilter;

        return matchesSearch && matchesFramework && matchesStatus && matchesRisk;
      })
      .sort((a, b) =>
        sortOrder === "ascending"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );
  }, [controls, search, activeFramework, statusFilter, riskFilter, sortOrder]);

  const implemented = controls.filter((control) => control.status === "Implemented").length;
  const inReview = controls.filter((control) => control.status === "In review").length;
  const attention = controls.filter((control) => control.status === "Needs attention" || control.status === "Not started").length;
  const evidenceMissing = controls.filter((control) => control.evidence === "Missing").length;
  const exceptions = controls.filter((control) => control.risk === "Critical" || control.risk === "High").length;

  const evidenceRecords = controls.filter((control) => control.evidence !== "Missing");
  const reviewRecords = controls.filter((control) => control.status === "In review" || control.status === "Needs attention");
  const exceptionRecords = controls.filter((control) => control.risk === "Critical" || control.risk === "High");

  const tabRecords =
    activeTab === "evidence"
      ? filteredControls.filter((control) => control.evidence !== "Missing" || control.evidenceCount === 0)
      : activeTab === "reviews"
        ? filteredControls.filter((control) => control.status === "In review" || control.status === "Needs attention")
        : activeTab === "exceptions"
          ? filteredControls.filter((control) => control.risk === "Critical" || control.risk === "High")
          : filteredControls;

  const totalPages = Math.max(1, Math.ceil(tabRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleControls = tabRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  function clearFilters() {
    setSearch("");
    setActiveFramework("All frameworks");
    setStatusFilter("All statuses");
    setRiskFilter("All risk levels");
    setPage(1);
  }

  function exportCSV() {
    const headers = [
      "Control ID",
      "Control",
      "Framework",
      "Category",
      "Owner",
      "Status",
      "Risk",
      "Evidence Status",
      "Evidence Count",
      "Last Reviewed",
      "Next Review",
      "Due Date",
    ];

    const rows = tabRecords.map((control) => [
      control.id,
      control.title,
      control.framework,
      control.category,
      control.owner,
      control.status,
      control.risk,
      control.evidence,
      String(control.evidenceCount),
      control.lastReviewed,
      control.nextReview,
      control.dueDate,
    ]);

    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `modelnow-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`${tabRecords.length} illustrative compliance records exported.`);
  }

  function refreshData() {
    setRefreshing(true);
    setNotice("");
    window.setTimeout(() => {
      setRefreshing(false);
      setNotice("Demonstration compliance data refreshed. Connect the backend to load live assessment records.");
    }, 500);
  }

  function updateControlStatus(id: string, nextStatus: ControlStatus) {
    setControls((current) =>
      current.map((control) =>
        control.id === id ? { ...control, status: nextStatus } : control
      )
    );
    setSelectedControl((current) =>
      current?.id === id ? { ...current, status: nextStatus } : current
    );
    setNotice("Demo control status updated locally. A production implementation must save this change through an authorized backend.");
  }

  const currentTabLabel = {
    controls: "Control register",
    evidence: "Evidence register",
    reviews: "Assessment reviews",
    exceptions: "Exceptions and remediation",
  }[activeTab];

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-7 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Enterprise / Security / Compliance
            </p>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-2.5">
                <ShieldCheck size={23} className="text-gray-700" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Compliance Controls</h1>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
              Manage control ownership, assessment evidence, review workflows, and remediation activities across your organization.
            </p>
            <Link href="/enterprise" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950">
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
              <span className={refreshing ? "animate-spin" : ""}><Clock3 size={15} /></span>
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
              <p className="text-sm font-semibold text-amber-900">Compliance verification is pending</p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                This is an illustrative compliance workspace. Displayed controls and evidence do not establish certification or compliance with SOC 2, ISO 27001, GDPR, HIPAA, or any other standard. Authorized assessment and independent verification are required.
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
          <MetricCard label="Total controls" value={controls.length.toString()} detail="Controls in the demo register" icon={FolderCheck} />
          <MetricCard label="Implemented" value={implemented.toString()} detail={`${Math.round((implemented / controls.length) * 100)}% of listed controls`} icon={CheckCircle2} />
          <MetricCard label="Reviews pending" value={inReview.toString()} detail="Controls awaiting assessment" icon={FileClock} />
          <MetricCard label="Needs attention" value={attention.toString()} detail={`${evidenceMissing} controls with missing evidence`} icon={AlertCircle} />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-950">Control implementation</h2>
                <p className="mt-1 text-xs text-gray-500">Illustrative status distribution across the register</p>
              </div>
              <span className="text-xs text-gray-500">{controls.length} controls</span>
            </div>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-emerald-500" style={{ width: `${(implemented / controls.length) * 100}%` }} />
              <div className="bg-blue-500" style={{ width: `${(inReview / controls.length) * 100}%` }} />
              <div className="bg-amber-500" style={{ width: `${(controls.filter((c) => c.status === "Needs attention").length / controls.length) * 100}%` }} />
              <div className="bg-gray-300" style={{ width: `${(controls.filter((c) => c.status === "Not started").length / controls.length) * 100}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Implemented", implemented, "bg-emerald-500"],
                ["In review", inReview, "bg-blue-500"],
                ["Needs attention", controls.filter((c) => c.status === "Needs attention").length, "bg-amber-500"],
                ["Not started", controls.filter((c) => c.status === "Not started").length, "bg-gray-300"],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-950">Risk overview</h2>
            <p className="mt-1 text-xs text-gray-500">Controls requiring additional review</p>
            <div className="mt-4 space-y-4">
              {(["Critical", "High", "Medium", "Low"] as RiskLevel[]).map((risk) => {
                const count = controls.filter((control) => control.risk === risk).length;
                return (
                  <div key={risk}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-medium text-gray-700">{risk} risk</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${risk === "Critical" ? "bg-red-500" : risk === "High" ? "bg-amber-500" : risk === "Medium" ? "bg-blue-500" : "bg-emerald-500"}`}
                        style={{ width: `${(count / controls.length) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              {exceptions} high or critical risk controls in this sample.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-950">Compliance workspace</h2>
              <p className="mt-1 text-xs text-gray-500">Control register, evidence, reviews, and remediation</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-gray-500" htmlFor="framework-select">Framework</label>
              <select
                id="framework-select"
                value={activeFramework}
                onChange={(e) => { setActiveFramework(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              >
                {frameworks.map((framework) => <option key={framework}>{framework}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-5">
            {[
              ["controls", "Control register", FileCheck2],
              ["evidence", "Evidence", FileText],
              ["reviews", "Reviews", CalendarDays],
              ["exceptions", "Exceptions", AlertCircle],
            ].map(([key, label, Icon]) => (
              <button
                key={String(key)}
                onClick={() => { setActiveTab(key as typeof activeTab); setPage(1); }}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-medium transition-colors ${activeTab === key ? "border-gray-900 text-gray-950" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <Icon size={15} />
                {String(label)}
                {key === "reviews" && <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px]">{reviewRecords.length}</span>}
                {key === "exceptions" && <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px]">{exceptionRecords.length}</span>}
              </button>
            ))}
          </div>

          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search controls, owners, categories..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${showFilters ? "border-gray-400 bg-gray-100 text-gray-900" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  <Filter size={15} /> Filters <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => setSortOrder(sortOrder === "ascending" ? "descending" : "ascending")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {sortOrder === "ascending" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  Sort
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Control status</label>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none">
                    {statusOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Risk level</label>
                  <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none">
                    {riskOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
            )}

            {(search || activeFramework !== "All frameworks" || statusFilter !== "All statuses" || riskFilter !== "All risk levels") && (
              <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-gray-600 underline underline-offset-4 hover:text-gray-950">
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <p className="text-sm font-semibold text-gray-800">{currentTabLabel}</p>
            <p className="text-xs text-gray-500">{tabRecords.length} records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50">
                <tr className="border-y border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Control</th>
                  <th className="px-5 py-3.5">Framework</th>
                  <th className="px-5 py-3.5">Owner</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Risk</th>
                  <th className="px-5 py-3.5">Evidence</th>
                  <th className="px-5 py-3.5">Next review</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleControls.map((control) => (
                  <tr key={control.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-500">{control.id}</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{control.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{control.category}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{control.framework}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{control.owner}</td>
                    <td className="px-5 py-4"><StatusBadge status={control.status} /></td>
                    <td className="px-5 py-4"><RiskBadge risk={control.risk} /></td>
                    <td className="px-5 py-4">
                      <EvidenceBadge status={control.evidence} />
                      <p className="mt-1 text-xs text-gray-500">{control.evidenceCount} records</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-600">{control.nextReview}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedControl(control)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleControls.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Search size={25} className="mx-auto text-gray-300" />
                      <p className="mt-3 text-sm font-semibold text-gray-700">No matching records</p>
                      <p className="mt-1 text-xs text-gray-500">Try changing your framework, search, or filters.</p>
                      <button onClick={clearFilters} className="mt-3 text-xs font-semibold text-gray-700 underline">Clear filters</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">
              Showing {tabRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, tabRecords.length)} of {tabRecords.length} records
            </p>
            <div className="flex items-center gap-3">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600">
                {[5, 8, 10, 20].map((size) => <option key={size} value={size}>{size} per page</option>)}
              </select>
              <div className="flex items-center gap-1">
                <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} aria-label="Previous page" className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronLeft size={15} />
                </button>
                <span className="min-w-16 text-center text-xs text-gray-600">Page {safePage} of {totalPages}</span>
                <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} aria-label="Next page" className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FileCheck2 size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Evidence management</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Evidence should have a verified source, collection timestamp, covered period, owner, reviewer, and integrity metadata.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              <div><p className="text-xl font-semibold text-gray-900">{evidenceRecords.length}</p><p className="mt-1 text-xs text-gray-500">With records</p></div>
              <div><p className="text-xl font-semibold text-amber-700">{controls.filter((c) => c.evidence === "Expiring").length}</p><p className="mt-1 text-xs text-gray-500">Expiring</p></div>
              <div><p className="text-xl font-semibold text-red-700">{evidenceMissing}</p><p className="mt-1 text-xs text-gray-500">Missing</p></div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Upcoming reviews</h2>
            </div>
            <div className="mt-4 space-y-3">
              {controls
                .filter((control) => {
                  const days = daysUntil(control.nextReview);
                  return days !== null && days >= 0;
                })
                .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
                .slice(0, 3)
                .map((control) => (
                  <button
                    key={control.id}
                    onClick={() => setSelectedControl(control)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 text-left hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{control.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{control.owner} · {control.id}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-gray-600">{control.nextReview}</span>
                  </button>
                ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <LockKeyhole size={18} className="text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-900">Related enterprise areas</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Audit Trail", "/enterprise/audit"],
              ["Security Controls", "/enterprise/security"],
              ["AI Governance", "/enterprise/governance"],
              ["Role-Based Access", "/enterprise/rbac"],
              ["Single Sign-On", "/enterprise/sso"],
              ["Service Agreements", "/enterprise/sla"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                {label}
                <ExternalLink size={13} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs leading-5 text-gray-500">
          ModelNow Compliance Workspace · Demonstration records only. Compliance status must be determined using approved control mappings, authoritative evidence, documented assessment procedures, and authorized review.
        </p>
      </div>

      {selectedControl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedControl(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="compliance-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Control details · {selectedControl.id}</p>
                <h2 id="compliance-detail-title" className="mt-2 text-lg font-semibold text-gray-950">{selectedControl.title}</h2>
                <p className="mt-1 text-xs text-gray-500">{selectedControl.framework} · {selectedControl.category}</p>
              </div>
              <button onClick={() => setSelectedControl(null)} aria-label="Close details" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <p className="text-sm leading-6 text-gray-600">{selectedControl.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Control status</p>
                  <div className="mt-2"><StatusBadge status={selectedControl.status} /></div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Risk level</p>
                  <div className="mt-2"><RiskBadge risk={selectedControl.risk} /></div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Evidence status</p>
                  <div className="mt-2"><EvidenceBadge status={selectedControl.evidence} /></div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Evidence records</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{selectedControl.evidenceCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Control owner", selectedControl.owner],
                  ["Last reviewed", selectedControl.lastReviewed],
                  ["Next review", selectedControl.nextReview],
                  ["Due date", selectedControl.dueDate],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-gray-100 pb-3">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">Assessment notes</p>
                <p className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-600">{selectedControl.notes}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label htmlFor="control-status" className="mb-2 block text-xs font-semibold text-gray-700">Update demonstration status</label>
                <select
                  id="control-status"
                  value={selectedControl.status}
                  onChange={(e) => updateControlStatus(selectedControl.id, e.target.value as ControlStatus)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                >
                  {statusOptions.slice(1).map((option) => <option key={option}>{option}</option>)}
                </select>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  This changes only local demonstration state. Real control assessments require an authorized backend workflow and an auditable reviewer record.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-4">
              <button onClick={() => setSelectedControl(null)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
