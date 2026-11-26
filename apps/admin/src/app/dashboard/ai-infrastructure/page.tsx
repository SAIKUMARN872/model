
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CirclePause,
  Cloud,
  Cpu,
  Database,
  Gauge,
  Globe,
  HardDrive,
  Layers3,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Signal,
  Zap,
} from "lucide-react";

type ServiceStatus = "Operational" | "Degraded" | "Maintenance" | "Offline";

type Service = {
  name: string;
  category: string;
  status: ServiceStatus;
  uptime: number;
  latency: number;
  requests: string;
  region: string;
  version: string;
  description: string;
  icon: typeof Server;
};

const C = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e6eaf1",
  text: "#172033",
  muted: "#778397",
  blue: "#5269ee",
  green: "#149b68",
  orange: "#d99120",
  red: "#d94d56",
  purple: "#8858e8",
  teal: "#0789a9",
};

const services: Service[] = [
  {
    name: "AI Gateway",
    category: "Traffic management",
    status: "Operational",
    uptime: 99.99,
    latency: 42,
    requests: "1.24M",
    region: "Global",
    version: "v2.8.1",
    description: "Authentication, request routing, rate limits, and provider selection.",
    icon: Network,
  },
  {
    name: "Model Router",
    category: "Inference orchestration",
    status: "Operational",
    uptime: 99.97,
    latency: 86,
    requests: "842K",
    region: "Global",
    version: "v1.6.0",
    description: "Routes prompts to configured models using policy and performance signals.",
    icon: Layers3,
  },
  {
    name: "Agent Service",
    category: "Agent runtime",
    status: "Operational",
    uptime: 99.95,
    latency: 124,
    requests: "186K",
    region: "US / India",
    version: "v1.4.2",
    description: "Coordinates tools, workflows, and multi-step agent executions.",
    icon: Cpu,
  },
  {
    name: "Knowledge Service",
    category: "Retrieval and indexing",
    status: "Degraded",
    uptime: 98.82,
    latency: 318,
    requests: "96K",
    region: "US East",
    version: "v1.3.4",
    description: "Document ingestion, indexing, retrieval, and context preparation.",
    icon: Database,
  },
  {
    name: "Browser Service",
    category: "Web automation",
    status: "Operational",
    uptime: 99.91,
    latency: 215,
    requests: "54K",
    region: "US / EU",
    version: "v1.2.7",
    description: "Manages browser sessions and supported web automation tasks.",
    icon: Globe,
  },
  {
    name: "Multimodal Service",
    category: "Media processing",
    status: "Operational",
    uptime: 99.88,
    latency: 176,
    requests: "72K",
    region: "Global",
    version: "v1.1.5",
    description: "Coordinates image, audio, and other supported media requests.",
    icon: Activity,
  },
  {
    name: "Usage Metering",
    category: "Usage and billing",
    status: "Operational",
    uptime: 99.99,
    latency: 24,
    requests: "2.16M",
    region: "Global",
    version: "v2.2.0",
    description: "Tracks request usage, token estimates, and billable events.",
    icon: Gauge,
  },
  {
    name: "Policy Engine",
    category: "Security and governance",
    status: "Operational",
    uptime: 99.98,
    latency: 18,
    requests: "1.09M",
    region: "Global",
    version: "v1.8.3",
    description: "Applies access policies, request checks, and governance rules.",
    icon: ShieldCheck,
  },
];

const providers = [
  { name: "OpenAI", models: "GPT family", status: "Configured", latency: 420, availability: 99.9, color: C.green },
  { name: "Anthropic", models: "Claude family", status: "Configured", latency: 510, availability: 99.8, color: C.purple },
  { name: "Google", models: "Gemini family", status: "Configured", latency: 390, availability: 99.7, color: C.blue },
  { name: "Meta / Open models", models: "Llama family", status: "Configured", latency: 280, availability: 99.6, color: C.teal },
];

const incidents = [
  { id: "INC-204", severity: "Medium", service: "Knowledge Service", detail: "Retrieval latency above target", time: "12 min ago", state: "Investigating" },
  { id: "INC-203", severity: "Low", service: "Browser Service", detail: "One browser worker restarted", time: "46 min ago", state: "Resolved" },
  { id: "INC-202", severity: "Low", service: "Model Router", detail: "Provider timeout spike observed", time: "2 hours ago", state: "Resolved" },
];

const css: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 28, background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 8 },
  heading: { fontSize: 28, letterSpacing: -0.7, fontWeight: 800, margin: 0 },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${C.border}`, borderRadius: 9, background: "#fff", color: "#344054", padding: "10px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  select: { border: `1px solid ${C.border}`, borderRadius: 9, background: "#fff", padding: "10px 11px", color: "#344054", fontSize: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 205px), 1fr))", gap: 15, marginBottom: 18 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  panelTitle: { margin: 0, fontSize: 14, fontWeight: 800 },
  muted: { fontSize: 12, color: C.muted },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 18, marginBottom: 18 },
  panelHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  pill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  input: { border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 11px", fontSize: 12, background: "#fff", color: C.text, outline: "none", width: "100%", boxSizing: "border-box" },
  th: { textAlign: "left", padding: "12px 10px", color: "#8590a2", fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid #edf0f5" },
  td: { padding: "13px 10px", borderBottom: "1px solid #f0f2f6", fontSize: 12, verticalAlign: "middle" },
};

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section style={css.card}>
      <div style={css.panelHeader}>
        <div>
          <h2 style={css.panelTitle}>{title}</h2>
          {subtitle && <p style={{ ...css.muted, margin: "6px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function statusStyle(status: ServiceStatus) {
  if (status === "Operational") return { background: "#e9f8f0", color: C.green };
  if (status === "Degraded") return { background: "#fff5e5", color: C.orange };
  if (status === "Maintenance") return { background: "#f0eaff", color: C.purple };
  return { background: "#fff0f0", color: C.red };
}

export default function AIInfrastructurePage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All services");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [period, setPeriod] = useState("24 hours");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [showIncidents, setShowIncidents] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesQuery =
        !q ||
        [service.name, service.category, service.region, service.description]
          .some((value) => value.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All services" || service.status === statusFilter;

      const matchesRegion =
        regionFilter === "All regions" ||
        service.region.toLowerCase().includes(regionFilter.toLowerCase());

      return matchesQuery && matchesStatus && matchesRegion;
    });
  }, [query, statusFilter, regionFilter]);

  const operational = services.filter((service) => service.status === "Operational").length;
  const degraded = services.filter((service) => service.status === "Degraded").length;
  const offline = services.filter((service) => service.status === "Offline").length;

  const metricCards = [
    { label: "Service availability", value: "99.94%", change: "+0.12%", icon: Signal, color: C.green, description: "Platform availability estimate" },
    { label: "Requests processed", value: "2.16M", change: "+18.4%", icon: Activity, color: C.blue, description: `Illustrative · ${period}` },
    { label: "Average gateway latency", value: "42 ms", change: "-8.2%", icon: Zap, color: C.purple, description: "Lower is generally better" },
    { label: "Active incidents", value: String(incidents.filter((item) => item.state !== "Resolved").length), change: "1 investigating", icon: AlertTriangle, color: C.orange, description: "Sample incident records" },
  ];

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>ModelNow / Dashboard / Infrastructure</div>
          <h1 style={css.heading}>AI Infrastructure</h1>
          <p style={css.subtitle}>
            Monitor AI platform services, inference routing, providers, reliability, and operational incidents.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select
            aria-label="Monitoring period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            style={css.select}
          >
            {["1 hour", "24 hours", "7 days", "30 days"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button style={css.button} onClick={() => setLastUpdated("Just now")}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </header>

      <div style={{ ...css.card, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18, background: "#eef2ff", borderColor: "#dce4ff" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "#dce4ff", color: C.blue, display: "grid", placeItems: "center" }}>
          <Cloud size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 190 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>ModelNow infrastructure workspace</div>
          <div style={{ ...css.muted, marginTop: 4 }}>Environment: Production · Scope: AI platform services · Updated {lastUpdated}</div>
        </div>
        <span style={{ ...css.pill, background: "#fff", color: C.blue }}>DEMO MONITORING</span>
      </div>

      <div style={css.grid}>
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} style={css.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#667085", fontWeight: 700 }}>{metric.label}</span>
                <span style={{ width: 37, height: 37, borderRadius: 10, background: `${metric.color}14`, color: metric.color, display: "grid", placeItems: "center" }}>
                  <Icon size={18} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.7, marginTop: 16 }}>{metric.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ ...css.pill, background: "#eaf8f0", color: C.green }}>
                  {metric.label === "Active incidents" ? <AlertTriangle size={12} /> : <ArrowUpRight size={12} />}
                  {metric.change}
                </span>
                <span style={css.muted}>{metric.description}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={css.two}>
        <Panel title="Service health" subtitle="Current illustrative service status">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Operational", count: operational, color: C.green, icon: CheckCircle2 },
              { label: "Degraded", count: degraded, color: C.orange, icon: AlertTriangle },
              { label: "Offline", count: offline, color: C.red, icon: CirclePause },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ padding: 13, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <Icon size={18} color={item.color} />
                  <div style={{ fontSize: 25, fontWeight: 800, marginTop: 9 }}>{item.count}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{item.label}</div>
                </div>
              );
            })}
          </div>

          {services.map((service) => {
            const Icon = service.icon;
            const colors = statusStyle(service.status);
            return (
              <div key={service.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: `1px solid #f0f2f6` }}>
                <div style={{ width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 9, background: "#f1f4ff", color: C.blue }}>
                  <Icon size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{service.name}</div>
                  <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{service.category}</div>
                </div>
                <span style={{ ...css.pill, background: colors.background, color: colors.color }}>{service.status}</span>
              </div>
            );
          })}
        </Panel>

        <Panel title="Infrastructure resource utilization" subtitle="Illustrative capacity indicators">
          {[
            { label: "CPU utilization", value: 58, color: C.blue, icon: Cpu, detail: "Average across worker pool" },
            { label: "Memory utilization", value: 71, color: C.purple, icon: HardDrive, detail: "Allocated service memory" },
            { label: "Storage utilization", value: 43, color: C.teal, icon: Database, detail: "Document and event storage" },
            { label: "Network utilization", value: 36, color: C.green, icon: Network, detail: "Estimated network capacity" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ padding: "15px 0", borderBottom: `1px solid #f0f2f6` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                  <Icon size={17} color={item.color} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                  <strong style={{ fontSize: 13 }}>{item.value}%</strong>
                </div>
                <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${item.value}%`, height: "100%", borderRadius: 99, background: item.color }} />
                </div>
                <div style={{ ...css.muted, fontSize: 10, marginTop: 6 }}>{item.detail}</div>
              </div>
            );
          })}

          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "#f0f9ff", padding: 12, borderRadius: 9, marginTop: 15 }}>
            <Gauge size={17} color={C.teal} />
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "#285d73" }}>
              Connect infrastructure metrics to report actual CPU, memory, storage, and network usage.
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        title="Platform services"
        subtitle={`${filteredServices.length} services match your filters`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 190 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: C.muted }} />
              <input
                aria-label="Search platform services"
                placeholder="Search services..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ ...css.input, paddingLeft: 31 }}
              />
            </div>
            <select aria-label="Filter service status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={css.select}>
              {["All services", "Operational", "Degraded", "Maintenance", "Offline"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter service region" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} style={css.select}>
              {["All regions", "Global", "US", "EU", "India"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Service", "Status", "Uptime", "Latency", "Requests", "Region", "Version", ""].map((item) => (
                  <th key={item} style={css.th}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => {
                const Icon = service.icon;
                const colors = statusStyle(service.status);
                return (
                  <tr key={service.name}>
                    <td style={css.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 175 }}>
                        <span style={{ width: 31, height: 31, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 8, background: "#f1f4ff", color: C.blue }}>
                          <Icon size={16} />
                        </span>
                        <div>
                          <div style={{ fontWeight: 800 }}>{service.name}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{service.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={css.td}><span style={{ ...css.pill, background: colors.background, color: colors.color }}>{service.status}</span></td>
                    <td style={{ ...css.td, fontWeight: 700, whiteSpace: "nowrap" }}>{service.uptime}%</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{service.latency} ms</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{service.requests}</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{service.region}</td>
                    <td style={{ ...css.td, color: C.muted }}>{service.version}</td>
                    <td style={css.td}>
                      <button aria-label={`View ${service.name}`} onClick={() => setSelectedService(service)} style={{ ...css.button, padding: 7 }}>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredServices.length === 0 && (
                <tr><td colSpan={8} style={{ ...css.td, textAlign: "center", color: C.muted }}>No services match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={{ height: 18 }} />

      <div style={css.two}>
        <Panel title="Configured model providers" subtitle="Provider integration overview">
          {providers.map((provider) => (
            <div key={provider.name} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 0", borderBottom: `1px solid #f0f2f6` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: `${provider.color}14`, color: provider.color }}>
                <Server size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{provider.name}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{provider.models}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{provider.latency} ms</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{provider.availability}% availability</div>
              </div>
              <span style={{ ...css.pill, background: "#e9f8f0", color: C.green }}>{provider.status}</span>
            </div>
          ))}
          <p style={{ ...css.muted, lineHeight: 1.6, margin: "14px 0 0" }}>
            Provider entries are examples. Confirm credentials, endpoint health, and real availability with backend checks.
          </p>
        </Panel>

        <Panel
          title="Incident timeline"
          subtitle="Sample infrastructure events"
          action={
            <button style={css.button} onClick={() => setShowIncidents((value) => !value)}>
              {showIncidents ? "Hide incidents" : "Show incidents"}
            </button>
          }
        >
          {showIncidents ? incidents.map((incident) => {
            const resolved = incident.state === "Resolved";
            const color = incident.severity === "Medium" ? C.orange : C.blue;
            return (
              <div key={incident.id} style={{ display: "flex", gap: 11, padding: "13px 0", borderBottom: `1px solid #f0f2f6` }}>
                <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: "grid", placeItems: "center", background: resolved ? "#e9f8f0" : "#fff5e5", color: resolved ? C.green : color }}>
                  {resolved ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 12 }}>{incident.id}</strong>
                    <span style={{ ...css.pill, background: `${color}14`, color }}>{incident.severity}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{incident.service}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{incident.detail}</div>
                  <div style={{ color: C.muted, fontSize: 10, marginTop: 7 }}>{incident.time} · {incident.state}</div>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 12 }}>Incident timeline is hidden.</div>
          )}
        </Panel>
      </div>

      <footer style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", color: C.muted, fontSize: 11, marginTop: 18 }}>
        <span>ModelNow Admin · AI Infrastructure</span>
        <span>Illustrative monitoring data · Updated {lastUpdated}</span>
      </footer>

      {selectedService && (
        <div
          role="presentation"
          onClick={() => setSelectedService(null)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,.4)", display: "flex", justifyContent: "flex-end" }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedService.name} details`}
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(440px, 100%)", height: "100%", overflowY: "auto", boxSizing: "border-box", background: "#fff", padding: 25, boxShadow: "-10px 0 40px rgba(0,0,0,.12)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 15 }}>
              <div>
                <div style={css.eyebrow}>Service details</div>
                <h2 style={{ margin: 0, fontSize: 23 }}>{selectedService.name}</h2>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{selectedService.description}</p>
              </div>
              <button style={css.button} onClick={() => setSelectedService(null)}>Close</button>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ ...css.pill, ...statusStyle(selectedService.status) }}>{selectedService.status}</div>
              {[
                ["Category", selectedService.category],
                ["Uptime", `${selectedService.uptime}%`],
                ["Latency", `${selectedService.latency} ms`],
                ["Requests", selectedService.requests],
                ["Region", selectedService.region],
                ["Version", selectedService.version],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "15px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{label}</span>
                  <strong style={{ textAlign: "right" }}>{value}</strong>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.7, marginTop: 20 }}>
              This panel displays sample service metadata. Live diagnostics and administrative actions require a connected service API.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
