
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Gauge,
  Layers3,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

type ModelStatus = "Healthy" | "Degraded" | "Offline";

type ModelMetric = {
  name: string;
  provider: string;
  category: string;
  status: ModelStatus;
  latency: number;
  throughput: number;
  success: number;
  errorRate: number;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  version: string;
};

const models: ModelMetric[] = [
  {
    name: "GPT-5",
    provider: "OpenAI",
    category: "Frontier",
    status: "Healthy",
    latency: 820,
    throughput: 128,
    success: 99.4,
    errorRate: 0.6,
    inputTokens: 1820000,
    outputTokens: 940000,
    requests: 284600,
    version: "Configured endpoint",
  },
  {
    name: "Claude",
    provider: "Anthropic",
    category: "Reasoning",
    status: "Healthy",
    latency: 960,
    throughput: 112,
    success: 99.2,
    errorRate: 0.8,
    inputTokens: 1460000,
    outputTokens: 810000,
    requests: 198400,
    version: "Configured endpoint",
  },
  {
    name: "Gemini",
    provider: "Google",
    category: "Multimodal",
    status: "Degraded",
    latency: 1180,
    throughput: 104,
    success: 97.8,
    errorRate: 2.2,
    inputTokens: 1290000,
    outputTokens: 720000,
    requests: 164200,
    version: "Configured endpoint",
  },
  {
    name: "Llama",
    provider: "Open model",
    category: "Open-weight",
    status: "Healthy",
    latency: 540,
    throughput: 156,
    success: 98.9,
    errorRate: 1.1,
    inputTokens: 960000,
    outputTokens: 510000,
    requests: 142800,
    version: "Configured endpoint",
  },
  {
    name: "ModelNow Efficient",
    provider: "ModelNow",
    category: "Cost optimized",
    status: "Healthy",
    latency: 430,
    throughput: 174,
    success: 99.1,
    errorRate: 0.9,
    inputTokens: 780000,
    outputTokens: 420000,
    requests: 119600,
    version: "Internal candidate",
  },
  {
    name: "ModelNow Quality",
    provider: "ModelNow",
    category: "Quality optimized",
    status: "Healthy",
    latency: 690,
    throughput: 138,
    success: 99.3,
    errorRate: 0.7,
    inputTokens: 1120000,
    outputTokens: 650000,
    requests: 156300,
    version: "Internal candidate",
  },
];

const requests = [
  { id: "req_8f21a", model: "GPT-5", task: "Chat completion", latency: 792, tokens: 1240, status: "Success", time: "10:42:18" },
  { id: "req_8f21b", model: "ModelNow Efficient", task: "Text generation", latency: 418, tokens: 860, status: "Success", time: "10:41:56" },
  { id: "req_8f21c", model: "Gemini", task: "Multimodal analysis", latency: 1840, tokens: 2110, status: "Timeout", time: "10:41:32" },
  { id: "req_8f21d", model: "Claude", task: "Reasoning", latency: 923, tokens: 1760, status: "Success", time: "10:40:49" },
  { id: "req_8f21e", model: "Llama", task: "Text generation", latency: 510, tokens: 640, status: "Success", time: "10:40:21" },
  { id: "req_8f21f", model: "ModelNow Quality", task: "Structured output", latency: 676, tokens: 1320, status: "Success", time: "10:39:58" },
  { id: "req_8f21g", model: "Gemini", task: "Chat completion", latency: 1320, tokens: 990, status: "Error", time: "10:39:14" },
];

const trendData = [
  { label: "00:00", latency: 640, throughput: 94 },
  { label: "04:00", latency: 590, throughput: 101 },
  { label: "08:00", latency: 720, throughput: 125 },
  { label: "12:00", latency: 840, throughput: 139 },
  { label: "16:00", latency: 760, throughput: 131 },
  { label: "20:00", latency: 690, throughput: 118 },
];

const colors = {
  bg: "#f7f8fc",
  card: "#fff",
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

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: colors.bg, padding: 28, color: colors.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 15, marginBottom: 23 },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: colors.muted, marginBottom: 8 },
  heading: { fontSize: 28, fontWeight: 800, letterSpacing: -0.7, margin: 0 },
  subtitle: { fontSize: 13, lineHeight: 1.6, color: colors.muted, margin: "8px 0 0" },
  card: { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 205px), 1fr))", gap: 15, marginBottom: 18 },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: 18, marginBottom: 18 },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${colors.border}`, borderRadius: 9, padding: "10px 12px", background: "#fff", color: "#344054", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  select: { border: `1px solid ${colors.border}`, borderRadius: 9, padding: "10px 11px", background: "#fff", color: "#344054", fontSize: 12 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 18 },
  panelTitle: { margin: 0, fontSize: 14, fontWeight: 800 },
  muted: { color: colors.muted, fontSize: 12 },
  pill: { display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  th: { textAlign: "left", padding: "12px 10px", color: "#8590a2", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid #edf0f5" },
  td: { padding: "13px 10px", borderBottom: "1px solid #f0f2f6", fontSize: 12, verticalAlign: "middle" },
  input: { width: "100%", boxSizing: "border-box", border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 11px 10px 32px", fontSize: 12, outline: "none", background: "#fff" },
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
    <section style={styles.card}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>{title}</h2>
          {subtitle && <p style={{ ...styles.muted, margin: "6px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function modelStatus(status: ModelStatus) {
  if (status === "Healthy") return { background: "#e9f8f0", color: colors.green };
  if (status === "Degraded") return { background: "#fff5e5", color: colors.orange };
  return { background: "#fff0f0", color: colors.red };
}

function number(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatTokens(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export default function ModelPerformancePage() {
  const [query, setQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [period, setPeriod] = useState("24 hours");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [selectedModel, setSelectedModel] = useState<ModelMetric | null>(null);
  const [requestQuery, setRequestQuery] = useState("");
  const [requestStatus, setRequestStatus] = useState("All");

  const filteredModels = useMemo(() => {
    const search = query.trim().toLowerCase();

    return models.filter((model) => {
      const matchesSearch = !search || [model.name, model.provider, model.category].some((value) => value.toLowerCase().includes(search));
      const matchesProvider = providerFilter === "All providers" || model.provider === providerFilter;
      const matchesStatus = statusFilter === "All statuses" || model.status === statusFilter;
      return matchesSearch && matchesProvider && matchesStatus;
    });
  }, [query, providerFilter, statusFilter]);

  const filteredRequests = useMemo(() => {
    const search = requestQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch = !search || [request.id, request.model, request.task].some((value) => value.toLowerCase().includes(search));
      const matchesStatus = requestStatus === "All" || request.status === requestStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requestQuery, requestStatus]);

  const averageLatency = Math.round(models.reduce((sum, model) => sum + model.latency, 0) / models.length);
  const averageSuccess = models.reduce((sum, model) => sum + model.success, 0) / models.length;
  const totalRequests = models.reduce((sum, model) => sum + model.requests, 0);
  const healthyCount = models.filter((model) => model.status === "Healthy").length;
  const totalTokens = models.reduce((sum, model) => sum + model.inputTokens + model.outputTokens, 0);

  const metrics = [
    { label: "Total inference requests", value: formatTokens(totalRequests), change: "+16.8%", icon: Activity, color: colors.blue, note: `Illustrative · ${period}` },
    { label: "Average response latency", value: `${averageLatency} ms`, change: "-7.4%", icon: Clock3, color: colors.purple, note: "Across listed models" },
    { label: "Success rate", value: `${averageSuccess.toFixed(2)}%`, change: "+0.6%", icon: Target, color: colors.green, note: "Mean model success rate" },
    { label: "Tokens processed", value: formatTokens(totalTokens), change: "+21.3%", icon: Zap, color: colors.teal, note: "Input and output combined" },
  ];

  function exportModels() {
    const headers = ["Model", "Provider", "Category", "Status", "Latency ms", "Throughput tokens/s", "Success rate", "Error rate", "Requests"];
    const rows = filteredModels.map((model) => [
      model.name,
      model.provider,
      model.category,
      model.status,
      model.latency,
      model.throughput,
      model.success,
      model.errorRate,
      model.requests,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-model-performance.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>ModelNow / Dashboard / AI Analytics</div>
          <h1 style={styles.heading}>Model Performance</h1>
          <p style={styles.subtitle}>
            Compare model reliability, response speed, token throughput, and inference activity.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select aria-label="Performance period" value={period} onChange={(event) => setPeriod(event.target.value)} style={styles.select}>
            {["1 hour", "24 hours", "7 days", "30 days"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button style={styles.button} onClick={() => setLastUpdated("Just now")}><RefreshCw size={14} /> Refresh</button>
          <button style={styles.button} onClick={exportModels}><Download size={14} /> Export CSV</button>
        </div>
      </header>

      <div style={{ ...styles.card, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18, background: "#eef2ff", borderColor: "#dce4ff" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "#dce4ff", color: colors.blue, display: "grid", placeItems: "center" }}>
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 190 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Model observability</div>
          <div style={{ ...styles.muted, marginTop: 4 }}>Environment: Production · Model endpoints shown for demonstration · Updated {lastUpdated}</div>
        </div>
        <span style={{ ...styles.pill, background: "#fff", color: colors.blue }}>DEMO DATA</span>
      </div>

      <div style={styles.grid}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#667085" }}>{metric.label}</span>
                <span style={{ width: 37, height: 37, borderRadius: 10, display: "grid", placeItems: "center", background: `${metric.color}14`, color: metric.color }}>
                  <Icon size={18} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.7, marginTop: 16 }}>{metric.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ ...styles.pill, background: "#e9f8f0", color: colors.green }}>
                  {metric.label === "Average response latency" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {metric.change}
                </span>
                <span style={styles.muted}>{metric.note}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={styles.two}>
        <Panel title="Latency trend" subtitle="Illustrative average response time in milliseconds" action={<span style={{ ...styles.pill, background: "#f0eaff", color: colors.purple }}>Latency</span>}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 190, gap: 12, padding: "12px 3px 0" }}>
            {trendData.map((point) => (
              <div key={point.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: colors.muted }}>{point.latency}</span>
                <div title={`${point.latency} ms`} style={{ width: "min(100%, 34px)", height: `${(point.latency / 1000) * 130}px`, minHeight: 12, borderRadius: "6px 6px 2px 2px", background: `linear-gradient(180deg, ${colors.purple}, #c5b5ff)` }} />
                <span style={{ fontSize: 10, color: colors.muted }}>{point.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 15, color: colors.muted, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: colors.purple }} />
            Average response latency · Lower is better
          </div>
        </Panel>

        <Panel title="Token throughput" subtitle="Illustrative generation throughput by time window" action={<span style={{ ...styles.pill, background: "#e5f8fb", color: colors.teal }}>Tokens / sec</span>}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 190, gap: 12, padding: "12px 3px 0" }}>
            {trendData.map((point) => (
              <div key={point.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: colors.muted }}>{point.throughput}</span>
                <div title={`${point.throughput} tokens/sec`} style={{ width: "min(100%, 34px)", height: `${(point.throughput / 180) * 130}px`, minHeight: 12, borderRadius: "6px 6px 2px 2px", background: `linear-gradient(180deg, ${colors.teal}, #9ce5ed)` }} />
                <span style={{ fontSize: 10, color: colors.muted }}>{point.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 15, color: colors.muted, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: colors.teal }} />
            Average token throughput · Higher can indicate faster generation
          </div>
        </Panel>
      </div>

      <Panel
        title="Model comparison"
        subtitle={`${filteredModels.length} models match the selected filters`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 175 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: colors.muted }} />
              <input aria-label="Search models" placeholder="Search model..." value={query} onChange={(event) => setQuery(event.target.value)} style={styles.input} />
            </div>
            <select aria-label="Filter provider" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} style={styles.select}>
              {["All providers", "OpenAI", "Anthropic", "Google", "Open model", "ModelNow"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter model status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.select}>
              {["All statuses", "Healthy", "Degraded", "Offline"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Model", "Provider", "Status", "Latency", "Throughput", "Success rate", "Error rate", "Requests", ""].map((item) => <th key={item} style={styles.th}>{item}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr key={model.name}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 145 }}>
                      <span style={{ width: 31, height: 31, display: "grid", placeItems: "center", borderRadius: 8, background: "#f1f4ff", color: colors.blue }}>
                        <Layers3 size={16} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 800 }}>{model.name}</div>
                        <div style={{ fontSize: 10, color: colors.muted, marginTop: 3 }}>{model.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{model.provider}</td>
                  <td style={styles.td}><span style={{ ...styles.pill, ...modelStatus(model.status) }}>{model.status}</span></td>
                  <td style={{ ...styles.td, fontWeight: 700, whiteSpace: "nowrap" }}>{model.latency} ms</td>
                  <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{model.throughput} tok/s</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 800 }}>{model.success}%</div>
                    <div style={{ width: 65, height: 4, background: "#edf0f5", borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ width: `${model.success}%`, height: "100%", background: colors.green }} />
                    </div>
                  </td>
                  <td style={{ ...styles.td, color: model.errorRate > 1.5 ? colors.red : colors.muted }}>{model.errorRate}%</td>
                  <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{number(model.requests)}</td>
                  <td style={styles.td}>
                    <button style={{ ...styles.button, padding: 7 }} onClick={() => setSelectedModel(model)} aria-label={`View ${model.name} metrics`}>
                      <ChevronDown size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredModels.length === 0 && <tr><td colSpan={9} style={{ ...styles.td, textAlign: "center", color: colors.muted }}>No models match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={{ height: 18 }} />

      <Panel
        title="Recent inference requests"
        subtitle="Sample request-level performance records"
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 190 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: colors.muted }} />
              <input aria-label="Search inference requests" placeholder="Search request or model..." value={requestQuery} onChange={(event) => setRequestQuery(event.target.value)} style={styles.input} />
            </div>
            <select aria-label="Filter request status" value={requestStatus} onChange={(event) => setRequestStatus(event.target.value)} style={styles.select}>
              {["All", "Success", "Timeout", "Error"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Request ID", "Model", "Task", "Latency", "Tokens", "Status", "Time"].map((item) => <th key={item} style={styles.th}>{item}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const successful = request.status === "Success";
                const timedOut = request.status === "Timeout";
                return (
                  <tr key={request.id}>
                    <td style={{ ...styles.td, fontFamily: "monospace", whiteSpace: "nowrap" }}>{request.id}</td>
                    <td style={{ ...styles.td, fontWeight: 700, whiteSpace: "nowrap" }}>{request.model}</td>
                    <td style={styles.td}>{request.task}</td>
                    <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{request.latency} ms</td>
                    <td style={styles.td}>{number(request.tokens)}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.pill, background: successful ? "#e9f8f0" : timedOut ? "#fff5e5" : "#fff0f0", color: successful ? colors.green : timedOut ? colors.orange : colors.red }}>
                        {successful ? <CheckCircle2 size={11} /> : <Activity size={11} />}
                        {request.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: colors.muted, whiteSpace: "nowrap" }}>{request.time}</td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && <tr><td colSpan={7} style={{ ...styles.td, textAlign: "center", color: colors.muted }}>No requests match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={{ ...styles.card, display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, background: "#fff9eb", borderColor: "#f6e5bb" }}>
        <Gauge size={18} color={colors.orange} />
        <div style={{ fontSize: 12, lineHeight: 1.7, color: "#805d1b" }}>
          <strong>Production integration note:</strong> All metrics, provider labels, request IDs, and trend values on this page are illustrative. Connect real inference logs and provider APIs before using them for operational decisions.
        </div>
      </div>

      <footer style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", color: colors.muted, fontSize: 11, marginTop: 18 }}>
        <span>ModelNow Admin · Model Performance</span>
        <span>Last refreshed: {lastUpdated}</span>
      </footer>

      {selectedModel && (
        <div
          role="presentation"
          onClick={() => setSelectedModel(null)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,.4)", display: "flex", justifyContent: "flex-end" }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedModel.name} performance details`}
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(440px, 100%)", height: "100%", overflowY: "auto", boxSizing: "border-box", background: "#fff", padding: 25, boxShadow: "-10px 0 40px rgba(0,0,0,.12)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={styles.eyebrow}>Model details</div>
                <h2 style={{ margin: 0, fontSize: 23 }}>{selectedModel.name}</h2>
                <p style={{ color: colors.muted, fontSize: 12 }}>{selectedModel.provider} · {selectedModel.category}</p>
              </div>
              <button style={styles.button} onClick={() => setSelectedModel(null)}>Close</button>
            </div>
            <span style={{ ...styles.pill, ...modelStatus(selectedModel.status) }}>{selectedModel.status}</span>
            {[
              ["Latency", `${selectedModel.latency} ms`],
              ["Throughput", `${selectedModel.throughput} tokens/sec`],
              ["Success rate", `${selectedModel.success}%`],
              ["Error rate", `${selectedModel.errorRate}%`],
              ["Input tokens", number(selectedModel.inputTokens)],
              ["Output tokens", number(selectedModel.outputTokens)],
              ["Requests", number(selectedModel.requests)],
              ["Endpoint", selectedModel.version],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "15px 0", borderBottom: `1px solid ${colors.border}`, fontSize: 12 }}>
                <span style={{ color: colors.muted }}>{label}</span>
                <strong style={{ textAlign: "right" }}>{value}</strong>
              </div>
            ))}
            <p style={{ color: colors.muted, fontSize: 11, lineHeight: 1.7, marginTop: 20 }}>
              These details use demo values. Real metrics should be sourced from your model gateway, inference traces, and provider telemetry.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
