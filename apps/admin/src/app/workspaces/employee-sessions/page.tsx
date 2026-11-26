
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  ShieldCheck,
  Clock3,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  LogOut,
  MapPin,
  Filter,
  Activity,
} from "lucide-react";

type SessionStatus = "Active" | "Expired" | "Revoked" | "Suspicious";
type DeviceType = "Desktop" | "Mobile" | "Tablet";

type EmployeeSession = {
  id: string;
  employee: string;
  email: string;
  role: string;
  device: DeviceType;
  browser: string;
  os: string;
  ip: string;
  location: string;
  started: string;
  lastActivity: string;
  duration: string;
  status: SessionStatus;
  mfa: boolean;
};

const initialSessions: EmployeeSession[] = [
  {
    id: "SES-1001",
    employee: "Priya Sharma",
    email: "priya.sharma@modelnow.ai",
    role: "Workspace Admin",
    device: "Desktop",
    browser: "Chrome 130",
    os: "Windows 11",
    ip: "103.21.58.104",
    location: "Hyderabad, India",
    started: "Nov 04, 2026 08:30",
    lastActivity: "2 minutes ago",
    duration: "2h 14m",
    status: "Active",
    mfa: true,
  },
  {
    id: "SES-1002",
    employee: "Rahul Verma",
    email: "rahul.verma@modelnow.ai",
    role: "Developer",
    device: "Desktop",
    browser: "Edge 129",
    os: "Windows 11",
    ip: "49.36.112.78",
    location: "Bengaluru, India",
    started: "Nov 04, 2026 09:05",
    lastActivity: "5 minutes ago",
    duration: "1h 39m",
    status: "Active",
    mfa: true,
  },
  {
    id: "SES-1003",
    employee: "Ananya Reddy",
    email: "ananya.reddy@modelnow.ai",
    role: "Data Analyst",
    device: "Mobile",
    browser: "Chrome Mobile",
    os: "Android 15",
    ip: "106.51.84.29",
    location: "Hyderabad, India",
    started: "Nov 04, 2026 09:40",
    lastActivity: "1 minute ago",
    duration: "1h 04m",
    status: "Active",
    mfa: true,
  },
  {
    id: "SES-1004",
    employee: "Arjun Kumar",
    email: "arjun.kumar@modelnow.ai",
    role: "AI Engineer",
    device: "Desktop",
    browser: "Firefox 132",
    os: "Ubuntu Linux",
    ip: "117.203.14.66",
    location: "Chennai, India",
    started: "Nov 04, 2026 07:10",
    lastActivity: "38 minutes ago",
    duration: "3h 34m",
    status: "Suspicious",
    mfa: false,
  },
  {
    id: "SES-1005",
    employee: "Sneha Patel",
    email: "sneha.patel@modelnow.ai",
    role: "Project Manager",
    device: "Tablet",
    browser: "Safari",
    os: "iPadOS 18",
    ip: "122.171.22.91",
    location: "Mumbai, India",
    started: "Nov 04, 2026 06:00",
    lastActivity: "1 hour ago",
    duration: "4h 44m",
    status: "Expired",
    mfa: true,
  },
  {
    id: "SES-1006",
    employee: "Kiran Rao",
    email: "kiran.rao@modelnow.ai",
    role: "Developer",
    device: "Desktop",
    browser: "Chrome 129",
    os: "macOS 15",
    ip: "14.143.92.10",
    location: "Pune, India",
    started: "Nov 03, 2026 16:20",
    lastActivity: "Yesterday",
    duration: "5h 12m",
    status: "Revoked",
    mfa: true,
  },
  {
    id: "SES-1007",
    employee: "Meera Nair",
    email: "meera.nair@modelnow.ai",
    role: "HR Manager",
    device: "Mobile",
    browser: "Safari Mobile",
    os: "iOS 18",
    ip: "117.98.41.25",
    location: "Kochi, India",
    started: "Nov 04, 2026 08:55",
    lastActivity: "8 minutes ago",
    duration: "1h 49m",
    status: "Active",
    mfa: true,
  },
];

const statusColors: Record<SessionStatus, CSSProperties> = {
  Active: { color: "#15803d", background: "#dcfce7" },
  Expired: { color: "#64748b", background: "#f1f5f9" },
  Revoked: { color: "#b91c1c", background: "#fee2e2" },
  Suspicious: { color: "#b45309", background: "#fef3c7" },
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  minHeight: 38,
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#374151",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  height: 40,
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#111827",
  fontSize: 13,
};

const cellStyle: CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
  fontSize: 12,
};

export default function EmployeeSessionsPage() {
  const [sessions, setSessions] = useState<EmployeeSession[]>(initialSessions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<EmployeeSession | null>(null);
  const [pendingRevoke, setPendingRevoke] =
    useState<EmployeeSession | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sessions.filter((s) => {
      const matchesQuery =
        !q ||
        [
          s.id,
          s.employee,
          s.email,
          s.role,
          s.device,
          s.browser,
          s.os,
          s.ip,
          s.location,
        ].some((value) => value.toLowerCase().includes(q));

      return (
        matchesQuery &&
        (statusFilter === "All" || s.status === statusFilter) &&
        (deviceFilter === "All" || s.device === deviceFilter)
      );
    });
  }, [sessions, search, statusFilter, deviceFilter]);

  const activeCount = sessions.filter((s) => s.status === "Active").length;
  const suspiciousCount = sessions.filter(
    (s) => s.status === "Suspicious"
  ).length;
  const revokedCount = sessions.filter((s) => s.status === "Revoked").length;

  function revokeSession(session: EmployeeSession) {
    setSessions((current) =>
      current.map((s) =>
        s.id === session.id ? { ...s, status: "Revoked" } : s
      )
    );
    setPendingRevoke(null);
    setSelected(null);
    setNotice(`${session.employee}'s session was marked as revoked.`);
  }

  function revokeFiltered() {
    const ids = new Set(
      filtered
        .filter((s) => s.status === "Active" || s.status === "Suspicious")
        .map((s) => s.id)
    );

    setSessions((current) =>
      current.map((s) =>
        ids.has(s.id) ? { ...s, status: "Revoked" } : s
      )
    );

    setConfirmBulk(false);
    setNotice(
      ids.size
        ? `${ids.size} session(s) marked as revoked.`
        : "No active or suspicious sessions matched your filters."
    );
  }

  function exportCsv() {
    const columns: (keyof EmployeeSession)[] = [
      "id",
      "employee",
      "email",
      "role",
      "device",
      "browser",
      "os",
      "ip",
      "location",
      "started",
      "lastActivity",
      "duration",
      "status",
      "mfa",
    ];

    const quote = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const content = [
      columns.join(","),
      ...filtered.map((s) => columns.map((key) => quote(s[key])).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-employee-sessions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    {
      label: "Total Sessions",
      value: sessions.length,
      icon: Users,
      color: "#2563eb",
      bg: "#eff6ff",
      description: "Recorded sessions",
    },
    {
      label: "Active Sessions",
      value: activeCount,
      icon: Activity,
      color: "#15803d",
      bg: "#dcfce7",
      description: "Currently active in demo",
    },
    {
      label: "Suspicious Sessions",
      value: suspiciousCount,
      icon: AlertTriangle,
      color: "#b45309",
      bg: "#fef3c7",
      description: "Require administrator review",
    },
    {
      label: "Revoked Sessions",
      value: revokedCount,
      icon: ShieldCheck,
      color: "#b91c1c",
      bg: "#fee2e2",
      description: "Marked as revoked",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
        padding: "28px clamp(14px, 3vw, 32px)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#64748b",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              <ShieldCheck size={15} /> Admin / Workspace / Security
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                letterSpacing: "-0.8px",
              }}
            >
              Employee Sessions
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.6,
                margin: "9px 0 0",
              }}
            >
              Monitor employee sign-ins, devices, session activity, and access
              security.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            <button
              style={buttonStyle}
              onClick={() =>
                setNotice("Session list refreshed from current demo data.")
              }
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button style={buttonStyle} onClick={exportCsv}>
              <Download size={15} /> Export CSV
            </button>
            <button
              style={{
                ...buttonStyle,
                background: "#b91c1c",
                borderColor: "#b91c1c",
                color: "#fff",
              }}
              onClick={() => setConfirmBulk(true)}
            >
              <LogOut size={15} /> Revoke filtered
            </button>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: 13,
              marginBottom: 18,
              borderRadius: 10,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 13,
            }}
          >
            {notice}
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <section
                key={item.label}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: 13 }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: item.bg,
                      color: item.color,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 750,
                    marginTop: 14,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 6,
                  }}
                >
                  {item.description}
                </div>
              </section>
            );
          })}
        </div>

        {suspiciousCount > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: 16,
              border: "1px solid #fde68a",
              background: "#fffbeb",
              borderRadius: 12,
              marginBottom: 22,
              color: "#92400e",
            }}
          >
            <AlertTriangle size={20} />
            <div>
              <strong>Suspicious activity needs review</strong>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: "5px 0 0",
                }}
              >
                {suspiciousCount} session(s) are marked suspicious in this
                sample dataset. Review device, location, and MFA details.
              </p>
            </div>
          </div>
        )}

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div>
              <h2 style={{ fontSize: 17, margin: 0 }}>
                Session inventory
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  margin: "6px 0 0",
                }}
              >
                {filtered.length} of {sessions.length} sessions
              </p>
            </div>
            <button
              style={buttonStyle}
              onClick={() => setShowFilters((value) => !value)}
            >
              <Filter size={15} /> Filters
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              padding: 16,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 270px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  color: "#94a3b8",
                }}
              />
              <input
                aria-label="Search employee sessions"
                placeholder="Search employee, email, IP, device..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ ...inputStyle, paddingLeft: 37 }}
              />
            </div>

            {showFilters && (
              <>
                <select
                  aria-label="Filter session status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={{ ...inputStyle, width: "auto", minWidth: 145 }}
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspicious">Suspicious</option>
                  <option value="Expired">Expired</option>
                  <option value="Revoked">Revoked</option>
                </select>

                <select
                  aria-label="Filter device type"
                  value={deviceFilter}
                  onChange={(event) => setDeviceFilter(event.target.value)}
                  style={{ ...inputStyle, width: "auto", minWidth: 145 }}
                >
                  <option value="All">All devices</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Tablet">Tablet</option>
                </select>

                <button
                  style={buttonStyle}
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setDeviceFilter("All");
                  }}
                >
                  Reset
                </button>
              </>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1000,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "EMPLOYEE",
                    "DEVICE",
                    "LOCATION / IP",
                    "LAST ACTIVITY",
                    "MFA",
                    "STATUS",
                    "ACTIONS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 16px",
                        color: "#64748b",
                        fontSize: 10,
                        letterSpacing: "0.6px",
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
                {filtered.map((session) => {
                  const DeviceIcon =
                    session.device === "Desktop"
                      ? Monitor
                      : session.device === "Mobile"
                        ? Smartphone
                        : Tablet;

                  return (
                    <tr key={session.id}>
                      <td style={cellStyle}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: 10,
                              background: "#eff6ff",
                              color: "#2563eb",
                              fontWeight: 700,
                            }}
                          >
                            {session.employee
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {session.employee}
                            </div>
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: 11,
                                marginTop: 4,
                              }}
                            >
                              {session.email}
                            </div>
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: 10,
                                marginTop: 4,
                              }}
                            >
                              {session.id} · {session.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <DeviceIcon size={17} color="#64748b" />
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {session.device}
                            </div>
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: 11,
                                marginTop: 4,
                              }}
                            >
                              {session.browser}
                            </div>
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: 10,
                                marginTop: 3,
                              }}
                            >
                              {session.os}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "flex-start",
                          }}
                        >
                          <MapPin size={14} color="#64748b" />
                          <div>
                            <div>{session.location}</div>
                            <div
                              style={{
                                color: "#64748b",
                                marginTop: 5,
                                fontSize: 11,
                              }}
                            >
                              {session.ip}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <div>{session.lastActivity}</div>
                        <div
                          style={{
                            color: "#64748b",
                            marginTop: 5,
                            fontSize: 11,
                            display: "flex",
                            gap: 5,
                            alignItems: "center",
                          }}
                        >
                          <Clock3 size={12} />
                          {session.duration}
                        </div>
                      </td>

                      <td style={cellStyle}>
                        <span
                          style={{
                            color: session.mfa ? "#15803d" : "#b45309",
                            display: "inline-flex",
                            gap: 5,
                            alignItems: "center",
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {session.mfa ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <AlertTriangle size={14} />
                          )}
                          {session.mfa ? "Enabled" : "Not enabled"}
                        </span>
                      </td>

                      <td style={cellStyle}>
                        <span
                          style={{
                            ...statusColors[session.status],
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {session.status === "Active" ? (
                            <CheckCircle2 size={12} />
                          ) : session.status === "Suspicious" ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {session.status}
                        </span>
                      </td>

                      <td style={cellStyle}>
                        <div style={{ display: "flex", gap: 7 }}>
                          <button
                            title="View details"
                            aria-label="View session details"
                            style={iconButtonStyle}
                            onClick={() => setSelected(session)}
                          >
                            <Eye size={15} />
                          </button>
                          {(session.status === "Active" ||
                            session.status === "Suspicious") && (
                            <button
                              title="Revoke session"
                              aria-label="Revoke employee session"
                              style={{
                                ...iconButtonStyle,
                                color: "#b91c1c",
                                borderColor: "#fecaca",
                              }}
                              onClick={() => setPendingRevoke(session)}
                            >
                              <LogOut size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 45,
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <Search
                        size={26}
                        style={{ display: "block", margin: "0 auto 10px" }}
                      />
                      No sessions found. Try changing your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderTop: "1px solid #e5e7eb",
              color: "#64748b",
              fontSize: 11,
            }}
          >
            Showing {filtered.length} of {sessions.length} sample sessions.
          </div>
        </section>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginTop: 18,
            padding: 15,
            border: "1px solid #e2e8f0",
            background: "#f1f5f9",
            borderRadius: 10,
            color: "#475569",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          <ShieldCheck size={18} />
          <div>
            <strong>Backend integration required:</strong> This page uses
            sample data. Revoking a session only changes its displayed status.
            Connect your authentication backend to enforce session termination,
            MFA checks, and security audit logging.
          </div>
        </div>
      </div>

      {selected && (
        <div style={overlayStyle} onClick={() => setSelected(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-detail-title"
            style={modalStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="session-detail-title" style={{ margin: 0, fontSize: 19 }}>
                  Session details
                </h2>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                  {selected.id}
                </p>
              </div>
              <button
                aria-label="Close details"
                style={iconButtonStyle}
                onClick={() => setSelected(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 5px", fontSize: 16 }}>
                {selected.employee}
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  margin: "0 0 20px",
                  overflowWrap: "anywhere",
                }}
              >
                {selected.email} · {selected.role}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: 10,
                }}
              >
                {[
                  ["Device", selected.device],
                  ["Browser", selected.browser],
                  ["Operating system", selected.os],
                  ["IP address", selected.ip],
                  ["Location", selected.location],
                  ["Started", selected.started],
                  ["Last activity", selected.lastActivity],
                  ["Duration", selected.duration],
                  ["MFA", selected.mfa ? "Enabled" : "Not enabled"],
                  ["Status", selected.status],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      background: "#f8fafc",
                      borderRadius: 9,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#64748b",
                        marginBottom: 7,
                      }}
                    >
                      {label}
                    </div>
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                  marginTop: 22,
                }}
              >
                <button style={buttonStyle} onClick={() => setSelected(null)}>
                  Close
                </button>
                {(selected.status === "Active" ||
                  selected.status === "Suspicious") && (
                  <button
                    style={{
                      ...buttonStyle,
                      color: "#fff",
                      background: "#b91c1c",
                      borderColor: "#b91c1c",
                    }}
                    onClick={() => {
                      setPendingRevoke(selected);
                      setSelected(null);
                    }}
                  >
                    <LogOut size={14} /> Revoke session
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {(pendingRevoke || confirmBulk) && (
        <div style={overlayStyle}>
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="revoke-title"
            style={{ ...modalStyle, maxWidth: 430 }}
          >
            <div style={{ padding: 24 }}>
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#fee2e2",
                  color: "#b91c1c",
                  marginBottom: 16,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h2 id="revoke-title" style={{ margin: "0 0 10px", fontSize: 18 }}>
                {confirmBulk ? "Revoke filtered sessions?" : "Revoke session?"}
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: "0 0 22px",
                }}
              >
                {confirmBulk
                  ? `This will mark active or suspicious sessions among ${filtered.length} filtered records as revoked.`
                  : `This will mark ${pendingRevoke?.employee}'s session as revoked.`}{" "}
                This action only updates this demo page, not a real login session.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                }}
              >
                <button
                  style={buttonStyle}
                  onClick={() => {
                    setPendingRevoke(null);
                    setConfirmBulk(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    color: "#fff",
                    background: "#b91c1c",
                    borderColor: "#b91c1c",
                  }}
                  onClick={() => {
                    if (confirmBulk) {
                      revokeFiltered();
                    } else if (pendingRevoke) {
                      revokeSession(pendingRevoke);
                    }
                  }}
                >
                  <LogOut size={14} /> Confirm revoke
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const iconButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  color: "#475569",
  cursor: "pointer",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(3px)",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 700,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "20px 22px",
  borderBottom: "1px solid #e5e7eb",
};
