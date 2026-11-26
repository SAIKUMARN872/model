
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  Filter,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

type SecurityEvent = {
  id: string;
  time: string;
  event: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  actor: string;
  ip: string;
  resource: string;
  status: "Detected" | "Blocked" | "Resolved" | "Investigating";
  organization: string;
  description: string;
};

const initialEvents: SecurityEvent[] = [
  {
    id: "SEC-5001",
    time: "2026-11-04 10:48:21",
    event: "Multiple failed login attempts",
    category: "Authentication",
    severity: "High",
    actor: "unknown.user@example.com",
    ip: "192.0.2.41",
    resource: "Admin sign-in",
    status: "Detected",
    organization: "ModelNow Workspace",
    description: "Multiple unsuccessful login attempts were recorded in this illustrative event. Verify the actual identity and source before taking action.",
  },
  {
    id: "SEC-5002",
    time: "2026-11-04 10:41:09",
    event: "Unauthorized API request blocked",
    category: "Access Control",
    severity: "Critical",
    actor: "service-account-demo",
    ip: "198.51.100.18",
    resource: "/api/admin/users",
    status: "Blocked",
    organization: "Acme AI",
    description: "A request without the required authorization was blocked in the demo dataset.",
  },
  {
    id: "SEC-5003",
    time: "2026-11-04 10:29:44",
    event: "Administrator role assigned",
    category: "Permission Change",
    severity: "Medium",
    actor: "admin@modelnow.example",
    ip: "203.0.113.12",
    resource: "User permissions",
    status: "Investigating",
    organization: "ModelNow Workspace",
    description: "An administrator role assignment requires verification against the organization's approval policy.",
  },
  {
    id: "SEC-5004",
    time: "2026-11-04 10:12:30",
    event: "Unusual session activity",
    category: "Session",
    severity: "High",
    actor: "analyst@example.com",
    ip: "198.51.100.72",
    resource: "Active session",
    status: "Investigating",
    organization: "Northstar Labs",
    description: "The illustrative event was flagged for unusual session activity. Review session metadata and identity-provider records.",
  },
  {
    id: "SEC-5005",
    time: "2026-11-04 09:57:16",
    event: "Rate limit triggered",
    category: "API Protection",
    severity: "Medium",
    actor: "api-client-demo",
    ip: "192.0.2.88",
    resource: "AI Gateway",
    status: "Blocked",
    organization: "Bright AI",
    description: "The request rate exceeded a configured example threshold and was blocked.",
  },
  {
    id: "SEC-5006",
    time: "2026-11-04 09:40:03",
    event: "Security policy violation",
    category: "Policy",
    severity: "High",
    actor: "System",
    ip: "—",
    resource: "Data access policy",
    status: "Detected",
    organization: "Vertex Systems",
    description: "A policy check reported a potential violation. Review the policy engine's actual decision and evidence.",
  },
  {
    id: "SEC-5007",
    time: "2026-11-03 18:32:51",
    event: "User session revoked",
    category: "Session",
    severity: "Low",
    actor: "admin@modelnow.example",
    ip: "203.0.113.12",
    resource: "Session management",
    status: "Resolved",
    organization: "ModelNow Workspace",
    description: "A user session was revoked in the sample audit history.",
  },
  {
    id: "SEC-5008",
    time: "2026-11-03 17:15:27",
    event: "Repeated access denied",
    category: "Access Control",
    severity: "Medium",
    actor: "user-demo-104",
    ip: "192.0.2.105",
    resource: "Knowledge Hub",
    status: "Resolved",
    organization: "Acme AI",
    description: "Repeated denied access to a protected resource was recorded in this demo event.",
  },
  {
    id: "SEC-5009",
    time: "2026-11-03 16:04:12",
    event: "Credential rotation completed",
    category: "Credential",
    severity: "Low",
    actor: "System",
    ip: "—",
    resource: "Provider credentials",
    status: "Resolved",
    organization: "ModelNow Workspace",
    description: "A credential rotation completion event was included in the example audit history. Secret values are intentionally excluded.",
  },
];

const severityOptions = ["All", "Critical", "High", "Medium", "Low"];
const statusOptions = ["All", "Detected", "Blocked", "Resolved", "Investigating"];
const categoryOptions = [
  "All",
  "Authentication",
  "Access Control",
  "Permission Change",
  "Session",
  "API Protection",
  "Policy",
  "Credential",
];

export default function SecurityEventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<SecurityEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.event,
        event.category,
        event.actor,
        event.ip,
        event.resource,
        event.organization,
        event.severity,
        event.status,
      ];

      return (
        (!query || searchable.some((value) => value.toLowerCase().includes(query))) &&
        (severity === "All" || event.severity === severity) &&
        (status === "All" || event.status === status) &&
        (category === "All" || event.category === category)
      );
    });
  }, [events, search, severity, status, category]);

  const criticalCount = events.filter((event) => event.severity === "Critical").length;
  const highCount = events.filter((event) => event.severity === "High").length;
  const unresolvedCount = events.filter((event) =>
    ["Detected", "Investigating"].includes(event.status)
  ).length;
  const blockedCount = events.filter((event) => event.status === "Blocked").length;

  function exportEvents(format: "csv" | "json") {
    const content =
      format === "json"
        ? JSON.stringify(filtered, null, 2)
        : [
            [
              "ID",
              "Timestamp",
              "Event",
              "Category",
              "Severity",
              "Actor",
              "IP",
              "Resource",
              "Status",
              "Organization",
              "Description",
            ].join(","),
            ...filtered.map((event) =>
              [
                event.id,
                event.time,
                event.event,
                event.category,
                event.severity,
                event.actor,
                event.ip,
                event.resource,
                event.status,
                event.organization,
                event.description,
              ]
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",")
            ),
          ].join("\n");

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `modelnow-security-events.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${filtered.length} security events exported as ${format.toUpperCase()}.`);
  }

  function refresh() {
    setEvents([...initialEvents]);
    setSearch("");
    setSeverity("All");
    setStatus("All");
    setCategory("All");
    setNotice("Security events refreshed using demo data.");
  }

  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Admin</Link>
        <span>/</span>
        <Link href="/audit-logs">Audit Logs</Link>
        <span>/</span>
        <strong>Security Events</strong>
      </div>

      <header className="header">
        <div className="heading">
          <div className="headingIcon"><Shield size={23} /></div>
          <div>
            <h1>Security Events</h1>
            <p>
              Monitor authentication failures, suspicious activity, access
              violations, session changes, and security policy alerts.
            </p>
          </div>
        </div>

        <div className="headerActions">
          <button className="button secondary" onClick={refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="button primary" onClick={() => exportEvents("csv")}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </header>

      <div className="warning">
        <ShieldAlert size={18} />
        <div>
          <strong>Security monitoring demo</strong>
          <p>
            These are sample records, not live threat detections. Connect your
            identity provider, API gateway, security event pipeline, and
            authorization logs before using this page for incident response.
            Never store passwords, access tokens, or secret keys in audit logs.
          </p>
        </div>
      </div>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metrics">
        <article className="metric">
          <div className="metricTop">
            <span>Total security events</span>
            <Activity size={18} />
          </div>
          <strong>{events.length}</strong>
          <small>Records in the current demo dataset</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Critical severity</span>
            <AlertTriangle size={18} className="red" />
          </div>
          <strong>{criticalCount}</strong>
          <small>Events marked critical</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>High severity</span>
            <ShieldAlert size={18} className="orange" />
          </div>
          <strong>{highCount}</strong>
          <small>Events marked high</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Needs review</span>
            <Clock3 size={18} className="purple" />
          </div>
          <strong>{unresolvedCount}</strong>
          <small>{blockedCount} blocked events in the dataset</small>
        </article>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Security event history</h2>
            <p>Filter, inspect, and export security-related audit records.</p>
          </div>
          <div className="exportGroup">
            <button className="button secondary" onClick={() => exportEvents("json")}>
              <FileJson size={15} /> JSON
            </button>
            <button className="button secondary" onClick={() => exportEvents("csv")}>
              <FileSpreadsheet size={15} /> CSV
            </button>
          </div>
        </div>

        <div className="filters">
          <label className="searchBox">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search event, actor, IP, resource..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>

          <label className="selectBox">
            <Filter size={15} />
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              {severityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All severities" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <Activity size={15} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All statuses" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <LockKeyhole size={15} />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All categories" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>

        <div className="tableMeta">
          <span>Showing <strong>{filtered.length}</strong> of {events.length} events</span>
          <span><Shield size={14} /> Latest first · Demo records</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Event / ID</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Actor</th>
                <th>Source IP</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Organization</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.event}</strong>
                    <small className="muted">{event.id}</small>
                  </td>
                  <td>
                    <span className={`severity ${event.severity.toLowerCase()}`}>
                      <span className="severityDot" />
                      {event.severity}
                    </span>
                  </td>
                  <td><span className="category">{event.category}</span></td>
                  <td><strong>{event.actor}</strong></td>
                  <td className="ip">{event.ip}</td>
                  <td>{event.resource}</td>
                  <td>
                    <span className={`status ${event.status.toLowerCase()}`}>
                      <span className="statusDot" />
                      {event.status}
                    </span>
                  </td>
                  <td>{event.organization}</td>
                  <td className="time">{event.time}</td>
                  <td>
                    <button
                      className="iconButton"
                      title="View event details"
                      aria-label={`View ${event.id}`}
                      onClick={() => setSelected(event)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className="empty">
                      <Search size={25} />
                      <strong>No security events found</strong>
                      <span>Try another search term or change your filters.</span>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setSearch("");
                          setSeverity("All");
                          setStatus("All");
                          setCategory("All");
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
      </section>

      {selected && (
        <div className="modalBackdrop" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modalHeader">
              <div>
                <span className="eyebrow">SECURITY AUDIT RECORD</span>
                <h2 id="modalTitle">{selected.event}</h2>
                <p>{selected.id}</p>
              </div>
              <button
                className="iconButton"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="modalBody">
              <div className="detailStatus">
                <span className={`severity ${selected.severity.toLowerCase()}`}>
                  <span className="severityDot" /> {selected.severity}
                </span>
                <span className={`status ${selected.status.toLowerCase()}`}>
                  <span className="statusDot" /> {selected.status}
                </span>
              </div>

              <p className="description">{selected.description}</p>

              <div className="detailsGrid">
                <Detail label="Event ID" value={selected.id} />
                <Detail label="Timestamp" value={selected.time} />
                <Detail label="Event category" value={selected.category} />
                <Detail label="Actor" value={selected.actor} />
                <Detail label="Source IP" value={selected.ip} />
                <Detail label="Resource" value={selected.resource} />
                <Detail label="Organization" value={selected.organization} />
                <Detail label="Status" value={selected.status} />
              </div>

              <div className="recommendation">
                <ShieldAlert size={17} />
                <p>
                  <strong>Review guidance</strong>
                  <span>
                    Verify the event against trusted identity and gateway logs.
                    Take containment actions only through your approved security workflow.
                  </span>
                </p>
              </div>
            </div>

            <footer className="modalFooter">
              <button className="button secondary" onClick={() => setSelected(null)}>
                Close
              </button>
              <button
                className="button primary"
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(selected, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `${selected.id}.json`;
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={15} /> Export record
              </button>
            </footer>
          </section>
        </div>
      )}

      <div className="bottomLink">
        <Link href="/audit-logs"><ArrowLeft size={15} /> Back to Audit Logs overview</Link>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; padding: 28px; background: #f7f8fc; color: #172033; font-family: Arial, Helvetica, sans-serif; }
        .breadcrumbs { display: flex; align-items: center; gap: 9px; color: #8b94a7; font-size: 12px; margin-bottom: 23px; }
        .breadcrumbs a, .bottomLink a { color: #65718a; text-decoration: none; }
        .breadcrumbs a:hover, .bottomLink a:hover { color: #315bea; }
        .breadcrumbs strong { color: #202b40; font-weight: 600; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 22px; }
        .heading { display: flex; gap: 14px; align-items: flex-start; }
        .headingIcon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; background: #e9efff; color: #315bea; flex-shrink: 0; }
        h1 { font-size: 27px; letter-spacing: -.7px; margin: 0 0 8px; font-weight: 750; }
        .heading p, .panelHeader p { margin: 0; color: #778198; font-size: 13px; line-height: 1.6; max-width: 720px; }
        .headerActions, .exportGroup { display: flex; gap: 9px; flex-wrap: wrap; }
        .button { border: 1px solid #dfe4ed; border-radius: 9px; padding: 10px 13px; display: inline-flex; gap: 8px; align-items: center; justify-content: center; font-size: 12px; font-weight: 650; cursor: pointer; white-space: nowrap; transition: .15s; }
        .secondary { background: #fff; color: #39455c; }
        .secondary:hover { background: #f3f5fa; border-color: #cbd4e3; }
        .primary { background: #315bea; border-color: #315bea; color: white; }
        .primary:hover { background: #2349cf; }
        .warning { display: flex; gap: 12px; align-items: flex-start; padding: 15px; margin-bottom: 20px; border: 1px solid #f1d6a4; background: #fff9ec; color: #855d18; border-radius: 11px; }
        .warning > svg { flex-shrink: 0; margin-top: 1px; }
        .warning strong { font-size: 12px; }
        .warning p { margin: 5px 0 0; font-size: 12px; line-height: 1.65; }
        .notice { display: flex; align-items: center; gap: 9px; padding: 11px 13px; border: 1px solid #bfe8d3; background: #edfbf3; color: #17683c; border-radius: 9px; font-size: 12px; margin-bottom: 16px; }
        .notice span { flex: 1; }
        .notice button { background: none; border: 0; color: inherit; cursor: pointer; display: flex; }
        .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 15px; margin-bottom: 22px; }
        .metric { background: #fff; border: 1px solid #e7eaf1; border-radius: 13px; padding: 18px; box-shadow: 0 2px 7px #1b2b4a05; min-width: 0; }
        .metricTop { display: flex; justify-content: space-between; align-items: center; color: #758096; font-size: 12px; margin-bottom: 17px; }
        .metricTop svg { color: #8794ad; }
        .metric strong { display: block; font-size: 26px; letter-spacing: -.5px; margin-bottom: 7px; }
        .metric small { color: #929bad; font-size: 11px; line-height: 1.5; }
        .red { color: #dc4545 !important; }
        .orange { color: #d97706 !important; }
        .purple { color: #805ad5 !important; }
        .panel { background: white; border: 1px solid #e6eaf1; border-radius: 13px; overflow: hidden; box-shadow: 0 2px 7px #1b2b4a05; }
        .panelHeader { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 20px 22px; border-bottom: 1px solid #edf0f5; }
        .panelHeader h2 { font-size: 15px; margin: 0 0 6px; font-weight: 750; }
        .panelHeader p { font-size: 12px; }
        .filters { display: flex; gap: 10px; padding: 16px 22px; border-bottom: 1px solid #edf0f5; }
        .searchBox, .selectBox { height: 39px; display: flex; align-items: center; gap: 9px; border: 1px solid #e0e5ee; border-radius: 8px; padding: 0 11px; color: #8791a5; background: white; }
        .searchBox { flex: 1; min-width: 170px; }
        .searchBox input { flex: 1; min-width: 0; border: 0; outline: none; color: #263148; font-size: 12px; background: transparent; }
        .searchBox input::placeholder { color: #a1a9b8; }
        .searchBox button { display: flex; border: 0; background: none; color: #8993a7; cursor: pointer; }
        .selectBox { min-width: 145px; }
        .selectBox select { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #45516a; appearance: none; font-size: 11px; cursor: pointer; }
        .tableMeta { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 22px; font-size: 11px; color: #8490a5; }
        .tableMeta strong { color: #344159; }
        .tableMeta span:last-child { display: flex; align-items: center; gap: 6px; }
        .tableWrap { width: 100%; overflow-x: auto; }
        table { width: 100%; min-width: 1300px; border-collapse: collapse; text-align: left; }
        th { padding: 12px 14px; background: #fafbfe; border-top: 1px solid #edf0f5; border-bottom: 1px solid #edf0f5; color: #8791a5; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; white-space: nowrap; }
        td { padding: 14px; border-bottom: 1px solid #f0f2f6; color: #566178; font-size: 11px; white-space: nowrap; }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #fafbff; }
        td strong { display: block; color: #2d384e; font-size: 11px; font-weight: 650; }
        .muted { display: block; color: #99a1b0; font-size: 10px; margin-top: 5px; }
        .ip { font-family: monospace; color: #53617a; }
        .category { display: inline-flex; padding: 5px 8px; border-radius: 6px; background: #f0f3fa; color: #53627d; font-size: 10px; }
        .severity, .status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; font-size: 10px; font-weight: 650; white-space: nowrap; }
        .severityDot, .statusDot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .critical { color: #b42318; background: #feeceb; }
        .high { color: #c2410c; background: #fff0e7; }
        .medium { color: #9b6b10; background: #fff7e5; }
        .low { color: #53627d; background: #eef1f6; }
        .detected { color: #b45309; background: #fff4df; }
        .blocked { color: #b42318; background: #feeceb; }
        .resolved { color: #16804c; background: #eaf8f0; }
        .investigating { color: #6045b5; background: #f0ebff; }
        .time { color: #758096; font-size: 10px; }
        .iconButton { width: 31px; height: 31px; display: inline-grid; place-items: center; border: 1px solid #e5e9f0; border-radius: 8px; background: white; color: #65718a; cursor: pointer; }
        .iconButton:hover { color: #315bea; border-color: #b8c8ff; background: #f4f6ff; }
        .empty { min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #8994a8; }
        .empty strong { color: #39465e; font-size: 14px; }
        .empty span { font-size: 12px; }
        .modalBackdrop { position: fixed; inset: 0; z-index: 100; background: #10182880; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal { width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; background: white; border-radius: 15px; box-shadow: 0 20px 70px #0003; }
        .modalHeader { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px; border-bottom: 1px solid #edf0f5; }
        .eyebrow { color: #315bea; font-size: 10px; letter-spacing: 1px; font-weight: 750; }
        .modalHeader h2 { margin: 9px 0 5px; color: #202b40; font-size: 19px; }
        .modalHeader p { margin: 0; color: #8993a7; font-size: 12px; }
        .modalBody { padding: 22px; }
        .detailStatus { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 17px; }
        .description { padding: 12px 14px; border-radius: 9px; background: #f7f8fc; color: #667189; font-size: 12px; line-height: 1.65; margin: 0 0 20px; }
        .detailsGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 22px; }
        .detailLabel { color: #8b95a8; font-size: 10px; margin-bottom: 6px; }
        .detailValue { color: #2f3b52; font-size: 12px; font-weight: 600; overflow-wrap: anywhere; }
        .recommendation { display: flex; align-items: flex-start; gap: 10px; margin-top: 22px; padding: 13px; border: 1px solid #f1d6a4; background: #fff9ec; color: #855d18; border-radius: 9px; }
        .recommendation > svg { flex-shrink: 0; margin-top: 1px; }
        .recommendation p { margin: 0; display: grid; gap: 5px; }
        .recommendation strong { font-size: 11px; }
        .recommendation span { font-size: 11px; line-height: 1.6; }
        .modalFooter { display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px; border-top: 1px solid #edf0f5; }
        .bottomLink { padding-top: 18px; font-size: 12px; }
        .bottomLink a { display: inline-flex; gap: 7px; align-items: center; }
        @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .header { flex-direction: column; } .filters { flex-wrap: wrap; } .searchBox { flex-basis: 100%; } }
        @media (max-width: 700px) { .page { padding: 17px; } .filters { flex-direction: column; } .selectBox { width: 100%; } .panelHeader { align-items: flex-start; flex-direction: column; } .tableMeta { align-items: flex-start; flex-direction: column; } .detailsGrid { grid-template-columns: 1fr; } .headerActions { width: 100%; } .headerActions .button { flex: 1; } }
        @media (max-width: 420px) { .metrics { grid-template-columns: 1fr; } h1 { font-size: 23px; } }
      `}</style>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="detailLabel">{label}</div>
      <div className="detailValue">{value}</div>
    </div>
  );
}
