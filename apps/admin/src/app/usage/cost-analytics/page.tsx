
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Download,
  Filter,
  RefreshCw,
  Search,
  Server,
  TrendingUp,
  Wallet,
} from "lucide-react";

type CostRecord = {
  service: string;
  category: string;
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  previousCost: number;
  status: "Healthy" | "Warning" | "Critical";
};

const initialRecords: CostRecord[] = [
  {
    service: "Chat Completions",
    category: "AI Inference",
    provider: "OpenAI",
    requests: 128450,
    tokens: 28450000,
    cost: 428.65,
    previousCost: 391.2,
    status: "Healthy",
  },
  {
    service: "AI Model Routing",
    category: "AI Infrastructure",
    provider: "ModelNow Gateway",
    requests: 89420,
    tokens: 16200000,
    cost: 216.4,
    previousCost: 230.8,
    status: "Healthy",
  },
  {
    service: "Claude Inference",
    category: "AI Inference",
    provider: "Anthropic",
    requests: 45280,
    tokens: 9800000,
    cost: 312.75,
    previousCost: 275.5,
    status: "Warning",
  },
  {
    service: "Vector Search",
    category: "Knowledge Hub",
    provider: "Vector Database",
    requests: 67800,
    tokens: 0,
    cost: 86.2,
    previousCost: 72.4,
    status: "Healthy",
  },
  {
    service: "Embedding Generation",
    category: "Knowledge Hub",
    provider: "OpenAI",
    requests: 28400,
    tokens: 4200000,
    cost: 64.85,
    previousCost: 58.3,
    status: "Healthy",
  },
  {
    service: "Browser Automation",
    category: "Agent Services",
    provider: "ModelNow",
    requests: 12640,
    tokens: 1850000,
    cost: 148.6,
    previousCost: 119.2,
    status: "Warning",
  },
  {
    service: "GPU Training",
    category: "Compute",
    provider: "GPU Cluster",
    requests: 840,
    tokens: 0,
    cost: 286.9,
    previousCost: 301.4,
    status: "Healthy",
  },
  {
    service: "Multimodal Processing",
    category: "AI Inference",
    provider: "Google",
    requests: 9780,
    tokens: 2650000,
    cost: 174.35,
    previousCost: 160.7,
    status: "Critical",
  },
];

const dailyCosts = [
  { day: "01", cost: 82 },
  { day: "02", cost: 105 },
  { day: "03", cost: 91 },
  { day: "04", cost: 128 },
  { day: "05", cost: 116 },
  { day: "06", cost: 143 },
  { day: "07", cost: 124 },
  { day: "08", cost: 157 },
  { day: "09", cost: 139 },
  { day: "10", cost: 172 },
  { day: "11", cost: 150 },
  { day: "12", cost: 188 },
  { day: "13", cost: 163 },
  { day: "14", cost: 198 },
  { day: "15", cost: 181 },
  { day: "16", cost: 214 },
  { day: "17", cost: 194 },
  { day: "18", cost: 231 },
  { day: "19", cost: 205 },
  { day: "20", cost: 246 },
  { day: "21", cost: 221 },
  { day: "22", cost: 238 },
  { day: "23", cost: 218 },
  { day: "24", cost: 264 },
  { day: "25", cost: 241 },
  { day: "26", cost: 278 },
  { day: "27", cost: 252 },
  { day: "28", cost: 295 },
  { day: "29", cost: 271 },
  { day: "30", cost: 318 },
];

const categoryColors: Record<string, string> = {
  "AI Inference": "#6366f1",
  "AI Infrastructure": "#0ea5e9",
  "Knowledge Hub": "#10b981",
  "Agent Services": "#f59e0b",
  Compute: "#ec4899",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function CostAnalyticsPage() {
  const [records, setRecords] = useState(initialRecords);
  const [period, setPeriod] = useState("30 days");
  const [category, setCategory] = useState("All categories");
  const [provider, setProvider] = useState("All providers");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"cost" | "requests" | "tokens">("cost");
  const [selected, setSelected] = useState<CostRecord | null>(null);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const filtered = useMemo(() => {
    return records
      .filter((record) => {
        const matchesSearch = [
          record.service,
          record.category,
          record.provider,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

        return (
          matchesSearch &&
          (category === "All categories" || record.category === category) &&
          (provider === "All providers" || record.provider === provider)
        );
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [records, search, category, provider, sortBy]);

  const totalCost = filtered.reduce((sum, item) => sum + item.cost, 0);
  const previousTotal = filtered.reduce(
    (sum, item) => sum + item.previousCost,
    0
  );
  const totalRequests = filtered.reduce((sum, item) => sum + item.requests, 0);
  const totalTokens = filtered.reduce((sum, item) => sum + item.tokens, 0);
  const costChange =
    previousTotal > 0 ? ((totalCost - previousTotal) / previousTotal) * 100 : 0;

  const categories = useMemo(() => {
    const totals = new Map<string, number>();
    records.forEach((record) => {
      totals.set(
        record.category,
        (totals.get(record.category) ?? 0) + record.cost
      );
    });
    return Array.from(totals.entries())
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost);
  }, [records]);

  const exportCsv = () => {
    const header = [
      "Service",
      "Category",
      "Provider",
      "Requests",
      "Tokens",
      "Current Cost USD",
      "Previous Cost USD",
      "Status",
    ];

    const rows = filtered.map((record) => [
      record.service,
      record.category,
      record.provider,
      record.requests,
      record.tokens,
      record.cost.toFixed(2),
      record.previousCost.toFixed(2),
      record.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-cost-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const refresh = () => {
    setRecords((current) => [...current]);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const cardStyle: CSSProperties = {
    background: "var(--panel, #fff)",
    border: "1px solid var(--border, #e5e7eb)",
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  };

  const inputStyle: CSSProperties = {
    height: 40,
    borderRadius: 9,
    border: "1px solid var(--border, #d1d5db)",
    padding: "0 12px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    fontSize: 13,
    outline: "none",
    width: "100%",
  };

  const buttonStyle: CSSProperties = {
    height: 39,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid var(--border, #d1d5db)",
    borderRadius: 9,
    padding: "0 13px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const muted: CSSProperties = {
    color: "var(--muted-foreground, #6b7280)",
    fontSize: 12,
  };

  return (
    <main
      style={{
        padding: "28px clamp(16px, 3vw, 32px)",
        maxWidth: 1600,
        margin: "0 auto",
        color: "var(--foreground, #111827)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            <Link
              href="/usage"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Usage &amp; Analytics
            </Link>{" "}
            / Cost Analytics
          </div>
          <h1
            style={{
              fontSize: "clamp(25px, 3vw, 32px)",
              fontWeight: 750,
              letterSpacing: "-0.8px",
              margin: "0 0 8px",
            }}
          >
            Cost Analytics
          </h1>
          <p style={{ margin: 0, ...muted, fontSize: 14 }}>
            Track AI spending, infrastructure costs, and service-level cost
            efficiency.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={refresh} style={buttonStyle}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button onClick={exportCsv} style={buttonStyle}>
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <CalendarDays size={17} color="#6366f1" />
        <span style={{ fontSize: 13, fontWeight: 650 }}>Reporting period</span>
        <select
          aria-label="Reporting period"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          style={{ ...inputStyle, width: 155 }}
        >
          <option>24 hours</option>
          <option>7 days</option>
          <option>30 days</option>
          <option>90 days</option>
        </select>
        <span style={{ ...muted, marginLeft: "auto" }}>
          Last refreshed: {lastUpdated}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <span style={muted}>Total tracked cost</span>
            <CircleDollarSign size={19} color="#6366f1" />
          </div>
          <div style={{ fontSize: 29, fontWeight: 750, letterSpacing: -1 }}>
            {money(totalCost)}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 10,
              fontSize: 12,
              color: costChange > 0 ? "#dc2626" : "#059669",
            }}
          >
            {costChange > 0 ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowDownRight size={15} />
            )}
            {Math.abs(costChange).toFixed(1)}% vs previous sample period
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={muted}>Total requests</span>
            <Activity size={19} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: 29, fontWeight: 750, letterSpacing: -1 }}>
            {compact(totalRequests)}
          </div>
          <div style={{ ...muted, marginTop: 10 }}>
            Across {filtered.length} tracked services
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={muted}>Tokens processed</span>
            <BarChart3 size={19} color="#10b981" />
          </div>
          <div style={{ fontSize: 29, fontWeight: 750, letterSpacing: -1 }}>
            {compact(totalTokens)}
          </div>
          <div style={{ ...muted, marginTop: 10 }}>
            Total tracked input/output tokens
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={muted}>Average cost per request</span>
            <Wallet size={19} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 29, fontWeight: 750, letterSpacing: -1 }}>
            {money(totalRequests ? totalCost / totalRequests : 0)}
          </div>
          <div style={{ ...muted, marginTop: 10 }}>
            Estimated blended service cost
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                Daily cost trend
              </h2>
              <p style={{ ...muted, margin: 0 }}>
                Illustrative daily spend · USD
              </p>
            </div>
            <TrendingUp size={19} color="#6366f1" />
          </div>

          <div
            style={{
              height: 190,
              display: "flex",
              alignItems: "flex-end",
              gap: 4,
              padding: "8px 0 24px",
              borderBottom: "1px solid var(--border, #e5e7eb)",
            }}
          >
            {dailyCosts.map((item, index) => (
              <div
                key={item.day}
                title={`Day ${item.day}: ${money(item.cost)}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: `${(item.cost / 330) * 100}%`,
                  borderRadius: "4px 4px 0 0",
                  background:
                    index === dailyCosts.length - 1
                      ? "#4f46e5"
                      : "rgba(99, 102, 241, 0.35)",
                  transition: "height 180ms ease",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              ...muted,
              marginTop: 10,
            }}
          >
            <span>Day 01</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Day 30</span>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
            Cost by category
          </h2>
          <p style={{ ...muted, margin: "0 0 22px" }}>
            Distribution across tracked service categories
          </p>

          {categories.map((item) => {
            const percentage =
              categories.reduce((sum, categoryItem) => sum + categoryItem.cost, 0) > 0
                ? (item.cost /
                    categories.reduce(
                      (sum, categoryItem) => sum + categoryItem.cost,
                      0
                    )) *
                  100
                : 0;

            return (
              <div key={item.name} style={{ marginBottom: 19 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 650 }}>
                    {money(item.cost)}{" "}
                    <span style={muted}>({percentage.toFixed(1)}%)</span>
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 10,
                    background: "var(--muted, #f3f4f6)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${percentage}%`,
                      borderRadius: 10,
                      background: categoryColors[item.name] ?? "#6366f1",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
                Service cost breakdown
              </h2>
              <p style={{ ...muted, margin: 0 }}>
                Compare costs, usage, and status by service.
              </p>
            </div>
            <span style={{ ...muted, alignSelf: "center" }}>
              {filtered.length} services
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
              gap: 10,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: 12,
                  color: "#9ca3af",
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services..."
                aria-label="Search services"
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <Filter
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: 12,
                  color: "#9ca3af",
                  pointerEvents: "none",
                }}
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
                style={{ ...inputStyle, paddingLeft: 34 }}
              >
                <option>All categories</option>
                {categories.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <select
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              aria-label="Filter by provider"
              style={inputStyle}
            >
              <option>All providers</option>
              {Array.from(new Set(records.map((item) => item.provider))).map(
                (item) => (
                  <option key={item}>{item}</option>
                )
              )}
            </select>

            <div style={{ position: "relative" }}>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "cost" | "requests" | "tokens")
                }
                aria-label="Sort services"
                style={inputStyle}
              >
                <option value="cost">Sort: Highest cost</option>
                <option value="requests">Sort: Most requests</option>
                <option value="tokens">Sort: Most tokens</option>
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 13,
                  pointerEvents: "none",
                  display: "none",
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 900,
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "var(--muted, #f9fafb)" }}>
                {[
                  "Service",
                  "Provider",
                  "Requests",
                  "Tokens",
                  "Current cost",
                  "Previous cost",
                  "Change",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "13px 16px",
                      color: "var(--muted-foreground, #6b7280)",
                      fontWeight: 650,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid var(--border, #e5e7eb)",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const change =
                  record.previousCost > 0
                    ? ((record.cost - record.previousCost) /
                        record.previousCost) *
                      100
                    : 0;

                return (
                  <tr
                    key={record.service}
                    onClick={() => setSelected(record)}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border, #f0f0f0)",
                    }}
                  >
                    <td style={{ padding: "15px 16px" }}>
                      <div style={{ fontWeight: 650 }}>{record.service}</div>
                      <div style={{ ...muted, marginTop: 4 }}>
                        {record.category}
                      </div>
                    </td>
                    <td style={{ padding: "15px 16px", whiteSpace: "nowrap" }}>
                      {record.provider}
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      {record.requests.toLocaleString()}
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      {record.tokens ? compact(record.tokens) : "—"}
                    </td>
                    <td style={{ padding: "15px 16px", fontWeight: 700 }}>
                      {money(record.cost)}
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      {money(record.previousCost)}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        color: change > 0 ? "#dc2626" : "#059669",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {change > 0 ? (
                        <ArrowUpRight
                          size={13}
                          style={{ verticalAlign: "middle" }}
                        />
                      ) : (
                        <ArrowDownRight
                          size={13}
                          style={{ verticalAlign: "middle" }}
                        />
                      )}{" "}
                      {Math.abs(change).toFixed(1)}%
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          borderRadius: 20,
                          padding: "5px 9px",
                          fontSize: 11,
                          fontWeight: 650,
                          color:
                            record.status === "Healthy"
                              ? "#047857"
                              : record.status === "Warning"
                                ? "#b45309"
                                : "#b91c1c",
                          background:
                            record.status === "Healthy"
                              ? "#d1fae5"
                              : record.status === "Warning"
                                ? "#fef3c7"
                                : "#fee2e2",
                        }}
                      >
                        {record.status === "Healthy" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Activity size={12} />
                        )}
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: "var(--muted-foreground, #6b7280)",
                    }}
                  >
                    No services match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border, #e5e7eb)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            ...muted,
          }}
        >
          <span>Showing {filtered.length} of {records.length} services</span>
          <span>Amounts displayed in USD</span>
        </div>
      </section>

      <div
        style={{
          ...cardStyle,
          marginTop: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Server size={18} color="#6366f1" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 650, fontSize: 13, marginBottom: 5 }}>
            Sample analytics data
          </div>
          <p style={{ ...muted, margin: 0, lineHeight: 1.7 }}>
            The values on this page are illustrative frontend data. Connect
            your billing, AI gateway, provider invoices, and infrastructure
            metering APIs before using these figures for actual financial
            reporting. The reporting-period selector is currently a UI control;
            it does not fetch historical data.
          </p>
        </div>
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Service cost details"
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            zIndex: 100,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(100%, 460px)",
              height: "100%",
              overflowY: "auto",
              padding: 28,
              background: "var(--background, #fff)",
              color: "var(--foreground, #111827)",
              boxShadow: "-10px 0 35px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <div style={{ ...muted, marginBottom: 8 }}>Service details</div>
                <h2 style={{ fontSize: 23, fontWeight: 750, margin: 0 }}>
                  {selected.service}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={buttonStyle}
                aria-label="Close details"
              >
                Close
              </button>
            </div>

            <div
              style={{
                marginTop: 25,
                padding: 20,
                borderRadius: 13,
                background: "var(--muted, #f8fafc)",
                border: "1px solid var(--border, #e5e7eb)",
              }}
            >
              <div style={muted}>Tracked cost</div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  marginTop: 7,
                  letterSpacing: -1,
                }}
              >
                {money(selected.cost)}
              </div>
              <div style={{ ...muted, marginTop: 5 }}>
                Previous sample cost: {money(selected.previousCost)}
              </div>
            </div>

            <div style={{ marginTop: 26 }}>
              {[
                ["Category", selected.category],
                ["Provider", selected.provider],
                ["Requests", selected.requests.toLocaleString()],
                ["Tokens processed", selected.tokens.toLocaleString()],
                ["Current status", selected.status],
                [
                  "Cost per request",
                  money(
                    selected.requests
                      ? selected.cost / selected.requests
                      : 0
                  ),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "15px 0",
                    borderBottom: "1px solid var(--border, #e5e7eb)",
                    fontSize: 13,
                  }}
                >
                  <span style={muted}>{label}</span>
                  <span style={{ fontWeight: 650, textAlign: "right" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ ...muted, lineHeight: 1.7, marginTop: 22 }}>
              These details are based on the sample dataset. Connect the
              relevant usage and billing APIs to display verified costs.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
