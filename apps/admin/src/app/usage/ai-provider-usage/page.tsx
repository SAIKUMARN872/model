
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  Coins,
  Download,
  Eye,
  Filter,
  Gauge,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  X,
  Zap,
} from "lucide-react";

type Provider = {
  id: string;
  name: string;
  category: string;
  models: number;
  requests: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number;
  successRate: number;
  status: "Operational" | "Degraded" | "Unavailable";
  region: string;
  uptime: number;
};

const initialProviders: Provider[] = [
  {
    id: "prv_001",
    name: "OpenAI",
    category: "Commercial API",
    models: 8,
    requests: 271040,
    tokens: 61000000,
    inputTokens: 39200000,
    outputTokens: 21800000,
    cost: 1469.15,
    latency: 428,
    successRate: 99.8,
    status: "Operational",
    region: "United States",
    uptime: 99.95,
  },
  {
    id: "prv_002",
    name: "Anthropic",
    category: "Commercial API",
    models: 5,
    requests: 185710,
    tokens: 44600000,
    inputTokens: 28000000,
    outputTokens: 16600000,
    cost: 1110.95,
    latency: 536,
    successRate: 99.6,
    status: "Operational",
    region: "United States",
    uptime: 99.91,
  },
  {
    id: "prv_003",
    name: "Google AI",
    category: "Commercial API",
    models: 6,
    requests: 175520,
    tokens: 40800000,
    inputTokens: 26700000,
    outputTokens: 14100000,
    cost: 810.8,
    latency: 386,
    successRate: 99.9,
    status: "Operational",
    region: "Global",
    uptime: 99.98,
  },
  {
    id: "prv_004",
    name: "Meta Llama",
    category: "Open source",
    models: 4,
    requests: 98520,
    tokens: 24600000,
    inputTokens: 16400000,
    outputTokens: 8200000,
    cost: 246.8,
    latency: 432,
    successRate: 99.4,
    status: "Operational",
    region: "Self-hosted",
    uptime: 99.72,
  },
  {
    id: "prv_005",
    name: "Mistral AI",
    category: "Commercial API",
    models: 3,
    requests: 18420,
    tokens: 4200000,
    inputTokens: 2800000,
    outputTokens: 1400000,
    cost: 86.35,
    latency: 810,
    successRate: 97.9,
    status: "Degraded",
    region: "Europe",
    uptime: 98.85,
  },
  {
    id: "prv_006",
    name: "ModelNow Hosted",
    category: "Managed inference",
    models: 6,
    requests: 62840,
    tokens: 14200000,
    inputTokens: 9400000,
    outputTokens: 4800000,
    cost: 164.2,
    latency: 244,
    successRate: 99.7,
    status: "Operational",
    region: "Asia Pacific",
    uptime: 99.87,
  },
  {
    id: "prv_007",
    name: "Custom Inference",
    category: "Self-hosted",
    models: 2,
    requests: 8420,
    tokens: 1800000,
    inputTokens: 1200000,
    outputTokens: 600000,
    cost: 42.6,
    latency: 920,
    successRate: 96.8,
    status: "Unavailable",
    region: "Private cloud",
    uptime: 96.2,
  },
];

const palette = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  blue: "#315fea",
};

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export default function AiProviderUsagePage() {
  const [providers] = useState(initialProviders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [period, setPeriod] = useState("Last 30 days");
  const [sortBy, setSortBy] = useState("requests");
  const [selected, setSelected] = useState<Provider | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = providers.filter((provider) => {
      const matchesSearch =
        !query ||
        provider.name.toLowerCase().includes(query) ||
        provider.id.toLowerCase().includes(query) ||
        provider.region.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || provider.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All categories" ||
        provider.category === categoryFilter;

      const matchesRegion =
        regionFilter === "All regions" || provider.region === regionFilter;

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesRegion
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "cost") return b.cost - a.cost;
      if (sortBy === "tokens") return b.tokens - a.tokens;
      if (sortBy === "latency") return a.latency - b.latency;
      if (sortBy === "success") return b.successRate - a.successRate;
      return b.requests - a.requests;
    });
  }, [
    providers,
    search,
    statusFilter,
    categoryFilter,
    regionFilter,
    sortBy,
  ]);

  const totals = useMemo(() => {
    const requests = filtered.reduce((sum, item) => sum + item.requests, 0);

    return {
      requests,
      tokens: filtered.reduce((sum, item) => sum + item.tokens, 0),
      cost: filtered.reduce((sum, item) => sum + item.cost, 0),
      models: filtered.reduce((sum, item) => sum + item.models, 0),
      avgLatency: requests
        ? Math.round(
            filtered.reduce(
              (sum, item) => sum + item.latency * item.requests,
              0
            ) / requests
          )
        : 0,
      avgSuccess: requests
        ? filtered.reduce(
            (sum, item) => sum + item.successRate * item.requests,
            0
          ) / requests
        : 0,
      healthy: filtered.filter((item) => item.status === "Operational").length,
    };
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      "Provider ID",
      "Provider",
      "Category",
      "Models",
      "Requests",
      "Total Tokens",
      "Input Tokens",
      "Output Tokens",
      "Estimated Cost USD",
      "Average Latency ms",
      "Success Rate %",
      "Status",
      "Region",
      "Uptime %",
    ];

    const rows = filtered.map((provider) => [
      provider.id,
      provider.name,
      provider.category,
      provider.models,
      provider.requests,
      provider.tokens,
      provider.inputTokens,
      provider.outputTokens,
      provider.cost,
      provider.latency,
      provider.successRate,
      provider.status,
      provider.region,
      provider.uptime,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-provider-usage.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: palette.card,
    border: `1px solid ${palette.border}`,
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  } as const;

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 13px",
    border: `1px solid ${palette.border}`,
    borderRadius: 9,
    background: "#fff",
    color: palette.text,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    border: `1px solid ${palette.border}`,
    borderRadius: 9,
    background: "#fff",
    color: palette.text,
    fontSize: 12,
    outline: "none",
  };

  const statusStyle = (status: Provider["status"]) => {
    const styles = {
      Operational: { background: "#dcfce7", color: "#166534" },
      Degraded: { background: "#ffedd5", color: "#9a3412" },
      Unavailable: { background: "#fee2e2", color: "#991b1b" },
    };

    return {
      display: "inline-block",
      padding: "4px 9px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 750,
      whiteSpace: "nowrap" as const,
      ...styles[status],
    };
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: palette.bg,
        color: palette.text,
        padding: "28px clamp(16px, 3vw, 36px)",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: palette.muted,
                marginBottom: 12,
              }}
            >
              <Link
                href="/usage/overview"
                style={{ color: palette.muted, textDecoration: "none" }}
              >
                Usage & Analytics
              </Link>
              <span>/</span>
              <span style={{ color: palette.text }}>AI Provider Usage</span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              AI Provider Usage
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: palette.muted,
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 700,
              }}
            >
              Compare provider request volume, reliability, latency, token
              consumption, and estimated costs across your AI infrastructure.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 140 }}
              aria-label="Reporting period"
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => setRefreshed(true)}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              style={{
                ...buttonStyle,
                background: palette.blue,
                borderColor: palette.blue,
                color: "#fff",
              }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </header>

        {refreshed && (
          <div
            style={{
              padding: 12,
              marginBottom: 18,
              borderRadius: 9,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
            }}
          >
            Demo data refreshed. Connect provider telemetry to retrieve live
            usage and health metrics.
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 15,
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Providers in Results",
              value: String(filtered.length),
              note: "Matching current filters",
              icon: Building2,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "Models Available",
              value: fmt(totals.models),
              note: "Across selected providers",
              icon: Server,
              color: "#7c3aed",
              bg: "#f3e8ff",
            },
            {
              label: "Total Requests",
              value: fmt(totals.requests),
              note: period,
              icon: Activity,
              color: "#0369a1",
              bg: "#e0f2fe",
            },
            {
              label: "Tokens Processed",
              value: fmt(totals.tokens),
              note: "Input and output tokens",
              icon: Zap,
              color: "#c2410c",
              bg: "#ffedd5",
            },
            {
              label: "Estimated Total Cost",
              value: usd(totals.cost),
              note: "Illustrative USD estimate",
              icon: Coins,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Weighted Success Rate",
              value: `${totals.avgSuccess.toFixed(2)}%`,
              note: `${totals.healthy} operational providers`,
              icon: CheckCircle2,
              color: "#0f766e",
              bg: "#ccfbf1",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <article key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: palette.muted, fontSize: 12 }}>
                    {metric.label}
                  </span>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 35,
                      height: 35,
                      borderRadius: 10,
                      background: metric.bg,
                      color: metric.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 17,
                    fontSize: "clamp(22px, 2vw, 28px)",
                    fontWeight: 750,
                    letterSpacing: "-0.7px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {metric.value}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    color: palette.muted,
                    fontSize: 11,
                  }}
                >
                  {metric.note}
                </div>
              </article>
            );
          })}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Provider request volume
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 11,
                    color: palette.muted,
                  }}
                >
                  Highest request counts
                </p>
              </div>
              <BarChart3Icon />
            </div>

            {filtered
              .slice()
              .sort((a, b) => b.requests - a.requests)
              .slice(0, 5)
              .map((provider) => {
                const max = Math.max(
                  ...filtered.map((item) => item.requests),
                  1
                );

                return (
                  <div key={provider.id} style={{ marginTop: 17 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 11,
                        marginBottom: 7,
                      }}
                    >
                      <strong>{provider.name}</strong>
                      <span>{fmt(provider.requests)}</span>
                    </div>
                    <div
                      style={{
                        height: 7,
                        borderRadius: 10,
                        background: "#eef0f5",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(provider.requests / max) * 100}%`,
                          borderRadius: 10,
                          background: palette.blue,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

            {filtered.length === 0 && (
              <p style={{ color: palette.muted, fontSize: 12, marginTop: 20 }}>
                No providers match your filters.
              </p>
            )}
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Cost by provider
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 11,
                    color: palette.muted,
                  }}
                >
                  Estimated provider spending
                </p>
              </div>
              <Coins size={19} color="#15803d" />
            </div>

            {filtered
              .slice()
              .sort((a, b) => b.cost - a.cost)
              .slice(0, 5)
              .map((provider) => {
                const max = Math.max(
                  ...filtered.map((item) => item.cost),
                  1
                );

                return (
                  <div key={provider.id} style={{ marginTop: 17 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 11,
                        marginBottom: 7,
                      }}
                    >
                      <span>{provider.name}</span>
                      <strong>{usd(provider.cost)}</strong>
                    </div>
                    <div
                      style={{
                        height: 7,
                        borderRadius: 10,
                        background: "#eef0f5",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(provider.cost / max) * 100}%`,
                          borderRadius: 10,
                          background: "#16a34a",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </article>
        </section>

        <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: 20,
              borderBottom: `1px solid ${palette.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Provider usage records
              </h2>
              <p
                style={{
                  color: palette.muted,
                  fontSize: 12,
                  margin: "6px 0 0",
                }}
              >
                {filtered.length} providers found
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
                flex: "1 1 500px",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ position: "relative", width: "min(100%, 230px)" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 12,
                    color: palette.muted,
                  }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search providers or regions..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 155 }}
                aria-label="Filter by provider category"
              >
                <option>All categories</option>
                <option>Commercial API</option>
                <option>Open source</option>
                <option>Managed inference</option>
                <option>Self-hosted</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 135 }}
                aria-label="Filter by provider status"
              >
                <option>All statuses</option>
                <option>Operational</option>
                <option>Degraded</option>
                <option>Unavailable</option>
              </select>

              <select
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 145 }}
                aria-label="Filter by region"
              >
                <option>All regions</option>
                <option>United States</option>
                <option>Global</option>
                <option>Self-hosted</option>
                <option>Europe</option>
                <option>Asia Pacific</option>
                <option>Private cloud</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                aria-label="Sort providers"
              >
                <option value="requests">Most requests</option>
                <option value="cost">Highest cost</option>
                <option value="tokens">Most tokens</option>
                <option value="latency">Lowest latency</option>
                <option value="success">Highest success</option>
              </select>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All statuses");
                  setCategoryFilter("All categories");
                  setRegionFilter("All regions");
                  setSortBy("requests");
                }}
              >
                <Filter size={14} />
                Reset
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1160,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Provider",
                    "Category",
                    "Models",
                    "Requests",
                    "Total tokens",
                    "Est. cost",
                    "Latency",
                    "Success",
                    "Uptime",
                    "Region",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 14px",
                        fontSize: 10,
                        fontWeight: 750,
                        color: palette.muted,
                        borderBottom: `1px solid ${palette.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((provider) => (
                  <tr key={provider.id}>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: "#eef2ff",
                            color: palette.blue,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Server size={16} />
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {provider.name}
                          </div>
                          <div
                            style={{
                              color: palette.muted,
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {provider.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {provider.category}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {provider.models}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {fmt(provider.requests)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {fmt(provider.tokens)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {usd(provider.cost)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {provider.latency} ms
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {provider.successRate}%
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {provider.uptime}%
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {provider.region}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <span style={statusStyle(provider.status)}>
                        {provider.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(provider)}
                        style={{ ...buttonStyle, padding: "7px 9px" }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: palette.muted,
                        fontSize: 13,
                      }}
                    >
                      No providers match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "13px 18px",
              borderTop: `1px solid ${palette.border}`,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              color: palette.muted,
              fontSize: 11,
            }}
          >
            <span>{filtered.length} providers displayed</span>
            <span>CSV export includes the filtered provider records</span>
          </div>
        </section>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#92400e",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          <strong>Demo data:</strong> Provider request counts, models, latency,
          uptime, token usage, and costs are illustrative. Provider health and
          regional details are not live monitoring results. Connect provider
          APIs, gateway telemetry, and billing records for production data.
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 20,
          }}
        >
          {[
            ["Usage Overview", "/usage/overview"],
            ["AI Model Usage", "/usage/ai-model-usage"],
            ["API Usage", "/usage/api-usage"],
            ["Token Analytics", "/usage/token-analytics"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: 9,
                border: `1px solid ${palette.border}`,
                background: "#fff",
                color: palette.text,
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {label}
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(17, 24, 39, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 550,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 70px rgba(0,0,0,0.2)",
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
                <span
                  style={{
                    width: 43,
                    height: 43,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 11,
                    background: "#eef2ff",
                    color: palette.blue,
                    marginBottom: 14,
                  }}
                >
                  <Server size={21} />
                </span>
                <h2
                  id="provider-detail-title"
                  style={{
                    margin: 0,
                    fontSize: 22,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: palette.muted,
                    fontSize: 12,
                  }}
                >
                  {selected.category} · {selected.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close provider details"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 15 }}>
                <span style={statusStyle(selected.status)}>
                  {selected.status}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Models", fmt(selected.models)],
                  ["Requests", fmt(selected.requests)],
                  ["Total tokens", fmt(selected.tokens)],
                  ["Input tokens", fmt(selected.inputTokens)],
                  ["Output tokens", fmt(selected.outputTokens)],
                  ["Estimated cost", usd(selected.cost)],
                  ["Average latency", `${selected.latency} ms`],
                  ["Success rate", `${selected.successRate}%`],
                  ["Uptime", `${selected.uptime}%`],
                  ["Region", selected.region],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      border: `1px solid ${palette.border}`,
                      borderRadius: 10,
                      padding: 13,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: palette.muted,
                        fontSize: 10,
                        marginBottom: 7,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 750,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  ...buttonStyle,
                  background: palette.blue,
                  color: "#fff",
                  borderColor: palette.blue,
                }}
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function BarChart3Icon() {
  return <Gauge size={19} color={palette.blue} />;
}
