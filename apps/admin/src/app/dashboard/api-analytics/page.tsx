
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Filter,
  Gauge,
  Globe,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  X,
  XCircle,
  Zap,
} from "lucide-react";

type ApiStatus = "Healthy" | "Degraded" | "Critical";

type Endpoint = {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  service: string;
  requests: number;
  latency: number;
  p95: number;
  errorRate: number;
  status: ApiStatus;
  successRate: number;
  region: string;
  responseCode: number;
};

const initialEndpoints: Endpoint[] = [
  {
    id: "API-001",
    method: "POST",
    path: "/v1/chat/completions",
    service: "AI Gateway",
    requests: 68420,
    latency: 186,
    p95: 420,
    errorRate: 0.42,
    status: "Healthy",
    successRate: 99.58,
    region: "Asia South",
    responseCode: 200,
  },
  {
    id: "API-002",
    method: "GET",
    path: "/v1/models",
    service: "Model Service",
    requests: 32800,
    latency: 34,
    p95: 78,
    errorRate: 0.08,
    status: "Healthy",
    successRate: 99.92,
    region: "Asia South",
    responseCode: 200,
  },
  {
    id: "API-003",
    method: "POST",
    path: "/v1/embeddings",
    service: "Knowledge Service",
    requests: 18760,
    latency: 112,
    p95: 240,
    errorRate: 0.66,
    status: "Healthy",
    successRate: 99.34,
    region: "Asia South",
    responseCode: 200,
  },
  {
    id: "API-004",
    method: "POST",
    path: "/v1/agents/run",
    service: "Agent Service",
    requests: 12480,
    latency: 640,
    p95: 1280,
    errorRate: 2.84,
    status: "Degraded",
    successRate: 97.16,
    region: "Asia South",
    responseCode: 429,
  },
  {
    id: "API-005",
    method: "GET",
    path: "/v1/organizations",
    service: "Organization Service",
    requests: 9650,
    latency: 56,
    p95: 130,
    errorRate: 0.24,
    status: "Healthy",
    successRate: 99.76,
    region: "Asia South",
    responseCode: 200,
  },
  {
    id: "API-006",
    method: "POST",
    path: "/v1/files/upload",
    service: "File Service",
    requests: 7240,
    latency: 920,
    p95: 2100,
    errorRate: 5.72,
    status: "Critical",
    successRate: 94.28,
    region: "Asia South",
    responseCode: 500,
  },
  {
    id: "API-007",
    method: "GET",
    path: "/v1/usage",
    service: "Usage Service",
    requests: 15900,
    latency: 47,
    p95: 105,
    errorRate: 0.16,
    status: "Healthy",
    successRate: 99.84,
    region: "Asia South",
    responseCode: 200,
  },
  {
    id: "API-008",
    method: "POST",
    path: "/v1/auth/token",
    service: "Auth Service",
    requests: 22100,
    latency: 29,
    p95: 68,
    errorRate: 0.12,
    status: "Healthy",
    successRate: 99.88,
    region: "Asia South",
    responseCode: 201,
  },
  {
    id: "API-009",
    method: "DELETE",
    path: "/v1/projects/:id",
    service: "Project Service",
    requests: 2180,
    latency: 71,
    p95: 165,
    errorRate: 0.38,
    status: "Healthy",
    successRate: 99.62,
    region: "Asia South",
    responseCode: 204,
  },
  {
    id: "API-010",
    method: "GET",
    path: "/v1/analytics/overview",
    service: "Analytics Service",
    requests: 8640,
    latency: 148,
    p95: 350,
    errorRate: 1.14,
    status: "Degraded",
    successRate: 98.86,
    region: "Asia South",
    responseCode: 503,
  },
];

const traffic = [
  { time: "09:00", requests: 42, errors: 2 },
  { time: "09:30", requests: 55, errors: 3 },
  { time: "10:00", requests: 49, errors: 2 },
  { time: "10:30", requests: 67, errors: 4 },
  { time: "11:00", requests: 61, errors: 3 },
  { time: "11:30", requests: 78, errors: 6 },
  { time: "12:00", requests: 72, errors: 5 },
  { time: "12:30", requests: 91, errors: 8 },
  { time: "13:00", requests: 84, errors: 6 },
  { time: "13:30", requests: 96, errors: 7 },
];

const responseCodes = [
  { code: "2xx Success", count: 184200, percent: 96.8, color: "#159669" },
  { code: "3xx Redirect", count: 1200, percent: 0.6, color: "#5684dc" },
  { code: "4xx Client error", count: 3400, percent: 1.8, color: "#d99727" },
  { code: "5xx Server error", count: 1500, percent: 0.8, color: "#d84b4b" },
];

const formatNumber = new Intl.NumberFormat("en-US");

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fa",
    color: "#172033",
    padding: 28,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: { maxWidth: 1500, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 22,
  },
  eyebrow: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heading: { fontSize: 28, fontWeight: 750, margin: 0, letterSpacing: -0.8 },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 8, lineHeight: 1.6 },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 13px",
    border: "1px solid #dce2ea",
    borderRadius: 9,
    background: "#fff",
    color: "#263449",
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  },
  primary: { background: "#315fe9", borderColor: "#315fe9", color: "#fff" },
  demo: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    background: "#fff8e8",
    border: "1px solid #f5d99b",
    color: "#855b0c",
    borderRadius: 9,
    padding: "11px 13px",
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    padding: 19,
    minWidth: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: { color: "#748196", fontSize: 12, fontWeight: 600 },
  value: { fontSize: 27, fontWeight: 750, letterSpacing: -0.7, marginTop: 13 },
  foot: { fontSize: 11, color: "#7b8798", marginTop: 9 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f0f4ff",
    color: "#315fe9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: 750, margin: 0 },
  sectionSub: { color: "#7b8798", fontSize: 12, marginTop: 6 },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.25fr) minmax(300px, .75fr)",
    gap: 16,
    marginBottom: 18,
  },
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 13,
    height: 170,
    paddingTop: 18,
    borderBottom: "1px solid #e8edf3",
    marginTop: 14,
  },
  chartCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 5,
    height: "100%",
    minWidth: 0,
  },
  chartLabel: { fontSize: 10, color: "#8590a1", whiteSpace: "nowrap" },
  toolbar: {
    display: "flex",
    gap: 9,
    flexWrap: "wrap",
    marginTop: 18,
    marginBottom: 14,
  },
  input: {
    minWidth: 200,
    flex: 1,
    border: "1px solid #dce2ea",
    background: "#fff",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    outline: "none",
    color: "#263449",
  },
  select: {
    border: "1px solid #dce2ea",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#fff",
    color: "#263449",
    fontSize: 12,
  },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    color: "#7b8798",
    background: "#fafbfc",
    borderBottom: "1px solid #edf0f4",
    fontWeight: 650,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #edf0f4",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 8px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 750,
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
    width: "min(440px, 100%)",
    height: "100%",
    background: "#fff",
    padding: 24,
    overflowY: "auto",
    boxShadow: "-12px 0 40px rgba(15,23,42,.12)",
  },
};

function EndpointStatus({ status }: { status: ApiStatus }) {
  const config = {
    Healthy: { bg: "#e9f8ef", color: "#167647", Icon: CheckCircle2 },
    Degraded: { bg: "#fff4dd", color: "#a56609", Icon: AlertTriangle },
    Critical: { bg: "#ffebeb", color: "#c52c2c", Icon: XCircle },
  }[status];

  const Icon = config.Icon;

  return (
    <span style={{ ...styles.badge, background: config.bg, color: config.color }}>
      <Icon size={12} /> {status}
    </span>
  );
}

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  const colors: Record<Endpoint["method"], { bg: string; color: string }> = {
    GET: { bg: "#e7f5ed", color: "#167647" },
    POST: { bg: "#eaf0ff", color: "#315fe9" },
    PUT: { bg: "#fff4dd", color: "#a56609" },
    PATCH: { bg: "#f2eaff", color: "#7b3fc5" },
    DELETE: { bg: "#ffebeb", color: "#c52c2c" },
  };

  return (
    <span
      style={{
        ...styles.badge,
        background: colors[method].bg,
        color: colors[method].color,
        minWidth: 48,
        justifyContent: "center",
      }}
    >
      {method}
    </span>
  );
}

export default function ApiAnalyticsPage() {
  const [endpoints, setEndpoints] = useState(initialEndpoints);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [period, setPeriod] = useState("24 hours");
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [refreshing, setRefreshing] = useState(false);

  const filteredEndpoints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return endpoints.filter((endpoint) => {
      const matchesSearch =
        !query ||
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.service.toLowerCase().includes(query) ||
        endpoint.id.toLowerCase().includes(query);

      const matchesMethod =
        methodFilter === "All" || endpoint.method === methodFilter;

      const matchesStatus =
        statusFilter === "All" || endpoint.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [endpoints, search, methodFilter, statusFilter]);

  const totals = useMemo(() => {
    const requests = endpoints.reduce((sum, endpoint) => sum + endpoint.requests, 0);
    const weightedErrors = endpoints.reduce(
      (sum, endpoint) => sum + endpoint.requests * endpoint.errorRate / 100,
      0
    );
    const weightedLatency = endpoints.reduce(
      (sum, endpoint) => sum + endpoint.requests * endpoint.latency,
      0
    );

    return {
      requests,
      errors: Math.round(weightedErrors),
      errorRate: requests ? (weightedErrors / requests) * 100 : 0,
      latency: requests ? Math.round(weightedLatency / requests) : 0,
      endpoints: endpoints.length,
      degraded: endpoints.filter((endpoint) => endpoint.status !== "Healthy").length,
    };
  }, [endpoints]);

  const refresh = () => {
    setRefreshing(true);
    setLastRefresh(
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    window.setTimeout(() => setRefreshing(false), 450);
  };

  const exportCsv = () => {
    const headers = [
      "Endpoint ID",
      "Method",
      "Path",
      "Service",
      "Requests",
      "Average latency ms",
      "P95 latency ms",
      "Error rate %",
      "Success rate %",
      "Status",
      "Response code",
    ];

    const rows = filteredEndpoints.map((endpoint) => [
      endpoint.id,
      endpoint.method,
      endpoint.path,
      endpoint.service,
      endpoint.requests,
      endpoint.latency,
      endpoint.p95,
      endpoint.errorRate,
      endpoint.successRate,
      endpoint.status,
      endpoint.responseCode,
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
    link.download = "modelnow-api-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const changeEndpointStatus = (id: string, status: ApiStatus) => {
    setEndpoints((current) =>
      current.map((endpoint) =>
        endpoint.id === id ? { ...endpoint, status } : endpoint
      )
    );
    setSelectedEndpoint((current) =>
      current?.id === id ? { ...current, status } : current
    );
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Admin / Dashboard</div>
            <h1 style={styles.heading}>API Analytics</h1>
            <p style={styles.subtitle}>
              Understand API traffic, endpoint latency, response codes, and reliability across ModelNow services.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <select
              aria-label="Analytics time period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={styles.select}
            >
              <option value="1 hour">Last hour</option>
              <option value="24 hours">Last 24 hours</option>
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
            </select>

            <button style={styles.button} onClick={exportCsv}>
              <Download size={15} /> Export CSV
            </button>

            <button
              style={{ ...styles.button, ...styles.primary, opacity: refreshing ? 0.7 : 1 }}
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw size={15} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div style={styles.demo}>
          <AlertTriangle size={16} />
          <span>
            <strong>Demo data only.</strong> The selected period changes the UI selection but does not query real traffic. Connect API gateway logs and telemetry before relying on these metrics.
          </span>
        </div>

        <section style={styles.grid}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Total API requests</span>
              <span style={styles.iconBox}><Activity size={18} /></span>
            </div>
            <div style={styles.value}>{formatNumber.format(totals.requests)}</div>
            <div style={{ ...styles.foot, color: "#16804b" }}>
              <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} /> Sample traffic · {period}
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Average latency</span>
              <span style={styles.iconBox}><Clock3 size={18} /></span>
            </div>
            <div style={styles.value}>{totals.latency} ms</div>
            <div style={styles.foot}>Weighted by endpoint request volume</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Error rate</span>
              <span style={{ ...styles.iconBox, background: "#fff4dd", color: "#a56609" }}>
                <AlertTriangle size={18} />
              </span>
            </div>
            <div style={styles.value}>{totals.errorRate.toFixed(2)}%</div>
            <div style={styles.foot}>
              <ArrowDownRight size={12} style={{ verticalAlign: "middle" }} /> Estimated failed requests
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Monitored endpoints</span>
              <span style={styles.iconBox}><Globe size={18} /></span>
            </div>
            <div style={styles.value}>{totals.endpoints}</div>
            <div style={styles.foot}>{totals.degraded} endpoints flagged for attention</div>
          </article>
        </section>

        <section style={styles.twoCol}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <div>
                <h2 style={styles.sectionTitle}>API traffic trend</h2>
                <p style={styles.sectionSub}>Illustrative request volume and error trend</p>
              </div>
              <span style={{ fontSize: 11, color: "#748196" }}>{period}</span>
            </div>

            <div style={{ display: "flex", gap: 14, fontSize: 11, marginTop: 18 }}>
              <span style={{ color: "#315fe9" }}>● Requests (scaled)</span>
              <span style={{ color: "#d84b4b" }}>● Errors (scaled)</span>
            </div>

            <div style={styles.chart}>
              {traffic.map((point) => (
                <div key={point.time} style={styles.chartCol}>
                  <div
                    title={`${point.requests * 1000} requests`}
                    style={{
                      width: "100%",
                      maxWidth: 26,
                      height: `${point.requests * 1.25}px`,
                      maxHeight: "100%",
                      minHeight: 4,
                      background: "#315fe9",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
                  <div
                    title={`${point.errors}% illustrative error trend`}
                    style={{
                      width: "100%",
                      maxWidth: 26,
                      height: `${point.errors * 4}px`,
                      maxHeight: "100%",
                      minHeight: 3,
                      background: "#d84b4b",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
                  <span style={styles.chartLabel}>{point.time}</span>
                </div>
              ))}
            </div>

            <div style={{ ...styles.row, marginTop: 15 }}>
              <div>
                <div style={styles.label}>Latest traffic sample</div>
                <strong style={{ fontSize: 17 }}>96K</strong>
                <span style={{ color: "#748196", fontSize: 11 }}> scaled requests</span>
              </div>
              <div>
                <div style={styles.label}>Latest error trend</div>
                <strong style={{ fontSize: 17 }}>7%</strong>
                <span style={{ color: "#748196", fontSize: 11 }}> illustrative</span>
              </div>
            </div>
          </article>

          <article style={styles.panel}>
            <div>
              <h2 style={styles.sectionTitle}>HTTP response codes</h2>
              <p style={styles.sectionSub}>Sample response distribution</p>
            </div>

            <div style={{ marginTop: 24 }}>
              {responseCodes.map((item) => (
                <div key={item.code} style={{ marginBottom: 21 }}>
                  <div style={styles.row}>
                    <span style={{ fontSize: 12, fontWeight: 650 }}>{item.code}</span>
                    <strong style={{ fontSize: 12 }}>{formatNumber.format(item.count)}</strong>
                  </div>
                  <div style={{
                    width: "100%",
                    height: 7,
                    background: "#edf0f5",
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 9,
                  }}>
                    <div style={{
                      width: `${item.percent}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: 20,
                      minWidth: item.percent > 0 ? 3 : 0,
                    }} />
                  </div>
                  <div style={{ ...styles.foot, marginTop: 5 }}>{item.percent}% of sample responses</div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={styles.grid}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Successful requests</span>
              <CheckCircle2 size={18} color="#16804b" />
            </div>
            <div style={styles.value}>96.8%</div>
            <div style={styles.foot}>Illustrative 2xx response share</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>P95 latency target</span>
              <Gauge size={18} color="#315fe9" />
            </div>
            <div style={styles.value}>500 ms</div>
            <div style={styles.foot}>Example target; configure your own SLO</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Critical endpoints</span>
              <XCircle size={18} color="#c52c2c" />
            </div>
            <div style={styles.value}>
              {endpoints.filter((endpoint) => endpoint.status === "Critical").length}
            </div>
            <div style={styles.foot}>Sample endpoints marked critical</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Gateway availability</span>
              <ShieldCheck size={18} color="#16804b" />
            </div>
            <div style={styles.value}>99.95%</div>
            <div style={styles.foot}>Illustrative availability value</div>
          </article>
        </section>

        <section style={styles.panel}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Endpoint performance</h2>
              <p style={styles.sectionSub}>
                {filteredEndpoints.length} endpoints · Search, filter, and inspect individual APIs
              </p>
            </div>
            <span style={{ fontSize: 11, color: "#748196" }}>
              <Server size={13} style={{ verticalAlign: "middle" }} /> Asia South · Demo
            </span>
          </div>

          <div style={styles.toolbar}>
            <div style={{ ...styles.row, ...styles.input, flex: "1 1 230px" }}>
              <Search size={15} color="#8490a2" />
              <input
                aria-label="Search API endpoints"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search endpoint, service, or ID..."
                style={{
                  border: 0,
                  outline: 0,
                  width: "100%",
                  fontSize: 12,
                  background: "transparent",
                  color: "#263449",
                }}
              />
            </div>

            <select
              aria-label="Filter by HTTP method"
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              aria-label="Filter by endpoint status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Degraded">Degraded</option>
              <option value="Critical">Critical</option>
            </select>

            <button
              style={styles.button}
              onClick={() => {
                setSearch("");
                setMethodFilter("All");
                setStatusFilter("All");
              }}
            >
              <Filter size={14} /> Clear filters
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Endpoint",
                    "Service",
                    "Requests",
                    "Avg latency",
                    "P95 latency",
                    "Error rate",
                    "Status",
                    "",
                  ].map((heading, index) => (
                    <th key={`${heading}-${index}`} style={styles.th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEndpoints.map((endpoint) => (
                  <tr key={endpoint.id}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MethodBadge method={endpoint.method} />
                        <div>
                          <strong>{endpoint.path}</strong>
                          <div style={{ color: "#8490a2", fontSize: 10, marginTop: 5 }}>{endpoint.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{endpoint.service}</td>
                    <td style={styles.td}>{formatNumber.format(endpoint.requests)}</td>
                    <td style={styles.td}>{endpoint.latency} ms</td>
                    <td style={styles.td}>{endpoint.p95} ms</td>
                    <td style={{
                      ...styles.td,
                      color: endpoint.errorRate >= 2 ? "#c52c2c" : "#526174",
                    }}>
                      {endpoint.errorRate.toFixed(2)}%
                    </td>
                    <td style={styles.td}><EndpointStatus status={endpoint.status} /></td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.button, padding: "7px 9px" }}
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        Details <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEndpoints.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: 30, color: "#748196" }}>
                      No endpoints match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer style={{ textAlign: "center", color: "#8b95a5", fontSize: 11, marginTop: 20 }}>
          ModelNow Admin · API Analytics · Demo environment
        </footer>
      </div>

      {selectedEndpoint && (
        <div style={styles.overlay} onClick={() => setSelectedEndpoint(null)}>
          <aside style={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <div style={{ ...styles.row, marginBottom: 22 }}>
              <div>
                <div style={styles.eyebrow}>Endpoint details</div>
                <h2 style={{ margin: 0, fontSize: 22, overflowWrap: "anywhere" }}>
                  {selectedEndpoint.path}
                </h2>
                <p style={styles.sectionSub}>{selectedEndpoint.id} · {selectedEndpoint.service}</p>
              </div>
              <button
                aria-label="Close endpoint details"
                style={styles.button}
                onClick={() => setSelectedEndpoint(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
              <MethodBadge method={selectedEndpoint.method} />
              <EndpointStatus status={selectedEndpoint.status} />
            </div>

            <div style={{ ...styles.grid, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              {[
                { label: "Requests", value: formatNumber.format(selectedEndpoint.requests) },
                { label: "Avg latency", value: `${selectedEndpoint.latency} ms` },
                { label: "P95 latency", value: `${selectedEndpoint.p95} ms` },
                { label: "Error rate", value: `${selectedEndpoint.errorRate.toFixed(2)}%` },
                { label: "Success rate", value: `${selectedEndpoint.successRate.toFixed(2)}%` },
                { label: "Response code", value: String(selectedEndpoint.responseCode) },
              ].map((item) => (
                <div key={item.label} style={styles.panel}>
                  <div style={styles.label}>{item.label}</div>
                  <div style={{ ...styles.value, fontSize: 21 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ ...styles.panel, marginBottom: 16 }}>
              <h3 style={styles.sectionTitle}>Endpoint metadata</h3>
              <div style={{ ...styles.row, marginTop: 17 }}>
                <span style={styles.label}>Service</span>
                <strong style={{ fontSize: 12 }}>{selectedEndpoint.service}</strong>
              </div>
              <div style={{ ...styles.row, marginTop: 17 }}>
                <span style={styles.label}>Region</span>
                <strong style={{ fontSize: 12 }}>{selectedEndpoint.region}</strong>
              </div>
              <div style={{ ...styles.row, marginTop: 17 }}>
                <span style={styles.label}>Endpoint ID</span>
                <strong style={{ fontSize: 12 }}>{selectedEndpoint.id}</strong>
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Demo status controls</h3>
              <p style={{ ...styles.sectionSub, lineHeight: 1.6 }}>
                Changing status affects this local page only. It does not change the real API or backend service.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 15 }}>
                {(["Healthy", "Degraded", "Critical"] as ApiStatus[]).map((status) => (
                  <button
                    key={status}
                    style={{
                      ...styles.button,
                      borderColor: selectedEndpoint.status === status ? "#315fe9" : "#dce2ea",
                      background: selectedEndpoint.status === status ? "#eff4ff" : "#fff",
                    }}
                    onClick={() => changeEndpointStatus(selectedEndpoint.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
