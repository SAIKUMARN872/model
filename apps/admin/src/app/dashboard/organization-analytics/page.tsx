
"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  CreditCard,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Filter,
  Layers3,
} from "lucide-react";

type OrgStatus = "Active" | "Pending" | "Suspended";
type Plan = "Enterprise" | "Business" | "Starter";

type Organization = {
  id: string;
  name: string;
  industry: string;
  plan: Plan;
  members: number;
  requests: number;
  status: OrgStatus;
  joined: string;
  region: string;
};

const C = {
  bg: "#f7f8fc",
  card: "#fff",
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

const organizations: Organization[] = [
  { id: "ORG-1001", name: "Acme Technologies", industry: "Technology", plan: "Enterprise", members: 248, requests: 1820000, status: "Active", joined: "2026-10-28", region: "North America" },
  { id: "ORG-1002", name: "Northstar AI", industry: "Artificial Intelligence", plan: "Enterprise", members: 186, requests: 1460000, status: "Active", joined: "2026-10-24", region: "Europe" },
  { id: "ORG-1003", name: "Vertex Labs", industry: "Research", plan: "Business", members: 94, requests: 840000, status: "Active", joined: "2026-10-20", region: "Asia Pacific" },
  { id: "ORG-1004", name: "BluePeak Systems", industry: "Software", plan: "Business", members: 72, requests: 630000, status: "Pending", joined: "2026-10-18", region: "North America" },
  { id: "ORG-1005", name: "Summit Digital", industry: "Consulting", plan: "Starter", members: 28, requests: 148000, status: "Active", joined: "2026-10-16", region: "Europe" },
  { id: "ORG-1006", name: "Pioneer Analytics", industry: "Data Analytics", plan: "Business", members: 61, requests: 510000, status: "Active", joined: "2026-10-12", region: "Asia Pacific" },
  { id: "ORG-1007", name: "Cedar Cloud", industry: "Cloud Services", plan: "Starter", members: 19, requests: 86000, status: "Suspended", joined: "2026-10-08", region: "North America" },
  { id: "ORG-1008", name: "Orbit Systems", industry: "Enterprise Software", plan: "Enterprise", members: 132, requests: 970000, status: "Active", joined: "2026-10-03", region: "Europe" },
];

const trend: Record<string, number[]> = {
  "7 days": [30, 42, 38, 57, 52, 73, 90],
  "30 days": [22, 31, 38, 34, 48, 45, 59, 55, 69, 75, 82, 92],
  "90 days": [18, 27, 24, 37, 35, 45, 53, 49, 62, 68, 79, 92],
};

const css: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 28, background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 },
  eyebrow: { color: C.muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 },
  heading: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.7 },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 13px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, color: "#344054", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  select: { border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", background: "#fff", color: "#344054", fontSize: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 215px), 1fr))", gap: 15, marginBottom: 18 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 19, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  title: { margin: 0, fontSize: 14, fontWeight: 800 },
  muted: { color: C.muted, fontSize: 12 },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: 18, marginBottom: 18 },
  panelHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 },
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

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function OrganizationAnalyticsPage() {
  const [period, setPeriod] = useState("7 days");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [refreshed, setRefreshed] = useState("Just now");
  const [exportMessage, setExportMessage] = useState("");

  const filteredOrganizations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return organizations.filter((org) => {
      const matchesQuery =
        !q ||
        [org.id, org.name, org.industry, org.region].some((value) =>
          value.toLowerCase().includes(q),
        );
      const matchesStatus = statusFilter === "All statuses" || org.status === statusFilter;
      const matchesPlan = planFilter === "All plans" || org.plan === planFilter;
      const matchesRegion = regionFilter === "All regions" || org.region === regionFilter;
      return matchesQuery && matchesStatus && matchesPlan && matchesRegion;
    });
  }, [query, statusFilter, planFilter, regionFilter]);

  function exportCsv() {
    const rows = [
      ["Organization ID", "Name", "Industry", "Plan", "Members", "Requests", "Status", "Region", "Joined"],
      ...filteredOrganizations.map((org) => [
        org.id, org.name, org.industry, org.plan, String(org.members),
        String(org.requests), org.status, org.region, org.joined,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-organization-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportMessage(`${filteredOrganizations.length} organization records exported.`);
  }

  const stats = [
    { label: "Total organizations", value: "1,284", change: "+8.4%", note: "vs. previous period", icon: Building2, color: C.blue },
    { label: "Active organizations", value: "1,106", change: "+10.2%", note: "Currently active", icon: CheckCircle2, color: C.green },
    { label: "Total members", value: "24,582", change: "+12.8%", note: "Across organizations", icon: Users, color: C.purple },
    { label: "API requests", value: "8.42M", change: "+18.6%", note: "Organization workloads", icon: Activity, color: C.teal },
  ];

  const planStats = [
    { label: "Enterprise", count: 184, percent: 14, color: C.purple },
    { label: "Business", count: 426, percent: 33, color: C.blue },
    { label: "Starter", count: 674, percent: 53, color: C.teal },
  ];

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>ModelNow / Dashboard / Analytics</div>
          <h1 style={css.heading}>Organization Analytics</h1>
          <p style={css.subtitle}>
            Measure organization growth, plan adoption, team usage, and workspace health.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select aria-label="Analytics period" style={css.select} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
          </select>
          <button style={css.button} onClick={() => { setRefreshed("Just now"); setExportMessage(""); }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={css.button} onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      <div style={{ ...css.card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18, background: "#eef2ff", borderColor: "#dfe5ff" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#dce4ff", color: C.blue, display: "grid", placeItems: "center" }}>
          <Building2 size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Organization insights</div>
          <div style={{ ...css.muted, marginTop: 4 }}>Selected period: {period}. Figures below are sample UI data, not live customer records.</div>
        </div>
        <span style={{ ...css.pill, background: "#fff", color: C.blue }}>DEMO DATA</span>
      </div>

      <div style={css.grid}>
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} style={css.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#667085", fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 11, background: `${item.color}14`, color: item.color }}>
                  <Icon size={19} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.8, marginTop: 17 }}>{item.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ ...css.pill, background: "#eaf8f0", color: C.green }}><ArrowUpRight size={12} />{item.change}</span>
                <span style={css.muted}>{item.note}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={css.two}>
        <Panel title="Organization growth" subtitle={`Illustrative growth index · ${period}`}>
          <div style={{ display: "flex", gap: 22, marginBottom: 16, fontSize: 11, fontWeight: 800 }}>
            <span style={{ color: C.blue }}>● Organizations</span>
            <span style={{ color: C.teal }}>● Members</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${trend[period].length}, minmax(0, 1fr))`, alignItems: "end", gap: 9, height: 180 }}>
            {trend[period].map((value, index) => (
              <div key={`${period}-${index}`} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 8 }}>
                <div title={`Growth index ${value}`} style={{ width: "100%", maxWidth: 28, height: `${value}%`, minHeight: 5, borderRadius: "5px 5px 0 0", background: `linear-gradient(180deg, ${C.blue}, #a7b2ff)` }} />
                <span style={{ fontSize: 9, color: C.muted }}>{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Organization plan distribution" subtitle="Illustrative distribution across plans">
          {planStats.map((plan) => (
            <div key={plan.label} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{plan.label}</span>
                <strong style={{ fontSize: 12 }}>{plan.count}</strong>
                <span style={{ color: C.muted, fontSize: 11 }}>{plan.percent}%</span>
              </div>
              <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${plan.percent}%`, height: "100%", background: plan.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
          <div style={{ padding: 13, background: "#f8f9fc", borderRadius: 9, display: "flex", gap: 10, alignItems: "center", marginTop: 20 }}>
            <CreditCard size={18} color={C.purple} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>Plan adoption</div>
              <div style={{ ...css.muted, marginTop: 4 }}>Use Billing to manage subscriptions and invoices.</div>
            </div>
          </div>
        </Panel>
      </div>

      <div style={css.two}>
        <Panel title="Organization health" subtitle="Illustrative workspace status breakdown">
          {[
            { label: "Active", count: 1106, percent: 86, color: C.green },
            { label: "Pending", count: 126, percent: 10, color: C.orange },
            { label: "Suspended", count: 52, percent: 4, color: C.red },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                <strong style={{ fontSize: 12 }}>{item.count}</strong>
                <span style={{ color: C.muted, fontSize: 11 }}>{item.percent}%</span>
              </div>
              <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${item.percent}%`, height: "100%", background: item.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Usage by organization" subtitle="Highest request volumes in the sample dataset">
          {[...organizations].sort((a, b) => b.requests - a.requests).slice(0, 5).map((org) => {
            const max = Math.max(...organizations.map((item) => item.requests));
            return (
              <div key={org.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{org.name}</span>
                  <strong style={{ fontSize: 12 }}>{formatCompact(org.requests)}</strong>
                </div>
                <div style={{ height: 7, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${(org.requests / max) * 100}%`, height: "100%", background: C.blue, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <Panel
        title="Organization directory snapshot"
        subtitle={`${filteredOrganizations.length} sample organizations match the selected filters`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: 180 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: C.muted }} />
              <input
                style={{ ...css.input, paddingLeft: 31 }}
                placeholder="Search organizations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search organizations"
              />
            </div>
            <select style={css.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <select style={css.select} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} aria-label="Filter by plan">
              <option>All plans</option>
              <option>Enterprise</option>
              <option>Business</option>
              <option>Starter</option>
            </select>
            <select style={css.select} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} aria-label="Filter by region">
              <option>All regions</option>
              <option>North America</option>
              <option>Europe</option>
              <option>Asia Pacific</option>
            </select>
          </div>
        }
      >
        {exportMessage && <p role="status" style={{ color: C.green, fontSize: 12 }}>{exportMessage}</p>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Organization", "Plan", "Members", "API requests", "Region", "Status", "Joined"].map((label) => (
                  <th key={label} style={css.th}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org) => {
                const color = org.status === "Active" ? C.green : org.status === "Pending" ? C.orange : C.red;
                return (
                  <tr key={org.id}>
                    <td style={css.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 190 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#edf0ff", color: C.blue, display: "grid", placeItems: "center" }}>
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{org.name}</div>
                          <div style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{org.id} · {org.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td style={css.td}>{org.plan}</td>
                    <td style={css.td}>{org.members}</td>
                    <td style={{ ...css.td, fontWeight: 700 }}>{formatCompact(org.requests)}</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{org.region}</td>
                    <td style={css.td}>
                      <span style={{ ...css.pill, background: `${color}15`, color }}>{org.status}</span>
                    </td>
                    <td style={{ ...css.td, whiteSpace: "nowrap", color: C.muted }}>{org.joined}</td>
                  </tr>
                );
              })}
              {filteredOrganizations.length === 0 && (
                <tr><td colSpan={7} style={{ ...css.td, textAlign: "center", color: C.muted }}>No organizations match your search and filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={{ ...css.two, marginTop: 18 }}>
        <Panel title="Regional distribution" subtitle="Illustrative organization distribution">
          {[
            { name: "North America", value: 42, count: 539, color: C.blue },
            { name: "Europe", value: 31, count: 398, color: C.purple },
            { name: "Asia Pacific", value: 21, count: 270, color: C.teal },
            { name: "Other regions", value: 6, count: 77, color: C.orange },
          ].map((region) => (
            <div key={region.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Globe size={15} color={region.color} />
              <span style={{ flex: 1, fontSize: 12 }}>{region.name}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{region.count}</span>
              <strong style={{ fontSize: 12, minWidth: 34, textAlign: "right" }}>{region.value}%</strong>
            </div>
          ))}
        </Panel>
        <Panel title="Organization administration" subtitle="Suggested operational shortcuts">
          {[
            { label: "Review pending organizations", description: "Check onboarding and verification", icon: Clock3, color: C.orange },
            { label: "Review suspended organizations", description: "Investigate access restrictions", icon: ShieldAlert, color: C.red },
            { label: "Manage organization members", description: "Review teams, roles, and invitations", icon: Users, color: C.blue },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ display: "flex", gap: 11, alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 35, height: 35, borderRadius: 9, background: `${item.color}14`, color: item.color, display: "grid", placeItems: "center" }}>
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{item.label}</div>
                  <div style={{ ...css.muted, marginTop: 4 }}>{item.description}</div>
                </div>
                <ArrowUpRight size={15} color={C.muted} />
              </div>
            );
          })}
        </Panel>
      </div>

      <footer style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 18, color: C.muted, fontSize: 11 }}>
        <span>ModelNow Admin · Organization Analytics</span>
        <span><RefreshCw size={11} style={{ verticalAlign: "middle", marginRight: 5 }} />Last refreshed: {refreshed}</span>
      </footer>
    </main>
  );
}
