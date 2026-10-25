"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Filter,
  Globe,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

type AuditStatus = "Success" | "Warning" | "Failed";

type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: string;
  action: string;
  resource: string;
  resourceType: string;
  ipAddress: string;
  location: string;
  status: AuditStatus;
  details: string;
};

const auditEvents: AuditEvent[] = [
  {
    id: "AUD-1001",
    timestamp: "Sep 20, 2026 · 10:42 AM",
    actor: "Pujitha",
    actorType: "Admin",
    action: "Updated security policy",
    resource: "Production Security Policy",
    resourceType: "Policy",
    ipAddress: "192.168.1.42",
    location: "Hyderabad, IN",
    status: "Success",
    details:
      "Updated authentication and session security requirements for the production environment.",
  },
  {
    id: "AUD-1002",
    timestamp: "Sep 20, 2026 · 10:18 AM",
    actor: "System",
    actorType: "Service",
    action: "Blocked authentication attempt",
    resource: "Admin Console",
    resourceType: "Application",
    ipAddress: "103.84.21.17",
    location: "Unknown",
    status: "Warning",
    details:
      "Authentication request was blocked because the request exceeded the configured security threshold.",
  },
  {
    id: "AUD-1003",
    timestamp: "Sep 20, 2026 · 09:56 AM",
    actor: "Rahul",
    actorType: "Developer",
    action: "Created API key",
    resource: "Production API",
    resourceType: "Credential",
    ipAddress: "10.20.14.8",
    location: "Bengaluru, IN",
    status: "Success",
    details:
      "A new API credential was created with restricted production access.",
  },
  {
    id: "AUD-1004",
    timestamp: "Sep 20, 2026 · 09:31 AM",
    actor: "System",
    actorType: "Service",
    action: "Failed permission check",
    resource: "Agent Builder",
    resourceType: "Application",
    ipAddress: "10.20.18.9",
    location: "Internal",
    status: "Failed",
    details:
      "A service request attempted to access a resource outside of its assigned permission scope.",
  },
  {
    id: "AUD-1005",
    timestamp: "Sep 20, 2026 · 08:47 AM",
    actor: "Priya",
    actorType: "Security",
    action: "Reviewed vulnerability",
    resource: "Browser Automation",
    resourceType: "Service",
    ipAddress: "10.20.4.18",
    location: "Chennai, IN",
    status: "Success",
    details:
      "Security review was completed for the browser automation service.",
  },
  {
    id: "AUD-1006",
    timestamp: "Sep 19, 2026 · 06:24 PM",
    actor: "Pujitha",
    actorType: "Admin",
    action: "Changed user role",
    resource: "Rahul",
    resourceType: "User",
    ipAddress: "192.168.1.42",
    location: "Hyderabad, IN",
    status: "Success",
    details:
      "User role was changed from Developer to Security Reviewer.",
  },
  {
    id: "AUD-1007",
    timestamp: "Sep 19, 2026 · 04:16 PM",
    actor: "System",
    actorType: "Service",
    action: "Guardrail triggered",
    resource: "Agent Runtime",
    resourceType: "Agent",
    ipAddress: "10.20.7.12",
    location: "Internal",
    status: "Warning",
    details:
      "A runtime request triggered a configured security guardrail and was sent for review.",
  },
  {
    id: "AUD-1008",
    timestamp: "Sep 19, 2026 · 02:08 PM",
    actor: "Anil",
    actorType: "Developer",
    action: "Exported audit report",
    resource: "Security Audit Report",
    resourceType: "Report",
    ipAddress: "10.20.12.4",
    location: "Pune, IN",
    status: "Success",
    details:
      "Security audit data was exported for compliance review.",
  },
];

const actionFilters = [
  "All actions",
  "Authentication",
  "Permissions",
  "API keys",
  "Security policy",
  "Guardrails",
  "Reports",
];

const statusFilters = ["All statuses", "Success", "Warning", "Failed"];

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [action, setAction] = useState("All actions");
  const [selectedEvent, setSelectedEvent] =
    useState<AuditEvent | null>(null);

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return auditEvents.filter((event) => {
      const matchesSearch =
        !query ||
        event.actor.toLowerCase().includes(query) ||
        event.action.toLowerCase().includes(query) ||
        event.resource.toLowerCase().includes(query) ||
        event.id.toLowerCase().includes(query) ||
        event.ipAddress.toLowerCase().includes(query);

      const matchesStatus =
        status === "All statuses" || event.status === status;

      const normalizedAction = event.action.toLowerCase();

      const matchesAction =
        action === "All actions" ||
        (action === "Authentication" &&
          normalizedAction.includes("authentication")) ||
        (action === "Permissions" &&
          (normalizedAction.includes("permission") ||
            normalizedAction.includes("role"))) ||
        (action === "API keys" &&
          normalizedAction.includes("api key")) ||
        (action === "Security policy" &&
          normalizedAction.includes("security policy")) ||
        (action === "Guardrails" &&
          normalizedAction.includes("guardrail")) ||
        (action === "Reports" &&
          normalizedAction.includes("report"));

      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [search, status, action]);

  const successCount = auditEvents.filter(
    (event) => event.status === "Success"
  ).length;

  const warningCount = auditEvents.filter(
    (event) => event.status === "Warning"
  ).length;

  const failedCount = auditEvents.filter(
    (event) => event.status === "Failed"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#2563eb]" />

                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Audit Logs
                </h1>
              </div>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Review security, authentication, permission, and governance
                activity across the platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[11px] font-medium text-[#475569] hover:bg-[#f8fafc]">
              <Download size={14} />
              Export logs
            </button>

            <button className="flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-3 text-[11px] font-medium text-white hover:bg-[#1d4ed8]">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-8 py-7">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total events"
            value={auditEvents.length.toString()}
            subtitle="Recent security activity"
            icon={<Activity size={18} />}
          />

          <MetricCard
            title="Successful"
            value={successCount.toString()}
            subtitle="Verified actions"
            icon={<CheckCircle2 size={18} />}
            tone="success"
          />

          <MetricCard
            title="Warnings"
            value={warningCount.toString()}
            subtitle="Requires attention"
            icon={<AlertTriangle size={18} />}
            tone="warning"
          />

          <MetricCard
            title="Failed"
            value={failedCount.toString()}
            subtitle="Blocked or rejected"
            icon={<XCircle size={18} />}
            tone="danger"
          />
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_350px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Security activity
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Every important security action is recorded for
                    traceability.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search audit logs..."
                      className="h-9 w-[210px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-8 pr-3 text-[11px] outline-none focus:border-[#93c5fd]"
                    />
                  </div>

                  <FilterSelect
                    value={status}
                    onChange={setStatus}
                    options={statusFilters}
                  />

                  <FilterSelect
                    value={action}
                    onChange={setAction}
                    options={actionFilters}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[145px_145px_minmax(0,1fr)_125px_110px_85px] gap-3 bg-[#fafafa] px-5 py-3 text-[9px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              <span>Time</span>
              <span>Actor</span>
              <span>Action / Resource</span>
              <span>IP / Location</span>
              <span>Status</span>
              <span>Details</span>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {filteredEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="grid w-full grid-cols-[145px_145px_minmax(0,1fr)_125px_110px_85px] items-center gap-3 px-5 py-4 text-left transition hover:bg-[#f8fafc]"
                >
                  <div>
                    <p className="text-[10px] font-medium text-[#475569]">
                      {event.timestamp.split(" · ")[0]}
                    </p>

                    <p className="mt-1 text-[9px] text-[#94a3b8]">
                      {event.timestamp.split(" · ")[1]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                      {event.actorType === "Service" ? (
                        <Activity size={13} />
                      ) : (
                        <UserRound size={13} />
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-[#334155]">
                        {event.actor}
                      </p>

                      <p className="mt-0.5 text-[9px] text-[#94a3b8]">
                        {event.actorType}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-[#334155]">
                      {event.action}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-[#94a3b8]">
                      {event.resource} · {event.resourceType}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-medium text-[#475569]">
                      {event.ipAddress}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-[#94a3b8]">
                      {event.location}
                    </p>
                  </div>

                  <StatusBadge status={event.status} />

                  <div className="flex justify-end">
                    <ArrowRight
                      size={14}
                      className="text-[#94a3b8]"
                    />
                  </div>
                </button>
              ))}

              {filteredEvents.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <FileText
                    size={28}
                    className="mx-auto text-[#cbd5e1]"
                  />

                  <p className="mt-3 text-[12px] font-medium text-[#64748b]">
                    No audit events found
                  </p>

                  <p className="mt-1 text-[10px] text-[#94a3b8]">
                    Try changing your search or filters.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <h2 className="text-[14px] font-semibold">
                  Audit configuration
                </h2>

                <p className="mt-1 text-[10px] text-[#94a3b8]">
                  Controls for audit event collection.
                </p>
              </div>

              <div className="space-y-1 px-5 py-3">
                <ConfigRow
                  icon={<Activity size={15} />}
                  title="Audit collection"
                  value="Enabled"
                  active
                />

                <ConfigRow
                  icon={<Clock3 size={15} />}
                  title="Retention"
                  value="365 days"
                />

                <ConfigRow
                  icon={<Lock size={15} />}
                  title="Immutable logs"
                  value="Enabled"
                  active
                />

                <ConfigRow
                  icon={<Download size={15} />}
                  title="Export access"
                  value="Restricted"
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <h2 className="text-[14px] font-semibold">
                  Event categories
                </h2>
              </div>

              <div className="space-y-3 p-5">
                <CategoryRow
                  icon={<KeyRound size={15} />}
                  label="Authentication"
                  value="18"
                />

                <CategoryRow
                  icon={<UserRound size={15} />}
                  label="User & roles"
                  value="12"
                />

                <CategoryRow
                  icon={<ShieldCheck size={15} />}
                  label="Security policies"
                  value="9"
                />

                <CategoryRow
                  icon={<Lock size={15} />}
                  label="Permissions"
                  value="7"
                />

                <CategoryRow
                  icon={<AlertTriangle size={15} />}
                  label="Guardrails"
                  value="5"
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-[#2563eb]"
                />

                <h3 className="text-[12px] font-semibold text-[#1e40af]">
                  Compliance readiness
                </h3>
              </div>

              <p className="mt-2 text-[10px] leading-4 text-[#3b82f6]">
                Audit events provide a traceable record of security,
                authentication, permission, and administrative activity.
              </p>

              <Link
                href="/agent-builder/security/reports"
                className="mt-4 flex items-center justify-between text-[10px] font-semibold text-[#2563eb]"
              >
                View security reports
                <ArrowRight size={13} />
              </Link>
            </section>
          </aside>
        </div>

        <section className="mt-5 grid grid-cols-4 gap-4">
          <InfoCard
            icon={<ShieldCheck size={17} />}
            title="Tamper protection"
            description="Audit records are designed to remain protected from unauthorized modification."
          />

          <InfoCard
            icon={<KeyRound size={17} />}
            title="Credential activity"
            description="Track API key creation, access changes, and authentication events."
          />

          <InfoCard
            icon={<UserRound size={17} />}
            title="Identity tracking"
            description="Associate important platform actions with users, services, and roles."
          />

          <InfoCard
            icon={<Globe size={17} />}
            title="Access visibility"
            description="Review IP address and location metadata for security investigations."
          />
        </section>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
          <div className="w-full max-w-[560px] rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <p className="text-[10px] font-medium text-[#94a3b8]">
                  Audit event
                </p>

                <h2 className="mt-1 text-[16px] font-semibold">
                  {selectedEvent.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]"
              >
                <span className="text-[19px] leading-none">×</span>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-[#eef2f7] bg-[#fafafa] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[#334155]">
                    {selectedEvent.action}
                  </p>

                  <StatusBadge status={selectedEvent.status} />
                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#64748b]">
                  {selectedEvent.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailRow
                  label="Actor"
                  value={`${selectedEvent.actor} · ${selectedEvent.actorType}`}
                />

                <DetailRow
                  label="Resource"
                  value={`${selectedEvent.resource} · ${selectedEvent.resourceType}`}
                />

                <DetailRow
                  label="Timestamp"
                  value={selectedEvent.timestamp}
                />

                <DetailRow
                  label="IP address"
                  value={selectedEvent.ipAddress}
                />

                <DetailRow
                  label="Location"
                  value={selectedEvent.location}
                />

                <DetailRow
                  label="Event ID"
                  value={selectedEvent.id}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e5e7eb] px-5 py-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="h-9 rounded-lg bg-[#2563eb] px-4 text-[11px] font-medium text-white hover:bg-[#1d4ed8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "bg-[#eff6ff] text-[#2563eb]",
    success: "bg-[#f0fdf4] text-[#16a34a]",
    warning: "bg-[#fffbeb] text-[#d97706]",
    danger: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClasses[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-[11px] text-[#64748b]">{title}</p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">{subtitle}</p>
    </div>
  );
}

function FilterSelect({
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
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[10px] font-medium text-[#475569] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AuditStatus;
}) {
  const styles = {
    Success: "bg-[#f0fdf4] text-[#15803d]",
    Warning: "bg-[#fffbeb] text-[#b45309]",
    Failed: "bg-[#fef2f2] text-[#b91c1c]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[9px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ConfigRow({
  icon,
  title,
  value,
  active,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-3 last:border-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#475569]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[#94a3b8]">{value}</p>
      </div>

      {active && (
        <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
      )}
    </div>
  );
}

function CategoryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[#64748b]">{icon}</span>

        <span className="text-[10px] font-medium text-[#475569]">
          {label}
        </span>
      </div>

      <span className="rounded-full bg-[#f8fafc] px-2 py-1 text-[9px] font-semibold text-[#64748b]">
        {value}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <h3 className="mt-3 text-[12px] font-semibold text-[#334155]">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-5 text-[#94a3b8]">
        {description}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#eef2f7] bg-[#fafafa] p-3">
      <p className="text-[9px] uppercase tracking-wide text-[#94a3b8]">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-medium leading-4 text-[#475569]">
        {value}
      </p>
    </div>
  );
}