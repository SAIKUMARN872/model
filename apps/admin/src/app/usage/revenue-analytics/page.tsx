
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type RevenueRecord = {
  id: string;
  customer: string;
  plan: string;
  type: "Subscription" | "Usage-based" | "Enterprise";
  status: "Paid" | "Pending" | "Overdue" | "Refunded";
  amount: number;
  date: string;
  method: string;
};

const initialRevenue: RevenueRecord[] = [
  { id: "INV-1048", customer: "Acme Technologies", plan: "Enterprise", type: "Enterprise", status: "Paid", amount: 2499, date: "2026-11-04", method: "Card" },
  { id: "INV-1047", customer: "Nexus AI Labs", plan: "ModelNow Pro", type: "Subscription", status: "Paid", amount: 199, date: "2026-11-04", method: "Card" },
  { id: "INV-1046", customer: "Vertex Systems", plan: "Usage billing", type: "Usage-based", status: "Pending", amount: 486.75, date: "2026-11-03", method: "Bank transfer" },
  { id: "INV-1045", customer: "BrightPath Digital", plan: "ModelNow Pro", type: "Subscription", status: "Paid", amount: 199, date: "2026-11-03", method: "UPI" },
  { id: "INV-1044", customer: "CloudScale Inc.", plan: "Enterprise", type: "Enterprise", status: "Overdue", amount: 3499, date: "2026-11-02", method: "Bank transfer" },
  { id: "INV-1043", customer: "Nova Analytics", plan: "Usage billing", type: "Usage-based", status: "Paid", amount: 728.4, date: "2026-11-02", method: "Card" },
  { id: "INV-1042", customer: "PixelForge", plan: "ModelNow Starter", type: "Subscription", status: "Paid", amount: 29, date: "2026-11-01", method: "UPI" },
  { id: "INV-1041", customer: "Orbit Consulting", plan: "ModelNow Pro", type: "Subscription", status: "Refunded", amount: 199, date: "2026-11-01", method: "Card" },
  { id: "INV-1040", customer: "DataSpring AI", plan: "Usage billing", type: "Usage-based", status: "Paid", amount: 342.8, date: "2026-10-31", method: "Card" },
  { id: "INV-1039", customer: "Apex Innovations", plan: "Enterprise", type: "Enterprise", status: "Paid", amount: 4999, date: "2026-10-30", method: "Bank transfer" },
];

const monthlyRevenue = [
  { month: "Jun", revenue: 18400, expenses: 9200 },
  { month: "Jul", revenue: 22100, expenses: 10800 },
  { month: "Aug", revenue: 19800, expenses: 10100 },
  { month: "Sep", revenue: 27400, expenses: 12400 },
  { month: "Oct", revenue: 31200, expenses: 14200 },
  { month: "Nov", revenue: 35600, expenses: 15100 },
];

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

export default function RevenueAnalyticsPage() {
  const [records, setRecords] = useState(initialRevenue);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("This month");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selected, setSelected] = useState<RevenueRecord | null>(null);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const filtered = useMemo(
    () =>
      records.filter((item) => {
        const matchesSearch = [
          item.id,
          item.customer,
          item.plan,
          item.method,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

        return (
          matchesSearch &&
          (typeFilter === "All types" || item.type === typeFilter) &&
          (statusFilter === "All statuses" || item.status === statusFilter)
        );
      }),
    [records, search, typeFilter, statusFilter]
  );

  const paidRevenue = filtered
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingRevenue = filtered
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const overdueRevenue = filtered
    .filter((item) => item.status === "Overdue")
    .reduce((sum, item) => sum + item.amount, 0);

  const refundedRevenue = filtered
    .filter((item) => item.status === "Refunded")
    .reduce((sum, item) => sum + item.amount, 0);

  const netRevenue = paidRevenue - refundedRevenue;
  const activeCustomers = new Set(
    filtered.filter((item) => item.status === "Paid").map((item) => item.customer)
  ).size;

  const revenueByType = useMemo(() => {
    const types = ["Subscription", "Usage-based", "Enterprise"] as const;

    return types.map((type) => ({
      type,
      total: records
        .filter((item) => item.type === type && item.status === "Paid")
        .reduce((sum, item) => sum + item.amount, 0),
    }));
  }, [records]);

  const exportCsv = () => {
    const headers = [
      "Invoice ID",
      "Customer",
      "Plan",
      "Revenue Type",
      "Status",
      "Amount USD",
      "Date",
      "Payment Method",
    ];

    const rows = filtered.map((item) => [
      item.id,
      item.customer,
      item.plan,
      item.type,
      item.status,
      item.amount.toFixed(2),
      item.date,
      item.method,
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
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-revenue-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const refresh = () => {
    setRecords((current) => [...current]);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const panel: CSSProperties = {
    background: "var(--panel, #fff)",
    border: "1px solid var(--border, #e5e7eb)",
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  };

  const input: CSSProperties = {
    height: 40,
    width: "100%",
    border: "1px solid var(--border, #d1d5db)",
    borderRadius: 9,
    padding: "0 12px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    fontSize: 13,
    outline: "none",
  };

  const button: CSSProperties = {
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

  const statusStyle = (status: RevenueRecord["status"]): CSSProperties => {
    const colors = {
      Paid: { color: "#047857", background: "#d1fae5" },
      Pending: { color: "#92400e", background: "#fef3c7" },
      Overdue: { color: "#b91c1c", background: "#fee2e2" },
      Refunded: { color: "#475569", background: "#e2e8f0" },
    };

    return {
      ...colors[status],
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 20,
      padding: "5px 9px",
      fontSize: 11,
      fontWeight: 650,
      whiteSpace: "nowrap",
    };
  };

  return (
    <main
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "28px clamp(16px, 3vw, 32px)",
        color: "var(--foreground, #111827)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            <Link href="/usage" style={{ color: "inherit", textDecoration: "none" }}>
              Usage &amp; Analytics
            </Link>{" "}
            / Revenue Analytics
          </div>
          <h1
            style={{
              fontSize: "clamp(25px, 3vw, 32px)",
              fontWeight: 750,
              letterSpacing: "-0.8px",
              margin: "0 0 8px",
            }}
          >
            Revenue Analytics
          </h1>
          <p style={{ ...muted, fontSize: 14, margin: 0 }}>
            Monitor subscription income, usage revenue, collections, and payment health.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={button} onClick={refresh}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button style={button} onClick={exportCsv}>
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <section
        style={{
          ...panel,
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
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          aria-label="Reporting period"
          style={{ ...input, width: 160 }}
        >
          <option>This month</option>
          <option>Last month</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
        <span style={{ ...muted, marginLeft: "auto" }}>
          Last refreshed: {lastUpdated}
        </span>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Net collected revenue",
            value: money(netRevenue),
            detail: "Paid invoices minus refunds",
            icon: Wallet,
            color: "#059669",
            trend: "+12.8%",
            positive: true,
          },
          {
            label: "Pending revenue",
            value: money(pendingRevenue),
            detail: "Awaiting payment",
            icon: CreditCard,
            color: "#d97706",
            trend: `${records.filter((item) => item.status === "Pending").length} invoices`,
            positive: null,
          },
          {
            label: "Overdue revenue",
            value: money(overdueRevenue),
            detail: "Requires collection follow-up",
            icon: ArrowDownRight,
            color: "#dc2626",
            trend: `${records.filter((item) => item.status === "Overdue").length} invoices`,
            positive: null,
          },
          {
            label: "Paying customers",
            value: String(activeCustomers),
            detail: "Customers with paid invoices",
            icon: Users,
            color: "#6366f1",
            trend: "Tracked customers",
            positive: true,
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} style={panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={muted}>{metric.label}</span>
                <Icon size={19} color={metric.color} />
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 750,
                  letterSpacing: "-0.8px",
                  overflowWrap: "anywhere",
                }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 10,
                  color: metric.color,
                  fontSize: 12,
                }}
              >
                {metric.positive === true && <ArrowUpRight size={14} />}
                {metric.trend}
              </div>
              <div style={{ ...muted, marginTop: 5 }}>{metric.detail}</div>
            </div>
          );
        })}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <div style={panel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                Revenue vs expenses
              </h2>
              <p style={{ ...muted, margin: 0 }}>Illustrative monthly figures · USD</p>
            </div>
            <TrendingUp size={19} color="#6366f1" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              height: 205,
              padding: "10px 0 0",
              borderBottom: "1px solid var(--border, #e5e7eb)",
            }}
          >
            {monthlyRevenue.map((item) => (
              <div
                key={item.month}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%",
                  gap: 7,
                  minWidth: 0,
                }}
              >
                <div
                  title={`${item.month} revenue: ${money(item.revenue)}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 3,
                    height: "100%",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      height: `${(item.revenue / 40000) * 100}%`,
                      width: "38%",
                      maxWidth: 24,
                      background: "#6366f1",
                      borderRadius: "4px 4px 0 0",
                      minHeight: 3,
                    }}
                  />
                  <div
                    title={`Expenses: ${money(item.expenses)}`}
                    style={{
                      height: `${(item.expenses / 40000) * 100}%`,
                      width: "38%",
                      maxWidth: 24,
                      background: "#cbd5e1",
                      borderRadius: "4px 4px 0 0",
                      minHeight: 3,
                    }}
                  />
                </div>
                <span style={{ ...muted, paddingBottom: 9 }}>{item.month}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 15 }}>
            <span style={{ ...muted, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: "#6366f1" }} />
              Revenue
            </span>
            <span style={{ ...muted, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: "#cbd5e1" }} />
              Expenses
            </span>
          </div>
        </div>

        <div style={panel}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
            Revenue by stream
          </h2>
          <p style={{ ...muted, margin: "0 0 24px" }}>
            Collected revenue grouped by billing type
          </p>

          {revenueByType.map((item, index) => {
            const total = revenueByType.reduce((sum, entry) => sum + entry.total, 0);
            const percentage = total ? (item.total / total) * 100 : 0;
            const colors = ["#6366f1", "#0ea5e9", "#10b981"];

            return (
              <div key={item.type} style={{ marginBottom: 23 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 9,
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.type}</span>
                  <span style={{ fontWeight: 700 }}>{money(item.total)}</span>
                </div>
                <div
                  style={{
                    height: 9,
                    borderRadius: 20,
                    background: "var(--muted, #f3f4f6)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      borderRadius: 20,
                      background: colors[index],
                    }}
                  />
                </div>
                <div style={{ ...muted, marginTop: 6 }}>
                  {percentage.toFixed(1)}% of collected sample revenue
                </div>
              </div>
            );
          })}

          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "var(--muted, #f8fafc)",
              marginTop: 8,
            }}
          >
            <div style={muted}>Collected revenue in filtered table</div>
            <div style={{ fontSize: 23, fontWeight: 750, marginTop: 5 }}>
              {money(paidRevenue)}
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...panel, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--border, #e5e7eb)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
                Revenue transactions
              </h2>
              <p style={{ ...muted, margin: 0 }}>
                Review invoice status, billing type, and payment method.
              </p>
            </div>
            <span style={muted}>{filtered.length} records</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
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
                placeholder="Search invoice or customer..."
                aria-label="Search revenue transactions"
                style={{ ...input, paddingLeft: 34 }}
              />
            </div>

            <select
              aria-label="Filter by revenue type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              style={input}
            >
              <option>All types</option>
              <option>Subscription</option>
              <option>Usage-based</option>
              <option>Enterprise</option>
            </select>

            <select
              aria-label="Filter by payment status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={input}
            >
              <option>All statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--muted, #f9fafb)" }}>
                {["Invoice", "Customer", "Billing plan", "Type", "Date", "Payment", "Amount", "Status"].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "13px 16px",
                      color: "var(--muted-foreground, #6b7280)",
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
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  style={{ cursor: "pointer", borderBottom: "1px solid var(--border, #f0f0f0)" }}
                >
                  <td style={{ padding: "15px 16px", fontWeight: 700 }}>{item.id}</td>
                  <td style={{ padding: "15px 16px", fontWeight: 600 }}>{item.customer}</td>
                  <td style={{ padding: "15px 16px" }}>{item.plan}</td>
                  <td style={{ padding: "15px 16px", whiteSpace: "nowrap" }}>{item.type}</td>
                  <td style={{ padding: "15px 16px", whiteSpace: "nowrap" }}>{item.date}</td>
                  <td style={{ padding: "15px 16px", whiteSpace: "nowrap" }}>{item.method}</td>
                  <td style={{ padding: "15px 16px", fontWeight: 700 }}>{money(item.amount)}</td>
                  <td style={{ padding: "15px 16px" }}>
                    <span style={statusStyle(item.status)}>{item.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
                    No revenue transactions match your filters.
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
          <span>Showing {filtered.length} of {records.length} transactions</span>
          <span>All amounts are displayed in USD</span>
        </div>
      </section>

      <section
        style={{
          ...panel,
          marginTop: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <BarChart3 size={19} color="#6366f1" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 650, fontSize: 13, marginBottom: 5 }}>
            Sample revenue data
          </div>
          <p style={{ ...muted, margin: 0, lineHeight: 1.7 }}>
            This page uses illustrative frontend records. Connect your payment
            gateway, subscription billing, invoices, and refunds APIs before
            relying on these numbers for financial reporting. The reporting
            period currently changes the selected UI value only; it does not
            fetch or filter historical records.
          </p>
        </div>
      </section>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Invoice details"
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(100%, 450px)",
              height: "100%",
              overflowY: "auto",
              padding: 28,
              background: "var(--background, #fff)",
              color: "var(--foreground, #111827)",
              boxShadow: "-10px 0 35px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <div style={{ ...muted, marginBottom: 8 }}>Transaction details</div>
                <h2 style={{ fontSize: 24, fontWeight: 750, margin: 0 }}>{selected.id}</h2>
              </div>
              <button style={button} onClick={() => setSelected(null)}>Close</button>
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
              <div style={muted}>Invoice amount</div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 7 }}>
                {money(selected.amount)}
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={statusStyle(selected.status)}>{selected.status}</span>
              </div>
            </div>

            <div style={{ marginTop: 25 }}>
              {[
                ["Customer", selected.customer],
                ["Plan", selected.plan],
                ["Revenue type", selected.type],
                ["Invoice date", selected.date],
                ["Payment method", selected.method],
                ["Invoice ID", selected.id],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 18,
                    padding: "15px 0",
                    borderBottom: "1px solid var(--border, #e5e7eb)",
                    fontSize: 13,
                  }}
                >
                  <span style={muted}>{label}</span>
                  <span style={{ fontWeight: 650, textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            <p style={{ ...muted, lineHeight: 1.7, marginTop: 22 }}>
              This transaction is a sample record. Payment status and invoice
              details must be retrieved from your billing provider in production.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

