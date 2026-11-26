
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  KeyRound,
  Eye,
  X,
  CalendarDays,
  Filter,
  AlertTriangle,
  FileText,
} from "lucide-react";

type AuditAction =
  | "Permission Granted"
  | "Permission Updated"
  | "Permission Revoked"
  | "Access Denied"
  | "Approval Requested"
  | "Approval Completed"
  | "Policy Changed";

type AuditOutcome = "Success" | "Denied" | "Pending" | "Failed";

type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  action: AuditAction;
  target: string;
  resource: string;
  scope: string;
  outcome: AuditOutcome;
  ipAddress: string;
  requestId: string;
  details: string;
};

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-8001",
    timestamp: "2026-11-03T09:42:18",
    actor: "Pujitha Marikanti",
    actorEmail: "pujitha@modelnow.example",
    action: "Permission Granted",
    target: "Security Admin",
    resource: "API Keys",
    scope: "Organization",
    outcome: "Success",
    ipAddress: "192.0.2.21",
    requestId: "req_7f31a8",
    details:
      "A permission assignment was created for the Security Admin role.",
  },
  {
    id: "AUD-8002",
    timestamp: "2026-11-03T09:35:04",
    actor: "Arjun Rao",
    actorEmail: "arjun@modelnow.example",
    action: "Access Denied",
    target: "Arjun Rao",
    resource: "Platform Settings",
    scope: "Global",
    outcome: "Denied",
    ipAddress: "192.0.2.45",
    requestId: "req_8a12c4",
    details:
      "The requested operation did not meet the required permission checks.",
  },
  {
    id: "AUD-8003",
    timestamp: "2026-11-03T09:18:52",
    actor: "Super Admin",
    actorEmail: "admin@modelnow.example",
    action: "Policy Changed",
    target: "Production Access Policy",
    resource: "Access Policies",
    scope: "Global",
    outcome: "Success",
    ipAddress: "192.0.2.10",
    requestId: "req_9b20d7",
    details:
      "A demo access policy was updated. Review the policy version and change record in the production audit service.",
  },
  {
    id: "AUD-8004",
    timestamp: "2026-11-03T08:54:31",
    actor: "Priya Sharma",
    actorEmail: "priya@modelnow.example",
    action: "Approval Requested",
    target: "Priya Sharma",
    resource: "Billing",
    scope: "Organization",
    outcome: "Pending",
    ipAddress: "192.0.2.72",
    requestId: "req_0c41fe",
    details:
      "An access change was submitted and is awaiting an authorized reviewer.",
  },
  {
    id: "AUD-8005",
    timestamp: "2026-11-03T08:40:09",
    actor: "Security Admin",
    actorEmail: "security@modelnow.example",
    action: "Permission Revoked",
    target: "Rahul Kumar",
    resource: "Agents",
    scope: "Workspace",
    outcome: "Success",
    ipAddress: "192.0.2.30",
    requestId: "req_4d19b2",
    details:
      "A demo permission assignment was marked as revoked.",
  },
  {
    id: "AUD-8006",
    timestamp: "2026-11-02T17:26:41",
    actor: "Admin",
    actorEmail: "admin@modelnow.example",
    action: "Permission Updated",
    target: "Analyst",
    resource: "Usage Analytics",
    scope: "Workspace",
    outcome: "Success",
    ipAddress: "192.0.2.18",
    requestId: "req_6e32aa",
    details:
      "A role permission was updated in the demo audit dataset.",
  },
  {
    id: "AUD-8007",
    timestamp: "2026-11-02T16:12:05",
    actor: "Finance Admin",
    actorEmail: "finance@modelnow.example",
    action: "Approval Completed",
    target: "Priya Sharma",
    resource: "Billing",
    scope: "Organization",
    outcome: "Success",
    ipAddress: "192.0.2.73",
    requestId: "req_1a50cb",
    details:
      "An approval workflow was marked complete in the demo dataset.",
  },
  {
    id: "AUD-8008",
    timestamp: "2026-11-02T14:09:33",
    actor: "Arjun Rao",
    actorEmail: "arjun@modelnow.example",
    action: "Access Denied",
    target: "Arjun Rao",
    resource: "API Keys",
    scope: "Organization",
    outcome: "Denied",
    ipAddress: "192.0.2.45",
    requestId: "req_3b17ef",
    details:
      "The request was denied because the demo event records insufficient access.",
  },
  {
    id: "AUD-8009",
    timestamp: "2026-11-01T11:22:47",
    actor: "Super Admin",
    actorEmail: "admin@modelnow.example",
    action: "Permission Granted",
    target: "Knowledge Manager",
    resource: "Knowledge Hub",
    scope: "Workspace",
    outcome: "Success",
    ipAddress: "192.0.2.10",
    requestId: "req_5c91ad",
    details:
      "A demo permission assignment was created for Knowledge Hub.",
  },
  {
    id: "AUD-8010",
    timestamp: "2026-11-01T10:06:14",
    actor: "Admin",
    actorEmail: "admin@modelnow.example",
    action: "Approval Requested",
    target: "AI Admin",
    resource: "AI Models",
    scope: "Workspace",
    outcome: "Pending",
    ipAddress: "192.0.2.18",
    requestId: "req_2d84f6",
    details:
      "A request for a permission change is awaiting review.",
  },
  {
    id: "AUD-8011",
    timestamp: "2026-10-31T15:48:29",
    actor: "Security Admin",
    actorEmail: "security@modelnow.example",
    action: "Permission Updated",
    target: "Pujitha Marikanti",
    resource: "Users",
    scope: "Global",
    outcome: "Success",
    ipAddress: "192.0.2.21",
    requestId: "req_7a02d1",
    details:
      "A user permission record was updated in the demo dataset.",
  },
  {
    id: "AUD-8012",
    timestamp: "2026-10-30T12:17:56",
    actor: "Unknown User",
    actorEmail: "unknown@modelnow.example",
    action: "Access Denied",
    target: "Unknown User",
    resource: "Admin Console",
    scope: "Global",
    outcome: "Denied",
    ipAddress: "192.0.2.99",
    requestId: "req_0f73d8",
    details:
      "An unauthenticated or unrecognized principal was denied access in this sample event.",
  },
];

const actions: AuditAction[] = [
  "Permission Granted",
  "Permission Updated",
  "Permission Revoked",
  "Access Denied",
  "Approval Requested",
  "Approval Completed",
  "Policy Changed",
];

const outcomes: AuditOutcome[] = [
  "Success",
  "Denied",
  "Pending",
  "Failed",
];

const blue = "#315fea";

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#111827",
  fontSize: 12,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#374151",
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
};

function outcomeStyle(outcome: AuditOutcome): CSSProperties {
  if (outcome === "Success") {
    return { color: "#15803d", background: "#dcfce7" };
  }

  if (outcome === "Denied" || outcome === "Failed") {
    return { color: "#b91c1c", background: "#fee2e2" };
  }

  return { color: "#a16207", background: "#fef3c7" };
}

function actionColor(action: AuditAction) {
  if (action === "Access Denied") return "#dc2626";
  if (action === "Permission Revoked") return "#b91c1c";
  if (action === "Approval Requested") return "#a16207";
  if (action === "Approval Completed") return "#15803d";
  if (action === "Policy Changed") return "#7c3aed";
  return blue;
}

function formatTimestamp(value: string) {
  return value.replace("T", " ");
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function PermissionAuditLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [outcomeFilter, setOutcomeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.actor,
        event.actorEmail,
        event.action,
        event.target,
        event.resource,
        event.scope,
        event.outcome,
        event.ipAddress,
        event.requestId,
        event.details,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const matchesAction =
        actionFilter === "All" || event.action === actionFilter;
      const matchesOutcome =
        outcomeFilter === "All" || event.outcome === outcomeFilter;

      const eventDate = event.timestamp.slice(0, 10);
      const today = "2026-11-03";
      const yesterday = "2026-11-02";
      const matchesDate =
        dateFilter === "All" ||
        (dateFilter === "Today" && eventDate === today) ||
        (dateFilter === "Yesterday" && eventDate === yesterday) ||
        (dateFilter === "Older" &&
          eventDate !== today &&
          eventDate !== yesterday);

      return matchesSearch && matchesAction && matchesOutcome && matchesDate;
    });
  }, [events, search, actionFilter, outcomeFilter, dateFilter]);

  const deniedCount = events.filter(
    (event) => event.outcome === "Denied"
  ).length;

  const successCount = events.filter(
    (event) => event.outcome === "Success"
  ).length;

  const pendingCount = events.filter(
    (event) => event.outcome === "Pending"
  ).length;

  const policyChangeCount = events.filter(
    (event) => event.action === "Policy Changed"
  ).length;

  function resetDemo() {
    setEvents(initialEvents);
    setSearch("");
    setActionFilter("All");
    setOutcomeFilter("All");
    setDateFilter("All");
    setSelected(null);
    setNotice("Sample audit events restored.");
  }

  function exportCsv() {
    const headers = [
      "Event ID",
      "Timestamp",
      "Actor",
      "Actor Email",
      "Action",
      "Target",
      "Resource",
      "Scope",
      "Outcome",
      "IP Address",
      "Request ID",
      "Details",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.timestamp,
      event.actor,
      event.actorEmail,
      event.action,
      event.target,
      event.resource,
      event.scope,
      event.outcome,
      event.ipAddress,
      event.requestId,
      event.details,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-permission-audit-logs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice(`${filteredEvents.length} filtered audit events exported.`);
  }

  const metricCards = [
    {
      label: "Total events",
      value: events.length,
      description: "Events in this demo dataset",
      icon: ClipboardList,
      color: blue,
      bg: "#eff6ff",
    },
    {
      label: "Successful actions",
      value: successCount,
      description: "Recorded successful outcomes",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#dcfce7",
    },
    {
      label: "Access denied",
      value: deniedCount,
      description: "Events marked as denied",
      icon: XCircle,
      color: "#b91c1c",
      bg: "#fee2e2",
    },
    {
      label: "Pending approvals",
      value: pendingCount,
      description: "Events awaiting review",
      icon: Clock3,
      color: "#a16207",
      bg: "#fef3c7",
    },
  ];

  const cardStyle: CSSProperties = {
    padding: 18,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 26,
        background: "#f8fafc",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                color: blue,
                fontSize: 12,
                fontWeight: 750,
              }}
            >
              <ShieldCheck size={16} />
              MODELNOW ADMIN / PERMISSIONS
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 750,
                letterSpacing: "-.8px",
              }}
            >
              Permission Audit Logs
            </h1>

            <p
              style={{
                maxWidth: 760,
                margin: "8px 0 0",
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              Review permission changes, access denials, approval activity,
              and policy updates in one searchable audit timeline.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button
              type="button"
              style={buttonStyle}
              onClick={resetDemo}
            >
              <RefreshCw size={15} />
              Reset demo
            </button>

            <button
              type="button"
              style={{
                ...buttonStyle,
                color: "#fff",
                background: blue,
                borderColor: blue,
              }}
              onClick={exportCsv}
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "11px 14px",
              marginBottom: 16,
              border: "1px solid #bfdbfe",
              borderRadius: 9,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
            }}
          >
            {notice}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {metric.label}
                  </span>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 9,
                      color: metric.color,
                      background: metric.bg,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 28,
                    fontWeight: 750,
                    letterSpacing: "-.5px",
                  }}
                >
                  {metric.value}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: "#9ca3af",
                    fontSize: 11,
                  }}
                >
                  {metric.description}
                </div>
              </div>
            );
          })}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: "#374151",
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              <AlertTriangle size={16} color="#b91c1c" />
              Access denials
            </div>
            <div style={{ fontSize: 23, fontWeight: 750, marginTop: 12 }}>
              {deniedCount}
            </div>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 11,
                lineHeight: 1.6,
                margin: "5px 0 0",
              }}
            >
              Review denied requests for unexpected access patterns.
            </p>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: "#374151",
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              <Clock3 size={16} color="#a16207" />
              Pending approvals
            </div>
            <div style={{ fontSize: 23, fontWeight: 750, marginTop: 12 }}>
              {pendingCount}
            </div>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 11,
                lineHeight: 1.6,
                margin: "5px 0 0",
              }}
            >
              Follow up on access changes that still need review.
            </p>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: "#374151",
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              <KeyRound size={16} color="#7c3aed" />
              Policy changes
            </div>
            <div style={{ fontSize: 23, fontWeight: 750, marginTop: 12 }}>
              {policyChangeCount}
            </div>
            <p
              style={{
                color: "#9ca3af",
                fontSize: 11,
                lineHeight: 1.6,
                margin: "5px 0 0",
              }}
            >
              Track policy modifications for future reviews.
            </p>
          </div>
        </section>

        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 18,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Audit event timeline
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    margin: "5px 0 0",
                  }}
                >
                  Showing {filteredEvents.length} of {events.length} events
                </p>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 9px",
                  borderRadius: 20,
                  background: "#f3f4f6",
                  color: "#4b5563",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                <CalendarDays size={13} />
                Sample event history
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              padding: 16,
              background: "#fafafa",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  top: 11,
                  left: 11,
                  color: "#9ca3af",
                }}
              />
              <input
                aria-label="Search audit logs"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search actor, resource, ID..."
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>

            <select
              aria-label="Filter by audit action"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              style={inputStyle}
            >
              <option value="All">All actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by outcome"
              value={outcomeFilter}
              onChange={(event) => setOutcomeFilter(event.target.value)}
              style={inputStyle}
            >
              <option value="All">All outcomes</option>
              {outcomes.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              style={inputStyle}
            >
              <option value="All">All dates</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Older">Older</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1100,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Event",
                    "Timestamp",
                    "Actor",
                    "Action",
                    "Resource / scope",
                    "Outcome",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "12px 14px",
                        color: "#6b7280",
                        fontSize: 10,
                        fontWeight: 750,
                        textTransform: "uppercase",
                        letterSpacing: ".45px",
                        borderBottom: "1px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 8,
                            color: actionColor(event.action),
                            background: `${actionColor(event.action)}14`,
                          }}
                        >
                          <ClipboardList size={16} />
                        </span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>
                            {event.id}
                          </div>
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {event.requestId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTimestamp(event.timestamp)}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <UserRound size={15} color="#9ca3af" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 650 }}>
                            {event.actor}
                          </div>
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {event.actorEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "6px 8px",
                          borderRadius: 7,
                          background: `${actionColor(event.action)}12`,
                          color: actionColor(event.action),
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.action}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 650 }}>
                        {event.resource}
                      </div>
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {event.scope} · {event.target}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          ...outcomeStyle(event.outcome),
                          display: "inline-flex",
                          padding: "5px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {event.outcome}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(event)}
                        style={{
                          ...buttonStyle,
                          padding: "7px 9px",
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEvents.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 42,
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      No audit events match the selected filters.
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => {
                            setSearch("");
                            setActionFilter("All");
                            setOutcomeFilter("All");
                            setDateFilter("All");
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: 13,
              color: "#9ca3af",
              fontSize: 11,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            This page shows sample data. Production audit records should be
            immutable, access-controlled, and retained according to your
            organization's audit policy.
          </div>
        </section>

        <section style={{ ...cardStyle, marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: 9,
                background: "#eff6ff",
                color: blue,
              }}
            >
              <FileText size={18} />
            </span>

            <div>
              <h3 style={{ fontSize: 13, margin: "0 0 6px" }}>
                Audit logging recommendations
              </h3>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 12,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                For production, record the authenticated actor, action,
                target, scope, timestamp, outcome, request or correlation
                ID, and relevant change metadata. Avoid storing passwords,
                API secrets, access tokens, or unnecessary personal data in
                logs. Generate audit events on the server rather than
                trusting the browser to report security-sensitive actions.
              </p>
            </div>
          </div>
        </section>
      </div>

      {selected && (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(15,23,42,.38)",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Audit event details"
            style={{
              width: "min(480px, 100%)",
              height: "100%",
              overflowY: "auto",
              padding: 24,
              background: "#fff",
              boxShadow: "-12px 0 35px rgba(15,23,42,.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: blue,
                    fontSize: 11,
                    fontWeight: 750,
                  }}
                >
                  AUDIT EVENT DETAILS
                </div>
                <h2
                  style={{
                    fontSize: 21,
                    letterSpacing: "-.5px",
                    margin: "8px 0",
                  }}
                >
                  {selected.action}
                </h2>
                <div style={{ color: "#9ca3af", fontSize: 12 }}>
                  {selected.id}
                </div>
              </div>

              <button
                type="button"
                aria-label="Close event details"
                style={{ ...buttonStyle, padding: 7 }}
                onClick={() => setSelected(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 10,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 50,
                    background: actionColor(selected.action),
                  }}
                />
                {selected.action}
              </div>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 12,
                  lineHeight: 1.7,
                  margin: "10px 0 0",
                }}
              >
                {selected.details}
              </p>
            </div>

            <div style={{ marginTop: 18 }}>
              {[
                ["Timestamp", selected.timestamp.replace("T", " ")],
                ["Actor", selected.actor],
                ["Actor email", selected.actorEmail],
                ["Target", selected.target],
                ["Resource", selected.resource],
                ["Scope", selected.scope],
                ["Outcome", selected.outcome],
                ["IP address", selected.ipAddress],
                ["Request ID", selected.requestId],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: 12,
                    padding: "13px 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#9ca3af" }}>{label}</span>
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: 600,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              style={{ ...buttonStyle, width: "100%", marginTop: 22 }}
              onClick={() => {
                navigator.clipboard
                  .writeText(selected.requestId)
                  .then(() => setNotice("Request ID copied."))
                  .catch(() =>
                    setNotice("Unable to copy the request ID.")
                  );
              }}
            >
              <ClipboardList size={15} />
              Copy request ID
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
