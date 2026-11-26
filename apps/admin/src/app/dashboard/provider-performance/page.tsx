
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Globe,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

type ProviderStatus = "Healthy" | "Degraded" | "Unavailable";

type Provider = {
  name: string;
  category: string;
  status: ProviderStatus;
  availability: number;
  latency: number;
  successRate: number;
  errorRate: number;
  requests: number;
  tokens: number;
  regions: string;
  configuredModels: string;
  lastChecked: string;
};

const providers: Provider[] = [
  {
    name: "OpenAI",
    category: "Hosted API",
    status: "Healthy",
    availability: 99.95,
    latency: 420,
    successRate: 99.4,
    errorRate: 0.6,
    requests: 284600,
    tokens: 2760000,
    regions: "Global",
    configuredModels: "GPT family",
    lastChecked: "30 sec ago",
  },
  {
    name: "Anthropic",
    category: "Hosted API",
    status: "Healthy",
    availability: 99.91,
    latency: 510,
    successRate: 99.2,
    errorRate: 0.8,
    requests: 198400,
    tokens: 2270000,
    regions: "US / EU",
    configuredModels: "Claude family",
    lastChecked: "45 sec ago",
  },
  {
    name: "Google",
    category: "Hosted API",
    status: "Degraded",
    availability: 98.82,
    latency: 1180,
    successRate: 97.8,
    errorRate: 2.2,
    requests: 164200,
    tokens: 2010000,
    regions: "Global",
    configuredModels: "Gemini family",
    lastChecked: "20 sec ago",
  },
  {
    name: "Open model infrastructure",
    category: "Self-hosted / external",
    status: "Healthy",
    availability: 99.72,
    latency: 280,
    successRate: 98.9,
    errorRate: 1.1,
    requests: 142800,
    tokens: 1470000,
    regions: "US / India",
    configuredModels: "Llama family",
    lastChecked: "1 min ago",
  },
  {
    name: "ModelNow inference",
    category: "Internal endpoint",
    status: "Healthy",
    availability: 99.96,
    latency: 430,
    successRate: 99.3,
    errorRate: 0.7,
    requests: 275900,
    tokens: 2980000,
    regions: "Configured regions",
    configuredModels: "Efficient / Quality",
    lastChecked: "15 sec ago",
  },
];

const incidents = [
  {
    id: "PRV-301",
    provider: "Google",
    severity: "Medium",
    title: "Elevated response latency",
    detail: "Response time exceeded the illustrative 1-second threshold.",
    state: "Investigating",
    time: "10:38 AM",
  },
  {
    id: "PRV-300",
    provider: "Anthropic",
    severity: "Low",
    title: "Intermittent request retries",
    detail: "Retry volume returned to the expected range.",
    state: "Resolved",
    time: "09:52 AM",
  },
  {
    id: "PRV-299",
    provider: "Open model infrastructure",
    severity: "Low",
    title: "Worker capacity warning",
    detail: "Capacity warning cleared in the sample event history.",
    state: "Resolved",
    time: "08:41 AM",
  },
];

const trend = [
  { label: "00:00", openai: 390, anthropic: 480, google: 620, modelnow: 410 },
  { label: "04:00", openai: 405, anthropic: 495, google: 690, modelnow: 420 },
  { label: "08:00", openai: 420, anthropic: 510, google: 910, modelnow: 415 },
  { label: "12:00", openai: 450, anthropic: 530, google: 1180, modelnow: 430 },
  { label: "16:00", openai: 430, anthropic: 520, google: 980, modelnow: 425 },
  { label: "20:00", openai: 410, anthropic: 500, google: 760, modelnow: 405 },
];

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

const css: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 28, background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 15, marginBottom: 23 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: C.muted, marginBottom: 8 },
  heading: { fontSize: 28, fontWeight: 800, letterSpacing: -0.7, margin: 0 },
  subtitle: { fontSize: 13, lineHeight: 1.6, color: C.muted, margin: "8px 0 0" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 205px), 1fr))", gap: 15, marginBottom: 18 },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: 18, marginBottom: 18 },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 12px", background: "#fff", color: "#344054", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  select: { border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 11px", background: "#fff", color: "#344054", fontSize: 12 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 18 },
  panelTitle: { margin: 0, fontSize: 14, fontWeight: 800 },
  muted: { color: C.muted, fontSize: 12 },
  pill: { display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  th: { textAlign: "left", padding: "12px 10px", color: "#8590a2", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid #edf0f5" },
  td: { padding: "13px 10px", borderBottom: "1px solid #f0f2f6", fontSize: 12, verticalAlign: "middle" },
  input: { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 11px 10px 32px", fontSize: 12, outline: "none", background: "#fff" },
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

function statusStyle(status: ProviderStatus) {
  if (status === "Healthy") return { background: "#e9f8f0", color: C.green };
  if (status === "Degraded") return { background: "#fff5e5", color: C.orange };
  return { background: "#fff0f0", color: C.red };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCompact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export default function ProviderPerformancePage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [period, setPeriod] = useState("24 hours");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showIncidents, setShowIncidents] = useState(true);

  const filteredProviders = useMemo(() => {
    const search = query.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesSearch =
        !search ||
        [
          provider.name,
          provider.category,
          provider.configuredModels,
          provider.regions,
        ].some((value) => value.toLowerCase().includes(search));

      const matchesStatus =
        statusFilter === "All statuses" || provider.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [query, statusFilter]);

  const totalRequests = providers.reduce((sum, provider) => sum + provider.requests, 0);
  const averageLatency = Math.round(providers.reduce((sum, provider) => sum + provider.latency, 0) / providers.length);
  const averageAvailability = providers.reduce((sum, provider) => sum + provider.availability, 0) / providers.length;
  const healthyCount = providers.filter((provider) => provider.status === "Healthy").length;
  const degradedCount = providers.filter((provider) => provider.status === "Degraded").length;

  const metrics = [
    { label: "Configured providers", value: String(providers.length), detail: `${healthyCount} healthy`, change: "Connected entries", icon: Server, color: C.blue },
    { label: "Average availability", value: `${averageAvailability.toFixed(2)}%`, detail: "Across listed providers", change: "+0.08%", icon: ShieldCheck, color: C.green },
    { label: "Average latency", value: `${averageLatency} ms`, detail: "Provider response time", change: "-5.6%", icon: Clock3, color: C.purple },
    { label: "Total requests", value: formatCompact(totalRequests), detail: `Illustrative · ${period}`, change: "+14.2%", icon: Activity, color: C.teal },
  ];

  function exportCSV() {
    const headers = ["Provider", "Category", "Status", "Availability", "Latency ms", "Success rate", "Error rate", "Requests", "Tokens", "Regions", "Models"];
    const rows = filteredProviders.map((provider) => [
      provider.name,
      provider.category,
      provider.status,
      provider.availability,
      provider.latency,
      provider.successRate,
      provider.errorRate,
      provider.requests,
      provider.tokens,
      provider.regions,
      provider.configuredModels,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-provider-performance.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>ModelNow / Dashboard / AI Analytics</div>
          <h1 style={css.heading}>Provider Performance</h1>
          <p style={css.subtitle}>
            Compare model provider reliability, latency, request volume, and integration health.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select aria-label="Performance period" value={period} onChange={(event) => setPeriod(event.target.value)} style={css.select}>
            {["1 hour", "24 hours", "7 days", "30 days"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button style={css.button} onClick={() => setLastUpdated("Just now")}><RefreshCw size={14} /> Refresh</button>
          <button style={css.button} onClick={exportCSV}><Download size={14} /> Export CSV</button>
        </div>
      </header>

      <div style={{ ...css.card, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18, background: "#eef2ff", borderColor: "#dce4ff" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "#dce4ff", color: C.blue, display: "grid", placeItems: "center" }}>
          <Globe size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 190 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Provider observability workspace</div>
          <div style={{ ...css.muted, marginTop: 4 }}>Environment: Production · Provider metrics are illustrative · Updated {lastUpdated}</div>
        </div>
        <span style={{ ...css.pill, background: "#fff", color: C.blue }}>DEMO DATA</span>
      </div>

      <div style={css.grid}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} style={css.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#667085" }}>{metric.label}</span>
                <span style={{ width: 37, height: 37, borderRadius: 10, display: "grid", placeItems: "center", background: `${metric.color}14`, color: metric.color }}>
                  <Icon size={18} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.7, marginTop: 16 }}>{metric.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ ...css.pill, background: "#e9f8f0", color: C.green }}>
                  {metric.label === "Average latency" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {metric.change}
                </span>
                <span style={css.muted}>{metric.detail}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={css.two}>
        <Panel title="Provider latency comparison" subtitle="Illustrative average response time in milliseconds">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {providers.map((provider) => {
              const barColor = provider.status === "Degraded" ? C.orange : provider.name === "ModelNow inference" ? C.green : C.blue;
              const width = Math.min(100, (provider.latency / 1300) * 100);
              return (
                <div key={provider.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{provider.name}</span>
                    <strong style={{ fontSize: 12 }}>{provider.latency} ms</strong>
                  </div>
                  <div style={{ height: 9, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${width}%`, height: "100%", background: barColor, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ ...css.muted, lineHeight: 1.6, margin: "17px 0 0" }}>
            Lower latency can improve responsiveness, but compare models and regions under equivalent workloads.
          </p>
        </Panel>

        <Panel title="Provider reliability" subtitle="Availability and successful request rates">
          {providers.map((provider) => {
            const status = statusStyle(provider.status);
            return (
              <div key={provider.name} style={{ padding: "12px 0", borderBottom: `1px solid #f0f2f6` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 9 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{provider.name}</div>
                    <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{provider.regions}</div>
                  </div>
                  <span style={{ ...css.pill, background: status.background, color: status.color }}>{provider.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6, fontSize: 10, marginBottom: 5 }}>
                      <span style={{ color: C.muted }}>Availability</span><strong>{provider.availability}%</strong>
                    </div>
                    <div style={{ height: 5, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${provider.availability}%`, height: "100%", background: C.green }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6, fontSize: 10, marginBottom: 5 }}>
                      <span style={{ color: C.muted }}>Success rate</span><strong>{provider.successRate}%</strong>
                    </div>
                    <div style={{ height: 5, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${provider.successRate}%`, height: "100%", background: C.blue }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <Panel
        title="Provider directory"
        subtitle={`${filteredProviders.length} providers match your filters`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 190 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: C.muted }} />
              <input aria-label="Search providers" placeholder="Search provider..." value={query} onChange={(event) => setQuery(event.target.value)} style={css.input} />
            </div>
            <select aria-label="Filter provider status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={css.select}>
              {["All statuses", "Healthy", "Degraded", "Unavailable"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Provider", "Status", "Availability", "Latency", "Success", "Error rate", "Requests", "Models", ""].map((item) => <th key={item} style={css.th}>{item}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => {
                const status = statusStyle(provider.status);
                return (
                  <tr key={provider.name}>
                    <td style={css.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 175 }}>
                        <span style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 8, background: "#f1f4ff", color: C.blue }}>
                          <Server size={16} />
                        </span>
                        <div>
                          <div style={{ fontWeight: 800 }}>{provider.name}</div>
                          <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{provider.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={css.td}><span style={{ ...css.pill, background: status.background, color: status.color }}>{provider.status}</span></td>
                    <td style={{ ...css.td, whiteSpace: "nowrap", fontWeight: 700 }}>{provider.availability}%</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{provider.latency} ms</td>
                    <td style={css.td}>{provider.successRate}%</td>
                    <td style={{ ...css.td, color: provider.errorRate > 1.5 ? C.red : C.muted }}>{provider.errorRate}%</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{formatNumber(provider.requests)}</td>
                    <td style={{ ...css.td, minWidth: 120 }}>{provider.configuredModels}</td>
                    <td style={css.td}>
                      <button aria-label={`View ${provider.name} details`} style={{ ...css.button, padding: 7 }} onClick={() => setSelectedProvider(provider)}>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProviders.length === 0 && <tr><td colSpan={9} style={{ ...css.td, textAlign: "center", color: C.muted }}>No providers match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={{ height: 18 }} />

      <div style={css.two}>
        <Panel title="Request volume trend" subtitle={`Illustrative requests over ${period}`}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180, padding: "12px 2px 0" }}>
            {trend.map((point) => {
              const total = point.openai + point.anthropic + point.google + point.modelnow;
              return (
                <div key={point.label} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                  <span style={{ color: C.muted, fontSize: 9 }}>{formatCompact(total * 180)}</span>
                  <div title={`${point.label}: sample traffic`} style={{ height: `${(total / 4000) * 125}px`, width: "min(100%, 35px)", minHeight: 12, borderRadius: "5px 5px 2px 2px", background: `linear-gradient(180deg, ${C.blue}, #bdc8ff)` }} />
                  <span style={{ color: C.muted, fontSize: 10 }}>{point.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
            {[["OpenAI", C.blue], ["Anthropic", C.purple], ["Google", C.orange], ["ModelNow", C.green]].map(([label, color]) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: C.muted }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: color as string }} />{label}
              </span>
            ))}
          </div>
        </Panel>

        <Panel
          title="Provider incidents"
          subtitle={`${incidents.filter((item) => item.state !== "Resolved").length} active incident in sample data`}
          action={<button style={css.button} onClick={() => setShowIncidents((value) => !value)}>{showIncidents ? "Hide" : "Show"}</button>}
        >
          {showIncidents ? incidents.map((incident) => {
            const resolved = incident.state === "Resolved";
            const color = incident.severity === "Medium" ? C.orange : C.blue;
            return (
              <div key={incident.id} style={{ display: "flex", gap: 10, padding: "13px 0", borderBottom: `1px solid #f0f2f6` }}>
                <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: "grid", placeItems: "center", background: resolved ? "#e9f8f0" : "#fff5e5", color: resolved ? C.green : color }}>
                  {resolved ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 12 }}>{incident.id}</strong>
                    <span style={{ ...css.pill, background: `${color}14`, color }}>{incident.severity}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{incident.provider} · {incident.title}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{incident.detail}</div>
                  <div style={{ color: C.muted, fontSize: 10, marginTop: 7 }}>{incident.time} · {incident.state}</div>
                </div>
              </div>
            );
          }) : <div style={{ padding: 25, textAlign: "center", color: C.muted, fontSize: 12 }}>Incident history is hidden.</div>}
        </Panel>
      </div>

      <div style={{ ...css.card, display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, background: "#fff9eb", borderColor: "#f6e5bb" }}>
        <TrendingUp size={18} color={C.orange} />
        <div style={{ fontSize: 12, lineHeight: 1.7, color: "#805d1b" }}>
          <strong>Production integration note:</strong> Provider availability, latency, request volume, and incident records are illustrative. Connect provider health checks, gateway logs, and actual request telemetry before relying on these values.
        </div>
      </div>

      <footer style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", color: C.muted, fontSize: 11, marginTop: 18 }}>
        <span>ModelNow Admin · Provider Performance</span>
        <span>Last refreshed: {lastUpdated} · {healthyCount} healthy · {degradedCount} degraded</span>
      </footer>

      {selectedProvider && (
        <div
          role="presentation"
          onClick={() => setSelectedProvider(null)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,.4)", display: "flex", justifyContent: "flex-end" }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProvider.name} provider details`}
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(440px, 100%)", height: "100%", overflowY: "auto", boxSizing: "border-box", background: "#fff", padding: 25, boxShadow: "-10px 0 40px rgba(0,0,0,.12)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={css.eyebrow}>Provider details</div>
                <h2 style={{ margin: 0, fontSize: 23 }}>{selectedProvider.name}</h2>
                <p style={{ color: C.muted, fontSize: 12 }}>{selectedProvider.category}</p>
              </div>
              <button style={css.button} onClick={() => setSelectedProvider(null)}>Close</button>
            </div>

            <span style={{ ...css.pill, ...statusStyle(selectedProvider.status) }}>{selectedProvider.status}</span>

            {[
              ["Availability", `${selectedProvider.availability}%`],
              ["Average latency", `${selectedProvider.latency} ms`],
              ["Success rate", `${selectedProvider.successRate}%`],
              ["Error rate", `${selectedProvider.errorRate}%`],
              ["Requests", formatNumber(selectedProvider.requests)],
              ["Tokens", formatNumber(selectedProvider.tokens)],
              ["Models", selectedProvider.configuredModels],
              ["Regions", selectedProvider.regions],
              ["Last checked", selectedProvider.lastChecked],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "15px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.muted }}>{label}</span>
                <strong style={{ textAlign: "right" }}>{value}</strong>
              </div>
            ))}

            <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.7, marginTop: 20 }}>
              This panel uses sample metrics. Live health checks and provider configuration should come from protected backend endpoints.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
