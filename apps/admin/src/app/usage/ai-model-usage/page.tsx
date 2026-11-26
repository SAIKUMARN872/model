
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Download,
  Eye,
  Filter,
  Gauge,
  RefreshCw,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

type ModelRecord = {
  id: string;
  name: string;
  provider: string;
  family: string;
  requests: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number;
  successRate: number;
  status: "Operational" | "Degraded" | "Unavailable";
  contextWindow: string;
};

const initialModels: ModelRecord[] = [
  {
    id: "mdl_001",
    name: "GPT-5",
    provider: "OpenAI",
    family: "Reasoning",
    requests: 186420,
    tokens: 42800000,
    inputTokens: 27600000,
    outputTokens: 15200000,
    cost: 1284.65,
    latency: 642,
    successRate: 99.8,
    status: "Operational",
    contextWindow: "400K",
  },
  {
    id: "mdl_002",
    name: "Claude Sonnet",
    provider: "Anthropic",
    family: "Reasoning",
    requests: 142850,
    tokens: 36200000,
    inputTokens: 22400000,
    outputTokens: 13800000,
    cost: 984.2,
    latency: 718,
    successRate: 99.6,
    status: "Operational",
    contextWindow: "200K",
  },
  {
    id: "mdl_003",
    name: "Gemini Pro",
    provider: "Google",
    family: "Multimodal",
    requests: 112680,
    tokens: 28400000,
    inputTokens: 18500000,
    outputTokens: 9900000,
    cost: 712.4,
    latency: 584,
    successRate: 99.9,
    status: "Operational",
    contextWindow: "1M",
  },
  {
    id: "mdl_004",
    name: "Llama 3.3",
    provider: "Meta",
    family: "Open source",
    requests: 98520,
    tokens: 24600000,
    inputTokens: 16400000,
    outputTokens: 8200000,
    cost: 246.8,
    latency: 432,
    successRate: 99.4,
    status: "Operational",
    contextWindow: "128K",
  },
  {
    id: "mdl_005",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    family: "Efficient",
    requests: 84620,
    tokens: 18200000,
    inputTokens: 12100000,
    outputTokens: 6100000,
    cost: 184.5,
    latency: 328,
    successRate: 99.7,
    status: "Operational",
    contextWindow: "1M",
  },
  {
    id: "mdl_006",
    name: "Claude Haiku",
    provider: "Anthropic",
    family: "Efficient",
    requests: 42860,
    tokens: 8400000,
    inputTokens: 5600000,
    outputTokens: 2800000,
    cost: 126.75,
    latency: 296,
    successRate: 98.7,
    status: "Degraded",
    contextWindow: "200K",
  },
  {
    id: "mdl_007",
    name: "Gemini Flash",
    provider: "Google",
    family: "Efficient",
    requests: 62840,
    tokens: 12400000,
    inputTokens: 8200000,
    outputTokens: 4200000,
    cost: 98.4,
    latency: 244,
    successRate: 99.8,
    status: "Operational",
    contextWindow: "1M",
  },
  {
    id: "mdl_008",
    name: "Mistral Large",
    provider: "Mistral AI",
    family: "Reasoning",
    requests: 18420,
    tokens: 4200000,
    inputTokens: 2800000,
    outputTokens: 1400000,
    cost: 86.35,
    latency: 810,
    successRate: 97.9,
    status: "Unavailable",
    contextWindow: "128K",
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

export default function AiModelUsagePage() {
  const [models] = useState(initialModels);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [familyFilter, setFamilyFilter] = useState("All families");
  const [period, setPeriod] = useState("Last 30 days");
  const [selected, setSelected] = useState<ModelRecord | null>(null);
  const [refreshed, setRefreshed] = useState(false);
  const [sortBy, setSortBy] = useState("requests");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = models.filter((model) => {
      const matchesSearch =
        !query ||
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query);

      const matchesProvider =
        providerFilter === "All providers" ||
        model.provider === providerFilter;

      const matchesStatus =
        statusFilter === "All statuses" || model.status === statusFilter;

      const matchesFamily =
        familyFilter === "All families" || model.family === familyFilter;

      return (
        matchesSearch && matchesProvider && matchesStatus && matchesFamily
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "cost") return b.cost - a.cost;
      if (sortBy === "tokens") return b.tokens - a.tokens;
      if (sortBy === "latency") return a.latency - b.latency;
      if (sortBy === "success") return b.successRate - a.successRate;
      return b.requests - a.requests;
    });
  }, [models, search, providerFilter, statusFilter, familyFilter, sortBy]);

  const totals = useMemo(
    () => ({
      requests: filtered.reduce((sum, model) => sum + model.requests, 0),
      tokens: filtered.reduce((sum, model) => sum + model.tokens, 0),
      cost: filtered.reduce((sum, model) => sum + model.cost, 0),
      weightedLatency: filtered.length
        ? Math.round(
            filtered.reduce(
              (sum, model) => sum + model.latency * model.requests,
              0
            ) /
              Math.max(
                1,
                filtered.reduce((sum, model) => sum + model.requests, 0)
              )
          )
        : 0,
      weightedSuccess: filtered.length
        ? filtered.reduce(
            (sum, model) => sum + model.successRate * model.requests,
            0
          ) /
          Math.max(
            1,
            filtered.reduce((sum, model) => sum + model.requests, 0)
          )
        : 0,
    }),
    [filtered]
  );

  const exportCsv = () => {
    const headers = [
      "Model ID",
      "Model",
      "Provider",
      "Family",
      "Requests",
      "Total Tokens",
      "Input Tokens",
      "Output Tokens",
      "Estimated Cost USD",
      "Average Latency ms",
      "Success Rate %",
      "Status",
      "Context Window",
    ];

    const rows = filtered.map((model) => [
      model.id,
      model.name,
      model.provider,
      model.family,
      model.requests,
      model.tokens,
      model.inputTokens,
      model.outputTokens,
      model.cost,
      model.latency,
      model.successRate,
      model.status,
      model.contextWindow,
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
    anchor.download = "modelnow-ai-model-usage.csv";
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
    fontWeight: 600,
    cursor: "pointer",
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

  const statusStyle = (status: ModelRecord["status"]) => {
    const styleMap = {
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
      ...styleMap[status],
    };
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
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
              <span style={{ color: colors.text }}>AI Model Usage</span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              AI Model Usage
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
              Analyze model requests, token consumption, performance, provider
              distribution, and estimated spending.
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
                background: colors.blue,
                color: "#fff",
                borderColor: colors.blue,
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
            Demo data refreshed. Connect the model telemetry backend to load
            live metrics.
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
              label: "Models in Results",
              value: String(filtered.length),
              note: "Models matching filters",
              icon: Sparkles,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "Total Requests",
              value: fmt(totals.requests),
              note: period,
              icon: Activity,
              color: "#7c3aed",
              bg: "#f3e8ff",
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
              label: "Estimated Model Cost",
              value: usd(totals.cost),
              note: "Illustrative USD estimate",
              icon: Coins,
              color: "#0369a1",
              bg: "#e0f2fe",
            },
            {
              label: "Average Latency",
              value: `${totals.weightedLatency} ms`,
              note: "Request-weighted estimate",
              icon: Gauge,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Success Rate",
              value: `${totals.weightedSuccess.toFixed(2)}%`,
              note: "Request-weighted sample rate",
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
                  <span style={{ fontSize: 12, color: colors.muted }}>
                    {metric.label}
                  </span>
                  <span
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 10,
                      background: metric.bg,
                      color: metric.color,
                      display: "grid",
                      placeItems: "center",
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
                    color: colors.muted,
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
                gap: 10,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Most-used models
                </h2>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    margin: "6px 0 0",
                  }}
                >
                  Request volume by model
                </p>
              </div>
              <BarChart3 size={19} color={colors.blue} />
            </div>

            {filtered.slice(0, 5).map((model) => {
              const max = Math.max(
                ...filtered.map((item) => item.requests),
                1
              );

              return (
                <div key={model.id} style={{ marginTop: 17 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 11,
                      marginBottom: 7,
                    }}
                  >
                    <span>
                      <strong>{model.name}</strong>
                      <span style={{ color: colors.muted }}>
                        {" "}
                        · {model.provider}
                      </span>
                    </span>
                    <strong>{fmt(model.requests)}</strong>
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
                        width: `${(model.requests / max) * 100}%`,
                        background: colors.blue,
                        borderRadius: 10,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p style={{ color: colors.muted, fontSize: 12, marginTop: 20 }}>
                No models match your filters.
              </p>
            )}
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Cost distribution
                </h2>
                <p
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    margin: "6px 0 0",
                  }}
                >
                  Estimated spend across models
                </p>
              </div>
              <Coins size={19} color="#15803d" />
            </div>

            {filtered
              .slice()
              .sort((a, b) => b.cost - a.cost)
              .slice(0, 5)
              .map((model) => {
                const max = Math.max(
                  ...filtered.map((item) => item.cost),
                  1
                );

                return (
                  <div key={model.id} style={{ marginTop: 17 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 11,
                        marginBottom: 7,
                      }}
                    >
                      <span>{model.name}</span>
                      <strong>{usd(model.cost)}</strong>
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
                          width: `${(model.cost / max) * 100}%`,
                          background: "#16a34a",
                          borderRadius: 10,
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
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Model usage records
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: colors.muted,
                  fontSize: 12,
                }}
              >
                {filtered.length} models found
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
              <div style={{ position: "relative", width: "min(100%, 220px)" }}>
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
                  placeholder="Search models or providers..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>

              <select
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                aria-label="Filter by provider"
              >
                <option>All providers</option>
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google</option>
                <option>Meta</option>
                <option>Mistral AI</option>
              </select>

              <select
                value={familyFilter}
                onChange={(event) => setFamilyFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                aria-label="Filter by model family"
              >
                <option>All families</option>
                <option>Reasoning</option>
                <option>Multimodal</option>
                <option>Open source</option>
                <option>Efficient</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                aria-label="Filter by model status"
              >
                <option>All statuses</option>
                <option>Operational</option>
                <option>Degraded</option>
                <option>Unavailable</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                aria-label="Sort models"
              >
                <option value="requests">Most requests</option>
                <option value="cost">Highest cost</option>
                <option value="tokens">Most tokens</option>
                <option value="latency">Lowest latency</option>
                <option value="success">Highest success rate</option>
              </select>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => {
                  setSearch("");
                  setProviderFilter("All providers");
                  setStatusFilter("All statuses");
                  setFamilyFilter("All families");
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
                minWidth: 1120,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Model",
                    "Provider",
                    "Family",
                    "Requests",
                    "Input tokens",
                    "Output tokens",
                    "Total tokens",
                    "Estimated cost",
                    "Latency",
                    "Success",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 10,
                        fontWeight: 750,
                        color: colors.muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((model) => (
                  <tr key={model.id}>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
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
                            display: "grid",
                            placeItems: "center",
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: "#eef2ff",
                            color: colors.blue,
                            flexShrink: 0,
                          }}
                        >
                          <Sparkles size={16} />
                        </span>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {model.name}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              color: colors.muted,
                              fontSize: 10,
                            }}
                          >
                            {model.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {model.provider}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {model.family}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {fmt(model.requests)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {fmt(model.inputTokens)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {fmt(model.outputTokens)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {fmt(model.tokens)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {usd(model.cost)}
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {model.latency} ms
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      {model.successRate}%
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={statusStyle(model.status)}>
                        {model.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(model)}
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
                        padding: 40,
                        textAlign: "center",
                        color: colors.muted,
                        fontSize: 13,
                      }}
                    >
                      No models match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "13px 18px",
              borderTop: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              color: colors.muted,
              fontSize: 11,
            }}
          >
            <span>{filtered.length} models displayed</span>
            <span>Export includes the current filters and sort order</span>
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
          <strong>Demo data:</strong> Model names, usage volumes, token counts,
          costs, latency, and availability are illustrative. The period
          selector changes the reporting label only. Connect provider and
          gateway telemetry for production analytics.
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
            ["API Usage", "/usage/api-usage"],
            ["Organization Usage", "/usage/organization-usage"],
            ["Provider Usage", "/usage/ai-provider-usage"],
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
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 550,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 24px 70px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
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
                    color: colors.blue,
                    marginBottom: 14,
                  }}
                >
                  <Sparkles size={21} />
                </span>
                <h2
                  id="model-detail-title"
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
                    color: colors.muted,
                    fontSize: 12,
                  }}
                >
                  {selected.provider} · {selected.family} · {selected.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close model details"
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
                  ["Requests", fmt(selected.requests)],
                  ["Total tokens", fmt(selected.tokens)],
                  ["Input tokens", fmt(selected.inputTokens)],
                  ["Output tokens", fmt(selected.outputTokens)],
                  ["Estimated cost", usd(selected.cost)],
                  ["Average latency", `${selected.latency} ms`],
                  ["Success rate", `${selected.successRate}%`],
                  ["Context window", selected.contextWindow],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: 10,
                      padding: 14,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: colors.muted,
                        marginBottom: 8,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
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
                  background: colors.blue,
                  color: "#fff",
                  borderColor: colors.blue,
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
