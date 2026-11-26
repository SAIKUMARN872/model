
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  X,
  ShieldCheck,
  Users,
  FolderKanban,
  Settings,
  KeyRound,
  FileText,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  CircleCheck,
  AlertTriangle,
  Clock3,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  ClipboardList,
} from "lucide-react";

type EventCategory =
  | "Authentication"
  | "Members"
  | "Projects"
  | "Permissions"
  | "Settings"
  | "Resources"
  | "Security";

type EventStatus = "Success" | "Warning" | "Failed";

type ActivityEvent = {
  id: number;
  action: string;
  description: string;
  actor: string;
  email: string;
  category: EventCategory;
  status: EventStatus;
  resource: string;
  ip: string;
  timestamp: string;
  details: string;
};

const initialEvents: ActivityEvent[] = [
  {
    id: 1001,
    action: "Workspace settings updated",
    description: "Updated workspace name and default preferences.",
    actor: "Pujitha Marikanti",
    email: "pujitha@modelnow.example",
    category: "Settings",
    status: "Success",
    resource: "ModelNow Production",
    ip: "192.0.2.14",
    timestamp: "2026-11-04T09:42:00",
    details:
      "Workspace profile settings were changed. This is a demonstration event, not a verified production audit record.",
  },
  {
    id: 1002,
    action: "Member invited",
    description: "Sent a workspace invitation to a new team member.",
    actor: "Sai Kumar",
    email: "sai.kumar@modelnow.example",
    category: "Members",
    status: "Success",
    resource: "Engineering Workspace",
    ip: "192.0.2.18",
    timestamp: "2026-11-04T09:18:00",
    details:
      "A sample member invitation event. Actual email delivery and invitation acceptance are not connected.",
  },
  {
    id: 1003,
    action: "Permission change requested",
    description: "Requested elevated access to the model registry.",
    actor: "Rahul Verma",
    email: "rahul@modelnow.example",
    category: "Permissions",
    status: "Warning",
    resource: "Model Registry",
    ip: "192.0.2.27",
    timestamp: "2026-11-04T08:55:00",
    details:
      "An elevated-access request is shown for demonstration. No real authorization decision was made.",
  },
  {
    id: 1004,
    action: "Successful sign-in",
    description: "User signed in to the admin workspace.",
    actor: "Ananya Rao",
    email: "ananya@modelnow.example",
    category: "Authentication",
    status: "Success",
    resource: "Admin Console",
    ip: "192.0.2.32",
    timestamp: "2026-11-04T08:30:00",
    details:
      "A sample authentication event. The IP address is reserved for documentation and is not a real user address.",
  },
  {
    id: 1005,
    action: "Project created",
    description: "Created a project for model evaluation.",
    actor: "Meera Shah",
    email: "meera@modelnow.example",
    category: "Projects",
    status: "Success",
    resource: "Evaluation Pipeline",
    ip: "192.0.2.41",
    timestamp: "2026-11-04T08:05:00",
    details:
      "A demonstration project-creation event for the workspace activity interface.",
  },
  {
    id: 1006,
    action: "Repeated sign-in attempt",
    description: "Multiple unsuccessful sign-in attempts were recorded.",
    actor: "Unknown user",
    email: "unknown@example.invalid",
    category: "Security",
    status: "Failed",
    resource: "Admin Console",
    ip: "192.0.2.90",
    timestamp: "2026-11-04T07:44:00",
    details:
      "A sample security event. It does not indicate an actual attack or a real account lockout.",
  },
  {
    id: 1007,
    action: "Member role changed",
    description: "Updated a member from Editor to Workspace Admin.",
    actor: "Sai Kumar",
    email: "sai.kumar@modelnow.example",
    category: "Permissions",
    status: "Success",
    resource: "Engineering Workspace",
    ip: "192.0.2.18",
    timestamp: "2026-11-03T17:35:00",
    details:
      "A demonstration role-change event. Actual role assignments must be validated by the backend.",
  },
  {
    id: 1008,
    action: "Resource downloaded",
    description: "Downloaded a workspace policy document.",
    actor: "Pujitha Marikanti",
    email: "pujitha@modelnow.example",
    category: "Resources",
    status: "Success",
    resource: "Workspace Policy.pdf",
    ip: "192.0.2.14",
    timestamp: "2026-11-03T16:20:00",
    details:
      "A sample resource activity event. No actual document download occurred.",
  },
  {
    id: 1009,
    action: "Member removed",
    description: "Removed a former collaborator from a workspace.",
    actor: "Rahul Verma",
    email: "rahul@modelnow.example",
    category: "Members",
    status: "Warning",
    resource: "Research Workspace",
    ip: "192.0.2.27",
    timestamp: "2026-11-03T15:40:00",
    details:
      "A sample member-removal event for the activity history interface.",
  },
  {
    id: 1010,
    action: "Workspace policy reviewed",
    description: "Reviewed workspace security and retention preferences.",
    actor: "Ananya Rao",
    email: "ananya@modelnow.example",
    category: "Security",
    status: "Success",
    resource: "Security Policy",
    ip: "192.0.2.32",
    timestamp: "2026-11-03T14:10:00",
    details:
      "A demonstration policy-review event. It is not a compliance attestation.",
  },
  {
    id: 1011,
    action: "Session signed out",
    description: "Ended an admin console session.",
    actor: "Meera Shah",
    email: "meera@modelnow.example",
    category: "Authentication",
    status: "Success",
    resource: "Admin Console",
    ip: "192.0.2.41",
    timestamp: "2026-11-03T12:05:00",
    details: "A sample sign-out event.",
  },
  {
    id: 1012,
    action: "Workspace configuration failed",
    description: "A configuration update did not pass validation.",
    actor: "System Operator",
    email: "operator@modelnow.example",
    category: "Settings",
    status: "Failed",
    resource: "Research Workspace",
    ip: "192.0.2.55",
    timestamp: "2026-11-03T10:25:00",
    details:
      "A sample failed configuration event. No real system configuration was changed.",
  },
];

const categoryOptions = [
  "All",
  "Authentication",
  "Members",
  "Projects",
  "Permissions",
  "Settings",
  "Resources",
  "Security",
];

const statusOptions = ["All", "Success", "Warning", "Failed"];

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #dfe5ed",
  borderRadius: 9,
  background: "#fff",
  color: "#172033",
  fontSize: 12,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: "1px solid #dfe5ed",
  borderRadius: 9,
  background: "#fff",
  color: "#344054",
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const statusColors: Record<EventStatus, string> = {
  Success: "#16845b",
  Warning: "#b7791f",
  Failed: "#d92d20",
};

function eventIcon(category: EventCategory) {
  switch (category) {
    case "Authentication":
      return LogIn;
    case "Members":
      return Users;
    case "Projects":
      return FolderKanban;
    case "Permissions":
      return KeyRound;
    case "Settings":
      return Settings;
    case "Resources":
      return FileText;
    case "Security":
      return ShieldCheck;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorkspaceActivityPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [actor, setActor] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(true);
  const [notice, setNotice] = useState("");

  const actors = useMemo(
    () => [...new Set(events.map((event) => event.actor))].sort(),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesSearch =
          !query ||
          [
            event.action,
            event.description,
            event.actor,
            event.email,
            event.resource,
            event.category,
          ].some((value) => value.toLowerCase().includes(query));

        const matchesCategory = category === "All" || event.category === category;
        const matchesStatus = status === "All" || event.status === status;
        const matchesActor = actor === "All" || event.actor === actor;

        const eventDate = new Date(event.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const matchesDate =
          dateFilter === "All" ||
          (dateFilter === "Today" && eventDate >= today) ||
          (dateFilter === "Yesterday" &&
            eventDate >= yesterday &&
            eventDate < today) ||
          (dateFilter === "Last 7 days" &&
            eventDate >= new Date(Date.now() - 7 * 86400000));

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus &&
          matchesActor &&
          matchesDate
        );
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [events, search, category, status, actor, dateFilter]);

  const successfulCount = events.filter((event) => event.status === "Success").length;
  const warningCount = events.filter((event) => event.status === "Warning").length;
  const failedCount = events.filter((event) => event.status === "Failed").length;
  const uniqueActors = new Set(events.map((event) => event.actor)).size;

  const page: CSSProperties = {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#172033",
    padding: 28,
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const card: CSSProperties = {
    background: "#fff",
    border: "1px solid #e7ebf1",
    borderRadius: 14,
    padding: 18,
  };

  const muted: CSSProperties = { color: "#778195", fontSize: 12 };

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setStatus("All");
    setActor("All");
    setDateFilter("All");
  }

  function refreshActivity() {
    setEvents((previous) => [...previous]);
    setNotice("Activity view refreshed. Sample records remain unchanged.");
  }

  function exportCsv() {
    const headers = [
      "Event ID",
      "Action",
      "Description",
      "Actor",
      "Email",
      "Category",
      "Status",
      "Resource",
      "IP Address",
      "Timestamp",
      "Details",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.action,
      event.description,
      event.actor,
      event.email,
      event.category,
      event.status,
      event.resource,
      event.ip,
      event.timestamp,
      event.details,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-workspace-activity.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Filtered activity records exported to CSV.");
  }

  return (
    <main style={page}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            Admin / Workspace / Workspace Activity
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-0.8px",
            }}
          >
            Workspace Activity
          </h1>
          <p style={{ ...muted, margin: 0, fontSize: 13 }}>
            Review workspace events, member actions, configuration changes, and security activity.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={buttonStyle} onClick={refreshActivity}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button style={buttonStyle} onClick={exportCsv}>
            <Download size={15} /> Export CSV
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
            gap: 10,
            marginBottom: 18,
            padding: "11px 14px",
            borderRadius: 10,
            background: "#ecfdf3",
            color: "#067647",
            border: "1px solid #abefc6",
            fontSize: 12,
          }}
        >
          <span>
            <CircleCheck
              size={15}
              style={{ verticalAlign: "middle", marginRight: 7 }}
            />
            {notice}
          </span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ ...buttonStyle, padding: 4, border: "none" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: "#fff8e7",
          border: "1px solid #f6df9c",
          color: "#875b0c",
          padding: "12px 15px",
          borderRadius: 11,
          marginBottom: 20,
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        <AlertTriangle size={17} style={{ flexShrink: 0 }} />
        <span>
          <strong>Prototype data:</strong> These are sample events for UI development.
          Production audit logs must be collected and verified by a secure backend.
        </span>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Total events",
            value: events.length,
            note: "Available activity records",
            icon: Activity,
            color: "#315fe9",
          },
          {
            label: "Successful events",
            value: successfulCount,
            note: "Completed sample actions",
            icon: CircleCheck,
            color: "#16845b",
          },
          {
            label: "Warnings",
            value: warningCount,
            note: "Events needing review",
            icon: AlertTriangle,
            color: "#b7791f",
          },
          {
            label: "Failed events",
            value: failedCount,
            note: "Sample unsuccessful actions",
            icon: ShieldCheck,
            color: "#d92d20",
          },
          {
            label: "Unique actors",
            value: uniqueActors,
            note: "Distinct sample actors",
            icon: Users,
            color: "#7c5ce7",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} style={card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 17,
                }}
              >
                <span style={{ ...muted, fontWeight: 600 }}>{metric.label}</span>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 10,
                    background: `${metric.color}12`,
                    color: metric.color,
                  }}
                >
                  <Icon size={17} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 750, marginBottom: 7 }}>
                {metric.value}
              </div>
              <div style={muted}>{metric.note}</div>
            </div>
          );
        })}
      </section>

      <section style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            padding: "19px 20px",
            borderBottom: "1px solid #edf0f4",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 16 }}>
              Activity event log
            </h2>
            <p style={{ ...muted, margin: 0 }}>
              {filteredEvents.length} matching events
            </p>
          </div>
          <button
            style={buttonStyle}
            onClick={() => setShowFilters((value) => !value)}
          >
            <Filter size={14} />
            {showFilters ? "Hide filters" : "Show filters"}
            <ChevronDown
              size={13}
              style={{
                transform: showFilters ? "rotate(180deg)" : "none",
                transition: "transform 150ms ease",
              }}
            />
          </button>
        </div>

        {showFilters && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
              gap: 10,
              padding: "16px 20px",
              background: "#fbfcfe",
              borderBottom: "1px solid #edf0f4",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                color="#98a2b3"
                style={{ position: "absolute", left: 11, top: 11 }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events..."
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={inputStyle}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All categories" : option}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={inputStyle}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All statuses" : option}
                </option>
              ))}
            </select>

            <select
              value={actor}
              onChange={(event) => setActor(event.target.value)}
              style={inputStyle}
            >
              <option value="All">All actors</option>
              {actors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              style={inputStyle}
            >
              {["All", "Today", "Yesterday", "Last 7 days"].map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "Any date" : option}
                </option>
              ))}
            </select>

            <button style={buttonStyle} onClick={resetFilters}>
              <X size={14} /> Clear filters
            </button>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              minWidth: 900,
            }}
          >
            <thead>
              <tr style={{ background: "#fbfcfe" }}>
                {["Event", "Actor", "Category", "Status", "Resource", "Time", ""].map(
                  (heading) => (
                    <th
                      key={heading || "actions"}
                      style={{
                        padding: "12px 15px",
                        fontSize: 10,
                        color: "#778195",
                        fontWeight: 700,
                        borderBottom: "1px solid #edf0f4",
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
              {filteredEvents.map((event) => {
                const Icon = eventIcon(event.category);

                return (
                  <tr key={event.id}>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #f0f2f6",
                        maxWidth: 300,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span
                          style={{
                            width: 33,
                            height: 33,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 9,
                            color: "#315fe9",
                            background: "#edf2ff",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#172033",
                              marginBottom: 5,
                            }}
                          >
                            {event.action}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              lineHeight: 1.6,
                              color: "#778195",
                            }}
                          >
                            {event.description}
                          </div>
                          <div style={{ ...muted, marginTop: 5 }}>
                            ID: EVT-{event.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "15px", borderBottom: "1px solid #f0f2f6" }}>
                      <div style={{ fontSize: 12, fontWeight: 650, marginBottom: 5 }}>
                        {event.actor}
                      </div>
                      <div style={{ ...muted, fontSize: 10 }}>{event.email}</div>
                    </td>

                    <td style={{ padding: "15px", borderBottom: "1px solid #f0f2f6" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 8px",
                          background: "#f2f4f7",
                          color: "#475467",
                          borderRadius: 7,
                          fontSize: 10,
                          fontWeight: 650,
                        }}
                      >
                        {event.category}
                      </span>
                    </td>

                    <td style={{ padding: "15px", borderBottom: "1px solid #f0f2f6" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 700,
                          color: statusColors[event.status],
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: statusColors[event.status],
                          }}
                        />
                        {event.status}
                      </span>
                    </td>

                    <td style={{ padding: "15px", borderBottom: "1px solid #f0f2f6" }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {event.resource}
                      </div>
                      <div style={{ ...muted, fontSize: 10, marginTop: 5 }}>
                        {event.ip}
                      </div>
                    </td>

                    <td style={{ padding: "15px", borderBottom: "1px solid #f0f2f6", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {formatTime(event.timestamp)}
                      </div>
                      <div style={{ ...muted, fontSize: 10, marginTop: 5 }}>
                        {formatDate(event.timestamp)}
                      </div>
                    </td>

                    <td style={{ padding: "15px", borderBottom: "1px solid #f0f2f6" }}>
                      <button
                        aria-label={`View details for event ${event.id}`}
                        style={{ ...buttonStyle, padding: 7 }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div style={{ padding: "45px 20px", textAlign: "center" }}>
            <ClipboardList size={30} color="#98a2b3" />
            <h3 style={{ fontSize: 15, margin: "12px 0 6px" }}>
              No activity events found
            </h3>
            <p style={{ ...muted, margin: "0 0 15px" }}>
              Try changing your search or filters.
            </p>
            <button style={buttonStyle} onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}

        <div
          style={{
            padding: "13px 20px",
            borderTop: "1px solid #edf0f4",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            fontSize: 11,
            color: "#778195",
          }}
        >
          <span>
            Showing {filteredEvents.length} of {events.length} events
          </span>
          <span>Newest events first</span>
        </div>
      </section>

      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "#10182880",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 16,
              background: "#fff",
              boxShadow: "0 24px 70px #10182830",
            }}
          >
            <div
              style={{
                padding: "21px 23px",
                borderBottom: "1px solid #edf0f4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>
                  Activity event details
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  EVT-{selectedEvent.id} · {formatDateTime(selectedEvent.timestamp)}
                </p>
              </div>
              <button
                aria-label="Close details"
                style={{ ...buttonStyle, padding: 6 }}
                onClick={() => setSelectedEvent(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: 23 }}>
              <div style={{ fontSize: 18, fontWeight: 750, marginBottom: 9 }}>
                {selectedEvent.action}
              </div>
              <p style={{ color: "#667085", fontSize: 13, lineHeight: 1.7, margin: "0 0 20px" }}>
                {selectedEvent.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Actor", selectedEvent.actor],
                  ["Email", selectedEvent.email],
                  ["Category", selectedEvent.category],
                  ["Status", selectedEvent.status],
                  ["Resource", selectedEvent.resource],
                  ["IP address", selectedEvent.ip],
                  ["Timestamp", formatDateTime(selectedEvent.timestamp)],
                  ["Event ID", `EVT-${selectedEvent.id}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 13,
                      border: "1px solid #edf0f4",
                      background: "#f8fafc",
                      borderRadius: 10,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ ...muted, marginBottom: 7 }}>{label}</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 650,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  Event details
                </div>
                <div
                  style={{
                    padding: 14,
                    background: "#f8fafc",
                    border: "1px solid #edf0f4",
                    borderRadius: 10,
                    fontSize: 12,
                    lineHeight: 1.8,
                    color: "#475467",
                  }}
                >
                  {selectedEvent.details}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button style={buttonStyle} onClick={() => setSelectedEvent(null)}>
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 18,
          color: "#98a2b3",
          fontSize: 11,
        }}
      >
        <ShieldCheck size={13} />
        ModelNow Workspace Activity
        <span style={{ marginLeft: "auto" }}>
          <Clock3 size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
          Activity monitoring prototype
        </span>
      </footer>
    </main>
  );
}
