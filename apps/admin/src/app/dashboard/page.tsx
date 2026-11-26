
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  Cpu,
  DollarSign,
  Download,
  Globe,
  Layers3,
  RefreshCw,
  Server,
  Users,
  Zap,
} from "lucide-react";

type Period = "24 hours" | "7 days" | "30 days" | "90 days";

const initialActivity = [
  {
    title: "Organization created",
    detail: "Acme Technologies joined ModelNow",
    time: "2 minutes ago",
    type: "organization",
    status: "Success",
  },
  {
    title: "API usage threshold reached",
    detail: "Production API workspace reached 82% of its limit",
    time: "8 minutes ago",
    type: "warning",
    status: "Warning",
  },
  {
    title: "Model deployment completed",
    detail: "Llama production endpoint is ready",
    time: "16 minutes ago",
    type: "model",
    status: "Success",
  },
  {
    title: "Security policy updated",
    detail: "An administrator updated an access policy",
    time: "31 minutes ago",
    type: "security",
    status: "Success",
  },
  {
    title: "Provider latency increased",
    detail: "A provider response time exceeded its usual baseline",
    time: "45 minutes ago",
    type: "warning",
    status: "Warning",
  },
];

const metrics = [
  {
    label: "Total Users",
    value: "24,582",
    change: "+12.8%",
    icon: Users,
    color: "#6478f5",
    description: "Registered platform users",
  },
  {
    label: "Organizations",
    value: "1,284",
    change: "+8.4%",
    icon: Building2,
    color: "#0ea5a4",
    description: "Active workspaces",
  },
  {
    label: "API Requests",
    value: "8.42M",
    change: "+18.6%",
    icon: Activity,
    color: "#8b5cf6",
    description: "Requests processed",
  },
  {
    label: "Revenue",
    value: "$48,290",
    change: "+14.2%",
    icon: DollarSign,
    color: "#16a36a",
    description: "Illustrative revenue",
  },
];

const usageData: Record<Period, number[]> = {
  "24 hours": [30, 42, 35, 58, 47, 65, 54, 72, 63, 81, 68, 88],
  "7 days": [38, 48, 43, 59, 52, 70, 62, 78, 69, 84, 74, 92],
  "30 days": [25, 34, 42, 38, 51, 47, 60, 55, 70, 64, 82, 91],
  "90 days": [20, 30, 27, 40, 35, 49, 46, 61, 56, 73, 79, 94],
};

const providerData = [
  { name: "OpenAI", requests: "3.42M", percent: 82, color: "#16a36a" },
  { name: "Anthropic", requests: "2.18M", percent: 64, color: "#8b5cf6" },
  { name: "Google", requests: "1.64M", percent: 48, color: "#4285f4" },
  { name: "Open-source", requests: "1.18M", percent: 34, color: "#f59e0b" },
];

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fc",
    color: "#182230",
    padding: "28px",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
    alignItems: "start",
    gap: 16,
    marginBottom: 24,
    width: "100%",
  },
  headerTitle: {
    gridColumn: "2",
    gridRow: "1",
    textAlign: "center",
    minWidth: 0,
  },
  headerActions: {
    gridColumn: "3",
    gridRow: "1",
    display: "flex",
    justifyContent: "flex-end",
    gap: 9,
    flexWrap: "wrap",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heading: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.8,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#718096",
    fontSize: 13,
    lineHeight: 1.6,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 13px",
    background: "#fff",
    border: "1px solid #e1e6ef",
    borderRadius: 9,
    color: "#344054",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 225px), 1fr))",
    gap: 16,
    marginBottom: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #e8ebf2",
    borderRadius: 14,
    padding: 19,
    minWidth: 0,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.025)",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 800,
    margin: 0,
  },
  muted: {
    color: "#8490a2",
    fontSize: 12,
  },
  metricTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  metricIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 27,
    fontWeight: 800,
    letterSpacing: -0.8,
    marginTop: 17,
    marginBottom: 8,
  },
  change: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 11,
    fontWeight: 800,
    color: "#16865b",
    background: "#eaf8f0",
    borderRadius: 6,
    padding: "4px 6px",
  },
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))",
    gap: 18,
    marginBottom: 18,
  },
  panelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 22,
  },
  select: {
    border: "1px solid #e1e6ef",
    borderRadius: 8,
    padding: "8px 10px",
    background: "#fff",
    color: "#475467",
    fontSize: 12,
    outline: "none",
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "92px minmax(50px, 1fr) 56px",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    background: "#edf0f5",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "11px 8px",
    color: "#8490a2",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    borderBottom: "1px solid #edf0f5",
  },
  td: {
    padding: "14px 8px",
    borderBottom: "1px solid #f0f2f6",
    verticalAlign: "middle",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    borderRadius: 6,
    padding: "5px 7px",
    fontSize: 10,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
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
    <section style={styles.card}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {subtitle && (
            <p style={{ ...styles.muted, margin: "6px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MiniChart({ values }: { values: number[] }) {
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - value;
      return `${x},${y}`;
    })
    .join(" ");

  const area = `0,100 ${points} 100,100`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative API request trend"
      style={{ width: "100%", height: 190, overflow: "visible" }}
    >
      {[20, 40, 60, 80].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          stroke="#edf0f5"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <polygon points={area} fill="rgba(80, 105, 245, 0.10)" />

      <polyline
        points={points}
        fill="none"
        stroke="#5269ee"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {values.map((value, index) => (
        <circle
          key={`${index}-${value}`}
          cx={(index / (values.length - 1)) * 100}
          cy={100 - value}
          r="1.4"
          fill="#5269ee"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("7 days");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [activityFilter, setActivityFilter] = useState("All activity");
  const [exportMessage, setExportMessage] = useState("");

  const visibleActivity = useMemo(() => {
    if (activityFilter === "All activity") return initialActivity;

    return initialActivity.filter(
      (item) => item.status === activityFilter,
    );
  }, [activityFilter]);

  function exportActivity() {
    const header = ["Event", "Details", "Time", "Status"];

    const rows = visibleActivity.map((item) => [
      item.title,
      item.detail,
      item.time,
      item.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-dashboard-activity.csv";
    link.click();

    URL.revokeObjectURL(url);
    setExportMessage("Activity CSV exported.");
  }

  const serviceHealth = [
    {
      name: "AI Gateway",
      detail: "Request routing",
      value: "Operational",
    },
    {
      name: "Model Inference",
      detail: "Model execution",
      value: "Operational",
    },
    {
      name: "Knowledge Service",
      detail: "Retrieval pipeline",
      value: "Operational",
    },
    {
      name: "Agent Service",
      detail: "Agent workflows",
      value: "Operational",
    },
  ];

  return (
    <main style={styles.page}>
      <style jsx>{`
        @media (max-width: 760px) {
          .dashboard-header {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .dashboard-title {
            grid-column: 1 !important;
            grid-row: 1 !important;
            text-align: center !important;
          }

          .dashboard-actions {
            grid-column: 1 !important;
            grid-row: 2 !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-page {
            padding: 18px !important;
          }

          .dashboard-heading {
            font-size: 23px !important;
          }
        }
      `}</style>

      <header
        className="dashboard-header"
        style={styles.header}
      >
        <div
          className="dashboard-title"
          style={styles.headerTitle}
        >
          <div style={styles.eyebrow}>ModelNow / Admin</div>

          <h1
            className="dashboard-heading"
            style={styles.heading}
          >
            Dashboard Overview
          </h1>

          <p style={styles.subtitle}>
            Monitor your AI platform, organizations, revenue, usage and
            infrastructure from one place.
          </p>
        </div>

        <div
          className="dashboard-actions"
          style={styles.headerActions}
        >
          <button
            style={styles.button}
            onClick={() => {
              setLastUpdated("Just now");
              setExportMessage("");
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            style={styles.button}
            onClick={exportActivity}
          >
            <Download size={14} />
            Export activity
          </button>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          padding: "12px 15px",
          background: "#eef2ff",
          border: "1px solid #dfe5ff",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: 31,
            height: 31,
            borderRadius: 9,
            background: "#dce4ff",
            color: "#435bd8",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Activity size={16} />
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, fontWeight: 800 }}>
            Platform status
          </div>
          <div style={{ fontSize: 11, color: "#667085", marginTop: 3 }}>
            Demo dashboard data · Connect backend metrics for live status
          </div>
        </div>

        <span
          style={{
            ...styles.status,
            color: "#16865b",
            background: "#dff7e9",
          }}
        >
          <CheckCircle2 size={12} /> Preview mode
        </span>
      </div>

      <div style={styles.grid}>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} style={styles.card}>
              <div style={styles.metricTop}>
                <div
                  style={{
                    color: "#667085",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {metric.label}
                </div>

                <div
                  style={{
                    ...styles.metricIcon,
                    background: `${metric.color}14`,
                    color: metric.color,
                  }}
                >
                  <Icon size={19} />
                </div>
              </div>

              <div style={styles.metricValue}>{metric.value}</div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span style={styles.change}>
                  <ArrowUpRight size={13} />
                  {metric.change}
                </span>

                <span style={styles.muted}>
                  {metric.description}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={styles.twoColumns}>
        <Panel
          title="API request volume"
          subtitle="Illustrative request trend for the selected period"
          action={
            <select
              aria-label="Select analytics period"
              style={styles.select}
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as Period)
              }
            >
              {(
                ["24 hours", "7 days", "30 days", "90 days"] as Period[]
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          }
        >
          <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>
                8.42M
              </div>
              <div style={styles.muted}>Total requests</div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#16865b",
                }}
              >
                99.94%
              </div>
              <div style={styles.muted}>
                Illustrative availability
              </div>
            </div>
          </div>

          <MiniChart values={usageData[period]} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#98a2b3",
              fontSize: 10,
              marginTop: 7,
            }}
          >
            <span>Start</span>
            <span>Mid period</span>
            <span>Current</span>
          </div>
        </Panel>

        <Panel
          title="AI provider distribution"
          subtitle="Illustrative request share by provider"
          action={
            <span
              style={{
                color: "#6478f5",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              View providers
            </span>
          }
        >
          {providerData.map((provider) => (
            <div key={provider.name} style={styles.barRow}>
              <span style={{ fontWeight: 700, color: "#475467" }}>
                {provider.name}
              </span>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    width: `${provider.percent}%`,
                    height: "100%",
                    background: provider.color,
                    borderRadius: 99,
                  }}
                />
              </div>

              <span style={{ textAlign: "right", fontWeight: 800 }}>
                {provider.requests}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: 23,
              padding: 13,
              background: "#f8f9fc",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Layers3 size={19} color="#6478f5" />

            <div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>
                Unified AI gateway
              </div>
              <div style={{ ...styles.muted, marginTop: 4 }}>
                One interface for multiple model providers
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div style={styles.twoColumns}>
        <Panel
          title="Infrastructure health"
          subtitle="Service status preview"
          action={
            <span
              style={{
                ...styles.status,
                background: "#eaf8f0",
                color: "#16865b",
              }}
            >
              <CheckCircle2 size={12} /> Demo status
            </span>
          }
        >
          {serviceHealth.map((service) => (
            <div
              key={service.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "13px 0",
                borderBottom: "1px solid #f0f2f6",
              }}
            >
              <div
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 9,
                  background: "#f1f5f9",
                  display: "grid",
                  placeItems: "center",
                  color: "#64748b",
                }}
              >
                <Server size={17} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800 }}>
                  {service.name}
                </div>
                <div style={{ ...styles.muted, marginTop: 4 }}>
                  {service.detail}
                </div>
              </div>

              <span
                style={{
                  ...styles.status,
                  color: "#16865b",
                  background: "#eaf8f0",
                }}
              >
                <CheckCircle2 size={12} />
                {service.value}
              </span>
            </div>
          ))}
        </Panel>

        <Panel
          title="Platform usage"
          subtitle="Illustrative workload breakdown"
        >
          {[
            {
              name: "Chat completions",
              value: 78,
              icon: Bot,
              color: "#6478f5",
            },
            {
              name: "Agent workflows",
              value: 54,
              icon: Zap,
              color: "#8b5cf6",
            },
            {
              name: "Knowledge retrieval",
              value: 43,
              icon: Layers3,
              color: "#0ea5a4",
            },
            {
              name: "Computer use",
              value: 26,
              icon: Cpu,
              color: "#f59e0b",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.name} style={{ marginBottom: 21 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 9,
                  }}
                >
                  <Icon size={15} color={item.color} />

                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {item.name}
                  </span>

                  <span style={{ fontSize: 12, fontWeight: 800 }}>
                    {item.value}%
                  </span>
                </div>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: "100%",
                      background: item.color,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <Panel
        title="Recent platform activity"
        subtitle="Latest illustrative administrative events"
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              aria-label="Filter activity"
              style={styles.select}
              value={activityFilter}
              onChange={(event) =>
                setActivityFilter(event.target.value)
              }
            >
              <option>All activity</option>
              <option>Success</option>
              <option>Warning</option>
            </select>

            <button
              style={styles.button}
              onClick={exportActivity}
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        }
      >
        {exportMessage && (
          <p role="status" style={{ color: "#16865b", fontSize: 12 }}>
            {exportMessage}
          </p>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {visibleActivity.map((item, index) => (
                <tr key={`${item.title}-${index}`}>
                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {item.status === "Warning" ? (
                        <AlertTriangle size={15} color="#d97706" />
                      ) : (
                        <CheckCircle2 size={15} color="#16a36a" />
                      )}

                      <span
                        style={{
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      color: "#667085",
                      minWidth: 200,
                    }}
                  >
                    {item.detail}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      whiteSpace: "nowrap",
                      color: "#667085",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Clock3 size={12} />
                      {item.time}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.status,
                        color:
                          item.status === "Warning"
                            ? "#b45309"
                            : "#16865b",
                        background:
                          item.status === "Warning"
                            ? "#fff4df"
                            : "#eaf8f0",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {visibleActivity.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      ...styles.td,
                      textAlign: "center",
                    }}
                  >
                    No matching activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 18,
          color: "#98a2b3",
          fontSize: 11,
        }}
      >
        <span>ModelNow Admin Console · Dashboard Overview</span>

        <span>
          <Globe
            size={12}
            style={{
              verticalAlign: "middle",
              marginRight: 5,
            }}
          />
          Sample data · Last refreshed: {lastUpdated}
        </span>
      </footer>
    </main>
  );
}
