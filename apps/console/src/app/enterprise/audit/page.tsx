
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileClock,
  Filter,
  Fingerprint,
  Globe,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

type AuditStatus = "Success" | "Failed" | "Blocked";
type AuditSeverity = "Info" | "Warning" | "Critical";

type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  email: string;
  action: string;
  category: string;
  resource: string;
  ip: string;
  location: string;
  status: AuditStatus;
  severity: AuditSeverity;
  correlationId: string;
  description: string;
};

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-2026-10482",
    timestamp: "2026-11-17T12:42:18",
    actor: "Pujitha Marikanti",
    email: "admin@modelnow.ai",
    action: "API key created",
    category: "API Keys",
    resource: "Production API Key",
    ip: "103.21.58.120",
    location: "Hyderabad, India",
    status: "Success",
    severity: "Info",
    correlationId: "corr-a81f92d4",
    description: "A new API key was created for the production workspace.",
  },
  {
    id: "AUD-2026-10481",
    timestamp: "2026-11-17T12:31:42",
    actor: "System Administrator",
    email: "security@modelnow.ai",
    action: "Role permissions updated",
    category: "Access Control",
    resource: "Organization Admin",
    ip: "103.21.58.120",
    location: "Hyderabad, India",
    status: "Success",
    severity: "Warning",
    correlationId: "corr-b72e31a9",
    description: "Role permissions were modified for the organization administrator.",
  },
  {
    id: "AUD-2026-10480",
    timestamp: "2026-11-17T11:58:09",
    actor: "Unknown User",
    email: "unknown@example.com",
    action: "Login attempt",
    category: "Authentication",
    resource: "Admin Portal",
    ip: "185.220.101.45",
    location: "Unknown",
    status: "Blocked",
    severity: "Critical",
    correlationId: "corr-c91f82e7",
    description: "An authentication attempt was blocked by the security policy.",
  },
  {
    id: "AUD-2026-10479",
    timestamp: "2026-11-17T11:24:36",
    actor: "Pujitha Marikanti",
    email: "admin@modelnow.ai",
    action: "Organization settings updated",
    category: "Organization",
    resource: "Production Workspace",
    ip: "103.21.58.120",
    location: "Hyderabad, India",
    status: "Success",
    severity: "Info",
    correlationId: "corr-d18f23a1",
    description: "Organization configuration settings were updated.",
  },
  {
    id: "AUD-2026-10478",
    timestamp: "2026-11-17T10:45:12",
    actor: "API Service",
    email: "system@modelnow.ai",
    action: "Policy evaluation failed",
    category: "Governance",
    resource: "Content Safety Policy",
    ip: "10.0.0.12",
    location: "Internal",
    status: "Failed",
    severity: "Warning",
    correlationId: "corr-e29a14b5",
    description: "A policy evaluation could not be completed successfully.",
  },
  {
    id: "AUD-2026-10477",
    timestamp: "2026-11-17T10:12:53",
    actor: "System Administrator",
    email: "security@modelnow.ai",
    action: "Security configuration changed",
    category: "Security",
    resource: "Authentication Policy",
    ip: "103.21.58.120",
    location: "Hyderabad, India",
    status: "Success",
    severity: "Warning",
    correlationId: "corr-f81d29c4",
    description: "Security configuration was updated.",
  },
  {
    id: "AUD-2026-10476",
    timestamp: "2026-11-17T09:38:22",
    actor: "Billing Service",
    email: "billing@modelnow.ai",
    action: "Credit transaction processed",
    category: "Billing",
    resource: "Organization Credits",
    ip: "10.0.0.15",
    location: "Internal",
    status: "Success",
    severity: "Info",
    correlationId: "corr-g72c18e2",
    description: "A credit transaction was successfully processed.",
  },
  {
    id: "AUD-2026-10475",
    timestamp: "2026-11-17T09:05:41",
    actor: "Unknown User",
    email: "unknown@example.com",
    action: "Password verification failed",
    category: "Authentication",
    resource: "Admin Portal",
    ip: "192.168.1.80",
    location: "Unknown",
    status: "Failed",
    severity: "Critical",
    correlationId: "corr-h31d92f7",
    description: "A password verification attempt failed.",
  },
  {
    id: "AUD-2026-10474",
    timestamp: "2026-11-17T08:42:15",
    actor: "Pujitha Marikanti",
    email: "admin@modelnow.ai",
    action: "Audit report viewed",
    category: "Audit",
    resource: "Audit Trail",
    ip: "103.21.58.120",
    location: "Hyderabad, India",
    status: "Success",
    severity: "Info",
    correlationId: "corr-i51e72d8",
    description: "The audit trail report was accessed.",
  },
  {
    id: "AUD-2026-10473",
    timestamp: "2026-11-17T08:14:09",
    actor: "Agent Service",
    email: "agent@modelnow.ai",
    action: "Agent configuration updated",
    category: "AI Platform",
    resource: "Support Agent",
    ip: "10.0.0.20",
    location: "Internal",
    status: "Success",
    severity: "Info",
    correlationId: "corr-j92f51a6",
    description: "An AI agent configuration was updated.",
  },
];

const categories = [
  "All categories",
  "Authentication",
  "API Keys",
  "Access Control",
  "Security",
  "Organization",
  "Governance",
  "Billing",
  "Audit",
  "AI Platform",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusBadge({ status }: { status: AuditStatus }) {
  const styles = {
    Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
    Blocked: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status === "Success" ? <CheckCircle2 size={13} /> : status === "Failed" ? <XCircle size={13} /> : <LockKeyhole size={13} />}
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const styles = {
    Info: "bg-slate-100 text-slate-600",
    Warning: "bg-amber-50 text-amber-700",
    Critical: "bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </article>
  );
}

export default function AuditPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [severity, setSeverity] = useState("All severities");
  const [dateRange, setDateRange] = useState("All time");
  const [sortDirection, setSortDirection] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.actor,
          event.email,
          event.action,
          event.resource,
          event.ip,
          event.correlationId,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesCategory = category === "All categories" || event.category === category;
      const matchesStatus = status === "All statuses" || event.status === status;
      const matchesSeverity = severity === "All severities" || event.severity === severity;

      const eventDate = new Date(event.timestamp);
      const now = new Date();
      const days = dateRange === "Last 24 hours" ? 1 : dateRange === "Last 7 days" ? 7 : dateRange === "Last 30 days" ? 30 : null;
      const matchesDate = days === null || eventDate >= new Date(now.getTime() - days * 86400000);

      return matchesSearch && matchesCategory && matchesStatus && matchesSeverity && matchesDate;
    });

    return filtered.sort((a, b) =>
      sortDirection === "newest"
        ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [events, search, category, status, severity, dateRange, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedEvents = filteredEvents.slice((safePage - 1) * pageSize, safePage * pageSize);

  const successfulEvents = events.filter((event) => event.status === "Success").length;
  const failedEvents = events.filter((event) => event.status === "Failed" || event.status === "Blocked").length;
  const criticalEvents = events.filter((event) => event.severity === "Critical").length;

  function resetFilters() {
    setSearch("");
    setCategory("All categories");
    setStatus("All statuses");
    setSeverity("All severities");
    setDateRange("All time");
    setPage(1);
  }

  function refreshEvents() {
    setRefreshing(true);
    setNotice("");
    window.setTimeout(() => {
      setRefreshing(false);
      setNotice("Demo audit records refreshed. Connect the audit API to load authoritative events.");
    }, 500);
  }

  function exportCSV() {
    const headers = [
      "Event ID",
      "Timestamp",
      "Actor",
      "Email",
      "Action",
      "Category",
      "Resource",
      "IP Address",
      "Location",
      "Status",
      "Severity",
      "Correlation ID",
      "Description",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.timestamp,
      event.actor,
      event.email,
      event.action,
      event.category,
      event.resource,
      event.ip,
      event.location,
      event.status,
      event.severity,
      event.correlationId,
      event.description,
    ]);

    const escapeCSV = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `modelnow-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`${filteredEvents.length} demo audit records exported.`);
  }

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] px-4 py-7 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Enterprise / Security / Audit
            </p>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-gray-200 bg-white p-2.5">
                <FileClock size={23} className="text-gray-700" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Audit Trail</h1>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
              Monitor administrative activity, investigate security events, and review a traceable record of platform operations.
            </p>
            <Link
              href="/enterprise"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
            >
              <ChevronLeft size={16} />
              Enterprise overview
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshEvents}
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
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Audit integration not connected</p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                The records below are illustrative frontend data. Connect a backend audit service for immutable event storage, server-side filtering, access controls, and verified exports.
              </p>
            </div>
          </div>
        </section>

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notice">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total events" value={events.length.toLocaleString()} description="Events in this demo dataset" icon={Activity} />
          <MetricCard title="Successful events" value={successfulEvents.toLocaleString()} description="Completed operations" icon={CheckCircle2} />
          <MetricCard title="Failed / blocked" value={failedEvents.toLocaleString()} description="Operations requiring attention" icon={AlertCircle} />
          <MetricCard title="Critical events" value={criticalEvents.toLocaleString()} description="High-priority security events" icon={ShieldCheck} />
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-950">Activity records</h2>
              <p className="mt-1 text-xs text-gray-500">
                Search and inspect recorded platform activity
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${showFilters ? "border-gray-400 bg-gray-100 text-gray-900" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                <Filter size={15} />
                Filters
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => setSortDirection(sortDirection === "newest" ? "oldest" : "newest")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {sortDirection === "newest" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                {sortDirection === "newest" ? "Newest first" : "Oldest first"}
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 p-5">
            <div className="relative max-w-xl">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search event ID, actor, action, resource, IP..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Category</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400">
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Status</label>
                  <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400">
                    {["All statuses", "Success", "Failed", "Blocked"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Severity</label>
                  <select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400">
                    {["All severities", "Info", "Warning", "Critical"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Time period</label>
                  <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(1); }} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400">
                    {["All time", "Last 24 hours", "Last 7 days", "Last 30 days"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
            )}

            {(category !== "All categories" || status !== "All statuses" || severity !== "All severities" || dateRange !== "All time" || search) && (
              <button onClick={resetFilters} className="mt-3 text-xs font-semibold text-gray-600 underline underline-offset-4 hover:text-gray-950">
                Clear all filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Action / Resource</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEvents.map((event) => (
                  <tr key={event.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-900">{event.id}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.category}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">{event.actor}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">{event.action}</p>
                      <p className="mt-1 text-xs text-gray-500">{event.resource}</p>
                    </td>
                    <td className="px-5 py-4"><SeverityBadge severity={event.severity} /></td>
                    <td className="px-5 py-4"><StatusBadge status={event.status} /></td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-600">{formatDate(event.timestamp)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedEvents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Search size={25} className="mx-auto text-gray-300" />
                      <p className="mt-3 text-sm font-semibold text-gray-700">No audit events found</p>
                      <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
                      <button onClick={resetFilters} className="mt-3 text-xs font-semibold text-gray-700 underline">Clear filters</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">
              Showing {filteredEvents.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredEvents.length)} of {filteredEvents.length} events
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-600 outline-none">
                {[5, 8, 10, 20].map((size) => <option key={size} value={size}>{size} per page</option>)}
              </select>
              <div className="flex items-center gap-1">
                <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft size={15} />
                </button>
                <span className="min-w-16 text-center text-xs text-gray-600">Page {safePage} of {totalPages}</span>
                <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40" aria-label="Next page">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Fingerprint size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Audit integrity requirements</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <LockKeyhole size={17} className="mt-0.5 shrink-0 text-gray-500" />
                <div><p className="text-sm font-medium text-gray-800">Access controlled</p><p className="mt-1 text-xs leading-5 text-gray-500">Restrict sensitive audit records to authorized roles and record access attempts.</p></div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-gray-500" />
                <div><p className="text-sm font-medium text-gray-800">Tamper resistant</p><p className="mt-1 text-xs leading-5 text-gray-500">Use append-only storage, integrity checks, and protected backups.</p></div>
              </div>
              <div className="flex gap-3">
                <Clock3 size={17} className="mt-0.5 shrink-0 text-gray-500" />
                <div><p className="text-sm font-medium text-gray-800">Retention policy</p><p className="mt-1 text-xs leading-5 text-gray-500">Enforce retention and deletion schedules through backend services.</p></div>
              </div>
              <div className="flex gap-3">
                <Download size={17} className="mt-0.5 shrink-0 text-gray-500" />
                <div><p className="text-sm font-medium text-gray-800">Export accountability</p><p className="mt-1 text-xs leading-5 text-gray-500">Authorize, log, and preserve the scope of every audit export.</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Related enterprise areas</h2>
            </div>
            <nav className="mt-4 space-y-1">
              {[
                ["Security Controls", "/enterprise/security"],
                ["AI Governance", "/enterprise/governance"],
                ["Compliance Controls", "/enterprise/compliance"],
                ["Role-Based Access", "/enterprise/rbac"],
                ["Single Sign-On", "/enterprise/sso"],
                ["Service Agreements", "/enterprise/sla"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-lg px-2.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-950">
                  {label}
                  <ExternalLink size={14} className="text-gray-400" />
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <p className="text-xs leading-5 text-gray-500">
          ModelNow Audit Trail · Demonstration records only. A production audit service must provide authoritative timestamps, actor attribution, immutable event storage, tenant isolation, server-side authorization, and auditable exports.
        </p>
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Audit event details</p>
                <h2 id="audit-detail-title" className="mt-2 text-lg font-semibold text-gray-950">{selectedEvent.action}</h2>
                <p className="mt-1 text-xs text-gray-500">{selectedEvent.id}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} aria-label="Close details" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-2"><StatusBadge status={selectedEvent.status} /></div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Severity</p>
                <div className="mt-2"><SeverityBadge severity={selectedEvent.severity} /></div>
              </div>
              {[
                ["Actor", selectedEvent.actor],
                ["Email", selectedEvent.email],
                ["Category", selectedEvent.category],
                ["Resource", selectedEvent.resource],
                ["IP address", selectedEvent.ip],
                ["Location", selectedEvent.location],
                ["Timestamp", formatDate(selectedEvent.timestamp)],
                ["Correlation ID", selectedEvent.correlationId],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-gray-100 pb-3">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 break-all text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-500">Event description</p>
                <p className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-700">{selectedEvent.description}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-4">
              <button onClick={() => setSelectedEvent(null)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
