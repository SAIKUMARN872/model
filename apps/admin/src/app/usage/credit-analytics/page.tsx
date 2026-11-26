
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Coins,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

type CreditRecord = {
  id: string;
  organization: string;
  user: string;
  type: "Purchase" | "Usage" | "Refund" | "Adjustment";
  description: string;
  amount: number;
  balance: number;
  date: string;
  status: "Completed" | "Pending" | "Failed";
};

const initialRecords: CreditRecord[] = [
  {
    id: "CR-1001",
    organization: "Acme Corporation",
    user: "alex@acme.com",
    type: "Purchase",
    description: "Monthly credit package",
    amount: 500,
    balance: 1250,
    date: "2026-11-04",
    status: "Completed",
  },
  {
    id: "CR-1002",
    organization: "Northstar AI",
    user: "maya@northstar.ai",
    type: "Usage",
    description: "AI model inference",
    amount: -86.5,
    balance: 913.5,
    date: "2026-11-04",
    status: "Completed",
  },
  {
    id: "CR-1003",
    organization: "Vertex Labs",
    user: "sam@vertexlabs.io",
    type: "Usage",
    description: "API and agent requests",
    amount: -124.75,
    balance: 675.25,
    date: "2026-11-03",
    status: "Completed",
  },
  {
    id: "CR-1004",
    organization: "BrightPath",
    user: "lee@brightpath.com",
    type: "Purchase",
    description: "Credit top-up",
    amount: 250,
    balance: 780,
    date: "2026-11-03",
    status: "Completed",
  },
  {
    id: "CR-1005",
    organization: "Acme Corporation",
    user: "jordan@acme.com",
    type: "Usage",
    description: "Browser automation usage",
    amount: -42.25,
    balance: 1207.75,
    date: "2026-11-02",
    status: "Completed",
  },
  {
    id: "CR-1006",
    organization: "Northstar AI",
    user: "maya@northstar.ai",
    type: "Refund",
    description: "Failed request credit return",
    amount: 12.5,
    balance: 926,
    date: "2026-11-02",
    status: "Completed",
  },
  {
    id: "CR-1007",
    organization: "Vertex Labs",
    user: "sam@vertexlabs.io",
    type: "Adjustment",
    description: "Promotional credits",
    amount: 50,
    balance: 800,
    date: "2026-11-01",
    status: "Pending",
  },
  {
    id: "CR-1008",
    organization: "BrightPath",
    user: "lee@brightpath.com",
    type: "Usage",
    description: "Model fine-tuning workload",
    amount: -95,
    balance: 685,
    date: "2026-11-01",
    status: "Completed",
  },
  {
    id: "CR-1009",
    organization: "Acme Corporation",
    user: "alex@acme.com",
    type: "Purchase",
    description: "Enterprise credit top-up",
    amount: 1000,
    balance: 2250,
    date: "2026-10-31",
    status: "Completed",
  },
  {
    id: "CR-1010",
    organization: "Northstar AI",
    user: "maya@northstar.ai",
    type: "Usage",
    description: "Knowledge Hub requests",
    amount: -64.2,
    balance: 861,
    date: "2026-10-30",
    status: "Failed",
  },
];

const C = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  blue: "#315fea",
};

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export default function CreditAnalyticsPage() {
  const [records] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [organizationFilter, setOrganizationFilter] = useState("All organizations");
  const [period, setPeriod] = useState("Last 7 days");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<CreditRecord | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.organization.toLowerCase().includes(query) ||
        record.user.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All types" || record.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" || record.status === statusFilter;

      const matchesOrganization =
        organizationFilter === "All organizations" ||
        record.organization === organizationFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesOrganization
      );
    });
  }, [records, search, typeFilter, statusFilter, organizationFilter]);

  const metrics = useMemo(() => {
    const completed = filtered.filter((record) => record.status === "Completed");
    const purchases = completed
      .filter((record) => record.type === "Purchase")
      .reduce((sum, record) => sum + record.amount, 0);
    const usage = completed
      .filter((record) => record.type === "Usage")
      .reduce((sum, record) => sum + Math.abs(record.amount), 0);
    const refunds = completed
      .filter((record) => record.type === "Refund")
      .reduce((sum, record) => sum + record.amount, 0);
    const adjustments = completed
      .filter((record) => record.type === "Adjustment")
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      purchases,
      usage,
      refunds,
      adjustments,
      net: purchases + refunds + adjustments - usage,
      pending: filtered.filter((record) => record.status === "Pending").length,
      failed: filtered.filter((record) => record.status === "Failed").length,
      count: filtered.length,
    };
  }, [filtered]);

  const organizations = useMemo(() => {
    const groups: Record<
      string,
      { name: string; purchased: number; used: number; balance: number }
    > = {};

    records.forEach((record) => {
      if (!groups[record.organization]) {
        groups[record.organization] = {
          name: record.organization,
          purchased: 0,
          used: 0,
          balance: 0,
        };
      }

      if (record.status === "Completed" && record.type === "Purchase") {
        groups[record.organization].purchased += record.amount;
      }

      if (record.status === "Completed" && record.type === "Usage") {
        groups[record.organization].used += Math.abs(record.amount);
      }

      groups[record.organization].balance = Math.max(
        groups[record.organization].balance,
        record.balance
      );
    });

    return Object.values(groups).sort((a, b) => b.used - a.used);
  }, [records]);

  const exportCsv = () => {
    const headers = [
      "Transaction ID",
      "Organization",
      "User",
      "Type",
      "Description",
      "Credit Change",
      "Recorded Balance",
      "Date",
      "Status",
    ];

    const rows = filtered.map((record) => [
      record.id,
      record.organization,
      record.user,
      record.type,
      record.description,
      record.amount,
      record.balance,
      record.date,
      record.status,
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
    anchor.download = "modelnow-credit-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    background: "#fff",
    color: C.text,
    fontSize: 12,
    outline: "none",
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 13px",
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    background: "#fff",
    color: C.text,
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  } as const;

  const statusStyle = (status: CreditRecord["status"]) => {
    const styles = {
      Completed: { background: "#dcfce7", color: "#166534" },
      Pending: { background: "#fef3c7", color: "#92400e" },
      Failed: { background: "#fee2e2", color: "#991b1b" },
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
        padding: "28px clamp(16px, 3vw, 36px)",
        background: C.bg,
        color: C.text,
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
                gap: 8,
                alignItems: "center",
                fontSize: 12,
                color: C.muted,
                marginBottom: 12,
              }}
            >
              <Link
                href="/usage/overview"
                style={{ color: C.muted, textDecoration: "none" }}
              >
                Usage & Analytics
              </Link>
              <span>/</span>
              <span style={{ color: C.text }}>Credit Analytics</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              Credit Analytics
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: C.muted,
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 700,
              }}
            >
              Monitor credit purchases, consumption, refunds, adjustments, and
              transaction activity across organizations.
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
                background: C.blue,
                color: "#fff",
                borderColor: C.blue,
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
            Demo records refreshed. Connect your billing and credit ledger API
            to load live transaction data.
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 15,
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Credits Purchased",
              value: money(metrics.purchases),
              note: "Completed purchase records",
              icon: Wallet,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "Credits Consumed",
              value: money(metrics.usage),
              note: "Completed usage records",
              icon: Activity,
              color: "#c2410c",
              bg: "#ffedd5",
            },
            {
              label: "Refunds",
              value: money(metrics.refunds),
              note: "Completed credit returns",
              icon: ArrowDownRight,
              color: "#0f766e",
              bg: "#ccfbf1",
            },
            {
              label: "Net Credit Movement",
              value: money(metrics.net),
              note: "Purchases + returns − usage",
              icon: TrendingUp,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Pending Transactions",
              value: String(metrics.pending),
              note: "Awaiting completion",
              icon: ShieldAlert,
              color: "#a16207",
              bg: "#fef3c7",
            },
            {
              label: "Transaction Records",
              value: String(metrics.count),
              note: `${metrics.failed} failed records`,
              icon: BarChart3,
              color: "#7c3aed",
              bg: "#f3e8ff",
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
                  <span style={{ fontSize: 12, color: C.muted }}>
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
                    fontSize: "clamp(21px, 2vw, 27px)",
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
                    color: C.muted,
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
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              Credit transaction breakdown
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                color: C.muted,
              }}
            >
              Distribution of completed credit activity
            </p>

            {[
              {
                label: "Purchases",
                amount: metrics.purchases,
                color: "#315fea",
              },
              {
                label: "Usage",
                amount: metrics.usage,
                color: "#f97316",
              },
              {
                label: "Refunds",
                amount: metrics.refunds,
                color: "#0d9488",
              },
              {
                label: "Adjustments",
                amount: metrics.adjustments,
                color: "#8b5cf6",
              },
            ].map((item) => {
              const max = Math.max(
                metrics.purchases,
                metrics.usage,
                metrics.refunds,
                metrics.adjustments,
                1
              );

              return (
                <div key={item.label} style={{ marginTop: 23 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span>{item.label}</span>
                    <strong>{money(item.amount)}</strong>
                  </div>
                  <div
                    style={{
                      height: 9,
                      background: "#eef0f5",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(item.amount / max) * 100}%`,
                        background: item.color,
                        borderRadius: 10,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: 22,
                padding: 13,
                borderRadius: 10,
                background: "#f9fafb",
                fontSize: 11,
                color: C.muted,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: C.text }}>Net movement:</strong>{" "}
              {money(metrics.net)} based on the currently filtered records.
            </div>
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Organization credit activity
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 11,
                    color: C.muted,
                  }}
                >
                  Recorded purchases and usage by organization
                </p>
              </div>
              <Users size={19} color={C.blue} />
            </div>

            {organizations.map((organization) => {
              const max = Math.max(
                ...organizations.map((item) => item.used),
                1
              );

              return (
                <div key={organization.name} style={{ marginTop: 21 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 11,
                      marginBottom: 7,
                    }}
                  >
                    <strong>{organization.name}</strong>
                    <span>{money(organization.used)} used</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#eef0f5",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(organization.used / max) * 100}%`,
                        background: C.blue,
                        borderRadius: 10,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginTop: 6,
                      color: C.muted,
                      fontSize: 10,
                    }}
                  >
                    <span>
                      Purchased {money(organization.purchased)}
                    </span>
                    <span>
                      Highest recorded balance {money(organization.balance)}
                    </span>
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
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Credit transactions
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: C.muted,
                  fontSize: 12,
                }}
              >
                Search and review credit ledger activity
              </p>
            </div>

            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "min(100%, 245px)" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 12,
                    color: C.muted,
                  }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transaction or user..."
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
              </button>
              <button
                type="button"
                style={buttonStyle}
                onClick={exportCsv}
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
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 12,
                padding: 18,
                background: "#fafbff",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <label style={{ fontSize: 11, color: C.muted }}>
                Transaction type
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option>All types</option>
                  <option>Purchase</option>
                  <option>Usage</option>
                  <option>Refund</option>
                  <option>Adjustment</option>
                </select>
              </label>

              <label style={{ fontSize: 11, color: C.muted }}>
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option>All statuses</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </label>

              <label style={{ fontSize: 11, color: C.muted }}>
                Organization
                <select
                  value={organizationFilter}
                  onChange={(event) =>
                    setOrganizationFilter(event.target.value)
                  }
                  style={{ ...inputStyle, marginTop: 7 }}
                >
                  <option>All organizations</option>
                  {[...new Set(records.map((record) => record.organization))].map(
                    (organization) => (
                      <option key={organization}>{organization}</option>
                    )
                  )}
                </select>
              </label>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => {
                    setTypeFilter("All types");
                    setStatusFilter("All statuses");
                    setOrganizationFilter("All organizations");
                    setSearch("");
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: C.blue,
                    color: "#fff",
                    borderColor: C.blue,
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
                minWidth: 1000,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Transaction",
                    "Organization / User",
                    "Type",
                    "Description",
                    "Credit change",
                    "Recorded balance",
                    "Date",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 14px",
                        borderBottom: `1px solid ${C.border}`,
                        color: C.muted,
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
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {record.id}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 650 }}>
                        {record.organization}
                      </div>
                      <div
                        style={{
                          marginTop: 5,
                          color: C.muted,
                          fontSize: 10,
                        }}
                      >
                        {record.user}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 7,
                          background:
                            record.type === "Purchase"
                              ? "#dbeafe"
                              : record.type === "Usage"
                                ? "#ffedd5"
                                : record.type === "Refund"
                                  ? "#ccfbf1"
                                  : "#f3e8ff",
                          color:
                            record.type === "Purchase"
                              ? "#1d4ed8"
                              : record.type === "Usage"
                                ? "#9a3412"
                                : record.type === "Refund"
                                  ? "#0f766e"
                                  : "#7e22ce",
                          fontSize: 10,
                          fontWeight: 750,
                        }}
                      >
                        {record.type}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        maxWidth: 220,
                      }}
                    >
                      {record.description}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 12,
                        fontWeight: 750,
                        color: record.amount < 0 ? "#c2410c" : "#15803d",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {record.amount > 0 ? "+" : ""}
                      {money(record.amount)}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {money(record.balance)}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {record.date}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={statusStyle(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(record)}
                        style={{ ...buttonStyle, padding: "7px 9px" }}
                      >
                        View
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No credit transactions match your filters.
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
              borderTop: `1px solid ${C.border}`,
              color: C.muted,
              fontSize: 11,
            }}
          >
            <span>{filtered.length} transactions displayed</span>
            <span>
              Net movement: {money(metrics.net)} · Usage: {money(metrics.usage)}
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
          <strong>Demo data:</strong> Credit transactions, balances, and dollar
          values are illustrative examples. This page does not perform actual
          purchases, refunds, or balance adjustments. Connect the production
          credit ledger and billing backend before using it for financial
          decisions.
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
            ["Token Analytics", "/usage/token-analytics"],
            ["Cost Analytics", "/usage/cost-analytics"],
            ["Revenue Analytics", "/usage/revenue-analytics"],
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
                border: `1px solid ${C.border}`,
                background: "#fff",
                color: C.text,
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
            aria-labelledby="credit-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 550,
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
                    color: C.blue,
                    marginBottom: 14,
                  }}
                >
                  <Coins size={21} />
                </span>
                <h2
                  id="credit-detail-title"
                  style={{ margin: 0, fontSize: 22, letterSpacing: "-0.5px" }}
                >
                  Transaction details
                </h2>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: C.muted,
                    fontSize: 12,
                  }}
                >
                  {selected.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close transaction details"
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
                ["Organization", selected.organization],
                ["User", selected.user],
                ["Transaction type", selected.type],
                ["Description", selected.description],
                ["Credit change", money(selected.amount)],
                ["Recorded balance", money(selected.balance)],
                ["Transaction date", selected.date],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: 13,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: C.muted,
                      fontSize: 10,
                      marginBottom: 7,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
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
                  background: C.blue,
                  color: "#fff",
                  borderColor: C.blue,
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
