
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  KeyRound,
  LogIn,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";

type ActivityCategory =
  | "Authentication"
  | "User management"
  | "Organization"
  | "API"
  | "Billing"
  | "Security"
  | "Configuration";

type ActivityStatus = "Success" | "Pending" | "Failed";
type ActivitySeverity = "Info" | "Warning" | "Critical";

type ActivityRecord = {
  id: string;
  action: string;
  description: string;
  category: ActivityCategory;
  actor: string;
  actorType: "Admin" | "User" | "System" | "API";
  target: string;
  timestamp: string;
  status: ActivityStatus;
  severity: ActivitySeverity;
  ipAddress: string;
};

const initialActivities: ActivityRecord[] = [
  {
    id: "ACT-9001",
    action: "Administrator sign-in",
    description: "An administrator signed in to the ModelNow Admin workspace.",
    category: "Authentication",
    actor: "admin@modelnow.example",
    actorType: "Admin",
    target: "Admin workspace",
    timestamp: "2026-11-04 10:42:18",
    status: "Success",
    severity: "Info",
    ipAddress: "192.0.2.18",
  },
  {
    id: "ACT-9002",
    action: "Organization created",
    description: "A new organization record was created in the platform.",
    category: "Organization",
    actor: "admin@modelnow.example",
    actorType: "Admin",
    target: "Northstar AI",
    timestamp: "2026-11-04 10:31:45",
    status: "Success",
    severity: "Info",
    ipAddress: "192.0.2.18",
  },
  {
    id: "ACT-9003",
    action: "API rate limit reached",
    description: "A client exceeded the illustrative API request threshold.",
    category: "API",
    actor: "org-northstar",
    actorType: "API",
    target: "/v1/chat/completions",
    timestamp: "2026-11-04 10:18:03",
    status: "Failed",
    severity: "Warning",
    ipAddress: "198.51.100.17",
  },
  {
    id: "ACT-9004",
    action: "Member invited",
    description: "An organization administrator sent an invitation to a new member.",
    category: "User management",
    actor: "owner@acme.example",
    actorType: "User",
    target: "new.member@acme.example",
    timestamp: "2026-11-04 10:05:29",
    status: "Success",
    severity: "Info",
    ipAddress: "198.51.100.24",
  },
  {
    id: "ACT-9005",
    action: "API key rotation requested",
    description: "A credential rotation request was submitted for review.",
    category: "Security",
    actor: "security@modelnow.example",
    actorType: "Admin",
    target: "Production API credentials",
    timestamp: "2026-11-04 09:52:10",
    status: "Pending",
    severity: "Warning",
    ipAddress: "192.0.2.25",
  },
  {
    id: "ACT-9006",
    action: "Subscription updated",
    description: "A sample organization subscription was changed to the Business plan.",
    category: "Billing",
    actor: "billing@acme.example",
    actorType: "User",
    target: "Acme organization",
    timestamp: "2026-11-04 09:34:52",
    status: "Success",
    severity: "Info",
    ipAddress: "203.0.113.11",
  },
  {
    id: "ACT-9007",
    action: "Access policy change failed",
    description: "A sample role update was rejected by a permission check.",
    category: "Configuration",
    actor: "operator@modelnow.example",
    actorType: "Admin",
    target: "Organization access policy",
    timestamp: "2026-11-04 09:16:37",
    status: "Failed",
    severity: "Critical",
    ipAddress: "192.0.2.63",
  },
  {
    id: "ACT-9008",
    action: "New user registered",
    description: "A new user account was registered on the platform.",
    category: "User management",
    actor: "System",
    actorType: "System",
    target: "user-10482",
    timestamp: "2026-11-04 08:58:14",
    status: "Success",
    severity: "Info",
    ipAddress: "203.0.113.51",
  },
  {
    id: "ACT-9009",
    action: "Model routing configuration updated",
    description: "The model routing policy was edited in the demo environment.",
    category: "Configuration",
    actor: "admin@modelnow.example",
    actorType: "Admin",
    target: "Production routing policy",
    timestamp: "2026-11-03 17:42:08",
    status: "Success",
    severity: "Info",
    ipAddress: "192.0.2.18",
  },
  {
    id: "ACT-9010",
    action: "Repeated login attempts detected",
    description: "Multiple unsuccessful authentication attempts were recorded.",
    category: "Security",
    actor: "unknown-client",
    actorType: "System",
    target: "Admin authentication",
    timestamp: "2026-11-03 17:18:40",
    status: "Failed",
    severity: "Critical",
    ipAddress: "203.0.113.42",
  },
  {
    id: "ACT-9011",
    action: "Usage report generated",
    description: "A usage and cost report was generated for an organization.",
    category: "API",
    actor: "billing-service",
    actorType: "System",
    target: "Monthly usage report",
    timestamp: "2026-11-03 16:40:12",
    status: "Success",
    severity: "Info",
    ipAddress: "192.0.2.90",
  },
  {
    id: "ACT-9012",
    action: "Organization settings changed",
    description: "An organization profile setting was updated.",
    category: "Organization",
    actor: "owner@vertex.example",
    actorType: "User",
    target: "Vertex organization",
    timestamp: "2026-11-03 15:28:57",
    status: "Success",
    severity: "Info",
    ipAddress: "198.51.100.61",
  },
];

const statusStyles: Record<ActivityStatus, CSSProperties> = {
  Success: { color: "#067647", background: "#dcfae6" },
  Pending: { color: "#175cd3", background: "#eaf2ff" },
  Failed: { color: "#b42318", background: "#fee4e2" },
};

const severityStyles: Record<ActivitySeverity, CSSProperties> = {
  Info: { color: "#475467", background: "#f0f2f5" },
  Warning: { color: "#b54708", background: "#fff0d5" },
  Critical: { color: "#b42318", background: "#fee4e2" },
};

const categoryIcons: Record<ActivityCategory, typeof Activity> = {
  Authentication: LogIn,
  "User management": UserPlus,
  Organization: Building2,
  API: Zap,
  Billing: Activity,
  Security: ShieldCheck,
  Configuration: Settings2,
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fa",
    color: "#172033",
    padding: 28,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: { maxWidth: 1480, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 22,
  },
  eyebrow: {
    color: "#718096",
    fontSize: 11,
    fontWeight: 750,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 750, letterSpacing: -0.7, margin: 0 },
  subtitle: { color: "#718096", fontSize: 13, lineHeight: 1.65, marginTop: 8, maxWidth: 750 },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #dce2ea",
    background: "#fff",
    color: "#344054",
    borderRadius: 9,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  },
  primary: { background: "#315fe9", color: "#fff", borderColor: "#315fe9" },
  notice: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "#fff8e8",
    color: "#855b0c",
    border: "1px solid #f5d99b",
    borderRadius: 10,
    padding: 13,
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    padding: 18,
    minWidth: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: { color: "#718096", fontSize: 12, fontWeight: 600 },
  metric: { fontSize: 28, fontWeight: 750, letterSpacing: -0.7, marginTop: 13 },
  foot: { color: "#7b8798", fontSize: 11, marginTop: 9, lineHeight: 1.5 },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#eef3ff",
    color: "#315fe9",
    flexShrink: 0,
  },
  sectionTitle: { fontSize: 15, fontWeight: 750, margin: 0 },
  sectionSub: { color: "#7b8798", fontSize: 12, lineHeight: 1.5, marginTop: 6 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 20,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 750,
    whiteSpace: "nowrap",
  },
  inputWrap: {
    minWidth: 220,
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 10px",
    border: "1px solid #dce2ea",
    borderRadius: 8,
    background: "#fff",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #dce2ea",
    borderRadius: 8,
    background: "#fff",
    color: "#344054",
    fontSize: 12,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    textAlign: "left",
    color: "#7b8798",
    background: "#fafbfc",
    fontWeight: 650,
    padding: "12px 10px",
    borderBottom: "1px solid #edf0f4",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #edf0f4",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(15,23,42,.35)",
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: "min(460px, 100%)",
    height: "100%",
    overflowY: "auto",
    background: "#fff",
    padding: 24,
    boxShadow: "-12px 0 40px rgba(15,23,42,.12)",
  },
};

function Badge({
  children,
  style,
}: {
  children: React.ReactNode;
  style: CSSProperties;
}) {
  return <span style={{ ...styles.badge, ...style }}>{children}</span>;
}

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [actorFilter, setActorFilter] = useState("All");
  const [selected, setSelected] = useState<ActivityRecord | null>(null);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.action.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.actor.toLowerCase().includes(query) ||
        item.target.toLowerCase().includes(query) ||
        item.ipAddress.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (categoryFilter === "All" || item.category === categoryFilter) &&
        (statusFilter === "All" || item.status === statusFilter) &&
        (severityFilter === "All" || item.severity === severityFilter) &&
        (actorFilter === "All" || item.actorType === actorFilter)
      );
    });
  }, [activities, search, categoryFilter, statusFilter, severityFilter, actorFilter]);

  const successCount = activities.filter((item) => item.status === "Success").length;
  const failedCount = activities.filter((item) => item.status === "Failed").length;
  const warningCount = activities.filter((item) => item.severity === "Warning" || item.severity === "Critical").length;
  const adminCount = activities.filter((item) => item.actorType === "Admin").length;

  const exportCsv = () => {
    const headers = [
      "ID",
      "Action",
      "Description",
      "Category",
      "Actor",
      "Actor Type",
      "Target",
      "Timestamp",
      "Status",
      "Severity",
      "IP Address",
    ];

    const rows = filteredActivities.map((item) => [
      item.id,
      item.action,
      item.description,
      item.category,
      item.actor,
      item.actorType,
      item.target,
      item.timestamp,
      item.status,
      item.severity,
      item.ipAddress,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-recent-activity.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const refresh = () => {
    setLastUpdated(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const updateStatus = (id: string, status: ActivityStatus) => {
    setActivities((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setSelected((current) => (current?.id === id ? { ...current, status } : current));
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setSeverityFilter("All");
    setActorFilter("All");
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Admin / Dashboard</div>
            <h1 style={styles.title}>Recent Activity</h1>
            <p style={styles.subtitle}>
              Review administrative actions, user events, organization changes, API activity, and security-related events in one place.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button type="button" style={styles.button} onClick={exportCsv}>
              <Download size={15} /> Export CSV
            </button>
            <button type="button" style={{ ...styles.button, ...styles.primary }} onClick={refresh}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </header>

        <div style={styles.notice}>
          <AlertTriangle size={17} />
          <span>
            <strong>Demo activity only.</strong> These records are hardcoded examples. Live audit events, accurate timestamps, and real user actions require integration with the backend event and audit-log services.
          </span>
        </div>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Total activities</span>
              <span style={styles.icon}><Activity size={19} /></span>
            </div>
            <div style={styles.metric}>{activities.length}</div>
            <div style={styles.foot}>Events currently loaded in this demo</div>
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Successful actions</span>
              <span style={{ ...styles.icon, background: "#e8f8ef", color: "#16804a" }}><CheckCircle2 size={19} /></span>
            </div>
            <div style={styles.metric}>{successCount}</div>
            <div style={styles.foot}>Marked successful</div>
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Failed actions</span>
              <span style={{ ...styles.icon, background: "#fff0ee", color: "#b42318" }}><AlertTriangle size={19} /></span>
            </div>
            <div style={styles.metric}>{failedCount}</div>
            <div style={styles.foot}>May require investigation</div>
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Warnings and critical</span>
              <span style={{ ...styles.icon, background: "#fff5e6", color: "#b76a0b" }}><ShieldCheck size={19} /></span>
            </div>
            <div style={styles.metric}>{warningCount}</div>
            <div style={styles.foot}>Events marked warning or critical</div>
          </article>
        </section>

        <section style={{ ...styles.card, marginBottom: 18 }}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Activity insights</h2>
              <p style={styles.sectionSub}>Summary of the currently loaded activity records</p>
            </div>
            <Clock3 size={19} color="#315fe9" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18 }}>
            {[
              { label: "Administrator actions", value: adminCount, Icon: Users, color: "#315fe9" },
              { label: "Authentication events", value: activities.filter((item) => item.category === "Authentication").length, Icon: LogIn, color: "#16804a" },
              { label: "Organization changes", value: activities.filter((item) => item.category === "Organization").length, Icon: Building2, color: "#7a5af8" },
              { label: "Security events", value: activities.filter((item) => item.category === "Security").length, Icon: KeyRound, color: "#b54708" },
            ].map((item) => {
              const Icon = item.Icon;

              return (
                <div key={item.label} style={{ padding: 15, border: "1px solid #edf0f4", borderRadius: 10 }}>
                  <div style={{ ...styles.row, justifyContent: "flex-start" }}>
                    <Icon size={17} color={item.color} />
                    <span style={{ fontSize: 11, color: "#718096" }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: 23, fontWeight: 750, marginTop: 12 }}>{item.value}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Activity log</h2>
              <p style={styles.sectionSub}>
                {filteredActivities.length} matching events · Last refreshed {lastUpdated}
              </p>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center", color: "#718096", fontSize: 11 }}>
              <Clock3 size={15} /> Latest first
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", margin: "18px 0 14px" }}>
            <div style={styles.inputWrap}>
              <Search size={15} color="#8490a2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search actions, actors, targets..."
                aria-label="Search activity"
                style={{ border: 0, outline: 0, width: "100%", padding: "10px 0", fontSize: 12, background: "transparent", color: "#344054" }}
              />
            </div>

            <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={styles.select}>
              <option value="All">All categories</option>
              {[
                "Authentication",
                "User management",
                "Organization",
                "API",
                "Billing",
                "Security",
                "Configuration",
              ].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.select}>
              <option value="All">All statuses</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <select aria-label="Filter by severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} style={styles.select}>
              <option value="All">All severities</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>

            <select aria-label="Filter by actor type" value={actorFilter} onChange={(event) => setActorFilter(event.target.value)} style={styles.select}>
              <option value="All">All actor types</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
              <option value="System">System</option>
              <option value="API">API</option>
            </select>

            <button type="button" style={styles.button} onClick={clearFilters}>
              <Filter size={14} /> Clear
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Activity", "Category", "Actor", "Target", "Timestamp", "Status", "Severity", ""].map((heading, index) => (
                    <th key={`${heading}-${index}`} style={styles.th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((item) => {
                  const Icon = categoryIcons[item.category];

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ ...styles.icon, width: 34, height: 34 }}>
                            <Icon size={16} />
                          </span>
                          <div>
                            <div style={{ fontWeight: 700 }}>{item.action}</div>
                            <div style={{ fontSize: 10, color: "#8490a2", marginTop: 5 }}>{item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{item.category}</td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 650 }}>{item.actor}</div>
                        <div style={{ fontSize: 10, color: "#8490a2", marginTop: 4 }}>{item.actorType}</div>
                      </td>
                      <td style={styles.td}>{item.target}</td>
                      <td style={styles.td}>{item.timestamp}</td>
                      <td style={styles.td}>
                        <Badge style={statusStyles[item.status]}>{item.status}</Badge>
                      </td>
                      <td style={styles.td}>
                        <Badge style={severityStyles[item.severity]}>{item.severity}</Badge>
                      </td>
                      <td style={styles.td}>
                        <button type="button" aria-label={`View ${item.id}`} style={{ ...styles.button, padding: "7px 9px" }} onClick={() => setSelected(item)}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: 28, color: "#718096" }}>
                      No activities match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer style={{ textAlign: "center", color: "#8490a2", fontSize: 11, marginTop: 22 }}>
          ModelNow Admin · Recent Activity · Demo environment
        </footer>
      </div>

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <aside style={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <div style={{ ...styles.row, marginBottom: 22 }}>
              <div>
                <div style={styles.eyebrow}>Activity details</div>
                <h2 style={{ fontSize: 21, margin: 0 }}>{selected.id}</h2>
              </div>
              <button type="button" aria-label="Close details" style={styles.button} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <h3 style={{ fontSize: 17, lineHeight: 1.5 }}>{selected.action}</h3>
            <p style={{ color: "#667085", fontSize: 13, lineHeight: 1.7 }}>{selected.description}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
              <Badge style={statusStyles[selected.status]}>{selected.status}</Badge>
              <Badge style={severityStyles[selected.severity]}>{selected.severity}</Badge>
            </div>

            {[
              ["Category", selected.category],
              ["Actor", selected.actor],
              ["Actor type", selected.actorType],
              ["Target", selected.target],
              ["Timestamp", selected.timestamp],
              ["Source IP", selected.ipAddress],
            ].map(([label, value]) => (
              <div key={label} style={{ ...styles.row, padding: "14px 0", borderBottom: "1px solid #edf0f4" }}>
                <span style={styles.label}>{label}</span>
                <strong style={{ fontSize: 12, textAlign: "right", maxWidth: "62%", overflowWrap: "anywhere" }}>{value}</strong>
              </div>
            ))}

            <h3 style={{ fontSize: 14, marginTop: 25 }}>Update demo status</h3>
            <p style={styles.sectionSub}>This changes only the current page's local state. It does not update a real audit system.</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {(["Success", "Pending", "Failed"] as ActivityStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  style={{
                    ...styles.button,
                    borderColor: selected.status === status ? "#315fe9" : "#dce2ea",
                    background: selected.status === status ? "#eef3ff" : "#fff",
                  }}
                  onClick={() => updateStatus(selected.id, status)}
                >
                  {selected.status === status && <CheckCircle2 size={14} />}
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
