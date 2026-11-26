
"use client";

import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  Globe,
  Layers3,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
  Zap,
  Database,
  Network,
  CircleAlert,
} from "lucide-react";

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
};

const services = [
  { name: "AI Gateway", description: "Model requests and routing", icon: Network, uptime: "99.98%", status: "Operational", color: C.blue },
  { name: "Inference Service", description: "Model execution and responses", icon: Cpu, uptime: "99.95%", status: "Operational", color: C.purple },
  { name: "Agent Service", description: "Agent workflows and tools", icon: Bot, uptime: "99.91%", status: "Operational", color: C.teal },
  { name: "Knowledge Service", description: "Documents and retrieval", icon: Database, uptime: "99.97%", status: "Operational", color: C.green },
  { name: "Browser Service", description: "Browser automation", icon: Globe, uptime: "99.89%", status: "Operational", color: C.orange },
  { name: "Security Service", description: "Access control and policies", icon: ShieldCheck, uptime: "100%", status: "Operational", color: C.green },
];

const capabilities = [
  { name: "AI Chat", detail: "Conversational AI and completions", icon: Bot, active: true },
  { name: "Model Routing", detail: "Provider selection and fallback", icon: Network, active: true },
  { name: "AI Agents", detail: "Multi-step automated workflows", icon: Zap, active: true },
  { name: "Knowledge Hub", detail: "Enterprise document retrieval", icon: Layers3, active: true },
  { name: "Computer Use", detail: "Desktop and browser interaction", icon: Cpu, active: true },
  { name: "Fine-tuning", detail: "Custom model training workflows", icon: Activity, active: true },
];

const growth = [
  { label: "Mon", users: 38, orgs: 24 },
  { label: "Tue", users: 52, orgs: 32 },
  { label: "Wed", users: 45, orgs: 38 },
  { label: "Thu", users: 66, orgs: 43 },
  { label: "Fri", users: 58, orgs: 49 },
  { label: "Sat", users: 77, orgs: 54 },
  { label: "Sun", users: 92, orgs: 63 },
];

const css: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 28, background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 25 },
  eyebrow: { color: C.muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 },
  heading: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.7 },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" },
  button: { display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${C.border}`, background: "#fff", color: "#344054", padding: "10px 13px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 15, marginBottom: 18 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 19, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  muted: { color: C.muted, fontSize: 12 },
  title: { margin: 0, fontSize: 14, fontWeight: 800 },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: 18, marginBottom: 18 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  pill: { display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  progress: { height: 7, background: "#edf0f5", borderRadius: 99, overflow: "hidden" },
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

export default function PlatformOverviewPage() {
  const [period, setPeriod] = useState("Last 7 days");
  const [refreshed, setRefreshed] = useState("Just now");
  const [serviceFilter, setServiceFilter] = useState("All services");
  const [showAllCapabilities, setShowAllCapabilities] = useState(true);

  const filteredServices =
    serviceFilter === "All services"
      ? services
      : services.filter((service) => service.status === serviceFilter);

  const stats = [
    { label: "Total users", value: "24,582", change: "+12.8%", note: "Across all workspaces", icon: Users, color: C.blue },
    { label: "Organizations", value: "1,284", change: "+8.4%", note: "Registered organizations", icon: Building2, color: C.teal },
    { label: "API requests", value: "8.42M", change: "+18.6%", note: "Processed requests", icon: Activity, color: C.purple },
    { label: "Platform availability", value: "99.94%", change: "+0.12%", note: "Illustrative availability", icon: CheckCircle2, color: C.green },
  ];

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>ModelNow / Dashboard / Platform</div>
          <h1 style={css.heading}>Platform Overview</h1>
          <p style={css.subtitle}>
            Understand the overall state of your AI platform, services, growth,
            and capabilities.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Analytics period"
            style={{ border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", background: "#fff", color: "#344054", fontSize: 12 }}
          >
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button style={css.button} onClick={() => setRefreshed("Just now")}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      <div style={{ ...css.card, display: "flex", alignItems: "center", gap: 13, marginBottom: 18, background: "#eef2ff", borderColor: "#dfe5ff" }}>
        <div style={{ width: 39, height: 39, borderRadius: 11, background: "#dce4ff", color: C.blue, display: "grid", placeItems: "center" }}>
          <Globe size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>ModelNow platform control center</div>
          <div style={{ ...css.muted, marginTop: 4 }}>A unified view of platform activity, service availability, and core AI capabilities.</div>
        </div>
        <span style={{ ...css.pill, background: "#fff", color: C.blue }}>DEMO DATA</span>
      </div>

      <div style={css.grid}>
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} style={css.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#667085", fontWeight: 700 }}>{item.label}</span>
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
        <Panel
          title="User and organization growth"
          subtitle={`New activity trend · ${period}`}
          action={<span style={{ ...css.pill, background: "#f0f3ff", color: C.blue }}>Illustrative</span>}
        >
          <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 800 }}>● Users</span>
            <span style={{ fontSize: 11, color: C.teal, fontWeight: 800 }}>● Organizations</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 12, alignItems: "end", height: 175 }}>
            {growth.map((item) => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", height: "100%", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "end", gap: 4, height: 140, width: "100%", justifyContent: "center" }}>
                  <div title={`Users: ${item.users}`} style={{ width: "35%", maxWidth: 18, height: `${item.users}%`, background: C.blue, borderRadius: "5px 5px 0 0" }} />
                  <div title={`Organizations: ${item.orgs}`} style={{ width: "35%", maxWidth: 18, height: `${item.orgs}%`, background: C.teal, borderRadius: "5px 5px 0 0" }} />
                </div>
                <span style={{ color: C.muted, fontSize: 10 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Platform composition"
          subtitle="Core services by category"
        >
          {[
            { name: "AI and model services", value: 32, color: C.blue, icon: Bot },
            { name: "Infrastructure and routing", value: 24, color: C.purple, icon: Network },
            { name: "Knowledge and data", value: 18, color: C.teal, icon: Database },
            { name: "Automation and agents", value: 16, color: C.orange, icon: Zap },
            { name: "Security and governance", value: 10, color: C.green, icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} style={{ marginBottom: 17 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon size={15} color={item.color} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{item.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{item.value}%</span>
                </div>
                <div style={css.progress}>
                  <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <Panel
        title="Platform services"
        subtitle="Service health summary"
        action={
          <select
            aria-label="Filter platform services"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", background: "#fff", fontSize: 12 }}
          >
            <option>All services</option>
            <option>Operational</option>
            <option>Degraded</option>
            <option>Unavailable</option>
          </select>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 270px), 1fr))", gap: 12 }}>
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.name} style={{ border: `1px solid ${C.border}`, borderRadius: 11, padding: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 37, height: 37, borderRadius: 10, background: `${service.color}14`, color: service.color, display: "grid", placeItems: "center" }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{service.name}</div>
                    <div style={{ ...css.muted, marginTop: 4 }}>{service.description}</div>
                  </div>
                  <CheckCircle2 size={16} color={C.green} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                  <span style={css.muted}>Availability</span>
                  <strong style={{ fontSize: 13 }}>{service.uptime}</strong>
                </div>
                <div style={{ ...css.progress, marginTop: 8 }}>
                  <div style={{ height: "100%", width: service.uptime, background: C.green, borderRadius: 99 }} />
                </div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ ...css.pill, background: "#eaf8f0", color: C.green }}>
                    <CheckCircle2 size={11} /> {service.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {filteredServices.length === 0 && (
          <p style={{ color: C.muted, fontSize: 12 }}>No services match this filter.</p>
        )}
      </Panel>

      <div style={{ ...css.two, marginTop: 18 }}>
        <Panel title="Core platform capabilities" subtitle="Product capabilities represented in this console">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button style={css.button} onClick={() => setShowAllCapabilities((v) => !v)}>
              {showAllCapabilities ? "Show fewer" : "Show all"} <ChevronDown size={13} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 11 }}>
            {capabilities.slice(0, showAllCapabilities ? capabilities.length : 3).map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 13, display: "flex", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f1f4ff", color: C.blue, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{item.name}</div>
                    <div style={{ ...css.muted, marginTop: 5, lineHeight: 1.5 }}>{item.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Platform summary" subtitle="At-a-glance operational indicators">
          {[
            { label: "Registered model providers", value: "4", icon: Network, color: C.blue },
            { label: "Platform services", value: "6", icon: Server, color: C.teal },
            { label: "Security controls", value: "Enabled (demo)", icon: ShieldCheck, color: C.green },
            { label: "Average response time", value: "420 ms*", icon: Clock3, color: C.purple },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${item.color}14`, color: item.color, display: "grid", placeItems: "center" }}>
                  <Icon size={17} />
                </div>
                <span style={{ flex: 1, fontSize: 12, color: "#475467" }}>{item.label}</span>
                <strong style={{ fontSize: 12 }}>{item.value}</strong>
              </div>
            );
          })}
          <p style={{ fontSize: 10, lineHeight: 1.6, color: C.muted, marginTop: 12 }}>
            *Sample values for layout preview only. Live values require connected telemetry and backend APIs.
          </p>
        </Panel>
      </div>

      <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 20, color: C.muted, fontSize: 11 }}>
        <span>ModelNow Admin · Platform Overview</span>
        <span><RefreshCw size={11} style={{ verticalAlign: "middle", marginRight: 5 }} />Last refreshed: {refreshed}</span>
      </footer>
    </main>
  );
}
