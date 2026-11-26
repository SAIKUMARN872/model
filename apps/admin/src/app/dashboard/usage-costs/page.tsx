
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Coins,
  Download,
  Filter,
  Gauge,
  Layers3,
  RefreshCw,
  Search,
  Wallet,
  X,
  Eye,
} from "lucide-react";

type UsageStatusType = "Completed" | "Processing" | "Failed";

type UsageRecord = {
  id: string;
  organization: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  cost: number;
  date: string;
  status: UsageStatusType;
};

const initialRecords: UsageRecord[] = [
  { id: "USE-1001", organization: "Acme AI", model: "GPT-5", provider: "OpenAI", inputTokens: 1250000, outputTokens: 485000, requests: 1240, cost: 184.5, date: "2026-11-04", status: "Completed" },
  { id: "USE-1002", organization: "Northstar Labs", model: "Claude Sonnet", provider: "Anthropic", inputTokens: 980000, outputTokens: 360000, requests: 980, cost: 142.8, date: "2026-11-04", status: "Completed" },
  { id: "USE-1003", organization: "Acme AI", model: "Llama 4", provider: "Meta", inputTokens: 2100000, outputTokens: 790000, requests: 2250, cost: 48.6, date: "2026-11-04", status: "Completed" },
  { id: "USE-1004", organization: "Vertex Systems", model: "GPT-5", provider: "OpenAI", inputTokens: 740000, outputTokens: 280000, requests: 760, cost: 105.2, date: "2026-11-03", status: "Completed" },
  { id: "USE-1005", organization: "BrightPath", model: "Gemini Pro", provider: "Google", inputTokens: 1650000, outputTokens: 610000, requests: 1840, cost: 86.4, date: "2026-11-03", status: "Completed" },
  { id: "USE-1006", organization: "Northstar Labs", model: "Llama 4", provider: "Meta", inputTokens: 1900000, outputTokens: 680000, requests: 1980, cost: 39.7, date: "2026-11-03", status: "Completed" },
  { id: "USE-1007", organization: "Vertex Systems", model: "Claude Sonnet", provider: "Anthropic", inputTokens: 850000, outputTokens: 310000, requests: 870, cost: 126.3, date: "2026-11-02", status: "Processing" },
  { id: "USE-1008", organization: "BrightPath", model: "GPT-5", provider: "OpenAI", inputTokens: 520000, outputTokens: 190000, requests: 510, cost: 73.8, date: "2026-11-02", status: "Completed" },
  { id: "USE-1009", organization: "Acme AI", model: "Gemini Pro", provider: "Google", inputTokens: 1120000, outputTokens: 420000, requests: 1190, cost: 59.6, date: "2026-11-01", status: "Failed" },
  { id: "USE-1010", organization: "Northstar Labs", model: "GPT-5", provider: "OpenAI", inputTokens: 870000, outputTokens: 330000, requests: 920, cost: 131.7, date: "2026-11-01", status: "Completed" },
  { id: "USE-1011", organization: "Vertex Systems", model: "Llama 4", provider: "Meta", inputTokens: 1350000, outputTokens: 495000, requests: 1410, cost: 28.9, date: "2026-10-31", status: "Completed" },
  { id: "USE-1012", organization: "BrightPath", model: "Claude Sonnet", provider: "Anthropic", inputTokens: 690000, outputTokens: 255000, requests: 720, cost: 98.4, date: "2026-10-31", status: "Completed" },
];

const dailyUsage = [
  { day: "Oct 29", tokens: 4.2, cost: 210 },
  { day: "Oct 30", tokens: 5.1, cost: 245 },
  { day: "Oct 31", tokens: 4.8, cost: 230 },
  { day: "Nov 01", tokens: 6.3, cost: 295 },
  { day: "Nov 02", tokens: 5.7, cost: 270 },
  { day: "Nov 03", tokens: 7.2, cost: 345 },
  { day: "Nov 04", tokens: 6.6, cost: 320 },
];

const modelBreakdown = [
  { name: "GPT-5", provider: "OpenAI", cost: 495.2, share: 34, color: "#315fe9" },
  { name: "Claude Sonnet", provider: "Anthropic", cost: 367.5, share: 25, color: "#8b5cf6" },
  { name: "Gemini Pro", provider: "Google", cost: 226, share: 16, color: "#169b79" },
  { name: "Llama 4", provider: "Meta", cost: 117.2, share: 8, color: "#d58a25" },
  { name: "Other models", provider: "Multiple", cost: 244.1, share: 17, color: "#94a3b8" },
];

const organizationBudgets = [
  { name: "Acme AI", used: 824, budget: 1200, requests: 4680 },
  { name: "Northstar Labs", used: 690, budget: 900, requests: 3600 },
  { name: "Vertex Systems", used: 535, budget: 800, requests: 3040 },
  { name: "BrightPath", used: 318, budget: 750, requests: 3070 },
];

// FIX: formatNumber was used throughout the original page but wasn't defined.
const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

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
  heading: {
    fontSize: 28,
    fontWeight: 750,
    margin: 0,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 1.6,
    maxWidth: 700,
  },
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
    whiteSpace: "nowrap",
  },
  primary: { background: "#315fe9", borderColor: "#315fe9", color: "#fff" },
  demo: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    background: "#fff8e8",
    border: "1px solid #f5d99b",
    color: "#855b0c",
    borderRadius: 9,
    padding: "11px 13px",
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 1.6,
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
    flexShrink: 0,
  },
  sectionTitle: { fontSize: 15, fontWeight: 750, margin: 0 },
  sectionSub: { color: "#7b8798", fontSize: 12, marginTop: 6, lineHeight: 1.6 },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))",
    gap: 16,
    marginBottom: 18,
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
    maxWidth: "100%",
  },
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
    whiteSpace: "nowrap",
  },
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    height: 165,
    paddingTop: 18,
    borderBottom: "1px solid #e8edf3",
    marginTop: 18,
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

function UsageStatus({ status }: { status: UsageStatusType }) {
  const config = {
    Completed: { bg: "#e9f8ef", color: "#167647", Icon: CheckCircle2 },
    Processing: { bg: "#fff4dd", color: "#a56609", Icon: Activity },
    Failed: { bg: "#ffebeb", color: "#c52c2c", Icon: AlertTriangle },
  }[status];

  const Icon = config.Icon;

  return (
    <span style={{ ...styles.badge, background: config.bg, color: config.color }}>
      <Icon size={12} />
      {status}
    </span>
  );
}

export default function UsageCostsPage() {
  const [records, setRecords] = useState<UsageRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [organizationFilter, setOrganizationFilter] = useState("All");
  const [period, setPeriod] = useState("7 days");
  const [selectedRecord, setSelectedRecord] = useState<UsageRecord | null>(null);
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [refreshing, setRefreshing] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.organization.toLowerCase().includes(query) ||
        record.model.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (modelFilter === "All" || record.model === modelFilter) &&
        (statusFilter === "All" || record.status === statusFilter) &&
        (organizationFilter === "All" ||
          record.organization === organizationFilter)
      );
    });
  }, [records, search, modelFilter, statusFilter, organizationFilter]);

  const totals = useMemo(() => {
    const inputTokens = records.reduce((sum, record) => sum + record.inputTokens, 0);
    const outputTokens = records.reduce((sum, record) => sum + record.outputTokens, 0);
    const requests = records.reduce((sum, record) => sum + record.requests, 0);
    const spend = records.reduce((sum, record) => sum + record.cost, 0);

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      requests,
      spend,
      avgCost: requests > 0 ? spend / requests : 0,
      failed: records.filter((record) => record.status === "Failed").length,
    };
  }, [records]);

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

  const clearFilters = () => {
    setSearch("");
    setModelFilter("All");
    setOrganizationFilter("All");
    setStatusFilter("All");
  };

  const exportCsv = () => {
    const headers = [
      "Usage ID",
      "Organization",
      "Model",
      "Provider",
      "Input Tokens",
      "Output Tokens",
      "Requests",
      "Cost USD",
      "Date",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.organization,
      record.model,
      record.provider,
      record.inputTokens,
      record.outputTokens,
      record.requests,
      record.cost,
      record.date,
      record.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-usage-costs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const updateStatus = (id: string, status: UsageStatusType) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status } : record
      )
    );

    setSelectedRecord((current) =>
      current?.id === id ? { ...current, status } : current
    );
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Admin / Dashboard</div>
            <h1 style={styles.heading}>Usage &amp; Costs</h1>
            <p style={styles.subtitle}>
              Track AI consumption, token volume, provider spend, and
              organization budgets across ModelNow.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <select
              aria-label="Usage period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={styles.select}
            >
              <option value="24 hours">Last 24 hours</option>
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
            </select>

            <button style={styles.button} onClick={exportCsv}>
              <Download size={15} />
              Export CSV
            </button>

            <button
              style={{
                ...styles.button,
                ...styles.primary,
                opacity: refreshing ? 0.7 : 1,
              }}
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw size={15} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div style={styles.demo}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Demo financial data.</strong> Costs are illustrative USD
            estimates, not actual provider invoices. The period selector changes
            the selected label only; it does not query historical data. Connect
            usage metering and billing data before using these figures for
            customer billing or financial reporting.
          </span>
        </div>

        <section style={styles.grid}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Total AI spend</span>
              <span style={styles.iconBox}><Wallet size={18} /></span>
            </div>
            <div style={styles.value}>{money(totals.spend)}</div>
            <div style={styles.foot}>
              <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} />{" "}
              Sample usage records · {period}
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Total tokens</span>
              <span style={styles.iconBox}><Coins size={18} /></span>
            </div>
            <div style={styles.value}>{compactNumber(totals.totalTokens)}</div>
            <div style={styles.foot}>
              {compactNumber(totals.inputTokens)} input ·{" "}
              {compactNumber(totals.outputTokens)} output
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>API requests</span>
              <span style={styles.iconBox}><Activity size={18} /></span>
            </div>
            <div style={styles.value}>{formatNumber(totals.requests)}</div>
            <div style={styles.foot}>Across the listed usage records</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Average cost per request</span>
              <span style={styles.iconBox}><Gauge size={18} /></span>
            </div>
            <div style={styles.value}>{money(totals.avgCost)}</div>
            <div style={styles.foot}>
              {totals.failed} failed sample usage records
            </div>
          </article>
        </section>

        <section style={styles.twoCol}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <div>
                <h2 style={styles.sectionTitle}>Usage &amp; spend trend</h2>
                <p style={styles.sectionSub}>
                  Illustrative daily token volume and spending
                </p>
              </div>
              <CalendarDays size={18} color="#315fe9" />
            </div>

            <div style={{ display: "flex", gap: 14, fontSize: 11, marginTop: 18 }}>
              <span style={{ color: "#315fe9" }}>● Tokens (millions)</span>
              <span style={{ color: "#169b79" }}>● Spend (scaled)</span>
            </div>

            <div style={styles.chart}>
              {dailyUsage.map((point) => (
                <div key={point.day} style={styles.chartCol}>
                  <div
                    title={`${point.tokens}M tokens`}
                    style={{
                      width: "100%",
                      maxWidth: 28,
                      height: `${(point.tokens / 8) * 100}%`,
                      minHeight: 4,
                      background: "#315fe9",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
                  <div
                    title={`${money(point.cost)} illustrative spend`}
                    style={{
                      width: "100%",
                      maxWidth: 28,
                      height: `${(point.cost / 400) * 100}%`,
                      minHeight: 4,
                      background: "#169b79",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
                  <span style={styles.chartLabel}>{point.day}</span>
                </div>
              ))}
            </div>

            <div style={{ ...styles.row, marginTop: 16 }}>
              <div>
                <div style={styles.label}>Highest sample spend</div>
                <strong style={{ fontSize: 17 }}>
                  {money(Math.max(...dailyUsage.map((point) => point.cost)))}
                </strong>
              </div>
              <div>
                <div style={styles.label}>Latest sample tokens</div>
                <strong style={{ fontSize: 17 }}>
                  {dailyUsage[dailyUsage.length - 1].tokens}M
                </strong>
              </div>
            </div>
          </article>

          <article style={styles.panel}>
            <div>
              <h2 style={styles.sectionTitle}>Spend by model</h2>
              <p style={styles.sectionSub}>
                Illustrative distribution by model family
              </p>
            </div>

            <div
              style={{
                display: "flex",
                height: 12,
                overflow: "hidden",
                borderRadius: 20,
                marginTop: 25,
                marginBottom: 24,
              }}
            >
              {modelBreakdown.map((model) => (
                <div
                  key={model.name}
                  title={`${model.name}: ${model.share}%`}
                  style={{ width: `${model.share}%`, background: model.color }}
                />
              ))}
            </div>

            {modelBreakdown.map((model) => (
              <div
                key={model.name}
                style={{ ...styles.row, marginBottom: 16 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 3,
                      background: model.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {model.name}
                    </div>
                    <div
                      style={{
                        color: "#7b8798",
                        fontSize: 10,
                        marginTop: 3,
                      }}
                    >
                      {model.provider} · {model.share}%
                    </div>
                  </div>
                </div>
                <strong style={{ fontSize: 12 }}>{money(model.cost)}</strong>
              </div>
            ))}
          </article>
        </section>

        <section style={{ ...styles.panel, marginBottom: 18 }}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Organization budgets</h2>
              <p style={styles.sectionSub}>
                Sample spend compared with configured budget limits
              </p>
            </div>
            <Building2 size={19} color="#315fe9" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
              marginTop: 22,
            }}
          >
            {organizationBudgets.map((org) => {
              const percent = (org.used / org.budget) * 100;
              const overThreshold = percent >= 80;

              return (
                <div
                  key={org.name}
                  style={{
                    border: "1px solid #edf0f4",
                    borderRadius: 11,
                    padding: 15,
                  }}
                >
                  <div style={styles.row}>
                    <strong style={{ fontSize: 13 }}>{org.name}</strong>
                    {overThreshold && (
                      <AlertTriangle size={15} color="#c27b13" />
                    )}
                  </div>

                  <div style={{ ...styles.row, marginTop: 16 }}>
                    <strong style={{ fontSize: 20 }}>{money(org.used)}</strong>
                    <span style={{ color: "#748196", fontSize: 11 }}>
                      of {money(org.budget)}
                    </span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 7,
                      borderRadius: 20,
                      background: "#edf0f5",
                      overflow: "hidden",
                      marginTop: 10,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, percent)}%`,
                        height: "100%",
                        borderRadius: 20,
                        background: overThreshold ? "#d99727" : "#315fe9",
                      }}
                    />
                  </div>

                  <div style={{ ...styles.row, marginTop: 9 }}>
                    <span style={styles.foot}>
                      {percent.toFixed(0)}% of budget
                    </span>
                    <span style={styles.foot}>
                      {formatNumber(org.requests)} requests
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={styles.grid}>
          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Input tokens</span>
              <Layers3 size={18} color="#315fe9" />
            </div>
            <div style={styles.value}>{compactNumber(totals.inputTokens)}</div>
            <div style={styles.foot}>Total in listed records</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Output tokens</span>
              <BarChart3 size={18} color="#169b79" />
            </div>
            <div style={styles.value}>{compactNumber(totals.outputTokens)}</div>
            <div style={styles.foot}>Total in listed records</div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Budget alerts</span>
              <AlertTriangle size={18} color="#c27b13" />
            </div>
            <div style={styles.value}>
              {organizationBudgets.filter((org) => org.used / org.budget >= 0.8).length}
            </div>
            <div style={styles.foot}>
              Organizations using at least 80% of budget
            </div>
          </article>

          <article style={styles.panel}>
            <div style={styles.row}>
              <span style={styles.label}>Tracked models</span>
              <Layers3 size={18} color="#315fe9" />
            </div>
            <div style={styles.value}>
              {new Set(records.map((record) => record.model)).size}
            </div>
            <div style={styles.foot}>Distinct models in sample records</div>
          </article>
        </section>

        <section style={styles.panel}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Usage records</h2>
              <p style={styles.sectionSub}>
                {filteredRecords.length} records · Filter by organization,
                model, or status
              </p>
            </div>
            <span style={{ color: "#748196", fontSize: 11 }}>
              Updated: {lastRefresh}
            </span>
          </div>

          <div style={styles.toolbar}>
            <div
              style={{
                ...styles.row,
                ...styles.input,
                flex: "1 1 220px",
              }}
            >
              <Search size={15} color="#8490a2" />
              <input
                aria-label="Search usage records"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ID, organization, provider..."
                style={{
                  border: 0,
                  outline: 0,
                  width: "100%",
                  minWidth: 0,
                  fontSize: 12,
                  background: "transparent",
                  color: "#263449",
                }}
              />
            </div>

            <select
              aria-label="Filter by model"
              value={modelFilter}
              onChange={(event) => setModelFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All models</option>
              {[...new Set(records.map((record) => record.model))].map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>

            <select
              aria-label="Filter by organization"
              value={organizationFilter}
              onChange={(event) => setOrganizationFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All organizations</option>
              {[...new Set(records.map((record) => record.organization))].map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <select
              aria-label="Filter by usage status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={styles.select}
            >
              <option value="All">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>

            <button style={styles.button} onClick={clearFilters}>
              <Filter size={14} />
              Clear filters
            </button>
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Usage ID",
                    "Organization",
                    "Model",
                    "Input tokens",
                    "Output tokens",
                    "Requests",
                    "Cost",
                    "Date",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th key={heading} style={styles.th}>{heading}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td style={styles.td}>
                      <strong>{record.id}</strong>
                    </td>
                    <td style={styles.td}>{record.organization}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 650 }}>{record.model}</div>
                      <div
                        style={{
                          color: "#8490a2",
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {record.provider}
                      </div>
                    </td>
                    <td style={styles.td}>{compactNumber(record.inputTokens)}</td>
                    <td style={styles.td}>{compactNumber(record.outputTokens)}</td>
                    <td style={styles.td}>{formatNumber(record.requests)}</td>
                    <td style={styles.td}><strong>{money(record.cost)}</strong></td>
                    <td style={styles.td}>{record.date}</td>
                    <td style={styles.td}><UsageStatus status={record.status} /></td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.button, padding: "7px 9px" }}
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye size={13} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        padding: 30,
                        color: "#748196",
                      }}
                    >
                      No usage records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer
          style={{
            textAlign: "center",
            color: "#8b95a5",
            fontSize: 11,
            marginTop: 20,
          }}
        >
          ModelNow Admin · Usage &amp; Costs · Demo environment
        </footer>
      </div>

      {selectedRecord && (
        <div
          style={styles.overlay}
          onClick={() => setSelectedRecord(null)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Usage record details"
            style={styles.drawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ ...styles.row, marginBottom: 22 }}>
              <div>
                <div style={styles.eyebrow}>Usage record details</div>
                <h2 style={{ margin: 0, fontSize: 22 }}>
                  {selectedRecord.id}
                </h2>
                <p style={styles.sectionSub}>{selectedRecord.organization}</p>
              </div>

              <button
                aria-label="Close usage details"
                style={styles.button}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={16} />
              </button>
            </div>

            <UsageStatus status={selectedRecord.status} />

            <div
              style={{
                ...styles.grid,
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                marginTop: 22,
              }}
            >
              {[
                { label: "Estimated cost", value: money(selectedRecord.cost) },
                { label: "Requests", value: formatNumber(selectedRecord.requests) },
                { label: "Input tokens", value: formatNumber(selectedRecord.inputTokens) },
                { label: "Output tokens", value: formatNumber(selectedRecord.outputTokens) },
              ].map((item) => (
                <div key={item.label} style={styles.panel}>
                  <div style={styles.label}>{item.label}</div>
                  <div style={{ ...styles.value, fontSize: 21 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...styles.panel, marginBottom: 16 }}>
              <h3 style={styles.sectionTitle}>Record metadata</h3>

              {([
                ["Organization", selectedRecord.organization],
                ["Model", selectedRecord.model],
                ["Provider", selectedRecord.provider],
                ["Date", selectedRecord.date],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ ...styles.row, marginTop: 17 }}>
                  <span style={styles.label}>{label}</span>
                  <strong style={{ fontSize: 12, textAlign: "right" }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div style={styles.panel}>
              <h3 style={styles.sectionTitle}>Demo record status</h3>
              <p style={{ ...styles.sectionSub, lineHeight: 1.6 }}>
                This changes the local demo record only. It does not alter
                provider usage or billing.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 14,
                }}
              >
                {(["Completed", "Processing", "Failed"] as UsageStatusType[]).map(
                  (status) => (
                    <button
                      key={status}
                      style={{
                        ...styles.button,
                        borderColor:
                          selectedRecord.status === status
                            ? "#315fe9"
                            : "#dce2ea",
                        background:
                          selectedRecord.status === status
                            ? "#eff4ff"
                            : "#fff",
                      }}
                      onClick={() => updateStatus(selectedRecord.id, status)}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
