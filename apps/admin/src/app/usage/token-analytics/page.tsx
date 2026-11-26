
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Coins,
  Download,
  Filter,
  Gauge,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

type TokenRecord = {
  id: string;
  model: string;
  provider: string;
  organization: string;
  user: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  requests: number;
  cost: number;
  date: string;
  status: "Completed" | "Processing" | "Failed";
};

const initialRecords: TokenRecord[] = [
  {
    id: "tok_1001",
    model: "GPT-5",
    provider: "OpenAI",
    organization: "Acme Corporation",
    user: "alex@acme.com",
    inputTokens: 1250000,
    outputTokens: 680000,
    cachedTokens: 210000,
    requests: 8400,
    cost: 128.5,
    date: "2026-11-04",
    status: "Completed",
  },
  {
    id: "tok_1002",
    model: "Claude Sonnet",
    provider: "Anthropic",
    organization: "Northstar AI",
    user: "maya@northstar.ai",
    inputTokens: 980000,
    outputTokens: 540000,
    cachedTokens: 185000,
    requests: 6200,
    cost: 156.8,
    date: "2026-11-04",
    status: "Completed",
  },
  {
    id: "tok_1003",
    model: "Gemini Pro",
    provider: "Google AI",
    organization: "Vertex Labs",
    user: "sam@vertexlabs.io",
    inputTokens: 870000,
    outputTokens: 390000,
    cachedTokens: 95000,
    requests: 5100,
    cost: 92.4,
    date: "2026-11-03",
    status: "Completed",
  },
  {
    id: "tok_1004",
    model: "Llama 3.3",
    provider: "Meta Llama",
    organization: "Acme Corporation",
    user: "jordan@acme.com",
    inputTokens: 740000,
    outputTokens: 460000,
    cachedTokens: 72000,
    requests: 4300,
    cost: 24.6,
    date: "2026-11-03",
    status: "Completed",
  },
  {
    id: "tok_1005",
    model: "GPT-4.1 Mini",
    provider: "OpenAI",
    organization: "BrightPath",
    user: "lee@brightpath.com",
    inputTokens: 630000,
    outputTokens: 280000,
    cachedTokens: 88000,
    requests: 3800,
    cost: 18.9,
    date: "2026-11-02",
    status: "Completed",
  },
  {
    id: "tok_1006",
    model: "Claude Haiku",
    provider: "Anthropic",
    organization: "Northstar AI",
    user: "maya@northstar.ai",
    inputTokens: 520000,
    outputTokens: 220000,
    cachedTokens: 61000,
    requests: 2900,
    cost: 21.7,
    date: "2026-11-02",
    status: "Processing",
  },
  {
    id: "tok_1007",
    model: "Gemini Flash",
    provider: "Google AI",
    organization: "Vertex Labs",
    user: "sam@vertexlabs.io",
    inputTokens: 460000,
    outputTokens: 195000,
    cachedTokens: 49000,
    requests: 2600,
    cost: 12.3,
    date: "2026-11-01",
    status: "Completed",
  },
  {
    id: "tok_1008",
    model: "Mistral Large",
    provider: "Mistral AI",
    organization: "BrightPath",
    user: "lee@brightpath.com",
    inputTokens: 310000,
    outputTokens: 160000,
    cachedTokens: 32000,
    requests: 1800,
    cost: 32.5,
    date: "2026-11-01",
    status: "Failed",
  },
  {
    id: "tok_1009",
    model: "GPT-5",
    provider: "OpenAI",
    organization: "Vertex Labs",
    user: "sam@vertexlabs.io",
    inputTokens: 1120000,
    outputTokens: 590000,
    cachedTokens: 198000,
    requests: 7600,
    cost: 116.2,
    date: "2026-10-31",
    status: "Completed",
  },
  {
    id: "tok_1010",
    model: "Claude Sonnet",
    provider: "Anthropic",
    organization: "Acme Corporation",
    user: "alex@acme.com",
    inputTokens: 820000,
    outputTokens: 410000,
    cachedTokens: 143000,
    requests: 4900,
    cost: 112.4,
    date: "2026-10-30",
    status: "Completed",
  },
];

const colors = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  blue: "#315fea",
};

const number = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export default function TokenAnalyticsPage() {
  const [records] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [modelFilter, setModelFilter] = useState("All models");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [period, setPeriod] = useState("Last 7 days");
  const [sortBy, setSortBy] = useState("total");
  const [selected, setSelected] = useState<TokenRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((item) => {
        const matchesSearch =
          !query ||
          item.id.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query) ||
          item.provider.toLowerCase().includes(query) ||
          item.organization.toLowerCase().includes(query) ||
          item.user.toLowerCase().includes(query);

        const matchesProvider =
          providerFilter === "All providers" ||
          item.provider === providerFilter;

        const matchesModel =
          modelFilter === "All models" || item.model === modelFilter;

        const matchesStatus =
          statusFilter === "All statuses" || item.status === statusFilter;

        return (
          matchesSearch && matchesProvider && matchesModel && matchesStatus
        );
      })
      .sort((a, b) => {
        if (sortBy === "input") return b.inputTokens - a.inputTokens;
        if (sortBy === "output") return b.outputTokens - a.outputTokens;
        if (sortBy === "cached") return b.cachedTokens - a.cachedTokens;
        if (sortBy === "cost") return b.cost - a.cost;
        if (sortBy === "requests") return b.requests - a.requests;
        return (
          b.inputTokens +
          b.outputTokens -
          (a.inputTokens + a.outputTokens)
        );
      });
  }, [
    records,
    search,
    providerFilter,
    modelFilter,
    statusFilter,
    sortBy,
  ]);

  const totals = useMemo(() => {
    const input = filtered.reduce((sum, item) => sum + item.inputTokens, 0);
    const output = filtered.reduce((sum, item) => sum + item.outputTokens, 0);
    const cached = filtered.reduce((sum, item) => sum + item.cachedTokens, 0);
    const requests = filtered.reduce((sum, item) => sum + item.requests, 0);
    const cost = filtered.reduce((sum, item) => sum + item.cost, 0);

    return {
      input,
      output,
      cached,
      requests,
      cost,
      total: input + output,
      cacheRate: input ? (cached / input) * 100 : 0,
      completed: filtered.filter((item) => item.status === "Completed").length,
    };
  }, [filtered]);

  const providerUsage = useMemo(() => {
    const groups: Record<
      string,
      { provider: string; input: number; output: number; cost: number }
    > = {};

    filtered.forEach((item) => {
      if (!groups[item.provider]) {
        groups[item.provider] = {
          provider: item.provider,
          input: 0,
          output: 0,
          cost: 0,
        };
      }

      groups[item.provider].input += item.inputTokens;
      groups[item.provider].output += item.outputTokens;
      groups[item.provider].cost += item.cost;
    });

    return Object.values(groups).sort(
      (a, b) => b.input + b.output - (a.input + a.output)
    );
  }, [filtered]);

  const modelUsage = useMemo(() => {
    const groups: Record<string, { model: string; tokens: number; cost: number }> =
      {};

    filtered.forEach((item) => {
      if (!groups[item.model]) {
        groups[item.model] = { model: item.model, tokens: 0, cost: 0 };
      }
      groups[item.model].tokens += item.inputTokens + item.outputTokens;
      groups[item.model].cost += item.cost;
    });

    return Object.values(groups).sort((a, b) => b.tokens - a.tokens);
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      "Record ID",
      "Model",
      "Provider",
      "Organization",
      "User",
      "Input Tokens",
      "Output Tokens",
      "Cached Tokens",
      "Total Tokens",
      "Requests",
      "Estimated Cost USD",
      "Date",
      "Status",
    ];

    const rows = filtered.map((item) => [
      item.id,
      item.model,
      item.provider,
      item.organization,
      item.user,
      item.inputTokens,
      item.outputTokens,
      item.cachedTokens,
      item.inputTokens + item.outputTokens,
      item.requests,
      item.cost,
      item.date,
      item.status,
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
    anchor.download = "modelnow-token-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    border: `1px solid ${colors.border}`,
    borderRadius: 9,
    background: "#fff",
    color: colors.text,
    fontSize: 12,
    outline: "none",
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 13px",
    border: `1px solid ${colors.border}`,
    borderRadius: 9,
    background: "#fff",
    color: colors.text,
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  } as const;

  const statusStyle = (status: TokenRecord["status"]) => {
    const style = {
      Completed: { background: "#dcfce7", color: "#166534" },
      Processing: { background: "#dbeafe", color: "#1d4ed8" },
      Failed: { background: "#fee2e2", color: "#991b1b" },
    };

    return {
      display: "inline-block",
      padding: "4px 9px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 750,
      whiteSpace: "nowrap" as const,
      ...style[status],
    };
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px clamp(16px, 3vw, 36px)",
        background: colors.bg,
        color: colors.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
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
                color: colors.muted,
                marginBottom: 12,
              }}
            >
              <Link
                href="/usage/overview"
                style={{ color: colors.muted, textDecoration: "none" }}
              >
                Usage & Analytics
              </Link>
              <span>/</span>
              <span style={{ color: colors.text }}>Token Analytics</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              Token Analytics
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 700,
              }}
            >
              Track input and output tokens, cached context, model consumption,
              and estimated AI spending across your platform.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 145 }}
              aria-label="Analytics period"
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
                background: colors.blue,
                borderColor: colors.blue,
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
            Demo data refreshed. Connect your usage API for live token metrics.
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
              label: "Total Tokens",
              value: number(totals.total),
              note: "Input + output tokens",
              icon: Zap,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "Input Tokens",
              value: number(totals.input),
              note: "Prompt and context usage",
              icon: Activity,
              color: "#0369a1",
              bg: "#e0f2fe",
            },
            {
              label: "Output Tokens",
              value: number(totals.output),
              note: "Generated response tokens",
              icon: Sparkles,
              color: "#7c3aed",
              bg: "#f3e8ff",
            },
            {
              label: "Cached Tokens",
              value: number(totals.cached),
              note: "Reported cached input tokens",
              icon: CheckCircle2,
              color: "#0f766e",
              bg: "#ccfbf1",
            },
            {
              label: "Estimated Cost",
              value: money(totals.cost),
              note: "Illustrative USD estimate",
              icon: Coins,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Total Requests",
              value: number(totals.requests),
              note: `${totals.completed} completed records`,
              icon: BarChart3,
              color: "#c2410c",
              bg: "#ffedd5",
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
                  <span style={{ fontSize: 12, color: colors.muted }}>
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
                    fontSize: 11,
                    color: colors.muted,
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
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Input vs output tokens
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: colors.muted,
                    fontSize: 11,
                  }}
                >
                  Token distribution by provider
                </p>
              </div>
              <TrendingUp size={19} color={colors.blue} />
            </div>

            {providerUsage.map((provider) => {
              const total = provider.input + provider.output || 1;
              const inputPercent = (provider.input / total) * 100;

              return (
                <div key={provider.provider} style={{ marginTop: 19 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 11,
                      marginBottom: 8,
                    }}
                  >
                    <strong>{provider.provider}</strong>
                    <span>{number(total)} tokens</span>
                  </div>
                  <div
                    style={{
                      height: 9,
                      borderRadius: 10,
                      overflow: "hidden",
                      display: "flex",
                      background: "#eef0f5",
                    }}
                  >
                    <div
                      style={{
                        width: `${inputPercent}%`,
                        background: colors.blue,
                      }}
                    />
                    <div
                      style={{
                        width: `${100 - inputPercent}%`,
                        background: "#a78bfa",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 7,
                      color: colors.muted,
                      fontSize: 10,
                    }}
                  >
                    <span>Input {number(provider.input)}</span>
                    <span>Output {number(provider.output)}</span>
                  </div>
                </div>
              );
            })}

            {providerUsage.length === 0 && (
              <p style={{ fontSize: 12, color: colors.muted }}>
                No matching token records.
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                marginTop: 20,
                fontSize: 11,
                color: colors.muted,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    background: colors.blue,
                  }}
                />
                Input
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    background: "#a78bfa",
                  }}
                />
                Output
              </span>
            </div>
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Token usage by model
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: colors.muted,
                    fontSize: 11,
                  }}
                >
                  Highest consumption models
                </p>
              </div>
              <Gauge size={19} color="#7c3aed" />
            </div>

            {modelUsage.slice(0, 6).map((model) => {
              const max = Math.max(
                ...modelUsage.map((item) => item.tokens),
                1
              );

              return (
                <div key={model.model} style={{ marginTop: 17 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 11,
                      marginBottom: 7,
                    }}
                  >
                    <span>{model.model}</span>
                    <strong>{number(model.tokens)}</strong>
                  </div>
                  <div
                    style={{
                      height: 7,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#eef0f5",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(model.tokens / max) * 100}%`,
                        background: "#8b5cf6",
                        borderRadius: 10,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: 5,
                      color: colors.muted,
                      fontSize: 10,
                    }}
                  >
                    Estimated cost: {money(model.cost)}
                  </div>
                </div>
              );
            })}

            {modelUsage.length === 0 && (
              <p style={{ fontSize: 12, color: colors.muted }}>
                No matching token records.
              </p>
            )}
          </article>
        </section>

        <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: 20,
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Token usage records
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: colors.muted,
                  fontSize: 12,
                }}
              >
                Detailed model consumption and estimated cost records
              </p>
            </div>

            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "min(100%, 235px)" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 12,
                    color: colors.muted,
                  }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search model, user, org..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>
              <button
                type="button"
                style={buttonStyle}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={14} />
                Filters
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                onClick={exportCsv}
                style={buttonStyle}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                padding: 18,
                background: "#fafbff",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <label style={{ fontSize: 11, color: colors.muted }}>
                Provider
                <select
                  value={providerFilter}
                  onChange={(event) => setProviderFilter(event.target.value)}
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option>All providers</option>
                  <option>OpenAI</option>
                  <option>Anthropic</option>
                  <option>Google AI</option>
                  <option>Meta Llama</option>
                  <option>Mistral AI</option>
                </select>
              </label>

              <label style={{ fontSize: 11, color: colors.muted }}>
                Model
                <select
                  value={modelFilter}
                  onChange={(event) => setModelFilter(event.target.value)}
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option>All models</option>
                  {[...new Set(records.map((item) => item.model))].map(
                    (model) => (
                      <option key={model}>{model}</option>
                    )
                  )}
                </select>
              </label>

              <label style={{ fontSize: 11, color: colors.muted }}>
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option>All statuses</option>
                  <option>Completed</option>
                  <option>Processing</option>
                  <option>Failed</option>
                </select>
              </label>

              <label style={{ fontSize: 11, color: colors.muted }}>
                Sort records
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option value="total">Most total tokens</option>
                  <option value="input">Most input tokens</option>
                  <option value="output">Most output tokens</option>
                  <option value="cached">Most cached tokens</option>
                  <option value="cost">Highest cost</option>
                  <option value="requests">Most requests</option>
                </select>
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    setProviderFilter("All providers");
                    setModelFilter("All models");
                    setStatusFilter("All statuses");
                    setSortBy("total");
                    setSearch("");
                  }}
                >
                  Reset filters
                </button>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: colors.blue,
                    color: "#fff",
                    borderColor: colors.blue,
                  }}
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1120,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Record / Model",
                    "Provider",
                    "Organization",
                    "Input tokens",
                    "Output tokens",
                    "Cached",
                    "Total tokens",
                    "Requests",
                    "Est. cost",
                    "Date",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        color: colors.muted,
                        fontSize: 10,
                        fontWeight: 750,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {item.model}
                      </div>
                      <div
                        style={{
                          color: colors.muted,
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {item.id}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.provider}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.organization}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {number(item.inputTokens)}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {number(item.outputTokens)}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {number(item.cachedTokens)}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {number(item.inputTokens + item.outputTokens)}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {number(item.requests)}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {money(item.cost)}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.date}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={statusStyle(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        style={{ ...buttonStyle, padding: "7px 9px" }}
                      >
                        <Activity size={13} />
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
                        padding: 40,
                        textAlign: "center",
                        color: colors.muted,
                        fontSize: 13,
                      }}
                    >
                      No token records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "13px 18px",
              borderTop: `1px solid ${colors.border}`,
              color: colors.muted,
              fontSize: 11,
            }}
          >
            <span>{filtered.length} records displayed</span>
            <span>
              {number(totals.total)} tokens · {money(totals.cost)} estimated
            </span>
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
          <strong>Demo data:</strong> Token counts, request volumes, cached
          tokens, dates, and costs are illustrative examples. The reporting
          period changes the displayed selection only; connect your gateway
          telemetry and provider billing data for real historical analytics.
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
            ["AI Provider Usage", "/usage/ai-provider-usage"],
            ["Credit Analytics", "/usage/credit-analytics"],
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
                border: `1px solid ${colors.border}`,
                background: "#fff",
                color: colors.text,
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
            aria-labelledby="token-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              padding: 24,
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
                    display: "grid",
                    placeItems: "center",
                    width: 43,
                    height: 43,
                    borderRadius: 11,
                    background: "#eef2ff",
                    color: colors.blue,
                    marginBottom: 14,
                  }}
                >
                  <Zap size={21} />
                </span>
                <h2
                  id="token-detail-title"
                  style={{ margin: 0, fontSize: 22, letterSpacing: "-0.5px" }}
                >
                  {selected.model}
                </h2>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: colors.muted,
                    fontSize: 12,
                  }}
                >
                  {selected.id} · {selected.provider}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close token details"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ marginTop: 18, marginBottom: 16 }}>
              <span style={statusStyle(selected.status)}>{selected.status}</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {[
                ["Provider", selected.provider],
                ["Organization", selected.organization],
                ["User", selected.user],
                ["Date", selected.date],
                ["Input tokens", number(selected.inputTokens)],
                ["Output tokens", number(selected.outputTokens)],
                ["Total tokens", number(selected.inputTokens + selected.outputTokens)],
                ["Cached tokens", number(selected.cachedTokens)],
                ["Requests", number(selected.requests)],
                ["Estimated cost", money(selected.cost)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: 13,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: 10,
                      marginBottom: 7,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 750,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
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
                  background: colors.blue,
                  borderColor: colors.blue,
                  color: "#fff",
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
