
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  Search,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Download,
  RefreshCw,
  UserRound,
  CalendarDays,
  FileText,
  Filter,
  ArrowUpRight,
} from "lucide-react";

type AuditStatus = "Success" | "Pending" | "Failed";

type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  email: string;
  target: string;
  role: string;
  timestamp: string;
  status: AuditStatus;
  ipAddress: string;
  description: string;
};

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-2026-001",
    action: "Role assigned",
    actor: "Pujitha Marikanti",
    email: "pujitha@example.com",
    target: "Sai Kumar",
    role: "Platform Administrator",
    timestamp: "Nov 03, 2026, 10:42 AM",
    status: "Success",
    ipAddress: "192.0.2.14",
    description:
      "A platform administrator role assignment was recorded for the selected user.",
  },
  {
    id: "AUD-2026-002",
    action: "Role updated",
    actor: "Sai Kumar",
    email: "saikumar@example.com",
    target: "Ananya Reddy",
    role: "Organization Administrator",
    timestamp: "Nov 03, 2026, 09:25 AM",
    status: "Success",
    ipAddress: "192.0.2.28",
    description:
      "The organization role definition was updated.",
  },
  {
    id: "AUD-2026-003",
    action: "Permission changed",
    actor: "Pujitha Marikanti",
    email: "pujitha@example.com",
    target: "Billing Administrator",
    role: "Billing Administrator",
    timestamp: "Nov 02, 2026, 04:18 PM",
    status: "Success",
    ipAddress: "192.0.2.14",
    description:
      "A permission change was recorded for the billing role.",
  },
  {
    id: "AUD-2026-004",
    action: "Role assignment requested",
    actor: "Meghana Rao",
    email: "meghana@example.com",
    target: "Meghana Rao",
    role: "Security Auditor",
    timestamp: "Nov 02, 2026, 02:40 PM",
    status: "Pending",
    ipAddress: "192.0.2.41",
    description:
      "A role assignment request is awaiting review.",
  },
  {
    id: "AUD-2026-005",
    action: "Access revoked",
    actor: "Sai Kumar",
    email: "saikumar@example.com",
    target: "Arjun Kumar",
    role: "Billing Administrator",
    timestamp: "Nov 01, 2026, 11:15 AM",
    status: "Success",
    ipAddress: "192.0.2.28",
    description:
      "Access to the billing administrator role was revoked.",
  },
  {
    id: "AUD-2026-006",
    action: "Role creation attempted",
    actor: "Unknown user",
    email: "unknown@example.com",
    target: "Custom Finance Role",
    role: "Custom Role",
    timestamp: "Oct 31, 2026, 06:32 PM",
    status: "Failed",
    ipAddress: "192.0.2.99",
    description:
      "The role creation attempt failed validation. Review server-side audit details for the actual reason.",
  },
  {
    id: "AUD-2026-007",
    action: "Role reviewed",
    actor: "Pujitha Marikanti",
    email: "pujitha@example.com",
    target: "Workspace Administrator",
    role: "Workspace Administrator",
    timestamp: "Oct 30, 2026, 03:10 PM",
    status: "Success",
    ipAddress: "192.0.2.14",
    description:
      "The workspace administrator role was reviewed.",
  },
];

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border: "1px solid #dce3ee",
  borderRadius: 9,
  background: "#fff",
  color: "#172b4d",
  fontSize: 13,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 13px",
  border: "1px solid #dce3ee",
  borderRadius: 9,
  background: "#fff",
  color: "#304561",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export default function RoleAuditLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All actions");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [notice, setNotice] = useState("");

  const actionTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.action))),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.id.toLowerCase().includes(query) ||
        event.actor.toLowerCase().includes(query) ||
        event.email.toLowerCase().includes(query) ||
        event.target.toLowerCase().includes(query) ||
        event.role.toLowerCase().includes(query) ||
        event.action.toLowerCase().includes(query);

      const matchesAction =
        actionFilter === "All actions" ||
        event.action === actionFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        event.status === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [events, search, actionFilter, statusFilter]);

  const successCount = events.filter(
    (event) => event.status === "Success",
  ).length;

  const pendingCount = events.filter(
    (event) => event.status === "Pending",
  ).length;

  const failedCount = events.filter(
    (event) => event.status === "Failed",
  ).length;

  function resetFilters() {
    setSearch("");
    setActionFilter("All actions");
    setStatusFilter("All statuses");
  }

  function refreshDemoLogs() {
    setEvents([...initialEvents]);
    resetFilters();
    setSelectedEvent(null);
    setNotice("Demo audit log data has been reset.");
  }

  function exportCsv() {
    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const headers = [
      "Event ID",
      "Action",
      "Actor",
      "Email",
      "Target",
      "Role",
      "Timestamp",
      "Status",
      "IP Address",
      "Description",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.action,
      event.actor,
      event.email,
      event.target,
      event.role,
      event.timestamp,
      event.status,
      event.ipAddress,
      event.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-role-audit-logs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice(`Exported ${filteredEvents.length} audit events to CSV.`);
  }

  function updateEventStatus(
    event: AuditEvent,
    status: AuditStatus,
  ) {
    setEvents((current) =>
      current.map((item) =>
        item.id === event.id ? { ...item, status } : item,
      ),
    );

    setSelectedEvent(null);
    setNotice(`Demo event ${event.id} marked ${status}.`);
  }

  function statusStyle(status: AuditStatus): CSSProperties {
    const colors = {
      Success: { color: "#087443", background: "#e8f8ef" },
      Pending: { color: "#a45a00", background: "#fff3df" },
      Failed: { color: "#b42318", background: "#fff0ee" },
    };

    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "6px 9px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: "nowrap",
      ...colors[status],
    };
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        background: "#f5f7fb",
        color: "#172b4d",
      }}
    >
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        <div style={{ marginBottom: 26 }}>
          <div
            style={{
              fontSize: 12,
              color: "#7b8aa3",
              marginBottom: 12,
            }}
          >
            ModelNow　›　Roles　›　Role Audit Logs
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 750,
              letterSpacing: "-0.8px",
              margin: "0 0 9px",
              color: "#102544",
            }}
          >
            Role Audit Logs
          </h1>

          <p
            style={{
              color: "#6b7d98",
              fontSize: 14,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Review role changes, permission updates, access requests,
            and administrative activity.
          </p>
        </div>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 18,
              padding: 12,
              borderRadius: 9,
              background: "#ecfdf3",
              border: "1px solid #b7ebc9",
              color: "#167747",
              fontSize: 13,
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
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Total events",
              value: events.length,
              icon: <Activity size={21} />,
              color: "#315efb",
              bg: "#edf2ff",
            },
            {
              label: "Successful events",
              value: successCount,
              icon: <CheckCircle2 size={21} />,
              color: "#13864b",
              bg: "#e8f8ef",
            },
            {
              label: "Pending events",
              value: pendingCount,
              icon: <Clock size={21} />,
              color: "#c45b08",
              bg: "#fff3df",
            },
            {
              label: "Failed events",
              value: failedCount,
              icon: <AlertTriangle size={21} />,
              color: "#c0392b",
              bg: "#fff0ee",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                background: "#fff",
                border: "1px solid #e1e7f0",
                borderRadius: 15,
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={{ fontSize: 13, color: "#647692" }}>
                  {metric.label}
                </span>

                <span
                  style={{
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 12,
                    color: metric.color,
                    background: metric.bg,
                  }}
                >
                  {metric.icon}
                </span>
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 750,
                  color: "#102544",
                }}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e1e7f0",
            borderRadius: 15,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "21px 24px",
              borderBottom: "1px solid #e8edf4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  color: "#102544",
                }}
              >
                Audit event directory
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 12,
                  color: "#7b8aa3",
                }}
              >
                Showing {filteredEvents.length} of {events.length} events
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={refreshDemoLogs}
                style={buttonStyle}
              >
                <RefreshCw size={15} />
                Reset demo data
              </button>

              <button
                type="button"
                onClick={exportCsv}
                style={{
                  ...buttonStyle,
                  background: "#315efb",
                  borderColor: "#315efb",
                  color: "#fff",
                }}
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "17px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 12,
              borderBottom: "1px solid #e8edf4",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: 13,
                  top: 13,
                  color: "#8190a7",
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search event, actor, role..."
                aria-label="Search audit events"
                style={{ ...inputStyle, paddingLeft: 39 }}
              />
            </div>

            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              aria-label="Filter by audit action"
              style={inputStyle}
            >
              <option>All actions</option>
              {actionTypes.map((action) => (
                <option key={action}>{action}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by event status"
              style={inputStyle}
            >
              <option>All statuses</option>
              <option>Success</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              style={buttonStyle}
            >
              <Filter size={15} />
              Clear filters
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1080,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafd" }}>
                  {[
                    "EVENT",
                    "ACTION",
                    "PERFORMED BY",
                    "TARGET",
                    "TIMESTAMP",
                    "STATUS",
                    "DETAILS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 16px",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#75849d",
                        borderBottom: "1px solid #e4eaf2",
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
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 37,
                            height: 37,
                            borderRadius: 10,
                            background:
                              event.status === "Failed"
                                ? "#fff0ee"
                                : event.status === "Pending"
                                  ? "#fff3df"
                                  : "#edf2ff",
                            color:
                              event.status === "Failed"
                                ? "#c0392b"
                                : event.status === "Pending"
                                  ? "#c45b08"
                                  : "#315efb",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={18} />
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#172b4d",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.id}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#8492a8",
                              marginTop: 5,
                            }}
                          >
                            Role governance
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#304561",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.action}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <UserRound size={16} color="#8190a7" />
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.actor}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#8492a8",
                              marginTop: 4,
                            }}
                          >
                            {event.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#304561",
                        }}
                      >
                        {event.target}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#8492a8",
                          marginTop: 4,
                        }}
                      >
                        {event.role}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                        fontSize: 11,
                        color: "#647692",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CalendarDays size={13} />
                        {event.timestamp}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <span style={statusStyle(event.status)}>
                        {event.status === "Success" ? (
                          <CheckCircle2 size={12} />
                        ) : event.status === "Pending" ? (
                          <Clock size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {event.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: 16,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          ...buttonStyle,
                          padding: "8px 10px",
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
                        color: "#7b8aa3",
                      }}
                    >
                      <Search
                        size={28}
                        style={{ margin: "0 auto 10px" }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#334764",
                        }}
                      >
                        No audit events found
                      </div>
                      <p style={{ fontSize: 12 }}>
                        Try a different search term or filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid #e8edf4",
              color: "#8492a8",
              fontSize: 11,
            }}
          >
            Displaying {filteredEvents.length} matching events.
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 22,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 13,
              padding: 20,
            }}
          >
            <ShieldCheck size={21} color="#315efb" />
            <h3 style={{ fontSize: 14, margin: "12px 0 7px" }}>
              Access governance
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#71819a",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Track role assignments, permission changes, access
              revocations, and administrative activity.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 13,
              padding: 20,
            }}
          >
            <AlertTriangle size={21} color="#c45b08" />
            <h3 style={{ fontSize: 14, margin: "12px 0 7px" }}>
              Security review
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#71819a",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Investigate failed operations and pending changes using
              trusted, server-recorded audit events.
            </p>
          </div>
        </section>
      </div>

      {selectedEvent && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEvent(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#10254480",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-details-title"
            style={{
              width: "100%",
              maxWidth: 580,
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 25px 80px #10254433",
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
                <h2
                  id="audit-details-title"
                  style={{
                    fontSize: 21,
                    margin: "0 0 7px",
                    color: "#102544",
                  }}
                >
                  Audit event details
                </h2>
                <div style={{ fontSize: 12, color: "#8492a8" }}>
                  {selectedEvent.id}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close audit details"
                style={{ ...buttonStyle, padding: 8 }}
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 11,
                background: "#f5f7fb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#172b4d",
                  }}
                >
                  {selectedEvent.action}
                </span>
                <span style={statusStyle(selectedEvent.status)}>
                  {selectedEvent.status}
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "#647692",
                  lineHeight: 1.8,
                  margin: "10px 0 0",
                }}
              >
                {selectedEvent.description}
              </p>
            </div>

            <div style={{ marginTop: 12 }}>
              {[
                ["Event ID", selectedEvent.id],
                ["Actor", selectedEvent.actor],
                ["Email", selectedEvent.email],
                ["Target", selectedEvent.target],
                ["Role", selectedEvent.role],
                ["Timestamp", selectedEvent.timestamp],
                ["IP address", selectedEvent.ipAddress],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 18,
                    padding: "12px 0",
                    borderBottom: "1px solid #edf0f5",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#7b8aa3" }}>{label}</span>
                  <span
                    style={{
                      color: "#243b60",
                      fontWeight: 600,
                      textAlign: "right",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: 12,
                marginTop: 16,
                borderRadius: 9,
                background: "#eef4ff",
                color: "#42639b",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              These are illustrative demo events. Production audit logs
              should be recorded by the backend, protected against
              tampering, and timestamped by a trusted server.
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              {selectedEvent.status !== "Success" && (
                <button
                  type="button"
                  onClick={() =>
                    updateEventStatus(selectedEvent, "Success")
                  }
                  style={{
                    ...buttonStyle,
                    color: "#087443",
                    borderColor: "#b7ebc9",
                  }}
                >
                  <CheckCircle2 size={14} />
                  Mark successful
                </button>
              )}

              {selectedEvent.status !== "Pending" && (
                <button
                  type="button"
                  onClick={() =>
                    updateEventStatus(selectedEvent, "Pending")
                  }
                  style={buttonStyle}
                >
                  <Clock size={14} />
                  Mark pending
                </button>
              )}

              {selectedEvent.status !== "Failed" && (
                <button
                  type="button"
                  onClick={() =>
                    updateEventStatus(selectedEvent, "Failed")
                  }
                  style={{
                    ...buttonStyle,
                    color: "#b42318",
                    borderColor: "#f1c6c2",
                  }}
                >
                  <AlertTriangle size={14} />
                  Mark failed
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  setNotice(
                    `Review opened for ${selectedEvent.id}.`,
                  );
                }}
                style={{
                  ...buttonStyle,
                  marginLeft: "auto",
                }}
              >
                <ArrowUpRight size={14} />
                Finish review
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
