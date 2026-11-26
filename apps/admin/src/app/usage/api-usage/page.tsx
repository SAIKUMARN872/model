
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Code2,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  Zap,
} from "lucide-react";

type ApiRecord = {
  id: string;
  key: string;
  organization: string;
  endpoint: string;
  method: "POST" | "GET" | "DELETE";
  requests: number;
  success: number;
  errors: number;
  latency: number;
  tokens: number;
  cost: number;
  status: "Healthy" | "Degraded" | "Disabled";
  lastUsed: string;
};

const initialRecords: ApiRecord[] = [
  {
    id: "api_001",
    key: "mn_prod_••••8F2A",
    organization: "Acme Technologies",
    endpoint: "/v1/chat/completions",
    method: "POST",
    requests: 42850,
    success: 42482,
    errors: 368,
    latency: 428,
    tokens: 12840000,
    cost: 382.45,
    status: "Healthy",
    lastUsed: "Just now",
  },
  {
    id: "api_002",
    key: "mn_prod_••••3B91",
    organization: "Nova Analytics",
    endpoint: "/v1/responses",
    method: "POST",
    requests: 32680,
    success: 32418,
    errors: 262,
    latency: 512,
    tokens: 9460000,
    cost: 296.8,
    status: "Healthy",
    lastUsed: "1 minute ago",
  },
  {
    id: "api_003",
    key: "mn_prod_••••C710",
    organization: "Vertex Systems",
    endpoint: "/v1/embeddings",
    method: "POST",
    requests: 24860,
    success: 24220,
    errors: 640,
    latency: 890,
    tokens: 5820000,
    cost: 124.65,
    status: "Degraded",
    lastUsed: "3 minutes ago",
  },
  {
    id: "api_004",
    key: "mn_prod_••••92D4",
    organization: "Summit Cloud",
    endpoint: "/v1/chat/completions",
    method: "POST",
    requests: 58240,
    success: 58018,
    errors: 222,
    latency: 365,
    tokens: 18400000,
    cost: 548.2,
    status: "Healthy",
    lastUsed: "Just now",
  },
  {
    id: "api_005",
    key: "mn_test_••••4A62",
    organization: "BrightPath Labs",
    endpoint: "/v1/models",
    method: "GET",
    requests: 8640,
    success: 8520,
    errors: 120,
    latency: 182,
    tokens: 0,
    cost: 0,
    status: "Healthy",
    lastUsed: "12 minutes ago",
  },
  {
    id: "api_006",
    key: "mn_prod_••••E15B",
    organization: "Orbit Digital",
    endpoint: "/v1/responses",
    method: "POST",
    requests: 18420,
    success: 17940,
    errors: 480,
    latency: 735,
    tokens: 6240000,
    cost: 214.9,
    status: "Degraded",
    lastUsed: "7 minutes ago",
  },
  {
    id: "api_007",
    key: "mn_test_••••7D30",
    organization: "Pioneer AI",
    endpoint: "/v1/chat/completions",
    method: "POST",
    requests: 4280,
    success: 4214,
    errors: 66,
    latency: 324,
    tokens: 980000,
    cost: 28.4,
    status: "Disabled",
    lastUsed: "2 days ago",
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

export default function ApiUsagePage() {
  const [records] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [methodFilter, setMethodFilter] = useState("All methods");
  const [endpointFilter, setEndpointFilter] = useState("All endpoints");
  const [period, setPeriod] = useState("Last 30 days");
  const [selected, setSelected] = useState<ApiRecord | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.organization.toLowerCase().includes(query) ||
        record.endpoint.toLowerCase().includes(query) ||
        record.key.toLowerCase().includes(query) ||
        record.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || record.status === statusFilter;
      const matchesMethod =
        methodFilter === "All methods" || record.method === methodFilter;
      const matchesEndpoint =
        endpointFilter === "All endpoints" ||
        record.endpoint === endpointFilter;

      return (
        matchesSearch && matchesStatus && matchesMethod && matchesEndpoint
      );
    });
  }, [records, search, statusFilter, methodFilter, endpointFilter]);

  const totals = useMemo(
    () => ({
      requests: filtered.reduce((sum, record) => sum + record.requests, 0),
      success: filtered.reduce((sum, record) => sum + record.success, 0),
      errors: filtered.reduce((sum, record) => sum + record.errors, 0),
      tokens: filtered.reduce((sum, record) => sum + record.tokens, 0),
      cost: filtered.reduce((sum, record) => sum + record.cost, 0),
      avgLatency: filtered.length
        ? Math.round(
            filtered.reduce(
              (sum, record) => sum + record.latency * record.requests,
              0
            ) /
              Math.max(
                1,
                filtered.reduce((sum, record) => sum + record.requests, 0)
              )
          )
        : 0,
    }),
    [filtered]
  );

  const successRate = totals.requests
    ? ((totals.success / totals.requests) * 100).toFixed(2)
    : "0.00";

  const exportCsv = () => {
    const headers = [
      "ID",
      "API Key",
      "Organization",
      "Endpoint",
      "Method",
      "Requests",
      "Successful",
      "Errors",
      "Latency ms",
      "Tokens",
      "Estimated Cost USD",
      "Status",
      "Last Used",
    ];

    const rows = filtered.map((record) => [
      record.id,
      record.key,
      record.organization,
      record.endpoint,
      record.method,
      record.requests,
      record.success,
      record.errors,
      record.latency,
      record.tokens,
      record.cost,
      record.status,
      record.lastUsed,
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
    anchor.download = "modelnow-api-usage.csv";
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

  const statusStyle = (status: ApiRecord["status"]) => {
    const styles = {
      Healthy: { background: "#dcfce7", color: "#166534" },
      Degraded: { background: "#ffedd5", color: "#9a3412" },
      Disabled: { background: "#fee2e2", color: "#991b1b" },
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
                gap: 8,
                alignItems: "center",
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
              <span style={{ color: palette.text }}>API Usage</span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              API Usage
            </h1>
            <p
              style={{
                color: palette.muted,
                fontSize: 14,
                lineHeight: 1.6,
                margin: "9px 0 0",
                maxWidth: 660,
              }}
            >
              Monitor API requests, endpoint performance, error rates, token
              consumption, and estimated API costs.
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
                color: "#fff",
                background: palette.blue,
                borderColor: palette.blue,
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
              marginBottom: 18,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: 9,
              padding: 12,
              fontSize: 12,
            }}
          >
            Demo data refreshed. Connect the API telemetry backend to retrieve
            live request metrics.
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
              label: "Total API Requests",
              value: number(totals.requests),
              note: `Period: ${period}`,
              icon: Activity,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              note: `${number(totals.success)} successful requests`,
              icon: CheckCircle2,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Failed Requests",
              value: number(totals.errors),
              note: "Errors in selected records",
              icon: ShieldAlert,
              color: "#b91c1c",
              bg: "#fee2e2",
            },
            {
              label: "Average Latency",
              value: `${totals.avgLatency} ms`,
              note: "Weighted sample estimate",
              icon: Clock3,
              color: "#7c3aed",
              bg: "#f3e8ff",
            },
            {
              label: "Tokens Processed",
              value: number(totals.tokens),
              note: "Across selected API records",
              icon: Zap,
              color: "#c2410c",
              bg: "#ffedd5",
            },
            {
              label: "Estimated API Cost",
              value: money(totals.cost),
              note: "Illustrative USD estimate",
              icon: Code2,
              color: "#0369a1",
              bg: "#e0f2fe",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <article key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ color: palette.muted, fontSize: 12 }}>
                    {metric.label}
                  </span>
                  <span
                    style={{
                      width: 35,
                      height: 35,
                      display: "grid",
                      placeItems: "center",
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
          <div style={cardStyle}>
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
                  Request health
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: palette.muted,
                    fontSize: 11,
                  }}
                >
                  Successful requests versus errors
                </p>
              </div>
              <Activity size={19} color={palette.blue} />
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 750,
                marginTop: 25,
                letterSpacing: "-1px",
              }}
            >
              {successRate}%
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 10,
                background: "#fee2e2",
                overflow: "hidden",
                marginTop: 14,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Number(successRate)}%`,
                  background: "#16a34a",
                  borderRadius: 10,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                fontSize: 11,
                color: palette.muted,
                gap: 10,
              }}
            >
              <span>
                <span style={{ color: "#15803d" }}>●</span> Success{" "}
                {number(totals.success)}
              </span>
              <span>
                <span style={{ color: "#b91c1c" }}>●</span> Errors{" "}
                {number(totals.errors)}
              </span>
            </div>
          </div>

          <div style={cardStyle}>
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
                  Requests by endpoint
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: palette.muted,
                    fontSize: 11,
                  }}
                >
                  Distribution across available endpoints
                </p>
              </div>
              <Code2 size={19} color={palette.blue} />
            </div>

            {[
              "/v1/chat/completions",
              "/v1/responses",
              "/v1/embeddings",
              "/v1/models",
            ].map((endpoint) => {
              const endpointTotal = filtered
                .filter((record) => record.endpoint === endpoint)
                .reduce((sum, record) => sum + record.requests, 0);

              const max = Math.max(
                ...filtered.map((record) => record.requests),
                1
              );

              const overallMax = Math.max(
                filtered.reduce((sum, record) => sum + record.requests, 0),
                1
              );

              return (
                <div key={endpoint} style={{ marginTop: 17 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      fontSize: 11,
                      marginBottom: 7,
                    }}
                  >
                    <code
                      style={{
                        color: "#374151",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {endpoint}
                    </code>
                    <strong>{number(endpointTotal)}</strong>
                  </div>
                  <div
                    style={{
                      height: 7,
                      background: "#eef0f5",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(
                          100,
                          (endpointTotal / overallMax) * 100
                        )}%`,
                        background: palette.blue,
                        borderRadius: 10,
                      }}
                    />
                  </div>
                  <span style={{ display: "none" }}>{max}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: `1px solid ${palette.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                API request records
              </h2>
              <p
                style={{
                  color: palette.muted,
                  fontSize: 12,
                  margin: "6px 0 0",
                }}
              >
                {filtered.length} records match your filters
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                flexWrap: "wrap",
                flex: "1 1 500px",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ position: "relative", width: "min(100%, 240px)" }}>
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
                  placeholder="Search key, endpoint, org..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 125 }}
                aria-label="Filter API status"
              >
                <option>All statuses</option>
                <option>Healthy</option>
                <option>Degraded</option>
                <option>Disabled</option>
              </select>
              <select
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 120 }}
                aria-label="Filter HTTP method"
              >
                <option>All methods</option>
                <option>POST</option>
                <option>GET</option>
                <option>DELETE</option>
              </select>
              <select
                value={endpointFilter}
                onChange={(event) => setEndpointFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 150 }}
                aria-label="Filter endpoint"
              >
                <option>All endpoints</option>
                <option>/v1/chat/completions</option>
                <option>/v1/responses</option>
                <option>/v1/embeddings</option>
                <option>/v1/models</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All statuses");
                  setMethodFilter("All methods");
                  setEndpointFilter("All endpoints");
                }}
                style={buttonStyle}
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
                    "API key",
                    "Organization",
                    "Method",
                    "Endpoint",
                    "Requests",
                    "Errors",
                    "Latency",
                    "Tokens",
                    "Est. cost",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 15px",
                        fontSize: 10,
                        color: palette.muted,
                        fontWeight: 750,
                        whiteSpace: "nowrap",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {record.key}
                      <div
                        style={{
                          color: palette.muted,
                          fontSize: 10,
                          fontWeight: 400,
                          marginTop: 4,
                        }}
                      >
                        {record.id}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {record.organization}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 10,
                          padding: "4px 7px",
                          borderRadius: 5,
                          background:
                            record.method === "GET" ? "#dbeafe" : "#f3e8ff",
                          color:
                            record.method === "GET" ? "#1d4ed8" : "#6b21a8",
                          fontWeight: 750,
                        }}
                      >
                        {record.method}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 10,
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {record.endpoint}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {number(record.requests)}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        color: record.errors > 300 ? "#b91c1c" : palette.text,
                      }}
                    >
                      {number(record.errors)}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {record.latency} ms
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                      }}
                    >
                      {number(record.tokens)}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      {money(record.cost)}
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <span style={statusStyle(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(record)}
                        style={{ ...buttonStyle, padding: "7px 9px" }}
                        aria-label={`View details for ${record.id}`}
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
                      colSpan={11}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: palette.muted,
                        fontSize: 13,
                      }}
                    >
                      No API records match your filters.
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
              flexWrap: "wrap",
              gap: 8,
              color: palette.muted,
              fontSize: 11,
            }}
          >
            <span>{filtered.length} records displayed</span>
            <span>CSV export uses the currently filtered records</span>
          </div>
        </section>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          <strong>Demo data:</strong> Request counts, API keys, latency,
          token usage, and estimated costs are illustrative. No real API keys
          or live request logs are accessed by this page. Connect your API
          gateway telemetry and billing backend for production reporting.
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
            ["Platform Usage", "/usage/platform-usage"],
            ["User Usage", "/usage/user-usage"],
            ["Organization Usage", "/usage/organization-usage"],
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

        <div style={{ display: "none" }}>
          <ArrowDownToLine />
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
            aria-labelledby="api-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
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
                <div
                  style={{
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 11,
                    background: "#eef2ff",
                    color: palette.blue,
                    marginBottom: 14,
                  }}
                >
                  <Code2 size={21} />
                </div>
                <h2
                  id="api-detail-title"
                  style={{ margin: 0, fontSize: 21, letterSpacing: "-0.5px" }}
                >
                  API request details
                </h2>
                <p
                  style={{
                    color: palette.muted,
                    fontSize: 12,
                    margin: "7px 0 0",
                  }}
                >
                  {selected.id} · {selected.organization}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close API details"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <code
                  style={{
                    fontSize: 12,
                    overflowWrap: "anywhere",
                  }}
                >
                  {selected.endpoint}
                </code>
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
                  ["API key", selected.key],
                  ["HTTP method", selected.method],
                  ["Total requests", number(selected.requests)],
                  ["Successful", number(selected.success)],
                  ["Failed", number(selected.errors)],
                  [
                    "Success rate",
                    `${(
                      (selected.success / Math.max(1, selected.requests)) *
                      100
                    ).toFixed(2)}%`,
                  ],
                  ["Average latency", `${selected.latency} ms`],
                  ["Tokens", number(selected.tokens)],
                  ["Estimated cost", money(selected.cost)],
                  ["Last used", selected.lastUsed],
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
                        fontSize: 10,
                        color: palette.muted,
                        marginBottom: 7,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
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
                style={{
                  ...buttonStyle,
                  color: "#fff",
                  background: palette.blue,
                  borderColor: palette.blue,
                }}
                onClick={() => setSelected(null)}
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
