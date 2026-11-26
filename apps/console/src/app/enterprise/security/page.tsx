
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type SecurityStatus = "Protected" | "Monitoring" | "Review required" | "At risk";
type Severity = "Critical" | "High" | "Medium" | "Low";

type SecurityControl = {
  id: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  status: SecurityStatus;
  lastChecked: string;
  environment: string;
  recommendation: string;
};

type SecurityEvent = {
  id: string;
  event: string;
  category: string;
  severity: Severity;
  actor: string;
  timestamp: string;
  status: string;
};

const initialControls: SecurityControl[] = [
  {
    id: "SEC-001",
    name: "Multi-factor authentication",
    category: "Identity",
    description: "Require additional authentication verification for privileged and sensitive account access.",
    owner: "Identity Team",
    status: "Protected",
    lastChecked: "2026-11-16 09:30",
    environment: "Production",
    recommendation: "Verify MFA enforcement for all privileged accounts and review recovery procedures.",
  },
  {
    id: "SEC-002",
    name: "Session expiration",
    category: "Authentication",
    description: "Manage session lifetime, token expiration, refresh behavior, and session revocation.",
    owner: "Platform Security",
    status: "Protected",
    lastChecked: "2026-11-16 08:45",
    environment: "Production",
    recommendation: "Validate idle timeout, absolute session lifetime, and token revocation behavior.",
  },
  {
    id: "SEC-003",
    name: "API credential protection",
    category: "Credentials",
    description: "Protect API keys and provider credentials with controlled access, rotation, and secure storage.",
    owner: "AI Platform Team",
    status: "Monitoring",
    lastChecked: "2026-11-15 16:20",
    environment: "Production",
    recommendation: "Review credential access logs and verify secret rotation policies.",
  },
  {
    id: "SEC-004",
    name: "Tenant isolation",
    category: "Data protection",
    description: "Ensure organization-scoped resources are accessible only to authorized organization members.",
    owner: "Backend Engineering",
    status: "Protected",
    lastChecked: "2026-11-16 10:15",
    environment: "Production",
    recommendation: "Run cross-tenant authorization tests on all organization-scoped endpoints.",
  },
  {
    id: "SEC-005",
    name: "Privileged access review",
    category: "Access control",
    description: "Review administrator roles, elevated permissions, and privileged account activity.",
    owner: "Security Operations",
    status: "Review required",
    lastChecked: "2026-11-12 12:00",
    environment: "Production",
    recommendation: "Complete the pending administrator access review and document approval evidence.",
  },
  {
    id: "SEC-006",
    name: "Sensitive log redaction",
    category: "Data protection",
    description: "Prevent credentials, tokens, personal information, and sensitive payloads from appearing in logs.",
    owner: "Observability Team",
    status: "Monitoring",
    lastChecked: "2026-11-15 14:30",
    environment: "Production",
    recommendation: "Validate structured logging filters and test redaction with representative sensitive values.",
  },
  {
    id: "SEC-007",
    name: "Network security boundaries",
    category: "Infrastructure",
    description: "Restrict access to internal services and validate trusted network boundaries.",
    owner: "Infrastructure Team",
    status: "Protected",
    lastChecked: "2026-11-16 07:30",
    environment: "Production",
    recommendation: "Review ingress rules, service-to-service access, and administrative network restrictions.",
  },
  {
    id: "SEC-008",
    name: "Incident response readiness",
    category: "Operations",
    description: "Maintain incident escalation procedures, response ownership, and investigation evidence.",
    owner: "Security Operations",
    status: "At risk",
    lastChecked: "2026-11-10 11:00",
    environment: "Production",
    recommendation: "Review response ownership, escalation contacts, and incident recovery procedures.",
  },
];

const initialEvents: SecurityEvent[] = [
  {
    id: "EVT-9021",
    event: "Privileged access review required",
    category: "Access control",
    severity: "High",
    actor: "Security Operations",
    timestamp: "2026-11-16 10:42",
    status: "Open",
  },
  {
    id: "EVT-9020",
    event: "API credential rotation check",
    category: "Credentials",
    severity: "Medium",
    actor: "AI Platform Team",
    timestamp: "2026-11-16 09:18",
    status: "Investigating",
  },
  {
    id: "EVT-9019",
    event: "Session policy verification",
    category: "Authentication",
    severity: "Low",
    actor: "Identity Team",
    timestamp: "2026-11-15 17:25",
    status: "Resolved",
  },
  {
    id: "EVT-9018",
    event: "Incident response readiness review",
    category: "Operations",
    severity: "Critical",
    actor: "Security Operations",
    timestamp: "2026-11-15 14:10",
    status: "Open",
  },
];

const categories = [
  "All categories",
  "Identity",
  "Authentication",
  "Credentials",
  "Data protection",
  "Access control",
  "Infrastructure",
  "Operations",
];

function cn(...values: Array<string | false | undefined | null>) {
  return values.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Protected: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Monitoring: "bg-blue-50 text-blue-700 ring-blue-200",
    "Review required": "bg-amber-50 text-amber-700 ring-amber-200",
    "At risk": "bg-red-50 text-red-700 ring-red-200",
    Open: "bg-red-50 text-red-700 ring-red-200",
    Investigating: "bg-amber-50 text-amber-700 ring-amber-200",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  return (
    <span className={cn(
      "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
      styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
    )}>
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", styles[severity])}>
      {severity}
    </span>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={cn("rounded-lg p-2.5", iconClass)}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function SecurityPage() {
  const [controls, setControls] = useState(initialControls);
  const [events] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [activeTab, setActiveTab] = useState("Controls");
  const [selectedControl, setSelectedControl] = useState<SecurityControl | null>(null);
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredControls = useMemo(() => {
    const query = search.toLowerCase().trim();

    return controls
      .filter((control) => {
        const matchesSearch =
          !query ||
          [
            control.id,
            control.name,
            control.category,
            control.owner,
            control.description,
          ].some((value) => value.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === "All statuses" || control.status === statusFilter;

        const matchesCategory =
          categoryFilter === "All categories" || control.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) =>
        sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
  }, [controls, search, statusFilter, categoryFilter, sortDirection]);

  const protectedCount = controls.filter((c) => c.status === "Protected").length;
  const monitoringCount = controls.filter((c) => c.status === "Monitoring").length;
  const reviewCount = controls.filter((c) => c.status === "Review required").length;
  const riskCount = controls.filter((c) => c.status === "At risk").length;

  const openEvents = events.filter((e) => e.status === "Open").length;
  const criticalEvents = events.filter((e) => e.severity === "Critical").length;

  function handleRefresh() {
    setRefreshing(true);

    window.setTimeout(() => {
      setRefreshing(false);
      setNotice("Demonstration data refreshed. Live security data requires backend integration.");
    }, 500);
  }

  function exportCsv() {
    const headers = [
      "Control ID",
      "Control",
      "Category",
      "Owner",
      "Status",
      "Environment",
      "Last checked",
      "Recommendation",
    ];

    const rows = filteredControls.map((control) => [
      control.id,
      control.name,
      control.category,
      control.owner,
      control.status,
      control.environment,
      control.lastChecked,
      control.recommendation,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-security-controls.csv";
    link.click();

    URL.revokeObjectURL(url);
    setNotice("Security controls CSV exported.");
  }

  function updateControlStatus(id: string, status: SecurityStatus) {
    setControls((current) =>
      current.map((control) =>
        control.id === id ? { ...control, status } : control
      )
    );

    setSelectedControl((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setNotice(`Demonstration status changed to "${status}". This change is not saved to a backend.`);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-7 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* Page header */}
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Link href="/enterprise" className="hover:text-gray-900">
                Enterprise
              </Link>
              <ChevronRight size={13} />
              <span>Security</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Security Controls
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Monitor security controls, identity protection, credential
              management, organization boundaries, and operational security
              across your ModelNow environment.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
              <ShieldAlert size={14} />
              Demonstration data · Backend verification required
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              <Download size={15} />
              Export controls
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Security metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Security controls"
            value={String(controls.length)}
            description="Registered security checks"
            icon={ShieldCheck}
            iconClass="bg-blue-50 text-blue-700"
          />

          <MetricCard
            label="Protected controls"
            value={String(protectedCount)}
            description="Marked protected in demo inventory"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <MetricCard
            label="Reviews required"
            value={String(reviewCount)}
            description="Controls requiring attention"
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-700"
          />

          <MetricCard
            label="At-risk controls"
            value={String(riskCount)}
            description={`${criticalEvents} critical demo security events`}
            icon={AlertTriangle}
            iconClass="bg-red-50 text-red-700"
          />
        </section>

        {/* Security posture */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">Security control posture</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Distribution of registered controls by status
                </p>
              </div>
              <Shield size={20} className="text-gray-400" />
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  label: "Protected",
                  count: protectedCount,
                  color: "bg-emerald-500",
                },
                {
                  label: "Monitoring",
                  count: monitoringCount,
                  color: "bg-blue-500",
                },
                {
                  label: "Review required",
                  count: reviewCount,
                  color: "bg-amber-400",
                },
                {
                  label: "At risk",
                  count: riskCount,
                  color: "bg-red-500",
                },
              ].map((item) => {
                const percentage = controls.length
                  ? (item.count / controls.length) * 100
                  : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="text-gray-500">
                        {item.count} controls · {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full transition-all", item.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Security activity</h2>
                <p className="mt-1 text-xs text-gray-500">Demonstration event summary</p>
              </div>
              <Activity size={19} className="text-gray-400" />
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Open events
                </span>
                <strong className="text-sm">{openEvents}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Monitoring controls
                </span>
                <strong className="text-sm">{monitoringCount}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Controls under review
                </span>
                <strong className="text-sm">{reviewCount}</strong>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="flex items-start gap-2 text-xs leading-5 text-gray-500">
                <LockKeyhole size={14} className="mt-0.5 shrink-0" />
                Security enforcement must be performed by authorized backend services.
              </p>
            </div>
          </div>
        </section>

        {/* Main management area */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 px-5">
            {["Controls", "Security Events", "Access & Identity"].map((tab) => (
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
                {tab === "Controls" && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {controls.length}
                  </span>
                )}
                {tab === "Security Events" && (
                  <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                    {openEvents}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Controls tab */}
          {activeTab === "Controls" && (
            <>
              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-semibold text-gray-900">Security control inventory</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Review ownership, verification status, and security recommendations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-[190px] flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search controls..."
                      aria-label="Search security controls"
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                  >
                    <option>All statuses</option>
                    <option>Protected</option>
                    <option>Monitoring</option>
                    <option>Review required</option>
                    <option>At risk</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortDirection((current) => current === "asc" ? "desc" : "asc")
                    }
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
                      <th className="px-5 py-3 font-semibold">Security control</th>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Owner</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Environment</th>
                      <th className="px-5 py-3 font-semibold">Last checked</th>
                      <th className="px-5 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredControls.map((control) => (
                      <tr key={control.id} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{control.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{control.id}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{control.category}</td>
                        <td className="px-5 py-4 text-gray-600">{control.owner}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={control.status} />
                        </td>
                        <td className="px-5 py-4 text-gray-600">{control.environment}</td>
                        <td className="px-5 py-4 text-gray-600">{control.lastChecked}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedControl(control)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredControls.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-14 text-center">
                          <Search size={24} className="mx-auto mb-3 text-gray-300" />
                          <p className="font-medium text-gray-700">No matching controls</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Try changing your search or filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-between gap-2 border-t border-gray-100 px-5 py-3 text-xs text-gray-500 sm:flex-row">
                <span>Showing {filteredControls.length} of {controls.length} controls</span>
                <span>Demonstration inventory · Not live verification data</span>
              </div>
            </>
          )}

          {/* Security events tab */}
          {activeTab === "Security Events" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold text-gray-900">Security events</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Illustrative security monitoring and incident records
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{event.event}</p>
                          <p className="mt-1 text-xs text-gray-500">{event.id}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{event.category}</td>
                        <td className="px-4 py-4">
                          <SeverityBadge severity={event.severity} />
                        </td>
                        <td className="px-4 py-4 text-gray-600">{event.actor}</td>
                        <td className="px-4 py-4 text-gray-600">{event.timestamp}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={event.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Identity tab */}
          {activeTab === "Access & Identity" && (
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {[
                {
                  icon: Users,
                  title: "Identity and authentication",
                  description: "Authentication policies, MFA, session lifecycle, and account verification.",
                  links: [{ label: "Single Sign-On", href: "/enterprise/sso" }],
                },
                {
                  icon: KeyRound,
                  title: "API credentials",
                  description: "Credential lifecycle, access restrictions, secret storage, and rotation.",
                  links: [{ label: "API Keys", href: "/keys-access" }],
                },
                {
                  icon: LockKeyhole,
                  title: "Role-based permissions",
                  description: "Administrative privileges, role assignments, and authorization boundaries.",
                  links: [{ label: "Role-Based Access Control", href: "/enterprise/rbac" }],
                },
                {
                  icon: Server,
                  title: "Audit and traceability",
                  description: "Security event records, administrative actions, and investigation history.",
                  links: [{ label: "Audit Trail", href: "/enterprise/audit" }],
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-xl border border-gray-200 p-5">
                    <span className="inline-flex rounded-lg bg-gray-100 p-2.5 text-gray-700">
                      <Icon size={19} />
                    </span>
                    <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
                    <div className="mt-4">
                      {item.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 hover:underline"
                        >
                          {link.label}
                          <ExternalLink size={12} />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Related security areas */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Related enterprise controls</h2>
          <p className="mt-1 text-xs text-gray-500">
            Access connected security, governance, and compliance areas.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Audit Trail", "/enterprise/audit"],
              ["AI Governance", "/enterprise/governance"],
              ["Compliance", "/enterprise/compliance"],
              ["Role-Based Access Control", "/enterprise/rbac"],
              ["Single Sign-On", "/enterprise/sso"],
              ["Service Level Agreements", "/enterprise/sla"],
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

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-2 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-500 sm:flex-row">
          <span>ModelNow · Enterprise Security</span>
          <span>
            Displayed statuses are illustrative and do not establish security certification or enforcement.
          </span>
        </footer>
      </div>

      {/* Control details modal */}
      {selectedControl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedControl(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="security-detail-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-gray-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Security control · {selectedControl.id}
                </p>
                <h2 id="security-detail-title" className="mt-2 text-xl font-semibold text-gray-900">
                  {selectedControl.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{selectedControl.category}</p>
              </div>

              <button
                onClick={() => setSelectedControl(null)}
                aria-label="Close control details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              <p className="text-sm leading-6 text-gray-600">
                {selectedControl.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Control owner", selectedControl.owner],
                  ["Category", selectedControl.category],
                  ["Environment", selectedControl.environment],
                  ["Last checked", selectedControl.lastChecked],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Current status
                </p>
                <StatusBadge status={selectedControl.status} />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Recommended action</p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {selectedControl.recommendation}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Demonstration status controls
                </p>

                <div className="flex flex-wrap gap-2">
                  {(
                    ["Protected", "Monitoring", "Review required", "At risk"] as SecurityStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateControlStatus(selectedControl.id, status)}
                      disabled={selectedControl.status === status}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-5 text-amber-700">
                  These buttons only change local demonstration data. They do not
                  enable, disable, or enforce actual security controls.
                </p>
              </div>
            </div>

            <footer className="flex justify-end border-t border-gray-100 p-4">
              <button
                onClick={() => setSelectedControl(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
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
