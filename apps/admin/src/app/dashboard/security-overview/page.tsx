
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  Globe,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Users,
  X,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type EventStatus = "Open" | "Investigating" | "Resolved";

type SecurityEvent = {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  actor: string;
  source: string;
  time: string;
  status: EventStatus;
  description: string;
};

const initialEvents: SecurityEvent[] = [
  {
    id: "SEC-2048",
    title: "Repeated failed login attempts",
    category: "Authentication",
    severity: "Critical",
    actor: "admin@acme.example",
    source: "203.0.113.42",
    time: "2026-11-04 10:42",
    status: "Investigating",
    description: "Multiple unsuccessful sign-in attempts were recorded for a privileged account.",
  },
  {
    id: "SEC-2047",
    title: "Unusual API request volume",
    category: "API Security",
    severity: "High",
    actor: "org-northstar",
    source: "198.51.100.17",
    time: "2026-11-04 10:18",
    status: "Open",
    description: "Request volume exceeded the illustrative baseline for this organization.",
  },
  {
    id: "SEC-2046",
    title: "New administrator session",
    category: "Session Management",
    severity: "Medium",
    actor: "security@modelnow.example",
    source: "192.0.2.25",
    time: "2026-11-04 09:55",
    status: "Resolved",
    description: "A new administrator session was created. Review the session if it was unexpected.",
  },
  {
    id: "SEC-2045",
    title: "API key rotation overdue",
    category: "Credential Management",
    severity: "High",
    actor: "org-vertex",
    source: "192.0.2.81",
    time: "2026-11-04 09:30",
    status: "Open",
    description: "A sample API credential has exceeded the configured rotation interval.",
  },
  {
    id: "SEC-2044",
    title: "MFA challenge completed",
    category: "Authentication",
    severity: "Low",
    actor: "operator@brightpath.example",
    source: "198.51.100.44",
    time: "2026-11-04 09:05",
    status: "Resolved",
    description: "A multi-factor authentication challenge was successfully completed.",
  },
  {
    id: "SEC-2043",
    title: "Rate limit triggered",
    category: "API Security",
    severity: "Medium",
    actor: "org-acme",
    source: "203.0.113.19",
    time: "2026-11-04 08:48",
    status: "Investigating",
    description: "A sample API client exceeded the configured request rate threshold.",
  },
  {
    id: "SEC-2042",
    title: "Permission change detected",
    category: "Access Control",
    severity: "Medium",
    actor: "admin@vertex.example",
    source: "192.0.2.62",
    time: "2026-11-03 17:20",
    status: "Open",
    description: "A role assignment changed. Verify that the change was authorized.",
  },
  {
    id: "SEC-2041",
    title: "Suspicious token rejected",
    category: "Credential Management",
    severity: "High",
    actor: "org-demo",
    source: "203.0.113.76",
    time: "2026-11-03 16:44",
    status: "Resolved",
    description: "A sample request containing an invalid token was rejected.",
  },
];

const severityStyle: Record<Severity, CSSProperties> = {
  Critical: { color: "#b42318", background: "#fee4e2" },
  High: { color: "#b54708", background: "#fff0d5" },
  Medium: { color: "#175cd3", background: "#eaf2ff" },
  Low: { color: "#027a48", background: "#dcfae6" },
};

const statusStyle: Record<EventStatus, CSSProperties> = {
  Open: { color: "#b54708", background: "#fff0d5" },
  Investigating: { color: "#175cd3", background: "#eaf2ff" },
  Resolved: { color: "#027a48", background: "#dcfae6" },
};

const css: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#f7f8fa", color: "#172033", padding: 28, fontFamily: "Arial, Helvetica, sans-serif" },
  container: { maxWidth: 1480, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 22 },
  eyebrow: { color: "#718096", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 750, letterSpacing: -0.7, margin: 0 },
  subtitle: { fontSize: 13, color: "#718096", lineHeight: 1.6, marginTop: 8, maxWidth: 700 },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #dce2ea", background: "#fff", color: "#344054", borderRadius: 9, padding: "10px 13px", fontSize: 12, fontWeight: 650, cursor: "pointer" },
  primary: { background: "#315fe9", borderColor: "#315fe9", color: "#fff" },
  warning: { display: "flex", alignItems: "flex-start", gap: 10, padding: 13, borderRadius: 10, background: "#fff8e8", border: "1px solid #f5d99b", color: "#855b0c", fontSize: 12, lineHeight: 1.6, marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 18 },
  card: { background: "#fff", border: "1px solid #e6eaf0", borderRadius: 13, padding: 18, minWidth: 0 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { color: "#718096", fontSize: 12, fontWeight: 600 },
  metric: { fontSize: 28, fontWeight: 750, letterSpacing: -0.7, marginTop: 13 },
  foot: { color: "#7b8798", fontSize: 11, marginTop: 9 },
  icon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef3ff", color: "#315fe9" },
  sectionTitle: { fontSize: 15, fontWeight: 750, margin: 0 },
  sectionSub: { color: "#7b8798", fontSize: 12, marginTop: 6, lineHeight: 1.5 },
  columns: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, .8fr)", gap: 16, marginBottom: 18 },
  badge: { display: "inline-flex", alignItems: "center", borderRadius: 20, padding: "5px 8px", fontSize: 10, fontWeight: 750, whiteSpace: "nowrap" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { textAlign: "left", color: "#7b8798", background: "#fafbfc", fontWeight: 650, padding: "12px 10px", borderBottom: "1px solid #edf0f4", whiteSpace: "nowrap" },
  td: { padding: "14px 10px", borderBottom: "1px solid #edf0f4", whiteSpace: "nowrap", verticalAlign: "middle" },
  input: { minWidth: 190, flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", border: "1px solid #dce2ea", borderRadius: 8, background: "#fff" },
  select: { padding: "10px 12px", border: "1px solid #dce2ea", borderRadius: 8, background: "#fff", color: "#344054", fontSize: 12 },
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,.35)", display: "flex", justifyContent: "flex-end" },
  drawer: { width: "min(450px, 100%)", height: "100%", overflowY: "auto", background: "#fff", padding: 24, boxShadow: "-12px 0 40px rgba(15,23,42,.12)" },
};

function Badge({ children, style }: { children: React.ReactNode; style: CSSProperties }) {
  return <span style={{ ...css.badge, ...style }}>{children}</span>;
}

export default function SecurityOverviewPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState<SecurityEvent | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.id.toLowerCase().includes(query) ||
        event.title.toLowerCase().includes(query) ||
        event.actor.toLowerCase().includes(query) ||
        event.source.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (severityFilter === "All" || event.severity === severityFilter) &&
        (statusFilter === "All" || event.status === statusFilter) &&
        (categoryFilter === "All" || event.category === categoryFilter)
      );
    });
  }, [events, search, severityFilter, statusFilter, categoryFilter]);

  const counts = useMemo(
    () => ({
      critical: events.filter((event) => event.severity === "Critical" && event.status !== "Resolved").length,
      high: events.filter((event) => event.severity === "High" && event.status !== "Resolved").length,
      open: events.filter((event) => event.status === "Open").length,
      resolved: events.filter((event) => event.status === "Resolved").length,
    }),
    [events]
  );

  const refresh = () => {
    setRefreshing(true);
    setLastUpdated(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    window.setTimeout(() => setRefreshing(false), 400);
  };

  const exportCsv = () => {
    const headers = ["ID", "Event", "Category", "Severity", "Actor", "Source IP", "Time", "Status"];
    const rows = filteredEvents.map((event) => [
      event.id,
      event.title,
      event.category,
      event.severity,
      event.actor,
      event.source,
      event.time,
      event.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-security-events.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const changeStatus = (id: string, status: EventStatus) => {
    setEvents((current) =>
      current.map((event) => event.id === id ? { ...event, status } : event)
    );
    setSelected((current) =>
      current?.id === id ? { ...current, status } : current
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSeverityFilter("All");
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  const severityDistribution = [
    { name: "Critical", count: events.filter((event) => event.severity === "Critical").length, color: "#d92d20" },
    { name: "High", count: events.filter((event) => event.severity === "High").length, color: "#e88b24" },
    { name: "Medium", count: events.filter((event) => event.severity === "Medium").length, color: "#315fe9" },
    { name: "Low", count: events.filter((event) => event.severity === "Low").length, color: "#169b79" },
  ];

  return (
    <main style={css.page}>
      <div style={css.container}>
        <header style={css.header}>
          <div>
            <div style={css.eyebrow}>Admin / Dashboard</div>
            <h1 style={css.title}>Security Overview</h1>
            <p style={css.subtitle}>
              Review authentication activity, access-control changes, API threats, and security events across ModelNow.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button type="button" style={css.button} onClick={exportCsv}>
              <Download size={15} /> Export CSV
            </button>
            <button type="button" style={{ ...css.button, ...css.primary }} onClick={refresh} disabled={refreshing}>
              <RefreshCw size={15} /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div style={css.warning}>
          <AlertTriangle size={17} />
          <span>
            <strong>Demo data only.</strong> These events are illustrative and are not connected to a live security monitoring system, identity provider, or audit log.
          </span>
        </div>

        <section style={css.grid}>
          <article style={css.card}>
            <div style={css.row}>
              <span style={css.label}>Security posture</span>
              <span style={css.icon}><ShieldCheck size={19} /></span>
            </div>
            <div style={css.metric}>94<span style={{ fontSize: 15, color: "#718096" }}>/100</span></div>
            <div style={css.foot}>Illustrative posture score</div>
          </article>

          <article style={css.card}>
            <div style={css.row}>
              <span style={css.label}>Open critical events</span>
              <span style={{ ...css.icon, background: "#fff0ee", color: "#c43226" }}><ShieldAlert size={19} /></span>
            </div>
            <div style={css.metric}>{counts.critical}</div>
            <div style={css.foot}>Critical events not yet resolved</div>
          </article>

          <article style={css.card}>
            <div style={css.row}>
              <span style={css.label}>High severity events</span>
              <span style={{ ...css.icon, background: "#fff5e6", color: "#b76a0b" }}><AlertTriangle size={19} /></span>
            </div>
            <div style={css.metric}>{counts.high}</div>
            <div style={css.foot}>Unresolved high severity events</div>
          </article>

          <article style={css.card}>
            <div style={css.row}>
              <span style={css.label}>Resolved events</span>
              <span style={{ ...css.icon, background: "#e8f8ef", color: "#16804a" }}><CheckCircle2 size={19} /></span>
            </div>
            <div style={css.metric}>{counts.resolved}</div>
            <div style={css.foot}>Marked resolved in this demo</div>
          </article>
        </section>

        <section style={css.columns}>
          <article style={css.card}>
            <div style={css.row}>
              <div>
                <h2 style={css.sectionTitle}>Security event distribution</h2>
                <p style={css.sectionSub}>Events grouped by severity</p>
              </div>
              <Activity size={19} color="#315fe9" />
            </div>

            <div style={{ display: "grid", gap: 19, marginTop: 26 }}>
              {severityDistribution.map((item) => {
                const percentage = events.length ? (item.count / events.length) * 100 : 0;

                return (
                  <div key={item.name}>
                    <div style={{ ...css.row, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 650 }}>{item.name}</span>
                      <span style={{ fontSize: 12, color: "#718096" }}>{item.count} events · {percentage.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 9, background: "#edf0f5", borderRadius: 20, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${percentage}%`, background: item.color, borderRadius: 20 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article style={css.card}>
            <div style={css.row}>
              <div>
                <h2 style={css.sectionTitle}>Access security controls</h2>
                <p style={css.sectionSub}>Illustrative configuration status</p>
              </div>
              <LockKeyhole size={19} color="#315fe9" />
            </div>

            {[
              { label: "Multi-factor authentication", detail: "Privileged accounts", value: "Enabled", color: "#027a48", Icon: ShieldCheck },
              { label: "Session monitoring", detail: "Administrator sessions", value: "Active", color: "#027a48", Icon: Smartphone },
              { label: "API credential rotation", detail: "Rotation policy", value: "Review", color: "#b54708", Icon: KeyRound },
              { label: "Access review", detail: "Role assignments", value: "Scheduled", color: "#175cd3", Icon: UserCheck },
            ].map((control) => {
              const Icon = control.Icon;

              return (
                <div key={control.label} style={{ ...css.row, padding: "16px 0", borderBottom: "1px solid #edf0f4" }}>
                  <div style={{ display: "flex", gap: 11, alignItems: "center", minWidth: 0 }}>
                    <span style={{ ...css.icon, width: 34, height: 34, flexShrink: 0 }}><Icon size={16} /></span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{control.label}</div>
                      <div style={{ fontSize: 10, color: "#8490a2", marginTop: 4 }}>{control.detail}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 750, color: control.color }}>{control.value}</span>
                </div>
              );
            })}
          </article>
        </section>

        <section style={{ ...css.card, marginBottom: 18 }}>
          <div style={css.row}>
            <div>
              <h2 style={css.sectionTitle}>Security event log</h2>
              <p style={css.sectionSub}>
                {filteredEvents.length} matching events · Last refreshed {lastUpdated}
              </p>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center", color: "#718096", fontSize: 11 }}>
              <Clock3 size={15} /> Latest first
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", margin: "18px 0 14px" }}>
            <div style={css.input}>
              <Search size={15} color="#8490a2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events, actors, IP addresses..."
                aria-label="Search security events"
                style={{ border: 0, outline: 0, width: "100%", padding: "10px 0", fontSize: 12, background: "transparent", color: "#344054" }}
              />
            </div>

            <select aria-label="Filter by severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} style={css.select}>
              <option value="All">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={css.select}>
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={css.select}>
              <option value="All">All categories</option>
              {[...new Set(events.map((event) => event.category))].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button type="button" style={css.button} onClick={clearFilters}>
              <Filter size={14} /> Clear
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={css.table}>
              <thead>
                <tr>
                  {["Event", "Category", "Severity", "Actor", "Source IP", "Time", "Status", ""].map((heading, index) => (
                    <th key={`${heading}-${index}`} style={css.th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td style={css.td}>
                      <div style={{ fontWeight: 700 }}>{event.title}</div>
                      <div style={{ color: "#8490a2", fontSize: 10, marginTop: 5 }}>{event.id}</div>
                    </td>
                    <td style={css.td}>{event.category}</td>
                    <td style={css.td}>
                      <Badge style={severityStyle[event.severity]}>{event.severity}</Badge>
                    </td>
                    <td style={css.td}>{event.actor}</td>
                    <td style={css.td}>{event.source}</td>
                    <td style={css.td}>{event.time}</td>
                    <td style={css.td}>
                      <Badge style={statusStyle[event.status]}>{event.status}</Badge>
                    </td>
                    <td style={css.td}>
                      <button type="button" aria-label={`View ${event.id}`} style={{ ...css.button, padding: "7px 9px" }} onClick={() => setSelected(event)}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...css.td, textAlign: "center", padding: 28, color: "#718096" }}>
                      No events match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer style={{ textAlign: "center", color: "#8490a2", fontSize: 11 }}>
          ModelNow Admin · Security Overview · Demo environment
        </footer>
      </div>

      {selected && (
        <div style={css.overlay} onClick={() => setSelected(null)}>
          <aside style={css.drawer} onClick={(event) => event.stopPropagation()}>
            <div style={{ ...css.row, marginBottom: 22 }}>
              <div>
                <div style={css.eyebrow}>Security event details</div>
                <h2 style={{ fontSize: 21, margin: 0 }}>{selected.id}</h2>
              </div>
              <button type="button" aria-label="Close details" style={css.button} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <h3 style={{ fontSize: 17, marginBottom: 12 }}>{selected.title}</h3>
            <p style={{ color: "#667085", fontSize: 13, lineHeight: 1.7 }}>{selected.description}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
              <Badge style={severityStyle[selected.severity]}>{selected.severity}</Badge>
              <Badge style={statusStyle[selected.status]}>{selected.status}</Badge>
            </div>

            {[
              ["Category", selected.category],
              ["Actor", selected.actor],
              ["Source IP", selected.source],
              ["Timestamp", selected.time],
            ].map(([label, value]) => (
              <div key={label} style={{ ...css.row, padding: "14px 0", borderBottom: "1px solid #edf0f4" }}>
                <span style={css.label}>{label}</span>
                <strong style={{ fontSize: 12, textAlign: "right" }}>{value}</strong>
              </div>
            ))}

            <h3 style={{ fontSize: 14, marginTop: 24 }}>Update event status</h3>
            <p style={css.sectionSub}>This only updates the local demo interface.</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {(["Open", "Investigating", "Resolved"] as EventStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  style={{
                    ...css.button,
                    borderColor: selected.status === status ? "#315fe9" : "#dce2ea",
                    background: selected.status === status ? "#eef3ff" : "#fff",
                  }}
                  onClick={() => changeStatus(selected.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
