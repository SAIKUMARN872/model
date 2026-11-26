
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Coins,
  Download,
  Eye,
  Search,
  Users,
  X,
  RefreshCw,
  ArrowUpRight,
  Zap,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

type Organization = {
  id: string;
  name: string;
  plan: string;
  members: number;
  requests: number;
  tokens: number;
  cost: number;
  status: "Active" | "Suspended" | "Trial";
  topModel: string;
  apiCalls: number;
  lastActive: string;
};

const initialOrganizations: Organization[] = [
  {
    id: "org_001",
    name: "Acme Technologies",
    plan: "Enterprise",
    members: 128,
    requests: 184250,
    tokens: 42800000,
    cost: 1248.65,
    status: "Active",
    topModel: "GPT-5",
    apiCalls: 42180,
    lastActive: "2 minutes ago",
  },
  {
    id: "org_002",
    name: "Nova Analytics",
    plan: "Business",
    members: 64,
    requests: 126840,
    tokens: 31200000,
    cost: 864.2,
    status: "Active",
    topModel: "Claude",
    apiCalls: 28460,
    lastActive: "8 minutes ago",
  },
  {
    id: "org_003",
    name: "Vertex Systems",
    plan: "Enterprise",
    members: 96,
    requests: 98520,
    tokens: 24700000,
    cost: 712.8,
    status: "Active",
    topModel: "Gemini",
    apiCalls: 21350,
    lastActive: "15 minutes ago",
  },
  {
    id: "org_004",
    name: "BrightPath Labs",
    plan: "Starter",
    members: 18,
    requests: 42180,
    tokens: 8600000,
    cost: 184.5,
    status: "Trial",
    topModel: "Llama",
    apiCalls: 8420,
    lastActive: "32 minutes ago",
  },
  {
    id: "org_005",
    name: "Orbit Digital",
    plan: "Business",
    members: 42,
    requests: 76840,
    tokens: 16400000,
    cost: 426.7,
    status: "Active",
    topModel: "GPT-5",
    apiCalls: 16840,
    lastActive: "1 hour ago",
  },
  {
    id: "org_006",
    name: "Pioneer AI",
    plan: "Starter",
    members: 12,
    requests: 18420,
    tokens: 3900000,
    cost: 96.35,
    status: "Suspended",
    topModel: "Claude",
    apiCalls: 3240,
    lastActive: "2 days ago",
  },
  {
    id: "org_007",
    name: "Summit Cloud",
    plan: "Enterprise",
    members: 210,
    requests: 246800,
    tokens: 58200000,
    cost: 1842.9,
    status: "Active",
    topModel: "GPT-5",
    apiCalls: 62840,
    lastActive: "Just now",
  },
  {
    id: "org_008",
    name: "BluePeak Software",
    plan: "Business",
    members: 35,
    requests: 53260,
    tokens: 12100000,
    cost: 312.45,
    status: "Trial",
    topModel: "Gemini",
    apiCalls: 11620,
    lastActive: "45 minutes ago",
  },
];

const colors = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  blue: "#315fea",
  green: "#15803d",
  orange: "#c2410c",
  red: "#b91c1c",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export default function OrganizationUsagePage() {
  const [organizations] = useState(initialOrganizations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [period, setPeriod] = useState("Last 30 days");
  const [selected, setSelected] = useState<Organization | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((org) => {
      const matchesSearch =
        !query ||
        org.name.toLowerCase().includes(query) ||
        org.id.toLowerCase().includes(query) ||
        org.plan.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || org.status === statusFilter;

      const matchesPlan =
        planFilter === "All plans" || org.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [organizations, search, statusFilter, planFilter]);

  const totals = useMemo(
    () => ({
      organizations: filtered.length,
      members: filtered.reduce((sum, org) => sum + org.members, 0),
      requests: filtered.reduce((sum, org) => sum + org.requests, 0),
      tokens: filtered.reduce((sum, org) => sum + org.tokens, 0),
      cost: filtered.reduce((sum, org) => sum + org.cost, 0),
    }),
    [filtered]
  );

  const exportCsv = () => {
    const headers = [
      "Organization ID",
      "Organization",
      "Plan",
      "Members",
      "Requests",
      "Tokens",
      "Estimated Cost USD",
      "Status",
      "Top Model",
      "API Calls",
      "Last Active",
    ];

    const rows = filtered.map((org) => [
      org.id,
      org.name,
      org.plan,
      org.members,
      org.requests,
      org.tokens,
      org.cost,
      org.status,
      org.topModel,
      org.apiCalls,
      org.lastActive,
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
    anchor.download = "modelnow-organization-usage.csv";
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
    fontSize: 13,
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
    fontSize: 13,
    outline: "none",
  };

  const statusStyle = (status: Organization["status"]) => {
    const map = {
      Active: { bg: "#dcfce7", color: "#166534" },
      Trial: { bg: "#ffedd5", color: "#9a3412" },
      Suspended: { bg: "#fee2e2", color: "#991b1b" },
    };

    return {
      display: "inline-block",
      padding: "4px 9px",
      borderRadius: 20,
      background: map[status].bg,
      color: map[status].color,
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap" as const,
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.muted,
                fontSize: 12,
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
              <span style={{ color: colors.text }}>Organization Usage</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                letterSpacing: "-1px",
                fontWeight: 750,
              }}
            >
              Organization Usage
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Monitor AI consumption, API activity, and estimated costs across
              organizations.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 140 }}
              aria-label="Reporting period"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
            <button
              style={buttonStyle}
              onClick={() => setRefreshed(true)}
              type="button"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              style={{
                ...buttonStyle,
                background: colors.blue,
                color: "#fff",
                borderColor: colors.blue,
              }}
              onClick={exportCsv}
              type="button"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {refreshed && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 13px",
              borderRadius: 9,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
            }}
          >
            The displayed sample data is up to date for this demo. Connect the
            usage API to refresh live organization metrics.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 15,
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Organizations",
              value: formatNumber(totals.organizations),
              detail: "Matching current filters",
              icon: Building2,
              color: "#315fea",
              background: "#eef2ff",
            },
            {
              label: "Active Members",
              value: formatNumber(totals.members),
              detail: "Across filtered organizations",
              icon: Users,
              color: "#15803d",
              background: "#dcfce7",
            },
            {
              label: "Total Requests",
              value: formatNumber(totals.requests),
              detail: `For ${period.toLowerCase()}`,
              icon: Activity,
              color: "#7c3aed",
              background: "#f3e8ff",
            },
            {
              label: "Tokens Processed",
              value: formatNumber(totals.tokens),
              detail: "Input and output tokens",
              icon: Zap,
              color: "#c2410c",
              background: "#ffedd5",
            },
            {
              label: "Estimated AI Cost",
              value: formatCurrency(totals.cost),
              detail: "Illustrative USD estimate",
              icon: Coins,
              color: "#0369a1",
              background: "#e0f2fe",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 12, color: colors.muted }}>
                    {metric.label}
                  </span>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: metric.background,
                      color: metric.color,
                    }}
                  >
                    <Icon size={18} />
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "clamp(22px, 2vw, 28px)",
                    fontWeight: 750,
                    letterSpacing: "-0.7px",
                    marginTop: 17,
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
                  {metric.detail}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 0,
            overflow: "hidden",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
              Organization consumption
            </h2>
            <p
              style={{
                color: colors.muted,
                fontSize: 12,
                margin: "6px 0 0",
              }}
            >
              Compare request volume and estimated spending by organization.
            </p>
          </div>

          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 28,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 16,
                  }}
                >
                  <strong>Top organizations by requests</strong>
                  <span style={{ color: colors.muted }}>Requests</span>
                </div>
                {filtered
                  .slice()
                  .sort((a, b) => b.requests - a.requests)
                  .slice(0, 5)
                  .map((org) => {
                    const max = Math.max(
                      ...filtered.map((item) => item.requests),
                      1
                    );

                    return (
                      <div key={org.id} style={{ marginBottom: 15 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            fontSize: 12,
                            marginBottom: 7,
                          }}
                        >
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {org.name}
                          </span>
                          <strong>{formatNumber(org.requests)}</strong>
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
                              width: `${(org.requests / max) * 100}%`,
                              background: colors.blue,
                              borderRadius: 10,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {filtered.length === 0 && (
                  <p style={{ color: colors.muted, fontSize: 13 }}>
                    No organizations match these filters.
                  </p>
                )}
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 16,
                  }}
                >
                  <strong>Estimated cost by organization</strong>
                  <span style={{ color: colors.muted }}>USD</span>
                </div>
                {filtered
                  .slice()
                  .sort((a, b) => b.cost - a.cost)
                  .slice(0, 5)
                  .map((org) => {
                    const max = Math.max(
                      ...filtered.map((item) => item.cost),
                      1
                    );

                    return (
                      <div key={org.id} style={{ marginBottom: 15 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            fontSize: 12,
                            marginBottom: 7,
                          }}
                        >
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {org.name}
                          </span>
                          <strong>{formatCurrency(org.cost)}</strong>
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
                              width: `${(org.cost / max) * 100}%`,
                              background: "#16a34a",
                              borderRadius: 10,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
                Organization usage records
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  margin: "6px 0 0",
                }}
              >
                {filtered.length} organizations found
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
                flex: "1 1 420px",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ position: "relative", width: "min(100%, 250px)" }}>
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
                  placeholder="Search organizations..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={{ ...inputStyle, width: "auto", minWidth: 140 }}
                  aria-label="Filter by status"
                >
                  <option>All statuses</option>
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Suspended</option>
                </select>
                <ChevronDown
                  size={13}
                  style={{
                    display: "none",
                    position: "absolute",
                    right: 8,
                    top: 13,
                    pointerEvents: "none",
                  }}
                />
              </div>
              <select
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: 130 }}
                aria-label="Filter by plan"
              >
                <option>All plans</option>
                <option>Enterprise</option>
                <option>Business</option>
                <option>Starter</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1100,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Organization",
                    "Plan",
                    "Members",
                    "Requests",
                    "Tokens",
                    "Estimated cost",
                    "Status",
                    "Top model",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: colors.muted,
                        borderBottom: `1px solid ${colors.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => (
                  <tr key={org.id}>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 10,
                            background: "#eef2ff",
                            color: colors.blue,
                          }}
                        >
                          <Building2 size={17} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 650,
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {org.name}
                          </div>
                          <div
                            style={{
                              color: colors.muted,
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {org.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 12,
                      }}
                    >
                      {org.plan}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 12,
                      }}
                    >
                      {formatNumber(org.members)}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      {formatNumber(org.requests)}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 12,
                      }}
                    >
                      {formatNumber(org.tokens)}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      {formatCurrency(org.cost)}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <span style={statusStyle(org.status)}>{org.status}</span>
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: 12,
                      }}
                    >
                      {org.topModel}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(org)}
                        style={{
                          ...buttonStyle,
                          padding: "7px 10px",
                          fontSize: 11,
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 45,
                        textAlign: "center",
                        color: colors.muted,
                        fontSize: 13,
                      }}
                    >
                      No organizations match your search or filters.
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
              color: colors.muted,
              fontSize: 11,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>Showing {filtered.length} organizations</span>
            <span>Export includes all filtered records</span>
          </div>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: 14,
            marginTop: 18,
            border: "1px solid #fde68a",
            borderRadius: 10,
            background: "#fffbeb",
            color: "#92400e",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          <CalendarDays size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>Demo data:</strong> Organization metrics, usage periods,
            token counts, and costs shown on this page are illustrative sample
            values. The period selector changes the displayed period label;
            connect your backend usage API and billing records for real
            historical reporting.
          </span>
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
            ["Overview", "/usage/overview"],
            ["Platform Usage", "/usage/platform-usage"],
            ["User Usage", "/usage/user-usage"],
            ["API Usage", "/usage/api-usage"],
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
            background: "rgba(17, 24, 39, 0.48)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-dialog-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 540,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 16,
              background: "#fff",
              padding: 24,
              boxShadow: "0 24px 70px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#eef2ff",
                    color: colors.blue,
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <Building2 size={22} />
                </div>
                <h2
                  id="organization-dialog-title"
                  style={{
                    margin: 0,
                    fontSize: 21,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: colors.muted,
                    fontSize: 12,
                  }}
                >
                  {selected.id} · {selected.plan} plan
                </p>
              </div>
              <button
                type="button"
                aria-label="Close organization details"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
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
                  ["Members", formatNumber(selected.members)],
                  ["Total requests", formatNumber(selected.requests)],
                  ["Tokens processed", formatNumber(selected.tokens)],
                  ["Estimated AI cost", formatCurrency(selected.cost)],
                  ["API calls", formatNumber(selected.apiCalls)],
                  ["Most-used model", selected.topModel],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 14,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 11,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: colors.muted,
                        fontSize: 11,
                        marginBottom: 8,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 17,
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
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 10,
                  background: "#f9fafb",
                  fontSize: 12,
                }}
              >
                <span style={{ color: colors.muted }}>Last activity: </span>
                <strong>{selected.lastActive}</strong>
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
                  background: colors.blue,
                  borderColor: colors.blue,
                  color: "#fff",
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
