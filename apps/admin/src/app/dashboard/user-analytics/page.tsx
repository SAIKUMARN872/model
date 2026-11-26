
"use client";

import { useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Search,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  ShieldCheck,
  Building2,
  ChevronDown,
} from "lucide-react";

type Period = "7 days" | "30 days" | "90 days" | "12 months";
type UserStatus = "Active" | "Pending" | "Suspended";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  status: UserStatus;
  lastActive: string;
  joined: string;
};

const C = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e7ebf2",
  text: "#182230",
  muted: "#788497",
  blue: "#5269ee",
  green: "#169b68",
  purple: "#8b5cf6",
  teal: "#0891b2",
  orange: "#e99a27",
  red: "#dc5252",
};

const users: UserRecord[] = [
  { id: "USR-1042", name: "Aarav Sharma", email: "aarav@example.com", organization: "Acme Technologies", role: "Admin", status: "Active", lastActive: "2 minutes ago", joined: "2026-10-28" },
  { id: "USR-1041", name: "Priya Reddy", email: "priya@example.com", organization: "Northstar AI", role: "Developer", status: "Active", lastActive: "12 minutes ago", joined: "2026-10-27" },
  { id: "USR-1040", name: "Rahul Verma", email: "rahul@example.com", organization: "Vertex Labs", role: "Member", status: "Pending", lastActive: "Never", joined: "2026-10-26" },
  { id: "USR-1039", name: "Ananya Rao", email: "ananya@example.com", organization: "Acme Technologies", role: "Developer", status: "Active", lastActive: "1 hour ago", joined: "2026-10-25" },
  { id: "USR-1038", name: "Kiran Kumar", email: "kiran@example.com", organization: "BluePeak Systems", role: "Member", status: "Suspended", lastActive: "3 days ago", joined: "2026-10-24" },
  { id: "USR-1037", name: "Meera Nair", email: "meera@example.com", organization: "Northstar AI", role: "Admin", status: "Active", lastActive: "28 minutes ago", joined: "2026-10-23" },
  { id: "USR-1036", name: "Vikram Singh", email: "vikram@example.com", organization: "Vertex Labs", role: "Member", status: "Active", lastActive: "Yesterday", joined: "2026-10-22" },
  { id: "USR-1035", name: "Sneha Patel", email: "sneha@example.com", organization: "BluePeak Systems", role: "Developer", status: "Pending", lastActive: "Never", joined: "2026-10-21" },
];

const trendData: Record<Period, number[]> = {
  "7 days": [42, 54, 48, 68, 59, 78, 91],
  "30 days": [32, 38, 45, 41, 53, 60, 56, 68, 62, 74, 70, 85],
  "90 days": [25, 33, 29, 42, 38, 49, 53, 47, 63, 69, 75, 91],
  "12 months": [18, 25, 30, 27, 35, 42, 39, 51, 57, 64, 73, 90],
};

const growthLabels: Record<Period, string[]> = {
  "7 days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30 days": ["1", "3", "6", "9", "12", "15", "18", "21", "24", "26", "28", "30"],
  "90 days": ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
  "12 months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const activity = [
  { user: "Aarav Sharma", event: "Signed in", detail: "Web application", time: "2 min ago", status: "Success" },
  { user: "Priya Reddy", event: "Created API key", detail: "Development workspace", time: "12 min ago", status: "Success" },
  { user: "Rahul Verma", event: "Invitation sent", detail: "Northstar AI", time: "24 min ago", status: "Pending" },
  { user: "Ananya Rao", event: "Updated profile", detail: "Account settings", time: "1 hour ago", status: "Success" },
  { user: "Kiran Kumar", event: "Sign-in blocked", detail: "Security policy", time: "3 hours ago", status: "Blocked" },
];

const css: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 28, background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: C.muted, textTransform: "uppercase", marginBottom: 8 },
  heading: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.7 },
  subtitle: { margin: "8px 0 0", color: C.muted, fontSize: 13, lineHeight: 1.6 },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 13px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, color: "#344054", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  select: { border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", background: "#fff", color: "#344054", fontSize: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 15, marginBottom: 18 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 19, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  title: { margin: 0, fontSize: 14, fontWeight: 800 },
  muted: { color: C.muted, fontSize: 12 },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: 18, marginBottom: 18 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  pill: { display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  input: { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 11px", fontSize: 12, outline: "none", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { textAlign: "left", padding: "12px 9px", color: "#8490a2", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.7, borderBottom: "1px solid #edf0f5", whiteSpace: "nowrap" },
  td: { padding: "14px 9px", borderBottom: "1px solid #f0f2f6", verticalAlign: "middle" },
};

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section style={css.card}>
      <div style={css.panelHeader}>
        <div>
          <h2 style={css.title}>{title}</h2>
          {subtitle && <p style={{ ...css.muted, margin: "6px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function UserAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("7 days");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [refreshed, setRefreshed] = useState("Just now");
  const [exportMessage, setExportMessage] = useState("");

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalized ||
        [user.name, user.email, user.organization, user.id]
          .some((value) => value.toLowerCase().includes(normalized));

      const matchesStatus =
        statusFilter === "All statuses" || user.status === statusFilter;

      const matchesRole =
        roleFilter === "All roles" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [query, statusFilter, roleFilter]);

  function exportUsers() {
    const rows = [
      ["User ID", "Name", "Email", "Organization", "Role", "Status", "Joined"],
      ...filteredUsers.map((user) => [
        user.id,
        user.name,
        user.email,
        user.organization,
        user.role,
        user.status,
        user.joined,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-user-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportMessage(`${filteredUsers.length} user records exported.`);
  }

  const stats = [
    { label: "Total registered users", value: "24,582", change: "+12.8%", note: "vs. previous period", icon: Users, color: C.blue },
    { label: "Active users", value: "18,406", change: "+9.3%", note: "Active in selected period", icon: UserCheck, color: C.green },
    { label: "New users", value: "2,184", change: "+16.5%", note: "New registrations", icon: UserPlus, color: C.purple },
    { label: "Suspended users", value: "126", change: "-3.2%", note: "Compared with prior period", icon: UserX, color: C.orange },
  ];

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>ModelNow / Dashboard / Analytics</div>
          <h1 style={css.heading}>User Analytics</h1>
          <p style={css.subtitle}>
            Track user acquisition, engagement, account status, and activity across the platform.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select
            aria-label="Analytics period"
            style={css.select}
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
          >
            {(["7 days", "30 days", "90 days", "12 months"] as Period[]).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button style={css.button} onClick={() => { setRefreshed("Just now"); setExportMessage(""); }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={css.button} onClick={exportUsers}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      <div style={{ ...css.card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18, background: "#eef2ff", borderColor: "#dfe5ff" }}>
        <div style={{ width: 37, height: 37, borderRadius: 10, background: "#dce4ff", color: C.blue, display: "grid", placeItems: "center" }}>
          <Activity size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>User activity workspace</div>
          <div style={{ ...css.muted, marginTop: 4 }}>Selected period: {period}. Metrics shown here are sample values for the UI preview.</div>
        </div>
        <span style={{ ...css.pill, background: "#fff", color: C.blue }}>DEMO DATA</span>
      </div>

      <div style={css.grid}>
        {stats.map((item) => {
          const Icon = item.icon;
          const down = item.label === "Suspended users";
          return (
            <article key={item.label} style={css.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ color: "#667085", fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 11, background: `${item.color}14`, color: item.color }}>
                  <Icon size={19} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.8, marginTop: 17 }}>{item.value}</div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                <span style={{ ...css.pill, background: down ? "#eaf8f0" : "#eaf8f0", color: C.green }}>
                  {down ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {item.change}
                </span>
                <span style={css.muted}>{item.note}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={css.two}>
        <Panel
          title="User growth trend"
          subtitle={`Illustrative activity trend · ${period}`}
          action={<span style={{ ...css.pill, color: C.blue, background: "#f0f3ff" }}>Growth</span>}
        >
          <div style={{ display: "flex", gap: 20, marginBottom: 18, fontSize: 11, fontWeight: 800 }}>
            <span style={{ color: C.blue }}>● User activity index</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${trendData[period].length}, minmax(0, 1fr))`, alignItems: "end", gap: 7, height: 185 }}>
            {trendData[period].map((value, index) => (
              <div key={`${period}-${index}`} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 8 }}>
                <div title={`${value} activity index`} style={{ width: "100%", maxWidth: 28, height: `${value}%`, background: `linear-gradient(180deg, ${C.blue}, #a7b2ff)`, borderRadius: "5px 5px 0 0", minHeight: 5 }} />
                <span style={{ color: C.muted, fontSize: 9 }}>{growthLabels[period][index]}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="User account distribution" subtitle="Illustrative account categories">
          {[
            { label: "Active accounts", value: 75, count: "18,406", color: C.green },
            { label: "Pending invitations", value: 12, count: "2,948", color: C.orange },
            { label: "Inactive accounts", value: 9, count: "2,218", color: C.purple },
            { label: "Suspended accounts", value: 4, count: "1,010", color: C.red },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 19 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                <strong style={{ fontSize: 12 }}>{item.count}</strong>
                <span style={{ fontSize: 11, color: C.muted }}>{item.value}%</span>
              </div>
              <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 22, padding: 13, borderRadius: 9, background: "#f8f9fc", display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} color={C.green} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>Account management</div>
              <div style={{ ...css.muted, marginTop: 4 }}>Review account statuses in the user administration area.</div>
            </div>
          </div>
        </Panel>
      </div>

      <div style={css.two}>
        <Panel title="Engagement indicators" subtitle="Example platform-wide engagement measures">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            {[
              { label: "Daily active users", value: "6,842", change: "+8.1%", color: C.blue },
              { label: "Weekly active users", value: "18,406", change: "+9.3%", color: C.teal },
              { label: "Monthly active users", value: "21,730", change: "+11.2%", color: C.purple },
              { label: "Avg. session", value: "18m 42s", change: "+2.4%", color: C.green },
            ].map((item) => (
              <div key={item.label} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 11 }}>
                <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>{item.value}</div>
                <div style={{ color: C.green, fontSize: 11, fontWeight: 800, marginTop: 7 }}>
                  <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} /> {item.change}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="User acquisition channels" subtitle="Illustrative registration sources">
          {[
            { label: "Direct / Website", value: 42, color: C.blue },
            { label: "Organization invitations", value: 31, color: C.teal },
            { label: "Developer referrals", value: 17, color: C.purple },
            { label: "Other sources", value: 10, color: C.orange },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7, fontSize: 12 }}>
                <span style={{ color: "#475467" }}>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: "#edf0f5", overflow: "hidden" }}>
                <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <Panel
        title="User directory snapshot"
        subtitle={`${filteredUsers.length} sample users match your filters`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: 180 }}>
              <Search size={14} style={{ position: "absolute", top: 11, left: 10, color: C.muted }} />
              <input
                style={{ ...css.input, paddingLeft: 31 }}
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search users"
              />
            </div>
            <select style={css.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <select style={css.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
              <option>All roles</option>
              <option>Admin</option>
              <option>Developer</option>
              <option>Member</option>
            </select>
          </div>
        }
      >
        {exportMessage && <p role="status" style={{ color: C.green, fontSize: 12 }}>{exportMessage}</p>}
        <div style={{ overflowX: "auto" }}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={css.th}>User</th>
                <th style={css.th}>Organization</th>
                <th style={css.th}>Role</th>
                <th style={css.th}>Status</th>
                <th style={css.th}>Last active</th>
                <th style={css.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const statusColor = user.status === "Active" ? C.green : user.status === "Pending" ? C.orange : C.red;
                return (
                  <tr key={user.id}>
                    <td style={css.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 185 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", color: C.blue, background: "#edf0ff", fontWeight: 800, fontSize: 11 }}>
                          {user.name.split(" ").map((part) => part[0]).join("")}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{user.name}</div>
                          <div style={{ ...css.muted, marginTop: 4 }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{user.organization}</td>
                    <td style={css.td}>{user.role}</td>
                    <td style={css.td}>
                      <span style={{ ...css.pill, background: `${statusColor}15`, color: statusColor }}>{user.status}</span>
                    </td>
                    <td style={{ ...css.td, whiteSpace: "nowrap", color: C.muted }}>
                      <Clock3 size={12} style={{ verticalAlign: "middle", marginRight: 5 }} />{user.lastActive}
                    </td>
                    <td style={{ ...css.td, whiteSpace: "nowrap", color: C.muted }}>{user.joined}</td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} style={{ ...css.td, textAlign: "center", color: C.muted }}>No users match your search and filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent user events" subtitle="Example events from user activity monitoring">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 12 }}>
          {activity.map((item, index) => {
            const isBlocked = item.status === "Blocked";
            return (
              <div key={`${item.user}-${item.event}`} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 13, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 32, height: 32, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 9, background: isBlocked ? "#fff0f0" : "#edf8f1", color: isBlocked ? C.red : C.green }}>
                  {isBlocked ? <UserX size={16} /> : index === 1 ? <ShieldCheck size={16} /> : <Activity size={16} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{item.event}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{item.user} · {item.detail}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 7 }}>{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <footer style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 18, color: C.muted, fontSize: 11 }}>
        <span>ModelNow Admin · User Analytics</span>
        <span><CalendarDays size={12} style={{ verticalAlign: "middle", marginRight: 5 }} />Last refreshed: {refreshed}</span>
      </footer>
    </main>
  );
}
