
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Outcome = "Success" | "Failed" | "Blocked" | "Pending";

type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  severity: Severity;
  timestamp: string;
  category: string;
  outcome: Outcome;
  ipAddress: string;
  description: string;
};

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-1001",
    actor: "admin@modelnow.ai",
    action: "Updated organization security policy",
    resource: "Organization",
    severity: "Medium",
    timestamp: "2 minutes ago",
    category: "Administration",
    outcome: "Success",
    ipAddress: "192.0.2.14",
    description:
      "The organization security policy was updated. Review the policy version and associated change record.",
  },
  {
    id: "AUD-1002",
    actor: "system",
    action: "Infrastructure backup completed",
    resource: "Infrastructure",
    severity: "Low",
    timestamp: "12 minutes ago",
    category: "System",
    outcome: "Success",
    ipAddress: "Internal",
    description:
      "The scheduled infrastructure backup reported completion. Verify backup integrity in the infrastructure service.",
  },
  {
    id: "AUD-1003",
    actor: "security@modelnow.ai",
    action: "Blocked suspicious API key",
    resource: "API Gateway",
    severity: "High",
    timestamp: "28 minutes ago",
    category: "Security",
    outcome: "Blocked",
    ipAddress: "198.51.100.23",
    description:
      "An API key was blocked following a suspicious-activity signal. Investigate the key and related gateway events.",
  },
  {
    id: "AUD-1004",
    actor: "billing@modelnow.ai",
    action: "Enterprise billing updated",
    resource: "Billing",
    severity: "Low",
    timestamp: "1 hour ago",
    category: "Billing",
    outcome: "Success",
    ipAddress: "192.0.2.40",
    description:
      "An enterprise billing record was updated. Confirm that the change matches the approved billing request.",
  },
  {
    id: "AUD-1005",
    actor: "unknown",
    action: "Failed login attempt",
    resource: "Authentication",
    severity: "High",
    timestamp: "2 hours ago",
    category: "Authentication",
    outcome: "Failed",
    ipAddress: "198.51.100.45",
    description:
      "A sample authentication event represents a failed login. Production monitoring should correlate repeated attempts.",
  },
  {
    id: "AUD-1006",
    actor: "admin@modelnow.ai",
    action: "Changed user role",
    resource: "Access Control",
    severity: "High",
    timestamp: "3 hours ago",
    category: "Administration",
    outcome: "Success",
    ipAddress: "192.0.2.14",
    description:
      "A user's role was changed. Validate the target user, previous role, new role, and approval history.",
  },
  {
    id: "AUD-1007",
    actor: "system",
    action: "Policy violation detected",
    resource: "Governance",
    severity: "Critical",
    timestamp: "4 hours ago",
    category: "Governance",
    outcome: "Pending",
    ipAddress: "Internal",
    description:
      "A sample policy violation requires investigation and a documented resolution.",
  },
  {
    id: "AUD-1008",
    actor: "developer@modelnow.ai",
    action: "Created API key",
    resource: "API Gateway",
    severity: "Medium",
    timestamp: "5 hours ago",
    category: "API",
    outcome: "Success",
    ipAddress: "192.0.2.81",
    description:
      "An API key creation event was recorded in the demo dataset. Production logs should never expose the key secret.",
  },
  {
    id: "AUD-1009",
    actor: "security@modelnow.ai",
    action: "Permission update requires review",
    resource: "Permissions",
    severity: "Critical",
    timestamp: "6 hours ago",
    category: "Security",
    outcome: "Pending",
    ipAddress: "192.0.2.14",
    description:
      "A permission change is awaiting review. Confirm that the requesting actor is authorized.",
  },
  {
    id: "AUD-1010",
    actor: "system",
    action: "Scheduled model evaluation completed",
    resource: "Model Service",
    severity: "Low",
    timestamp: "8 hours ago",
    category: "Models",
    outcome: "Success",
    ipAddress: "Internal",
    description:
      "A sample model evaluation completion event. Inspect the model service for the authoritative run results.",
  },
  {
    id: "AUD-1011",
    actor: "user@modelnow.ai",
    action: "Session authentication rejected",
    resource: "Authentication",
    severity: "Medium",
    timestamp: "10 hours ago",
    category: "Authentication",
    outcome: "Failed",
    ipAddress: "203.0.113.10",
    description:
      "A sample session was rejected. Check authentication policy and session-expiration details.",
  },
  {
    id: "AUD-1012",
    actor: "admin@modelnow.ai",
    action: "Exported compliance report",
    resource: "Compliance",
    severity: "Low",
    timestamp: "Yesterday",
    category: "Compliance",
    outcome: "Success",
    ipAddress: "192.0.2.14",
    description:
      "A compliance report export event is represented in the sample data. Production systems should record the report scope and destination.",
  },
];

const severityColors: Record<Severity, { color: string; bg: string }> = {
  Critical: { color: "#b42318", bg: "#fef3f2" },
  High: { color: "#c4320a", bg: "#fff4ed" },
  Medium: { color: "#b54708", bg: "#fffaeb" },
  Low: { color: "#027a48", bg: "#ecfdf3" },
};

const outcomeColors: Record<Outcome, { color: string; bg: string }> = {
  Success: { color: "#027a48", bg: "#ecfdf3" },
  Failed: { color: "#b42318", bg: "#fef3f2" },
  Blocked: { color: "#6941c6", bg: "#f4f3ff" },
  Pending: { color: "#b54708", bg: "#fffaeb" },
};

const panelStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  borderRadius: 9,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#344054",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function Badge({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
  color,
  bg,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <article style={{ ...panelStyle, padding: 18, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 13, color: "#667085", fontWeight: 600 }}>
          {title}
        </span>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: bg,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 27, fontWeight: 750, color: "#101828" }}>
        {value}
      </div>
      <div style={{ marginTop: 7, color: "#667085", fontSize: 12 }}>
        {description}
      </div>
    </article>
  );
}

function downloadCsv(events: AuditEvent[]) {
  const headers = [
    "ID",
    "Actor",
    "Action",
    "Resource",
    "Severity",
    "Timestamp",
    "Category",
    "Outcome",
    "IP Address",
    "Description",
  ];

  const escapeCsv = (value: string) =>
    `"${value.replace(/"/g, '""')}"`;

  const rows = events.map((event) =>
    [
      event.id,
      event.actor,
      event.action,
      event.resource,
      event.severity,
      event.timestamp,
      event.category,
      event.outcome,
      event.ipAddress,
      event.description,
    ]
      .map(escapeCsv)
      .join(","),
  );

  const csv = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "modelnow-audit-logs.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AuditPage(): React.JSX.Element {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [outcomeFilter, setOutcomeFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(events.map((event) => event.category))).sort(),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.actor,
          event.action,
          event.resource,
          event.category,
          event.ipAddress,
          event.description,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesSeverity =
        severityFilter === "All" || event.severity === severityFilter;
      const matchesCategory =
        categoryFilter === "All" || event.category === categoryFilter;
      const matchesOutcome =
        outcomeFilter === "All" || event.outcome === outcomeFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesCategory &&
        matchesOutcome
      );
    });
  }, [events, search, severityFilter, categoryFilter, outcomeFilter]);

  const criticalCount = events.filter(
    (event) => event.severity === "Critical",
  ).length;
  const failedCount = events.filter((event) => event.outcome === "Failed").length;
  const pendingCount = events.filter(
    (event) => event.outcome === "Pending",
  ).length;
  const successfulCount = events.filter(
    (event) => event.outcome === "Success",
  ).length;

  function resetFilters() {
    setSearch("");
    setSeverityFilter("All");
    setCategoryFilter("All");
    setOutcomeFilter("All");
  }

  function markReviewed(eventId: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId && event.outcome === "Pending"
          ? { ...event, outcome: "Success" }
          : event,
      ),
    );

    setSelectedEvent((current) =>
      current?.id === eventId && current.outcome === "Pending"
        ? { ...current, outcome: "Success" }
        : current,
    );
    setNotice(`Review status updated for ${eventId} in this demo.`);
  }

  const selectStyle: CSSProperties = {
    padding: "9px 10px",
    borderRadius: 9,
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#344054",
    fontSize: 13,
    minWidth: 0,
    width: "100%",
    outlineColor: "#6172f3",
  };

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1500,
        margin: "0 auto",
        padding: "26px 28px 40px",
        color: "#101828",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 720 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: "#475467",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            <ShieldCheck size={16} color="#315efb" />
            MODE LNOW ADMIN CONSOLE
          </div>
          <h1
            style={{
              fontSize: 29,
              lineHeight: 1.2,
              letterSpacing: "-0.8px",
              margin: "0 0 9px",
              fontWeight: 750,
            }}
          >
            Audit Logs
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.7,
              color: "#667085",
            }}
          >
            Review administrative activity, authentication events, security
            signals, and changes across the ModelNow platform.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              resetFilters();
              setNotice("Filters reset.");
            }}
          >
            <RefreshCw size={15} />
            Reset filters
          </button>
          <button
            type="button"
            style={{
              ...buttonStyle,
              background: "#315efb",
              color: "#ffffff",
              borderColor: "#315efb",
            }}
            onClick={() => {
              downloadCsv(filteredEvents);
              setNotice(`Exported ${filteredEvents.length} displayed demo events.`);
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      <div
        style={{
          padding: "12px 14px",
          border: "1px solid #fedf89",
          borderRadius: 10,
          background: "#fffaeb",
          color: "#93370d",
          fontSize: 12,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        <strong>Demo data:</strong> These events are illustrative frontend
        records. They are not live production logs, and the displayed
        timestamps and IP addresses are sample values. Real audit logging
        requires a backend event source and access controls.
      </div>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "#eff8ff",
            border: "1px solid #b2ddff",
            borderRadius: 9,
            color: "#175cd3",
            padding: "10px 12px",
            marginBottom: 18,
            fontSize: 13,
          }}
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{
              border: 0,
              background: "transparent",
              cursor: "pointer",
              color: "inherit",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        aria-label="Audit metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <MetricCard
          title="Events in Demo Dataset"
          value={events.length.toLocaleString()}
          description="Sample audit records"
          icon={<Activity size={18} />}
          color="#315efb"
          bg="#eff4ff"
        />
        <MetricCard
          title="Critical Events"
          value={criticalCount.toLocaleString()}
          description="Require investigation"
          icon={<ShieldAlert size={18} />}
          color="#b42318"
          bg="#fef3f2"
        />
        <MetricCard
          title="Failed Outcomes"
          value={failedCount.toLocaleString()}
          description="Sample failed events"
          icon={<AlertTriangle size={18} />}
          color="#b54708"
          bg="#fffaeb"
        />
        <MetricCard
          title="Successful Actions"
          value={successfulCount.toLocaleString()}
          description={`${pendingCount} pending review`}
          icon={<CheckCircle2 size={18} />}
          color="#027a48"
          bg="#ecfdf3"
        />
      </section>

      <section style={{ ...panelStyle, overflow: "hidden", marginBottom: 24 }}>
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #eaecf0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              Event activity
            </h2>
            <p style={{ margin: "5px 0 0", color: "#667085", fontSize: 12 }}>
              Search and inspect the audit event dataset.
            </p>
          </div>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={15} />
            Filters
            <ChevronDown size={14} />
          </button>
        </div>

        <div
          style={{
            padding: "16px 20px",
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1fr) auto",
            gap: 12,
            borderBottom: "1px solid #eaecf0",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color="#98a2b3"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, actor, action, resource..."
              aria-label="Search audit events"
              style={{ ...selectStyle, paddingLeft: 38 }}
            />
          </div>
          <button type="button" style={buttonStyle} onClick={resetFilters}>
            Clear filters
          </button>
        </div>

        {showFilters && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              padding: "14px 20px",
              background: "#f9fafb",
              borderBottom: "1px solid #eaecf0",
            }}
          >
            <label style={{ fontSize: 12, color: "#475467" }}>
              Severity
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                style={{ ...selectStyle, marginTop: 6 }}
              >
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label style={{ fontSize: 12, color: "#475467" }}>
              Category
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                style={{ ...selectStyle, marginTop: 6 }}
              >
                <option>All</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 12, color: "#475467" }}>
              Outcome
              <select
                value={outcomeFilter}
                onChange={(event) => setOutcomeFilter(event.target.value)}
                style={{ ...selectStyle, marginTop: 6 }}
              >
                <option>All</option>
                <option>Success</option>
                <option>Failed</option>
                <option>Blocked</option>
                <option>Pending</option>
              </select>
            </label>
          </div>
        )}

        <div
          style={{
            padding: "12px 20px",
            fontSize: 12,
            color: "#667085",
            background: "#fcfcfd",
            borderBottom: "1px solid #eaecf0",
          }}
        >
          Showing <strong>{filteredEvents.length}</strong> of{" "}
          <strong>{events.length}</strong> demo events
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 850,
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Event", "Actor", "Action", "Severity", "Outcome", "Time", ""].map(
                  (heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      style={{
                        padding: "12px 16px",
                        color: "#667085",
                        fontSize: 11,
                        fontWeight: 700,
                        borderBottom: "1px solid #eaecf0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td style={cellStyle}>
                    <div style={{ color: "#344054", fontWeight: 700, fontSize: 12 }}>
                      {event.id}
                    </div>
                    <div style={{ color: "#98a2b3", fontSize: 11, marginTop: 4 }}>
                      {event.category}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, maxWidth: 200 }}>
                    <span
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "#344054",
                        fontSize: 12,
                      }}
                    >
                      {event.actor}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, minWidth: 240 }}>
                    <div style={{ color: "#101828", fontSize: 12, fontWeight: 600 }}>
                      {event.action}
                    </div>
                    <div style={{ color: "#667085", fontSize: 11, marginTop: 4 }}>
                      {event.resource}
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <Badge
                      color={severityColors[event.severity].color}
                      bg={severityColors[event.severity].bg}
                    >
                      {event.severity}
                    </Badge>
                  </td>
                  <td style={cellStyle}>
                    <Badge
                      color={outcomeColors[event.outcome].color}
                      bg={outcomeColors[event.outcome].bg}
                    >
                      {event.outcome}
                    </Badge>
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      whiteSpace: "nowrap",
                      color: "#667085",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Clock3 size={13} />
                      {event.timestamp}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <button
                      type="button"
                      aria-label={`View ${event.id}`}
                      title="View event details"
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        ...buttonStyle,
                        padding: 8,
                        border: "1px solid #eaecf0",
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center" }}>
                    <Search
                      size={25}
                      color="#98a2b3"
                      style={{ margin: "0 auto 10px" }}
                    />
                    <div style={{ fontWeight: 700, color: "#344054" }}>
                      No matching events
                    </div>
                    <p style={{ color: "#667085", fontSize: 12 }}>
                      Try another search term or clear your filters.
                    </p>
                    <button type="button" style={buttonStyle} onClick={resetFilters}>
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ ...panelStyle, padding: 20 }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>
            Audit capabilities
          </h2>
          <p style={{ fontSize: 12, color: "#667085", margin: "5px 0 0" }}>
            Areas to connect to authoritative backend audit sources.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              icon: <LockKeyhole size={18} />,
              title: "Authentication history",
              detail: "Login attempts, sessions, and MFA events",
            },
            {
              icon: <ShieldCheck size={18} />,
              title: "Role and permission changes",
              detail: "Track access grants and revocations",
            },
            {
              icon: <Activity size={18} />,
              title: "API request auditing",
              detail: "Gateway activity and key lifecycle events",
            },
            {
              icon: <FileText size={18} />,
              title: "Compliance reporting",
              detail: "Evidence, report exports, and review history",
            },
            {
              icon: <KeyRound size={18} />,
              title: "Administrative actions",
              detail: "Organization, workspace, and policy changes",
            },
            {
              icon: <ShieldAlert size={18} />,
              title: "Incident timeline",
              detail: "Severity, investigation, and resolution history",
            },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                border: "1px solid #eaecf0",
                borderRadius: 11,
                padding: 14,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: 9,
                  color: "#315efb",
                  background: "#eff4ff",
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#344054" }}>
                  {item.title}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "#667085",
                    margin: "5px 0 0",
                  }}
                >
                  {item.detail}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
            marginTop: 18,
            padding: 12,
            borderRadius: 9,
            background: "#f9fafb",
            color: "#667085",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            For production, store audit records server-side with strict access
            controls, reliable timestamps, retention policies, and tamper-evident
            integrity checks. A frontend-only page cannot guarantee immutable
            audit history or real-time monitoring.
          </span>
        </div>
      </section>

      {selectedEvent && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedEvent(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(16, 24, 40, 0.42)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
            style={{
              width: "min(480px, 100%)",
              height: "100%",
              overflowY: "auto",
              background: "#ffffff",
              boxShadow: "-12px 0 35px rgba(16,24,40,.12)",
              padding: 24,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 22,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#667085", marginBottom: 7 }}>
                  AUDIT EVENT DETAILS
                </div>
                <h2
                  id="audit-detail-title"
                  style={{ margin: 0, fontSize: 22, fontWeight: 750 }}
                >
                  {selectedEvent.id}
                </h2>
                <p style={{ color: "#667085", fontSize: 13, lineHeight: 1.6 }}>
                  Review the recorded event information.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close event details"
                onClick={() => setSelectedEvent(null)}
                style={{ ...buttonStyle, padding: 8 }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <Badge
                color={severityColors[selectedEvent.severity].color}
                bg={severityColors[selectedEvent.severity].bg}
              >
                {selectedEvent.severity} severity
              </Badge>
              <Badge
                color={outcomeColors[selectedEvent.outcome].color}
                bg={outcomeColors[selectedEvent.outcome].bg}
              >
                {selectedEvent.outcome}
              </Badge>
            </div>

            <div
              style={{
                padding: 16,
                background: "#f9fafb",
                borderRadius: 11,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: "#667085", marginBottom: 7 }}>
                ACTION
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.5 }}>
                {selectedEvent.action}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#667085" }}>
                {selectedEvent.description}
              </p>
            </div>

            {[
              ["Actor", selectedEvent.actor],
              ["Resource", selectedEvent.resource],
              ["Category", selectedEvent.category],
              ["Timestamp", selectedEvent.timestamp],
              ["IP address", selectedEvent.ipAddress],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0, 1fr)",
                  gap: 12,
                  padding: "13px 0",
                  borderBottom: "1px solid #eaecf0",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#667085" }}>{label}</span>
                <span
                  style={{
                    color: "#344054",
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            {selectedEvent.outcome === "Pending" && (
              <button
                type="button"
                onClick={() => markReviewed(selectedEvent.id)}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginTop: 22,
                  background: "#315efb",
                  color: "#ffffff",
                  borderColor: "#315efb",
                }}
              >
                <CheckCircle2 size={15} />
                Mark as reviewed
              </button>
            )}

            <p style={{ marginTop: 18, color: "#98a2b3", fontSize: 11, lineHeight: 1.6 }}>
              Demo-only action. In production, review decisions should be
              authenticated, authorized, and recorded as separate audit events.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

const cellStyle: CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #eaecf0",
  verticalAlign: "middle",
};
