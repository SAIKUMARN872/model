
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Download,
  Gauge,
  HardDrive,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Wifi,
  X,
  XCircle,
  Zap,
} from "lucide-react";

type ServiceStatus = "Healthy" | "Degraded" | "Down";

type Service = {
  id: string;
  name: string;
  category: string;
  status: ServiceStatus;
  uptime: number;
  latency: number;
  requests: number;
  errorRate: number;
  region: string;
  lastChecked: string;
};

const initialServices: Service[] = [
  {
    id: "SVC-001",
    name: "API Gateway",
    category: "API",
    status: "Healthy",
    uptime: 99.99,
    latency: 42,
    requests: 128400,
    errorRate: 0.12,
    region: "Asia South",
    lastChecked: "Just now",
  },
  {
    id: "SVC-002",
    name: "AI Inference",
    category: "AI",
    status: "Healthy",
    uptime: 99.95,
    latency: 186,
    requests: 84500,
    errorRate: 0.38,
    region: "Asia South",
    lastChecked: "Just now",
  },
  {
    id: "SVC-003",
    name: "Primary Database",
    category: "Database",
    status: "Healthy",
    uptime: 99.99,
    latency: 18,
    requests: 219000,
    errorRate: 0.02,
    region: "Asia South",
    lastChecked: "Just now",
  },
  {
    id: "SVC-004",
    name: "Background Workers",
    category: "Worker",
    status: "Degraded",
    uptime: 98.74,
    latency: 425,
    requests: 38400,
    errorRate: 2.46,
    region: "Asia South",
    lastChecked: "1 min ago",
  },
  {
    id: "SVC-005",
    name: "Redis Cache",
    category: "Cache",
    status: "Healthy",
    uptime: 99.98,
    latency: 5,
    requests: 324000,
    errorRate: 0.01,
    region: "Asia South",
    lastChecked: "Just now",
  },
  {
    id: "SVC-006",
    name: "Job Queue",
    category: "Queue",
    status: "Degraded",
    uptime: 97.85,
    latency: 310,
    requests: 19200,
    errorRate: 1.82,
    region: "Asia South",
    lastChecked: "2 min ago",
  },
  {
    id: "SVC-007",
    name: "Authentication",
    category: "Security",
    status: "Healthy",
    uptime: 99.99,
    latency: 36,
    requests: 96200,
    errorRate: 0.04,
    region: "Asia South",
    lastChecked: "Just now",
  },
  {
    id: "SVC-008",
    name: "File Storage",
    category: "Storage",
    status: "Down",
    uptime: 96.42,
    latency: 0,
    requests: 8100,
    errorRate: 100,
    region: "Asia South",
    lastChecked: "4 min ago",
  },
];

const incidents = [
  {
    id: "INC-1048",
    title: "File Storage health check failed",
    service: "File Storage",
    severity: "Critical",
    time: "13:01",
    state: "Investigating",
  },
  {
    id: "INC-1047",
    title: "Background worker response time elevated",
    service: "Background Workers",
    severity: "Warning",
    time: "12:42",
    state: "Monitoring",
  },
  {
    id: "INC-1046",
    title: "Job queue processing delay",
    service: "Job Queue",
    severity: "Warning",
    time: "11:58",
    state: "Identified",
  },
];

const uptimeHistory = [
  100, 100, 99, 100, 100, 100, 99, 100, 100, 100, 98, 100,
  100, 100, 99, 100, 100, 100, 100, 97, 100, 100, 100, 100,
  100, 100, 99, 100, 100, 100, 100, 100, 98, 100, 100, 100,
];

const resourceHistory = [
  { time: "09:00", cpu: 34, memory: 52 },
  { time: "09:30", cpu: 42, memory: 55 },
  { time: "10:00", cpu: 38, memory: 57 },
  { time: "10:30", cpu: 55, memory: 59 },
  { time: "11:00", cpu: 49, memory: 62 },
  { time: "11:30", cpu: 64, memory: 65 },
  { time: "12:00", cpu: 58, memory: 68 },
  { time: "12:30", cpu: 72, memory: 71 },
  { time: "13:00", cpu: 61, memory: 69 },
];

const numberFormat = new Intl.NumberFormat("en-US");

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fa",
    color: "#172033",
    padding: "28px",
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
  primaryButton: {
    background: "#315fe9",
    border: "1px solid #315fe9",
    color: "#fff",
  },
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
  },
  panel: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    padding: 19,
    minWidth: 0,
  },
  sectionTitle: { fontSize: 15, fontWeight: 750, margin: 0 },
  sectionSubtitle: { color: "#7b8798", fontSize: 12, marginTop: 6 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  metricLabel: { color: "#748196", fontSize: 12, fontWeight: 600 },
  metricValue: {
    fontSize: 27,
    fontWeight: 750,
    letterSpacing: -0.7,
    marginTop: 13,
  },
  metricFoot: { fontSize: 11, color: "#7b8798", marginTop: 9 },
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
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.25fr) minmax(300px, 0.75fr)",
    gap: 16,
    marginBottom: 18,
  },
  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
    marginTop: 22,
  },
  progressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 20,
    background: "#edf0f5",
    overflow: "hidden",
    marginTop: 10,
  },
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
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    height: 155,
    paddingTop: 18,
    borderBottom: "1px solid #e8edf3",
  },
  chartColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    height: "100%",
    gap: 6,
    minWidth: 0,
  },
  chartLabel: { fontSize: 10, color: "#8590a1", whiteSpace: "nowrap" },
  incident: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid #edf0f4",
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

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = {
    Healthy: { bg: "#e9f8ef", color: "#167647", icon: CheckCircle2 },
    Degraded: { bg: "#fff4dd", color: "#a56609", icon: AlertTriangle },
    Down: { bg: "#ffebeb", color: "#c52c2c", icon: XCircle },
  }[status];

  const Icon = config.icon;

  return (
    <span style={{ ...styles.badge, background: config.bg, color: config.color }}>
      <Icon size={12} />
      {status}
    </span>
  );
}

function ProgressBar({
  value,
  color = "#315fe9",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color,
          borderRadius: 20,
          transition: "width .2s ease",
        }}
      />
    </div>
  );
}

export default function SystemHealthPage() {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [incidentOpen, setIncidentOpen] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [refreshing, setRefreshing] = useState(false);

  const counts = useMemo(
    () => ({
      healthy: services.filter((service) => service.status === "Healthy").length,
      degraded: services.filter((service) => service.status === "Degraded").length,
      down: services.filter((service) => service.status === "Down").length,
    }),
    [services]
  );

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || service.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || service.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [services, search, statusFilter, categoryFilter]);

  const refresh = () => {
    setRefreshing(true);

    // Demo refresh: updates the UI timestamp without pretending to call a backend.
    setLastRefresh(new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }));

    window.setTimeout(() => setRefreshing(false), 450);
  };

  const exportCsv = () => {
    const headers = [
      "Service ID",
      "Service",
      "Category",
      "Status",
      "Uptime %",
      "Latency ms",
      "Requests",
      "Error Rate %",
      "Region",
    ];

    const rows = filteredServices.map((service) => [
      service.id,
      service.name,
      service.category,
      service.status,
      service.uptime,
      service.latency,
      service.requests,
      service.errorRate,
      service.region,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-system-health.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const setServiceStatus = (serviceId: string, status: ServiceStatus) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId ? { ...service, status } : service
      )
    );

    setSelectedService((current) =>
      current?.id === serviceId ? { ...current, status } : current
    );
  };

  const resourceCards = [
    { name: "CPU utilization", value: 61, detail: "8 vCPU allocated", icon: Cpu, color: "#315fe9" },
    { name: "Memory usage", value: 69, detail: "11.0 / 16 GB", icon: Server, color: "#7c4dce" },
    { name: "Storage usage", value: 74, detail: "740 / 1,000 GB", icon: HardDrive, color: "#d28a20" },
    { name: "Network utilization", value: 38, detail: "380 Mbps / 1 Gbps", icon: Wifi, color: "#16866b" },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Admin / Dashboard</div>
            <h1 style={styles.heading}>System Health</h1>
            <p style={styles.subtitle}>
              Monitor service availability, infrastructure resources, incidents, and platform reliability.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button style={styles.button} onClick={exportCsv}>
              <Download size={15} /> Export CSV
            </button>
            <button
              style={{ ...styles.button, ...styles.primaryButton, opacity: refreshing ? 0.7 : 1 }}
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div style={styles.demo}>
          <AlertTriangle size={16} />
          <span>
            <strong>Demo monitoring data.</strong> Refresh updates the timestamp only. Connect real health-check, metrics, and incident APIs before using this page operationally.
          </span>
        </div>

        <section style={styles.grid}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.metricLabel}>Overall platform status</span>
              <span style={{ ...styles.iconBox, background: "#fff4dd", color: "#a56609" }}>
                <Activity size={18} />
              </span>
            </div>
            <div style={{ ...styles.metricValue, fontSize: 24, color: "#a56609" }}>
              {counts.down > 0 ? "Attention needed" : counts.degraded > 0 ? "Degraded" : "Operational"}
            </div>
            <div style={styles.metricFoot}>
              {counts.down} down · {counts.degraded} degraded · {counts.healthy} healthy
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.metricLabel}>Platform uptime</span>
              <span style={styles.iconBox}><ShieldCheck size={18} /></span>
            </div>
            <div style={styles.metricValue}>99.92%</div>
            <div style={{ ...styles.metricFoot, color: "#16804b" }}>
              <CheckCircle2 size={12} style={{ verticalAlign: "middle" }} /> Illustrative rolling 30-day value
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.metricLabel}>Average API latency</span>
              <span style={styles.iconBox}><Gauge size={18} /></span>
            </div>
            <div style={styles.metricValue}>42 ms</div>
            <div style={styles.metricFoot}>API gateway sample latency</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.metricLabel}>Active incidents</span>
              <span style={{ ...styles.iconBox, background: "#ffeded", color: "#c52c2c" }}>
                <AlertTriangle size={18} />
              </span>
            </div>
            <div style={styles.metricValue}>{incidents.length}</div>
            <div style={styles.metricFoot}>Sample incident records</div>
          </article>
        </section>

        <section style={styles.twoColumn}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <div>
                <h2 style={styles.sectionTitle}>Infrastructure utilization</h2>
                <p style={styles.sectionSubtitle}>Current illustrative resource consumption</p>
              </div>
              <Zap size={19} color="#315fe9" />
            </div>

            <div style={styles.resourceGrid}>
              {resourceCards.map((resource) => {
                const Icon = resource.icon;

                return (
                  <div key={resource.name}>
                    <div style={styles.row}>
                      <span style={{ ...styles.iconBox, width: 31, height: 31 }}>
                        <Icon size={16} />
                      </span>
                      <strong style={{ fontSize: 19 }}>{resource.value}%</strong>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 12 }}>
                      {resource.name}
                    </div>
                    <ProgressBar
                      value={resource.value}
                      color={resource.value >= 80 ? "#d28a20" : resource.color}
                    />
                    <div style={styles.metricFoot}>{resource.detail}</div>
                  </div>
                );
              })}
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <div>
                <h2 style={styles.sectionTitle}>Uptime history</h2>
                <p style={styles.sectionSubtitle}>Recent health-check samples</p>
              </div>
              <span style={{ fontSize: 11, color: "#64748b" }}>36 samples</span>
            </div>

            <div style={{ display: "flex", gap: 3, marginTop: 26 }}>
              {uptimeHistory.map((value, index) => (
                <div
                  key={`${index}-${value}`}
                  title={`Sample ${index + 1}: ${value}%`}
                  style={{
                    flex: 1,
                    height: 42,
                    borderRadius: 3,
                    background: value >= 99 ? "#22a06b" : value >= 98 ? "#e8a23b" : "#df4c4c",
                  }}
                />
              ))}
            </div>

            <div style={{ ...styles.row, marginTop: 14 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Older samples</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>Latest samples</span>
            </div>

            <div style={{ ...styles.row, marginTop: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: "#748196" }}>Healthy samples</div>
                <strong style={{ fontSize: 21 }}>30 / 36</strong>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#748196" }}>Last refresh</div>
                <strong style={{ fontSize: 13 }}>{lastRefresh}</strong>
              </div>
            </div>
          </article>
        </section>

        <section style={{ ...styles.panel, marginBottom: 18 }}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Resource trend</h2>
              <p style={styles.sectionSubtitle}>Illustrative CPU and memory utilization over time</p>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
              <span style={{ color: "#315fe9" }}>● CPU</span>
              <span style={{ color: "#7c4dce" }}>● Memory</span>
            </div>
          </div>

          <div style={styles.chart}>
            {resourceHistory.map((point) => (
              <div key={point.time} style={styles.chartColumn}>
                <div
                  title={`CPU ${point.cpu}% · Memory ${point.memory}%`}
                  style={{
                    width: "100%",
                    maxWidth: 28,
                    height: `${point.cpu * 1.15}px`,
                    maxHeight: "100%",
                    minHeight: 4,
                    background: "#315fe9",
                    borderRadius: "5px 5px 0 0",
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    maxWidth: 28,
                    height: `${point.memory * 1.15}px`,
                    maxHeight: "100%",
                    minHeight: 4,
                    background: "#7c4dce",
                    borderRadius: "5px 5px 0 0",
                  }}
                />
                <span style={styles.chartLabel}>{point.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Service health</h2>
              <p style={styles.sectionSubtitle}>
                {filteredServices.length} services shown · Select a service for details
              </p>
            </div>
            <span style={{ fontSize: 11, color: "#748196" }}>
              Last refresh: {lastRefresh}
            </span>
          </div>

          <div style={styles.toolbar}>
            <div style={{ ...styles.row, ...styles.input, flex: "1 1 220px" }}>
              <Search size={15} color="#8490a2" />
              <input
                aria-label="Search services"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services, IDs, categories..."
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
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Degraded">Degraded</option>
              <option value="Down">Down</option>
            </select>

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All categories</option>
              {[...new Set(services.map((service) => service.category))].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Service", "Category", "Status", "Uptime", "Latency", "Requests", "Error rate", ""].map((heading, index) => (
                    <th key={`${heading}-${index}`} style={styles.th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td style={styles.td}>
                      <button
                        onClick={() => setSelectedService(service)}
                        style={{
                          border: 0,
                          background: "transparent",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "left",
                          color: "#263449",
                        }}
                      >
                        <strong>{service.name}</strong>
                        <div style={{ color: "#8490a2", fontSize: 10, marginTop: 5 }}>{service.id}</div>
                      </button>
                    </td>
                    <td style={styles.td}>{service.category}</td>
                    <td style={styles.td}><StatusBadge status={service.status} /></td>
                    <td style={styles.td}>{service.uptime.toFixed(2)}%</td>
                    <td style={styles.td}>{service.latency ? `${service.latency} ms` : "—"}</td>
                    <td style={styles.td}>{numberFormat.format(service.requests)}</td>
                    <td style={{ ...styles.td, color: service.errorRate >= 2 ? "#c52c2c" : "#526174" }}>
                      {service.errorRate.toFixed(2)}%
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => setSelectedService(service)}
                        style={{ ...styles.button, padding: "7px 9px" }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: 30, color: "#748196" }}>
                      No services match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ ...styles.panel, marginTop: 18 }}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Recent incidents</h2>
              <p style={styles.sectionSubtitle}>Sample operational alerts and incident records</p>
            </div>
            <button
              style={styles.button}
              onClick={() => setIncidentOpen((open) => !open)}
            >
              {incidentOpen ? "Hide incidents" : "Show incidents"}
            </button>
          </div>

          {incidentOpen && incidents.map((incident) => (
            <div key={incident.id} style={styles.incident}>
              <div style={{
                ...styles.iconBox,
                flexShrink: 0,
                background: incident.severity === "Critical" ? "#ffeded" : "#fff4dd",
                color: incident.severity === "Critical" ? "#c52c2c" : "#a56609",
              }}>
                <AlertTriangle size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{incident.title}</div>
                <div style={{ color: "#7b8798", fontSize: 11, marginTop: 6 }}>
                  {incident.id} · {incident.service} · {incident.time}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{
                  ...styles.badge,
                  background: incident.severity === "Critical" ? "#ffeded" : "#fff4dd",
                  color: incident.severity === "Critical" ? "#c52c2c" : "#a56609",
                }}>
                  {incident.severity}
                </span>
                <div style={{ fontSize: 10, color: "#748196", marginTop: 7 }}>{incident.state}</div>
              </div>
            </div>
          ))}
        </section>

        <footer style={{ textAlign: "center", color: "#8b95a5", fontSize: 11, marginTop: 20 }}>
          ModelNow Admin · System Health · Demo environment
        </footer>
      </div>

      {selectedService && (
        <div style={styles.overlay} onClick={() => setSelectedService(null)}>
          <aside style={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <div style={{ ...styles.row, marginBottom: 25 }}>
              <div>
                <div style={styles.eyebrow}>Service details</div>
                <h2 style={{ margin: 0, fontSize: 23 }}>{selectedService.name}</h2>
                <p style={styles.sectionSubtitle}>{selectedService.id}</p>
              </div>
              <button
                aria-label="Close service details"
                style={styles.button}
                onClick={() => setSelectedService(null)}
              >
                <X size={16} />
              </button>
            </div>

            <StatusBadge status={selectedService.status} />

            <div style={{ ...styles.grid, gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: 24 }}>
              <div style={styles.panel}>
                <div style={styles.metricLabel}>Uptime</div>
                <div style={{ ...styles.metricValue, fontSize: 22 }}>{selectedService.uptime}%</div>
              </div>
              <div style={styles.panel}>
                <div style={styles.metricLabel}>Latency</div>
                <div style={{ ...styles.metricValue, fontSize: 22 }}>
                  {selectedService.latency ? `${selectedService.latency} ms` : "Unavailable"}
                </div>
              </div>
              <div style={styles.panel}>
                <div style={styles.metricLabel}>Requests</div>
                <div style={{ ...styles.metricValue, fontSize: 22 }}>
                  {numberFormat.format(selectedService.requests)}
                </div>
              </div>
              <div style={styles.panel}>
                <div style={styles.metricLabel}>Error rate</div>
                <div style={{ ...styles.metricValue, fontSize: 22 }}>{selectedService.errorRate}%</div>
              </div>
            </div>

            <div style={{ ...styles.panel, marginBottom: 16 }}>
              <div style={styles.metricLabel}>Service metadata</div>
              <div style={{ ...styles.row, marginTop: 16 }}>
                <span style={{ color: "#748196", fontSize: 12 }}>Category</span>
                <strong style={{ fontSize: 12 }}>{selectedService.category}</strong>
              </div>
              <div style={{ ...styles.row, marginTop: 16 }}>
                <span style={{ color: "#748196", fontSize: 12 }}>Region</span>
                <strong style={{ fontSize: 12 }}>{selectedService.region}</strong>
              </div>
              <div style={{ ...styles.row, marginTop: 16 }}>
                <span style={{ color: "#748196", fontSize: 12 }}>Last checked</span>
                <strong style={{ fontSize: 12 }}>{selectedService.lastChecked}</strong>
              </div>
            </div>

            <div style={styles.panel}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 14 }}>Demo status controls</h3>
              <p style={{ color: "#748196", fontSize: 12, lineHeight: 1.6 }}>
                These controls update this page's local demo state only. They do not restart, repair, or change a real service.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {(["Healthy", "Degraded", "Down"] as ServiceStatus[]).map((status) => (
                  <button
                    key={status}
                    style={{
                      ...styles.button,
                      borderColor: selectedService.status === status ? "#315fe9" : "#dce2ea",
                      background: selectedService.status === status ? "#eff4ff" : "#fff",
                    }}
                    onClick={() => setServiceStatus(selectedService.id, status)}
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
